import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException, InternalServerErrorException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '../../config/config.service';
import { AuthService } from '../auth.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly configService: ConfigService
  ) {
    const jwtSecret = configService.getEnvValue('JWT_SECRET');

    if (!jwtSecret) {
      throw new InternalServerErrorException('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: jwtSecret,
      passReqToCallback: true,
    });
  }

  async validate(req: Request, payload: JwtPayload) {
    const token = req.headers && req.headers["authorization"]?.split(' ')[1];

    if (!token) {
      throw new UnauthorizedException('Authorization token missing');
    }

    if (this.authService.isTokenBlacklisted(token)) {
      throw new UnauthorizedException('Token is blacklisted');
    }

    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('Invalid token');
    }

    return user;
  }
}
