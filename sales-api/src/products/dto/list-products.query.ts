import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBooleanString, IsInt, IsOptional, IsString, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export class ListProductsQueryDto {
    @ApiPropertyOptional({ description: 'Busca por nome (contém)' })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiPropertyOptional({ description: 'Filtra por SKU exato' })
    @IsOptional()
    @IsString()
    sku?: string;

    @ApiPropertyOptional({ description: 'true/false' })
    @IsOptional()
    @IsBooleanString()
    isActive?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    page?: number = 1;

    @ApiPropertyOptional({ default: 10, maximum: 100 })
    @IsOptional()
    @Type(() => Number)
    @IsInt()
    @Min(1)
    @Max(100)
    perPage?: number = 10;

    @ApiPropertyOptional({ description: 'name|price|createdAt', default: 'createdAt' })
    @IsOptional()
    @IsString()
    sortBy?: 'name' | 'price' | 'createdAt' = 'createdAt';

    @ApiPropertyOptional({ description: 'asc|desc', default: 'desc' })
    @IsOptional()
    @IsString()
    order?: 'asc' | 'desc' = 'desc';
}
