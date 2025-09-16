# app/tests/test_devices.py
from fastapi.testclient import TestClient
from app.main import app


client = TestClient(app)


def test_create_device_flow():
    client.post("/api/v1/auth/register", params={"email":"a@b.com","password":"p"})
    login = client.post("/api/v1/auth/login", params={"email":"a@b.com","password":"p"}).json()
    user_id = login["user_id"]
    r = client.post("/api/v1/devices", params={"user_id":user_id,"name":"D","location":"L","sn":"123456789012","description":"desc"})
    assert r.status_code == 200