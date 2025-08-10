import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UsersService } from './users.service';
import { CreateSellerDto } from './dto/create-seller.dto';
import { UpdateSellerDto } from './dto/update-seller.dto';
import { UpdateSellerStatusDto } from './dto/update-seller-status.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';

@ApiTags('sellers')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('sellers')
export class SellersController {
    constructor(private users: UsersService) { }

    @Post()
    @ApiOperation({ summary: 'Create seller (ADMIN)' })
    @ApiResponse({ status: 201, description: 'Seller created' })
    create(@Body() dto: CreateSellerDto) {
        return this.users.createSeller(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List sellers (ADMIN)' })
    list() {
        return this.users.listSellers();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get seller by id (ADMIN)' })
    getOne(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.users.getSellerById(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update seller (ADMIN)' })
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateSellerDto) {
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
