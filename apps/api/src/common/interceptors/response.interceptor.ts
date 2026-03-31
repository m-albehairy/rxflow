import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

export interface ResponseEnvelope<T> {
  success: boolean;
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  timestamp: string;
  lang: string;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ResponseEnvelope<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ResponseEnvelope<T>> {
    const request = context.switchToHttp().getRequest();
    const lang = request.headers['accept-language']?.startsWith('ar') ? 'ar' : 'en';

    return next.handle().pipe(
      map((result) => {
        // If result already has data + meta (paginated), unwrap
        if (result && typeof result === 'object' && 'data' in result && 'meta' in result) {
          return {
            success: true,
            data: result.data,
            meta: result.meta,
            timestamp: new Date().toISOString(),
            lang,
          };
        }

        return {
          success: true,
          data: result,
          timestamp: new Date().toISOString(),
          lang,
        };
      }),
    );
  }
}
