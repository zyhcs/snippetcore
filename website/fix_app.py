import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

# 1 & 2 & 3
content = content.replace("import React, { useState, useEffect } from 'react';", "import React, { useState } from 'react';")
content = content.replace("import { Download, Cloud, Layout, Zap, Image as ImageIcon, Terminal, Star, Globe, ChevronRight, CheckCircle2, Copy } from 'lucide-react';", "import { Download, Cloud, Layout, Zap, Image as ImageIcon, Terminal, Star, Globe, CheckCircle2, Copy, Code2 } from 'lucide-react';")
content = content.replace("import { dict, Lang } from './dict';", "import { dict, type Lang } from './dict';")

# 4
content = content.replace('{err.code}', '{"{err.code}"}')

# 5
content = content.replace(', ease: "easeOut" ', '')

with open('src/App.tsx', 'w') as f:
    f.write(content)
