import 'express-session';

declare module 'express-session' {
  interface Session {
    emailId: string;
  }
}
