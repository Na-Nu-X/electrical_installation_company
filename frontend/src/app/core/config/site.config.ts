/**
 * White-label site configuration.
 *
 * Every piece of client-specific branding and business data lives here, so the
 * whole site can be rebranded for a new electrical contractor by editing this
 * single file (plus the colour tokens in `src/styles/_variables.scss`).
 *
 * All values below are illustrative placeholders for a fictional company.
 */

export interface SiteLink {
  readonly label: string;
  readonly url: string;
}

export interface TrustMetric {
  readonly value: string;
  readonly label: string;
}

export interface Testimonial {
  readonly quote: string;
  readonly author: string;
  readonly context: string;
}

export interface QualificationBadge {
  readonly label: string;
  readonly detail: string;
  readonly tone: 'tech' | 'safe' | 'amber';
  readonly icon: string;
}

const phoneHref = (phone: string): string => `tel:${phone.replace(/[^\d+]/g, '')}`;

const PHONE = '+421 2 3300 4500';
const EMERGENCY_PHONE = '+421 905 112 220';

export const SITE_CONFIG = {
  company: {
    legalName: 'Voltis Elektro s.r.o.',
    name: 'Voltis Elektro',
    /** Two-part wordmark rendered by the navbar/footer logo. */
    wordmark: { primary: 'VOLTIS', secondary: 'elektro' },
    tagline: 'Elektroinštalácie, revízie a bleskozvody s certifikovanou presnosťou',
    description:
      'Silnoprúdové a slaboprúdové rozvody, odborné prehliadky a skúšky (revízie), bleskozvody, ' +
      'inteligentné elektroinštalácie Loxone / KNX a nabíjacie stanice pre elektromobily.',
    foundedYear: 2008,
  },

  contact: {
    phone: PHONE,
    phoneHref: phoneHref(PHONE),
    emergencyPhone: EMERGENCY_PHONE,
    emergencyPhoneHref: phoneHref(EMERGENCY_PHONE),
    emergencyLabel: 'Poruchová služba 24/7',
    email: 'dopyt@voltis-elektro.sk',
    inspectionsEmail: 'revizie@voltis-elektro.sk',
    openingHours: 'Po – Pi: 7:00 – 17:00',
  },

  address: {
    street: 'Priemyselná 14',
    postalCode: '821 09',
    city: 'Bratislava',
    country: 'Slovensko',
    mapUrl: 'https://www.openstreetmap.org/search?query=Priemyseln%C3%A1%2014%2C%20Bratislava',
  },

  serviceRegion: {
    primary: 'Bratislavský, Trnavský a Nitriansky kraj',
    secondary: 'Revízie a bleskozvody pre firmy po celom Slovensku',
  },

  legal: {
    ico: '12 345 678',
    dic: '2021234567',
    icDph: 'SK2021234567',
    registry: 'Zapísaná v Obchodnom registri Mestského súdu Bratislava III, oddiel Sro, vložka č. 000000/B',
  },

  authorization: {
    authority: 'Technická inšpekcia SR',
    regulation: 'Vyhláška č. 508/2009 Z. z.',
    licenseNumber: 'Oprávnenie č. 0000/0/2019/E-OPR/EZ/E1,E2,E4/A',
    note:
      'Spoločnosť je držiteľom oprávnenia Technickej inšpekcie SR na montáž, opravy, rekonštrukcie, ' +
      'údržbu, odborné prehliadky a odborné skúšky vyhradených technických zariadení elektrických ' +
      'podľa Vyhlášky č. 508/2009 Z. z.',
  },

  partners: {
    loxone: 'Certifikovaný Loxone Partner',
    knx: 'KNX Partner – certifikovaný integrátor',
    materialBrands: ['Hager', 'Schneider Electric', 'ABB', 'DEHN', 'Loxone', 'KNX'],
  },

  warrantyMonths: 60,

  social: [
    { label: 'Facebook', url: 'https://www.facebook.com/' },
    { label: 'Instagram', url: 'https://www.instagram.com/' },
    { label: 'LinkedIn', url: 'https://www.linkedin.com/' },
  ],

  trustMetrics: [
    { value: '18+', label: 'rokov v elektrotechnike' },
    { value: '1 450+', label: 'dokončených zákaziek' },
    { value: '3 200+', label: 'vystavených revíznych správ' },
    { value: '60', label: 'mesiacov záruka na montáž' },
  ],

  qualificationBadges: [
    { label: 'Oprávnenie TI SR', detail: 'Vyhl. 508/2009 Z. z.', tone: 'safe', icon: 'shield-check' },
    { label: 'Revízny technik § 24', detail: 'E2A · E4A bleskozvody', tone: 'tech', icon: 'clipboard-check' },
    { label: 'Záruka 60 mesiacov', detail: 'na montážne práce', tone: 'amber', icon: 'award' },
  ],

  testimonials: [
    {
      quote:
        'Elektroinštaláciu nášho domu urobili presne podľa projektu, s poriadkom na stavbe a revíznou správou ' +
        'hneď v deň odovzdania. Kolaudácia prebehla bez jedinej pripomienky.',
      author: 'Mgr. Katarína Bieliková',
      context: 'Novostavba RD, Trnava',
    },
    {
      quote:
        'Rekonštrukciu stúpacieho vedenia zvládli po vchodoch tak, že obyvatelia boli bez prúdu len pár hodín. ' +
        'Komunikácia so správcom aj distribučkou bola vzorná.',
      author: 'Ing. Róbert Mikuláš',
      context: 'Predseda SVB, Žilina',
    },
    {
      quote:
        'Šesť nabíjacích staníc s load managementom bez navýšenia kapacity. Technicky čisté riešenie a ' +
        'kompletná dokumentácia pre audit.',
      author: 'Tomáš Varga',
      context: 'Facility manažér, Bratislava',
    },
  ],
} as const;

export type SiteConfig = typeof SITE_CONFIG;
