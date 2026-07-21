export class SocketAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "SocketAuthError";
  }
}

