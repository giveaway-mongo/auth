import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  RpcExceptionFilter,
} from '@nestjs/common';
import { RpcException } from '@nestjs/microservices';
import { Observable, of, throwError } from 'rxjs';
import { Response } from 'express';

@Catch(RpcException)
export class MyRpcExceptionFilter implements RpcExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('my message', exception.getError());

    return throwError(() => exception.getError());
  }
}

@Catch()
export class MyExceptionFilter implements ExceptionFilter {
  catch(exception: RpcException, host: ArgumentsHost) {
    console.log('CAUGHT!', exception.getError());

    return of({
      errors: [
        {
          location: ['12'],
          message: 'hello',
          type: 'my type',
          nonFieldErrors: ['hello a'],
        },
      ],
    });
  }
}
