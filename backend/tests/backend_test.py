"""Backend tests for CrLuys LifeStyle API.

Covers:
- Health
- Categories (order)
- Public products (list, filter, search, detail)
- Newsletter (success + idempotency)
- Contact creation
- Auth (login success/fail, /auth/me, protected access)
- Admin product CRUD
- Admin subscribers, messages
- No _id leakage in any response
"""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback: read from frontend .env
    with open("/app/frontend/.env") as f:
        for line in f:
            if line.startswith("REACT_APP_BACKEND_URL="):
                BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
                break

API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@crluys.com"
ADMIN_PASSWORD = "CrLuys2026!"

EXPECTED_CATEGORY_ORDER = [
    "smart-investing",
    "health-wellness",
    "fitness-nutrition",
    "self-sufficiency",
    "mindset-balance",
]


def _no_underscore_id(obj):
    """Recursively assert no '_id' key in any dict in obj."""
    if isinstance(obj, dict):
        assert "_id" not in obj, f"Found _id in response: {obj}"
        for v in obj.values():
            _no_underscore_id(v)
    elif isinstance(obj, list):
        for it in obj:
            _no_underscore_id(it)


@pytest.fixture(scope="session")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return r.json()["token"]


@pytest.fixture(scope="session")
def auth_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}"}


# ---------------- Health ----------------
class TestHealth:
    def test_root(self, session):
        r = session.get(f"{API}/")
        assert r.status_code == 200
        data = r.json()
        assert data.get("status") == "ok"
        assert data.get("app") == "CrLuys LifeStyle"


# ---------------- Categories ----------------
class TestCategories:
    def test_list_categories_order(self, session):
        r = session.get(f"{API}/categories")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) == 5
        slugs = [c["slug"] for c in data]
        assert slugs == EXPECTED_CATEGORY_ORDER
        # numbers
        numbers = [c["number"] for c in data]
        assert numbers == ["01", "02", "03", "04", "05"]
        _no_underscore_id(data)


