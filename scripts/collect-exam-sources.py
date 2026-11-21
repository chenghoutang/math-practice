"""Re-fetch public official source documents into the ignored research cache.

Optional research utility: Python 3, requests and pypdf. The website and Node
build do not depend on these packages or on a network connection.
"""
from concurrent.futures import ThreadPoolExecutor
from datetime import date
from hashlib import sha256
from pathlib import Path
import json
import requests
from pypdf import PdfReader

ROOT = Path(__file__).resolve().parent.parent
CACHE = ROOT / '.cache' / 'exam-sources'
DOCUMENTS = [
    ('dse23', 'dse2023', 'https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/math/2023-Sample-MATH-CP-Level5-E-4792.pdf'),
    ('dse24', 'dse2024', 'https://www.hkeaa.edu.hk/DocLibrary/HKDSE/Subject_Information/math/2024-Sample-MATH-CP-Level5-E-976D.pdf'),
    ('macau25', 'macau-1', 'https://reg.um.edu.mo/download/admission-local/jae/pastexampaper1/JM01.pdf'),
    ('macau26', 'macau-2', 'https://reg.um.edu.mo/download/admission-local/jae/pastexampaper2/JM01.pdf'),
    ('macau25s', 'macau-2025-supp', 'https://reg.um.edu.mo/download/admission-local/jae/pastexampaper1/JM02.pdf'),
    ('macau26s', 'macau-2026-supp', 'https://reg.um.edu.mo/download/admission-local/jae/pastexampaper2/JM02.pdf'),
    ('gaokao21', 'gaokao2021-review', 'https://gaokao.neea.edu.cn/html1/report/22012/3061-1.htm'),
]


def collect(document):
    key, name, url = document
    suffix = '.pdf' if url.endswith('.pdf') else '.html'
    path = CACHE / (name + suffix)
    if not path.exists():
        response = requests.get(url, headers={'User-Agent': 'Mozilla/5.0'}, timeout=30)
        response.raise_for_status()
        path.write_bytes(response.content)
    payload = path.read_bytes()
    record = {'id': key, 'url': url, 'checkedDate': date.today().isoformat(), 'sha256': sha256(payload).hexdigest(), 'bytes': len(payload)}
    if suffix == '.pdf':
        if not payload.startswith(b'%PDF'):
            raise ValueError(f'{key}: server returned a non-PDF response')
        reader = PdfReader(path)
        record['pages'] = len(reader.pages)
        text = '\n'.join(f'\nPAGE {i+1}\n{page.extract_text() or ""}' for i, page in enumerate(reader.pages))
        path.with_suffix('.txt').write_text(text, encoding='utf-8')
    return record


if __name__ == '__main__':
    CACHE.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as executor:
        records = list(executor.map(collect, DOCUMENTS))
    (ROOT / 'data' / 'source-documents.json').write_text(json.dumps(records, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
    print(f'Collected {len(records)} official source documents; scans stay in .cache/.')
