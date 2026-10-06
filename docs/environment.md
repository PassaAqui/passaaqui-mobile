# Variáveis de Ambiente

## Visão Geral

O projeto utiliza variáveis de ambiente prefixadas com `EXPO_PUBLIC_` para configurações do lado do cliente (acessíveis no bundle JavaScript). O arquivo `.env` **não deve ser commitado** (já está no `.gitignore`).

## Configuração

```bash
# Copie o template
cp .env.example .env

# Edite com seus valores
# .env
```

## Variáveis Obrigatórias

| Variável | Exemplo | Descrição | Onde Obter |
|----------|---------|-----------|------------|
| `EXPO_PUBLIC_API_URL` | `http://192.168.1.100:8080/api` | URL base da API REST do backend. Deve apontar para o IP da máquina onde o backend roda (não `localhost` no device físico). | Backend / DevOps — configure o backend e use o IP da máquina na rede local |
| `EXPO_PUBLIC_WS_URL` | `ws://192.168.1.100:8080/ws` | URL do WebSocket para comunicação em tempo real (pedidos, localização, notificações). Mesmo host da API, protocolo `ws://` ou `wss://`. | Backend / DevOps — endpoint WebSocket do backend |
| `APP_ID` | `host.exp.exponent` | Identificador do app no Expo. Para Expo Go: `host.exp.exponent`. Para builds customizados: `applicationId` (Android) ou `bundleIdentifier` (iOS). | `app.json` → `expo.slug` ou projeto no [Expo Dashboard](https://expo.dev/accounts) |

## Variáveis Opcionais (Futuras)

| Variável | Descrição |
|----------|-----------|
| `EXPO_PUBLIC_ORS_API_KEY` | Chave OpenRouteService (se migrar roteamento para client-side) |
| `EXPO_PUBLIC_SENTRY_DSN` | DSN do Sentry para error tracking |

## Dicas Importantes

### Device Físico na Rede Local
Para testar em device físico via Expo Go:
1. Descubra o IP da máquina: `ipconfig` (Windows) / `ifconfig \| grep inet` (Linux/macOS)
2. Use esse IP nas URLs (ex: `http://192.168.1.50:8080/api`)
3. Certifique-se que o backend aceita conexões na interface `0.0.0.0` (não só `127.0.0.1`)
4. Use `npx expo start --tunnel` se não estiver na mesma rede

### Expo Go vs Build Nativo
| Ambiente | `APP_ID` |
|----------|----------|
| Expo Go (desenvolvimento) | `host.exp.exponent` |
| Development Build | `host.exp.exponent` |
| Preview/Production Build | Seu `applicationId` / `bundleIdentifier` |

### Validação em Runtime
O app valida as variáveis na inicialização. Se alguma obrigatória estiver ausente ou inválida, exibirá erro claro na tela.

## Exemplo Completo (.env)

```bash
# API REST do Backend
EXPO_PUBLIC_API_URL=http://192.168.1.100:8080/api

# WebSocket para tempo real
EXPO_PUBLIC_WS_URL=ws://192.168.1.100:8080/ws

# App ID do Expo (Expo Go)
APP_ID=host.exp.exponent
```

## Troubleshooting

| Problema | Solução |
|----------|---------|
| "Network request failed" | Verifique se `EXPO_PUBLIC_API_URL` usa IP da rede (não `localhost`) e backend roda em `0.0.0.0` |
| WebSocket não conecta | Confirme `EXPO_PUBLIC_WS_URL` com `ws://` (não `http://`) e mesma porta do backend |
| "App not found" no Maestro | `APP_ID` deve corresponder ao build instalado (`host.exp.exponent` para Expo Go) |
| Variáveis não carregam | Reinicie o Metro: `npx expo start -c` (cache clear) |