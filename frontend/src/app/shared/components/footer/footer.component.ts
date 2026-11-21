import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

@Component({
  selector: 'app-footer',
  imports: [RouterLink, IconComponent, LogoComponent],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FooterComponent {
  protected readonly config = SITE_CONFIG;
  protected readonly year = new Date().getFullYear();

  protected readonly serviceLinks = [
    { label: 'Elektroinštalácie domov a bytov', path: '/sluzby', query: { kategoria: 'domove-a-bytove-elektroinstalacie' } },
    { label: 'Revízie elektroinštalácií', path: '/revizie-a-legislativa', query: null },
    { label: 'Bleskozvody a prepäťová ochrana', path: '/sluzby', query: { kategoria: 'bleskozvody-a-prepatova-ochrana' } },
    { label: 'Smart Home Loxone / KNX', path: '/sluzby', query: { kategoria: 'smart-home-inteligentna-elektroinstalacia' } },
    { label: 'Wallboxy a príprava pre FVE', path: '/sluzby', query: { kategoria: 'nabijacie-stanice-wallboxy-a-priprava-pre-fve' } },
  ];

  protected readonly companyLinks = [
    { label: 'Referencie a realizácie', path: '/realizacie', query: null },
    { label: 'Kalkulačka ceny', path: '/kalkulacka', query: null },
    { label: 'Nezáväzná cenová ponuka', path: '/dopyt', query: null },
    { label: 'Nahlásiť poruchu', path: '/dopyt', query: { type: 'porucha' } },
  ];
}
