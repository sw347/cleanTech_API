import { Injectable } from '@nestjs/common';
import { OAuth2Client } from 'google-auth-library';
import { UserService } from "../user/user.service";
import { JwtService } from "@nestjs/jwt";
import * as process from "process";
import { OauthUserDto } from "./dto/oauth-user.dto";
import { LoginDto } from "./dto/login.dto";
import { LoginException } from "./exception/login.exception";
import { DateTime } from "luxon";
import { TokenDto } from "./dto/token.dto";
import { verify } from "argon2";

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client;

  constructor(
    private readonly userService: UserService,
    private readonly jwtService: JwtService,
  ) {
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID
    });
  }

  async login(oauthUser: OauthUserDto): Promise<LoginDto> {
    let user = await this.userService.findUserByIdentifier(
      oauthUser.identifier,
      true,
    );

    if (user == null) {
      await this.userService.createUser(oauthUser);
      console.log(oauthUser.name, " 계정 생성")
      user = await this.userService.findUserByIdentifier(oauthUser.identifier);
    }

    if (user == null) throw new LoginException('cannot find user');

    if (user.deletedAt != null) {
      await this.userService.restore(user.id);
    }

    const accessToken = await this.createAccessToken(oauthUser.identifier);
    const refreshToken = await this.createRefreshToken(oauthUser.identifier);

    await this.userService.updateOrCreateToken(user.id, refreshToken);

    return {
      accessToken: accessToken,
      expiresIn: await this.getTokenExpirationTime(),
      refreshToken: refreshToken,
    }

  }

  async createAccessToken(identifier: string): Promise<string> {
    console.log("accessToken 생성")
    return await this.jwtService.signAsync(
      {
        identifier
      }, {
        secret: 'accessToken',
        expiresIn: '1h'
      })
  }

  async createRefreshToken(identifier: string): Promise<string> {
    console.log()
    return await this.jwtService.signAsync({
      identifier,
    }, {
      secret: 'refreshToken'
    })
  }

  async getTokenExpirationTime(): Promise<number> {
    return DateTime.now()
      .plus({milliseconds: 3600000})
      .toMillis();
  }

  async getOauthUserData(
    provider: string,
    token: string
  ): Promise<OauthUserDto | null> {
    return await this.getGoogleOauthUser(token);
  }

  async getGoogleOauthUser(
    token: string,
  ): Promise<OauthUserDto | null> {
    const profile = await this.googleClient.getTokenInfo(token);
    if (profile.sub == null) return null;

    return {
      provider: 'google',
      identifier: profile.sub,
      email: profile.email,
      name: "학생",
    }
  }

  async getIdentifierFormRefreshToken(token: string): Promise<string | null> {
    try {
      const data = await this.jwtService.verifyAsync<TokenDto>(token, {
        secret: 'refreshToken'
      });

      return data.identifier;
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  async verifyRefreshToken(
    hash: string,
    refreshToken: string,
  ): Promise<boolean> {
    return await verify(hash, refreshToken);
  }

}
