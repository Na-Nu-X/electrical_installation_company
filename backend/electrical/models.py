"""Domain models for the electrical installation & inspection company."""

from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.utils.text import slugify


def unique_slugify(instance: models.Model, value: str, slug_field: str = "slug", max_length: int = 220) -> str:
    """Return a slug derived from `value` that is unique for the instance's model."""
    base = slugify(value, allow_unicode=False)[:max_length].strip("-") or "polozka"
    slug = base
    model = type(instance)
    counter = 2
    while model.objects.filter(**{slug_field: slug}).exclude(pk=instance.pk).exists():
        suffix = f"-{counter}"
        slug = f"{base[: max_length - len(suffix)]}{suffix}"
        counter += 1
    return slug


class SlugMixin(models.Model):
    """Auto-generate a unique slug from `slug_source_field` on first save."""

    slug_source_field = "name"

    class Meta:
        abstract = True

    def save(self, *args, **kwargs):
        if not getattr(self, "slug", None):
            self.slug = unique_slugify(self, getattr(self, self.slug_source_field))
        super().save(*args, **kwargs)


class ServiceCategory(SlugMixin):
    name = models.CharField("Názov kategórie", max_length=160, unique=True)
    slug = models.SlugField("URL identifikátor", max_length=180, unique=True, blank=True)
    short_summary = models.TextField("Krátky popis", blank=True)
    icon_name = models.CharField(
        "Názov ikony",
        max_length=60,
        blank=True,
        help_text="Identifikátor ikony vo frontende (napr. home, factory, shield-check, bolt, cpu, ev-plug).",
    )
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Kategória služieb"
        verbose_name_plural = "Kategórie služieb"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class ElectricalService(SlugMixin):
    category = models.ForeignKey(
        ServiceCategory,
        verbose_name="Kategória",
        related_name="services",
        on_delete=models.PROTECT,
    )
    name = models.CharField("Názov služby", max_length=220)
    slug = models.SlugField("URL identifikátor", max_length=240, unique=True, blank=True)
    short_description = models.TextField("Krátky popis")
    detailed_description = models.TextField("Podrobný popis", blank=True)
    scope_of_work = models.JSONField(
        "Rozsah prác",
        default=list,
        blank=True,
        help_text='Zoznam krokov, napr. ["Obhliadka objektu a návrh technického riešenia", "..."]',
    )
    standards_and_certs = models.JSONField(
        "Normy a oprávnenia",
        default=list,
        blank=True,
        help_text='Napr. ["STN 33 2000-6", "Vyhláška č. 508/2009 Z. z."]',
    )
    faq = models.JSONField(
        "Časté otázky (FAQ)",
        default=list,
        blank=True,
        help_text='Zoznam objektov {"question": "...", "answer": "..."}',
    )
    typical_timeline = models.CharField("Orientačný čas realizácie", max_length=80, blank=True)
    starting_price_eur = models.DecimalField(
        "Cena od (EUR)",
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        validators=[MinValueValidator(0)],
    )
    is_featured = models.BooleanField("Zvýraznená na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    created_at = models.DateTimeField("Vytvorené", auto_now_add=True)
    updated_at = models.DateTimeField("Upravené", auto_now=True)

    class Meta:
        verbose_name = "Elektroinštalačná služba"
        verbose_name_plural = "Elektroinštalačné služby"
        ordering = ["display_order", "name"]

    def __str__(self) -> str:
        return self.name


class ReferenceProject(SlugMixin):
    class ClientType(models.TextChoices):
        RODINNY_DOM = "rodinny_dom", "Rodinný dom / Byt"
        BYTOVY_DOM = "bytovy_dom", "Bytový dom / SVB"
        FIRMA_PRIEMYSEL = "firma_priemysel", "Firma / Priemyselný objekt"

    slug_source_field = "title"

    title = models.CharField("Názov realizácie", max_length=240)
    slug = models.SlugField("URL identifikátor", max_length=260, unique=True, blank=True)
    category = models.ForeignKey(
        ServiceCategory,
        verbose_name="Kategória",
        related_name="references",
        on_delete=models.PROTECT,
    )
    client_type = models.CharField("Typ klienta", max_length=30, choices=ClientType.choices)
    location_city = models.CharField("Mesto / lokalita", max_length=120)
    challenge_summary = models.TextField("Výzva / zadanie")
    solution_summary = models.TextField("Naše riešenie")
    technical_highlights = models.JSONField(
        "Technické parametre",
        default=list,
        blank=True,
        help_text='Napr. ["Rozvádzač Hager 72 modulov", "Prepäťová ochrana T1+T2"]',
    )
    image_url = models.URLField("URL fotografie", max_length=500, blank=True)
    completion_year = models.PositiveIntegerField(
        "Rok dokončenia",
        validators=[MinValueValidator(1990), MaxValueValidator(2100)],
    )
    is_featured = models.BooleanField("Zvýraznená na úvodnej stránke", default=False)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)

    class Meta:
        verbose_name = "Referencia / realizácia"
        verbose_name_plural = "Referencie a realizácie"
        ordering = ["display_order", "-completion_year", "title"]

    def __str__(self) -> str:
        return f"{self.title} ({self.location_city}, {self.completion_year})"


