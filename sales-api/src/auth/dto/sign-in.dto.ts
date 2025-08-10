import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString } from 'class-validator';

export class SignInDto {
    @ApiProperty({ example: 'admin@painel.dev' }) @IsEmail() email: string;
    @ApiProperty({ example: 'admin123' }) @IsString() password: string;
}
