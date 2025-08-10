import {
    Injectable,
    ExecutionContext,
    UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

/**
 * Standard guard: request is rejected with 401
 * unless a valid JWT is provided.
 */
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
    // Override to throw explicit 401 when user == undefined
    handleRequest(err: any, user: any) {
        if (err || !user) {
            console.error('[JWT GUARD]', { errName: err?.name, errMsg: err?.message });
            throw err || new UnauthorizedException('Invalid or missing token');
        }
        return user;
    }
}
