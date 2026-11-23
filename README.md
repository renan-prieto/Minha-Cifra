# Minha Cifra - Sistema de Gestão Financeira

O **Minha Cifra** é um ecossistema completo de gestão financeira pessoal desenvolvido como projeto de conclusão de curso (TCC). O sistema permite que os usuários controlem suas receitas, despesas, faturamento e impostos de forma inteligente, rápida e facil.
O projeto adota uma arquitetura **Full Stack**, separando totalmente a interface móvel (Frontend) da inteligência de negócios e persistência de dados (Backend).

---

## Arquitetura do Projeto

O ecossistema é dividido em três camadas principais estruturadas sob o princípio de **Separação de Responsabilidades (SOC)**:

1. **Mobile (Frontend):** Desenvolvido em **React Native** com **Expo** (TypeScript), utilizando navegação baseada em arquivos (`expo-router`) e componentes desacoplados.
2. **API (Backend):** Servidor centralizado em **Node.js** com **Express**, responsável pelas regras de negócio, rotas de autenticação e comunicação segura.
3. **Banco de Dados (Database):** Sistema gerenciador **MariaDB** estruturado de forma relacional para garantir a integridade dos dados financeiros.

---

## Tecnologias Utilizadas

### Frontend (Mobile)
* **React Native & Expo** (SDK mais recente)
* **TypeScript** para tipagem estática e segurança do código
* **Axios** para requisições HTTP à API Rest
* **Expo Router** para navegação nativa avançada

### Backend (API)
* **Node.js** como ambiente de execução
* **Express** para roteamento HTTP
* **Bcrypt** para hash seguro de senhas antes da persistência
* **MySQL2** para driver de conexão com o banco de dados

### Banco de Dados
* **MariaDB** (Rodando localmente)
* **DBeaver** como ferramenta de gerenciamento (SGDB)

---

## Configuração do aplicativo

Crie um arquivo `.env` na raiz (baseado em `.env.example`) definindo a URL da API:

```sh
EXPO_PUBLIC_API_URL=http://SEU_IP_LOCAL:3000
```

Se a variável não for definida em desenvolvimento, o app tenta usar automaticamente o host do Metro na porta `3000`. Em produção/build, defina `EXPO_PUBLIC_API_URL` com a URL HTTPS pública da API.

A autenticação usa sessões emitidas por `POST /login`. Antes de usar o backend em uma base existente, aplique as migrações de `api-node/migrations` (inclusive `003_sessions.sql`), conforme o `api-node/README.md`.

## Testes

O app usa **Jest** com o preset `jest-expo` e **Testing Library**. Os testes cobrem utilitários, modelos, repositórios, contexts e ViewModels em `src/**/__tests__`.

```sh
npm test              # executa a suíte do app
npm run test:watch    # executa em modo watch
npm run test:coverage # gera o relatório de cobertura em coverage/
```

Para executar a suíte do app e a suíte de integração da API em sequência:

```sh
npm run test:all
```

Os testes da API ficam em `api-node/test` e sobem o servidor Express com um banco em memória, sem exigir MariaDB nem credenciais externas. Consulte o `api-node/README.md` para os detalhes.

## Modo visitante (testes)

As telas de onboarding e login possuem o link **Entrar sem conta (modo de teste)**. Ele cria uma sessão apenas local, sem conta e sem token no servidor, mantendo todas as funcionalidades liberadas. Os lançamentos financeiros ficam isolados no usuário visitante do aparelho, separados das contas reais. O assistente de IA usa `POST /chat/guest`, que tem limite próprio por IP.
