import { Body, Controller, Delete, Get, Param, ParseUUIDPipe, Patch, Post, Query, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { RolesGuard } from '../auth/roles.guard';
import { ClientsService } from './clients.service';
import { CreateClientDto } from './dto/create-client.dto';
import { UpdateClientDto } from './dto/update-client.dto';
import { ListClientsQueryDto } from './dto/list-clients.query';

@ApiTags('clients')
@ApiBearerAuth('jwt')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('ADMIN', 'SELLER') // ambos podem gerenciar clientes
@Controller('clients')
export class ClientsController {
    constructor(private service: ClientsService) { }

    @Post()
    @ApiOperation({ summary: 'Criar cliente (ADMIN/SELLER)' })
    @ApiResponse({ status: 201, description: 'Cliente criado' })
    create(@Body() dto: CreateClientDto) {
        return this.service.create(dto);
    }

    @Get()
    @ApiOperation({ summary: 'Listar clientes com filtros e paginação' })
    list(@Query() q: ListClientsQueryDto) {
        return this.service.list({
            q: q.q,
            cpf: q.cpf,
            page: q.page ?? 1,
            perPage: q.perPage ?? 15,
            sortBy: q.sortBy ?? 'createdAt',
            order: q.order ?? 'desc',
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Obter cliente por id' })
    get(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.get(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Atualizar dados do cliente' })
    update(@Param('id', new ParseUUIDPipe()) id: string, @Body() dto: UpdateClientDto) {
        return this.service.update(id, dto);
    }

    @Delete(':id')
    @Roles('ADMIN') // delete só admin
    @ApiOperation({ summary: 'Excluir cliente (apenas ADMIN)' })
    remove(@Param('id', new ParseUUIDPipe()) id: string) {
        return this.service.remove(id);
    }
}
