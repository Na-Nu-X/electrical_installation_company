/**
 * Pure pricing model for the electrical cost estimator.
 *
 * All numbers are orientational (EUR incl. VAT, material + labour) and are
 * intentionally kept in one place so the contractor can tune their price list.
 */
import { QuoteObjectType, QuoteServiceType } from '../../../core/models/api.models';

export type RealizationType = 'novostavba' | 'rekonstrukcia' | 'revizia' | 'wallbox';
export type EstimatorObjectType = 'byt' | 'rodinny_dom' | 'komercny';
export type AddonKey = 'bleskozvod' | 'prepatova' | 'fve' | 'slaboprud';
export type WallboxPower = 11 | 22;

export interface EstimatorInput {
  type: RealizationType;
  object: EstimatorObjectType;
  /** Floor area in m² (ignored for wallbox). */
  area: number;
  /** Cable distance from the main distribution board in metres (wallbox only). */
  distance: number;
  power: WallboxPower;
  addons: ReadonlySet<AddonKey>;
}

export interface EstimateResult {
  priceMin: number;
  priceMax: number;
  daysMin: number;
  daysMax: number;
  documents: string[];
  lineItems: { label: string; amount: number }[];
}

interface Choice<T> {
  readonly value: T;
  readonly label: string;
  readonly hint: string;
  readonly icon: string;
}

export const REALIZATION_TYPES: readonly Choice<RealizationType>[] = [
  { value: 'novostavba', label: 'Kompletná elektroinštalácia novostavby', hint: 'Silnoprúd + rozvádzač', icon: 'home' },
  { value: 'rekonstrukcia', label: 'Rekonštrukcia starej elektroinštalácie', hint: 'Al → Cu, nový rozvádzač', icon: 'layers' },
  { value: 'revizia', label: 'Odborná revízia (elektro + bleskozvod)', hint: 'Revízna správa § 24', icon: 'clipboard-check' },
  { value: 'wallbox', label: 'Inštalácia Wallboxu (11 / 22 kW)', hint: 'Vrátane prívodu a ochrán', icon: 'ev-plug' },
];

export const OBJECT_TYPES: readonly Choice<EstimatorObjectType>[] = [
  { value: 'byt', label: 'Byt', hint: '', icon: 'layers' },
  { value: 'rodinny_dom', label: 'Rodinný dom', hint: '', icon: 'home' },
  { value: 'komercny', label: 'Komerčný / Firemný priestor', hint: '', icon: 'factory' },
];

export interface AddonDefinition {
  readonly key: AddonKey;
  readonly label: string;
  readonly spec: string;
  readonly icon: string;
}

export const ADDONS: readonly AddonDefinition[] = [
  { key: 'bleskozvod', label: 'Montáž bleskozvodu a uzemnenia', spec: 'STN EN 62305', icon: 'shield-bolt' },
  { key: 'prepatova', label: 'Prepäťová ochrana T1+T2 v rozvádzači', spec: 'STN 33 2000-4-443', icon: 'shield-check' },
  { key: 'fve', label: 'Príprava pre fotovoltiku / tepelné čerpadlo', spec: 'FVE · TČ', icon: 'sun' },
  { key: 'slaboprud', label: 'Slaboprúdové rozvody (UTP internet + kamerový systém)', spec: 'Cat6 · IP CCTV', icon: 'network' },
];

export const AREA_RANGE = { min: 30, max: 400, step: 5 } as const;
export const DISTANCE_RANGE = { min: 5, max: 50, step: 1 } as const;

/** Which add-ons make sense for a realization type / object combination. */
export function isAddonAvailable(addon: AddonKey, type: RealizationType, object: EstimatorObjectType): boolean {
  if (addon === 'bleskozvod' && object === 'byt') {
    return false; // lightning protection is a building-level system
  }
  switch (type) {
    case 'novostavba':
    case 'rekonstrukcia':
      return true;
    case 'revizia':
      return addon === 'bleskozvod';
    case 'wallbox':
      return addon === 'prepatova' || addon === 'fve';
  }
}

export function addonLabel(addon: AddonKey, type: RealizationType): string {
  if (type === 'revizia' && addon === 'bleskozvod') {
    return 'Revízia bleskozvodu a meranie uzemnenia';
  }
  return ADDONS.find((a) => a.key === addon)?.label ?? addon;
}

const RATE_PER_M2: Record<'novostavba' | 'rekonstrukcia', Record<EstimatorObjectType, number>> = {
  novostavba: { byt: 62, rodinny_dom: 58, komercny: 52 },
  rekonstrukcia: { byt: 78, rodinny_dom: 72, komercny: 64 },
};
const MINIMUM: Record<'novostavba' | 'rekonstrukcia', number> = { novostavba: 2900, rekonstrukcia: 1900 };

const roundTo = (value: number, step: number): number => Math.round(value / step) * step;

