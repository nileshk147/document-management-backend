import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../../users/users.service';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private usersService: UsersService,
    private configService: ConfigService,
  ) {
    super({
      jwtFromRequest: ExtractJwt?.fromAuthHeaderAsBearerToken(),
      secretOrKey: configService?.getEnvValue('JWT_SECRET') || '',
    });
  }

  async validate(payload: any) {
    const user = await this.usersService?.findOne(payload?.sub);
    if (!user) throw new UnauthorizedException();
    return user;
  }
}
