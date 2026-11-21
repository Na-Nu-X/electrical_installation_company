from django.core.management import call_command
from django.test import TestCase
from rest_framework.test import APIClient

from .models import ElectricalQuoteRequest, ElectricalService


class PublicApiTests(TestCase):
    @classmethod
    def setUpTestData(cls):
        call_command("seed_data", verbosity=0)

    def setUp(self):
        self.client = APIClient()

    def test_seed_is_idempotent(self):
        call_command("seed_data", verbosity=0)
        self.assertEqual(ElectricalService.objects.count(), 10)

    def test_categories_include_service_counts(self):
        data = self.client.get("/api/categories/").json()
        self.assertEqual(len(data), 6)
        self.assertEqual(sum(c["service_count"] for c in data), 10)

    def test_service_filters_and_search(self):
        featured = self.client.get("/api/services/", {"featured": "true"}).json()
        self.assertTrue(featured and all(s["is_featured"] for s in featured))
        by_cat = self.client.get("/api/services/", {"category": "bleskozvody-a-prepatova-ochrana"}).json()
        self.assertEqual(len(by_cat), 2)
        found = self.client.get("/api/services/", {"search": "62305"}).json()
        self.assertTrue(any("bleskozvod" in s["name"].lower() for s in found))
        ordered = self.client.get("/api/services/", {"ordering": "starting_price_eur"}).json()
        prices = [float(s["starting_price_eur"]) for s in ordered if s["starting_price_eur"] is not None]
        self.assertEqual(prices, sorted(prices))

    def test_service_detail(self):
        slug = ElectricalService.objects.first().slug
        data = self.client.get(f"/api/services/{slug}/").json()
        self.assertIn("faq", data)
        self.assertIn("detailed_description", data)
        self.assertIn("name", data["category"])

    def test_references_filter_by_client_type(self):
        data = self.client.get("/api/references/", {"client_type": "firma_priemysel"}).json()
        self.assertEqual(len(data), 2)

    def test_team(self):
        self.assertEqual(len(self.client.get("/api/team/").json()), 3)

    def _quote(self, **overrides):
        payload = {
            "service_type": "novostavba",
            "object_type": "rodinny_dom",
            "property_location": "Trnava",
            "floor_area_sqm": 150,
            "client_name": "Ján Novák",
            "email": "jan@example.sk",
            "phone": "+421 900 123 456",
            "gdpr_consent": True,
        }
        payload.update(overrides)
        return self.client.post("/api/quotes/", payload, format="json")

    def test_quote_create(self):
        response = self._quote()
        self.assertEqual(response.status_code, 201, response.content)
        self.assertEqual(ElectricalQuoteRequest.objects.count(), 1)

    def test_quote_validation(self):
        response = self._quote(phone="abc", gdpr_consent=False, floor_area_sqm=None)
        self.assertEqual(response.status_code, 400)
        errors = response.json()
        self.assertIn("phone", errors)
        self.assertIn("gdpr_consent", errors)

    def test_fault_report_requires_description(self):
        response = self._quote(service_type="porucha", floor_area_sqm=None, description="")
        self.assertEqual(response.status_code, 400)
        self.assertIn("description", response.json())

    def test_quote_list_not_exposed(self):
        self.assertEqual(self.client.get("/api/quotes/").status_code, 405)
