import re

with open('website/src/App.tsx', 'r') as f:
    content = f.read()

# Add useEffect back to import
content = content.replace("import React, { useState } from 'react';", "import React, { useState, useEffect } from 'react';")

# Add OS detection hook inside App
hook_code = """  const [lang, setLang] = useState<Lang>('zh');
  const [os, setOs] = useState<'mac' | 'win' | 'linux' | 'unknown'>('unknown');
  
  useEffect(() => {
    const ua = window.navigator.userAgent.toLowerCase();
    if (ua.includes('mac')) setOs('mac');
    else if (ua.includes('win')) setOs('win');
    else if (ua.includes('linux')) setOs('linux');
  }, []);

  const d = dict[lang];
  let downloadText = d.hero.downloadDefault;
  if (os === 'mac') downloadText = d.hero.downloadMac;
  if (os === 'win') downloadText = d.hero.downloadWin;
  if (os === 'linux') downloadText = d.hero.downloadLinux;"""

content = content.replace("""  const [lang, setLang] = useState<Lang>('zh');
  const d = dict[lang];""", hook_code)

# Replace the text in the hero button
content = content.replace("{d.hero.download}", "{downloadText}")

with open('website/src/App.tsx', 'w') as f:
    f.write(content)
