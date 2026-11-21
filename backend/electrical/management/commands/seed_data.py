"""Idempotent seed command: `python manage.py seed_data`.

Populates service categories, electrical & inspection services, reference
projects and licensed specialists with realistic Slovak content. Records are
matched by their natural key (name / title / full_name), so the command can be
run repeatedly without creating duplicates.
"""

from decimal import Decimal

from django.core.management.base import BaseCommand
from django.db import transaction

from electrical.models import ElectricalService, ReferenceProject, ServiceCategory, TeamSpecialist


def unsplash(photo_id: str, width: int = 1600) -> str:
    return f"https://images.unsplash.com/photo-{photo_id}?auto=format&fit=crop&w={width}&q=80"


CATEGORIES = [
    {
        "key": "domove",
        "name": "Domové a bytové elektroinštalácie",
        "short_summary": "Nové rozvody pre rodinné domy a byty, rekonštrukcie starých hliníkových rozvodov, "
        "výmena bytových rozvádzačov a hlavného domového vedenia.",
        "icon_name": "home",
        "display_order": 1,
    },
    {
        "key": "priemysel",
        "name": "Priemyselné a komerčné rozvody",
        "short_summary": "Silnoprúdové rozvody, rozvádzače podľa STN EN 61439 a napájanie technológií "
        "pre haly, kancelárie, prevádzky a obchodné priestory.",
        "icon_name": "factory",
        "display_order": 2,
    },
    {
        "key": "revizie",
        "name": "Odborné prehliadky a skúšky (Revízie)",
        "short_summary": "Východiskové a pravidelné revízie elektrických inštalácií a bleskozvodov podľa "
        "Vyhlášky č. 508/2009 Z. z. – pre kolaudáciu, poisťovňu aj správcov budov.",
        "icon_name": "clipboard-check",
        "display_order": 3,
    },
    {
        "key": "bleskozvody",
        "name": "Bleskozvody a prepäťová ochrana",
        "short_summary": "Návrh, montáž a revízia vonkajšej ochrany pred bleskom podľa STN EN 62305 "
        "a koordinovaná prepäťová ochrana T1 + T2 + T3.",
        "icon_name": "shield-bolt",
        "display_order": 4,
    },
    {
        "key": "smart",
        "name": "Smart Home & Inteligentná elektroinštalácia",
        "short_summary": "Inteligentné riadenie osvetlenia, tienenia, kúrenia a zabezpečenia na platformách "
        "Loxone a KNX – navrhnuté, naprogramované a odovzdané na kľúč.",
        "icon_name": "cpu",
        "display_order": 5,
    },
    {
        "key": "wallbox",
        "name": "Nabíjacie stanice (Wallboxy) a príprava pre FVE",
        "short_summary": "Domáce a firemné nabíjacie stanice 11 / 22 kW s dynamickým riadením výkonu "
        "a príprava rozvodov pre fotovoltiku a tepelné čerpadlo.",
        "icon_name": "ev-plug",
        "display_order": 6,
    },
]


