import { Module, forwardRef } from '@nestjs/common';
import { QueueService } from './queue.service';
import { DatabaseModule } from '../database/database.module';
import { SpecModule } from '../spec/spec.module';
import { QualityModule } from '../quality/quality.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => SpecModule), QualityModule],
  providers: [QueueService],
  exports: [QueueService],
})
export class QueueModule {}
