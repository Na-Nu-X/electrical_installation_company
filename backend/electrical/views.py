"""Public REST API views."""

from django.db.models import Count
from rest_framework import mixins, viewsets
from rest_framework.permissions import AllowAny

from .filters import ElectricalServiceFilter, ReferenceProjectFilter
from .models import (
    ElectricalQuoteRequest,
    ElectricalService,
    ReferenceProject,
    ServiceCategory,
    TeamSpecialist,
)
from .serializers import (
    ElectricalQuoteRequestSerializer,
    ElectricalServiceDetailSerializer,
    ElectricalServiceListSerializer,
    ReferenceProjectSerializer,
    ServiceCategorySerializer,
    TeamSpecialistSerializer,
)


class ServiceCategoryViewSet(viewsets.ReadOnlyModelViewSet):
    serializer_class = ServiceCategorySerializer
    lookup_field = "slug"
    filter_backends: list = []
    pagination_class = None

    def get_queryset(self):
        return ServiceCategory.objects.annotate(service_count=Count("services")).order_by("display_order", "name")


class ElectricalServiceViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ElectricalService.objects.select_related("category")
    lookup_field = "slug"
    filterset_class = ElectricalServiceFilter
    # JSONField lookups are text-based on SQLite/PostgreSQL, so `standards_and_certs`
    # is searchable via icontains on its serialized form.
    search_fields = ["name", "short_description", "standards_and_certs", "category__name"]
    ordering_fields = ["name", "starting_price_eur", "display_order"]
    ordering = ["category__display_order", "display_order", "name"]

    def get_serializer_class(self):
        if self.action == "retrieve":
            return ElectricalServiceDetailSerializer
        return ElectricalServiceListSerializer


class ReferenceProjectViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = ReferenceProject.objects.select_related("category")
    serializer_class = ReferenceProjectSerializer
    lookup_field = "slug"
    filterset_class = ReferenceProjectFilter
    search_fields = ["title", "location_city"]
    ordering_fields = ["completion_year", "display_order"]
    ordering = ["display_order", "-completion_year"]


class TeamSpecialistViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TeamSpecialist.objects.filter(is_active=True)
    serializer_class = TeamSpecialistSerializer
    filter_backends: list = []


class ElectricalQuoteRequestViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = ElectricalQuoteRequest.objects.none()
    serializer_class = ElectricalQuoteRequestSerializer
    permission_classes = [AllowAny]
    authentication_classes: list = []  # public form: no session auth, so no CSRF requirement
    throttle_scope = "quotes"
