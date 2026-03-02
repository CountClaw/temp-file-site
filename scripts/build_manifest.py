#!/usr/bin/env python3
import json, os, pathlib, mimetypes, datetime
root = pathlib.Path(__file__).resolve().parents[1]
files_root = root / 'files'
items = []
for p in files_root.rglob('*'):
    if p.is_file():
        rel = p.relative_to(root).as_posix()
        parts = rel.split('/')
        category = parts[1] if len(parts) > 2 else 'other'
        st = p.stat()
        m = mimetypes.guess_type(p.name)[0] or 'application/octet-stream'
        items.append({
            'name': p.name,
            'path': rel,
            'category': category,
            'mime': m,
            'size': st.st_size,
            'updatedAt': datetime.datetime.utcfromtimestamp(st.st_mtime).isoformat() + 'Z'
        })
items.sort(key=lambda x: x['updatedAt'], reverse=True)
summary = {}
for it in items:
    summary[it['category']] = summary.get(it['category'], 0) + 1
manifest = {
    'generatedAt': datetime.datetime.utcnow().isoformat() + 'Z',
    'count': len(items),
    'summary': summary,
    'items': items
}
assets = root / 'assets'
assets.mkdir(exist_ok=True)
(assets / 'manifest.json').write_text(json.dumps(manifest, ensure_ascii=False, indent=2), encoding='utf-8')
print(f"manifest: {len(items)} files")
