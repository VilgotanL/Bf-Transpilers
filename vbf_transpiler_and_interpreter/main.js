const runBtn = document.getElementById("run_btn");
const transpileBtn = document.getElementById("transpile_btn");
const slowCheckbox = document.getElementById("slow_checkbox");
const debugCheckbox = document.getElementById("debug_checkbox");
const inputBox = document.getElementById("input_box");

let slow = false;
let debug = true;
let highlightCharIndex = -1;

function output(str) {
    outputEl.innerText += str;
}
function err(str) {
    outputEl.innerHTML += '<span class="error_span">\nError: ' + escapeHtml(str) + '</span>';
    throw new Error("Error: " + str);
}
function assert(bool, str) { //assume bool is true, otherwise error
    if(!bool) err(str);
}
function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}


runBtn.addEventListener("click", async function() {
    outputEl.innerText = "";

    let code = codeEl.value;
    let input = inputBox.value;
    await runVbf(code, input);
});
transpileBtn.addEventListener("click", async function() {
    outputEl.innerText = "";

    let code = codeEl.value;
    let transpiled = transpile(code);

    output(transpiled);
});

slowCheckbox.addEventListener("change", function() {
    slow = slowCheckbox.checked;
    if(!slow) highlightCharIndex = -1;
    updateEditor();
});
debugCheckbox.addEventListener("change", function() {
    debug = debugCheckbox.checked;
    updateEditor();
});

codeEl.value = `#this is vbf, my version of brainf***
#use # for comments
[
+-><,.[] #these are the same as in bf,
#vbf is basically backwards-compatible with bf
#but these instructions are new:
( code ) #if zero
!( code ) #if not zero
{ code } #while zero
]

#you can also write DEBUG to print the memory and pointer
DEBUG

#click run to test the program, transpile to generate bf code
#note: DEBUG doesn't transpile to bf
#enter input in the box above the code area
#you can also run the program in slow mode,
#which shows the program pointer (current instruction)`;