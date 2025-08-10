import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller'; // se você ainda usa /users/:email
import { SellersController } from './sellers.controller';
import { RolesGuard } from '../auth/roles.guard';

@Module({
  providers: [UsersService, RolesGuard],
  controllers: [UsersController, SellersController],
  exports: [UsersService],
})
export class UsersModule { }
