"""Lead capture backend tests (Keystone onboarding flow)."""
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


@pytest.fixture(scope="module")
def session():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_headers(session):
    r = session.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.skip(f"Admin login failed: {r.status_code} {r.text}")
    return {"Authorization": f"Bearer {r.json()['token']}"}


# ---- POST /api/leads ----
class TestLeadsCreate:
    def test_post_lead_success(self, session):
        email = f"TEST_lead_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": email,
            "name": "TEST Lead",
            "goal": "long-term-wealth",
            "source": "smart-investing",
            "cta": "hero-cta-start",
        }
        r = session.post(f"{API}/leads", json=payload)
        assert r.status_code == 200, r.text
        data = r.json()
        assert data.get("ok") is True
        assert "circle" in data.get("message", "").lower()

    def test_post_lead_invalid_email_returns_422(self, session):
        r = session.post(f"{API}/leads", json={
            "email": "not-an-email",
            "name": "x",
        })
        assert r.status_code == 422

    def test_post_lead_missing_email_returns_422(self, session):
        r = session.post(f"{API}/leads", json={"name": "no email"})
        assert r.status_code == 422

    def test_post_lead_email_only_minimal_payload(self, session):
        email = f"TEST_min_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/leads", json={"email": email})
        assert r.status_code == 200
        assert r.json().get("ok") is True


# ---- GET /api/admin/leads ----
class TestLeadsAdmin:
    def test_admin_leads_requires_auth(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/leads")
        assert r.status_code == 401

    def test_admin_leads_invalid_token(self):
        s = requests.Session()
        r = s.get(f"{API}/admin/leads", headers={"Authorization": "Bearer junk"})
        assert r.status_code == 401

    def test_admin_leads_returns_created_lead(self, session, auth_headers):
        email = f"TEST_admin_{uuid.uuid4().hex[:8]}@example.com"
        payload = {
            "email": email,
            "name": "TEST Admin Lead",
            "goal": "private-deals",
            "source": "smart-investing",
            "cta": "featured-financial-primary-cta",
        }
        create = session.post(f"{API}/leads", json=payload)
        assert create.status_code == 200

        r = session.get(f"{API}/admin/leads", headers=auth_headers)
        assert r.status_code == 200
        data = r.json()
        assert isinstance(data, list)
        # No mongo _id leaks
        for d in data:
            assert "_id" not in d
        # find our lead
        match = [d for d in data if d.get("email") == email.lower()]
        assert len(match) >= 1, f"Lead with email {email.lower()} not returned"
        lead = match[0]
        assert lead["name"] == "TEST Admin Lead"
        assert lead["goal"] == "private-deals"
        assert lead["source"] == "smart-investing"
        assert lead["cta"] == "featured-financial-primary-cta"
        assert "id" in lead
        assert "created_at" in lead

    def test_lead_also_added_to_subscribers(self, session, auth_headers):
        email = f"TEST_subsync_{uuid.uuid4().hex[:8]}@example.com"
        r = session.post(f"{API}/leads", json={"email": email, "goal": "diversify"})
        assert r.status_code == 200

        s = session.get(f"{API}/admin/subscribers", headers=auth_headers)
        assert s.status_code == 200
        emails = [d.get("email") for d in s.json()]
        assert email.lower() in emails, "Lead email was not propagated to subscribers"

    def test_lead_subscriber_upsert_idempotent(self, session, auth_headers):
        email = f"TEST_idem_{uuid.uuid4().hex[:8]}@example.com"
        # First subscribe
        session.post(f"{API}/newsletter", json={"email": email})
        # Then lead with same email — should not error
        r = session.post(f"{API}/leads", json={"email": email, "goal": "legacy"})
        assert r.status_code == 200
        # Subscribers should still contain this email once
        s = session.get(f"{API}/admin/subscribers", headers=auth_headers)
        assert s.status_code == 200
        count = sum(1 for d in s.json() if d.get("email") == email.lower())
        assert count == 1, f"Expected exactly 1 subscriber for {email}, got {count}"


# ---- DELETE /api/admin/leads/{id} ----
class TestLeadsDelete:
    def test_admin_delete_lead(self, session, auth_headers):
        email = f"TEST_del_{uuid.uuid4().hex[:8]}@example.com"
        c = session.post(f"{API}/leads", json={"email": email, "goal": "legacy"})
        assert c.status_code == 200

        listing = session.get(f"{API}/admin/leads", headers=auth_headers)
        match = [d for d in listing.json() if d.get("email") == email.lower()]
        assert match, "Lead not found before deletion"
        lead_id = match[0]["id"]

        d = session.delete(f"{API}/admin/leads/{lead_id}", headers=auth_headers)
        assert d.status_code == 200
        assert d.json().get("ok") is True

        listing2 = session.get(f"{API}/admin/leads", headers=auth_headers)
        match2 = [x for x in listing2.json() if x.get("id") == lead_id]
        assert not match2, "Lead still present after delete"

    def test_admin_delete_lead_unauth(self):
        s = requests.Session()
        r = s.delete(f"{API}/admin/leads/some-id")
        assert r.status_code == 401

    def test_admin_delete_lead_not_found(self, session, auth_headers):
        r = session.delete(f"{API}/admin/leads/non-existent-id", headers=auth_headers)
        assert r.status_code == 404
