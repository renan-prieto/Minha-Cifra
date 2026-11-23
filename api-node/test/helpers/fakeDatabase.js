/**
 * Banco MySQL em memória usado pelos testes de integração da API.
 *
 * A API usa apenas um subconjunto pequeno do Knex (`where`, `select`, `join`,
 * `first`, `insert`, `update` e `delete`). Em vez de exigir um MySQL real,
 * este helper implementa esse subconjunto para exercitar as rotas HTTP de
 * ponta a ponta, incluindo o estado persistido entre requisições.
 */

const UNIT_MS = {
  SECOND: 1000,
  MINUTE: 60 * 1000,
  HOUR: 60 * 60 * 1000,
  DAY: 24 * 60 * 60 * 1000,
};

function resolveRawValue(value) {
  if (!value || typeof value !== "object" || typeof value.__raw !== "string") {
    return value;
  }

  const interval = value.__raw.match(
    /INTERVAL\s+(\d+)\s+(SECOND|MINUTE|HOUR|DAY)/i,
  );

  if (!interval) {
    return new Date();
  }

  const amount = Number(interval[1]);
  const unit = interval[2].toUpperCase();

  return new Date(Date.now() + amount * UNIT_MS[unit]);
}

function parseTable(expression) {
  const [name, alias] = expression.split(/\s+as\s+/i).map((part) => part.trim());

  return {
    name,
    alias: alias || name,
  };
}

function makeRow(baseAlias, row) {
  return {
    __baseAlias: baseAlias,
    __base: { ...row },
    __record: row,
    __joins: {},
  };
}

function mergeRows(left, right) {
  const merged = {
    __baseAlias: left.__baseAlias,
    __base: { ...left.__base },
    __record: left.__record,
    __joins: { ...left.__joins },
  };

  merged.__joins[right.__baseAlias] = { ...right.__base };

  return merged;
}

function getColumn(row, column) {
  if (column.includes(".")) {
    const [alias, name] = column.split(".");

    if (alias === row.__baseAlias) {
      return row.__base[name];
    }

    return row.__joins[alias]?.[name];
  }

  if (Object.prototype.hasOwnProperty.call(row.__base, column)) {
    return row.__base[column];
  }

  for (const table of Object.values(row.__joins)) {
    if (Object.prototype.hasOwnProperty.call(table, column)) {
      return table[column];
    }
  }

  return undefined;
}

function toComparable(value) {
  if (value instanceof Date) {
    return value.getTime();
  }

  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string" && value !== "") {
    const asNumber = Number(value);
    if (!Number.isNaN(asNumber)) return asNumber;

    const asDate = new Date(value);
    if (!Number.isNaN(asDate.getTime())) return asDate.getTime();
  }

  return value;
}

function valuesAreEqual(left, right) {
  if (left === null || left === undefined || right === null || right === undefined) {
    return left === right;
  }

  return String(left) === String(right);
}

function matchesWhere(row, condition) {
  const value = getColumn(row, condition.column);

  if (condition.operator === "=") {
    return valuesAreEqual(value, condition.value);
  }

  const left = toComparable(value);
  const right = toComparable(condition.value);

  if (condition.operator === ">") return left > right;
  if (condition.operator === ">=") return left >= right;
  if (condition.operator === "<") return left < right;
  if (condition.operator === "<=") return left <= right;
  if (condition.operator === "!=") return left !== right;

  throw new Error(`Operador não suportado no banco falso: ${condition.operator}`);
}

function project(row, selectedColumns) {
  if (!selectedColumns) {
    return { ...row.__base };
  }

  const result = {};

  for (const column of selectedColumns) {
    const match = column.match(/^(?:(\w+)\.)?(\w+)(?:\s+as\s+(\w+))?$/i);

    if (!match) {
      throw new Error(`Coluna não suportada no banco falso: ${column}`);
    }

    const [, alias, name, outputName] = match;
    const value = alias
      ? getColumn(row, `${alias}.${name}`)
      : getColumn(row, name);

    result[outputName || name] = value;
  }

  return result;
}

class FakeQuery {
  constructor(database, tableExpression) {
    this.database = database;
    this.table = parseTable(tableExpression);
    this.conditions = [];
    this.joins = [];
    this.selectedColumns = null;
    this.operation = "select";
    this.payload = null;
    this.firstOnly = false;
  }

