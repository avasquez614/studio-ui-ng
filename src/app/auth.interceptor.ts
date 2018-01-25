import { Injectable } from '@angular/core';
import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { catchError, filter, switchMap, take } from 'rxjs/operators';
import { NgRedux } from '@angular-redux/store';
import { AppState } from './classes/app-state.interface';
import { UserActions } from './actions/user.actions';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private store: NgRedux<AppState>) {

  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request)
      .pipe(
        catchError((error, caught) => {
          if (error instanceof HttpErrorResponse) {
            if (error.status === 401) {
              this.store.dispatch(UserActions.timeout());
              return this.store.select('auth')
                .pipe(
                  filter(auth => auth === 'validated'),
                  take(1),
                  switchMap(() => caught)
                );
            }
          }
          return Observable.of(error);
        })
      );
  }

}
