import re

with open('src/i18n.ts', 'r') as f:
    content = f.read()

content = content.replace("'未找到匹配的代码片段'", "'未找到相关片段，尝试换个关键词或者新建一个吧！'")
content = content.replace("'No matching snippets found'", "'No snippets found. Try searching something else or create a new one!'")

with open('src/i18n.ts', 'w') as f:
    f.write(content)