# ---------------- Public products ----------------
class TestPublicProducts:
    def test_list_all_products(self, session):
        r = session.get(f"{API}/products")
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # 20 seeded products expected
        assert len(data) >= 20, f"Expected >=20, got {len(data)}"
        # field presence
        sample = data[0]
        for k in ["id", "title", "slug", "category", "price", "image_url", "affiliate_url",
                  "benefits", "testimonials", "faq", "rating", "reviews_count"]:
            assert k in sample, f"missing {k} in product"
        _no_underscore_id(data)

    def test_filter_by_category(self, session):
        r = session.get(f"{API}/products", params={"category": "smart-investing"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) > 0
        for p in data:
            assert p["category"] == "smart-investing"

    def test_search_keystone(self, session):
        r = session.get(f"{API}/products", params={"q": "keystone"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1
        assert any("keystone" in p["title"].lower() for p in data)

    def test_search_case_insensitive(self, session):
        # mixed case
        r = session.get(f"{API}/products", params={"q": "KEYSTONE"})
        assert r.status_code == 200
        data = r.json()
        assert len(data) >= 1

    def test_get_product_by_slug(self, session):
        r = session.get(f"{API}/products/keystone-investors-club")
        assert r.status_code == 200
        data = r.json()
        assert data["slug"] == "keystone-investors-club"
        assert data["title"] == "Keystone Investors Club"
        assert isinstance(data["benefits"], list) and len(data["benefits"]) > 0
        assert isinstance(data["testimonials"], list) and len(data["testimonials"]) > 0
        assert isinstance(data["faq"], list) and len(data["faq"]) > 0
        _no_underscore_id(data)

    def test_get_product_not_found(self, session):
        r = session.get(f"{API}/products/this-does-not-exist-xyz")
        assert r.status_code == 404


# ---------------- Newsletter & Contact ----------------
class TestNewsletter:
    def test_subscribe(self, session):
        email = f"test_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True

    def test_subscribe_idempotent(self, session):
        email = f"test_idem_{uuid.uuid4().hex[:8]}@example.com"
        r1 = session.post(f"{API}/newsletter", json={"email": email})
        assert r1.status_code == 200
        r2 = session.post(f"{API}/newsletter", json={"email": email})
        assert r2.status_code == 200, f"Re-submit failed: {r2.status_code} {r2.text}"
        assert r2.json().get("ok") is True


class TestContact:
    def test_submit_contact(self, session):
        payload = {
            "name": "TEST_User",
            "email": f"TEST_{uuid.uuid4().hex[:6]}@example.com",
            "message": "Hello from automated test.",
        }
        r = session.post(f"{API}/contact", json=payload)
        assert r.status_code == 200
        data = r.json()
        assert data.get("ok") is True


# ---------------- Auth ----------------
class TestAuth:
    def test_login_success(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
        assert r.status_code == 200
        data = r.json()
        assert "token" in data and isinstance(data["token"], str) and len(data["token"]) > 20
        assert data["user"]["email"] == ADMIN_EMAIL
        assert data["user"]["role"] == "admin"
        # httpOnly cookie set
        assert "access_token" in r.cookies, "access_token cookie not set"
        _no_underscore_id(data)

    def test_login_wrong_password(self, session):
        r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrong-pw"})
        assert r.status_code == 401

    def test_login_unknown_email(self, session):
        r = session.post(f"{API}/auth/login", json={"email": "nobody@example.com", "password": "x"})
        assert r.status_code == 401

    def test_me_with_bearer(self, session, auth_headers):
        r = session.get(f"{API}/auth/me", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert data["email"] == ADMIN_EMAIL
        assert data["role"] == "admin"
        _no_underscore_id(data)

    def test_me_no_token(self, session):
        # Use a fresh session without cookies
        s = requests.Session()
        r = s.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_invalid_token(self):
        s = requests.Session()
        r = s.get(f"{API}/auth/me", headers={"Authorization": "Bearer invalid.token.here"})
        assert r.status_code == 401


# ---------------- Admin Products ----------------
class TestAdminProducts:
    def test_unauth_rejected(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/products")
        assert r.status_code == 401

    def test_invalid_token_rejected(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/products", headers={"Authorization": "Bearer garbage"})
        assert r.status_code == 401

    def test_admin_list_products(self, session, auth_headers):
        r = session.get(f"{API}/admin/products", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        assert len(data) >= 20
        _no_underscore_id(data)

    def test_admin_create_with_auto_slug(self, session, auth_headers):
        title = f"TEST Product {uuid.uuid4().hex[:6]}"
        payload = {
            "title": title,
            "slug": "",  # empty -> auto
            "category": "smart-investing",
            "price": 12.34,
        }
        r = session.post(f"{API}/admin/products", headers=auth_headers, json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data["title"] == title
        assert data["slug"], "auto slug missing"
        assert data["slug"] == data["slug"].lower()
        assert "id" in data
        _no_underscore_id(data)
        # cleanup
        session.delete(f"{API}/admin/products/{data['id']}", headers=auth_headers)

    def test_admin_update_product(self, session, auth_headers):
        # create
        payload = {
            "title": f"TEST Upd {uuid.uuid4().hex[:6]}",
            "slug": f"test-upd-{uuid.uuid4().hex[:6]}",
            "category": "fitness-nutrition",
            "price": 9.99,
        }
        r = session.post(f"{API}/admin/products", headers=auth_headers, json=payload)
        assert r.status_code == 200
        pid = r.json()["id"]

        upd = session.put(f"{API}/admin/products/{pid}", headers=auth_headers,
                          json={"price": 19.99, "title": "TEST Upd Renamed"})
        assert upd.status_code == 200, upd.text
        assert upd.json()["price"] == 19.99
        assert upd.json()["title"] == "TEST Upd Renamed"

        # Verify via GET (public by slug)
        slug = upd.json()["slug"]
        g = session.get(f"{API}/products/{slug}")
        assert g.status_code == 200
        assert g.json()["price"] == 19.99

        # cleanup
        session.delete(f"{API}/admin/products/{pid}", headers=auth_headers)

    def test_admin_delete_product(self, session, auth_headers):
        payload = {
            "title": f"TEST Del {uuid.uuid4().hex[:6]}",
            "slug": f"test-del-{uuid.uuid4().hex[:6]}",
            "category": "mindset-balance",
            "price": 1.00,
        }
        r = session.post(f"{API}/admin/products", headers=auth_headers, json=payload)
        assert r.status_code == 200
        pid = r.json()["id"]
        slug = r.json()["slug"]

        d = session.delete(f"{API}/admin/products/{pid}", headers=auth_headers)
        assert d.status_code == 200
        assert d.json().get("ok") is True

        g = session.get(f"{API}/products/{slug}")
        assert g.status_code == 404


# ---------------- Admin Subscribers / Messages ----------------
class TestAdminSubscribersMessages:
    def test_subscribers_unauth(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/subscribers")
        assert r.status_code == 401

    def test_messages_unauth(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/messages")
        assert r.status_code == 401

    def test_admin_subscribers_list(self, session, auth_headers):
        # ensure at least one
        session.post(f"{API}/newsletter", json={"email": f"sub_{uuid.uuid4().hex[:6]}@example.com"})
        r = session.get(f"{API}/admin/subscribers", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        _no_underscore_id(data)

    def test_admin_messages_list(self, session, auth_headers):
        session.post(f"{API}/contact", json={
            "name": "TEST", "email": "test@example.com", "message": "auto-test msg"
        })
        r = session.get(f"{API}/admin/messages", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        _no_underscore_id(data)
