export function isProbablyCode(text: string): boolean {
    if (!text || text.trim().length === 0) return false;

    const lines = text.split('\n').filter(line => line.trim().length > 0);
    
    // A single short line is usually not a snippet worth saving
    if (lines.length < 2 && text.length < 20) return false;

    // Check for common code structures / tokens
    const codeIndicators = [
        /function\s+\w+\s*\(/, // JavaScript/TypeScript function
        /const\s+\w+\s*=\s*(?:=>|function)/, // JS arrow function
        /class\s+\w+/, // Class definition
        /import\s+.*from/, // Import statement
        /export\s+(?:default\s+)?(?:const|let|var|function|class)/, // Export statement
        /<\w+>.*<\/\w+>/s, // HTML/XML tags
        /SELECT\s+.*\s+FROM/i, // SQL
        /def\s+\w+\s*\(/, // Python function
        /public\s+class/, // Java/C# class
        /DATA:\s+\w+\s+TYPE/, // ABAP data declaration
        /FORM\s+\w+/, // ABAP form
        /\{[\s\S]*\}/, // JSON or block of code with braces
        /\[\s*\{[\s\S]*\}\s*\]/ // JSON Array
    ];

    // If it matches any obvious indicator
    if (codeIndicators.some(regex => regex.test(text))) {
        return true;
    }

    // Fallback heuristic: checking for brackets, semicolons, and indentation
    let score = 0;
    if (text.includes('{') && text.includes('}')) score += 2;
    if (text.includes('(') && text.includes(')')) score += 1;
    if (text.includes(';')) score += 1;
    if (text.includes('=>')) score += 2;
    if (text.includes('&&') || text.includes('||')) score += 1;
    
    // Check indentation pattern (leading spaces/tabs on multiple lines)
    let indentedLines = 0;
    for (const line of lines) {
        if (/^[\t ]+/.test(line)) {
            indentedLines++;
        }
    }
    
    // If more than 30% of lines are indented, it's highly likely to be code
    if (lines.length > 2 && indentedLines / lines.length > 0.3) {
        score += 2;
    }

    return score >= 3;
}
