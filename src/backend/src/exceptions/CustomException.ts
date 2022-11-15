export abstract class CustomException extends Error {
  constructor(public status: number, public message: string) {
    super(message);
  }
}
