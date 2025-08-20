import { Body, Controller, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { SalesService } from './sales.service';
import { CreateSaleDto } from './dto/create-sale.dto';
import { AddItemsDto } from './dto/add-items.dto';
import { PaySaleDto } from './dto/pay-sale.dto';
import { ListSalesQueryDto } from './dto/list-sales.query';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { PaymentStatus } from '@prisma/client';

@ApiTags('sales')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SELLER')
@Controller('sales')
export class SalesController {
    constructor(private service: SalesService) { }

    @Post()
    @ApiOperation({ summary: 'Etapa 1: criar venda (PENDING)' })
    create(
        @CurrentUser() user: any,
        @Body() dto: CreateSaleDto,
    ) {
        return this.service.create(user.sub, dto);
    }

    @Patch(':id/items')
    @ApiOperation({ summary: 'Etapa 2: adicionar/substituir itens da venda' })
    replaceItems(
        @CurrentUser() user: any,
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: AddItemsDto,
    ) {
        return this.service.replaceItems(id, user.sub, dto.items);
    }

    @Patch(':id/pay')
    @ApiOperation({ summary: 'Etapa 3: registrar pagamento (muda para PAID)' })
    pay(
        @Param('id', new ParseUUIDPipe()) id: string,
        @Body() dto: PaySaleDto,
    ) {
        return this.service.pay(id, dto);
    }

    @Get(':id')
    @ApiOperation({ summary: 'Etapa 4 (detalhe): obter venda por id (com itens)' })
    getById(
        @CurrentUser() user: any,
        @Param('id', new ParseUUIDPipe()) id: string,
    ) {
        return this.service.getById(id, { id: user.sub, role: user.role });
    }

    @Get()
    @ApiOperation({ summary: 'Listar vendas (filtros e paginação). Seller vê só as próprias.' })
    list(@CurrentUser() user: any, @Query() q: ListSalesQueryDto) {
        return this.service.list({
            requester: { id: user.sub, role: user.role },
            q: q.q,
            clientId: q.clientId,
            paymentStatus: q.paymentStatus as PaymentStatus,
            start: q.start,
            end: q.end,
            page: q.page ?? 1,
            perPage: q.perPage ?? 15,
            sortBy: q.sortBy ?? 'date',
            order: q.order ?? 'desc',
        });
    }

    @Get('counts/status')
    @ApiOperation({ summary: 'Obter contadores de status de vendas (precisos, sem paginação)' })
    getStatusCounts(@CurrentUser() user: any, @Query() q: ListSalesQueryDto) {
        return this.service.getStatusCounts({
            requester: { id: user.sub, role: user.role },
            q: q.q,
            clientId: q.clientId,
            start: q.start,
            end: q.end,
        });
    }
}
