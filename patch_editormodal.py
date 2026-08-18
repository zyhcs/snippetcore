import re

with open('src/components/EditorModal.tsx', 'r') as f:
    content = f.read()

# Add showToast import
if "import { showToast }" not in content:
    content = content.replace("import { Locale, t } from '../i18n';", "import { Locale, t } from '../i18n';\nimport { showToast } from '../utils/toast';")

# Update handleSave
old_handleSave = """    const handleSave = () => {
        onSave({
            title: title || 'Untitled Snippet',
            code_content: codeContent,
            language,
            tags,
            is_favorite: isFavorite
        });
    };"""

new_handleSave = """    const handleSave = () => {
        if (!codeContent.trim()) {
            showToast(locale === 'zh' ? '代码内容不能为空' : 'Code content cannot be empty', 'error');
            return;
        }
        if (!title.trim()) {
            showToast(locale === 'zh' ? '未命名片段已自动保存' : 'Saved as Untitled Snippet', 'info');
        } else {
            showToast(locale === 'zh' ? '片段保存成功' : 'Snippet saved successfully', 'success');
        }
        onSave({
            title: title.trim() || 'Untitled Snippet',
            code_content: codeContent,
            language,
            tags,
            is_favorite: isFavorite
        });
    };"""

content = content.replace(old_handleSave, new_handleSave)

with open('src/components/EditorModal.tsx', 'w') as f:
    f.write(content)
