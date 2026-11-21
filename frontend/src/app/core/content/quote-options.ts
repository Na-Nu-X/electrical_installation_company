import { QuoteObjectType, QuoteServiceType } from '../models/api.models';

export interface Option<T extends string> {
  readonly value: T;
  readonly label: string;
  readonly hint?: string;
  readonly icon?: string;
}

/** Slovak labels matching the backend `ElectricalQuoteRequest` choices. */
export const QUOTE_SERVICE_TYPES: readonly Option<QuoteServiceType>[] = [
  { value: 'novostavba', label: 'Elektroinštalácia novostavby', hint: 'Rodinný dom, byt, prevádzka', icon: 'home' },
  { value: 'rekonstrukcia', label: 'Rekonštrukcia elektroinštalácie', hint: 'Výmena rozvodov a rozvádzača', icon: 'layers' },
  { value: 'revizia', label: 'Odborná revízia (elektro / bleskozvod)', hint: 'Východisková aj pravidelná', icon: 'clipboard-check' },
  { value: 'wallbox_fve', label: 'Wallbox / Príprava pre fotovoltiku', hint: '11 / 22 kW, FVE, TČ', icon: 'ev-plug' },
  { value: 'smart_home', label: 'Inteligentná elektroinštalácia', hint: 'Loxone / KNX', icon: 'cpu' },
  { value: 'porucha', label: 'AKÚTNA PORUCHA / Výpadok prúdu', hint: 'Rýchly výjazd technika', icon: 'alert' },
];

export const QUOTE_OBJECT_TYPES: readonly Option<QuoteObjectType>[] = [
  { value: 'byt', label: 'Byt' },
  { value: 'rodinny_dom', label: 'Rodinný dom' },
  { value: 'bytovy_dom', label: 'Bytový dom' },
  { value: 'firma_hala', label: 'Komerčný / Priemyselný objekt' },
];

export const QUOTE_TIMEFRAMES: readonly string[] = [
  'Čo najskôr',
  'Do 1 mesiaca',
  'Do 3 mesiacov',
  'O 3 – 6 mesiacov',
  'Termín zatiaľ neviem',
];

export function isQuoteServiceType(value: unknown): value is QuoteServiceType {
  return QUOTE_SERVICE_TYPES.some((o) => o.value === value);
}

export function isQuoteObjectType(value: unknown): value is QuoteObjectType {
  return QUOTE_OBJECT_TYPES.some((o) => o.value === value);
}
