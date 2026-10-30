import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.less'],
})
export class HomeComponent {
  protected readonly editorUrl = (() => {
    const host =
      window.location.hostname === 'localhost'
        ? '127.0.0.1'
        : window.location.hostname;
    return `http://${host}:4201/skin-editor`;
  })();
}
