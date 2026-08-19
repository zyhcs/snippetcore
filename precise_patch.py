import sys

def patch_file(filepath, replacements):
    with open(filepath, 'r') as f:
        content = f.read()
    
    for old, new in replacements:
        if old not in content:
            print(f"FAILED TO MATCH IN {filepath}:\n{old}")
            sys.exit(1)
        content = content.replace(old, new)
        
    with open(filepath, 'w') as f:
        f.write(content)

# EditorModal.tsx
old_imports = "import React, { useState, useEffect } from 'react';"
new_imports = "import React, { useState, useEffect } from 'react';\nimport { v4 as uuidv4 } from 'uuid';"

old_iface = "interface EditorModalProps {"
new_iface = "export interface SnippetFile {\n    id: string;\n    filename: string;\n    content: string;\n    language: string;\n}\n\ninterface EditorModalProps {"

old_state = """    const [title, setTitle] = useState('');
    const [codeContent, setCodeContent] = useState('');
    const [language, setLanguage] = useState('JavaScript');
    const [tags, setTags] = useState<string[]>([]);"""

new_state = """    const [title, setTitle] = useState('');
    const [files, setFiles] = useState<SnippetFile[]>([]);
    const [activeFileId, setActiveFileId] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    
    const activeFile = files.find(f => f.id === activeFileId) || files[0] || { id: '', filename: 'index.js', content: '', language: 'JavaScript' };
    const codeContent = activeFile.content;
    const language = activeFile.language;
    
    const updateActiveFile = (updates: Partial<SnippetFile>) => {
        setFiles(prev => prev.map(f => f.id === activeFileId ? { ...f, ...updates } : f));
    };"""

old_eff = """    useEffect(() => {
        if (snippet) {
            setTitle(snippet.title);
            setCodeContent(snippet.code_content);
            setLanguage(snippet.language);
            try {
                const parsed = JSON.parse(snippet.tags || '[]');
                const tagsArr = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
                setTags(Array.isArray(tagsArr) ? tagsArr : []);
            } catch {
                setTags([]);
            }
            setIsFavorite(!!snippet.is_favorite);
        } else {
            setTitle('');
            setCodeContent('');
            setLanguage(settings.defaultLanguage);
            setTags([]);
            setIsFavorite(false);
        }
    }, [snippet]);"""

new_eff = """    useEffect(() => {
        if (snippet) {
            setTitle(snippet.title || '');
            try {
                const parsed = JSON.parse(snippet.tags || '[]');
                const tagsArr = Array.isArray(parsed) ? parsed : (typeof parsed === 'string' ? JSON.parse(parsed) : []);
                setTags(Array.isArray(tagsArr) ? tagsArr : []);
            } catch {
                setTags([]);
            }
            setIsFavorite(!!snippet.is_favorite);
            
            try {
                if (snippet.code_content && snippet.code_content.trim().startsWith('{"__multi":true')) {
                    const parsed = JSON.parse(snippet.code_content);
                    const loadedFiles = parsed.files.map((f: any) => ({
                        id: uuidv4(),
                        filename: f.filename || 'file',
                        content: f.content || '',
                        language: f.language || 'JavaScript'
                    }));
                    setFiles(loadedFiles);
                    if (loadedFiles.length > 0) setActiveFileId(loadedFiles[0].id);
                } else {
                    const defaultId = uuidv4();
                    setFiles([{ id: defaultId, filename: 'snippet', content: snippet.code_content || '', language: snippet.language || 'JavaScript' }]);
                    setActiveFileId(defaultId);
                }
            } catch(e) {
                const defaultId = uuidv4();
                setFiles([{ id: defaultId, filename: 'snippet', content: snippet.code_content || '', language: snippet.language || 'JavaScript' }]);
                setActiveFileId(defaultId);
            }
        } else {
            setTitle('');
            setTags([]);
            setIsFavorite(false);
            const defaultId = uuidv4();
            setFiles([{ id: defaultId, filename: 'index.js', content: '', language: settings.defaultLanguage || 'JavaScript' }]);
            setActiveFileId(defaultId);
        }
    }, [snippet]);"""

