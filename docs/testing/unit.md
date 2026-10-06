# Testes Unitários (Jest)

## Visão Geral

Testes unitários validam **lógica isolada**: stores (Zustand), services (API, socket), utils, schemas (Zod) e hooks de lógica pura. Não renderizam UI.

## Estrutura

```
src/features/user/auth/
├── services/authService.ts
└── __tests__/
    ├── unit/
    │   ├── services/authService.test.ts
    │   └── utils/formatCpf.test.ts
    └── fixtures/auth.ts
```

## Executando

```bash
# Todos
npm run test:unit

# Modo watch
npm run test:unit:watch

# Com cobertura
npm run test:unit:coverage
```

## Padrões de Teste

### Stores (Zustand)

```typescript
// authStore.test.ts
import { useAuthStore } from "@/src/stores/user/auth/authStore";

describe("authStore", () => {
  beforeEach(() => {
    useAuthStore.setState({ accessToken: null, user: null });
  });

  it("define accessToken e user no login", () => {
    const token = "abc123";
    const user = { id: "1", name: "Test" };
    
    act(() => {
      useAuthStore.getState().setAuth(token, user);
    });
    
    expect(useAuthStore.getState().accessToken).toBe(token);
    expect(useAuthStore.getState().user).toEqual(user);
  });
});
```

### Services (API)

```typescript
// authService.test.ts
import { login } from "@/src/features/user/auth/services/authService";
import { api } from "@/src/services/api/api";

jest.mock("@/src/services/api/api");

describe("authService.login", () => {
  it("chama API e persiste tokens", async () => {
    const mockResponse = { data: { access_token: "at", refresh_token: "rt" } };
    (api.post as jest.Mock).mockResolvedValue(mockResponse);
    
    await login({ email: "test@test.com", password: "123" });
    
    expect(api.post).toHaveBeenCalledWith("/auth/login", {
      email: "test@test.com",
      password: "123",
    });
    expect(useAuthStore.getState().accessToken).toBe("at");
  });
});
```

### Utils (Funções Puras)

```typescript
// formatCpf.test.ts
import { formatCpf } from "@/src/features/user/auth/utils/formatCpf";

describe("formatCpf", () => {
  it("formata CPF com pontos e traço", () => {
    expect(formatCpf("12345678900")).toBe("123.456.789-00");
  });
  
  it("retorna vazio para entrada inválida", () => {
    expect(formatCpf("abc")).toBe("");
  });
});
```

### Schemas (Zod)

```typescript
// signUpSchema.test.ts
import { signUpSchema } from "@/src/features/user/auth/schemas/signUpSchema";

describe("signUpSchema", () => {
  it("valida input correto", () => {
    const result = signUpSchema.safeParse({
      name: "João",
      email: "joao@email.com",
      password: "Senha@123",
      confirm_password: "Senha@123",
      documentId: "123.456.789-00",
    });
    expect(result.success).toBe(true);
  });
  
  it("rejeita senhas diferentes", () => {
    const result = signUpSchema.safeParse({
      // ... campos válidos
      password: "Senha@123",
      confirm_password: "Outra@123",
    });
    expect(result.success).toBe(false);
    expect(result.error.issues[0].path).toContain("confirm_password");
  });
});
```

### Hooks de Lógica (sem UI)

```typescript
// useNavigation.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useNavigation } from "@/src/features/user/map/hooks/useNavigation";

jest.mock("@/src/services/socket/stompClient");

describe("useNavigation", () => {
  it("inicia navegação e atualiza estado", () => {
    const { result } = renderHook(() => useNavigation());
    
    act(() => {
      result.current.startNavigation(mockRoute);
    });
    
    expect(result.current.isNavigating).toBe(true);
    expect(result.current.currentRoute).toEqual(mockRoute);
  });
});
```

## Mocks Comuns

| Dependência | Mock Location | Padrão |
|-------------|---------------|--------|
| `expo-secure-store` | `jest.setup.ts` (global) | `getItemAsync`, `setItemAsync`, `deleteItemAsync` |
| `axios` | Por arquivo | `jest.mock("axios")` |
| `@/src/services/api/api` | Por arquivo | `jest.mock("@/src/services/api/api")` |
| Stores Zustand | Por arquivo | `jest.mock("@/src/stores/...")` + `act()` |
| `@stomp/stompjs` | Por arquivo | `jest.mock("@stomp/stompjs")` |

## Fixtures

Reutilize dados de teste via `__tests__/fixtures/`:

```typescript
// fixtures/auth.ts
export const validLoginInput = {
  email: "turista@email.com",
  password: "Senha@123",
};

export const tokenResponse = {
  access_token: "mock-access-token",
  refresh_token: "mock-refresh-token",
};

export const createAxiosError = (status: number) => {
  const error = new Error("Request failed") as any;
  error.isAxiosError = true;
  error.response = { status };
  return error;
};
```

## Boas Práticas

1. **Um teste por comportamento** — `it("deve fazer X quando Y")`
2. **AAA Pattern** — Arrange, Act, Assert
3. **Mock no `beforeEach`** — `jest.clearAllMocks()` + setup comum
4. **Restaurar mocks** — `jest.restoreAllMocks()` no `afterEach`
5. **Testar edge cases** — vazios, nulos, erros de rede, timeouts
6. **Nomes descritivos** — `authService.login` → `describe("login", () => { it("persiste tokens quando API retorna sucesso", ...) })`

## Coverage Alvo

- Stores: 100% (actions + selectors)
- Services: 90%+ (sucesso, erro, transformação)
- Utils: 100% (funções puras)
- Schemas: 100% (válido, inválido, edge cases)
- Hooks de lógica: 80%+