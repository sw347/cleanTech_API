import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy } from "passport-google-oauth20";
import { OauthUserDto } from "../dto/oauth-user.dto";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(configService: ConfigService) {
    super({
      clientID: configService.get<string>("oauth.google.clientId"), // ID
      clientSecret: configService.get<string>("oauth.google.clientSecret"), // PWD
      callbackURL: configService.get<string>("oauth.google.callbackUrl"), // 성공 시 URL
      scope: ["email", "profile"] // 성공 시 받을 데이터
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: Profile): Promise<OauthUserDto> {
    const { id, emails, displayName, photos } = profile;

    return {
      provider: "google",
      identifier: id,
      email: emails && emails[0].value,
      name: displayName,
      profileUrl: photos[0].value
    };
  }
}