old_change1 = "onChange={(e) => setLanguage(e.target.value)}"
new_change1 = "onChange={(e) => updateActiveFile({ language: e.target.value })}"

old_change2 = "onChange={(value) => setCodeContent(value)}"
new_change2 = "onChange={(value) => updateActiveFile({ content: value })}"

old_change3 = "setCodeContent(formatted);"
new_change3 = "updateActiveFile({ content: formatted });"

old_save = """    const handleSave = () => {
        if (!title.trim()) {
            showToast(locale === 'zh' ? '请输入标题' : 'Please enter a title', 'warning');
            return;
        }
        if (!codeContent.trim()) {
            showToast(locale === 'zh' ? '请输入代码内容' : 'Please enter code content', 'warning');
            return;
        }

        const payload = {
            title,
            code_content: codeContent,
            language,
            tags: tags.join(','),
            is_favorite: isFavorite
        };
        onSave(payload);
    };"""

new_save = """    const handleSave = () => {
        if (!title.trim()) {
            showToast(locale === 'zh' ? '请输入标题' : 'Please enter a title', 'warning');
            return;
        }
        if (files.length === 0 || files.every(f => !f.content.trim())) {
            showToast(locale === 'zh' ? '请输入代码内容' : 'Please enter code content', 'warning');
            return;
        }

        let finalCodeContent = '';
        let finalLanguage = '';
        
        if (files.length === 1 && (files[0].filename === 'snippet' || files[0].filename === 'index.js' || !files[0].filename)) {
            finalCodeContent = files[0].content;
            finalLanguage = files[0].language;
        } else {
            finalCodeContent = JSON.stringify({
                __multi: true,
                files: files.map(f => ({
                    filename: f.filename,
                    content: f.content,
                    language: f.language
                }))
            });
            finalLanguage = files.length === 1 ? files[0].language : 'Multi-file';
        }

        const payload = {
            title,
            code_content: finalCodeContent,
            language: finalLanguage,
            tags: tags.join(','),
            is_favorite: isFavorite
        };
        onSave(payload);
    };"""

old_editor = '<div className="modal-editor" style={{ display: \'flex\', flexDirection: \'column\', padding: 0 }}>'
new_editor = """                <div className="modal-tabs" style={{ display: 'flex', background: 'var(--bg-color)', borderBottom: '1px solid var(--border-color)', overflowX: 'auto' }}>
                    {files.map(f => (
                        <div 
                            key={f.id} 
                            style={{ 
                                padding: '8px 16px', 
                                borderRight: '1px solid var(--border-color)',
                                borderBottom: f.id === activeFileId ? '2px solid var(--theme-color)' : '2px solid transparent',
                                background: f.id === activeFileId ? 'var(--card-bg)' : 'transparent',
                                color: f.id === activeFileId ? 'var(--text-primary)' : 'var(--text-secondary)',
                                cursor: 'pointer',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                fontSize: '0.85rem'
                            }}
                            onClick={() => setActiveFileId(f.id)}
                        >
                            {f.id === activeFileId ? (
                                <input 
                                    value={f.filename}
                                    onChange={(e) => updateActiveFile({ filename: e.target.value })}
                                    style={{ background: 'transparent', border: 'none', color: 'inherit', outline: 'none', width: Math.max(50, f.filename.length * 8) + 'px' }}
                                />
                            ) : (
                                <span>{f.filename || 'untitled'}</span>
                            )}
                            {files.length > 1 && (
                                <i 
                                    className="ri-close-line" 
                                    style={{ opacity: 0.5 }}
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        const newFiles = files.filter(file => file.id !== f.id);
                                        setFiles(newFiles);
                                        if (f.id === activeFileId) setActiveFileId(newFiles[0].id);
                                    }}
                                ></i>
                            )}
                        </div>
                    ))}
                    <div 
                        style={{ padding: '8px 16px', cursor: 'pointer', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center' }}
                        onClick={() => {
                            const newId = uuidv4();
                            setFiles([...files, { id: newId, filename: 'new_file', content: '', language: 'JavaScript' }]);
                            setActiveFileId(newId);
                        }}
                    >
                        <i className="ri-add-line"></i>
                    </div>
                </div>
                
                <div className="modal-editor" style={{ display: 'flex', flexDirection: 'column', padding: 0 }}>"""

