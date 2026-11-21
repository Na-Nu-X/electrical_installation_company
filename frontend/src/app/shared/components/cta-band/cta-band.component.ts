import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';

/** Dark conversion band with primary CTA and phone numbers. */
@Component({
  selector: 'app-cta-band',
  imports: [RouterLink, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="cta">
      <div class="container cta__inner">
        <div>
          <span class="eyebrow">{{ eyebrow() }}</span>
          <h2>{{ title() }}</h2>
          <p>{{ text() }}</p>
        </div>
        <div class="cta__actions">
          <a class="btn btn--primary btn--lg" routerLink="/dopyt" [queryParams]="queryParams()">
            {{ ctaLabel() }} <app-icon name="arrow-right" [size]="18" />
          </a>
          <a class="cta__phone" [href]="config.contact.phoneHref">
            <app-icon name="phone" [size]="18" />
            <span class="mono">{{ config.contact.phone }}</span>
          </a>
        </div>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;
    @use 'styles/typography' as type;

    .cta {
      background: $color-navy;
      color: $color-on-navy;
      padding-block: $space-16;
      border-top: 3px solid $color-primary;
      @include blueprint-grid(rgba(148, 163, 184, 0.06), 40px);
    }
    .cta__inner {
      display: flex;
      flex-direction: column;
      gap: $space-8;
      @include up(lg) {
        flex-direction: row;
        align-items: center;
        justify-content: space-between;
      }
    }
    .eyebrow {
      display: block;
      margin-bottom: $space-3;
    }
    h2 {
      max-width: 640px;
      margin-bottom: $space-3;
    }
    p {
      max-width: 600px;
      margin: 0;
      color: $color-on-navy-muted;
    }
    .cta__actions {
      display: flex;
      flex-direction: column;
      gap: $space-4;
      flex: none;
      @include up(sm) {
        flex-direction: row;
        align-items: center;
      }
    }
    .cta__phone {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      gap: $space-2;
      color: $color-on-navy;
      text-decoration: none;
      font-size: type.$text-lg;
      &:hover {
        color: $color-primary;
      }
    }
  `,
})
export class CtaBandComponent {
  readonly eyebrow = input('Nezáväzná ponuka do 48 hodín');
  readonly title = input('Pripravujete stavbu, rekonštrukciu alebo potrebujete revíziu?');
  readonly text = input(
    'Pošlite nám základné údaje o objekte. Ozveme sa s návrhom riešenia, termínom obhliadky a orientačnou cenou.',
  );
  readonly ctaLabel = input('Nezáväzná ponuka');
  readonly queryParams = input<Record<string, string> | null>(null);

  protected readonly config = SITE_CONFIG;
}
