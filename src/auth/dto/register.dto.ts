import { IsEmail, IsString, MinLength, IsEnum } from 'class-validator';
import { UserRole } from '../../utils';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsEnum(UserRole)
  role: UserRole = UserRole.VIEWER;
}
