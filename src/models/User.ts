/**
 * Modelo de domínio do usuário autenticado.
 *
 * `User` representa as credenciais usadas no fluxo de login/cadastro.
 * `UserData` representa o usuário já autenticado e persistido localmente.
 */
export interface UserData {
  id: string;
  name?: string;
  email: string;
  profileImage?: string;
  /** Sessão de teste local, sem conta ou token no servidor. */
  isGuest?: boolean;
}

export default class User {
  public id: string | null;
  public email: string;
  private password: string;

  constructor(email: string, password: string, id: string | null = null) {
    this.id = id;
    this.email = email;
    this.password = password;
  }

  public getId() {
    return this.id;
  }

  public getEmail() {
    return this.email;
  }

  public getPassword() {
    return this.password;
  }
}
