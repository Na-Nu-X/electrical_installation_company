import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    title: 'Elektroinštalácie, revízie a bleskozvody',
    loadComponent: () => import('./pages/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'sluzby',
    title: 'Služby – elektroinštalácie, revízie, smart home',
    loadComponent: () => import('./pages/services/services.page').then((m) => m.ServicesPage),
  },
  {
    path: 'sluzby/:slug',
    // Title is set dynamically from the loaded service.
    loadComponent: () => import('./pages/service-detail/service-detail.page').then((m) => m.ServiceDetailPage),
  },
  {
    path: 'realizacie',
    title: 'Referencie a realizácie',
    loadComponent: () => import('./pages/references/references.page').then((m) => m.ReferencesPage),
  },
  {
    path: 'revizie-a-legislativa',
    title: 'Odborné revízie, bleskozvody a normy',
    loadComponent: () => import('./pages/inspections/inspections.page').then((m) => m.InspectionsPage),
  },
  {
    path: 'kalkulacka',
    title: 'Kalkulačka ceny elektroinštalácie',
    loadComponent: () => import('./pages/calculator/calculator.page').then((m) => m.CalculatorPage),
  },
  {
    path: 'dopyt',
    title: 'Nezáväzná cenová ponuka a poruchová služba',
    loadComponent: () => import('./pages/quote/quote.page').then((m) => m.QuotePage),
  },
  {
    path: '**',
    title: 'Stránka nenájdená',
    loadComponent: () => import('./pages/not-found/not-found.page').then((m) => m.NotFoundPage),
  },
];
