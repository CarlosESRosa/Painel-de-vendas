import { ApiProperty } from '@nestjs/swagger';
import { IsDecimal, IsString, MinLength } from 'class-validator';

export class CreateProductDto {
    @ApiProperty({ example: 'Monitor 27" IPS 75Hz' })
    @IsString()
    @MinLength(2)
    name: string;

    @ApiProperty({ example: 'MON-27IPS-001' })
    @IsString()
    @MinLength(3)
    sku: string;

    // Envie como string: '1199.90'
    @ApiProperty({ example: '1199.90', description: 'Preço como string decimal' })
    @IsDecimal()
    price: string;
}
