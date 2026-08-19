import json

with open('package.json', 'r') as f:
    pkg = json.load(f)
pkg['version'] = '0.1.8'
with open('package.json', 'w') as f:
    json.dump(pkg, f, indent=2)

with open('src-tauri/tauri.conf.json', 'r') as f:
    tauri = json.load(f)
tauri['version'] = '0.1.8'
with open('src-tauri/tauri.conf.json', 'w') as f:
    json.dump(tauri, f, indent=2)

