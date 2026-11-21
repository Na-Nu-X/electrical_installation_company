import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-not-found-page',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="section">
      <div class="container">
        <div class="state-box">
          <p class="code mono">404</p>
          <h3>Stránka nebola nájdená</h3>
          <p>Okruh je pravdepodobne odpojený. Skúste sa vrátiť na úvod alebo si pozrite naše služby.</p>
          <div class="actions">
            <a class="btn btn--primary" routerLink="/">Na úvodnú stránku</a>
            <a class="btn btn--secondary" routerLink="/sluzby">Prehľad služieb</a>
          </div>
        </div>
      </div>
    </section>
  `,
  styles: `
    .code {
      font-size: 3rem;
      font-weight: 600;
      color: var(--color-primary);
      margin-bottom: 0.5rem;
    }
    .actions {
      display: flex;
      flex-wrap: wrap;
      justify-content: center;
      gap: 0.75rem;
    }
  `,
})
export class NotFoundPage {}
