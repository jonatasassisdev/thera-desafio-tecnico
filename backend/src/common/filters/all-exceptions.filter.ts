import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const { status, message } = this.resolve(exception);

    if (status >= HttpStatus.INTERNAL_SERVER_ERROR) {
      this.logger.error(
        `${request.method} ${request.url} -> ${status}`,
        exception instanceof Error ? exception.stack : undefined,
      );
    }

    response.status(status).json({
      statusCode: status,
      message,
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }

  private resolve(exception: unknown): { status: number; message: string | string[] } {
    if (exception instanceof HttpException) {
      const body = exception.getResponse();
      const message =
        typeof body === 'string' ? body : ((body as { message?: string | string[] }).message ?? exception.message);
      return { status: exception.getStatus(), message };
    }

    if (exception instanceof Prisma.PrismaClientKnownRequestError) {
      switch (exception.code) {
        case 'P2002':
          return {
            status: HttpStatus.CONFLICT,
            message: `Duplicate value for field(s): ${(exception.meta?.target as string[])?.join(', ')}`,
          };
        case 'P2025':
          return { status: HttpStatus.NOT_FOUND, message: 'Record not found.' };
        case 'P2003':
          return {
            status: HttpStatus.CONFLICT,
            message:
              'Invalid reference: the related entity does not exist, or this record is still referenced by other data and cannot be removed.',
          };
        default:
          return { status: HttpStatus.BAD_REQUEST, message: 'Error processing database request.' };
      }
    }

    return { status: HttpStatus.INTERNAL_SERVER_ERROR, message: 'Internal server error.' };
  }
}
