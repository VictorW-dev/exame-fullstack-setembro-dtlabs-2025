import os, time, random, requests
from datetime import datetime, timezone

API_URL = os.getenv("API_URL", "http://backend:8000/api/v1/heartbeats")
DEVICE_SN = os.getenv("DEVICE_ID", "100000000000")  # usando SN direto
interval = int(os.getenv("SIM_SEND_INTERVAL_SECONDS", "10"))

boot = datetime.now(timezone.utc).replace(tzinfo=None)

def generate_heartbeat():
    return {
        "device_sn": DEVICE_SN,
        "cpu": round(random.uniform(5, 95), 2),
        "ram": round(random.uniform(5, 95), 2),
        "disk_free": round(random.uniform(10, 90), 2),
        "temperature": round(random.uniform(20, 90), 2),
        "dns_latency_ms": random.randint(5, 200),
        "connectivity": random.choice([0, 1]),  # corrigido: connectivity
        "boot_ts_utc": boot.isoformat()
    }

if __name__ == "__main__":
    while True:
        hb = generate_heartbeat()
        try:
            res = requests.post(API_URL, json=hb, timeout=5)
            print(f"➡️ Sent: {hb} | Response: {res.status_code} {res.text}")
        except Exception as e:
            print("❌ Error sending heartbeat:", e)
        time.sleep(interval)
