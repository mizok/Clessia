import { Directive, ElementRef, inject } from '@angular/core';

/**
 * 標記用 Directive，用於在 Template 中標識 Overlay 容器元件。
 * 提供 `nativeHTMLElement` 供子元件 inject 後獲取。
 */
@Directive({
  selector: '[appOverlayContainer]',
  standalone: true,
})
export class OverlayContainerDirective {
  private readonly el = inject(ElementRef<HTMLElement>);

  get nativeHTMLElement(): HTMLElement {
    return this.el.nativeElement;
  }
}
