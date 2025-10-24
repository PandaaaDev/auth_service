import { Request } from '@nestjs/common';

export interface AuthRequest extends Request {
  headers: Request['headers'] & {
    authorization?: string;
  };
}
