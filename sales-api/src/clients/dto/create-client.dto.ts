import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class CreateClientDto {
    @ApiProperty() @IsString() @MinLength(2) name: string;

    // aceita 000.000.000-00 OU 00000000000
    @ApiProperty({ example: '123.456.789-09' })
    @IsString()
    @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}\-\d{2}$/, { message: 'CPF inválido (use 000.000.000-00 ou 00000000000)' })
    cpf: string;

    @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

    @ApiPropertyOptional() @IsOptional() @IsString() cep?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() neighborhood?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() number?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
}
