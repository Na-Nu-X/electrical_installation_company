import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ElectricalService } from '../../../core/models/api.models';
import { EurPipe } from '../../pipes/eur.pipe';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-service-card',
  imports: [RouterLink, IconComponent, EurPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <article class="card">
      <header class="card__head">
        <span class="card__category">
          <app-icon [name]="service().category.icon_name" [size]="16" />
          {{ service().category.name }}
        </span>
        @if (service().is_featured) {
          <span class="pill pill--amber">Odporúčané</span>
        }
      </header>

      <h3 class="card__title">
        <a [routerLink]="['/sluzby', service().slug]">{{ service().name }}</a>
      </h3>
      <p class="card__desc">{{ service().short_description }}</p>

      @if (scopeHighlights().length) {
        <ul class="card__scope">
          @for (step of scopeHighlights(); track step) {
            <li><app-icon name="check" [size]="15" /> {{ step }}</li>
          }
        </ul>
      }

      <ul class="pill-list card__standards" aria-label="Normy a oprávnenia">
        @for (std of standards(); track std) {
          <li class="pill" [class.pill--tech]="std.startsWith('STN')" [class.pill--safe]="!std.startsWith('STN')">
            {{ std }}
          </li>
        }
      </ul>

      <footer class="card__foot">
        <div class="card__price">
          <span class="card__price-label">Cena</span>
          <strong class="mono">
            @if (service().starting_price_eur) {
              od {{ service().starting_price_eur | eur }}
            } @else {
              individuálne
            }
          </strong>
        </div>
        <a class="link-arrow" [routerLink]="['/sluzby', service().slug]" [attr.aria-label]="'Detail služby: ' + service().name">
          Detail služby <app-icon name="arrow-right" [size]="16" />
        </a>
      </footer>
    </article>
  `,
  styleUrl: './service-card.component.scss',
})
export class ServiceCardComponent {
  readonly service = input.required<ElectricalService>();
  /** Number of scope-of-work steps to preview. */
  readonly scopeLimit = input(3);

  protected readonly scopeHighlights = computed(() => this.service().scope_of_work.slice(0, this.scopeLimit()));
  protected readonly standards = computed(() => this.service().standards_and_certs.slice(0, 3));
}
