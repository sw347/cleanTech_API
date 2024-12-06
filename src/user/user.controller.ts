import { Controller, Get, UseGuards, Headers, UnauthorizedException } from "@nestjs/common";
import { UserService } from './user.service';
import { JwtAuthGuard } from "../auth/guard/jwt.guard";
import { AuthService } from "../auth/auth.service";
import { User } from "./decorator/user.decorator";
import { UserEntity } from "./entity/user.entity";
import { UserProfileDto } from "./dto/user-profile.dto";

@Controller('user')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly authService: AuthService
  ) {}

  @Get('/profile')
  @UseGuards(JwtAuthGuard)
  async getUserProfile (@User() user: UserEntity): Promise<UserProfileDto> {
    // console.log(user.id);
    // console.log(user.name);
    // console.log(user.profileId);
    // console.log(user.createdAt);
    // console.log(user.role);

    return {
      id: user.id,
      name: user.name,
      profileUrl: 'null',
      createdAt: user.createdAt,
      role: user.role
    }
  }
}
