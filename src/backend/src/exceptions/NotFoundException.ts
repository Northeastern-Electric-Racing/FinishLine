import { CustomException } from './CustomException';

export class NotFoundException extends CustomException {
  public status: number;

  public message: string;

  public name: string;

  constructor(message: string) {
    super(404, message);
    this.status = 404;
    this.message = message;
    this.name = 'NotFoundException';
  }
}