patch_file('src/components/EditorModal.tsx', [
    (old_imports, new_imports),
    (old_iface, new_iface),
    (old_state, new_state),
    (old_eff, new_eff),
    (old_change1, new_change1),
    (old_change2, new_change2),
    (old_change3, new_change3),
    (old_save, new_save),
    (old_editor, new_editor)
])

# App.tsx
old_app_imp = "import { Snippet, SnippetFormData } from './types';"
new_app_imp = "import { Snippet, SnippetFormData, Folder } from './types';"
old_app_db = "import { getSnippets, addSnippet, updateSnippet, deleteSnippet, toggleFavorite } from './db';"
new_app_db = "import { getSnippets, addSnippet, updateSnippet, deleteSnippet, toggleFavorite, getFolders } from './db';"

old_app_state = "const [snippets, setSnippets] = useState<Snippet[]>([]);"
new_app_state = "const [snippets, setSnippets] = useState<Snippet[]>([]);\n  const [folders, setFolders] = useState<Folder[]>([]);\n  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);"

old_app_load = """  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data);
    } catch (error) {
      console.error("Failed to load snippets", error);
    }
  };"""

new_app_load = """  const loadSnippets = async () => {
    try {
      const data = await getSnippets();
      setSnippets(data);
      try {
          const fData = await getFolders();
          setFolders(fData);
      } catch (e) {}
    } catch (error) {
      console.error("Failed to load snippets", error);
    }
  };"""

old_app_filter = """    } else if (filterType === 'tag') {
      filtered = filtered.filter(s => {
        try {
          const tagsArr = JSON.parse(s.tags);
          return Array.isArray(tagsArr) && tagsArr.includes(activeTab);
        } catch {
          return false;
        }
      });
    }"""
new_app_filter = """    } else if (filterType === 'tag' as any) {
      filtered = filtered.filter(s => {
        try {
          const tagsArr = JSON.parse(s.tags);
          return Array.isArray(tagsArr) && tagsArr.includes(activeTab);
        } catch {
          return false;
        }
      });
    } else if (filterType === 'folder' as any) {
      filtered = filtered.filter(s => s.folder_id === activeTab);
    }"""

old_app_sb = """<Sidebar 
        snippets={snippets}"""
new_app_sb = """<Sidebar 
        snippets={snippets}
        folders={folders}
        onFoldersChange={loadSnippets}"""

old_app_save = "  const handleSaveSnippet = async (data: SnippetFormData) => {"
new_app_save = """  useEffect(() => {
    if (filterType === 'folder' as any) {
      setCurrentFolderId(activeTab);
    } else {
      setCurrentFolderId(null);
    }
  }, [filterType, activeTab]);

  const handleSaveSnippet = async (data: SnippetFormData) => {
    if (!editingSnippet?.id && currentFolderId) {
      data.folder_id = currentFolderId;
    }"""