SERVICES = [
    {
        "category": "domove",
        "name": "Kompletná elektroinštalácia rodinného domu na kľúč",
        "short_description": "Silnoprúdové aj slaboprúdové rozvody novostavby od projektu a drážkovania až po "
        "oživenie rozvádzača a východiskovú revíznu správu potrebnú ku kolaudácii.",
        "detailed_description": "Elektroinštaláciu rodinného domu realizujeme podľa projektovej dokumentácie "
        "alebo podľa návrhu, ktorý s vami pripravíme priamo na stavbe. Pracujeme výhradne so značkovým "
        "materiálom (Hager, Schneider Electric, ABB, káble NKT / Prakab) a každú zákazku odovzdávame s "
        "východiskovou revíznou správou, protokolom o určení vonkajších vplyvov a výkresom skutočného "
        "vyhotovenia. Súčasťou dodávky je aj príprava pre budúce rozšírenia – wallbox, fotovoltiku či "
        "inteligentné riadenie domu.",
        "scope_of_work": [
            "Obhliadka objektu a návrh technického riešenia",
            "Rozmeranie svetelných a zásuvkových okruhov podľa dispozície",
            "Drážkovanie, uloženie kabeláže a osadenie krabíc",
            "Slaboprúdové rozvody – UTP Cat6, TV, domový telefón, kamerový systém",
            "Zapojenie a oživenie rozvádzača s prepäťovou ochranou",
            "Kompletáž zásuviek, vypínačov a svietidiel",
            "Meranie impedancie slučky, izolačných odporov a funkčnosti prúdových chráničov",
            "Vystavenie východiskovej revíznej správy",
        ],
        "standards_and_certs": [
            "STN 33 2000-4-41",
            "STN 33 2000-5-52",
            "STN 33 2000-6",
            "STN 33 2130",
            "Vyhláška č. 508/2009 Z. z.",
        ],
        "faq": [
            {
                "question": "Kedy je správny čas objednať elektrikára na novostavbe?",
                "answer": "Ideálne ešte pred omietkami – po osadení okien a pred podlahami. Prvá fáza (hrubá "
                "inštalácia) trvá zvyčajne 7 – 12 dní, kompletáž prebieha po maľovaní.",
            },
            {
                "question": "Je revízna správa súčasťou ceny?",
                "answer": "Áno. Ku každej elektroinštalácii vystavujeme východiskovú revíznu správu, ktorú "
                "potrebujete ku kolaudácii a k pripojeniu odberného miesta distribučnou spoločnosťou.",
            },
            {
                "question": "Viete pripraviť dom na wallbox a fotovoltiku?",
                "answer": "Samozrejme. Navrhneme dimenzovanie prívodu, rezervu v rozvádzači a chráničky "
                "k streche aj ku garáži, aby bolo neskoršie rozšírenie bez sekania.",
            },
        ],
        "typical_timeline": "15 – 25 pracovných dní",
        "starting_price_eur": Decimal("4900"),
        "is_featured": True,
        "display_order": 1,
    },
    {
        "category": "domove",
        "name": "Rekonštrukcia bytových rozvodov a výmena ističovej skrine",
        "short_description": "Výmena starých hliníkových rozvodov za medené, nový bytový rozvádzač s prúdovými "
        "chráničmi a navýšenie počtu zásuviek podľa súčasných nárokov domácnosti.",
        "detailed_description": "Pôvodné hliníkové rozvody v panelových a tehlových bytoch sú po 40 – 50 rokoch "
        "prevádzky častým zdrojom porúch aj požiarov. Pri rekonštrukcii navrhneme nové rozdelenie okruhov "
        "(kuchyňa, kúpeľňa, klimatizácia, varná doska 3×16 A), osadíme moderný rozvádzač s chráničmi "
        "a pracujeme čisto – s priemyselným vysávačom pri drážkovaní a zakrytím podláh.",
        "scope_of_work": [
            "Obhliadka a meranie pôvodnej inštalácie",
            "Demontáž hliníkových rozvodov a starej poistkovej skrine",
            "Bezprašné drážkovanie a uloženie medenej kabeláže CYKY",
            "Osadenie nového bytového rozvádzača s prúdovými chráničmi 30 mA",
            "Samostatné okruhy pre kuchyňu, kúpeľňu a varnú dosku",
            "Kompletáž koncových prvkov a svietidiel",
            "Vystavenie východiskovej revíznej správy",
        ],
        "standards_and_certs": ["STN 33 2000-4-41", "STN 33 2000-7-701", "STN 33 2000-6", "Vyhláška č. 508/2009 Z. z."],
        "faq": [
            {
                "question": "Dá sa rekonštrukcia urobiť po izbách, keď v byte bývame?",
                "answer": "Áno, postupujeme po etapách tak, aby ste mali počas prác funkčnú aspoň časť bytu. "
                "Kompletná rekonštrukcia 3-izbového bytu však býva najrýchlejšia v prázdnom byte.",
            },
            {
                "question": "Potrebujem na výmenu rozvádzača súhlas správcu?",
                "answer": "Ak sa mení iba bytový rozvádzač za elektromerom, súhlas správcu nie je potrebný. "
                "Pri zásahu do stúpacieho vedenia (HDV) komunikujeme so správcom a distribučnou spoločnosťou my.",
            },
        ],
        "typical_timeline": "5 – 10 pracovných dní",
        "starting_price_eur": Decimal("2400"),
        "is_featured": True,
        "display_order": 2,
    },
    {
        "category": "domove",
        "name": "Rekonštrukcia hlavného domového vedenia (HDV) v bytovom dome",
        "short_description": "Výmena stúpacieho vedenia, elektromerových rozvádzačov a rozvodov spoločných "
        "priestorov bytového domu s minimálnymi výpadkami pre obyvateľov.",
        "detailed_description": "Rekonštrukciu HDV pripravujeme v spolupráci so správcom alebo SVB – od "
        "projektovej dokumentácie, cez koordináciu s distribučnou spoločnosťou (ZSD, SSD, VSD) až po "
        "prepojenie jednotlivých bytov. Výpadky napájania plánujeme po vchodoch a vždy ich vopred oznamujeme.",
        "scope_of_work": [
            "Zameranie objektu a spracovanie projektovej dokumentácie",
            "Koordinácia so správcom a distribučnou spoločnosťou",
            "Montáž nového stúpacieho vedenia v káblových žľaboch",
            "Výmena elektromerových rozvádzačov na podlažiach",
            "Nové osvetlenie spoločných priestorov so senzormi pohybu",
            "Prepojenie bytov a vystavenie východiskovej revíznej správy",
        ],
        "standards_and_certs": ["STN 33 2000-5-52", "STN EN 61439-1", "STN 33 2000-6", "Vyhláška č. 508/2009 Z. z."],
        "faq": [
            {
                "question": "Ako dlho budú byty bez elektriny?",
                "answer": "Pri prepájaní konkrétneho bytu zvyčajne 2 – 4 hodiny. Termíny vopred vyvesíme "
                "vo vchode a prispôsobíme ich potrebám obyvateľov.",
            },
        ],
        "typical_timeline": "4 – 8 týždňov",
        "starting_price_eur": Decimal("8500"),
        "is_featured": False,
        "display_order": 3,
    },
    {
        "category": "priemysel",
        "name": "Silnoprúdové rozvody a rozvádzače pre komerčné a priemyselné objekty",
        "short_description": "Napájanie výrobných technológií, kancelárií a skladov – výroba a montáž rozvádzačov, "
        "káblové trasy, kompenzácia jalového výkonu a núdzové osvetlenie.",
        "detailed_description": "Pre firmy a developerov realizujeme elektroinštalácie hál, administratívnych "
        "budov a obchodných prevádzok. Dodávame typovo odskúšané rozvádzače podľa STN EN 61439, káblové "
        "trasy v žľaboch a rebríkoch, núdzové a protipanické osvetlenie a meranie spotreby po jednotlivých "
        "technológiách. Práce plánujeme tak, aby neobmedzili chod prevádzky.",
        "scope_of_work": [
            "Analýza príkonu a návrh rozvodnej sústavy TN-C-S / TN-S",
            "Výroba a dodávka rozvádzačov RH, RS a technologických rozvádzačov",
            "Montáž káblových trás, žľabov a protipožiarnych upchávok",
            "Napájanie strojov a technológií do 630 A",
            "Núdzové osvetlenie a centrálny vypínač (CENTRAL STOP)",
            "Meranie, oživenie a vystavenie východiskovej revíznej správy",
        ],
        "standards_and_certs": ["STN EN 61439-1, -2", "STN 33 2000-5-52", "STN EN 1838", "STN EN 50110-1", "Vyhláška č. 508/2009 Z. z."],
        "faq": [
            {
                "question": "Pracujete aj počas víkendov a odstávok?",
                "answer": "Áno. Pri prevádzkach, ktoré nemôžu stáť, plánujeme práce na víkendy, nočné zmeny "
                "alebo celozávodné dovolenky.",
            },
            {
                "question": "Viete dodať aj projektovú dokumentáciu?",
                "answer": "Áno, v spolupráci s autorizovaným projektantom dodávame dokumentáciu pre stavebné "
                "povolenie aj realizačný projekt elektroinštalácie.",
            },
        ],
        "typical_timeline": "podľa rozsahu (4 – 12 týždňov)",
        "starting_price_eur": None,
        "is_featured": False,
        "display_order": 4,
    },
    {
        "category": "revizie",
        "name": "Odborná prehliadka a odborná skúška (Revízia) elektroinštalácie",
        "short_description": "Východiskové a pravidelné revízie elektrických inštalácií bytov, domov, bytových "
        "domov aj firiem – s revíznou správou platnou pre kolaudáciu, poisťovňu a inšpekciu práce.",
        "detailed_description": "Revíziu vykonáva revízny technik s osvedčením podľa § 24 Vyhlášky "
        "č. 508/2009 Z. z. Súčasťou je prehliadka, meranie izolačných odporov, impedancie poruchovej "
        "slučky, kontrola prúdových chráničov a ochranného pospájania. Výsledkom je revízna správa so "
        "zoznamom zistených nedostatkov a odporúčaním termínu ďalšej revízie.",
        "scope_of_work": [
            "Kontrola dokumentácie a určenia vonkajších vplyvov",
            "Vizuálna prehliadka rozvádzačov, vedení a koncových prvkov",
            "Meranie izolačného odporu a impedancie poruchovej slučky",
            "Skúška prúdových chráničov a ochranného pospájania",
            "Vyhodnotenie a odporúčanie odstránenia nedostatkov",
            "Vystavenie revíznej správy (tlačená aj PDF verzia)",
        ],
        "standards_and_certs": ["STN 33 2000-6", "STN 33 1500", "Vyhláška č. 508/2009 Z. z.", "§ 24 – Revízny technik E2A"],
        "faq": [
            {
                "question": "Ako často musím robiť revíziu elektroinštalácie?",
                "answer": "Závisí od typu objektu a prostredia. Pre bytové domy a kancelárie je typická lehota "
                "5 rokov, pre vlhké a vonkajšie priestory kratšia. Presnú lehotu uvedieme v revíznej správe.",
            },
            {
                "question": "Potrebujem revíziu aj pri predaji bytu?",
                "answer": "Zákon ju fyzickým osobám pri predaji priamo neukladá, kupujúci a banky ju však "
                "čoraz častejšie vyžadujú. Revízna správa zvyšuje dôveryhodnosť nehnuteľnosti.",
            },
            {
                "question": "Čo ak revízia odhalí nedostatky?",
                "answer": "Nedostatky popíšeme v správe s návrhom riešenia. Ich odstránenie vám vieme naceniť "
                "a realizovať, potom vystavíme novú revíznu správu bez závad.",
            },
        ],
        "typical_timeline": "1 – 3 pracovné dni",
        "starting_price_eur": Decimal("120"),
        "is_featured": True,
        "display_order": 1,
    },
    {
        "category": "revizie",
        "name": "Revízia bleskozvodu a meranie uzemnenia",
        "short_description": "Pravidelná odborná prehliadka a skúška vonkajšej ochrany pred bleskom vrátane "
        "merania zemného odporu a kontroly spojov a skúšobných svoriek.",
        "detailed_description": "Pri revízii bleskozvodu skontrolujeme zachytávaciu sústavu, zvody, skúšobné "
        "svorky a uzemnenie, odmeriame zemný odpor a prechodové odpory spojov. Revízna správa je "
        "akceptovaná poisťovňami aj pri kolaudácii.",
        "scope_of_work": [
            "Vizuálna kontrola zachytávačov, zvodov a podpier",
            "Kontrola skúšobných svoriek a mechanických spojov",
            "Meranie zemného odporu a prechodových odporov",
            "Kontrola dodržania dostatočných vzdialeností",
            "Vystavenie revíznej správy bleskozvodu",
        ],
        "standards_and_certs": ["STN EN 62305-3", "STN 33 2000-6", "Vyhláška č. 508/2009 Z. z.", "§ 24 – Revízny technik E4A"],
        "faq": [
            {
                "question": "Ako často sa robí revízia bleskozvodu?",
                "answer": "Pri bežných obytných a administratívnych budovách spravidla raz za 5 rokov, pri "
                "objektoch so zvýšeným rizikom častejšie a vždy po zásahu bleskom.",
            },
        ],
        "typical_timeline": "1 pracovný deň",
        "starting_price_eur": Decimal("90"),
        "is_featured": False,
        "display_order": 2,
    },
    {
        "category": "bleskozvody",
        "name": "Návrh, montáž a revízia aktívneho aj pasívneho bleskozvodu",
        "short_description": "Kompletná vonkajšia ochrana pred bleskom – výpočet rizika, návrh zachytávacej "
        "sústavy, montáž zvodov, uzemňovacej sústavy a záverečná revízia.",
        "detailed_description": "Navrhujeme klasické (pasívne) mrežové bleskozvody aj aktívne bleskozvody "
        "s predstihovým výbojom (ESE). Výber riešenia vychádza z analýzy rizika podľa STN EN 62305-2, "
        "typu strechy a požiadaviek architekta. Používame komponenty DEHN a OBO Bettermann s certifikáciou "
        "pre triedu ochrany LPS I – IV.",
        "scope_of_work": [
            "Analýza rizika a určenie triedy ochrany LPS",
            "Návrh zachytávacej sústavy a zvodov",
            "Montáž zachytávačov, podpier a zvodov na strechu a fasádu",
            "Realizácia obvodového alebo základového uzemnenia",
            "Ochranné pospájanie a dostatočné vzdialenosti",
            "Meranie zemného odporu a vystavenie revíznej správy",
        ],
        "standards_and_certs": ["STN EN 62305-1 až 4", "STN 33 2000-5-54", "STN EN 62561", "Vyhláška č. 508/2009 Z. z."],
        "faq": [
            {
                "question": "Je bleskozvod na rodinnom dome povinný?",
                "answer": "Povinnosť vyplýva z projektu a analýzy rizika. Pri novostavbách ho stavebný úrad "
                "zvyčajne vyžaduje, pri domoch s fotovoltikou ho dôrazne odporúčame.",
            },
            {
                "question": "Aký je rozdiel medzi aktívnym a pasívnym bleskozvodom?",
                "answer": "Pasívny bleskozvod chráni sústavou vodičov a tyčí po celej streche. Aktívny (ESE) "
                "používa jeden zachytávač s väčším ochranným polomerom – vhodný pri členitých strechách.",
            },
        ],
        "typical_timeline": "3 – 7 pracovných dní",
        "starting_price_eur": Decimal("1450"),
        "is_featured": True,
        "display_order": 1,
    },
    {
        "category": "bleskozvody",
        "name": "Prepäťová ochrana T1 + T2 + T3 v rozvádzači",
        "short_description": "Koordinovaná ochrana elektroinštalácie, kotla, tepelného čerpadla a elektroniky "
        "pred prepätím z úderu blesku a spínacích dejov v sieti.",
        "detailed_description": "Doplnenie prepäťovej ochrany do existujúceho alebo nového rozvádzača. "
        "Zvodiče typu 1 + 2 osadzujeme na vstupe do objektu, typ 3 pri citlivých spotrebičoch. Pri objektoch "
        "s fotovoltikou riešime aj DC ochranu striedača.",
        "scope_of_work": [
            "Posúdenie existujúceho rozvádzača a uzemnenia",
            "Návrh koordinovanej prepäťovej ochrany",
            "Montáž zvodičov T1 + T2 na vstupe a T3 pri spotrebičoch",
            "Doplnenie ochranného pospájania",
            "Revízia a vystavenie revíznej správy",
        ],
        "standards_and_certs": ["STN 33 2000-4-443", "STN 33 2000-5-534", "STN EN 61643-11"],
        "faq": [
            {
                "question": "Potrebujem prepäťovú ochranu, ak nemám bleskozvod?",
                "answer": "Áno. Prepätie sa do domu dostane aj vedením z distribučnej siete. Zvodič T1 + T2 "
                "ochráni rozvody aj drahé spotrebiče.",
            },
        ],
        "typical_timeline": "1 pracovný deň",
        "starting_price_eur": Decimal("290"),
        "is_featured": False,
        "display_order": 2,
    },
    {
        "category": "smart",
        "name": "Inteligentná elektroinštalácia Loxone / KNX",
        "short_description": "Riadenie osvetlenia, žalúzií, kúrenia, rekuperácie a zabezpečenia z jednej "
        "aplikácie – navrhnuté a naprogramované certifikovaným partnerom Loxone a KNX.",
        "detailed_description": "Inteligentnú elektroinštaláciu navrhujeme s ohľadom na reálne používanie domu. "
        "Rozvody budujeme hviezdicovo do centrálneho rozvádzača, čo umožňuje kedykoľvek meniť logiku bez "
        "sekania. Programovanie, vizualizáciu a zaškolenie robíme vo vlastnej réžii a poskytujeme vzdialenú "
        "servisnú podporu.",
        "scope_of_work": [
            "Konzultácia scenárov a návrh funkcií domu",
            "Projekt hviezdicovej kabeláže a centrálneho rozvádzača",
            "Montáž riadiacich modulov Loxone Miniserver / KNX aktorov",
            "Integrácia tienenia, kúrenia, rekuperácie a FVE",
            "Programovanie scén, vizualizácia a mobilná aplikácia",
            "Zaškolenie užívateľov a vzdialená servisná podpora",
        ],
        "standards_and_certs": ["STN EN 50491", "STN EN 50090 (KNX)", "STN 33 2000-6", "Certifikovaný Loxone Partner"],
        "faq": [
            {
                "question": "Je inteligentná inštalácia oveľa drahšia ako klasická?",
                "answer": "Investícia je zvyčajne o 30 – 60 % vyššia, no vráti sa úsporami na kúrení a "
                "pohodlím. Navrhneme rozsah, ktorý dáva zmysel pre váš rozpočet.",
            },
            {
                "question": "Čo ak Miniserver alebo internet prestane fungovať?",
                "answer": "Základné funkcie (svetlá, zásuvky) ostávajú ovládateľné lokálne. Systém nie je "
                "závislý od cloudu a internet slúži len na vzdialený prístup.",
            },
        ],
        "typical_timeline": "20 – 35 pracovných dní",
        "starting_price_eur": Decimal("6900"),
        "is_featured": True,
        "display_order": 1,
    },
    {
        "category": "wallbox",
        "name": "Inštalácia Wallboxu pre elektromobil s dynamickým riadením výkonu",
        "short_description": "Domáca alebo firemná nabíjacia stanica 11 / 22 kW vrátane samostatného prívodu, "
        "ochrán, dynamického riadenia výkonu a revíznej správy.",
        "detailed_description": "Pred inštaláciou overíme rezervovanú kapacitu odberného miesta (napr. 3×25 A) "
        "a navrhneme dynamické riadenie výkonu tak, aby nabíjanie nikdy nevyhodilo hlavný istič. Inštalujeme "
        "wallboxy ABB, Schneider Electric EVlink, Wallbox a Keba, vrátane prepojenia s fotovoltikou pre "
        "nabíjanie z prebytkov.",
        "scope_of_work": [
            "Overenie hlavného ističa a rezervovanej kapacity",
            "Návrh dimenzovania prívodu a ochrán (RCD typ A-EV / B)",
            "Uloženie kábla a montáž wallboxu na stenu alebo stĺpik",
            "Nastavenie dynamického riadenia výkonu a RFID",
            "Prepojenie s fotovoltikou pre nabíjanie z prebytkov",
            "Vystavenie revíznej správy pre dotácie a poisťovňu",
        ],
        "standards_and_certs": ["STN 33 2000-7-722", "STN EN IEC 61851-1", "STN 33 2000-6", "Vyhláška č. 508/2009 Z. z."],
        "faq": [
            {
                "question": "Stačí mi hlavný istič 3×25 A na 11 kW wallbox?",
                "answer": "Vo väčšine domácností áno – vďaka dynamickému riadeniu výkonu wallbox automaticky "
                "uberá výkon, keď beží napríklad varná doska alebo tepelné čerpadlo.",
            },
            {
                "question": "Pomôžete s dotáciou na nabíjaciu stanicu?",
                "answer": "Dodáme revíznu správu, faktúru a technickú dokumentáciu požadovanú v aktuálnych "
                "dotačných výzvach a poradíme s podaním žiadosti.",
            },
        ],
        "typical_timeline": "1 – 2 pracovné dni",
        "starting_price_eur": Decimal("890"),
        "is_featured": True,
        "display_order": 1,
    },
]


