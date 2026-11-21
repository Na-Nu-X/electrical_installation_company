import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ElectricalServiceDetail, QuoteObjectType, QuoteServiceType } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { SeoService } from '../../core/services/seo.service';
import { resourceValue } from '../../core/utils/resource';
import { FaqAccordionComponent } from '../../shared/components/faq-accordion/faq-accordion.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { EurPipe } from '../../shared/pipes/eur.pipe';

/** Short explanations for standards frequently referenced in service dossiers. */
const STANDARD_NOTES: readonly [prefix: string, note: string][] = [
  ['STN 33 2000-4-41', 'Ochrana pred zásahom elektrickým prúdom'],
  ['STN 33 2000-4-443', 'Ochrana pred atmosférickým a spínacím prepätím'],
  ['STN 33 2000-5-52', 'Výber a stavba elektrických rozvodov'],
  ['STN 33 2000-5-534', 'Prepäťové ochranné prístroje (SPD)'],
  ['STN 33 2000-5-54', 'Uzemnenie a ochranné vodiče'],
  ['STN 33 2000-6', 'Revízia – overovanie elektrických inštalácií'],
  ['STN 33 2000-7-701', 'Priestory s vaňou alebo sprchou'],
  ['STN 33 2000-7-722', 'Napájanie elektrických vozidiel'],
  ['STN 33 2130', 'Vnútorné elektrické rozvody'],
  ['STN 33 1500', 'Revízie elektrických zariadení'],
  ['STN EN 62305', 'Ochrana pred bleskom'],
  ['STN EN 61439', 'Rozvádzače nízkeho napätia'],
  ['STN EN 61643', 'Prepäťové ochranné zariadenia'],
  ['STN EN IEC 61851', 'Systémy nabíjania elektrických vozidiel'],
  ['STN EN 62561', 'Komponenty systémov ochrany pred bleskom'],
  ['STN EN 50491', 'Elektronické systémy budov (HBES/BACS)'],
  ['STN EN 50090', 'Systémy KNX pre domy a budovy'],
  ['STN EN 1838', 'Núdzové osvetlenie'],
  ['STN EN 50110', 'Obsluha a práca na elektrických zariadeniach'],
  ['Vyhláška č. 508/2009', 'Vyhradené technické zariadenia – BOZP'],
  ['§ 24', 'Revízny technik s osvedčením'],
  ['§ 23', 'Elektrotechnik špecialista'],
];

@Component({
  selector: 'app-service-detail-page',
  imports: [RouterLink, IconComponent, EurPipe, FaqAccordionComponent, ServiceCardComponent],
  templateUrl: './service-detail.page.html',
  styleUrl: './service-detail.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServiceDetailPage {
  private readonly api = inject(ApiService);
  private readonly seo = inject(SeoService);

  /** Route param `:slug` */
  readonly slug = input.required<string>();

  protected readonly serviceRes = this.api.serviceDetailResource(() => this.slug());
  protected readonly service = computed<ElectricalServiceDetail | undefined>(() =>
    this.serviceRes.hasValue() ? this.serviceRes.value() : undefined,
  );

  protected readonly notFound = computed(() => {
    const error = this.serviceRes.error();
    return error instanceof HttpErrorResponse && error.status === 404;
  });

  private readonly relatedRes = this.api.servicesResource(() => {
    const category = this.service()?.category.slug;
    return category ? { category } : undefined;
  });
  private readonly relatedAll = resourceValue(this.relatedRes, []);
  protected readonly related = computed(() => {
    const current = this.service();
    return current ? this.relatedAll().filter((s) => s.id !== current.id).slice(0, 3) : [];
  });

  protected readonly standards = computed(() =>
    (this.service()?.standards_and_certs ?? []).map((code) => ({
      code,
      note: STANDARD_NOTES.find(([prefix]) => code.startsWith(prefix))?.[1] ?? 'Platná technická norma / predpis',
    })),
  );

  protected readonly quoteParams = computed(() => {
    const s = this.service();
    return s ? { ...mapServiceToQuote(s), service: s.slug } : {};
  });

  constructor() {
    effect(() => {
      const s = this.service();
      if (s) {
        this.seo.update(s.name, s.short_description);
      } else if (this.notFound()) {
        this.seo.update('Služba nenájdená');
      }
    });
  }
}

/** Best-effort mapping from a service onto the quote form's service/object type. */
function mapServiceToQuote(service: ElectricalServiceDetail): { type: QuoteServiceType; object?: QuoteObjectType } {
  const name = service.name.toLowerCase();
  switch (service.category.icon_name) {
    case 'clipboard-check':
    case 'shield-bolt':
      return { type: 'revizia' };
    case 'cpu':
      return { type: 'smart_home', object: 'rodinny_dom' };
    case 'ev-plug':
      return { type: 'wallbox_fve' };
    case 'factory':
      return { type: 'novostavba', object: 'firma_hala' };
    default:
      if (name.includes('hdv') || name.includes('bytovom dome')) {
        return { type: 'rekonstrukcia', object: 'bytovy_dom' };
      }
      return name.includes('rekonštrukcia') ? { type: 'rekonstrukcia', object: 'byt' } : { type: 'novostavba', object: 'rodinny_dom' };
  }
}
