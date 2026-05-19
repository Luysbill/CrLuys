"""Iteration 12 — affiliate URL scrub + idempotent migration tests."""
import os
import requests
import pytest

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://curated-living-8.preview.emergentagent.com").rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@crluys.com"
ADMIN_PASSWORD = "CrLuys2026!"


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def admin_session(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"Login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    if token:
        session.headers["Authorization"] = f"Bearer {token}"
    return session


def test_products_list_count_and_no_example_com(session):
    r = session.get(f"{API}/products")
    assert r.status_code == 200
    products = r.json()
    assert isinstance(products, list)
    assert len(products) == 20, f"Expected 20 products, got {len(products)}"
    for p in products:
        url = p.get("affiliate_url") or ""
        assert "example.com" not in url, f"Found example.com in product {p.get('slug')}: {url}"


def test_products_have_empty_affiliate_url(session):
    r = session.get(f"{API}/products")
    assert r.status_code == 200
    products = r.json()
    empty_count = sum(1 for p in products if not p.get("affiliate_url"))
    # All scrubbed - all empty
    assert empty_count == 20, f"Expected all 20 to have empty affiliate_url; got {empty_count} empty"


def test_top_picks_returns_8_priority_in_order(session):
    r = session.get(f"{API}/products", params={"top_picks": "true"})
    assert r.status_code == 200
    products = r.json()
    assert len(products) == 8, f"Expected 8 top picks, got {len(products)}"
    orders = [p.get("priority_order") for p in products]
    assert orders == sorted(orders), f"Top picks not ordered: {orders}"
    for o in orders:
        assert o is not None and o < 999


def test_admin_login_and_me(admin_session):
    r = admin_session.get(f"{API}/auth/me")
    assert r.status_code == 200
    user = r.json()
    assert user.get("email") == ADMIN_EMAIL
    assert user.get("role") == "admin"


def test_admin_products_list(admin_session):
    r = admin_session.get(f"{API}/admin/products")
    assert r.status_code == 200
    products = r.json()
    assert isinstance(products, list)
    assert len(products) >= 20


def test_admin_update_affiliate_url_and_revert(admin_session):
    # Fetch products to pick one non-priority
    r = admin_session.get(f"{API}/admin/products")
    assert r.status_code == 200
    products = r.json()
    target = next((p for p in products if (p.get("priority_order") or 999) >= 999), products[0])
    pid = target["id"]
    new_url = "https://example-real-affiliate.com"
    # Update
    r = admin_session.put(f"{API}/admin/products/{pid}", json={"affiliate_url": new_url})
    assert r.status_code == 200, f"PUT failed: {r.status_code} {r.text}"
    # Verify by GET on public endpoint via slug
    r = admin_session.get(f"{API}/products/{target['slug']}")
    assert r.status_code == 200
    assert r.json().get("affiliate_url") == new_url
    # Revert
    r = admin_session.put(f"{API}/admin/products/{pid}", json={"affiliate_url": ""})
    assert r.status_code == 200
    r = admin_session.get(f"{API}/products/{target['slug']}")
    assert r.json().get("affiliate_url") in ("", None)


def test_categories_endpoint(session):
    r = session.get(f"{API}/categories")
    assert r.status_code == 200
    cats = r.json()
    assert len(cats) == 5