REFERENCES = [
    {
        "title": "Kompletná silnoprúdová a slaboprúdová elektroinštalácia novostavby 5-izbového RD",
        "category": "domove",
        "client_type": ReferenceProject.ClientType.RODINNY_DOM,
        "location_city": "Trnava",
        "challenge_summary": "Novostavba bungalovu s úžitkovou plochou 186 m² s tepelným čerpadlom, plánovanou "
        "fotovoltikou a požiadavkou na kvalitné Wi-Fi pokrytie celého domu aj záhrady.",
        "solution_summary": "Zrealizovali sme kompletné rozvody vrátane štruktúrovanej kabeláže Cat6 do každej "
        "miestnosti, prípravy pre FVE a wallbox v garáži. Rozvádzač sme osadili s rezervou 30 % pre budúce "
        "rozšírenia.",
        "technical_highlights": [
            "Rozvádzač Hager 72 modulov",
            "Prepäťová ochrana T1+T2",
            "UTP Cat6 – 18 dátových zásuviek",
            "Certifikovaná revízna správa",
        ],
        "image_url": unsplash("1600585154340-be6161a56a0c"),
        "completion_year": 2026,
        "is_featured": True,
        "display_order": 1,
    },
    {
        "title": "Rekonštrukcia hlavného domového vedenia (HDV) v 8-poschodovom bytovom dome",
        "category": "domove",
        "client_type": ReferenceProject.ClientType.BYTOVY_DOM,
        "location_city": "Žilina",
        "challenge_summary": "Pôvodné hliníkové stúpacie vedenie z roku 1979 pre 48 bytov, opakované výpadky "
        "a nevyhovujúce elektromerové rozvádzače podľa požiadaviek SSD.",
        "solution_summary": "Po etapách po jednotlivých vchodoch sme vymenili stúpacie vedenie za medené, osadili "
        "nové elektromerové rozvádzače a zmodernizovali osvetlenie spoločných priestorov so senzormi pohybu.",
        "technical_highlights": [
            "48 bytov bez dlhodobého výpadku",
            "Medené stúpacie vedenie 4×35 mm²",
            "LED osvetlenie so senzormi – úspora 62 %",
            "Koordinácia so SSD a správcom",
        ],
        "image_url": unsplash("1545324418-cc1a3fa10c00"),
        "completion_year": 2025,
        "is_featured": True,
        "display_order": 2,
    },
    {
        "title": "Inštalácia 6× 22 kW nabíjacích staníc pre firemný vozový park",
        "category": "wallbox",
        "client_type": ReferenceProject.ClientType.FIRMA_PRIEMYSEL,
        "location_city": "Bratislava",
        "challenge_summary": "Technologická firma prechádzala na elektromobily a potrebovala nabíjať 12 vozidiel "
        "bez navýšenia rezervovanej kapacity administratívnej budovy.",
        "solution_summary": "Navrhli sme nabíjací uzol so šiestimi dvojbodovými stanicami 22 kW s centrálnym "
        "load managementom, RFID autorizáciou a evidenciou spotreby pre každého zamestnanca.",
        "technical_highlights": [
            "6× ABB Terra AC 22 kW",
            "Dynamický load management",
            "RCD typ B, samostatný rozvádzač",
            "Evidencia spotreby cez OCPP",
        ],
        "image_url": unsplash("1593941707882-a5bba14938c7"),
        "completion_year": 2026,
        "is_featured": True,
        "display_order": 3,
    },
    {
        "title": "Pravidelná revízia elektroinštalácie a bleskozvodu v logistickej hale",
        "category": "revizie",
        "client_type": ReferenceProject.ClientType.FIRMA_PRIEMYSEL,
        "location_city": "Nitra",
        "challenge_summary": "Logistická hala s plochou 12 000 m² v nepretržitej prevádzke potrebovala pravidelnú "
        "revíziu pre poisťovňu bez prerušenia expedície.",
        "solution_summary": "Revíziu sme rozdelili do nočných zmien po sekciách. Odovzdali sme revíznu správu s "
        "fotodokumentáciou a prioritizovaným plánom odstránenia zistených nedostatkov.",
        "technical_highlights": [
            "12 000 m² bez prerušenia prevádzky",
            "38 rozvádzačov, 2 400 meraní",
            "Termovízna kontrola rozvádzačov",
            "Revízia bleskozvodu – 24 zvodov",
        ],
        "image_url": unsplash("1586528116311-ad8dd3c8310d"),
        "completion_year": 2026,
        "is_featured": True,
        "display_order": 4,
    },
    {
        "title": "Inteligentná elektroinštalácia Loxone v rodinnej vile",
        "category": "smart",
        "client_type": ReferenceProject.ClientType.RODINNY_DOM,
        "location_city": "Banská Bystrica",
        "challenge_summary": "Majitelia vily chceli jednoduché ovládanie osvetlenia, exteriérových žalúzií, "
        "podlahového kúrenia a zabezpečenia – bez desiatok rôznych aplikácií.",
        "solution_summary": "Navrhli sme systém Loxone s centrálnym rozvádzačom, scénami pre ráno, odchod a noc, "
        "automatickým tienením podľa slnka a integráciou fotovoltiky a rekuperácie.",
        "technical_highlights": [
            "Loxone Miniserver Gen. 2",
            "64 svetelných okruhov, 22 žalúzií",
            "Integrácia FVE 10 kWp a rekuperácie",
            "Úspora energie na kúrenie 23 %",
        ],
        "image_url": unsplash("1600607687939-ce8a6c25118c"),
        "completion_year": 2025,
        "is_featured": False,
        "display_order": 5,
    },
    {
        "title": "Rekonštrukcia elektroinštalácie 3-izbového bytu v panelovom dome",
        "category": "domove",
        "client_type": ReferenceProject.ClientType.RODINNY_DOM,
        "location_city": "Košice",
        "challenge_summary": "Byt s pôvodnými hliníkovými rozvodmi, poistkovou skriňou a jedným okruhom pre celú "
        "kuchyňu – nedostatočné pre indukčnú varnú dosku a klimatizáciu.",
        "solution_summary": "Za 7 pracovných dní sme vymenili celú inštaláciu za medenú, rozdelili ju do 14 okruhov "
        "a osadili bytový rozvádzač s chráničmi. Drážkovanie prebehlo bezprašne s odsávaním.",
        "technical_highlights": [
            "14 samostatných okruhov",
            "Rozvádzač Schneider Resi9",
            "Prívod 3×16 A pre varnú dosku",
            "Hotovo za 7 pracovných dní",
        ],
        "image_url": unsplash("1621905252507-b35492cc74b4"),
        "completion_year": 2026,
        "is_featured": False,
        "display_order": 6,
    },
]


