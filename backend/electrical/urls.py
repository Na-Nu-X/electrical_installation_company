from rest_framework.routers import DefaultRouter

from . import views

router = DefaultRouter()
router.register("categories", views.ServiceCategoryViewSet, basename="category")
router.register("services", views.ElectricalServiceViewSet, basename="service")
router.register("references", views.ReferenceProjectViewSet, basename="reference")
router.register("team", views.TeamSpecialistViewSet, basename="team")
router.register("quotes", views.ElectricalQuoteRequestViewSet, basename="quote")

urlpatterns = router.urls
