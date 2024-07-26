import { NestFactory } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  const config = new DocumentBuilder()
    .setTitle('Currency Exchange API')
    .setDescription('The Currency Exchange API description')
    .setVersion('1.0')
    .addTag('exchange')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3000);
}

bootstrap();
