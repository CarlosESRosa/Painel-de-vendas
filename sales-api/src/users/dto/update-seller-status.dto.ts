import { ApiProperty } from '@nestjs/swagger';
import { IsEnum } from 'class-validator';

export enum UserStatusDTO { ACTIVE = 'ACTIVE', INACTIVE = 'INACTIVE' }

export class UpdateSellerStatusDto {
    @ApiProperty({ enum: UserStatusDTO })
    @IsEnum(UserStatusDTO)
    status: UserStatusDTO;
}
