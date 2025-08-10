import { Body, Controller, Get, HttpCode, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { JwtAuthGuard } from './jwt-auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
    constructor(private auth: AuthService) { }

    @Post('signin')
    @HttpCode(200)
    @ApiOperation({ summary: 'Login and receive JWT' })
    @ApiResponse({
        status: 200,
        description: 'User logged in successfully. Returns a JWT access token.',
        schema: { example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' } },
    })
    signIn(@Body() dto: SignInDto) {
        return this.auth.signIn(dto);
    }

    @Get('me')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth('jwt')
    @ApiOperation({ summary: 'Get current authenticated user profile' })
    @ApiResponse({
        status: 200,
        description: 'Returns the authenticated user profile.',
        schema: {
            example: {
                id: 'uuid',
                name: 'Admin',
                email: 'admin@painel.dev',
                role: 'ADMIN',
                status: 'ACTIVE',
            },
        },
    })
    me(@CurrentUser('sub') userId: string) {
        return this.auth.getMe(userId);
    }
}
