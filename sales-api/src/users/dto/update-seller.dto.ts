import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsDecimal } from 'class-validator';

export class UpdateSellerDto {
    @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2)
    name?: string;

    @ApiPropertyOptional() @IsOptional() @IsEmail()
    email?: string;

    @ApiPropertyOptional({ description: 'nova senha' })
    @IsOptional() @IsString() @MinLength(6)
    password?: string;

    @ApiPropertyOptional({ example: '0.07' })
    @IsOptional() @IsDecimal()
    commissionPercent?: string;
}
