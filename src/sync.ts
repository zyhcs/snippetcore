import JSZip from 'jszip';

const getExt = (lang: string) => {
    const l = lang.toLowerCase();
    const map: Record<string, string> = {
        'javascript': 'js', 'typescript': 'ts', 'python': 'py', 'ruby': 'rb',
        'c++': 'cpp', 'c#': 'cs', 'go': 'go', 'rust': 'rs', 'html': 'html',
        'css': 'css', 'json': 'json', 'markdown': 'md', 'abap': 'abap',
        'dart': 'dart', 'java': 'java', 'kotlin': 'kt', 'swift': 'swift',
        'sql': 'sql', 'php': 'php', 'xml': 'xml', 'yaml': 'yaml',
        'shell': 'sh', 'objective-c': 'm', 'text': 'txt', 'vue': 'vue'
    };
    return map[l] || 'txt';
};

const sanitize = (name: string) => name.replace(/[\\/:*?"<>|]/g, '_').replace(/\s+/g, '_');

// Initialize repo if not exists
async function initSyncRepo(token: string, repoName: string, owner: string) {
    const t = token.trim();
    const res = await fetch(`https://api.github.com/repos/${owner}/${repoName}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    
    if (res.status === 404) {
        // Create repo
        const createRes = await fetch(`https://api.github.com/user/repos`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${t}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: repoName,
                private: true,
                auto_init: true,
                description: 'SnippetCore Cloud Sync Repository'
            })
        });
        if (!createRes.ok) throw new Error("Failed to create repository");
        // Wait a bit for repo initialization
        await new Promise(r => setTimeout(r, 2000));
        return 'main';
    } else if (!res.ok) {
        throw new Error(`Failed to check repository: ${res.statusText}`);
    }
    
    const data = await res.json();
    return data.default_branch;
}

export async function syncToRepo(token: string, repoName: string | null, content: string): Promise<string> {
    const t = token.trim();
    const actualRepo = repoName || 'snippetcore-sync';
    
    const userRes = await fetch('https://api.github.com/user', {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!userRes.ok) throw new Error("Invalid GitHub Token");
    const user = await userRes.json();
    const owner = user.login;

    const defaultBranch = await initSyncRepo(t, actualRepo, owner);

    // Get latest commit
    const refRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs/heads/${defaultBranch}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    let baseCommitSha = '';
    if (refRes.ok) {
        baseCommitSha = (await refRes.json()).object.sha;
    }

    // Parse content
    const parsed = JSON.parse(content);
    const snippets = parsed.snippets || [];
    const settings = parsed.settings || {};

    const tree = [];
    // Settings file
    tree.push({
        path: 'settings.json',
        mode: '100644',
        type: 'blob',
        content: JSON.stringify(settings, null, 2)
    });

    // Snippets
    for (const s of snippets) {
        const ext = getExt(s.language);
        const filename = `snippets/${sanitize(s.title)}-${s.id}.${ext}`;
        tree.push({
            path: filename,
            mode: '100644',
            type: 'blob',
            content: s.code_content || '\n'
        });
    }

    // Include the monolithic backup file for fast pulling
    tree.push({
        path: 'snippetcore-sync.json',
        mode: '100644',
        type: 'blob',
        content
    });

    // Create Tree (Since we don't provide base_tree, it effectively replaces everything in the root)
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/trees`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ tree })
    });
    if (!treeRes.ok) throw new Error("Failed to create git tree");
    const newTreeSha = (await treeRes.json()).sha;

    // Create Commit
    const commitBody: any = {
        message: `Sync from SnippetCore at ${new Date().toISOString()}`,
        tree: newTreeSha
    };
    if (baseCommitSha) commitBody.parents = [baseCommitSha];
    
    const commitRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/commits`, {
        method: 'POST',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(commitBody)
    });
    if (!commitRes.ok) throw new Error("Failed to create commit");
    const newCommitSha = (await commitRes.json()).sha;

    // Update Ref
    const patchRefRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs/heads/${defaultBranch}`, {
        method: 'PATCH',
        headers: {
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ sha: newCommitSha, force: true })
    });
    
    if (!patchRefRes.ok) {
        // If the branch doesn't exist (e.g. empty repo), we need to POST to create it
        const postRefRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/refs`, {
            method: 'POST',
            headers: {
                'Authorization': `token ${t}`,
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ ref: `refs/heads/${defaultBranch}`, sha: newCommitSha })
        });
        if (!postRefRes.ok) throw new Error("Failed to update branch ref");
    }

    return actualRepo;
}

export async function pullFromRepo(token: string, repoName: string): Promise<string> {
    const t = token.trim();
    const userRes = await fetch('https://api.github.com/user', {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!userRes.ok) throw new Error("Invalid GitHub Token");
    const owner = (await userRes.json()).login;
    const actualRepo = repoName || 'snippetcore-sync';

    // 1. Get the default branch (usually main or master)
    const repoRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!repoRes.ok) {
        if (repoRes.status === 404) throw new Error("Repository not found. Push first to initialize.");
        throw new Error("Failed to access repository");
    }
    const defaultBranch = (await repoRes.json()).default_branch || 'main';

    // 2. Get the tree for the default branch
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/trees/${defaultBranch}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!treeRes.ok) {
        throw new Error("Failed to read repository tree. Repository might be empty.");
    }
    const tree = (await treeRes.json()).tree;
    
    const syncFileNode = tree.find((node: any) => node.path === 'snippetcore-sync.json');
    if (!syncFileNode) {
        throw new Error("Backup file 'snippetcore-sync.json' not found in repository.");
    }

    // 3. Get the blob
    const blobRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs/${syncFileNode.sha}`, {
        headers: { 
            'Authorization': `token ${t}`,
            'Accept': 'application/vnd.github.v3+json'
        }
    });
    if (!blobRes.ok) throw new Error("Failed to download blob data");
    
    const blobData = await blobRes.json();
    if (!blobData.content) {
        throw new Error("Invalid response from GitHub API");
    }
    
    // Decode base64 content
    const content = decodeURIComponent(escape(atob(blobData.content.replace(/\n/g, ''))));
    return content;
}
