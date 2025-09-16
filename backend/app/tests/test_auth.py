# app/tests/test_auth.py
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_register_and_login():
    client.post("/api/v1/auth/register", params={"email":"x@y.com","password":"x"})
    r = client.post("/api/v1/auth/login", params={"email":"x@y.com","password":"x"})
    assert r.status_code == 200
    assert "access_token" in r.json()