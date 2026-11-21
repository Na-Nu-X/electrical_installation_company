import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ElectricalCostEstimatorComponent } from '../../shared/components/electrical-cost-estimator/electrical-cost-estimator.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-calculator-page',
  imports: [RouterLink, IconComponent, ElectricalCostEstimatorComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="page-hero">
      <div class="container">
        <ol class="breadcrumb">
          <li><a routerLink="/">Úvod</a></li>
          <li aria-current="page">Kalkulačka ceny</li>
        </ol>
        <span class="eyebrow">Kalkulačka ceny · Cost Estimator</span>
        <h1>Orientačná cena elektroinštalácie, revízie alebo wallboxu za minútu</h1>
        <p>
          Kalkulačka vychádza z cien našich reálnych zákaziek. Výsledok je orientačný – presnú ponuku pripravíme po
          bezplatnej obhliadke alebo podľa projektovej dokumentácie.
        </p>
      </div>
    </section>

    <section class="section section--soft section--tight">
      <div class="container">
        <app-electrical-cost-estimator idPrefix="calc" />
      </div>
    </section>

    <section class="section section--tight">
      <div class="container">
        <header class="section-header">
          <span class="eyebrow">Ako počítame</span>
          <h2>Čo ovplyvňuje cenu elektroinštalácie</h2>
        </header>
        <ul class="factors">
          @for (f of factors; track f.title) {
            <li>
              <app-icon [name]="f.icon" [size]="24" />
              <h3>{{ f.title }}</h3>
              <p>{{ f.text }}</p>
            </li>
          }
        </ul>
      </div>
    </section>
  `,
  styles: `
    @use 'styles/variables' as *;
    @use 'styles/mixins' as *;
    @use 'styles/typography' as type;

    .factors {
      display: grid;
      gap: $space-6;
      list-style: none;
      @include up(md) {
        grid-template-columns: repeat(2, 1fr);
      }
      @include up(lg) {
        grid-template-columns: repeat(4, 1fr);
      }
      li {
        @include panel($space-6);
      }
      app-icon {
        color: $color-primary;
        margin-bottom: $space-4;
      }
      h3 {
        font-size: type.$text-lg;
        margin-bottom: $space-2;
      }
      p {
        margin: 0;
        font-size: type.$text-sm;
        color: $color-text-muted;
      }
    }
  `,
})
export class CalculatorPage {
  protected readonly factors = [
    {
      icon: 'ruler',
      title: 'Plocha a dispozícia',
      text: 'Počet miestností, svetelných a zásuvkových okruhov a dĺžka káblových trás.',
    },
    {
      icon: 'layers',
      title: 'Stavebný stav',
      text: 'Novostavba pred omietkami je rýchlejšia ako rekonštrukcia s demontážou a bezprašným drážkovaním.',
    },
    {
      icon: 'cpu',
      title: 'Úroveň výbavy',
      text: 'Klasická inštalácia, príprava pre smart home alebo plná inteligentná elektroinštalácia Loxone / KNX.',
    },
    {
      icon: 'shield-check',
      title: 'Ochrany a dokumentácia',
      text: 'Prepäťová ochrana, bleskozvod, revízne správy a projektová dokumentácia pre kolaudáciu.',
    },
  ];
}
