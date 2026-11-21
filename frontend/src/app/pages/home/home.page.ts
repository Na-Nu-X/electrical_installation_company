import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../core/config/site.config';
import { ApiService } from '../../core/services/api.service';
import { resourceValue } from '../../core/utils/resource';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { ElectricalCostEstimatorComponent } from '../../shared/components/electrical-cost-estimator/electrical-cost-estimator.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ReferenceCardComponent } from '../../shared/components/reference-card/reference-card.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';
import { TeamCardComponent } from '../../shared/components/team-card/team-card.component';

@Component({
  selector: 'app-home-page',
  imports: [
    RouterLink,
    IconComponent,
    ServiceCardComponent,
    ReferenceCardComponent,
    TeamCardComponent,
    ElectricalCostEstimatorComponent,
    CtaBandComponent,
  ],
  templateUrl: './home.page.html',
  styleUrl: './home.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomePage {
  private readonly api = inject(ApiService);
  protected readonly config = SITE_CONFIG;

  protected readonly servicesRes = this.api.servicesResource(() => ({ featured: true }));
  protected readonly referencesRes = this.api.referencesResource(() => ({ featured: true }));
  protected readonly teamRes = this.api.teamResource();

  private readonly allServices = resourceValue(this.servicesRes, []);
  private readonly allReferences = resourceValue(this.referencesRes, []);
  protected readonly services = computed(() => this.allServices().slice(0, 6));
  protected readonly references = computed(() => this.allReferences().slice(0, 3));
  protected readonly team = resourceValue(this.teamRes, []);

  protected readonly pillars = [
    {
      icon: 'shield-check',
      title: 'Certifikovaní elektrikári',
      text: 'Pracujú u nás elektrotechnici s osvedčením podľa § 23 a revízni technici podľa § 24 Vyhlášky č. 508/2009 Z. z.',
      spec: '§ 23 · § 24 · E2A',
    },
    {
      icon: 'award',
      title: 'Značkový materiál',
      text: 'Rozvádzače, istiace prvky a prepäťové ochrany výhradne od overených výrobcov s plnou zárukou a dostupnosťou dielov.',
      spec: SITE_CONFIG.partners.materialBrands.slice(0, 3).join(' · '),
    },
    {
      icon: 'tool',
      title: 'Čistá a presná práca',
      text: 'Bezprašné drážkovanie s odsávaním, zakrytie podláh, popisané okruhy v rozvádzači a upratané pracovisko každý deň.',
      spec: 'Drážkovanie s odsávaním',
    },
    {
      icon: 'file-text',
      title: 'Revízna správa ku každej zákazke',
      text: 'Každú inštaláciu odovzdávame s východiskovou revíznou správou – pripravenou pre kolaudáciu, distribúciu aj poisťovňu.',
      spec: 'STN 33 2000-6',
    },
  ];

  protected readonly heroSpecs = [
    { label: 'Hlavný istič', value: '3×25 A' },
    { label: 'Prepäťová ochrana', value: 'T1 + T2' },
    { label: 'Prúdové chrániče', value: '30 mA' },
    { label: 'Wallbox', value: '11 / 22 kW' },
  ];
}
