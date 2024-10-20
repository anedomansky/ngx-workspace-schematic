import { RouterTestingModule } from '@angular/router/testing';
import { render } from '@testing-library/angular';

import { AppComponent } from './app.component';

describe('AppComponent', () => {
  let componentContainer: Element;

  beforeEach(async () => {
    const { container } = await render(AppComponent, {
      imports: [RouterTestingModule],
    });

    componentContainer = container;
  });

  it('should create the app', () => {
    expect(componentContainer).toBeTruthy();
  });
});
