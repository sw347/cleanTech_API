import { forwardRef, Module } from "@nestjs/common";
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserEntity } from "./entity/user.entity";
import { SocialLoginEntity } from "./entity/social-login.entity";
import { UserTokenEntity } from "./entity/user-token.entity";
import { UserProfileEntity } from "./entity/user-profile.entity";
import { AuthService } from "../auth/auth.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      UserEntity,
      SocialLoginEntity,
      UserTokenEntity,
      UserProfileEntity,
    ]),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService],
  exports: [UserService],
})
export class UserModule {}
