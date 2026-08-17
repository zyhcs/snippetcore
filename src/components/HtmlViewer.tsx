import React, { useMemo } from 'react';

interface HtmlViewerProps {
    content: string;
    language: string;
}

const HtmlViewer: React.FC<HtmlViewerProps> = ({ content, language }) => {
    const srcDoc = useMemo(() => {
        const lang = language.toLowerCase();
        
        if (lang === 'html') {
            return content;
        }
        
        if (lang === 'svg') {
            return `
                <!DOCTYPE html>
                <html>
                <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh; background:#fff;">
                    ${content}
                </body>
                </html>
            `;
        }
        
        if (lang === 'mermaid') {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <script src="https://cdn.jsdelivr.net/npm/mermaid/dist/mermaid.min.js"></script>
                    <script>
                        mermaid.initialize({ startOnLoad: true });
                    </script>
                </head>
                <body style="background:#fff; margin:0; padding:20px; display:flex; justify-content:center;">
                    <div class="mermaid">
${content.replace(/</g, '&lt;').replace(/>/g, '&gt;')}
                    </div>
                </body>
                </html>
            `;
        }
        
        if (lang === 'echarts') {
            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <script src="https://cdn.jsdelivr.net/npm/echarts/dist/echarts.min.js"></script>
                </head>
                <body style="margin:0; padding:0; background:#fff; width:100vw; height:100vh;">
                    <div id="main" style="width: 100%; height: 100%;"></div>
                    <script>
                        try {
                            var myChart = echarts.init(document.getElementById('main'));
                            var option;
                            // Inject user code
                            ${content}
                            // Auto-set option if user declared it
                            if (typeof option === 'object' && option) {
                                myChart.setOption(option);
                            }
                            window.addEventListener('resize', function() {
                                myChart.resize();
                            });
                        } catch(e) {
                            document.getElementById('main').innerHTML = '<div style="color:red;padding:20px;">' + e.toString() + '</div>';
                        }
                    </script>
                </body>
                </html>
            `;
        }
        
        return content;
    }, [content, language]);

    return (
        <div style={{ flex: 1, width: '100%', background: '#fff', borderRadius: '8px', overflow: 'hidden', display: 'flex' }}>
            <iframe
                srcDoc={srcDoc}
                style={{ width: '100%', height: '100%', border: 'none' }}
                sandbox="allow-scripts allow-same-origin"
                title="Preview"
            />
        </div>
    );
};

export default HtmlViewer;
