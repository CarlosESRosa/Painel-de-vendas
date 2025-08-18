import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsISO8601, IsInt, IsOptional, IsString, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { PaymentStatus } from '@prisma/client';

export class ListSalesQueryDto {
    @ApiPropertyOptional({ format: 'uuid', description: 'Filtra por clientId' })
    @IsOptional() @IsUUID() clientId?: string;

    @ApiPropertyOptional({ enum: PaymentStatus })
    @IsOptional() @IsEnum(PaymentStatus) paymentStatus?: PaymentStatus;

    @ApiPropertyOptional({ description: 'Busca por nome do cliente (contém)' })
    @IsOptional() @IsString() q?: string;

    @ApiPropertyOptional({ description: 'Data início (YYYY-MM-DD)' })
    @IsOptional() @IsISO8601() start?: string;

    @ApiPropertyOptional({ description: 'Data fim (YYYY-MM-DD)' })
    @IsOptional() @IsISO8601() end?: string;

    @ApiPropertyOptional({ default: 1 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) page?: number = 1;

    @ApiPropertyOptional({ default: 15, maximum: 100 })
    @IsOptional() @Type(() => Number) @IsInt() @Min(1) @Max(100) perPage?: number = 15;

    @ApiPropertyOptional({ default: 'date', description: 'date|createdAt' })
    @IsOptional() @IsString() sortBy?: 'date' | 'createdAt' = 'date';

    @ApiPropertyOptional({ default: 'desc', description: 'asc|desc' })
    @IsOptional() @IsString() order?: 'asc' | 'desc' = 'desc';
}
