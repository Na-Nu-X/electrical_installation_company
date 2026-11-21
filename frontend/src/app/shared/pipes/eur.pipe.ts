import { Pipe, PipeTransform } from '@angular/core';

const EUR = new Intl.NumberFormat('sk-SK', {
  style: 'currency',
  currency: 'EUR',
  maximumFractionDigits: 0,
});

/** Formats a number / DRF decimal string as Slovak EUR, e.g. `4 900 €`. */
@Pipe({ name: 'eur' })
export class EurPipe implements PipeTransform {
  transform(value: number | string | null | undefined, fallback = 'individuálne'): string {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    const amount = typeof value === 'number' ? value : Number(value);
    return Number.isFinite(amount) ? EUR.format(amount) : fallback;
  }
}
