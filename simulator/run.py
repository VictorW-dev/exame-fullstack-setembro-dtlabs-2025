import os
import time
import random
import requests
import json
from datetime import datetime, timezone

API = os.getenv("API_BASE_URL", "http://backend:8000")
email = os.getenv("SIM_USER_EMAIL", "admin@demo.com")
password = os.getenv("SIM_USER_PASSWORD", "admin")
num = int(os.getenv("SIM_DEVICES", "3"))
interval = int(os.getenv("SIM_SEND_INTERVAL_SECONDS", "10"))

# bootstrap: cria user e devices
try:
    requests.post(f"{API}/api/v1/auth/register", json={"email": email, "password": password})
except:
    pass  # usuário já pode existir

login_response = requests.post(f"{API}/api/v1/auth/login", json={"email": email, "password": password})
login_data = login_response.json()
user_id = login_data.get("user_id")
access_token = login_data.get("access_token")

if not access_token:
    print("❌ Falha no login:", login_data)
    exit(1)

headers = {"Authorization": f"Bearer {access_token}"}

# cria devices com SN sequencial (12 dígitos)
for i in range(num):
    sn = f"{100000000000 + i}"
    device_response = requests.post(f"{API}/api/v1/devices/", json={
        "user_id": user_id,
        "name": f"Device-{i+1}",
        "location": "Lab",
        "sn": sn,
        "description": "Simulated device"
    }, headers=headers)
    
    if device_response.status_code != 200:
        print(f"❌ Erro ao criar device {sn}: {device_response.text}")
    else:
        print(f"✅ Device {sn} criado com sucesso")

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
            connectivity=random.choice([0, 1, 1, 1]),  # maioria online
            boot_ts_utc=boot.isoformat()
        )
        try:
            res = requests.post(f"{API}/api/v1/heartbeats/", json=payload, headers=headers, timeout=5)

            # Se for JSON, formata bonitinho
            if res.headers.get("content-type", "").startswith("application/json"):
                data = json.dumps(res.json(), indent=2, ensure_ascii=False)
            else:
                data = res.text

            print(f"\n➡️ Sent: {json.dumps(payload, ensure_ascii=False)}")
            print(f"⬅️ Response ({res.status_code}): {data}")

        except Exception as e:
            print("❌ sim error:", e)

    time.sleep(interval)
