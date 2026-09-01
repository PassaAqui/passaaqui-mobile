# Testes E2E (Maestro)

## Visão Geral

Testes E2E validam **fluxos críticos completos** em dispositivo/emulador real usando **Maestro** (YAML declarativo). Complementam unitários/integração testando integração real: app + backend + device.

## Fluxos Cobertos

| Perfil | Fluxo | Arquivo |
|--------|-------|---------|
| **Turista** | Login | `src/e2e/tourist/auth/tourist-login.yaml` |
| | Cadastro | `src/e2e/tourist/auth/tourist-signup.yaml` |
| | Check-in no mapa | `src/e2e/tourist/map/map-checkin.yaml` |
| | Resgate na loja global | `src/e2e/tourist/shop/global-shop-rescue.yaml` |
| | Pagamento Pix | `src/e2e/tourist/payment/payment-pix.yaml` |
| **Lojista** | Login | `src/e2e/shopkeeper/auth/shopkeeper-login.yaml` |
| | Dashboard | `src/e2e/shopkeeper/dashboard/dashboard.yaml` |
| | Catálogo | `src/e2e/shopkeeper/catalog/catalog.yaml` |
| | Lista de pedidos | `src/e2e/shopkeeper/orders/orders-list.yaml` |

## Executando

### Pré-requisitos

1. **Maestro CLI instalado** — Siga a [documentação oficial](https://maestro.mobile.dev/getting-started/installing-maestro)
2. **App rodando** — `npx expo start --tunnel` (ou build nativo instalado)
3. **Device/Emulador conectado** — `adb devices` / Xcode Simulator
4. **`.env` configurado** — `APP_ID=host.exp.exponent` (Expo Go)

### Comandos

```bash
# Todos os fluxos
npm run test:e2e
# ou: maestro test src/e2e

# Apenas turista
npm run test:e2e:tourist
# ou: maestro test src/e2e/tourist

# Apenas lojista
npm run test:e2e:shopkeeper
# ou: maestro test src/e2e/shopkeeper
```

## Estrutura dos Testes (YAML)

### Exemplo: Login Turista

```yaml
# src/e2e/tourist/auth/tourist-login.yaml
appId: ${APP_ID}
---
- assertVisible: "Continuar como aventureiro"
- tapOn: "Continuar como aventureiro"
- assertVisible: "Entrar na sua conta"
- tapOn: "Digite seu email"
- inputText: "turista@email.com"
- hideKeyboard
- tapOn: "Digite sua senha"
- inputText: "Senha@123"
- hideKeyboard
- tapOn: "Entrar"
- extendedWaitUntil:
    visible: "SEGUIR|Explorar|Toque no cartão para virar"
    timeout: 20000
```

### Padrões Comuns

| Comando | Uso |
|---------|-----|
| `appId: ${APP_ID}` | Identificador do app (substituído via env) |
| `assertVisible: "Texto"` | Verifica elemento visível |
| `tapOn: "Texto/ID"` | Toque em elemento |
| `inputText: "valor"` | Digita em campo focado |
| `hideKeyboard` | Esconde teclado virtual |
| `extendedWaitUntil` | Aguarda condição com timeout |
| `scrollUntilVisible` | Scroll até encontrar elemento |
| `swipe` | Gestos de swipe |

### Variáveis de Ambiente

O Maestro substitui `${VAR}` no YAML. Defina via:
- Arquivo `.maestro/config.yaml` (recomendado)
- CLI: `maestro test --env APP_ID=host.exp.exponent src/e2e`
- Export: `export APP_ID=host.exp.exponent`

## Configuração Recomendada (`.maestro/config.yaml`)

```yaml
# .maestro/config.yaml
appId: ${APP_ID}
defaultTimeout: 20000
```

## Dados de Teste

- Use **backend de staging/test** com dados conhecidos
- Usuários de teste: `turista@email.com` / `Senha@123` (turista), `lojista@email.com` / `Senha@123` (lojista)
- Isolamento: cada fluxo deve ser independente (limpar estado se necessário)

## Debugging

```bash
# Modo interativo (Maestro Studio)
maestro studio

# Relatório JUnit para CI
maestro test src/e2e --format junit --output report.xml

# Verbose
maestro test src/e2e --verbose
```

## Boas Práticas

1. **Seletores estáveis** — Use `testID` nos componentes React Native (`testID="login-button"`)
2. **Timeouts realistas** — Animações, rede, GPS precisam de 15-30s
3. **Fluxos atômicos** — Cada YAML testa uma jornada completa
4. **Dados determinísticos** — Backend de teste com seed fixo
5. **Limpeza** — Logout ao final se próximo teste precisa de estado limpo

## Adicionando testID nos Componentes

```tsx
// Exemplo: Botão de login
<TouchableOpacity
  testID="login-button"
  onPress={handleLogin}
>
  <Text>Entrar</Text>
</TouchableOpacity>

// No YAML
- tapOn:
    id: "login-button"
```

## CI/CD

Testes E2E **não rodam no CI** (exigem device/emulador real). Execute localmente antes de merges críticos:

```bash
# Pré-merge checklist
npm run lint
npm run test
npm run test:e2e  # Requer setup manual
```

## Recursos

- [Maestro Docs](https://maestro.mobile.dev/)
- [Maestro Studio](https://maestro.mobile.dev/studio)
- [Seletores](https://maestro.mobile.dev/selectors/)
- [API Reference](https://maestro.mobile.dev/api/)