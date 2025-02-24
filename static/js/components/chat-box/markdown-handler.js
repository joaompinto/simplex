export class MarkdownHandler {
    constructor() {
        this.configureMarked();
    }

    configureMarked() {
        const renderer = {
            code: this.code.bind(this),
            codespan: this.codespan.bind(this)
        };

        window.marked.setOptions({
            breaks: true,
            gfm: true,
            pedantic: false,
            mangle: false,
            headerIds: false,
            highlight: null
        });

        window.marked.use({ renderer });
    }

    code(code, language) {
        // Normalize language name
        let validLanguage = language;
        if (language === 'py' || language === 'python3') {
            validLanguage = 'python';
        }
        
        // Check if language is supported, fallback to plaintext
        validLanguage = hljs.getLanguage(validLanguage) ? validLanguage : 'plaintext';

        try {
            // First decode any HTML entities
            const decodedCode = this.decodeHtml(code);
            
            // Then highlight the code
            const highlighted = hljs.highlight(decodedCode, {
                language: validLanguage,
                ignoreIllegals: true
            });

            // Finally wrap in pre/code tags
            return `<pre><code class="hljs language-${validLanguage}">${highlighted.value}</code></pre>`;
        } catch (err) {
            console.warn('Failed to highlight code:', err);
            return `<pre><code class="hljs">${code}</code></pre>`;
        }
    }

    codespan(code) {
        // Decode HTML entities in inline code
        const decodedCode = this.decodeHtml(code);
        return `<code class="inline-code">${decodedCode}</code>`;
    }

    decodeHtml(html) {
        const txt = document.createElement('textarea');
        txt.innerHTML = html;
        return txt.value;
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') {
            unsafe = String(unsafe || '');
        }
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
