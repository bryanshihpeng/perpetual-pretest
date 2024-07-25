import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import * as path from 'path';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.enableCors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    preflightContinue: false,
    optionsSuccessStatus: 204,
  });
  app.useWebSocketAdapter(new IoAdapter(app));
  app.useStaticAssets(
    path.join(__dirname, '..', 'src', 'interfaces', 'http', 'client', 'build'),
    { prefix: '/' },
  );
  await app.listen(3000);
}

bootstrap();
