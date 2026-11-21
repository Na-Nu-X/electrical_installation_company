import { DOCUMENT } from '@angular/common';
import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive } from '@angular/router';
import { filter } from 'rxjs';

import { SITE_CONFIG } from '../../../core/config/site.config';
import { IconComponent } from '../icon/icon.component';
import { LogoComponent } from '../logo/logo.component';

interface NavItem {
  readonly label: string;
  readonly path: string;
}

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterLinkActive, IconComponent, LogoComponent],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    '[class.is-scrolled]': 'scrolled()',
    '(window:scroll)': 'onScroll()',
    '(document:keydown.escape)': 'close()',
  },
})
export class NavbarComponent {
  private readonly document = inject(DOCUMENT);

  protected readonly config = SITE_CONFIG;
  protected readonly items: readonly NavItem[] = [
    { label: 'Služby', path: '/sluzby' },
    { label: 'Realizácie', path: '/realizacie' },
    { label: 'Revízie & Normy', path: '/revizie-a-legislativa' },
    { label: 'Kalkulačka ceny', path: '/kalkulacka' },
  ];

  protected readonly menuOpen = signal(false);
  protected readonly scrolled = signal(false);

  constructor() {
    inject(Router)
      .events.pipe(
        filter((e) => e instanceof NavigationEnd),
        takeUntilDestroyed(inject(DestroyRef)),
      )
      .subscribe(() => this.close());

    // Lock page scroll while the mobile drawer is open.
    effect(() => {
      this.document.body.classList.toggle('no-scroll', this.menuOpen());
    });
  }

  protected toggle(): void {
    this.menuOpen.update((open) => !open);
  }

  protected close(): void {
    this.menuOpen.set(false);
  }

  protected onScroll(): void {
    this.scrolled.set((this.document.defaultView?.scrollY ?? 0) > 8);
  }
}
