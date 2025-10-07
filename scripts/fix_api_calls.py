#!/usr/bin/env python3

import os
import re

# Fix API calls in components
components_dir = '/app/frontend/src/components'

api_fixes = [
    (r'axios\.get\(`\$\{API\}/([^a])', r'axios.get(`${API}/api/\1'),
    (r'axios\.post\(`\$\{API\}/([^a])', r'axios.post(`${API}/api/\1'),
    (r'axios\.delete\(`\$\{API\}/([^a])', r'axios.delete(`${API}/api/\1'),
    (r'axios\.put\(`\$\{API\}/([^a])', r'axios.put(`${API}/api/\1')
]

for filename in os.listdir(components_dir):
    if filename.endswith('.jsx'):
        filepath = os.path.join(components_dir, filename)
        
        with open(filepath, 'r') as f:
            content = f.read()
        
        original_content = content
        
        for pattern, replacement in api_fixes.items():
            content = re.sub(pattern, replacement, content)
        
        if content != original_content:
            with open(filepath, 'w') as f:
                f.write(content)
            print(f'Fixed API calls in {filename}')
        else:
            print(f'No changes needed in {filename}')

print('API call fixes complete!')
