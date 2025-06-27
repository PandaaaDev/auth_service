import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CryptoService {
  private readonly saltRounds = 12;

  async hashPassword(passwrod: string): Promise<string> {
    return bcrypt.hash(passwrod, this.saltRounds);
  }

  async comparePasswords(password, hash) {
    return bcrypt.compare(password, hash);
  }
}
