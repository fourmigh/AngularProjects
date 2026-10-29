import { Directive, OnDestroy, inject } from '@angular/core';
import { SkinOptOutService } from './skin-opt-out.service';

@Directive({
  selector: '[empSkinOff]',
  standalone: true,
})
export class EmpSkinOffDirective implements OnDestroy {
  private readonly service = inject(SkinOptOutService);

  constructor() {
    this.service.enable();
  }

  ngOnDestroy(): void {
    this.service.disable();
  }
}