old_app_dnd = """          const paths = event.payload.paths;
          if (paths && paths.length > 0) {
            const filePath = paths[0];
            try {
              const contentStr = await readTextFile(filePath);
              const bName = await basename(filePath);
              let eName = '';
              try { eName = await extname(filePath); } catch (e) {}
              
              let title = bName;
              if (eName) {
                title = bName.substring(0, bName.lastIndexOf('.'));
              }
              const ext = eName ? eName.toLowerCase() : '';
              let language = 'JavaScript';
              if (ext === 'py') language = 'Python';
              else if (ext === 'rs') language = 'Rust';
              else if (ext === 'go') language = 'Go';
              else if (ext === 'java') language = 'Java';
              else if (ext === 'cpp' || ext === 'cc' || ext === 'cxx') language = 'C++';
              else if (ext === 'c') language = 'C';
              else if (ext === 'cs') language = 'C#';
              else if (ext === 'ts' || ext === 'tsx') language = 'TypeScript';
              else if (ext === 'js' || ext === 'jsx') language = 'JavaScript';
              else if (ext === 'html') language = 'HTML';
              else if (ext === 'css') language = 'CSS';
              else if (ext === 'json') language = 'JSON';
              else if (ext === 'md') language = 'Markdown';
              else if (ext === 'sh') language = 'Shell';
              else if (ext === 'sql') language = 'SQL';
              else if (ext === 'dart') language = 'Dart';
              else if (ext === 'yaml' || ext === 'yml') language = 'YAML';
              else if (ext === 'xml') language = 'XML';
              else if (ext === 'php') language = 'PHP';
              else if (ext === 'rb') language = 'Ruby';
              else if (ext === 'swift') language = 'Swift';
              else if (ext === 'kt') language = 'Kotlin';
              else if (ext === 'scala') language = 'Scala';

              setEditingSnippet({
                id: '',
                title: title,
                code_content: contentStr,
                language: language,
                tags: '',
                is_favorite: false
              });
              setIsModalOpen(true);
            } catch (err) {
              console.error("Failed to read dropped file", err);
            }
          }"""

new_app_dnd = """          const paths = event.payload.paths;
          if (paths && paths.length > 0) {
              try {
                  const filesData = await Promise.all(paths.map(async (filePath: string) => {
                      const contentStr = await readTextFile(filePath);
                      const bName = await basename(filePath);
                      let eName = '';
                      try { eName = await extname(filePath); } catch (e) {}
                      
                      const ext = eName ? eName.toLowerCase() : '';
                      let language = 'JavaScript';
                      if (ext === 'py') language = 'Python';
                      else if (ext === 'rs') language = 'Rust';
                      else if (ext === 'go') language = 'Go';
                      else if (ext === 'java') language = 'Java';
                      else if (ext === 'cpp' || ext === 'cc' || ext === 'cxx') language = 'C++';
                      else if (ext === 'c') language = 'C';
                      else if (ext === 'cs') language = 'C#';
                      else if (ext === 'ts' || ext === 'tsx') language = 'TypeScript';
                      else if (ext === 'js' || ext === 'jsx') language = 'JavaScript';
                      else if (ext === 'html') language = 'HTML';
                      else if (ext === 'css') language = 'CSS';
                      else if (ext === 'json') language = 'JSON';
                      else if (ext === 'md') language = 'Markdown';
                      else if (ext === 'sh') language = 'Shell';
                      else if (ext === 'sql') language = 'SQL';
                      else if (ext === 'dart') language = 'Dart';
                      else if (ext === 'yaml' || ext === 'yml') language = 'YAML';
                      else if (ext === 'xml') language = 'XML';
                      else if (ext === 'php') language = 'PHP';
                      else if (ext === 'rb') language = 'Ruby';
                      else if (ext === 'swift') language = 'Swift';
                      else if (ext === 'kt') language = 'Kotlin';
                      else if (ext === 'scala') language = 'Scala';
                      
                      return {
                          filename: bName,
                          content: contentStr,
                          language: language
                      };
                  }));
                  
                  let finalTitle = filesData[0].filename;
                  if (filesData.length === 1 && finalTitle.includes('.')) {
                      finalTitle = finalTitle.substring(0, finalTitle.lastIndexOf('.'));
                  } else if (filesData.length > 1) {
                      finalTitle = 'Gist: ' + filesData.length + ' files';
                  }
                  
                  let code_content = filesData[0].content;
                  let language = filesData[0].language;
                  
                  if (filesData.length > 1) {
                      code_content = JSON.stringify({
                          __multi: true,
                          files: filesData
                      });
                      language = 'Multi-file';
                  } else {
                      code_content = JSON.stringify({
                          __multi: true,
                          files: filesData
                      });
                      language = filesData[0].language;
                  }

                  setEditingSnippet({
                      id: '',
                      title: finalTitle,
                      code_content: code_content,
                      language: language,
                      tags: '',
                      is_favorite: false,
                      folder_id: currentFolderId || undefined
                  });
                  setIsModalOpen(true);
              } catch (err) {
                  console.error("Failed to read dropped files", err);
              }
          }"""

