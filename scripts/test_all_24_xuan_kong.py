# Test all 24 mountains for Period 9
import sys
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

from test_xuan_kong import SON_24, generate_chart

print(f"{'Hướng':<8} {'Sơn/Long':<12} {'Tọa':<8} {'Tọa Tinh':<15} {'Hướng Tinh':<15} {'Cách Cục'}")
print("-" * 80)
for s in SON_24:
    res = generate_chart(s['deg'], 9)
    h_name = f"{res['facing']['name']} ({res['facing']['cung']})"
    long_desc = f"Sơn {res['facing']['long']} ({res['facing']['long_name']})"
    t_name = f"{res['toa']['name']} ({res['toa']['cung']})"
    m_info = f"{res['mountain_center']} {res['m_dir']}"
    f_info = f"{res['facing_center']} {res['f_dir']}"
    print(f"{h_name:<10} {long_desc:<12} {t_name:<10} {m_info:<15} {f_info:<15} {res['pattern']}")
