import { ChangeDetectionStrategy, Component, input } from '@angular/core';

import { ReferenceProject } from '../../../core/models/api.models';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-reference-card',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="ref" [class.ref--detailed]="detailed()">
      <div class="ref__media">
        @if (project().image_url) {
          <img [src]="project().image_url" [alt]="project().title" loading="lazy" width="800" height="520" />
        }
        <span class="ref__year mono">{{ project().completion_year }}</span>
      </div>
      <div class="ref__body">
        <div class="ref__meta">
          <span class="pill">{{ project().client_type_display }}</span>
          <span class="ref__location"><app-icon name="map-pin" [size]="14" /> {{ project().location_city }}</span>
        </div>
        <h3 class="ref__title">{{ project().title }}</h3>
        @if (detailed()) {
          <dl class="ref__story">
            <div>
              <dt>Zadanie</dt>
              <dd>{{ project().challenge_summary }}</dd>
            </div>
            <div>
              <dt>Riešenie</dt>
              <dd>{{ project().solution_summary }}</dd>
            </div>
          </dl>
        } @else {
          <p class="ref__summary">{{ project().solution_summary }}</p>
        }
        <ul class="ref__highlights">
          @for (h of project().technical_highlights; track h) {
            <li><app-icon name="check" [size]="14" /> {{ h }}</li>
          }
        </ul>
      </div>
    </article>
  `,
  styleUrl: './reference-card.component.scss',
})
export class ReferenceCardComponent {
  readonly project = input.required<ReferenceProject>();
  readonly detailed = input(false);
}