patch_file('src/App.tsx', [
    (old_app_imp, new_app_imp),
    (old_app_db, new_app_db),
    (old_app_state, new_app_state),
    (old_app_load, new_app_load),
    (old_app_filter, new_app_filter),
    (old_app_sb, new_app_sb),
    (old_app_save, new_app_save),
    (old_app_dnd, new_app_dnd)
])

# Sidebar.tsx
old_sb_imp = "import { Snippet, AppSettings } from '../types';"
new_sb_imp = "import { Snippet, AppSettings, Folder } from '../types';\nimport { createFolder, renameFolder, deleteFolder } from '../db';\nimport { v4 as uuidv4 } from 'uuid';"

old_sb_props = """interface SidebarProps {
    snippets: Snippet[];
    filterType: 'all' | 'favorites' | 'language' | 'tag';
    setFilterType: (type: 'all' | 'favorites' | 'language' | 'tag') => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: (initialTab?: 'appearance' | 'languages' | 'sidebar') => void;
    settings: AppSettings;
}"""
new_sb_props = """interface SidebarProps {
    snippets: Snippet[];
    folders?: Folder[];
    onFoldersChange?: () => void;
    filterType: 'all' | 'favorites' | 'language' | 'tag' | 'folder' | any;
    setFilterType: (type: any) => void;
    activeTab: string;
    setActiveTab: (tab: string) => void;
    onOpenSettings: (initialTab?: 'appearance' | 'languages' | 'sidebar') => void;
    settings: AppSettings;
}"""

old_sb_state = """const Sidebar: React.FC<SidebarProps> = ({ snippets, filterType, setFilterType, activeTab, setActiveTab, onOpenSettings, settings }) => {
    const locale = settings.locale || 'zh';
    const [isLangOpen, setIsLangOpen] = useState(true);
    const [isTagsOpen, setIsTagsOpen] = useState(true);
    const [tagSearch, setTagSearch] = useState('');"""
new_sb_state = """const Sidebar: React.FC<SidebarProps> = ({ snippets, folders = [], onFoldersChange, filterType, setFilterType, activeTab, setActiveTab, onOpenSettings, settings }) => {
    const locale = settings.locale || 'zh';
    const [isLangOpen, setIsLangOpen] = useState(true);
    const [isTagsOpen, setIsTagsOpen] = useState(true);
    const [isFoldersOpen, setIsFoldersOpen] = useState(true);
    const [tagSearch, setTagSearch] = useState('');
    
    const [editingFolderId, setEditingFolderId] = useState<string | null>(null);
    const [folderNameInput, setFolderNameInput] = useState('');"""

