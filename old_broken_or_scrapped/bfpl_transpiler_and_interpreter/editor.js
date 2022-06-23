//syntax highlighting

const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const syntaxEl = document.getElementById("code_syntax");
const wrapper = document.getElementById("code_wrapper");


function updateEditor() {
    syntaxEl.innerHTML = generateHighlightingHtml(codeEl.value)+"\n\n\n\n"; //the newlines fix a weird scrolling bug, 4 to be safe, 2 probably only needed
    syntaxEl.scrollTop = codeEl.scrollTop;
    syntaxEl.scrollLeft = codeEl.scrollLeft;
    
    codeEl.style.width = wrapper.clientWidth+"px";
    codeEl.style.height = wrapper.clientHeight+"px";
    syntaxEl.style.height = wrapper.clientHeight+"px";
    syntaxEl.style.width = wrapper.clientWidth+"px";
}

window.addEventListener("load", function() {
    codeEl.addEventListener("scroll", updateEditor);
    //codeEl.addEventListener("mousemove", updateEditor); //for resizing
    codeEl.addEventListener("input", updateEditor);
    window.addEventListener("resize", updateEditor);
    updateEditor();
});

function insertText(text) {
    let val = code.value;
    let newCPos = codeEl.selectionStart + text.length;
    code.value = val.substring(0, codeEl.selectionStart) + text + val.substring(codeEl.selectionEnd);
    codeEl.selectionStart = newCPos;
    codeEl.selectionEnd = newCPos;

    updateEditor();
}

codeEl.addEventListener("keydown", function(e) {
    if(e.keyCode === 9 || e.which === 9) {
        e.preventDefault();

        insertText("\t");
    }
});


function escapeHtml(str) {
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}