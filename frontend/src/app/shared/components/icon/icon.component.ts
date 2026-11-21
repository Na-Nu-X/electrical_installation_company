import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * Minimal line-icon set (24×24, 1.75 stroke) drawn for a technical,
 * architectural look. Icons are decorative by default (`aria-hidden`).
 */
const ICONS: Record<string, readonly string[]> = {
  home: ['M3 10.5 12 3l9 7.5', 'M5 9.5V21h14V9.5', 'M10 21v-6h4v6'],
  factory: ['M3 21V10l6 4v-4l6 4V5h6v16Z', 'M7 17h2', 'M12 17h2', 'M17 17h2'],
  'clipboard-check': [
    'M9 3.5h6v3H9Z',
    'M9 5H6.5A1.5 1.5 0 0 0 5 6.5v13A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5v-13A1.5 1.5 0 0 0 17.5 5H15',
    'm9 13.5 2 2 4-4',
  ],
  'shield-bolt': ['M12 3 4.5 6v5.5c0 4.6 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.9 7.5-9.5V6Z', 'm12.8 7.5-2.6 4.5h3.6l-2.6 4.5'],
  'shield-check': ['M12 3 4.5 6v5.5c0 4.6 3.2 7.9 7.5 9.5 4.3-1.6 7.5-4.9 7.5-9.5V6Z', 'm9 12 2 2 4-4'],
  cpu: ['M7 7h10v10H7Z', 'M10 10h4v4h-4Z', 'M10 3v4M14 3v4M10 17v4M14 17v4M3 10h4M3 14h4M17 10h4M17 14h4'],
  'ev-plug': ['M9 3v4M15 3v4', 'M6.5 7h11v3.5a5.5 5.5 0 0 1-11 0Z', 'M12 16v5'],
  layers: ['m12 3 9 5-9 5-9-5Z', 'm3 13 9 5 9-5'],
  alert: ['M10.3 4.2 2.6 18a2 2 0 0 0 1.7 3h15.4a2 2 0 0 0 1.7-3L13.7 4.2a2 2 0 0 0-3.4 0Z', 'M12 9.5v4', 'M12 17h.01'],
  phone: [
    'M5 4h3.5l2 5-2.4 1.5a11 11 0 0 0 5.4 5.4L15 13.5l5 2V19a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  ],
  mail: ['M3.5 5.5h17v13h-17Z', 'm3.5 6.5 8.5 6 8.5-6'],
  'map-pin': ['M12 21s-7-6.2-7-11a7 7 0 0 1 14 0c0 4.8-7 11-7 11Z', 'M12 7.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5Z'],
  check: ['m5 12.5 4.5 4.5L19 7.5'],
  'arrow-right': ['M5 12h14', 'm13 6 6 6-6 6'],
  'arrow-left': ['M19 12H5', 'm11 6-6 6 6 6'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  x: ['M6 6l12 12', 'M18 6 6 18'],
  clock: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 7.5V12l3 2'],
  award: ['M12 3a6 6 0 1 0 0 12 6 6 0 0 0 0-12Z', 'm8.5 13.6-1.5 7.4 5-2.8 5 2.8-1.5-7.4'],
  'file-text': ['M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8Z', 'M14 3v5h5', 'M9 13h6', 'M9 17h6'],
  search: ['M11 4a7 7 0 1 0 0 14 7 7 0 0 0 0-14Z', 'm20 20-4-4'],
  'chevron-down': ['m6 9 6 6 6-6'],
  users: [
    'M16 20v-1a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v1',
    'M9 4a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M22 20v-1a4 4 0 0 0-3-3.9',
    'M16 4.1a4 4 0 0 1 0 7.8',
  ],
  ruler: ['M3 17 17 3l4 4L7 21Z', 'm7.5 12.5 2 2', 'm10.5 9.5 2 2', 'm13.5 6.5 2 2'],
  calendar: ['M4 6h16v15H4Z', 'M4 10h16', 'M8 3v4', 'M16 3v4'],
  bolt: ['M13 2.5 5 13.5h6l-1 8 8-11h-6Z'],
  sun: [
    'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Z',
    'M12 2.5v2M12 19.5v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2.5 12h2M19.5 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4',
  ],
  network: ['M9 3h6v5H9Z', 'M3 16h6v5H3Z', 'M15 16h6v5h-6Z', 'M12 8v4', 'M6 16v-4h12v4'],
  quote: ['M6.5 7H10v4c0 3-1.3 5-4 6', 'M14 7h3.5v4c0 3-1.3 5-4 6'],
  tool: ['M14.7 6.3a4 4 0 0 0 5 5L13 18l-3 3-4-4 3-3 6.7-6.7a4 4 0 0 1-1-1Z', 'M14.7 6.3 17 4'],
  gauge: ['M12 14a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z', 'm13.4 10.6 3.1-3.1', 'M4 18a9 9 0 1 1 16 0'],
  info: ['M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Z', 'M12 11v5', 'M12 8h.01'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[style.--icon-size.px]': 'size()',
    'aria-hidden': 'true',
  },
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth()"
      stroke-linecap="round"
      stroke-linejoin="round"
      focusable="false"
    >
      @for (d of paths(); track $index) {
        <path [attr.d]="d" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-flex;
      flex: none;
      width: var(--icon-size, 20px);
      height: var(--icon-size, 20px);
    }
    svg {
      width: 100%;
      height: 100%;
    }
  `,
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input<number>(20);
  readonly strokeWidth = input<number>(1.75);

  protected readonly paths = computed(() => ICONS[this.name()] ?? ICONS['bolt']);
}
