<img
  src="./docs/banner-passaaqui.png"
/>

## Como rodar o projeto

### Versão das tecnologias utilizadas:

**Node: v20.19.6+**

**npm: v10.8.2+**

Clone o repositório
```
git clone https://github.com/PassaAqui/passaqui-mobile.git
cd passaaqui-mobile
```

Instale as dependências

```
npm install
```

> [!WARNING]
> ATENÇÃO: é preciso ter o node e o npm instalado em sua máquina

Configure as variáveis de ambiente

```
cp .env.example .env

# Entre no .env e preencha as variáveis
EXPO_PUBLIC_ORS_API_KEY=change-me
EXPO_PUBLIC_ORS_BASE_URL=change-me
```
> [!IMPORTANT]
> Acesse https://openrouteservice.org/ e gere uma ORS_API_KEY

Rode o projeto com

```
npx expo start
```

Escaneie o QR Code pelo aplicativo do Expo Go