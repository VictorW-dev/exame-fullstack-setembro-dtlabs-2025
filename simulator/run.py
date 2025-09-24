import os, time, random, requests
from datetime import datetime, timezone

API = os.getenv("API_BASE_URL", "http://backend:8000")
email = os.getenv("SIM_USER_EMAIL", "admin@demo.com")
password = os.getenv("SIM_USER_PASSWORD", "admin")
num = int(os.getenv("SIM_DEVICES", "3"))
interval = int(os.getenv("SIM_SEND_INTERVAL_SECONDS", "10"))

# bootstrap: cria user e devices
requests.post(f"{API}/api/v1/auth/register", json={"email": email, "password": password})
login = requests.post(f"{API}/api/v1/auth/login", json={"email": email, "password": password}).json()
user_id = login.get("user_id")

# cria devices com SN sequencial (12 dígitos)
for i in range(num):
    sn = f"{100000000000 + i}"
    requests.post(f"{API}/api/v1/devices", json={
        "user_id": user_id,
        "name": f"Device-{i+1}",
        "location": "Lab",
        "sn": sn,
        "description": "Simulated device"
    })

sns = [f"{100000000000 + i}" for i in range(num)]
boot = datetime.now(timezone.utc).replace(tzinfo=None)

while True:
    for sn in sns:
        payload = dict(
            device_sn=sn,
            cpu=round(random.uniform(5, 95), 2),
            ram=round(random.uniform(10, 90), 2),
            disk_free=round(random.uniform(5, 90), 2),
            temperature=round(random.uniform(20, 90), 2),
            dns_latency_ms=random.randint(5, 200),
            connectivity=random.choice([0, 1, 1, 1]),  # corrigido: connectivity
            boot_ts_utc=boot.isoformat()
        )
        try:
            res = requests.post(f"{API}/api/v1/heartbeats", json=payload, timeout=5)
            print(f"➡️ Sent: {payload} | Response: {res.status_code} {res.text}")
        except Exception as e:
            print("❌ sim error:", e)
    time.sleep(interval)
