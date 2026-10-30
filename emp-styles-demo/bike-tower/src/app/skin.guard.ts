import { CanActivateChildFn } from '@angular/router';

export const skinGuard: CanActivateChildFn = (route) => {
  if (!document.body.classList.contains('emp-preview-skin')) {
    document.body.toggleAttribute(
      'data-skin-off',
      route.data['skin'] === false,
    );
  }
  return true;
};
