"""Django admin configuration (Slovak UI for chief electricians and estimators)."""

from django.contrib import admin, messages
from django.utils.html import format_html

from .models import (
    ElectricalQuoteRequest,
    ElectricalService,
    ReferenceProject,
    ServiceCategory,
    TeamSpecialist,
)


class ElectricalServiceInline(admin.TabularInline):
    model = ElectricalService
    fields = ["name", "starting_price_eur", "typical_timeline", "is_featured", "display_order"]
    extra = 0
    show_change_link = True


@admin.register(ServiceCategory)
class ServiceCategoryAdmin(admin.ModelAdmin):
    list_display = ["name", "icon_name", "display_order", "service_total"]
    list_editable = ["display_order"]
    search_fields = ["name"]
    prepopulated_fields = {"slug": ["name"]}
    inlines = [ElectricalServiceInline]

    @admin.display(description="Počet služieb")
    def service_total(self, obj: ServiceCategory) -> int:
        return obj.services.count()


@admin.register(ElectricalService)
class ElectricalServiceAdmin(admin.ModelAdmin):
    list_display = ["name", "category", "price_display", "typical_timeline", "is_featured", "display_order"]
    list_editable = ["is_featured", "display_order"]
    list_filter = ["category", "is_featured"]
    search_fields = ["name", "short_description"]
    prepopulated_fields = {"slug": ["name"]}
    list_select_related = ["category"]
    fieldsets = [
        (None, {"fields": ["category", "name", "slug", "is_featured", "display_order"]}),
        ("Popis", {"fields": ["short_description", "detailed_description"]}),
        ("Technické údaje", {"fields": ["scope_of_work", "standards_and_certs", "typical_timeline", "starting_price_eur"]}),
        ("Časté otázky", {"fields": ["faq"], "classes": ["collapse"]}),
    ]

    @admin.display(description="Cena od", ordering="starting_price_eur")
    def price_display(self, obj: ElectricalService) -> str:
        if obj.starting_price_eur is None:
            return "individuálne"
        return f"{obj.starting_price_eur:,.0f} €".replace(",", " ")


@admin.register(ReferenceProject)
class ReferenceProjectAdmin(admin.ModelAdmin):
    list_display = ["title", "client_type", "location_city", "completion_year", "is_featured", "display_order"]
    list_editable = ["is_featured", "display_order"]
    list_filter = ["client_type", "category", "completion_year", "is_featured"]
    search_fields = ["title", "location_city"]
    prepopulated_fields = {"slug": ["title"]}
    readonly_fields = ["image_preview"]
    fieldsets = [
        (None, {"fields": ["title", "slug", "category", "client_type", "location_city", "completion_year"]}),
        ("Obsah", {"fields": ["challenge_summary", "solution_summary", "technical_highlights"]}),
        ("Prezentácia", {"fields": ["image_url", "image_preview", "is_featured", "display_order"]}),
    ]

    @admin.display(description="Náhľad")
    def image_preview(self, obj: ReferenceProject) -> str:
        if not obj.image_url:
            return "—"
        return format_html('<img src="{}" style="max-width:320px;border-radius:4px" alt="">', obj.image_url)


@admin.register(TeamSpecialist)
class TeamSpecialistAdmin(admin.ModelAdmin):
    list_display = ["full_name", "role_title", "is_active", "display_order"]
    list_editable = ["is_active", "display_order"]
    search_fields = ["full_name", "role_title", "qualifications"]


@admin.register(ElectricalQuoteRequest)
class ElectricalQuoteRequestAdmin(admin.ModelAdmin):
    list_display = [
        "urgency_badge",
        "client_name",
        "service_type",
        "object_type",
        "property_location",
        "floor_area_sqm",
        "phone",
        "created_at",
        "is_processed",
    ]
    list_display_links = ["client_name"]
    list_editable = ["is_processed"]
    list_filter = ["is_processed", "service_type", "object_type", "has_project_documentation", "created_at"]
    search_fields = ["client_name", "email", "phone", "property_location", "description"]
    date_hierarchy = "created_at"
    readonly_fields = ["created_at"]
    actions = ["mark_processed", "mark_unprocessed"]
    fieldsets = [
        ("Požiadavka", {"fields": ["service_type", "object_type", "property_location", "floor_area_sqm",
                                    "has_project_documentation", "preferred_timeframe", "description"]}),
        ("Kontakt", {"fields": ["client_name", "email", "phone"]}),
        ("Stav", {"fields": ["is_processed", "created_at"]}),
    ]

    @admin.display(description="Priorita", ordering="service_type")
    def urgency_badge(self, obj: ElectricalQuoteRequest) -> str:
        if obj.is_urgent:
            return format_html(
                '<span style="background:#b91c1c;color:#fff;padding:2px 8px;border-radius:3px;font-weight:600">{}</span>',
                "PORUCHA",
            )
        return format_html('<span style="color:#475569">{}</span>', "štandard")

    @admin.action(description="Označiť vybrané ako vybavené")
    def mark_processed(self, request, queryset):
        updated = queryset.update(is_processed=True)
        self.message_user(request, f"Vybavené: {updated} dopytov.", messages.SUCCESS)

    @admin.action(description="Označiť vybrané ako nevybavené")
    def mark_unprocessed(self, request, queryset):
        updated = queryset.update(is_processed=False)
        self.message_user(request, f"Vrátené na spracovanie: {updated} dopytov.", messages.INFO)
