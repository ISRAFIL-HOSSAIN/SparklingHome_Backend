import { Catch, Provider, type ArgumentsHost } from "@nestjs/common";
import { APP_FILTER, BaseExceptionFilter } from "@nestjs/core";
import * as Sentry from "@sentry/node";

@Catch()
class SentryExceptionFilter extends BaseExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const request = host.switchToHttp()?.getRequest();

    Sentry.withScope((scope) => {
      if (request) {
        scope.setExtra("request", {
          url: request.url,
          method: request.method,
          headers: request.headers,
          body: request.body,
          params: request.params,
        });

        if (request?.user?.userId) {
          scope.setUser({ id: request.user.userId });
        }
      }

      Sentry.captureException(exception);
    });

    super.catch(exception, host);
  }
}

export const SentryExceptionFilterProvider: Provider = {
  provide: APP_FILTER,
  useClass: SentryExceptionFilter,
};
