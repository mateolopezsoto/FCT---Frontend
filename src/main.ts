// src/main.ts
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import { HTTP_INTERCEPTORS, HttpRequest, HttpHandlerFn} from '@angular/common/http';

bootstrapApplication(AppComponent, {
  providers: [
    ...appConfig.providers,

    // INTERCEPTOR NUEVO: Bearer Token (esto es lo que usan las APIs profesionales)
    {
      provide: HTTP_INTERCEPTORS,
      useClass: class {
        intercept(req: HttpRequest<any>, next: HttpHandlerFn) {
          const token = localStorage.getItem('token');
          if (token) {
            req = req.clone({
              setHeaders: {
                Authorization: `Bearer ${token}`
              }
            });
          }
          return next(req);
        }
      },
      multi: true
    }
  ]
})
  .catch(err => console.error(err));