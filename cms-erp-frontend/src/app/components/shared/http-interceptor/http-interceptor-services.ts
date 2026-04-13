import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse, HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/environments/environment.prod';

@Injectable()
export class HttpInterceptorServices implements HttpInterceptor {
  public url: string = environment.deploy_url;
  modelConsumo: any = [];

    constructor(  private http: HttpClient ){}
  count =0;
  intercept(request: HttpRequest<any>, next: HttpHandler ): Observable<HttpEvent<any>> {
    const startTime = Date.now();

    return next.handle(request).pipe(
      tap(event => {

        let xemail: any = sessionStorage.getItem('email')
        let coduser: any = sessionStorage.getItem('UserCod');
        if (event instanceof HttpResponse) {
          const endTime = Date.now();
          const duration = endTime - startTime;
          const url = request.url;
          const method = request.method;
          const responseSize = this.getResponseSize(event);

          this.modelConsumo = {

            consumoMb: this.bytesToMB(responseSize),
            milisegundos: duration,
            api: url,
            method: method,
            coduser: coduser,
            fechaconsumo: new Date()

          }

          // console.warn(this.modelConsumo);
          // this.count ++;
          // console.warn( this.count );

          // if( url != 'https://localhost:7130/api/AuditApp/GuardarConsumo' ) {
          //     this.guardarConsumo(this.modelConsumo).subscribe({
          //     next: (x:any) => {
          //       console.log('Consumo guardado');
          //     },
          //     error: (e:Error) => {
          //       console.error(e)
          //     }
          //   })
          // }

          // console.log(`Servicio ${method} ${url} consumió ${this.bytesToMB(responseSize)} MB en ${duration} ms del usuario (email): ${xemail} - coduser: ${coduser}  `);

        }
      })
    );
  }

  getResponseSize(event: HttpResponse<any>): number {
    const contentLengthHeader = event.headers.get('content-length');
    const contentLength = contentLengthHeader ? parseInt(contentLengthHeader, 10) : 0;
    return contentLength;
  }

  bytesToMB(bytes: number): number {
    return bytes / (1024 * 1024);
  }

  guardarConsumo(model:any[]) {
    return this.http.post( this.url + 'AuditApp/GuardarConsumo', model );
  }


}
