import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { LocaleService } from '../locale.service';

interface Step {
  no: string;
  title: string;
  desc: string;
}

@Component({
  selector: 'app-compile-time',
  imports: [],
  templateUrl: './compile-time.component.html',
  styleUrl: './compile-time.component.css',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CompileTimeComponent {
  private readonly localeService = inject(LocaleService);

  readonly localeTick = signal(0);

  get heroTitle(): string {
    return $localize`:@@ct.hero.title:Official compile-time: extract-i18n + --localize`;
  }
  get heroSub(): string {
    return $localize`:@@ct.hero.sub:One build per language, the runtime language is fixed per site. It reuses the same message marking as the $localize runtime approach.`;
  }
  get extractTitle(): string {
    return $localize`:@@ct.extract.title:Real extracted output · locale/messages.xlf`;
  }
  get translatedTitle(): string {
    return $localize`:@@ct.translated.title:Translated XLIFF (sample)`;
  }
  get translatedNote(): string {
    return $localize`:@@ct.translated.note:extract only produces source messages; translators fill the <target> in each language copy, then hand it to the --localize build.`;
  }
  get steps(): Step[] {
    return [
      {
        no: '01',
        title: $localize`:@@ct.step1.title:Mark the messages`,
        desc: $localize`:@@ct.step1.desc:Use $localize in TS or i18n attributes in templates, always with a custom message id. These source marks are also reusable by the runtime approach.`,
      },
      {
        no: '02',
        title: $localize`:@@ct.step2.title:ng extract-i18n`,
        desc: $localize`:@@ct.step2.desc:The Angular compiler scans the source and extracts all messages into one messages.xlf (XLIFF 2). Below is the real extracted output.`,
      },
      {
        no: '03',
        title: $localize`:@@ct.step3.title:Translate the XLIFF`,
        desc: $localize`:@@ct.step3.desc:Translators keep a copy of the xlf per language and fill in the <target>. This is human work, not part of the automated build.`,
      },
      {
        no: '04',
        title: $localize`:@@ct.step4.title:ng build --localize`,
        desc: $localize`:@@ct.step4.desc:Configure localizations in angular.json; the CLI builds once per locale and inlines each message to the target language at compile time.`,
      },
      {
        no: '05',
        title: $localize`:@@ct.step5.title:Deploy per-language sites`,
        desc: $localize`:@@ct.step5.desc:The output contains separate per-locale directories, each a fixed-language, tree-shakable site, distinguished by URL or hosting.`,
      },
    ];
  }

  readonly xlf = signal('');
  readonly xlfError = signal('');

  readonly translatedSample = `<?xml version="1.0" encoding="UTF-8" ?>
<xliff version="2.0" xmlns="urn:oasis:names:tc:xliff:document:2.0" srcLang="en">
  <file id="ngi18n" original="ng.template" datatype="x-angular2-html">
    <unit id="demo.title">
      <segment>
        <source>Angular Native i18n Demo</source>
        <target>Angular 原生 i18n 演示</target>
      </segment>
    </unit>
  </file>
</xliff>`;

  constructor() {
    effect(() => {
      this.localeService.locale();
      this.localeTick.update((n) => n + 1);
    });
    void this.loadXlf();
  }

  private async loadXlf(): Promise<void> {
    try {
      const res = await fetch('locale/messages.xlf');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      this.xlf.set(await res.text());
    } catch (err) {
      const message = (err as Error).message;
      this.xlfError.set(
        $localize`:@@ct.xlf.error:Could not load locale/messages.xlf (${message}:ERR:). Run \`npm run i18n:extract\` first.`,
      );
    }
  }
}