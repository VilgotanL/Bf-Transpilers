const runBtn = document.getElementById("run_btn");
const transpileBtn = document.getElementById("transpile_btn");
const slowCheckbox = document.getElementById("slow_checkbox");
const inputBox = document.getElementById("input_box");

let slow = true;
let highlightTokenStart = -1; //start of first token of current running statement

function output(str) {
    outputEl.innerText += str;
}
function err(str) {
    outputEl.innerHTML += '<span class="error_span">\nError: ' + escapeHtml(str) + '</span>';
    runBtn.disabled = false;
    throw new Error("Error: " + str);
}
function assert(bool, str) { //assume bool is true, otherwise error
    if(!bool) err(str);
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}


runBtn.addEventListener("click", async function() {
    runBtn.disabled = true;
    outputEl.innerText = "";

    let code = codeEl.value;
    let input = inputBox.value;
    
    let lexer = new Lexer(code);
    let tokens = lexer.lex(code);

    let parser = new Parser()
    let statements = parser.parse(tokens);

    console.log("tokens:", tokens);
    console.log("statements:", statements);

    await run(statements);

    runBtn.disabled = false;
});
transpileBtn.addEventListener("click", async function() {
    outputEl.innerText = "";

    let code = codeEl.value;
    let input = inputBox.value;
    
    let lexer = new Lexer(code);
    let tokens = lexer.lex(code);

    let parser = new Parser()
    let statements = parser.parse(tokens);

    console.log("tokens:", tokens);
    console.log("statements:", statements);

    let transpiled = transpile(statements);

    output(transpiled);
});

slowCheckbox.addEventListener("change", function() {
    slow = slowCheckbox.checked;
    if(!slow) highlightCharIndex = -1;
    updateEditor();
});

codeEl.value = `byte a;
byte b;

a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;
a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;
a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;a++;
a++;a++;a++;a++;a++;
out(a);
out(a);`;