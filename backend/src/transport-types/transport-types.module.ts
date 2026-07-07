import { Module } from '@nestjs/common';
import { TransportTypesService } from './transport-types.service';
import { TransportTypesController } from './transport-types.controller';

@Module({
  controllers: [TransportTypesController],
  providers: [TransportTypesService],
  exports: [TransportTypesService],
})
export class TransportTypesModule {}