old_sb_lang = "                {/* 语言分类 */}"
folders_render = """                {/* 文件夹分类 */}
                <div className="sidebar-group">
                    <div 
                        className="sidebar-group-header" 
                        onClick={() => setIsFoldersOpen(!isFoldersOpen)}
                        style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}
                    >
                        <span><i className={isFoldersOpen ? "ri-arrow-down-s-line" : "ri-arrow-right-s-line"}></i> {locale === 'zh' ? '文件夹' : 'Folders'}</span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <i 
                                className="ri-add-line" 
                                style={{ padding: '2px', cursor: 'pointer' }}
                                onClick={(e) => {
                                    e.stopPropagation();
                                    const id = uuidv4();
                                    createFolder(id, locale === 'zh' ? '新建文件夹' : 'New Folder', null).then(() => {
                                        if (onFoldersChange) onFoldersChange();
                                        setIsFoldersOpen(true);
                                        setEditingFolderId(id);
                                        setFolderNameInput(locale === 'zh' ? '新建文件夹' : 'New Folder');
                                    });
                                }}
                            ></i>
                        </div>
                    </div>
                    {isFoldersOpen && (
                        <div className="sidebar-list">
                            {folders.map(f => (
                                <div 
                                    key={f.id} 
                                    className={`sidebar-item ${filterType === 'folder' && activeTab === f.id ? 'active' : ''}`}
                                    onClick={() => {
                                        setFilterType('folder');
                                        setActiveTab(f.id);
                                    }}
                                    style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1, overflow: 'hidden' }}>
                                        <i className="ri-folder-2-line" style={{ color: 'var(--theme-color)' }}></i>
                                        {editingFolderId === f.id ? (
                                            <input 
                                                autoFocus
                                                value={folderNameInput}
                                                onChange={e => setFolderNameInput(e.target.value)}
                                                onBlur={() => {
                                                    if (folderNameInput.trim() && folderNameInput !== f.name) {
                                                        renameFolder(f.id, folderNameInput).then(() => onFoldersChange && onFoldersChange());
                                                    }
                                                    setEditingFolderId(null);
                                                }}
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter') {
                                                        if (folderNameInput.trim() && folderNameInput !== f.name) {
                                                            renameFolder(f.id, folderNameInput).then(() => onFoldersChange && onFoldersChange());
                                                        }
                                                        setEditingFolderId(null);
                                                    }
                                                }}
                                                style={{ background: 'rgba(255,255,255,0.1)', color: 'inherit', border: '1px solid var(--theme-color)', outline: 'none', borderRadius: '4px', padding: '2px 4px', width: '100px' }}
                                                onClick={e => e.stopPropagation()}
                                            />
                                        ) : (
                                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{f.name}</span>
                                        )}
                                    </div>
                                    <div className="sidebar-item-actions" style={{ display: 'flex', gap: '4px', opacity: 0.6 }}>
                                        <i 
                                            className="ri-edit-line" 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setEditingFolderId(f.id);
                                                setFolderNameInput(f.name);
                                            }}
                                            title={locale === 'zh' ? '重命名' : 'Rename'}
                                        ></i>
                                        <i 
                                            className="ri-delete-bin-line" 
                                            style={{ color: '#ef4444' }}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                if (window.confirm(locale === 'zh' ? '确定删除该文件夹吗？(代码片段不会被删除)' : 'Delete this folder? (Snippets will not be deleted)')) {
                                                    deleteFolder(f.id).then(() => {
                                                        if (filterType === 'folder' && activeTab === f.id) {
                                                            setFilterType('all');
                                                            setActiveTab('all');
                                                        }
                                                        if (onFoldersChange) onFoldersChange();
                                                    });
                                                }
                                            }}
                                        ></i>
                                    </div>
                                </div>
                            ))}
                            {folders.length === 0 && (
                                <div style={{ padding: '8px 24px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                    {locale === 'zh' ? '暂无文件夹' : 'No folders'}
                                </div>
                            )}
                        </div>
                    )}
                </div>\n                {/* 语言分类 */}"""

patch_file('src/components/Sidebar.tsx', [
    (old_sb_imp, new_sb_imp),
    (old_sb_props, new_sb_props),
    (old_sb_state, new_sb_state),
    (old_sb_lang, folders_render)
])

print("DONE")

