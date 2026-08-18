import re

with open('src/components/EditorModal.tsx', 'r') as f:
    content = f.read()

content = content.replace(
    "import { t } from '../i18n';",
    "import { t } from '../i18n';\nimport { showToast } from '../utils/toast';"
)

with open('src/components/EditorModal.tsx', 'w') as f:
    f.write(content)
