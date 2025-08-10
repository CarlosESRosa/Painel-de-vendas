import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, IsDecimal } from 'class-validator';

export class CreateSellerDto {
    @ApiProperty() @IsString() @MinLength(2)
    name: string;

    @ApiProperty() @IsEmail()
    email: string;

    @ApiProperty() @IsString() @MinLength(6)
    password: string;

    @ApiProperty({ example: '0.05', required: false })
    @IsOptional() @IsDecimal()
    commissionPercent?: string;
}
