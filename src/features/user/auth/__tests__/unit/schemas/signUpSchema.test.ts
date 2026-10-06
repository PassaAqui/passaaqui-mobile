import { signUpSchema, SignUpData } from "@/src/features/user/auth/schemas/signUpSchema";

const validInput: SignUpData = {
  name: "João Silva",
  email: "joao@email.com",
  cpf: "123.456.789-00",
  password: "Senha@123",
  confirmPassword: "Senha@123",
  terms: true,
};

describe("signUpSchema", () => {
  it("aceita entrada válida", () => {
    const result = signUpSchema.safeParse(validInput);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toEqual(validInput);
    }
  });

  it("rejeita name vazio", () => {
    const input = { ...validInput, name: "" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com seu nome");
      expect(result.error.issues[0].path).toEqual(["name"]);
    }
  });

  it("rejeita email vazio", () => {
    const input = { ...validInput, email: "" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com seu email");
      expect(result.error.issues[0].path).toEqual(["email"]);
    }
  });

  it("rejeita email com formato inválido", () => {
    const input = { ...validInput, email: "email-invalido" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Email inválido");
      expect(result.error.issues[0].path).toEqual(["email"]);
    }
  });

  it("rejeita cpf vazio", () => {
    const input = { ...validInput, cpf: "" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com seu CPF");
      expect(result.error.issues[0].path).toEqual(["cpf"]);
    }
  });

  it("rejeita cpf com formato inválido", () => {
    const input = { ...validInput, cpf: "12345678900" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("CPF inválido");
      expect(result.error.issues[0].path).toEqual(["cpf"]);
    }
  });

  it("rejeita password vazio", () => {
    const input = { ...validInput, password: "", confirmPassword: "" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo com sua senha");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password com menos de 8 caracteres", () => {
    const input = { ...validInput, password: "Sen@1", confirmPassword: "Sen@1" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve ter pelo menos 8 caracteres");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password sem número", () => {
    const input = { ...validInput, password: "Senha@@@", confirmPassword: "Senha@@@" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve conter pelo menos um número");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita password sem caractere especial", () => {
    const input = { ...validInput, password: "Senha123", confirmPassword: "Senha123" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("A senha deve conter pelo menos um caractere especial");
      expect(result.error.issues[0].path).toEqual(["password"]);
    }
  });

  it("rejeita confirmPassword vazio", () => {
    const input = { ...validInput, confirmPassword: "" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Preencha o campo repetindo sua senha");
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejeita quando terms não é aceito", () => {
    const input = { ...validInput, terms: false };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("Você precisa aceitar os Termos de Uso e a Política de Privacidade.");
      expect(result.error.issues[0].path).toEqual(["terms"]);
    }
  });

  it("rejeita quando password e confirmPassword são diferentes", () => {
    const input = { ...validInput, password: "Senha@123", confirmPassword: "Outra@123" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues[0].message).toBe("As senhas precisam ser iguais");
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejeita múltiplos campos inválidos de uma vez", () => {
    const input = { ...validInput, name: "", email: "invalido", cpf: "123" };
    const result = signUpSchema.safeParse(input);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error).toBeDefined();
      expect(result.error.issues.length).toBeGreaterThanOrEqual(3);
      const messages = result.error.issues.map((e) => e.message);
      expect(messages).toContain("Preencha o campo com seu nome");
      expect(messages).toContain("Email inválido");
      expect(messages).toContain("CPF inválido");
    }
  });
});