TEAM = [
    {
        "full_name": "Ing. Peter Horváth",
        "role_title": "Konateľ & Revízny technik E2A",
        "qualifications": "Osvedčenie § 24 Vyhl. 508/2009 Z. z. (E2A), Certifikovaný Loxone Partner",
        "bio": "Viac ako 18 rokov v elektrotechnike, od montáží rodinných domov po revízie priemyselných "
        "areálov. Zodpovedá za kvalitu každej odovzdanej zákazky a revíznej správy.",
        "photo_url": unsplash("1560250097-0b93528c311a", 800),
        "display_order": 1,
    },
    {
        "full_name": "Martin Kováč",
        "role_title": "Vedúci elektromontér & Elektrotechnik špecialista",
        "qualifications": "Osvedčenie § 23 Vyhl. 508/2009 Z. z. (E2A), KNX Partner, EV Charging Specialist",
        "bio": "Vedie montážne tímy na novostavbách aj rekonštrukciách. Špecializuje sa na rozvádzače, "
        "nabíjacie stanice a inteligentné elektroinštalácie KNX.",
        "photo_url": unsplash("1507003211169-0a1dd7228f2d", 800),
        "display_order": 2,
    },
    {
        "full_name": "Ing. Lucia Šimková",
        "role_title": "Projektantka & Revízna technička bleskozvodov",
        "qualifications": "Osvedčenie § 24 Vyhl. 508/2009 Z. z. (E4A – bleskozvody), autorizovaná projektantka",
        "bio": "Navrhuje elektroinštalácie a ochranu pred bleskom pre rodinné domy, bytové domy a priemyselné "
        "objekty. Vypracúva analýzy rizika podľa STN EN 62305-2.",
        "photo_url": unsplash("1573496359142-b8d87734a5a2", 800),
        "display_order": 3,
    },
]


