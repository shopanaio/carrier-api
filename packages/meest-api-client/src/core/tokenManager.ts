// code and comments in English
export type TokenChangeHandler = (token?: string) => void;

export class TokenManager {
  private token?: string;
  private readonly listeners: Set<TokenChangeHandler> = new Set();

  constructor(initialToken?: string, onChange?: TokenChangeHandler) {
    this.token = initialToken;
    if (onChange) {
      this.listeners.add(onChange);
    }
  }

  getToken(): string | undefined {
    return this.token;
  }

  setToken(nextToken?: string): void {
    this.token = nextToken;
    this.emit();
  }

  clearToken(): void {
    this.setToken(undefined);
  }

  subscribe(handler: TokenChangeHandler): () => void {
    this.listeners.add(handler);
    return () => this.listeners.delete(handler);
  }

  private emit() {
    for (const handler of this.listeners) {
      handler(this.token);
    }
  }
}
