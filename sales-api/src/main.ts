import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Painel de Vendas API')
    .setDescription('REST API docs')
    .setVersion('1.0')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',       // <-- tells Swagger to prepend “Bearer ”
        bearerFormat: 'JWT',    // <-- just for UI display
        name: 'Authorization',
        in: 'header',
      },
      'jwt',                    // <-- the SECURITY NAME (any string, but keep it!)
    )
    .build();

  const doc = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, doc);

  await app.listen(3000);
}
bootstrap();
