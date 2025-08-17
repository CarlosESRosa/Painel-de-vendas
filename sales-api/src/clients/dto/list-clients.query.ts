import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListClientsQueryDto {
    @ApiPropertyOptional({ description: 'Busca por nome (contém)' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ description: 'Filtro por CPF (parcial ou completo)' })
    @IsOptional()
    @IsString()
    cpf?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 15, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    perPage?: number = 15;

    @ApiPropertyOptional({ description: 'name|createdAt', default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'createdAt' = 'createdAt';

    @ApiPropertyOptional({ description: 'asc|desc', default: 'desc' })
    @IsOptional()
    @IsString()
    order?: 'asc' | 'desc' = 'desc';
}
