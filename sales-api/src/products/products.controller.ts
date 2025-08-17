import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { ListProductsQueryDto } from './dto/list-products.query';

@ApiTags('products')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN')
@Controller('products')
export class ProductsController {
    constructor(private service: ProductsService) { }

    @Post()
    @ApiOperation({ summary: 'Create product (ADMIN)' })
    @ApiResponse({ status: 201, description: 'Product created' })
    create(@Body() dto: CreateProductDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'List products (filter + pagination) (ADMIN)' })
    list(@Query() q: ListProductsQueryDto) {
        return this.service.list({
            q: q.q,
            sku: q.sku,
            isActive: q.isActive,
            page: q.page ?? 1,
            perPage: q.perPage ?? 10,
            sortBy: q.sortBy ?? 'createdAt',
            order: q.order ?? 'desc',
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Get product by id (ADMIN)' })
    get(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.get(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Update product (ADMIN)' })
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateProductDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Delete product (ADMIN) — para produção, prefira isActive=false' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.remove(id);
    }
}
