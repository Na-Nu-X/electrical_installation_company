/**
 * Educational content for the inspections & compliance page.
 *
 * Intervals are orientational values commonly applied under Annex 8 of
 * Vyhláška č. 508/2009 Z. z.; the inspection technician sets the binding
 * interval in each report based on the determined external influences.
 */

export interface InspectionTopic {
  readonly icon: string;
  readonly title: string;
  readonly interval: string;
  readonly text: string;
  readonly norm: string;
}

export interface IntervalRow {
  readonly object: string;
  readonly environment: string;
  readonly electrical: string;
  readonly lightning: string;
}

export const INSPECTION_TOPICS: readonly InspectionTopic[] = [
  {
    icon: 'users',
    title: 'Bytové domy a spoločné priestory',
    interval: 'každých 5 rokov',
    text:
      'Za revíziu spoločných elektrických rozvodov, osvetlenia chodieb, pivníc a bleskozvodu zodpovedá správca alebo ' +
      'spoločenstvo vlastníkov. Chýbajúca revízna správa komplikuje poistné plnenie pri požiari či úraze.',
    norm: 'Vyhl. 508/2009 Z. z. · STN 33 2000-6',
  },
  {
    icon: 'factory',
    title: 'Komerčné a administratívne budovy',
    interval: '1 – 5 rokov podľa prostredia',
    text:
      'Zamestnávateľ je povinný zabezpečiť pravidelné odborné prehliadky a skúšky elektrických zariadení. Lehota sa ' +
      'určuje podľa vonkajších vplyvov – kancelárie, sklady, výroba, vlhké či prašné prostredie.',
    norm: 'Zákon č. 124/2006 Z. z. · Vyhl. 508/2009 Z. z.',
  },
  {
    icon: 'shield-bolt',
    title: 'Bleskozvody podľa STN EN 62305',
    interval: '2 – 5 rokov a po zásahu bleskom',
    text:
      'Pravidelná revízia overuje zachytávaciu sústavu, zvody, skúšobné svorky a zemný odpor. Mimoriadna revízia je ' +
      'potrebná po každom zásahu bleskom, oprave strechy alebo montáži fotovoltiky.',
    norm: 'STN EN 62305-3 · STN 33 2000-5-54',
  },
  {
    icon: 'file-text',
    title: 'Revízie pred kolaudáciou a pre poisťovňu',
    interval: 'pred uvedením do prevádzky',
    text:
      'Východisková revízia je podmienkou kolaudácie, pripojenia odberného miesta distribučnou spoločnosťou aj ' +
      'uzatvorenia poistenia nehnuteľnosti. Vyžadujú ju aj banky pri hypotéke na novostavbu.',
    norm: 'STN 33 2000-6 · Stavebný zákon',
  },
];

export const INTERVAL_TABLE: readonly IntervalRow[] = [
  { object: 'Byty a rodinné domy', environment: 'normálne', electrical: '5 rokov (odporúčané)', lightning: '5 rokov' },
  { object: 'Bytové domy – spoločné priestory', environment: 'normálne', electrical: '5 rokov', lightning: '5 rokov' },
  { object: 'Kancelárie a administratívne budovy', environment: 'normálne', electrical: '5 rokov', lightning: '5 rokov' },
  { object: 'Školy, zdravotnícke zariadenia, obchody', environment: 'zhromažďovacie priestory', electrical: '2 roky', lightning: '2 roky' },
  { object: 'Vonkajšie priestory, prístrešky, wallboxy', environment: 'vonkajšie', electrical: '3 roky', lightning: '3 roky' },
  { object: 'Kotolne, práčovne, poľnohospodárske objekty', environment: 'mokré / korozívne', electrical: '1 rok', lightning: '2 roky' },
  { object: 'Priestory s nebezpečenstvom požiaru alebo výbuchu', environment: 'nebezpečné', electrical: '1 rok', lightning: '1 rok' },
  { object: 'Staveniská a dočasné elektroinštalácie', environment: 'staveniskové', electrical: '6 mesiacov', lightning: '—' },
];

export const INSPECTION_PROCESS: readonly { title: string; text: string }[] = [
  { title: 'Objednávka a podklady', text: 'Dohodneme termín a vyžiadame dostupnú dokumentáciu a predchádzajúce revízne správy.' },
  { title: 'Prehliadka na mieste', text: 'Revízny technik skontroluje rozvádzače, vedenia, koncové prvky a ochranné pospájanie.' },
  { title: 'Merania a skúšky', text: 'Meranie izolačných odporov, impedancie slučky, chráničov a zemného odporu kalibrovanými prístrojmi.' },
  { title: 'Revízna správa', text: 'Do 5 pracovných dní dostanete správu so záverom, zoznamom nedostatkov a termínom ďalšej revízie.' },
];

export const INSPECTION_FAQ = [
  {
    question: 'Kto môže vykonať revíziu elektroinštalácie?',
    answer:
      'Iba revízny technik s platným osvedčením podľa § 24 Vyhlášky č. 508/2009 Z. z. v príslušnom rozsahu (napr. E2A ' +
      'pre zariadenia do 1000 V v objektoch bez nebezpečenstva výbuchu, E4A pre bleskozvody).',
  },
  {
    question: 'Čo sa stane, ak revízia nie je vykonaná včas?',
    answer:
      'Prevádzkovateľ porušuje predpisy BOZP a pri kontrole inšpektorátu práce hrozí pokuta. Pri poistnej udalosti môže ' +
      'poisťovňa krátiť plnenie, ak elektroinštalácia nemala platnú revíziu.',
  },
  {
    question: 'Ako dlho trvá revízia bytového domu?',
    answer:
      'Spoločné priestory bežného bytového domu zvládneme za 1 – 2 dni bez dlhodobého vypínania. Revízny technik ' +
      'koordinuje krátke odstávky so správcom.',
  },
  {
    question: 'Môžete po revízii odstrániť zistené nedostatky?',
    answer:
      'Áno. Zistené závady vieme naceniť a odstrániť vlastnými elektromontérmi a následne vystaviť revíznu správu bez ' +
      'nedostatkov.',
  },
];
