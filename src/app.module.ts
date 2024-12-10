import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { AuthModule } from "./auth/auth.module";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from "./user/user.module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { SocialLoginEntity } from "./user/entity/social-login.entity";
import { UserEntity } from "./user/entity/user.entity";
import { UserTokenEntity } from "./user/entity/user-token.entity";
import { UserProfileEntity } from "./user/entity/user-profile.entity";
import { CleanModule } from "./clean/clean.module";
import { CleanEntity } from "./clean/entity/clean.entity";
import * as process from "process";
import { join } from "path";
import config from "./common/config/config";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [config],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: "mysql",
        host: configService.get('db.host'),
        port: configService.get<number>('db.port'),
        username: configService.get('db.username'),
        password: configService.get('db.password'),
        database: configService.get('db.database'),
        entities: [
          SocialLoginEntity,
          UserEntity,
          UserTokenEntity,
          UserProfileEntity,
          CleanEntity
        ],
        synchronize: configService.get<boolean>('db.sync'),
      }),
      inject: [ConfigService]
    }),
    AuthModule,
    UserModule,
    CleanModule
  ],
  controllers: [AppController],
  providers: [AppService]
})

export class AppModule {
}
