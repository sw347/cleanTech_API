import {
  Controller,
  UseGuards,
  Get,
  Req,
  Res,
  HttpStatus,
  Post,
  Body,
  UnauthorizedException,
  InternalServerErrorException
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { GoogleAuthGuard } from "./google/google.guard";
import { User } from "../user/decorator/user.decorator";
import { OauthUserDto } from "./dto/oauth-user.dto";
import { Response } from "express";
import { AppAuthDto } from "./dto/app-auth.dto";
import { LoginDto } from "./dto/login.dto";
import { Token } from "./decorator/token.decorator";
import { AccessTokenDto } from "./dto/access-token";
import { UserService } from "../user/user.service";
import { LoginException } from "./exception/login.exception";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService
  ) {
  }

  /**
   * 앱 로그인
   *
   * @param body oauth시 필요한 데이터
   * @returns access, refresh, token
   *
   * @tag auth
   */
  @Post("/app")
  async authApp(@Body() body: AppAuthDto): Promise<LoginDto> {
    const oauthUser = await this.authService.getOauthUserData(
      body.provider,
      body.token
    );

    if (oauthUser == null)
      throw new UnauthorizedException("cannot get oauth data");

    const { accessToken, expiresIn, refreshToken } =
      await this.authService.login(oauthUser);

    return {
      accessToken,
      expiresIn,
      refreshToken
    };
  }

  /**
   * access token 재발급
   *
   * @returns access token
   *
   * @security bearer
   */
  @Post("/token")
  async createToken(@Token() token?: string): Promise<AccessTokenDto> {
    if (token == null) throw new UnauthorizedException("token not found");

    const identifier =
      await this.authService.getIdentifierFormRefreshToken(token);
    if (identifier == null) throw new UnauthorizedException("invalid token");

    const hashedRefreshToken =
      await this.userService.findUserRefreshTokenByIdentifier(identifier);
    if (hashedRefreshToken == null)
      throw new UnauthorizedException("token not found");

    const isValidRefreshToken = await this.authService.verifyRefreshToken(
      hashedRefreshToken,
      token,
    );
    if (!isValidRefreshToken) throw new UnauthorizedException('invalid token');

    const accessToken = await this.authService.createAccessToken(identifier);

    return {
      token: accessToken,
      expiresIn: await this.authService.getTokenExpirationTime(),
    };
  }

  @UseGuards(GoogleAuthGuard)
  @Get("/google")
  async auth() {
    return HttpStatus.OK;
  }

  @UseGuards(GoogleAuthGuard)
  @Get("/google/callback")
  async authCallback(
    @User() user: OauthUserDto,
    @Res() response: Response
  ): Promise<void> {
    try {
      const { accessToken, refreshToken } = await this.authService.login(user);

      response.cookie('accessToken', accessToken, {
        maxAge: 3600000,
      });

      response.cookie('refreshToken', refreshToken);

      response.redirect('http://localhost:3124/main'!);

    } catch (error) {
      console.log(error);

      if (error instanceof LoginException) {
        throw new InternalServerErrorException('login Failed');
      } else {
        throw new InternalServerErrorException();
      }

    }
  }

}
