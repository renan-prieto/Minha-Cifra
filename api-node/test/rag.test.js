const test = require("node:test");
const assert = require("node:assert/strict");
const { buildGroundingContext, loadKnowledgeBase, retrieveRelevantDocuments } = require("../rag");

const knowledgeBase = loadKnowledgeBase();

test("retrieves relevant guidance for an emergency-fund question", () => {
  const results = retrieveRelevantDocuments("Como calcular minha reserva de emergencia?", knowledgeBase);

  assert.ok(results.length > 0);
  assert.equal(results[0].title, "Reserva de emergencia");
  assert.match(buildGroundingContext(results), /despesas essenciais/);
});

test("does not return documents when the query has no matching terms", () => {
  assert.deepEqual(retrieveRelevantDocuments("astronomia telescopio galaxia", knowledgeBase), []);
});

test("respects the maximum number of retrieved documents", () => {
  const results = retrieveRelevantDocuments("despesas renda meta mensal", knowledgeBase, 2);

  assert.ok(results.length <= 2);
});