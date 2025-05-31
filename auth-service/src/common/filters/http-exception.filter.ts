import { ExceptionFilter, Catch, ArgumentsHost, HttpException } from '@nestjs/common';
import { Response } from 'express';

@Catch(HttpException)
export class CustomHttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse();

    let message = exceptionResponse;
    if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
      message = (exceptionResponse as any).message || exceptionResponse;
    }

    response.status(status).json({
      statusCode: status,
      message,
    });
  }
} 