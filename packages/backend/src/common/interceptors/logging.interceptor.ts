import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Request, Response } from 'express'

interface RequestWithUser extends Request {
  user?: {
    id: string
  }
}

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name)

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp()
    const request = ctx.getRequest<RequestWithUser>()
    const response = ctx.getResponse<Response>()
    const { method, originalUrl, ip } = request
    const userAgent = request.get('user-agent') || ''
    const user = request.user?.id || 'anonymous'

    const now = Date.now()

    return next.handle().pipe(
      tap({
        next: () => {
          const { statusCode } = response
          const delay = Date.now() - now
          this.logger.log(
            `${method} ${originalUrl} ${statusCode} - ${delay}ms - ${ip} - User: ${user} - ${userAgent}`,
          )
        },
        error: (error: unknown) => {
          const delay = Date.now() - now
          let status = HttpStatus.INTERNAL_SERVER_ERROR

          if (error instanceof HttpException) {
            status = error.getStatus()
          }

          const errorMessage =
            error instanceof Error ? error.message : String(error)

          this.logger.error(
            `${method} ${originalUrl} ${status} - ${delay}ms - ${ip} - User: ${user} - ${userAgent} - Error: ${errorMessage}`,
          )
        },
      }),
    )
  }
}
