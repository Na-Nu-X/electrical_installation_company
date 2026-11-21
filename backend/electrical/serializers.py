"""DRF serializers for the public electrical company API."""

import re

from rest_framework import serializers

from .models import (
    ElectricalQuoteRequest,
    ElectricalService,
    ReferenceProject,
    ServiceCategory,
    TeamSpecialist,
)


class ServiceCategorySerializer(serializers.ModelSerializer):
    service_count = serializers.IntegerField(read_only=True)

    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "short_summary", "icon_name", "display_order", "service_count"]


class CategoryBriefSerializer(serializers.ModelSerializer):
    class Meta:
        model = ServiceCategory
        fields = ["id", "name", "slug", "icon_name"]


class ElectricalServiceListSerializer(serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)

    class Meta:
        model = ElectricalService
        fields = [
            "id",
            "name",
            "slug",
            "category",
            "short_description",
            "scope_of_work",
            "standards_and_certs",
            "typical_timeline",
            "starting_price_eur",
            "is_featured",
        ]


class ElectricalServiceDetailSerializer(ElectricalServiceListSerializer):
    class Meta(ElectricalServiceListSerializer.Meta):
        fields = ElectricalServiceListSerializer.Meta.fields + ["detailed_description", "faq", "updated_at"]


class ReferenceProjectSerializer(serializers.ModelSerializer):
    category = CategoryBriefSerializer(read_only=True)
    client_type_display = serializers.CharField(source="get_client_type_display", read_only=True)

    class Meta:
        model = ReferenceProject
        fields = [
            "id",
            "title",
            "slug",
            "category",
            "client_type",
            "client_type_display",
            "location_city",
            "challenge_summary",
            "solution_summary",
            "technical_highlights",
            "image_url",
            "completion_year",
            "is_featured",
        ]


class TeamSpecialistSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamSpecialist
        fields = ["id", "full_name", "role_title", "qualifications", "bio", "photo_url"]


PHONE_RE = re.compile(r"^\+?[0-9 ()/-]{9,20}$")


class ElectricalQuoteRequestSerializer(serializers.ModelSerializer):
    # Honeypot field: real users never see or fill it.
    website = serializers.CharField(write_only=True, required=False, allow_blank=True)
    gdpr_consent = serializers.BooleanField(write_only=True)

    class Meta:
        model = ElectricalQuoteRequest
        fields = [
            "id",
            "service_type",
            "object_type",
            "property_location",
            "floor_area_sqm",
            "has_project_documentation",
            "preferred_timeframe",
            "client_name",
            "email",
            "phone",
            "description",
            "created_at",
            "website",
            "gdpr_consent",
        ]
        read_only_fields = ["id", "created_at"]
        extra_kwargs = {
            "client_name": {"error_messages": {"blank": "Zadajte, prosím, vaše meno alebo názov firmy."}},
            "email": {"error_messages": {"invalid": "Zadajte platnú e-mailovú adresu."}},
            "property_location": {"error_messages": {"blank": "Uveďte obec alebo adresu objektu."}},
        }

    def validate_phone(self, value: str) -> str:
        value = value.strip()
        if not PHONE_RE.match(value):
            raise serializers.ValidationError("Zadajte platné telefónne číslo (napr. +421 900 123 456).")
        return value

    def validate_client_name(self, value: str) -> str:
        value = value.strip()
        if len(value) < 3:
            raise serializers.ValidationError("Meno musí mať aspoň 3 znaky.")
        return value

    def validate_gdpr_consent(self, value: bool) -> bool:
        if not value:
            raise serializers.ValidationError("Pre spracovanie dopytu je potrebný súhlas so spracovaním osobných údajov.")
        return value

    def validate_website(self, value: str) -> str:
        if value:
            raise serializers.ValidationError("Neplatný dopyt.")
        return value

    def validate(self, attrs):
        service_type = attrs.get("service_type")
        description = (attrs.get("description") or "").strip()
        if service_type == ElectricalQuoteRequest.ServiceType.PORUCHA and len(description) < 10:
            raise serializers.ValidationError(
                {"description": "Pri hlásení poruchy stručne popíšte, čo sa stalo (min. 10 znakov)."}
            )
        if service_type in {
            ElectricalQuoteRequest.ServiceType.NOVOSTAVBA,
            ElectricalQuoteRequest.ServiceType.REKONSTRUKCIA,
        } and not attrs.get("floor_area_sqm"):
            raise serializers.ValidationError(
                {"floor_area_sqm": "Pre nacenenie elektroinštalácie uveďte približnú podlahovú plochu."}
            )
        return attrs

    def create(self, validated_data):
        validated_data.pop("website", None)
        validated_data.pop("gdpr_consent", None)
        return super().create(validated_data)
