import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { ConfigModule, ConfigService } from "@nestjs/config";
import { UserModule } from './user/user.module';
import { TypeOrmModule } from "@nestjs/typeorm";
import { SocialLoginEntity } from "./user/entity/social-login.entity";
import { UserEntity } from "./user/entity/user.entity";
import { UserTokenEntity } from "./user/entity/user-token.entity";
import { UserProfileEntity } from "./user/entity/user-profile.entity";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: 'localhost',
        port: 3306,
        username: 'root',
        password: 'sw070403',
        database: 'main',
        entities: [
          SocialLoginEntity,
          UserEntity,
          UserTokenEntity,
          UserProfileEntity,
        ],
        synchronize: false,
      }),
      inject: [ConfigService],
    }),
    AuthModule,
    UserModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
