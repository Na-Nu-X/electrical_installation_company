import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { SITE_CONFIG } from '../../../core/config/site.config';

/** Company wordmark driven by `site.config.ts` – geometric mark + two-part name. */
@Component({
  selector: 'app-logo',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '[class.is-inverse]': 'inverse()' },
  template: `
    <svg class="mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect x="0.5" y="0.5" width="31" height="31" rx="5" class="mark__frame" />
      <path d="M9 9h6l-2 6h6l-8 9 2-7H8z" class="mark__glyph" />
      <path d="M22 9v14" class="mark__line" />
      <path d="M25 13v6" class="mark__line" />
    </svg>
    <span class="word">
      <span class="word__primary">{{ wordmark.primary }}</span>
      <span class="word__secondary">{{ wordmark.secondary }}</span>
    </span>
  `,
  styles: `
    :host {
      display: inline-flex;
      align-items: center;
      gap: 0.6rem;
      color: var(--color-text);
    }
    .mark {
      width: 34px;
      height: 34px;
    }
    .mark__frame {
      fill: var(--color-navy);
      stroke: var(--color-navy);
    }
    .mark__glyph {
      fill: var(--color-primary);
    }
    .mark__line {
      stroke: var(--color-on-navy);
      stroke-width: 1.6;
      stroke-linecap: round;
      opacity: 0.85;
    }
    .word {
      display: flex;
      flex-direction: column;
      line-height: 1;
    }
    .word__primary {
      font-family: var(--font-display);
      font-size: 1.15rem;
      font-weight: 700;
      letter-spacing: 0.08em;
    }
    .word__secondary {
      margin-top: 3px;
      font-family: var(--font-mono);
      font-size: 0.66rem;
      letter-spacing: 0.28em;
      text-transform: uppercase;
      color: var(--color-text-muted);
    }
    :host(.is-inverse) {
      color: var(--color-on-navy);
    }
    :host(.is-inverse) .mark__frame {
      fill: transparent;
      stroke: rgba(248, 250, 252, 0.35);
    }
    :host(.is-inverse) .word__secondary {
      color: var(--color-on-navy-muted);
    }
  `,
})
export class LogoComponent {
  readonly inverse = input(false);
  protected readonly wordmark = SITE_CONFIG.company.wordmark;
}
