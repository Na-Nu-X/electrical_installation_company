import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Meta, Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { SITE_CONFIG } from '../config/site.config';

const suffix = ` | ${SITE_CONFIG.company.name}`;

/** Updates document title and meta description for the current page. */
@Injectable({ providedIn: 'root' })
export class SeoService {
  private readonly title = inject(Title);
  private readonly meta = inject(Meta);
  private readonly document = inject(DOCUMENT);

  update(pageTitle: string, description?: string): void {
    this.title.setTitle(pageTitle ? `${pageTitle}${suffix}` : SITE_CONFIG.company.name);
    const content = description ?? SITE_CONFIG.company.description;
    this.meta.updateTag({ name: 'description', content });
    this.meta.updateTag({ property: 'og:title', content: pageTitle || SITE_CONFIG.company.name });
    this.meta.updateTag({ property: 'og:description', content });
    this.document.documentElement.lang = 'sk';
  }
}

/** Applies the static `title` defined on each route, suffixed with the company name. */
@Injectable({ providedIn: 'root' })
export class SiteTitleStrategy extends TitleStrategy {
  private readonly seo = inject(SeoService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const title = this.buildTitle(snapshot);
    if (title !== undefined) {
      this.seo.update(title);
    }
  }
}
