import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class RegisterDto {
  @IsNotEmpty()
  @IsString()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  @MaxLength(64)
  password: string;
  @IsString()
  @IsNotEmpty()
  @MaxLength(32)
  name: string;
  @IsNotEmpty()
  @IsString()
  @MaxLength(32)
  surname: string;
}
