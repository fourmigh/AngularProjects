import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { type LocaleId } from 'i18n';
import { APP_I18N } from './i18n-bindings/app-i18n';
import { RUNTIME_PAGES } from './features';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);

  readonly runtimePages = RUNTIME_PAGES;
  readonly i18n = inject(APP_I18N);
  readonly langs = computed(() => this.i18n.languages.map((l) => ({ id: l.id, label: l.id.toUpperCase() })));

  constructor() {
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const first = this.router.url.split('/').filter(Boolean)[0];
        if (this.i18n.isRouteLang(first)) this.i18n.setLocale(first);
      });
  }

  locale(): LocaleId {
    return this.i18n.locale();
  }

  go(lang: LocaleId): void {
    const rest = this.router.url.split('/').filter(Boolean);
    if (rest.length && this.i18n.isRouteLang(rest[0])) {
      rest.shift();
      void this.router.navigate(['/', lang, ...rest]);
    } else {
      this.i18n.setLocale(lang);
    }
  }

  get homeLabel(): string {
    return $localize`:@@shell.nav.home:Home`;
  }
  get officialLabel(): string {
    return $localize`:@@shell.nav.official:Official $localize`;
  }
  get compileLabel(): string {
    return $localize`:@@shell.nav.compile:Compile-time`;
  }
  get customLabel(): string {
    return $localize`:@@shell.nav.custom:Custom t()`;
  }
  get langLabel(): string {
    return $localize`:@@shell.lang.label:Language:`;
  }
}
