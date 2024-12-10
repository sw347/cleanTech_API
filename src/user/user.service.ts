import { Injectable } from "@nestjs/common";
import { UserEntity } from "./entity/user.entity";
import { InjectDataSource, InjectRepository } from "@nestjs/typeorm";
import { DataSource, IsNull, Repository } from "typeorm";
import { OauthUserDto } from "../auth/dto/oauth-user.dto";
import { DateTime } from "luxon";
import { SocialLoginEntity } from "./entity/social-login.entity";
import { UserTokenEntity } from "./entity/user-token.entity";
import { hash } from "argon2";
import { UserProfileEntity } from "./entity/user-profile.entity";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class UserService {

  constructor(
    @InjectDataSource()
    private readonly dataSource: DataSource,
    @InjectRepository(UserEntity)
    private readonly userRepo: Repository<UserEntity>,
    @InjectRepository(UserTokenEntity)
    private readonly userTokenRepo: Repository<UserTokenEntity>,
    @InjectRepository(UserProfileEntity)
    private readonly userProfileRepo: Repository<UserProfileEntity>,
    private readonly configService: ConfigService
  ) {
  }

  async findUserByIdentifier(
    identifier: string,
    includeDeleted = false
  ): Promise<UserEntity | null> {
    return await this.userRepo.findOne({
      where: {
        socialLogin: { identifier },
        deletedAt: !includeDeleted ? IsNull() : undefined
      },
      relations: ["profile"]
    });
  }

  async createUser(oauthUser: OauthUserDto): Promise<UserEntity | null> {
    console.log("oauthUser 이름: ", oauthUser.name);
    console.log("oauthUser 이메일: ", oauthUser.email);
    console.log("oauthUser 식별자: ", oauthUser.identifier);
    console.log("oauthUser 프로바이더: ", oauthUser.provider);
    console.log("oauthUser 프로필URL: ", oauthUser.profileUrl);

    console.log(oauthUser);

    const now = DateTime.now().setZone(this.configService.get<string>("tz")).toMillis();

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    let userId = 0;
    let role = null;
    let profileId = 0;

    try {
      const existingProfile = await qr.manager.findOne(UserProfileEntity, {
        where: { name: oauthUser.name }
      });

      if (existingProfile) {
        profileId = existingProfile.id;  // 이미 있으면 해당 profileId 사용
        console.log(profileId);
      } else {
        // 없으면 새로 생성
        const newProfile = await qr.manager.insert(UserProfileEntity, {
          name: oauthUser.name,
          profileUrl: oauthUser.profileUrl, // 새로 생성되는 프로필 URL
          createdAt: now,
          updatedAt: now,
          version: 1,
          order: 1
        });
        profileId = newProfile.identifiers[0].id;
      }

      role = oauthUser.email.startsWith("sdh") ? "stu" : "tea";

      if (oauthUser.email == "sdh230310@sdh.hs.kr") {
        role = "tea";
      }

      console.log("역할: ", role);

      const result = await qr.manager.insert(UserEntity, {
        name: oauthUser.name,
        email: oauthUser.email,
        createdAt: now,
        updatedAt: now,
        role: role,
        profileId: profileId,
        profileUrl: oauthUser.profileUrl
      });

      console.log(result.identifiers[0].id);
      userId = result.identifiers[0].id;

      await qr.manager.insert(SocialLoginEntity, {
        type: oauthUser.provider,
        identifier: oauthUser.identifier,
        userId
      });

      await qr.commitTransaction();
    } catch (err) {
      await qr.rollbackTransaction();

      userId = 0;
    } finally {
      await qr.release();
    }

    if (userId === 0) return null;

    const user = this.userRepo.create({
      id: userId,
      name: oauthUser.name,
      email: oauthUser.email,
      createdAt: now,
      updatedAt: now,
      role: role,
      profileUrl: oauthUser.profileUrl
    });

    return this.userRepo.save(user);
  }

  async findUserRefreshTokenByIdentifier(
    identifier: string
  ): Promise<string | null> {
    const userToken = await this.userTokenRepo.findOne({
      where: {
        user: { socialLogin: { identifier }, deletedAt: IsNull() }
      }
    });
    if (userToken == null) return null;

    return userToken.refreshToken;

  }

  async restore(userId: number): Promise<void> {
    await this.userRepo.update({ id: userId }, { deletedAt: () => "NULL" });
  }

  async updateOrCreateToken(
    userId: number,
    refreshToken: string
  ) {
    const isTokenExists = await this.userTokenRepo.exists({
      where: { userId }
    });

    const hashedToken = await this.createHashToken(refreshToken);

    if (!isTokenExists) {
      await this.userTokenRepo.insert({ userId, refreshToken: hashedToken });
    } else {
      await this.userTokenRepo.update(
        { userId },
        { refreshToken: hashedToken }
      );
    }
  }

  async createHashToken(token: string): Promise<string> {
    return await hash(token, { raw: false });
  }

  async findOneById(userId: number) {
    console.log("너 뭔데, ", userId);

    return await this.userRepo.findOne({
      where: { id: userId },
      relations: ["profile"]
    });
  }

}
