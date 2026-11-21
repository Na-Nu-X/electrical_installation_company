import { ChangeDetectionStrategy, Component, input, signal } from '@angular/core';

import { FaqItem } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

let nextId = 0;

/** Accessible accordion (WAI-ARIA disclosure pattern) for FAQ items. */
@Component({
  selector: 'app-faq-accordion',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="faq">
      @for (item of items(); track item.question; let i = $index) {
        <div class="faq__item" [class.is-open]="openIndex() === i">
          <h3 class="faq__q">
            <button
              type="button"
              [id]="uid + '-q-' + i"
              [attr.aria-expanded]="openIndex() === i"
              [attr.aria-controls]="uid + '-a-' + i"
              (click)="toggle(i)"
            >
              <span>{{ item.question }}</span>
              <app-icon name="chevron-down" [size]="20" />
            </button>
          </h3>
          <div
            class="faq__a"
            role="region"
            [id]="uid + '-a-' + i"
            [attr.aria-labelledby]="uid + '-q-' + i"
            [hidden]="openIndex() !== i"
          >
            <p>{{ item.answer }}</p>
          </div>
        </div>
      }
    </div>
  `,
  styles: `
    @use 'styles/variables' as *;
    @use 'styles/typography' as type;

    .faq {
      border-top: 1px solid $color-border;
    }
    .faq__item {
      border-bottom: 1px solid $color-border;
    }
    .faq__q {
      margin: 0;
      font-size: type.$text-base;
      button {
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: $space-4;
        width: 100%;
        padding: $space-5 0;
        border: 0;
        background: none;
        text-align: left;
        font-family: $font-display;
        font-size: type.$text-lg;
        font-weight: 600;
        color: $color-text;
        &:hover {
          color: $color-primary-hover;
        }
      }
      app-icon {
        color: $color-text-subtle;
        transition: transform $transition;
      }
    }
    .is-open .faq__q app-icon {
      transform: rotate(180deg);
      color: $color-primary;
    }
    .faq__a p {
      max-width: 760px;
      margin: 0;
      padding: 0 0 $space-5;
      color: $color-text-muted;
      line-height: 1.65;
    }
  `,
})
export class FaqAccordionComponent {
  readonly items = input.required<readonly FaqItem[]>();
  protected readonly uid = `faq-${nextId++}`;
  protected readonly openIndex = signal<number | null>(0);

  protected toggle(index: number): void {
    this.openIndex.update((current) => (current === index ? null : index));
  }
}
