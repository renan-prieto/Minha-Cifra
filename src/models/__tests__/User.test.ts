import User from "@/src/models/User";

describe("User", () => {
  it("guarda e expõe email e senha", () => {
    const user = new User("renan@example.com", "segredo123");

    expect(user.getEmail()).toBe("renan@example.com");
    expect(user.getPassword()).toBe("segredo123");
    expect(user.getId()).toBeNull();
  });

  it("aceita um id opcional", () => {
    const user = new User("renan@example.com", "segredo123", "42");

    expect(user.getId()).toBe("42");
  });

  it("expõe as propriedades públicas", () => {
    const user = new User("renan@example.com", "segredo123", "7");

    expect(user.email).toBe("renan@example.com");
    expect(user.id).toBe("7");
  });
});
