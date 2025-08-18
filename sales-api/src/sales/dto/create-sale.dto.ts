import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsUUID, IsOptional } from 'class-validator';

export class CreateSaleDto {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    clientId: string;

    @ApiPropertyOptional({ description: 'Observações internas' })
    @IsOptional()
    @IsString()
    notes?: string;
}
