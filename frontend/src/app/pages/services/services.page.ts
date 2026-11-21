import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, input, linkedSignal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ApiService } from '../../core/services/api.service';
import { resourceValue } from '../../core/utils/resource';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ServiceCardComponent } from '../../shared/components/service-card/service-card.component';

interface SortOption {
  readonly value: string;
  readonly label: string;
}

/**
 * Service catalog. The URL query string (`?kategoria=&q=&zoradit=`) is the
 * single source of truth, bound to inputs via `withComponentInputBinding`.
 */
@Component({
  selector: 'app-services-page',
  imports: [RouterLink, IconComponent, ServiceCardComponent, CtaBandComponent],
  templateUrl: './services.page.html',
  styleUrl: './services.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ServicesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Query params */
  readonly kategoria = input<string | undefined>();
  readonly q = input<string | undefined>();
  readonly zoradit = input<string | undefined>();

  protected readonly sortOptions: readonly SortOption[] = [
    { value: '', label: 'Odporúčané poradie' },
    { value: 'starting_price_eur', label: 'Cena: od najnižšej' },
    { value: '-starting_price_eur', label: 'Cena: od najvyššej' },
    { value: 'name', label: 'Názov: A – Z' },
  ];

  protected readonly categoriesRes = this.api.categoriesResource();
  protected readonly categories = resourceValue(this.categoriesRes, []);
  protected readonly totalCount = computed(() => this.categories().reduce((sum, c) => sum + c.service_count, 0));

  protected readonly servicesRes = this.api.servicesResource(() => ({
    category: this.kategoria() ?? null,
    search: this.q()?.trim() || null,
    ordering: this.zoradit() || null,
  }));
  protected readonly services = resourceValue(this.servicesRes, []);

  protected readonly activeCategory = computed(() => this.categories().find((c) => c.slug === this.kategoria()));

  /** Local, immediately-updating copy of the search box (debounced into the URL). */
  protected readonly searchText = linkedSignal(() => this.q() ?? '');
  private searchTimer: ReturnType<typeof setTimeout> | undefined;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.searchTimer));
  }

  protected onSearch(value: string): void {
    this.searchText.set(value);
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.updateQuery({ q: value.trim() || null }), 300);
  }

  protected setCategory(slug: string | null): void {
    this.updateQuery({ kategoria: slug });
  }

  protected setSort(value: string): void {
    this.updateQuery({ zoradit: value || null });
  }

  protected resetFilters(): void {
    this.searchText.set('');
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }

  private updateQuery(params: Record<string, string | null>): void {
    this.router.navigate([], { queryParams: params, queryParamsHandling: 'merge', replaceUrl: true });
  }
}
