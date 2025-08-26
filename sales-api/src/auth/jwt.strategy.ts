import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';

export type JwtPayload = {
  sub: string;
  email: string;
  role: 'ADMIN' | 'SELLER';
};

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    // Debug: Check what environment variables are loaded
    console.log('[JWT STRATEGY] All env vars:', {
      JWT_SECRET: process.env.JWT_SECRET,
      JWT_EXPIRES: process.env.JWT_EXPIRES,
      NODE_ENV: process.env.NODE_ENV,
      PORT: process.env.PORT,
    });

    const secret = configService.get<string>('JWT_SECRET');
    console.log('[JWT STRATEGY] ConfigService JWT_SECRET:', secret);

    if (!secret) {
      throw new Error('JWT_SECRET is not defined in environment variables');
    }

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: secret,
    });
  }

  validate(payload: JwtPayload) {
    // payload estará em req.user com role incluído
    return payload;
  }
}
