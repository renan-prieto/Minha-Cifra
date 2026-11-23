/**
 * Configuração compartilhada dos testes.
 *
 * Os matchers do Testing Library são registrados automaticamente ao importar
 * o pacote, mas o import explícito mantém o setup previsível mesmo quando um
 * teste utiliza apenas hooks (`renderHook`).
 */
import "@testing-library/react-native";

/**
 * Resolve o getter preguiçoso de `fetch` do Expo durante o setup.
 *
 * Sem isso, algum acesso tardio ao global (por exemplo após `resetModules`)
 * carrega `expo-modules-core` depois que a suíte terminou. O aviso resultante
 * faz o Jest encerrar com código 1 mesmo com todos os testes passando.
 */
Object.defineProperty(globalThis, "fetch", {
  value: jest.fn(),
  writable: true,
  configurable: true,
});
