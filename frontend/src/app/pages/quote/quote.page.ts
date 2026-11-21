import { HttpErrorResponse } from '@angular/common/http';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { AbstractControl, NonNullableFormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs';

import { SITE_CONFIG } from '../../core/config/site.config';
import {
  isQuoteObjectType,
  isQuoteServiceType,
  QUOTE_OBJECT_TYPES,
  QUOTE_SERVICE_TYPES,
  QUOTE_TIMEFRAMES,
} from '../../core/content/quote-options';
import {
  ApiValidationErrors,
  QuoteObjectType,
  QuoteRequestPayload,
  QuoteRequestResponse,
  QuoteServiceType,
} from '../../core/models/api.models';
import { ApiService } from '../../core/services/api.service';
import { ADDONS, AddonKey } from '../../shared/components/electrical-cost-estimator/estimator.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

type SubmitState = 'idle' | 'submitting' | 'success' | 'error';
type QuoteField = keyof QuotePage['form']['controls'];

const PHONE_PATTERN = /^\+?[0-9 ()/-]{9,20}$/;
const AREA_REQUIRED_FOR: readonly QuoteServiceType[] = ['novostavba', 'rekonstrukcia'];

const ERROR_MESSAGES: Record<string, string> = {
  required: 'Toto pole je povinné.',
  email: 'Zadajte platnú e-mailovú adresu.',
  pattern: 'Zadajte platné telefónne číslo (napr. +421 900 123 456).',
  minlength: 'Text je príliš krátky.',
  min: 'Hodnota je príliš nízka.',
  max: 'Hodnota je príliš vysoká.',
  requiredTrue: 'Pre odoslanie dopytu je potrebný súhlas.',
  areaRequired: 'Pre nacenenie elektroinštalácie uveďte približnú plochu.',
  faultDescription: 'Pri poruche stručne popíšte, čo sa stalo (min. 10 znakov).',
};

@Component({
  selector: 'app-quote-page',
  imports: [ReactiveFormsModule, RouterLink, IconComponent],
  templateUrl: './quote.page.html',
  styleUrl: './quote.page.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuotePage {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly api = inject(ApiService);

  // --- Pre-fill query params (`?type=&object=&area=&service=&estimate=&addons=&power=`)
  readonly type = input<string | undefined>();
  readonly object = input<string | undefined>();
  readonly area = input<string | undefined>();
  readonly service = input<string | undefined>();
  readonly estimate = input<string | undefined>();
  readonly addons = input<string | undefined>();
  readonly power = input<string | undefined>();

  protected readonly config = SITE_CONFIG;
  protected readonly serviceTypes = QUOTE_SERVICE_TYPES;
  protected readonly objectTypes = QUOTE_OBJECT_TYPES;
  protected readonly timeframes = QUOTE_TIMEFRAMES;

  protected readonly form = this.fb.group(
    {
      service_type: this.fb.control<QuoteServiceType>('novostavba', Validators.required),
      object_type: this.fb.control<QuoteObjectType>('rodinny_dom', Validators.required),
      property_location: ['', [Validators.required, Validators.maxLength(200)]],
      floor_area_sqm: this.fb.control<number | null>(null, [Validators.min(1), Validators.max(100000)]),
      has_project_documentation: [false],
      preferred_timeframe: [''],
      client_name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(160)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(PHONE_PATTERN)]],
      description: ['', [Validators.maxLength(5000)]],
      gdpr_consent: [false, Validators.requiredTrue],
      website: [''], // honeypot
    },
    { validators: [crossFieldValidator] },
  );

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });
  protected readonly selectedType = computed(() => this.formValue().service_type ?? 'novostavba');
  protected readonly isFault = computed(() => this.selectedType() === 'porucha');
  protected readonly areaRequired = computed(() => AREA_REQUIRED_FOR.includes(this.selectedType()));

  protected readonly state = signal<SubmitState>('idle');
  protected readonly submitted = signal(false);
  protected readonly result = signal<QuoteRequestResponse | null>(null);
  protected readonly generalError = signal<string | null>(null);

  /** Service referenced from a service detail page, for a friendlier pre-filled description. */
  private readonly serviceRes = this.api.serviceDetailResource(() => this.service());

  protected readonly estimateLabel = computed(() => {
    const [min, max] = (this.estimate() ?? '').split('-').map(Number);
    if (!Number.isFinite(min) || !Number.isFinite(max) || !min || !max) {
      return null;
    }
    const fmt = new Intl.NumberFormat('sk-SK', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 });
    return `${fmt.format(min)} – ${fmt.format(max)}`;
  });

  constructor() {
    // Apply query-param pre-fill whenever the params change (component is reused across links).
    effect(() => {
      const type = this.type();
      const object = this.object();
      const area = Number(this.area());
      untracked(() => {
        if (isQuoteServiceType(type)) {
          this.form.controls.service_type.setValue(type);
        }
        if (isQuoteObjectType(object)) {
          this.form.controls.object_type.setValue(object);
        }
        if (Number.isFinite(area) && area > 0) {
          this.form.controls.floor_area_sqm.setValue(Math.round(area));
        }
      });
    });

    // Pre-fill the description with context from the estimator or the service dossier.
    effect(() => {
      const lines: string[] = [];
      const serviceName = this.serviceRes.hasValue() ? this.serviceRes.value()?.name : undefined;
      if (serviceName) {
        lines.push(`Mám záujem o službu: ${serviceName}.`);
      }
      const estimate = this.estimateLabel();
      if (estimate) {
        lines.push(`Orientačná kalkulácia z webu: ${estimate}.`);
      }
      const power = this.power();
      if (power === '11' || power === '22') {
        lines.push(`Požadovaný výkon wallboxu: ${power} kW.`);
      }
      const addonLabels = (this.addons() ?? '')
        .split(',')
        .map((key) => ADDONS.find((a) => a.key === (key as AddonKey))?.label)
        .filter((label): label is string => !!label);
      if (addonLabels.length) {
        lines.push(`Doplnkové požiadavky: ${addonLabels.join(', ')}.`);
      }
      untracked(() => {
        const control = this.form.controls.description;
        if (lines.length && !control.dirty) {
          control.setValue(lines.join('\n'));
        }
      });
    });
  }

  protected selectType(value: QuoteServiceType): void {
    this.form.controls.service_type.setValue(value);
  }

  /** Returns the first human-readable error for a control (after touch or submit). */
  protected errorFor(name: QuoteField): string | null {
    const control = this.form.controls[name];
    const groupErrors = this.form.errors ?? {};
    const crossError =
      (name === 'floor_area_sqm' && groupErrors['areaRequired']) ||
      (name === 'description' && groupErrors['faultDescription']);
    const visible = control.touched || this.submitted();
    if (!visible) {
      return null;
    }
    if (control.errors) {
      const [key] = Object.keys(control.errors);
      const serverMessage = control.errors['server'];
      return typeof serverMessage === 'string' ? serverMessage : (ERROR_MESSAGES[key] ?? 'Neplatná hodnota.');
    }
    if (crossError) {
      return name === 'floor_area_sqm' ? ERROR_MESSAGES['areaRequired'] : ERROR_MESSAGES['faultDescription'];
    }
    return null;
  }

  protected submit(): void {
    this.submitted.set(true);
    this.generalError.set(null);
    this.form.markAllAsTouched();
    if (this.form.invalid || this.state() === 'submitting') {
      this.focusFirstInvalid();
      return;
    }

    const raw = this.form.getRawValue();
    const payload: QuoteRequestPayload = {
      ...raw,
      property_location: raw.property_location.trim(),
      client_name: raw.client_name.trim(),
      email: raw.email.trim(),
      phone: raw.phone.trim(),
      description: raw.description.trim(),
      floor_area_sqm: raw.floor_area_sqm ? Number(raw.floor_area_sqm) : null,
    };

    this.state.set('submitting');
    this.api
      .submitQuote(payload)
      .pipe(finalize(() => this.state.update((s) => (s === 'submitting' ? 'idle' : s))))
      .subscribe({
        next: (response) => {
          this.result.set(response);
          this.state.set('success');
          globalThis.scrollTo?.({ top: 0, behavior: 'smooth' });
        },
        error: (error: unknown) => this.handleError(error),
      });
  }

  protected reset(): void {
    this.form.reset();
    this.submitted.set(false);
    this.result.set(null);
    this.state.set('idle');
  }

  protected labelForType(value: string): string {
    return QUOTE_SERVICE_TYPES.find((o) => o.value === value)?.label ?? value;
  }

  private handleError(error: unknown): void {
    this.state.set('error');
    if (error instanceof HttpErrorResponse && error.status === 400 && error.error && typeof error.error === 'object') {
      const errors = error.error as ApiValidationErrors;
      let mapped = false;
      for (const [field, messages] of Object.entries(errors)) {
        const control = this.form.get(field);
        if (control && Array.isArray(messages) && messages.length) {
          control.setErrors({ server: messages[0] });
          mapped = true;
        }
      }
      this.generalError.set(
        mapped ? 'Skontrolujte, prosím, označené polia.' : (errors['non_field_errors']?.[0] ?? 'Dopyt sa nepodarilo odoslať.'),
      );
      this.focusFirstInvalid();
      return;
    }
    if (error instanceof HttpErrorResponse && error.status === 429) {
      this.generalError.set('Odoslali ste príliš veľa dopytov. Skúste to neskôr alebo nám zavolajte.');
      return;
    }
    this.generalError.set(
      `Dopyt sa nepodarilo odoslať. Skúste to znova alebo nám zavolajte na ${SITE_CONFIG.contact.phone}.`,
    );
  }

  private focusFirstInvalid(): void {
    queueMicrotask(() => {
      const el = document.querySelector<HTMLElement>('.quote-form .is-invalid, .quote-form [aria-invalid="true"]');
      el?.focus();
    });
  }
}

/** Mirrors the backend cross-field rules for instant feedback. */
function crossFieldValidator(group: AbstractControl): ValidationErrors | null {
  const type = group.get('service_type')?.value as QuoteServiceType | undefined;
  const area = group.get('floor_area_sqm')?.value as number | null;
  const description = String(group.get('description')?.value ?? '').trim();
  const errors: ValidationErrors = {};
  if (type && AREA_REQUIRED_FOR.includes(type) && !area) {
    errors['areaRequired'] = true;
  }
  if (type === 'porucha' && description.length < 10) {
    errors['faultDescription'] = true;
  }
  return Object.keys(errors).length ? errors : null;
}
