import {
    HttpException,
    HttpStatus,
    Injectable,
    UnauthorizedException,
  } from '@nestjs/common';
  import { JwtService } from '@nestjs/jwt';
  import { UsersService } from '../users/users.service';
  import { RegisterDto } from './dto/register.dto';
  import { LoginDto } from './dto/login.dto';
  import * as bcrypt from 'bcrypt';
  
  @Injectable()
  export class AuthService {
    constructor(
      private usersService: UsersService,
      private jwtService: JwtService,
    ) {}
  
    async register(registerDto: RegisterDto) {
      try {
        const user = await this.usersService.create(registerDto);
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
          access_token: this.jwtService.sign(payload),
          user,
        };
      } catch (error) {
        throw error;
      }
    }
  
    async login(loginDto: LoginDto) {
      try {
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload = { sub: user.id, email: user.email, role: user.role };
        return {
          access_token: this.jwtService.sign(payload),
          user,
        };
      } catch (error) {
        throw error;
      }
    }
  
    private async validateUser(email: string, password: string) {
      try {
        const user = await this.usersService.findByEmail(email);
        if (!user) {
          throw new UnauthorizedException('Invalid credentials');
        }
  
        const isPasswordValid = await bcrypt.compare(password, user.password);
  
        if (!isPasswordValid) {
          throw new UnauthorizedException('Invalid credentials');
        }
        return user;
      } catch (error) {
        throw error;
      }
    }
  }
  