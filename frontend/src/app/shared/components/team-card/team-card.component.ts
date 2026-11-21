import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { TeamSpecialist } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-team-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="member">
      <div class="member__photo">
        @if (member().photo_url) {
          <img [src]="member().photo_url" [alt]="member().full_name" loading="lazy" width="400" height="400" />
        }
      </div>
      <div class="member__body">
        <h3>{{ member().full_name }}</h3>
        <p class="member__role">{{ member().role_title }}</p>
        <p class="member__quals"><app-icon name="shield-check" [size]="16" /> {{ member().qualifications }}</p>
        <p class="member__bio">{{ member().bio }}</p>
      </div>
    </article>
  `,
  styles: `
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;
    @use 'styles/typography' as type;

    :host {
      display: block;
      height: 100%;
    }
    .member {
      @include panel(0);
      display: flex;
      flex-direction: column;
      height: 100%;
      overflow: hidden;
    }
    .member__photo {
      aspect-ratio: 4 / 3;
      background: $color-surface-soft;
      border-bottom: 1px solid $color-border;
      img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: center 25%;
        filter: grayscale(0.25);
      }
    }
    .member__body {
      padding: $space-5 $space-6 $space-6;
    }
    h3 {
      font-size: type.$text-lg;
      margin-bottom: $space-1;
    }
    .member__role {
      font-size: type.$text-sm;
      font-weight: 500;
      color: $color-primary-hover;
      margin-bottom: $space-4;
    }
    .member__quals {
      @include mono-numeric;
      display: flex;
      gap: $space-2;
      padding: $space-3;
      border: 1px solid color-mix(in srgb, var(--color-safe) 25%, transparent);
      border-radius: $radius-sm;
      background: color-mix(in srgb, var(--color-safe-soft) 45%, white);
      font-size: 0.72rem;
      line-height: 1.5;
      color: #047857;
      app-icon {
        margin-top: 1px;
      }
    }
    .member__bio {
      margin: 0;
      font-size: type.$text-sm;
      color: $color-text-muted;
    }
  `,
})
export class TeamCardComponent {
  readonly member = input.required<TeamSpecialist>();
}
