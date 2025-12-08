import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class GoogleLoginDto {
    @ApiProperty({
        description: 'Token de ID de Google obtenido en el frontend',
        example: 'eyJhbGciOiJSUzI1NiIsImtpZCI6IjZm...',
    })
    @IsString()
    @IsNotEmpty()
    token: string;
}
