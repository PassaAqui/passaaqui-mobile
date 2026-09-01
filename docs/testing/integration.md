# Testes de Integração (Jest + React Native Testing Library)

## Visão Geral

Testes de integração validam **renderização e interação** de componentes/telas reais: navegação, chamadas de serviço, estados de loading/erro/sucesso, formulários. Usam **React Native Testing Library (RNTL)**.

## Estrutura

```
src/features/user/auth/
├── screens/UserLoginScreen.tsx
└── __tests__/
    ├── integration/
    │   └── screens/UserLoginScreen.test.tsx
    └── fixtures/auth.ts
```

## Executando

```bash
# Todos
npm run test:integration

# Modo watch
npm run test:integration:watch

# Com cobertura
npm run test:integration:coverage
```

## Setup Comum

```typescript
// Mocks necessários para a maioria dos testes
import { render, screen, fireEvent, waitFor } from "@testing-library/react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

jest.mock("expo-router", () => ({
  useRouter: jest.fn(),
  Link: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: jest.fn(),
}));

jest.mock("react-native-keyboard-controller", () => ({
  KeyboardAwareScrollView: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

const mockedReplace = jest.fn();
const mockedUseRouter = useRouter as jest.MockedFunction<typeof useRouter>;
mockedUseRouter.mockReturnValue({ replace: mockedReplace } as any);

const mockedUseSafeAreaInsets = useSafeAreaInsets as jest.MockedFunction<typeof useSafeAreaInsets>;
mockedUseSafeAreaInsets.mockReturnValue({ top: 0, bottom: 0, left: 0, right: 0 });
```

## Padrões de Teste

### Tela de Login (Exemplo Completo)

```typescript
// UserLoginScreen.test.tsx
import UserLoginScreen from "@/src/features/user/auth/screens/UserLoginScreen";
import { login } from "@/src/features/user/auth/services/authService";

jest.mock("@/src/features/user/auth/services/authService", () => ({
  login: jest.fn(),
}));

const mockedLogin = login as jest.MockedFunction<typeof login>;

describe("UserLoginScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.spyOn(console, "log").mockImplementation(() => {});
    mockedLogin.mockReset();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  function fillCredentials(email: string, password: string) {
    fireEvent.changeText(screen.getByPlaceholderText("Digite seu email"), email);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), password);
  }

  it("faz login com sucesso e navega para o mapa", async () => {
    mockedLogin.mockResolvedValueOnce(undefined);
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");

    fireEvent.press(screen.getByText("Entrar"));

    await waitFor(() =>
      expect(mockedLogin).toHaveBeenCalledWith({
        email: "turista@email.com",
        password: "Senha@123",
      })
    );
    expect(mockedReplace).toHaveBeenCalledWith("/user/(private)/map/(tabs)");
  });

  it("mostra erro de email vazio e não chama login", () => {
    render(<UserLoginScreen />);
    fireEvent.changeText(screen.getByPlaceholderText("Digite sua senha"), "Senha@123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(screen.getByText("Preencha o campo com seu email")).toBeTruthy();
    expect(mockedLogin).not.toHaveBeenCalled();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra erro geral quando login falha e não navega", async () => {
    mockedLogin.mockRejectedValueOnce(new Error("credenciais inválidas"));
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(await screen.findByText("Email ou senha incorretos")).toBeTruthy();
    expect(mockedReplace).not.toHaveBeenCalled();
  });

  it("mostra loading enquanto login está pendente", async () => {
    let resolveLogin!: () => void;
    mockedLogin.mockReturnValueOnce(
      new Promise<void>((resolve) => { resolveLogin = resolve; })
    );
    render(<UserLoginScreen />);
    fillCredentials("turista@email.com", "Senha@123");
    fireEvent.press(screen.getByText("Entrar"));

    expect(screen.queryByText("Entrar")).toBeNull();
    expect(screen.getByTestId("loading-indicator")).toBeTruthy(); // ActivityIndicator

    resolveLogin();
    await waitFor(() => expect(mockedReplace).toHaveBeenCalled());
  });
});
```

### Componente com Props (Exemplo)

```typescript
// StarRating.test.tsx
import StarRating from "@/src/features/user/shop/components/StarRating";

describe("StarRating", () => {
  it("renderiza estrelas preenchidas conforme rating", () => {
    render(<StarRating rating={4} maxRating={5} size={24} />);
    const filledStars = screen.getAllByTestId("star-filled");
    const emptyStars = screen.getAllByTestId("star-empty");
    expect(filledStars).toHaveLength(4);
    expect(emptyStars).toHaveLength(1);
  });

  it("chama onPress ao tocar estrela (modo interativo)", () => {
    const onPress = jest.fn();
    render(<StarRating rating={0} maxRating={5} onPress={onPress} />);
    fireEvent.press(screen.getByTestId("star-3"));
    expect(onPress).toHaveBeenCalledWith(3);
  });
});
```

