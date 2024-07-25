import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as path from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useStaticAssets(path.join(__dirname, '..', 'src', 'interfaces', 'http', 'client', 'build'), { prefix: '/' });
  await app.listen(3000);
}
bootstrap();
