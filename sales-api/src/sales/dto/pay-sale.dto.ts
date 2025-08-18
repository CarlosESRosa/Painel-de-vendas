import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsISO8601 } from 'class-validator';
import { PaymentMethod } from '@prisma/client';

export class PaySaleDto {
    @ApiProperty({ enum: PaymentMethod })
    @IsEnum(PaymentMethod)
    paymentMethod: PaymentMethod;

    @ApiProperty({ description: 'Data do pagamento (YYYY-MM-DD)' })
    @IsISO8601()
    paymentDate: string; // será transformado em Date no service
}
