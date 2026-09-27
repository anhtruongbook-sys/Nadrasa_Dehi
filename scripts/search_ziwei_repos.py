import sys
import urllib.request
import json
sys.stdout.reconfigure(encoding='utf-8')

queries = [
    "ziwei",
    "ziweidoushu",
    "tuvi+vietnam",
    "an+sao+tu+vi"
]

seen = set()
for q in queries:
    url = f"https://api.github.com/search/repositories?q={q}&sort=stars&order=desc"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode('utf-8'))
            for r in data.get('items', [])[:4]:
                repo_name = r['full_name']
                if repo_name not in seen:
                    seen.add(repo_name)
                    print(f"Repo: {repo_name} | Stars: {r['stargazers_count']} | Language: {r['language']}")
                    print(f"  Desc: {r.get('description')}")
                    print(f"  URL: {r['html_url']}")
    except Exception as e:
        print(f"Error querying {q}: {e}")
