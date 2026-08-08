export const REFRESH_TOKEN_KEY = "refresh_token";
export const BASE_URL = "https://api.test.com";

export const validLoginInput = {
  email: "turista@email.com",
  password: "Senha@123",
};

export const validSignUpInput = {
  email: "turista@email.com",
  name: "Turista Teste",
  password: "Senha@123",
  confirm_password: "Senha@123",
  cpf: "123.456.789-00",
};

export const tokenResponse = {
  access_token: "access-token-jwt",
  refresh_token: "refresh-token-jwt",
};

export function createAxiosError(status: number) {
  const error = new Error("Request failed") as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };

  error.isAxiosError = true;
  error.response = { status, data: {} };

  return error;
}