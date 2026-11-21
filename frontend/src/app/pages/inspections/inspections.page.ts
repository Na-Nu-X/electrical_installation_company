import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import {
  INSPECTION_FAQ,
  INSPECTION_PROCESS,
  INSPECTION_TOPICS,
  INTERVAL_TABLE,
} from '../../core/content/inspections.content';
import { ApiService } from '../../core/services/api.service';
import { resourceValue } from '../../core/utils/resource';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { FaqAccordionComponent } from '../../shared/components/faq-accordion/faq-accordion.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';

/** Category slug of inspection services as created by `seed_data`. */
const INSPECTIONS_CATEGORY = 'odborne-prehliadky-a-skusky-revizie';

@Component({
  selector: 'app-inspections-page',
  imports: [RouterLink, IconComponent, ServiceCardComponent, FaqAccordionComponent, CtaBandComponent],
  templateUrl: './inspections.page.html',
  styleUrl: './inspections.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class InspectionsPage {
  private readonly api = inject(ApiService);

  protected readonly config = SITE_CONFIG;
  protected readonly topics = INSPECTION_TOPICS;
  protected readonly intervals = INTERVAL_TABLE;
  protected readonly process = INSPECTION_PROCESS;
  protected readonly faq = INSPECTION_FAQ;

  protected readonly servicesRes = this.api.servicesResource(() => ({ category: INSPECTIONS_CATEGORY }));
  protected readonly services = resourceValue(this.servicesRes, []);
}
