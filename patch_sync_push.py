import re

with open('src/sync.ts', 'r') as f:
    content = f.read()

old_push_loop = """        for (const file of filesToCommit) {
            const blobRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs`, {
                method: 'POST',
                headers: {
                    'Authorization': `token ${t}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    content: btoa(unescape(encodeURIComponent(file.content))),
                    encoding: 'base64'
                })
            });
            if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}`);
            const blobSha = (await blobRes.json()).sha;
            
            tree.push({
                path: file.path,
                mode: '100644',
                type: 'blob',
                sha: blobSha
            });
        }"""

new_push_loop = """        const CHUNK_SIZE = 10;
        for (let i = 0; i < filesToCommit.length; i += CHUNK_SIZE) {
            const chunk = filesToCommit.slice(i, i + CHUNK_SIZE);
            const results = await Promise.all(chunk.map(async (file) => {
                const blobRes = await fetch(`https://api.github.com/repos/${owner}/${actualRepo}/git/blobs`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `token ${t}`,
                        'Accept': 'application/vnd.github.v3+json',
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        content: btoa(unescape(encodeURIComponent(file.content))),
                        encoding: 'base64'
                    })
                });
                if (!blobRes.ok) throw new Error(`Failed to create blob for ${file.path}`);
                const blobSha = (await blobRes.json()).sha;
                return {
                    path: file.path,
                    mode: '100644',
                    type: 'blob',
                    sha: blobSha
                };
            }));
            tree.push(...results);
        }"""

if old_push_loop in content:
    content = content.replace(old_push_loop, new_push_loop)
else:
    print("Could not find push loop")

with open('src/sync.ts', 'w') as f:
    f.write(content)
