import { Injectable, UnauthorizedException } from "@nestjs/common";
import { OAuth2Client } from "google-auth-library";
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
    private readonly jwtService: JwtService
  ) {
    this.googleClient = new OAuth2Client({
      clientId: process.env.GOOGLE_CLIENT_ID
    });
  }

  async login(oauthUser: OauthUserDto): Promise<LoginDto> {
    let user = await this.userService.findUserByIdentifier(
      oauthUser.identifier,
      true
    );

    if (user == null) {
      await this.userService.createUser(oauthUser);
      console.log(oauthUser.name, " 계정 생성");
      user = await this.userService.findUserByIdentifier(oauthUser.identifier);
    }

    if (user == null) throw new LoginException("cannot find user");

    if (user.deletedAt != null) {
      await this.userService.restore(user.id);
    }

    const accessToken = await this.createAccessToken(oauthUser.identifier);
    const refreshToken = await this.createRefreshToken(oauthUser.identifier);

    console.log(user.id)
    await this.userService.updateOrCreateToken(user.id, refreshToken);

    return {
      accessToken: accessToken,
      expiresIn: await this.getTokenExpirationTime(),
      refreshToken: refreshToken
    };

  }

  async createAccessToken(identifier: string): Promise<string> {
    console.log("accessToken 생성");

    console.log('액세스 identifier: ', identifier);

    return await this.jwtService.signAsync(
      {
        identifier
      }, {
        expiresIn: '1h',
        secret: process.env.SECRET_KEY, algorithm: "HS256"
      });
  }

  async createRefreshToken(identifier: string): Promise<string> {
    console.log("refreshToken 생성");

    console.log('리프레쉬 identifier: ', identifier);

    return await this.jwtService.signAsync({
      identifier
    }, {
      secret: process.env.SECRET_KEY,
      algorithm: "HS256"
    });
  }


  async getTokenExpirationTime(): Promise<number> {
    return DateTime.now()
      .plus({ milliseconds: 3600000 })
      .toMillis();
  }

  async getOauthUserData(
    provider: string,
    token: string
  ): Promise<OauthUserDto | null> {
    const profile = await this.googleClient.getTokenInfo(token);

    if (!profile) {
      throw new UnauthorizedException("Invalid Google token");
    }

    return await this.getGoogleOauthUser(token);
  }

  async getGoogleOauthUser(
    token: string
  ): Promise<OauthUserDto | null> {

    const profile = await this.googleClient.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID, // 클라이언트 ID
    });
    // const profile = await this.googleClient.getTokenInfo(token);

    if (!profile) return null;

    const payload = profile.getPayload();


    return {
      provider: "google",
      identifier: payload.sub,
      email: payload.email,
      name: payload.name,
      profileUrl: payload.profile,
    };
  }

  async getIdentifierFormRefreshToken(token: string): Promise<string | null> {
    try {
      const data = await this.jwtService.verifyAsync<TokenDto>(token, {
        secret: process.env.SECRET_KEY
      });

      return data.identifier;
    } catch (error) {
      console.error(error);

      return null;
    }
  }

  async verifyRefreshToken(
    hash: string,
    refreshToken: string
  ): Promise<boolean> {
    return await verify(hash, refreshToken);
  }

  async validateToken(accessToken: string) {
    try {
      // console.log(authToken)

      const payload = this.jwtService.verify(accessToken, {
        secret: process.env.SECRET_KEY,  // JWT 비밀키로 검증
        algorithms: ['HS256'],
      });

      console.log(payload)
      const userId = payload.userId;

      // userId로 유저 데이터 조회
      const user = await this.userService.findOneById(userId);

      return user;

    } catch (err) {
      console.error("JWT Verification Error:", err);
      throw new UnauthorizedException("Invalid JWT token");

    }
  }

}
