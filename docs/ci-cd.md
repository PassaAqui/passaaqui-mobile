# CI/CD Pipeline

## Visão Geral

Pipeline configurado em `.github/workflows/ci.yml` executado em:
- **Pull Requests** para `develop` e `main`
- **Push** para `develop`

## Jobs

| Job | Runner | Descrição | Falha Bloqueia |
|-----|--------|-----------|----------------|
| `lint` | ubuntu-latest | ESLint (warnings permitidos, erros falham) | ✅ Sim |
| `typecheck` | ubuntu-latest | `tsc --noEmit` (tipagem estrita) | ✅ Sim |
| `expo-doctor` | ubuntu-latest | Validação Expo: config, deps, compatibilidade | ✅ Sim |
| `unit-tests` | ubuntu-latest | `npm run test:unit -- --ci --watchAll=false` | ✅ Sim |
| `integration-tests` | ubuntu-latest | `npm run test:integration -- --ci --watchAll=false` | ✅ Sim |

## Fluxo

```
Push/PR → [Lint] → [TypeCheck] → [Expo Doctor] → [Unit Tests] → [Integration Tests]
              ↓          ↓              ↓              ↓               ↓
          Status Check (todos devem passar para merge)
```

## Detalhes por Job

### Lint
```yaml
- run: npx expo lint
```
- Config: `eslint.config.js` (flat config, extends `eslint-config-expo`)
- Warnings não falham; errors sim

### TypeCheck
```yaml
- run: npx tsc --noEmit
```
- `tsconfig.json` com `strict: true`
- Sem emissão de arquivos, apenas validação

### Expo Doctor
```yaml
- run: npx expo-doctor
```
- Valida: versão Expo SDK, dependências compatíveis, configuração `app.json`, plugins

### Unit Tests
```yaml
- run: npm run test:unit -- --ci --watchAll=false
```
- Project Jest `unit` (preset `jest-expo`)
- `--ci` força exit code correto, `--watchAll=false` desabilita watch

### Integration Tests
```yaml
- run: npm run test:integration -- --ci --watchAll=false
```
- Project Jest `integration` (mesmo preset, testMatch diferente)

## Cache

Todos os jobs usam cache do npm:
```yaml
- uses: actions/setup-node@v4
  with:
    node-version: 20
    cache: 'npm'
- run: npm ci  # Install exato (package-lock.json)
```

## Node Version

**Node 20** (LTS) — definido em `setup-node@v4` e compatível com `.nvmrc`/Engines se configurado.

## Artifacts

- Nenhum artifact persistido por padrão
- Cobertura gerada localmente (`npm run test:coverage` → `coverage/`)
- Para CI: adicionar `actions/upload-artifact` se necessário (ex: relatório LCOV para Codecov)

## Secrets Necessários

Nenhum secret obrigatório para o pipeline atual (todos os comandos rodam sem credenciais externas).

## Exclusions

- **Testes E2E (Maestro)**: Não rodam no CI — exigem device/emulador real. Executar localmente.
- **Builds nativos**: Não configurados (EAS Build seria separado)

## Adicionando Codecov (Opcional)

```yaml
# No job unit-tests ou integration-tests, após testes:
- name: Upload coverage
  uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
```

## Troubleshooting

| Erro | Causa Comum | Solução |
|------|-------------|---------|
| `tsc --noEmit` falha | Tipos incompatíveis | Corrija erros TypeScript localmente (`npm run typecheck`) |
| `expo-doctor` falha | Dependência incompatível | `npx expo-doctor` local, atualize deps conforme sugerido |
| Jest timeout | Testes assíncronos lentos | Aumente `testTimeout` em `jest.config.js` ou otimize mocks |
| `npm ci` falha | `package-lock.json` dessincronizado | `rm package-lock.json && npm install && git add package-lock.json` |

## Branch Protection (Recomendado)

Configure no GitHub (Settings → Branches → Branch protection rules):
- `main` e `develop`: Require status checks to pass before merging
- Required checks: `lint`, `typecheck`, `expo-doctor`, `unit-tests`, `integration-tests`
- Require PR reviews (mínimo 1)
- Dismiss stale reviews on new commits