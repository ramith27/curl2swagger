import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DatabaseModule } from './database/database.module';
import { EventsModule } from './events/events.module';
import { AuthModule } from './auth/auth.module';
import { CaptureModule } from './capture/capture.module';
import { SpecModule } from './spec/spec.module';
import { ProjectModule } from './project/project.module';
import { QualityModule } from './quality/quality.module';
import { QueueModule } from './queue/queue.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    DatabaseModule,
    EventsModule,
    AuthModule,
    CaptureModule,
    SpecModule,
    ProjectModule,
    QualityModule,
    QueueModule,
  ],
})
export class AppModule {}
