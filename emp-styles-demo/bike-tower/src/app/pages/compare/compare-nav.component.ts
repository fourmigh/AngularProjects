import { Component } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-compare-nav',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  template: `
    <nav class="compare-nav">
      <span class="compare-nav__brand">样式对比</span>
      <a
        routerLink="/"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        >首页</a
      >
      <a
        routerLink="/compare"
        routerLinkActive="active"
        [routerLinkActiveOptions]="{ exact: true }"
        >并排对比</a
      >
      <a routerLink="/compare/plain" routerLinkActive="active">无皮肤</a>
      <a routerLink="/compare/skinned" routerLinkActive="active">有皮肤</a>
    </nav>
  `,
  styleUrls: ['./compare-nav.component.less'],
})
export class CompareNavComponent {}
