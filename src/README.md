# Arquitetura do app (MVVM)

O aplicativo segue o padrão **MVVM (Model–View–ViewModel)** em camadas. O Expo Router
continua sendo a única fonte de verdade das rotas, mas as rotas não implementam telas:
elas apenas apontam para as Views.

```
app/                      Rotas do Expo Router (arquivos finos)
src/
  models/                 Model: entidades e tipos de domínio
  repositories/           Acesso a dados (API REST, SQLite, SecureStore)
  contexts/               Estado compartilhado entre telas + providers globais
  viewmodels/             ViewModel: estado da tela, regras e ações (hooks)
  views/                  View: composição visual das telas
  components/             Componentes de UI reutilizáveis (sem regra de negócio)
    styles/               Folhas de estilo por tela/componente
  hooks/                  Hooks genéricos de plataforma (tema, color scheme)
  constants/              Textos, tema, meses etc.
  utils/                  Funções puras utilitárias
```

## Fluxo de dependências

```
View -> ViewModel -> Context/Repository -> Model
```

- **View** não acessa repositórios nem faz validações de negócio.
- **ViewModel** não importa componentes visuais.
- **Repository** não conhece React.
- **Model** não depende de nenhuma outra camada.

## Como adicionar uma tela

1. Crie o ViewModel em `src/viewmodels/useMinhaTelaViewModel.ts` com estado e ações.
2. Crie a View em `src/views/<feature>/MinhaTelaView.tsx` consumindo apenas o ViewModel
   e os componentes de UI.
3. Crie a rota em `app/.../minhaTela.tsx` exportando a View:

   ```tsx
   export { default } from "@/src/views/<feature>/MinhaTelaView";
   ```

4. Se houver estilo novo, adicione em `src/components/styles/stylesMinhaTela.tsx`.

## Camadas em detalhe

- `src/models`: `User`, `ItemFinance`, `FinanceType`, `TaxSettings`, `ChatMessage` etc.
- `src/repositories`: `api`, `authRepository`, `userRepository`, `financeRepository`,
  `database` e `chatRepository`.
- `src/contexts`: `UserContext` (sessão), `FinanceContext` (lançamentos e tags),
  `TaxSettingsContext` e `ThemeContext`, compostos por `AppProviders`.
- `src/viewmodels`: um ViewModel por tela ou fluxo (`useHomeViewModel`,
  `useCalculatorViewModel`, `useNewReleaseViewModel`, ...).
- `src/views`: uma View por rota (`HomeView`, `ChatView`, `TagsView`, ...).