class TeamSpecialist(models.Model):
    full_name = models.CharField("Meno a priezvisko", max_length=140)
    role_title = models.CharField("Pozícia", max_length=180)
    qualifications = models.CharField("Odborná spôsobilosť a certifikáty", max_length=300, blank=True)
    bio = models.TextField("Medailón", blank=True)
    photo_url = models.URLField("URL fotografie", max_length=500, blank=True)
    display_order = models.PositiveIntegerField("Poradie zobrazenia", default=0)
    is_active = models.BooleanField("Zobraziť na webe", default=True)

    class Meta:
        verbose_name = "Člen tímu"
        verbose_name_plural = "Tím a certifikovaní technici"
        ordering = ["display_order", "full_name"]

    def __str__(self) -> str:
        return f"{self.full_name} – {self.role_title}"


class ElectricalQuoteRequest(models.Model):
    class ServiceType(models.TextChoices):
        NOVOSTAVBA = "novostavba", "Elektroinštalácia novostavby"
        REKONSTRUKCIA = "rekonstrukcia", "Rekonštrukcia elektroinštalácie"
        REVIZIA = "revizia", "Odborná revízia (elektro / bleskozvod)"
        WALLBOX_FVE = "wallbox_fve", "Wallbox / Príprava pre fotovoltiku"
        SMART_HOME = "smart_home", "Inteligentná elektroinštalácia"
        PORUCHA = "porucha", "AKÚTNA PORUCHA / Výpadok prúdu"

    class ObjectType(models.TextChoices):
        BYT = "byt", "Byt"
        RODINNY_DOM = "rodinny_dom", "Rodinný dom"
        BYTOVY_DOM = "bytovy_dom", "Bytový dom"
        FIRMA_HALA = "firma_hala", "Komerčný / Priemyselný objekt"

    service_type = models.CharField("Typ požiadavky", max_length=30, choices=ServiceType.choices)
    object_type = models.CharField("Typ objektu", max_length=30, choices=ObjectType.choices)
    property_location = models.CharField("Lokalita objektu", max_length=200)
    floor_area_sqm = models.PositiveIntegerField(
        "Podlahová plocha (m²)",
        null=True,
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(100000)],
    )
    has_project_documentation = models.BooleanField("Má projektovú dokumentáciu", default=False)
    preferred_timeframe = models.CharField("Preferovaný termín", max_length=120, blank=True)
    client_name = models.CharField("Meno a priezvisko / firma", max_length=160)
    email = models.EmailField("E-mail")
    phone = models.CharField("Telefón", max_length=40)
    description = models.TextField("Popis požiadavky", blank=True)
    is_processed = models.BooleanField("Vybavené", default=False)
    created_at = models.DateTimeField("Prijaté", auto_now_add=True)

    class Meta:
        verbose_name = "Dopyt / hlásenie poruchy"
        verbose_name_plural = "Dopyty, revízie a poruchy"
        ordering = ["is_processed", "-created_at"]

    @property
    def is_urgent(self) -> bool:
        return self.service_type == self.ServiceType.PORUCHA

    def __str__(self) -> str:
        prefix = "⚠ PORUCHA – " if self.is_urgent else ""
        return f"{prefix}{self.client_name} · {self.get_service_type_display()} · {self.property_location}"
