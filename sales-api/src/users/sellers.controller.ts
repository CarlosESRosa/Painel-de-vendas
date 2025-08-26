import {
  Body,
  Controller,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerStatusDto } from './dto/update-seller-status.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UsersService } from './users.service';

@ApiTags('sellers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sellers')
export class SellersController {
  constructor(private users: UsersService) {}

  @Post()
  @ApiOperation({ summary: 'Create seller (ADMIN)' })
  @ApiResponse({ status: 201, description: 'Seller created' })
  create(@Body() dto: CreateSellerDto) {
    return this.users.createSeller(dto);
  }

  @Get()
  @ApiOperation({ summary: 'List sellers with pagination and search (ADMIN)' })
  list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('q') q?: string,
  ) {
    const params = {
      page: page ? parseInt(page) : undefined,
      perPage: perPage ? parseInt(perPage) : undefined,
      q,
    };
    return this.users.listSellers(params);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get seller by id (ADMIN)' })
  getOne(@Param('id', new ParseUUIDPipe()) id: string) {
    return this.users.getSellerById(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update seller (ADMIN)' })
  update(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSellerDto,
  ) {
    return this.users.updateSeller(id, dto);
  }

  @Patch(':id/status')
  @ApiOperation({ summary: 'Activate/Deactivate seller (ADMIN)' })
  updateStatus(
    @Param('id', new ParseUUIDPipe()) id: string,
    @Body() dto: UpdateSellerStatusDto,
  ) {
    return this.users.updateSellerStatus(id, dto.status);
  }
}
