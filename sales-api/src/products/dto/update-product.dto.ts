import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDecimal, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateProductDto {
    @ApiPropertyOptional({ example: 'Monitor 24" Full HD' })
    @IsOptional()
    @IsString()
    @MinLength(2)
    name?: string;

    @ApiPropertyOptional({ example: 'MON-24FHD-002' })
    @IsOptional()
    @IsString()
    @MinLength(3)
    sku?: string;

    @ApiPropertyOptional({ example: '999.90' })
    @IsOptional()
    @IsDecimal()
    price?: string;

    @ApiPropertyOptional({ example: true })
    @IsOptional()
    @IsBoolean()
    isActive?: boolean;
}
