"""Query-string filters for the public API."""

import django_filters

from .models import ElectricalService, ReferenceProject


class ElectricalServiceFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = ElectricalService
        fields = ["category", "featured"]


class ReferenceProjectFilter(django_filters.FilterSet):
    category = django_filters.CharFilter(field_name="category__slug")
    client_type = django_filters.ChoiceFilter(choices=ReferenceProject.ClientType.choices)
    featured = django_filters.BooleanFilter(field_name="is_featured")

    class Meta:
        model = ReferenceProject
        fields = ["category", "client_type", "featured"]