class Command(BaseCommand):
    help = "Naplní databázu ukážkovými kategóriami, službami, referenciami a tímom (idempotentne)."

    @transaction.atomic
    def handle(self, *args, **options):
        categories: dict[str, ServiceCategory] = {}
        for data in CATEGORIES:
            data = dict(data)
            key = data.pop("key")
            category, _ = ServiceCategory.objects.update_or_create(name=data.pop("name"), defaults=data)
            categories[key] = category

        for data in SERVICES:
            data = dict(data)
            data["category"] = categories[data["category"]]
            ElectricalService.objects.update_or_create(name=data.pop("name"), defaults=data)

        for data in REFERENCES:
            data = dict(data)
            data["category"] = categories[data["category"]]
            ReferenceProject.objects.update_or_create(title=data.pop("title"), defaults=data)

        for data in TEAM:
            data = dict(data)
            TeamSpecialist.objects.update_or_create(full_name=data.pop("full_name"), defaults=data)

        self.stdout.write(
            self.style.SUCCESS(
                f"Hotovo: {ServiceCategory.objects.count()} kategórií, "
                f"{ElectricalService.objects.count()} služieb, "
                f"{ReferenceProject.objects.count()} referencií, "
                f"{TeamSpecialist.objects.count()} členov tímu."
            )
        )
