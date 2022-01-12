import {
  BadRequestException,
  RequestMethod,
  ValidationError,
  ValidationPipe,
} from '@nestjs/common';
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
      exceptionFactory: (errors: ValidationError[]) => {
        const messages = [];
        for (const error of errors) {
          if (error.constraints) {
            messages.push({
              field: error.property,
              message: Object.values(error.constraints).join('; '),
            });
          } else {
            for (const childError of error.children) {
              if (childError.constraints) {
                messages.push({
                  field: error.property,
                  message: Object.values(childError.constraints).join('; '),
                });
              } else {
                for (const grandChildError of childError.children) {
                  messages.push({
                    field: grandChildError.property,
                    message: Object.values(grandChildError.constraints).join(
                      '; ',
                    ),
                  });
                }
              }
            }
          }
        }
        throw new BadRequestException(messages);
      },
    }),
  );

  if (NODE_ENV !== NodeEnv.PRODUCTION) {
    const config = new DocumentBuilder()
      .setTitle(APP_NAME)
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document);
  }

  await app.listen(PORT);
};
void bootstrap();