export function calculateEstimate(input: EstimatorInput): EstimateResult {
  const { type, object, area, distance, power } = input;
  const addons = [...input.addons].filter((a) => isAddonAvailable(a, type, object));
  const lineItems: { label: string; amount: number }[] = [];
  let days = 0;

  // --- Base work -----------------------------------------------------------
  switch (type) {
    case 'novostavba':
    case 'rekonstrukcia': {
      const amount = Math.max(MINIMUM[type], area * RATE_PER_M2[type][object]);
      lineItems.push({
        label: type === 'novostavba' ? `Silnoprúdové rozvody a rozvádzač (${area} m²)` : `Výmena rozvodov a rozvádzača (${area} m²)`,
        amount,
      });
      days = type === 'novostavba' ? 3 + area / 12 : 2 + area / 10;
      break;
    }
    case 'revizia': {
      const base = { byt: 90, rodinny_dom: 120, komercny: 190 }[object];
      const perM2 = { byt: 0.9, rodinny_dom: 0.8, komercny: 1.1 }[object];
      lineItems.push({ label: `Revízia elektroinštalácie (${area} m²)`, amount: base + area * perM2 });
      days = 1 + area / 250;
      break;
    }
    case 'wallbox': {
      const base = power === 22 ? 1190 : 890;
      lineItems.push({ label: `Wallbox ${power} kW s dynamickým riadením výkonu`, amount: base });
      lineItems.push({ label: `Prívodný kábel a trasa (${distance} m)`, amount: distance * (power === 22 ? 22 : 16) });
      if (object === 'komercny') {
        lineItems.push({ label: 'Stĺpik, RFID a pripojenie OCPP', amount: 420 });
      }
      days = power === 22 || object === 'komercny' ? 2 : 1;
      break;
    }
  }

  // --- Add-ons -------------------------------------------------------------
  for (const addon of addons) {
    let amount = 0;
    switch (addon) {
      case 'bleskozvod':
        if (type === 'revizia') {
          amount = object === 'komercny' ? 180 : 90;
          days += 0.5;
        } else {
          amount = object === 'komercny' ? 2800 + area * 3 : 1450 + area * 2;
          days += 3;
        }
        break;
      case 'prepatova':
        amount = object === 'komercny' ? 590 : 290;
        days += 0.5;
        break;
      case 'fve':
        amount = object === 'komercny' ? 890 : 390;
        days += 1;
        break;
      case 'slaboprud':
        amount = Math.max(600, area * 14);
        days += area / 60;
        break;
    }
    lineItems.push({ label: addonLabel(addon, type), amount });
  }

  const total = lineItems.reduce((sum, item) => sum + item.amount, 0);

  return {
    priceMin: roundTo(total * 0.9, 50),
    priceMax: roundTo(total * 1.18, 50),
    daysMin: Math.max(1, Math.round(days * 0.85)),
    daysMax: Math.max(1, Math.ceil(days * 1.15)),
    documents: documentsFor(type, addons),
    lineItems: lineItems.map((i) => ({ ...i, amount: roundTo(i.amount, 10) })),
  };
}

function documentsFor(type: RealizationType, addons: AddonKey[]): string[] {
  const docs: string[] = [];
  switch (type) {
    case 'novostavba':
    case 'rekonstrukcia':
      docs.push(
        'Východisková revízna správa (STN 33 2000-6)',
        'Protokol o určení vonkajších vplyvov',
        'Výkres skutočného vyhotovenia rozvádzača',
      );
      break;
    case 'revizia':
      docs.push(
        'Revízna správa elektroinštalácie (Vyhl. 508/2009 Z. z.)',
        'Zoznam nedostatkov s odporúčaním riešenia',
        'Termín ďalšej pravidelnej revízie',
      );
      break;
    case 'wallbox':
      docs.push(
        'Revízna správa nabíjacej stanice (STN 33 2000-7-722)',
        'Protokol o nastavení dynamického riadenia výkonu',
        'Podklady pre dotáciu a poisťovňu',
      );
      break;
  }
  if (addons.includes('bleskozvod')) {
    docs.push('Revízna správa bleskozvodu (STN EN 62305)');
  }
  if (type !== 'revizia') {
    docs.push('Záručný list – 60 mesiacov na montáž');
  }
  return docs;
}

/** Map estimator selections onto the quote form query params. */
export function toQuoteParams(input: EstimatorInput, result: EstimateResult): Record<string, string | number> {
  const type: Record<RealizationType, QuoteServiceType> = {
    novostavba: 'novostavba',
    rekonstrukcia: 'rekonstrukcia',
    revizia: 'revizia',
    wallbox: 'wallbox_fve',
  };
  const object: Record<EstimatorObjectType, QuoteObjectType> = {
    byt: 'byt',
    rodinny_dom: 'rodinny_dom',
    komercny: 'firma_hala',
  };
  const params: Record<string, string | number> = {
    type: type[input.type],
    object: object[input.object],
    estimate: `${result.priceMin}-${result.priceMax}`,
  };
  if (input.type !== 'wallbox') {
    params['area'] = input.area;
  } else {
    params['power'] = input.power;
  }
  const addons = [...input.addons].filter((a) => isAddonAvailable(a, input.type, input.object));
  if (addons.length) {
    params['addons'] = addons.join(',');
  }
  return params;
}
