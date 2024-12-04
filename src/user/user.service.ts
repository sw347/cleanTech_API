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

@Injectable()
export class UserService {

  @InjectDataSource()
  private readonly dataSource: DataSource;
  @InjectRepository(UserEntity)
  private readonly userRepo: Repository<UserEntity>;
  @InjectRepository(UserTokenEntity)
  private readonly userTokenRepo: Repository<UserTokenEntity>;
  @InjectRepository(UserProfileEntity)
  private readonly userProfileRepo: Repository<UserProfileEntity>;

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
    console.log('oauthUser 이름: ', oauthUser.name);
    console.log('oauthUser 이메일: ', oauthUser.email);
    console.log('oauthUser 식별자: ', oauthUser.identifier);
    console.log('oauthUser 프로바이더: ', oauthUser.provider);

    const now = DateTime.now().setZone('Asia/Seoul').toMillis();

    const qr = this.dataSource.createQueryRunner();
    await qr.connect();
    await qr.startTransaction();

    let userId = 0;
    let role = null;

    try {

      if (oauthUser.email.startsWith("sdh")) {
        role = "stu";
      } else {
        role = "tea";
      }

      const result = await qr.manager.insert(UserEntity, {
        name: oauthUser.name,
        email: oauthUser.email,
        createdAt: now,
        updatedAt: now,
        role: role,
        profileId: 1,
      });


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

    return this.userRepo.create({
      id: userId,
      name: oauthUser.name,
      email: oauthUser.email,
      createdAt: now,
      updatedAt: now,
      role: role,
    });

  }

  async findUserRefreshTokenByIdentifier(
    identifier: string
  ): Promise<string | null> {
    const userToken = await this.userTokenRepo.findOne({
      where: {
        user: { socialLogin: { identifier }, deletedAt: IsNull() },
      },
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

}
