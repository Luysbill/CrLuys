"""Backend tests for the Strategic Top Picks feature.

Covers:
- GET /api/products?top_picks=true returns exactly 8 products sorted by priority_order 1..8
- Titles + slugs match the expected priority list (incl. Ultimate Home Energy Guide rename)
- GET /api/products (no top_picks) still returns all 20 products
- GET /api/products?top_picks=true&category=smart-investing returns Keystone + Budget Planner in order
- POST /api/admin/products accepts priority_order; PUT updates it
- GET /api/admin/products includes priority_order on each product
- Idempotent migration: 8 priority products keep correct priority_order across restarts (verified
  via 2 successive GETs)
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@crluys.com"
ADMIN_PASSWORD = "CrLuys2026!"

EXPECTED_TOP_PICKS = [
    (1, "Keystone Investors Club", "keystone-investors-club", "smart-investing"),
    (2, "The Complete Skin Reset System", "complete-skin-reset-system", "health-wellness"),
    (3, "Ultimate Budget Planner", "ultimate-budget-planner", "smart-investing"),
    (4, "No Grid Survival Projects", "no-grid-survival-projects", "self-sufficiency"),
    (5, "Emergency Home Doctor", "emergency-home-doctor", "health-wellness"),
    (6, "Ultimate Home Energy Guide", None, "self-sufficiency"),  # slug may be original
    (7, "His Secret Obsession", "his-secret-obsession", "mindset-balance"),
    (8, "Mega Fitness Bundle", "mega-fitness-bundle", "fitness-nutrition"),
]


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_headers(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


class TestTopPicksList:
    def test_top_picks_returns_exactly_8(self, session):
        r = session.get(f"{API}/products", params={"top_picks": "true"})
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 8, f"Expected 8 top picks, got {len(data)}: {[p['title'] for p in data]}"

    def test_top_picks_sorted_priority_asc(self, session):
        r = session.get(f"{API}/products", params={"top_picks": "true"})
        data = r.json()
        orders = [p.get("priority_order") for p in data]
        assert orders == [1, 2, 3, 4, 5, 6, 7, 8], f"priority_order not 1..8 ascending: {orders}"

    def test_top_picks_titles_match_priority_list(self, session):
        r = session.get(f"{API}/products", params={"top_picks": "true"})
        data = r.json()
        for i, (po, title, slug, category) in enumerate(EXPECTED_TOP_PICKS):
            p = data[i]
            assert p["priority_order"] == po
            assert p["title"] == title, f"#{po} title expected '{title}' got '{p['title']}'"
            assert p["category"] == category
            if slug is not None:
                assert p["slug"] == slug

    def test_top_picks_includes_renamed_energy_guide(self, session):
        r = session.get(f"{API}/products", params={"top_picks": "true"})
        titles = [p["title"] for p in r.json()]
        assert "Ultimate Home Energy Guide" in titles
        # Old name must not appear
        assert "Ultimate Energizer Guide" not in titles


class TestProductsBackwardCompat:
    def test_all_products_still_20(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 20, f"Expected 20 products w/o filter, got {len(data)}"

    def test_top_picks_with_category_filter(self, session):
        r = session.get(f"{API}/products", params={"top_picks": "true", "category": "smart-investing"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) == 2
        assert [p["priority_order"] for p in data] == [1, 3]
        assert data[0]["title"] == "Keystone Investors Club"
        assert data[1]["title"] == "Ultimate Budget Planner"


class TestAdminPriorityOrder:
    def test_admin_list_has_priority_order(self, session, admin_headers):
        r = session.get(f"{API}/admin/products", headers=admin_headers)
        assert r.status_code == 200
        data = r.json()
        for p in data:
            assert "priority_order" in p, f"priority_order missing for {p.get('title')}"

    def test_admin_create_and_update_priority_order(self, session, admin_headers):
        title = f"TEST PriorityP {uuid.uuid4().hex[:6]}"
        payload = {
            "title": title,
            "slug": f"test-prio-{uuid.uuid4().hex[:6]}",
            "category": "mindset-balance",
            "price": 1.0,
            "priority_order": 5,
        }
        r = session.post(f"{API}/admin/products", headers=admin_headers, json=payload)
        assert r.status_code == 200, r.text
        created = r.json()
        assert created.get("priority_order") == 5, f"priority_order not persisted on create: {created}"
        pid = created["id"]

        # Update priority_order to 2
        upd = session.put(f"{API}/admin/products/{pid}", headers=admin_headers, json={"priority_order": 2})
        assert upd.status_code == 200, upd.text
        assert upd.json().get("priority_order") == 2

        # Verify via admin list
        r2 = session.get(f"{API}/admin/products", headers=admin_headers)
        match = next((p for p in r2.json() if p["id"] == pid), None)
        assert match is not None
        assert match["priority_order"] == 2

        # cleanup
        session.delete(f"{API}/admin/products/{pid}", headers=admin_headers)


class TestMigrationIdempotency:
    def test_repeated_calls_return_same_order(self, session):
        """If migration is idempotent, two GETs return identical ordering & priority_order."""
        r1 = session.get(f"{API}/products", params={"top_picks": "true"}).json()
        r2 = session.get(f"{API}/products", params={"top_picks": "true"}).json()
        sig1 = [(p["priority_order"], p["slug"]) for p in r1]
        sig2 = [(p["priority_order"], p["slug"]) for p in r2]
        assert sig1 == sig2
        # Sanity: 8 distinct priority_orders 1..8
        assert sorted([s[0] for s in sig1]) == [1, 2, 3, 4, 5, 6, 7, 8]
