import re

with open('src/App.tsx', 'r') as f:
    content = f.read()

content = content.replace("import { Download, Code2, Cloud, Layout, Zap, Image as ImageIcon, Github, Terminal, Star } from 'lucide-react';", "import { Download, Code2, Cloud, Layout, Zap, Image as ImageIcon, Terminal, Star } from 'lucide-react';")

github_svg = """function Github(props: any) {
  return (
    <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.24c3-.34 6-1.53 6-6.76a5.2 5.2 0 0 0-1.39-3.5 4.8 4.8 0 0 0-.1-3.4s-1.1-.35-3.5 1.2a11.9 11.9 0 0 0-6 0C6.6 2.5 5.5 2.85 5.5 2.85a4.8 4.8 0 0 0-.1 3.4A5.2 5.2 0 0 0 4 9.76c0 5.22 3 6.42 6 6.76-.36.3-.7.82-.8 1.6-1.1.5-3.2.4-4.2-1.2-1-.7-1.5-.6-1.5-.6.7-.1 1.2.3 1.4.6.8 1.4 2.4 1.2 3.2 1 .1-.8.4-1.4.8-1.8v4.2" />
    </svg>
  );
}"""

content = content.replace("export default App;", github_svg + "\n\nexport default App;")

with open('src/App.tsx', 'w') as f:
    f.write(content)
