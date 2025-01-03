import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as morgan from "morgan";
import * as compression from "compression";
import * as cors from "cors";
import helmet from "helmet";
import { config as DotenvConfig } from "dotenv";
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AllExceptionsFilter } from './libs/exception-filters/all-exceptions.filter';
import * as fileUpload from "express-fileupload";
import * as express from "express";
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const { httpAdapter } = app.get(HttpAdapterHost);

  const config = new DocumentBuilder()
    .setTitle('pokemon-app')
    .setDescription('Pokemon-app server side API description')
    .setVersion('0.1')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  DotenvConfig();

  app.useGlobalPipes(
    new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true })
  );
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.use(fileUpload({
    useTempFiles: true,
    tempFileDir: '/tmp/'
  }));
  app.use(morgan("dev"));
  app.use(cors())
  app.use(compression());
  app.use(helmet());
  app.use("/static/pokemon", express.static(join(__dirname, '..', 'uploads', 'pokemon')))

  await app.listen(process.env['PORT'] ?? 3000,
    () => {
      console.log(`Server is listening in http://localhost:${process.env['PORT']}`);
    }
  );
}
bootstrap();
