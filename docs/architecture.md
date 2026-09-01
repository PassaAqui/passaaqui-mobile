# Arquitetura do PassaAqui

## Visão Geral

O projeto segue uma arquitetura **feature-based** (orientada a funcionalidades) com separação clara de responsabilidades, organizada em torno de domínios de negócio (turista e lojista) em vez de camadas técnicas.

## Estrutura de Pastas (src/)

```
src/
├── app/                    # Rotas (Expo Router) — ponto de entrada da UI
│   ├── user/              # Rotas do turista (público e privado)
│   └── shopkeeper/        # Rotas do lojista (público e privado)
├── features/              # Funcionalidades de negócio (domain-driven)
│   ├── user/              # Domínio do turista
│   │   ├── auth/          # Autenticação, cadastro, recuperação de sessão
│   │   ├── map/           # Mapa, navegação, POIs, check-in, cidades visitadas
│   │   ├── shop/          # Catálogo, produtos, resgate, avaliações
│   │   └── payment/       # Pix, checkout, WebSocket de pedidos
│   └── shopkeeper/        # Domínio do lojista
│       ├── auth/          # Autenticação, cadastro com CNPJ/localização
│       ├── products/      # CRUD de produtos, validação de schemas
│       ├── orders/        # Gestão de pedidos, preparação, status
│       ├── catalog/       # Listagem e filtros de produtos da loja
│       └── dashboard/     # Métricas, gráficos, KPIs
├── stores/                # Estado global (Zustand) — persistência e ações
│   ├── user/              # authStore, visitedCitiesStore, payment/orderStore
│   └── shopkeeper/        # shopkeeperAuthStore
├── services/              # Camada de integração externa
│   ├── api/               # Cliente Axios configurado (interceptors, baseURL)
│   └── socket/            # Cliente STOMP/WebSocket para tempo real
├── hooks/                 # Hooks compartilhados entre features
├── constants/             # Constantes, configs, enums, dados estáticos
├── e2e/                   # Testes E2E (Maestro) — fluxos críticos por perfil
└── assets/                # Imagens, fontes, ícones, splash screen
```

## Princípios Arquiteturais

### Colocation
Testes, tipos e componentes ficam próximos ao código que testam/usam. Cada feature possui sua pasta `__tests__/` com subpastas `unit/`, `integration/` e `fixtures/`.

### Separação de Camadas
```
UI (app/, features/*/screens)
    ↓
Lógica de negócio (features/*/services, hooks)
    ↓
Estado global (stores/)
    ↓
Integração externa (services/api/, services/socket/)
```

### Tipagem Estrita
- TypeScript `strict: true` habilitado
- Path aliases absolutos (`@/*`) configurados no `tsconfig.json`
- Tipos compartilhados via `@tanstack/react-query` e schemas Zod

### Testabilidade
- Serviços e stores isolados para testes unitários
- Mocks centralizados em `jest.setup.ts` (ex: `expo-secure-store`)
- Fixtures por feature em `__tests__/fixtures/`

## Padrões de Código

### Stores (Zustand)
- Uma store por domínio (auth, map, payment, shopkeeper)
- Actions assíncronas encapsulam chamadas de API
- Persistência seletiva via middleware (tokens em `expo-secure-store`)

### Services
- `api/`: Cliente Axios singleton com interceptors para auth, refresh token, error handling
- `socket/`: Cliente STOMP para WebSocket (tempo real: pedidos, localização)

### Features
Cada feature segue estrutura consistente:
```
feature-name/
├── components/      # Componentes React específicos
├── hooks/           # Hooks de lógica de negócio
├── services/        # Chamadas de API específicas
├── schemas/         # Validação Zod
├── screens/         # Telas (entry points)
├── utils/           # Utilitários puros
└── __tests__/       # Testes colocalizados
    ├── unit/
    ├── integration/
    └── fixtures/
```

### Roteamento (Expo Router)
- File-based routing com typed routes habilitado (`experiments.typedRoutes: true`)
- Layouts aninhados para áreas pública/privada por perfil
- Route groups `(public)` e `(private)` para separar autenticação

## Decisões Técnicas Relevantes

| Decisão | Justificativa |
|---------|---------------|
| Feature-based vs Layer-based | Isolamento de domínios, facilita manutenção e onboarding |
| Zustand vs Redux/Context | API simples, performance, TypeScript nativo, menos boilerplate |
| TanStack Query vs SWR | Cache avançado, mutations, invalidation, devtools |
| NativeWind vs StyleSheet | Tailwind familiar, responsive, dark mode nativo, performance |
| Maestro vs Detox | YAML declarativo, cross-platform, sem dependência de Jest |
| Expo Router vs React Navigation | File-based, typed routes, deep linking nativo, RSC ready |