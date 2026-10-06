<div align="center">

![PassaAqui Banner](./docs/banner-passaaqui.png)

**Aplicativo que conecta turistas e comércios locais através de gamificação e geolocalização**

[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo&logoColor=white)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![NativeWind](https://img.shields.io/badge/NativeWind-4-38B2AC?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://www.nativewind.dev/)
[![Zustand](https://img.shields.io/badge/Zustand-5-FF6B6B?style=for-the-badge&logo=zustand&logoColor=white)](https://zustand-demo.pmnd.rs/)
[![TanStack Query](https://img.shields.io/badge/TanStack%20Query-5-FF4154?style=for-the-badge&logo=reactquery&logoColor=white)](https://tanstack.com/query)
[![Jest](https://img.shields.io/badge/Jest-29-C21325?style=for-the-badge&logo=jest&logoColor=white)](https://jestjs.io/)
[![Maestro](https://img.shields.io/badge/Maestro-E2E-5A67D8?style=for-the-badge&logo=maestro&logoColor=white)](https://maestro.mobile.dev/)
[![CI](https://img.shields.io/github/actions/workflow/status/PassaAqui/passaqui-mobile/ci.yml?style=for-the-badge&logo=githubactions&logoColor=white)](https://github.com/PassaAqui/passaqui-mobile/actions/workflows/ci.yml)
[![License](https://img.shields.io/badge/License-All%20Rights%20Reserved-lightgrey?style=for-the-badge)](#licença)

</div>

---

## Sobre o Projeto

O **PassaAqui** é uma plataforma mobile que conecta turistas a estabelecimentos comerciais locais através de uma experiência gamificada baseada em geolocalização. O aplicativo transforma a exploração de cidades em uma jornada interativa onde usuários descobrem pontos de interesse, realizam check-ins, resgatam produtos e ganham recompensas, enquanto comércios aumentam sua visibilidade e fluxo de clientes.

### Perfis de Usuário

| Perfil | Descrição |
|--------|-----------|
| **Turista (Aventureiro)** | Explora o mapa, faz check-ins em POIs, visita lojas, resgata produtos via Pix, acompanha conquistas e cidades visitadas |
| **Lojista (Comerciante)** | Gerencia catálogo de produtos, acompanha pedidos em tempo real, visualiza dashboard de métricas, configura planos e localização da loja |

---

## Tecnologias Principais

| Categoria | Tecnologias |
|-----------|-------------|
| **Core** | React 19, React Native 0.81, Expo 54, TypeScript 5.9 |
| **Roteamento & UI** | Expo Router, NativeWind 4 (Tailwind), Reanimated 4 |
| **Estado & Dados** | Zustand 5, TanStack Query 5, Axios, @stomp/stompjs |
| **Mapa & Localização** | react-native-maps, expo-location, OpenRouteService |
| **Testes** | Jest 29 (unit + integration), Maestro (E2E) |
| **Qualidade & CI** | ESLint 9, TypeScript strict, GitHub Actions |

> Detalhes da arquitetura e estrutura de pastas em [`docs/architecture.md`](docs/architecture.md)

---

## Pré-requisitos

- **Node.js** 20.19.6+
- **npm** 10.8.2+
- **Expo CLI** (`npx expo`)
- **Expo Go** (opcional, caso utilize algum emulador)
- **Android Studio** / **Xcode** (opcional, para builds nativos)
- **Maestro CLI** (opcional, para testes E2E — veja [documentação oficial](https://maestro.mobile.dev/getting-started/installing-maestro))

---

## Instalação

```bash
# 1. Clone o repositório
git clone https://github.com/PassaAqui/passaqui-mobile.git
cd passaaqui-mobile

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o arquivo .env com suas chaves (veja docs/environment.md)
```

---

## Variáveis de Ambiente

| Variável | Obrigatória | Descrição |
|----------|-------------|-----------|
| `EXPO_PUBLIC_API_URL` | ✅ | URL base da API REST do backend (ex: `http://seu-ip:8080/api`) |
| `EXPO_PUBLIC_WS_URL` | ✅ | URL do WebSocket para tempo real (ex: `ws://seu-ip:8080/ws`) |
| `APP_ID` | ✅ | App ID do Expo (`host.exp.exponent` para Expo Go) |

> Detalhes completos e onde obter cada valor em [`docs/environment.md`](docs/environment.md)

---

## Como Executar

```bash
# Desenvolvimento (Expo Go)
npx expo start

# Opções úteis:
npx expo start --android   # Emulador Android
npx expo start --ios       # Simulador iOS (macOS)
npx expo start --web       # Navegador
npx expo start --tunnel    # Dispositivo físico em rede diferente
```

1. Execute `npx expo start`
2. Escaneie o QR Code com o app **Expo Go** (Android/iOS)
3. O app recarrega automaticamente ao salvar arquivos (Fast Refresh)

> Builds nativos: `npx expo run:android` / `npx expo run:ios` (requer EAS para stores)

---

## Testes

O projeto adota a **pirâmide de testes** com três camadas:

| Camada | Ferramenta | Comando |
|--------|------------|---------|
| **Unitários** | Jest | `npm run test:unit` |
| **Integração** | Jest + React Native Testing Library | `npm run test:integration` |
| **E2E** | Maestro | `npm run test:e2e` |

```bash
# Todos os testes (unit + integration)
npm run test

# Com cobertura
npm run test:coverage

# E2E (requer app rodando + device/emulador)
npm run test:e2e
npm run test:e2e:tourist
npm run test:e2e:shopkeeper
```

> Documentação detalhada: [`docs/testing/overview.md`](docs/testing/overview.md) | Unit: [`docs/testing/unit.md`](docs/testing/unit.md) | Integration: [`docs/testing/integration.md`](docs/testing/integration.md) | E2E: [`docs/testing/e2e.md`](docs/testing/e2e.md)

---

## CI/CD

Pipeline no GitHub Actions (`.github/workflows/ci.yml`) executado em **PRs** para `develop`/`main` e **push** para `develop`:

- **Lint** — ESLint (erros falham, warnings permitidos)
- **TypeCheck** — `tsc --noEmit`
- **Expo Doctor** — Validação de configuração e dependências
- **Unit Tests** — Jest unit
- **Integration Tests** — Jest integration

> Detalhes em [`docs/ci-cd.md`](docs/ci-cd.md)

---

## Licença

**Todos os direitos reservados.** Este projeto é *source-available* (código visível), mas **não é open source**. Não pode ser copiado, modificado, distribuído ou usado comercialmente sem autorização prévia dos autores.

---

## Equipe / Contato

| Nome | Papel | GitHub | LinkedIn |
|------|-------|--------|----------|
| *William Alves* | *Tech Lead / Mobile* | [@williamdev20](https://github.com/williamdev20) | [linkedin](https://linkedin.com/in/williamalves20) |
| *Harison Nascimento* | *Tech Lead / Backend* | [@harisoncleytondev](https://github.com/harisoncleytondev) | [linkedin](https://www.linkedin.com/in/harison-cleyton-9ab7133a6/) |
| *Wandersson Alves* | *Mobile / UI/UX* | [@wanderssonalves](https://github.com/wanderssonalves) | [linkedin](https://www.linkedin.com/in/wandersson-alves/) |
| *Kauã Felipe* | *Mobile / UI/UX* | [@Kauafelipe-2008](https://github.com/Kauafelipe-2008) | [linkedin](https://www.linkedin.com/in/kau%C3%A3-f-a867a83aa/) |

---

- **Repositório Backend**: [passaaqui-backend](https://github.com/PassaAqui/passaaqui-backend)
- **Issues / Bug Reports**: [GitHub Issues](https://github.com/PassaAqui/passaqui-mobile/issues)
