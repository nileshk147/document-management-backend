import { UserRole } from '../../utils';

import { IsEmail, IsString, MinLength, IsEnum} from 'class-validator';

export class CreateUserDto{
    @IsEmail()
    email: string;

    @IsString()
    @MinLength(8)
    password: string;
    @IsEnum(UserRole)
    role: UserRole;
}