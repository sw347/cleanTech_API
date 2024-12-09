import { forwardRef, Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { GoogleStrategy } from "./google/google-strategy";
import { PassportModule } from "@nestjs/passport";
import { UserModule } from "../user/user.module";
import { JwtModule } from "@nestjs/jwt";
import { JwtStrategy } from "./strategy/JwtStrategy";

@Module({
  imports: [
    JwtModule.register({
      global: true
    }),
    PassportModule.register({}),
    UserModule
  ],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, JwtStrategy],
  exports: [AuthService]
})

export class AuthModule {}
