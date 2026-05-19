"""Iteration 13 — admin polish backend verification:
- partial PUT on /api/admin/products/{id} preserves other fields when only affiliate_url is sent
- admin list is sorted by priority_order asc, category asc, order asc
"""
import os
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "https://curated-living-8.preview.emergentagent.com").rstrip("/")
ADMIN_EMAIL = "admin@crluys.com"
ADMIN_PASSWORD = "CrLuys2026!"


@pytest.fixture(scope="module")
def admin_session():
    s = requests.Session()
    r = s.post(f"{BASE_URL}/api/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    token = data.get("access_token") or data.get("token")
    if token:
        s.headers.update({"Authorization": f"Bearer {token}"})
    return s


def test_admin_products_sorted_by_priority(admin_session):
    r = admin_session.get(f"{BASE_URL}/api/admin/products")
    assert r.status_code == 200
    products = r.json()
    assert len(products) >= 20
    expected_top8 = [
        "keystone-investors-club",
        "complete-skin-reset-system",
        "ultimate-budget-planner",
        "no-grid-survival-projects",
        "emergency-home-doctor",
        "ultimate-energizer-guide",
        "his-secret-obsession",
        "mega-fitness-bundle",
    ]
    actual_top8 = [p["slug"] for p in products[:8]]
    assert actual_top8 == expected_top8, f"top8 order mismatch: {actual_top8}"


def test_partial_put_affiliate_url_preserves_other_fields(admin_session):
    # Find a non-flagship product
    r = admin_session.get(f"{BASE_URL}/api/admin/products")
    assert r.status_code == 200
    products = r.json()
    target = next(p for p in products if p["slug"] == "his-secret-obsession")
    pid = target["id"]
    original_title = target["title"]
    original_price = target.get("price")
    original_priority = target.get("priority_order")

    test_url = "https://hop.clickbank.net/?affiliate=TEST&vendor=hissecret"
    r2 = admin_session.put(f"{BASE_URL}/api/admin/products/{pid}", json={"affiliate_url": test_url})
    assert r2.status_code == 200, f"PUT failed: {r2.status_code} {r2.text}"
    updated = r2.json()
    assert updated["affiliate_url"] == test_url
    assert updated["title"] == original_title
    assert updated.get("price") == original_price
    assert updated.get("priority_order") == original_priority

    # GET to re-verify persistence
    r3 = admin_session.get(f"{BASE_URL}/api/admin/products")
    refreshed = next(p for p in r3.json() if p["id"] == pid)
    assert refreshed["affiliate_url"] == test_url
    assert refreshed["title"] == original_title

    # Cleanup: revert
    r4 = admin_session.put(f"{BASE_URL}/api/admin/products/{pid}", json={"affiliate_url": ""})
    assert r4.status_code == 200
    assert r4.json()["affiliate_url"] == ""


def test_public_endpoints_no_regression():
    r = requests.get(f"{BASE_URL}/api/products")
    assert r.status_code == 200
    assert len(r.json()) >= 20

    r2 = requests.get(f"{BASE_URL}/api/products/keystone-investors-club")
    assert r2.status_code == 200
    assert r2.json()["slug"] == "keystone-investors-club"

    r3 = requests.get(f"{BASE_URL}/api/categories")
    assert r3.status_code == 200
    assert len(r3.json()) == 5
