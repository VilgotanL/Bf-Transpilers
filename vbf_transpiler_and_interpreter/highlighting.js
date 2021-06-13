

function generateHighlightingHtml(code) {
    let html = "";

    const spanEnd = '</span>';
    const vbfSpan = '<span class="vbf_span">';
    const commentSpan = '<span class="comment_span">';
    const codePointerSpan = '<span class="code_pointer_span">';
    const otherSpan = '<span class="other_span">';
    const debugSpan = '<span class="debug_span">';

    for(let i=0; i<code.length; i++) {
        if(i === highlightCharIndex) {
            html += codePointerSpan + escapeHtml(code[i]) + spanEnd;
        } else if(code.substring(i).startsWith("DEBUG") && debug) {
            html += debugSpan + escapeHtml("DEBUG") + spanEnd;
            i += 5 - 1;
        } else if(code[i] === "#") {
            let end = code.length;
            for(let j=i; j<code.length; j++) {
                if(code[j] === "\n") {
                    end = j;
                    break;
                }
            }
            html += commentSpan + escapeHtml(code.substring(i, end)) + spanEnd;
            i = end - 1;
        } else if("+-><,.!(){}[]".includes(code[i])) {
            html += vbfSpan + escapeHtml(code[i]) + spanEnd;
        } else {
            html += otherSpan + escapeHtml(code[i]) + spanEnd;
        }
    }

    return html;
}