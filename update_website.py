import re

with open('website/src/dict.ts', 'r') as f:
    content = f.read()

# Update English dict
content = content.replace("download: 'Download for macOS',", """downloadMac: 'Download for macOS',
      downloadWin: 'Download for Windows',
      downloadLinux: 'Download for Linux',
      downloadDefault: 'Download App',""")
content = content.replace("platforms: 'Also available for Windows & Linux.'", "platforms: 'Available for macOS, Windows & Linux.'")

# Update Chinese dict
content = content.replace("download: '下载 macOS 版',", """downloadMac: '下载 macOS 版',
      downloadWin: '下载 Windows 版',
      downloadLinux: '下载 Linux 版',
      downloadDefault: '立即下载',""")
content = content.replace("platforms: '同时支持 Windows 与 Linux 平台'", "platforms: '提供 macOS、Windows 与 Linux 原生版本'")

with open('website/src/dict.ts', 'w') as f:
    f.write(content)
