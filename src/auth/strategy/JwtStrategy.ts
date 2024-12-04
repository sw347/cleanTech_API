import { Injectable, UnauthorizedException } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { UserService } from "../../user/user.service";
import { UserEntity } from "../../user/entity/user.entity";

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(
    private  readonly userService: UserService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: 'accessToken',
    });
  }

  async validate(payload: { identifier: string }): Promise<UserEntity> {
    const user = await this.userService.findUserByIdentifier(payload.identifier);

    if (user == null) throw new UnauthorizedException();

    return user;
  }

}