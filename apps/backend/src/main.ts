import { NestFactory } from '@nestjs/core';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Enable CORS with dynamic origin support
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3002', 
    'http://192.168.3.72:3000',
    'http://192.168.3.72:3002',
    process.env.FRONTEND_URL
  ].filter(Boolean);

  app.enableCors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin) return callback(null, true);
      
      // Check if origin is in allowed list or matches localhost/192.168 pattern
      if (allowedOrigins.includes(origin) || 
          origin.match(/^http:\/\/(localhost|127\.0\.0\.1|192\.168\.\d+\.\d+):(3000|3002)$/)) {
        return callback(null, true);
      }
      
      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
  });

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
    }),
  );

  // Swagger setup
  const config = new DocumentBuilder()
    .setTitle('curl2swagger API')
    .setDescription('Convert cURL commands to OpenAPI specifications')
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  const port = process.env.BACKEND_PORT || 3003;
  await app.listen(port);
  
  console.log(`🚀 Backend running on http://localhost:${port}`);
  console.log(`📖 Swagger docs available at http://localhost:${port}/api/docs`);
}

bootstrap();
