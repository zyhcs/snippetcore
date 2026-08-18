export type Lang = 'en' | 'zh';

export const dict = {
  en: {
    nav: {
      features: 'Features',
      workflow: 'How it Works',
      faq: 'FAQ',
      github: 'GitHub'
    },
    hero: {
      badge: 'v0.1.6 is now available',
      title1: 'The Ultimate ',
      highlight: 'Code Snippet',
      title2: ' Manager.',
      subtitle: 'Fast, secure, and beautiful. SnippetCore helps you organize your code fragments locally with seamless GitHub synchronization and stunning image exports.',
      downloadMac: 'Download for macOS',
      downloadWin: 'Download for Windows',
      downloadLinux: 'Download for Linux',
      downloadDefault: 'Download App',
      source: 'View Source',
      platforms: 'Available for macOS, Windows & Linux.'
    },
    features: {
      title: 'Everything you need, nothing you don\'t.',
      subtitle: 'Built for developers who care about speed, privacy, and aesthetics.',
      items: [
        { title: 'Lightning Fast', desc: 'Built on Tauri and Rust, SnippetCore utilizes almost zero resources while running in the background.' },
        { title: 'GitHub Cloud Sync', desc: 'Your snippets belong to you. Sync your library to your own private GitHub repository seamlessly.' },
        { title: '100+ Languages', desc: 'From ABAP to Zig. Includes flawless syntax highlighting and automatic language detection.' },
        { title: 'Global Shortcuts', desc: 'Summon your snippets instantly from anywhere on your OS using customizable hotkeys.' },
        { title: 'Export to Image', desc: 'Share beautiful, high-res code screenshots instantly with customizable themes and paddings.' },
        { title: 'Dark & Geeky', desc: 'Multiple dark theme presets like Matrix, Cyberpunk, and Tokyo Night tailored for developer eyes.' }
      ]
    },
    workflow: {
      title: 'Seamless Developer Workflow',
      subtitle: 'Designed to stay out of your way until you exactly need it.',
      steps: [
        { title: 'Capture', desc: 'Highlight code anywhere, hit your global shortcut, and save it instantly without switching contexts.' },
        { title: 'Organize', desc: 'Use tags, favorites, and fast fuzzy search to find exactly the snippet you need in milliseconds.' },
        { title: 'Share', desc: 'Export beautiful snippets as images or copy formatted code straight to your clipboard to share with your team.' }
      ]
    },
    faq: {
      title: 'Frequently Asked Questions',
      items: [
        { q: 'Is it completely free?', a: 'Yes! SnippetCore is 100% free and open-source under the MIT license.' },
        { q: 'Where is my data stored?', a: 'Locally on your machine using SQLite for maximum privacy and speed. You can optionally sync it to your own GitHub repo.' },
        { q: 'Does it support Windows/Linux?', a: 'Absolutely. Thanks to Tauri, SnippetCore provides native installers for macOS, Windows, and Linux.' }
      ]
    },
    footer: {
      built: 'Built with Tauri, React & Tailwind',
      license: 'Open Source under the MIT License.',
      rights: '© 2026 SnippetCore. All rights reserved.'
    }
  },
  zh: {
    nav: {
      features: '核心特性',
      workflow: '工作流',
      faq: '常见问题',
      github: '开源仓库'
    },
    hero: {
      badge: 'v0.1.6 现已发布',
      title1: '终极',
      highlight: '代码片段',
      title2: '管理利器',
      subtitle: '极速、安全且优雅。SnippetCore 帮助您在本地高效管理代码资产，并支持无缝 GitHub 同步与绝美的代码图片导出。',
      downloadMac: '下载 macOS 版',
      downloadWin: '下载 Windows 版',
      downloadLinux: '下载 Linux 版',
      downloadDefault: '立即下载',
      source: '查看源码',
      platforms: '提供 macOS、Windows 与 Linux 原生版本'
    },
    features: {
      title: '满足你所需的一切，摒弃繁杂。',
      subtitle: '专为在乎速度、隐私与极客美学的开发者打造。',
      items: [
        { title: '极速轻量', desc: '基于 Tauri 与 Rust 构建，后台常驻几乎零资源消耗，告别 Electron 的臃肿。' },
        { title: 'GitHub 云同步', desc: '数据主权归你所有。无缝将代码库同步至你个人的私有 GitHub 仓库中。' },
        { title: '100+ 语言支持', desc: '从 ABAP 到 Zig。内置精准的语法高亮引擎与智能语言推断机制。' },
        { title: '全局快捷键', desc: '自定义组合键，在系统的任何角落瞬间召唤出你的代码库。' },
        { title: '绝美图片导出', desc: '内置多套精美的主题、背景与内边距配置，一键生成高清代码分享图。' },
        { title: '极客暗黑美学', desc: '黑客帝国、赛博朋克、东京之夜... 专为开发者护眼与审美打造的多套暗色主题。' }
      ]
    },
    workflow: {
      title: '如丝般顺滑的开发者工作流',
      subtitle: '它安静地呆在后台，只有在你真正需要时才闪电般出现。',
      steps: [
        { title: '快速捕获', desc: '在任何地方高亮代码，按下全局快捷键，即可瞬间保存，无需打断当前心流。' },
        { title: '高效组织', desc: '通过标签、收藏与毫秒级的模糊搜索，在海量片段中精准定位你的目标。' },
        { title: '优雅分享', desc: '一键导出极具设计感的代码图片，或直接复制带格式的代码，分享给你的团队。' }
      ]
    },
    faq: {
      title: '常见问题 (FAQ)',
      items: [
        { q: '这款软件是免费的吗？', a: '完全免费！SnippetCore 采用 MIT 协议完全开源。' },
        { q: '我的数据存放在哪里？', a: '为了极致的速度与隐私，数据默认本地存储于 SQLite。您可以选择性地通过 Personal Access Token 备份至您的私有 GitHub 仓库。' },
        { q: '支持 Windows 和 Linux 吗？', a: '当然！得益于 Tauri 的跨平台能力，我们提供 macOS、Windows 和 Linux 的原生安装包。' }
      ]
    },
    footer: {
      built: '基于 Tauri, React & Tailwind 强力驱动',
      license: '在 MIT 协议下开源',
      rights: '© 2026 SnippetCore. 保留所有权利。'
    }
  }
};
