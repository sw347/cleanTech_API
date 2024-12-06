import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());
  app.enableCors({
    origin: 'http://localhost:3124', // 클라이언트 URL
    credentials: true, // 쿠키 허용
  });
  await app.listen(3125);
}
bootstrap();
