import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ClientType } from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { resourceValue } from '../../core/utils/resource';
import { CtaBandComponent } from '../../shared/components/cta-band/cta-band.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { ReferenceCardComponent } from '../../shared/components/reference-card/reference-card.component';

const CLIENT_FILTERS: readonly { value: ClientType | null; label: string; icon: string }[] = [
  { value: null, label: 'Všetky realizácie', icon: 'layers' },
  { value: 'rodinny_dom', label: 'Rodinné domy', icon: 'home' },
  { value: 'bytovy_dom', label: 'Bytové domy', icon: 'users' },
  { value: 'firma_priemysel', label: 'Firmy a priemysel', icon: 'factory' },
];

const isClientType = (v: unknown): v is ClientType => CLIENT_FILTERS.some((f) => f.value === v && v !== null);

@Component({
  selector: 'app-references-page',
  imports: [RouterLink, IconComponent, ReferenceCardComponent, CtaBandComponent],
  templateUrl: './references.page.html',
  styleUrl: './references.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferencesPage {
  private readonly api = inject(ApiService);
  private readonly router = inject(Router);

  /** Query params `?klient=&kategoria=` */
  readonly klient = input<string | undefined>();
  readonly kategoria = input<string | undefined>();

  protected readonly clientFilters = CLIENT_FILTERS;
  protected readonly clientType = computed<ClientType | null>(() => {
    const value = this.klient();
    return isClientType(value) ? value : null;
  });

  protected readonly categoriesRes = this.api.categoriesResource();
  protected readonly categories = resourceValue(this.categoriesRes, []);

  protected readonly referencesRes = this.api.referencesResource(() => ({
    client_type: this.clientType(),
    category: this.kategoria() ?? null,
  }));
  protected readonly references = resourceValue(this.referencesRes, []);

  protected setClient(value: ClientType | null): void {
    this.router.navigate([], { queryParams: { klient: value }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected setCategory(value: string): void {
    this.router.navigate([], { queryParams: { kategoria: value || null }, queryParamsHandling: 'merge', replaceUrl: true });
  }

  protected resetFilters(): void {
    this.router.navigate([], { queryParams: {}, replaceUrl: true });
  }
}