### Hook com Store (Exemplo)

```typescript
// useProductsByPoi.test.tsx
import { renderHook, act } from "@testing-library/react";
import { useProductsByPoi } from "@/src/features/user/shop/hooks/useProductsByPoi";
import { useProductStore } from "@/src/stores/user/shop/productStore";

jest.mock("@/src/stores/user/shop/productStore");

describe("useProductsByPoi", () => {
  beforeEach(() => {
    (useProductStore.getState as jest.Mock).mockReturnValue({
      productsByPoi: { "poi-1": [mockProduct1, mockProduct2] },
      fetchProductsByPoi: jest.fn(),
      loading: false,
    });
  });

  it("retorna produtos do POI e dispara fetch se vazio", () => {
    const { result } = renderHook(() => useProductsByPoi("poi-1"));
    expect(result.current.products).toHaveLength(2);
    expect(useProductStore.getState().fetchProductsByPoi).not.toHaveBeenCalled();

    // POI sem cache
    (useProductStore.getState as jest.Mock).mockReturnValue({
      productsByPoi: {},
      fetchProductsByPoi: jest.fn(),
      loading: false,
    });
    const { result: result2 } = renderHook(() => useProductsByPoi("poi-2"));
    expect(result2.current.products).toHaveLength(0);
    expect(useProductStore.getState().fetchProductsByPoi).toHaveBeenCalledWith("poi-2");
  });
});
```

## Mocks Específicos por Tela

| Dependência | Mock Strategy |
|-------------|---------------|
| `expo-router` | `useRouter` → `{ replace, push, back }` mockados |
| `react-native-safe-area-context` | `useSafeAreaInsets` → `{ top, bottom, left, right: 0 }` |
| `react-native-keyboard-controller` | `KeyboardAwareScrollView` → pass-through children |
| `@/src/services/...` | `jest.mock` com funções mockadas por teste |
| Stores Zustand | `jest.mock` + `getState` mockado + `act()` para actions |
| `expo-image` | `jest.mock("expo-image", () => "Image")` |
| `react-native-maps` | `jest.mock("react-native-maps", () => "View")` |

## Queries RNTL Recomendadas

| Prioridade | Query | Uso |
|------------|-------|-----|
| 1 | `getByRole` / `getByLabelText` | Acessibilidade (botões, inputs) |
| 2 | `getByPlaceholderText` | Inputs |
| 3 | `getByText` | Textos visíveis |
| 4 | `getByTestId` | Fallback (elementos sem texto/role) |
| 5 | `queryBy*` | Verificar ausência |
| 6 | `findBy*` | Elementos assíncronos (loading → conteúdo) |

## Boas Práticas

1. **Teste comportamento do usuário** — `fireEvent.press`, `fireEvent.changeText`, não `props.onPress`
2. **Mock serviços, não componentes** — Teste a tela real com services mockados
3. **Use `waitFor`/`findBy*` para assíncrono** — Loading, navegação, API calls
4. **Limpe mocks no `beforeEach`** — `jest.clearAllMocks()`, `mockReset()`
5. **Teste estados: loading, erro, vazio, sucesso** — 4 cenários por tela
6. **Evite testar implementação** — Não teste `useState` interno, teste o que usuário vê

## Exemplos Testados no Projeto

| Tela/Componente | Arquivo de Teste |
|-----------------|------------------|
| `UserLoginScreen` | `__tests__/integration/screens/UserLoginScreen.test.tsx` |
| `UserSignupScreen` | `__tests__/integration/screens/UserSignupScreen.test.tsx` |
| `ShopkeeperShopScreen` | `__tests__/integration/screens/ShopkeeperShopScreen.test.tsx` |
| `ProductDetailScreen` | `__tests__/integration/screens/ProductDetailScreen.test.tsx` |
| `MapScreen` | `__tests__/integration/screens/MapScreen.test.tsx` |
| `ProductImageCarousel` | `__tests__/integration/components/ProductImageCarousel.test.tsx` |
| `XpBar` | `__tests__/integration/components/XpBar.test.tsx` |
| `StarRating` | `__tests__/integration/components/StarRating.test.tsx` |
| `RedemptionAlertModal` | `__tests__/integration/components/RedemptionAlertModal.test.tsx` |
| `CheckinRewardModal` | `__tests__/integration/components/CheckinRewardModal.test.tsx` |
| `Header` | `__tests__/integration/components/Header.test.tsx` |
| `CompleteRequiredXp` | `__tests__/integration/components/CompleteRequiredXp.test.tsx` |

## Debugging

```bash
# Rodar teste específico com logs
npm run test:integration -- --testNamePattern="faz login com sucesso" --verbose

# Debug no VS Code (launch.json)
{
  "type": "node",
  "request": "launch",
  "name": "Debug Integration Test",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--selectProjects", "integration", "--testNamePattern", "UserLoginScreen"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```