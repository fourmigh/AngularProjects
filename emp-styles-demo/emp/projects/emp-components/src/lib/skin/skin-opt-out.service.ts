import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class SkinOptOutService {
  private count = 0;

  enable(): void {
    if (typeof document === 'undefined') {
      return;
    }
    this.count += 1;
    document.body.setAttribute('data-skin-off', '');
  }

  disable(): void {
    if (typeof document === 'undefined') {
      return;
    }
    this.count = Math.max(0, this.count - 1);
    if (this.count === 0) {
      document.body.removeAttribute('data-skin-off');
    }
  }
}
