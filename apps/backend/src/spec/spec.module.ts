import { Module, forwardRef } from '@nestjs/common';
import { SpecService } from './spec.service';
import { SpecController } from './spec.controller';
import { DatabaseModule } from '../database/database.module';
import { QueueModule } from '../queue/queue.module';

@Module({
  imports: [DatabaseModule, forwardRef(() => QueueModule)],
  controllers: [SpecController],
  providers: [SpecService],
  exports: [SpecService],
})
export class SpecModule {}
