import { ChangeDetectionStrategy, Component, computed, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { EurPipe } from '../../pipes/eur.pipe';
import { IconComponent } from '../icon/icon.component';
import {
  ADDONS,
  AddonKey,
  addonLabel,
  AREA_RANGE,
  calculateEstimate,
  DISTANCE_RANGE,
  EstimatorInput,
  EstimatorObjectType,
  isAddonAvailable,
  OBJECT_TYPES,
  REALIZATION_TYPES,
  RealizationType,
  toQuoteParams,
  WallboxPower,
} from './estimator.model';

@Component({
  selector: 'app-electrical-cost-estimator',
  imports: [RouterLink, IconComponent, EurPipe],
  templateUrl: './electrical-cost-estimator.component.html',
  styleUrl: './electrical-cost-estimator.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ElectricalCostEstimatorComponent {
  /** Unique prefix so multiple estimators on one page keep valid ids. */
  readonly idPrefix = input<string>('est');

  protected readonly realizationTypes = REALIZATION_TYPES;
  protected readonly objectTypes = OBJECT_TYPES;
  protected readonly addons = ADDONS;
  protected readonly areaRange = AREA_RANGE;
  protected readonly distanceRange = DISTANCE_RANGE;
  protected readonly powers: readonly WallboxPower[] = [11, 22];
  protected readonly badges = SITE_CONFIG.qualificationBadges;

  protected readonly type = signal<RealizationType>('novostavba');
  protected readonly object = signal<EstimatorObjectType>('rodinny_dom');
  protected readonly area = signal<number>(140);
  protected readonly distance = signal<number>(12);
  protected readonly power = signal<WallboxPower>(11);
  protected readonly selectedAddons = signal<ReadonlySet<AddonKey>>(new Set<AddonKey>(['prepatova']));

  protected readonly isWallbox = computed(() => this.type() === 'wallbox');
  protected readonly isInspection = computed(() => this.type() === 'revizia');

  protected readonly areaLabel = computed(() =>
    this.isInspection() ? 'Plocha objektu na revíziu (m²)' : 'Približná podlahová plocha objektu (m²)',
  );

  protected readonly estimatorInput = computed<EstimatorInput>(() => ({
    type: this.type(),
    object: this.object(),
    area: this.area(),
    distance: this.distance(),
    power: this.power(),
    addons: this.selectedAddons(),
  }));

  protected readonly result = computed(() => calculateEstimate(this.estimatorInput()));

  protected readonly quoteParams = computed(() => toQuoteParams(this.estimatorInput(), this.result()));

  /** Slider fill percentage for the custom track styling. */
  protected readonly areaFill = computed(
    () => ((this.area() - AREA_RANGE.min) / (AREA_RANGE.max - AREA_RANGE.min)) * 100,
  );
  protected readonly distanceFill = computed(
    () => ((this.distance() - DISTANCE_RANGE.min) / (DISTANCE_RANGE.max - DISTANCE_RANGE.min)) * 100,
  );

  protected isAvailable(addon: AddonKey): boolean {
    return isAddonAvailable(addon, this.type(), this.object());
  }

  protected isSelected(addon: AddonKey): boolean {
    return this.selectedAddons().has(addon) && this.isAvailable(addon);
  }

  protected labelFor(addon: AddonKey): string {
    return addonLabel(addon, this.type());
  }

  protected toggleAddon(addon: AddonKey): void {
    if (!this.isAvailable(addon)) {
      return;
    }
    this.selectedAddons.update((current) => {
      const next = new Set(current);
      if (next.has(addon)) {
        next.delete(addon);
      } else {
        next.add(addon);
      }
      return next;
    });
  }

  protected onRange(target: EventTarget | null, which: 'area' | 'distance'): void {
    const value = Number((target as HTMLInputElement | null)?.value);
    if (Number.isFinite(value)) {
      (which === 'area' ? this.area : this.distance).set(value);
    }
  }

  protected daysLabel(min: number, max: number): string {
    const unit = (n: number) => (n === 1 ? 'pracovný deň' : n < 5 ? 'pracovné dni' : 'pracovných dní');
    return min === max ? `${min} ${unit(min)}` : `${min} – ${max} ${unit(max)}`;
  }
}
