import { RequestMethod, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import 'dotenv/config';
import { AppModule } from './app.module';
import { APP_NAME, NODE_ENV, PORT } from './common/constants';
import { NodeEnv } from './common/enums';
import { AllExceptionsFilter } from './common/filters';

const bootstrap = async () => {
  const app = await NestFactory.create(AppModule);

  // app.enableCors();

  app.setGlobalPrefix('api', {
    exclude: [{ path: 'healthcheck', method: RequestMethod.GET }],
  });

  app.useGlobalFilters(new AllExceptionsFilter());

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      // whitelist: true,
    }),
  );

  if (NODE_ENV !== NodeEnv.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle(APP_NAME)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api-docs', app, document);
  }

  void app.listen(PORT);
};
void bootstrap();
