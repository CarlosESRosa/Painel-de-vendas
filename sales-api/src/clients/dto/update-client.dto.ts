import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class UpdateClientDto {
    @ApiPropertyOptional() @IsOptional() @IsString() @MinLength(2) name?: string;

    @ApiPropertyOptional({ example: '123.456.789-09' })
    @IsOptional()
    @IsString()
    @Matches(/^\d{11}$|^\d{3}\.\d{3}\.\d{3}\-\d{2}$/)
    cpf?: string; // só admin deveria alterar na prática

    @ApiPropertyOptional() @IsOptional() @IsEmail() email?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() phone?: string;

    @ApiPropertyOptional() @IsOptional() @IsString() cep?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() city?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() neighborhood?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() street?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() number?: string;
    @ApiPropertyOptional() @IsOptional() @IsString() state?: string;
}
