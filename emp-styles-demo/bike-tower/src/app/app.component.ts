import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  host: { class: 'emp-app-frame' },
  template: `<router-outlet />`,
  styles: [
    `
      :host {
        display: block;
        overflow: hidden;
      }
    `,
  ],
})
export class AppComponent {}
