import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { AuthService } from "../auth.service";
import { response } from "express";

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly authService: AuthService
  ) {}

  canActivate(context: ExecutionContext): boolean {
    try {
      const request = context.switchToHttp().getRequest();

      // console.log("리퀘스트: ", request);

      console.log('액세스토큰: ',request.cookies['accessToken']);

      const accessToken = request.cookies['accessToken'];

      if (!accessToken) {
        throw new UnauthorizedException('Authorization token missing');
      }

      try {
        const user = this.authService.validateToken(accessToken);

        console.log('유저: ', user);
        request.user = user;
      } catch (e) {
        throw new UnauthorizedException('Invalid token');
      }

      return true;

    } catch (e) {
      console.log("에러: ", e);
      throw new UnauthorizedException('Authorization failed');
    }

  }
}