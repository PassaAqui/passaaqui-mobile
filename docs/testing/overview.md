# Visão Geral da Estratégia de Testes

## Pirâmide de Testes

O projeto adota a pirâmide clássica com três camadas:

```
        E2E (Maestro)           ← Poucos, fluxos críticos reais
    ┌─────────────────────┐
    │   Integration       │  ← Componentes + hooks + services integrados
    │   (Jest + RNTL)     │
    ├─────────────────────┤
    │      Unit           │  ← Muitos, rápidos, isolados (stores, services, utils)
    │      (Jest)         │
    └─────────────────────┘
```

## Distribuição Recomendada

| Camada | Quantidade | Velocidade | Foco |
|--------|------------|------------|------|
| **Unit** | ~70% | < 1s cada | Lógica pura, rules de negócio, utils |
| **Integration** | ~25% | 1-5s cada | Renderização, interação, fluxos de tela |
| **E2E** | ~5% | 30-120s cada | Jornadas críticas end-to-end |

## Princípios

1. **Testar comportamento, não implementação** — Foque no que o usuário vê/faz
2. **Isolamento** — Unitários não dependem de rede, banco, ou outros módulos
3. **Colocation** — Testes ficam ao lado do código testado (`__tests__/` dentro de cada feature)
4. **Determinismo** — Sem flakiness; mocks controlados, dados fixos (fixtures)
5. **Cobertura significativa** — Priorize caminhos críticos sobre % numérico

## Configuração (jest.config.js)

Dois projects Jest configurados:

```javascript
projects: [
  {
    displayName: "unit",
    testMatch: ["<rootDir>/src/**/__tests__/unit/**/*.test.(ts|tsx)"],
    // preset: jest-expo, mocks globais, transformIgnorePatterns
  },
  {
    displayName: "integration",
    testMatch: ["<rootDir>/src/**/__tests__/integration/**/*.test.(ts|tsx)"],
    // mesmo preset, mesmos mocks
  }
]
```

## Scripts Disponíveis

| Comando | Descrição |
|---------|-----------|
| `npm run test` | Todos (unit + integration) |
| `npm run test:unit` | Apenas unitários |
| `npm run test:integration` | Apenas integração |
| `npm run test:watch` | Modo watch (todos) |
| `npm run test:coverage` | Cobertura completa (HTML + LCOV) |
| `npm run test:unit:coverage` | Cobertura apenas unitários |
| `npm run test:integration:coverage` | Cobertura apenas integração |
| `npm run test:e2e` | Testes E2E Maestro |

## Cobertura

- Relatórios em `coverage/` (gerado por `npm run test:coverage`)
- `lcov-report/index.html` — Navegável por arquivo
- `lcov.info` — Para CI (Codecov, SonarQube)
- Thresholds não configurados (adicionar se necessário)

## Mocks Globais (jest.setup.ts)

```typescript
jest.mock("expo-secure-store", () => ({
  getItemAsync: jest.fn(),
  setItemAsync: jest.fn(),
  deleteItemAsync: jest.fn(),
}));
```

## Fixtures

Dados de teste reutilizáveis em `__tests__/fixtures/` por feature:
- `auth.ts` — inputs válidos/inválidos, tokens, respostas de API
- `shop.ts` — produtos, categorias, lojas mockadas
- `products.ts` — dados para CRUD de produtos lojista

## Boas Práticas

### Unitários
- Teste stores (Zustand): actions, selectors, persistência
- Teste services: chamadas API, tratamento de erro, transformação de dados
- Teste utils: funções puras, edge cases
- Teste hooks de lógica: `useNavigation`, `useLocationTracking` (lógica, não UI)

### Integração
- Renderize telas completas com RNTL
- Mock navegação (`expo-router`), safe area, teclado
- Teste interações: `fireEvent`, `waitFor`, `findByText`
- Valide chamadas de service, navegação, estados loading/erro/sucesso

### E2E
- Fluxos críticos apenas (login, checkout, check-in)
- Dados de teste isolados (backend de staging/test)
- Executar localmente antes de merges críticos

## Links Úteis

- [Testes Unitários](unit.md)
- [Testes de Integração](integration.md)
- [Testes E2E (Maestro)](e2e.md)
- [Jest Docs](https://jestjs.io/docs/getting-started)
- [React Native Testing Library](https://callstack.github.io/react-native-testing-library/)
- [Maestro Docs](https://maestro.mobile.dev/)