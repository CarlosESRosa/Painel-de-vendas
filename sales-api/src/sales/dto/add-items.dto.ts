import { ApiProperty } from '@nestjs/swagger';
import { IsArray, ArrayNotEmpty, ValidateNested, IsUUID, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

class ItemInput {
    @ApiProperty({ format: 'uuid' })
    @IsUUID()
    productId: string;

    @ApiProperty({ minimum: 1, default: 1 })
    @IsInt()
    @Min(1)
    quantity: number;
}

export class AddItemsDto {
    @ApiProperty({ type: [ItemInput] })
    @IsArray()
    @ArrayNotEmpty()
    @ValidateNested({ each: true })
    @Type(() => ItemInput)
    items: ItemInput[];
}