  where(columnOrObject, operatorOrValue, maybeValue) {
    if (typeof columnOrObject === "object" && columnOrObject !== null) {
      Object.entries(columnOrObject).forEach(([column, value]) => {
        this.conditions.push({ column, operator: "=", value });
      });
      return this;
    }

    if (maybeValue === undefined) {
      this.conditions.push({
        column: columnOrObject,
        operator: "=",
        value: operatorOrValue,
      });
      return this;
    }

    this.conditions.push({
      column: columnOrObject,
      operator: operatorOrValue,
      value: maybeValue,
    });

    return this;
  }

  select(...columns) {
    this.selectedColumns = columns.flat();
    return this;
  }

  join(tableExpression, leftColumn, rightColumn) {
    this.joins.push({
      table: parseTable(tableExpression),
      leftColumn,
      rightColumn,
    });
    return this;
  }

  first() {
    this.firstOnly = true;
    return this.execute();
  }

  insert(payload) {
    this.operation = "insert";
    this.payload = payload;
    return this;
  }

  update(payload) {
    this.operation = "update";
    this.payload = payload;
    return this;
  }

  delete() {
    this.operation = "delete";
    return this;
  }

  then(resolve, reject) {
    return this.execute().then(resolve, reject);
  }

  catch(reject) {
    return this.execute().catch(reject);
  }

  async execute() {
    if (this.operation === "insert") {
      return this.executeInsert();
    }

    let rows = this.database.rowsOf(this.table.name).map((row) =>
      makeRow(this.table.alias, row),
    );

    for (const join of this.joins) {
      const joinedRows = this.database
        .rowsOf(join.table.name)
        .map((row) => makeRow(join.table.alias, row));
      const nextRows = [];

      for (const baseRow of rows) {
        for (const joinedRow of joinedRows) {
          const combined = mergeRows(baseRow, joinedRow);

          if (
            valuesAreEqual(
              getColumn(combined, join.leftColumn),
              getColumn(combined, join.rightColumn),
            )
          ) {
            nextRows.push(combined);
          }
        }
      }

      rows = nextRows;
    }

    rows = rows.filter((row) =>
      this.conditions.every((condition) => matchesWhere(row, condition)),
    );

    if (this.operation === "update") {
      let updated = 0;

      for (const row of rows) {
        const record = row.__record;

        if (!record) continue;

        for (const [column, rawValue] of Object.entries(this.payload)) {
          record[column] = resolveRawValue(rawValue);
        }

        updated += 1;
      }

      return updated;
    }

    if (this.operation === "delete") {
      const recordsToDelete = new Set(rows.map((row) => row.__record));
      const tableRows = this.database.rowsOf(this.table.name);
      const remaining = tableRows.filter((row) => !recordsToDelete.has(row));

      this.database.replaceRows(this.table.name, remaining);

      return tableRows.length - remaining.length;
    }

    const projected = rows.map((row) => project(row, this.selectedColumns));

    return this.firstOnly ? projected[0] : projected;
  }

  async executeInsert() {
    const tableRows = this.database.rowsOf(this.table.name);
    const record = {};

    for (const [column, rawValue] of Object.entries(this.payload)) {
      record[column] = resolveRawValue(rawValue);
    }

    if (this.table.name === "Users") {
      const duplicated = tableRows.some(
        (row) => String(row.email) === String(record.email),
      );

      if (duplicated) {
        const error = new Error("Duplicate entry");
        error.code = "ER_DUP_ENTRY";
        throw error;
      }

      if (record.pk_users_id === undefined) {
        record.pk_users_id = this.database.nextUserId();
      }
    }

    if (this.table.name === "Sessions" && record.id === undefined) {
      record.id = this.database.nextSessionId();
    }

    tableRows.push(record);

    return [record.pk_users_id || record.id || 1];
  }
}

function createFakeDatabase() {
  const tables = {
    Users: [],
    Sessions: [],
  };
  let userId = 1;
  let sessionId = 1;

  const database = {
    rowsOf(table) {
      if (!tables[table]) tables[table] = [];
      return tables[table];
    },
    replaceRows(table, rows) {
      tables[table] = rows;
    },
    nextUserId() {
      return userId++;
    },
    nextSessionId() {
      return sessionId++;
    },
    reset() {
      tables.Users = [];
      tables.Sessions = [];
      userId = 1;
      sessionId = 1;
    },
    tables,
  };

  const knexFactory = () => {
    const query = (tableExpression) => new FakeQuery(database, tableExpression);
    query.fn = { now: () => new Date() };
    query.raw = (sql) => ({ __raw: String(sql) });
    query.destroy = async () => undefined;
    return query;
  };
  knexFactory.fn = { now: () => new Date() };
  knexFactory.raw = (sql) => ({ __raw: String(sql) });

  return { database, knexFactory };
}

module.exports = { createFakeDatabase };
