# Test and verify Xuan Kong Flying Stars for all periods (1 to 9)
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from test_xuan_kong import generate_chart, SON_24

def check_period(p):
    print(f"\n==================== VẬN {p} ====================")
    patterns = {}
    for s in SON_24:
        res = generate_chart(s['deg'], p)
        pat = res['pattern']
        patterns.setdefault(pat, []).append(f"{res['toa']['name']} tọa - {res['facing']['name']} hướng")
    for pat, houses in patterns.items():
        print(f"[{pat}] ({len(houses)} sơn hướng):")
        for h in houses:
            print(f"  - {h}")

for p in [8, 7, 1]:
    check_period(p)
