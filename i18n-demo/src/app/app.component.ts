import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs';
import { I18N_SCOPE, I18nService } from './custom-i18n/i18n.service';
import { LocaleService, ROUTE_LANGS, isRouteLang } from './locale.service';
import { LocaleId } from './custom-i18n/i18n-keys';
import { RUNTIME_PAGES } from './features';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  providers: [{ provide: I18N_SCOPE, useValue: 'app' }, I18nService],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  private readonly router = inject(Router);
  private readonly localeService = inject(LocaleService);

  readonly runtimePages = RUNTIME_PAGES;
  readonly i18n = inject(I18nService);
  readonly langs = ROUTE_LANGS.map((id) => ({ id, label: id.toUpperCase() }));

  constructor() {
    effect(() => {
      const locale = this.localeService.locale();
      if (this.i18n.ready()) this.i18n.switchLanguage(locale);
    });
    void this.i18n.init();
    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const first = this.router.url.split('/').filter(Boolean)[0];
        if (isRouteLang(first)) this.localeService.setLocale(first);
      });
  }

  locale(): LocaleId {
    return this.localeService.locale();
  }

  go(lang: LocaleId): void {
    const rest = this.router.url.split('/').filter(Boolean);
    if (rest.length && isRouteLang(rest[0])) {
      rest.shift();
      void this.router.navigate(['/', lang, ...rest]);
    } else {
      this.localeService.setLocale(lang);
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