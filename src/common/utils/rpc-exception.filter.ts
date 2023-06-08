import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, throwError } from 'rxjs';
import { Response } from 'express';

@Catch(RpcException)
export class MyRpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('message', exception.getError());

    return throwError(() => ({
      error: exception.getError(),
    }));
  }
}

@Catch()
export class MyExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    console.log('CAUGHT!');

    const response = host.switchToHttp().getResponse<Response>();

    response.status(500).json({ hello: 'world123' });
  }
}
