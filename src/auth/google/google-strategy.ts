import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Profile, Strategy, VerifyCallback } from "passport-google-oauth20";
import * as process from "process";
import { email } from "typia/lib/utils/RandomGenerator/RandomGenerator";
import { OauthUserDto } from "../dto/oauth-user.dto";

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, 'google') {
    constructor() {
      super({
        clientID: process.env.GOOGLE_CLIENT_ID, // ID
        clientSecret: process.env.GOOGLE_CLIENT_SECRET, // PWD
        callbackURL: process.env.GOOGLE_CALLBACK_URL, // 성공 시 URL
        scope: ['https://www.googleapis.com/auth/userinfo.email',
          'https://www.googleapis.com/auth/userinfo.profile'], // 성공 시 받을 데이터
      });
    }

  async validate (accessToken: string, refreshToken: string, profile: Profile): Promise<OauthUserDto> {
    const { id, emails, displayName, photos } = profile;

    return {
      provider: 'google',
      identifier: id,
      email: emails && emails[0].value,
      name: displayName,
      profileUrl: photos[0].value,
    }
  }
}