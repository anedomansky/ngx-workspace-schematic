import { InjectionToken } from '@angular/core';
import { Observable } from 'rxjs';

export interface SampleServiceConfig {
  sayHello(): Observable<string>;
}

export const SampleServiceToken = new InjectionToken<SampleServiceConfig>(
  'SampleService',
);
