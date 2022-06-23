const runBtn = document.getElementById("run_btn");
const transpileBtn = document.getElementById("transpile_btn");
const minifyBtn = document.getElementById("minify_btn");
const slowCheckbox = document.getElementById("slow_checkbox");
const debugCheckbox = document.getElementById("debug_checkbox");
const inputBox = document.getElementById("input_box");

let slow = false;
let debug = true;
let highlightCharIndex = -1;
let outputStr = "";
let debugStr = "";

function output(str) {
    outputStr += str;
    if(debug) {
        outputEl.innerHTML = '<span class="debug_str_span">' + escapeHtml(debugStr) + '</span>' + escapeHtml(outputStr);
    } else {
        outputEl.innerText = outputStr;
    }
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
    outputStr = "";
    debugStr = "";

    let code = codeEl.value;
    let input = escapeInput(inputBox.value);
    await runVbf(code, input);
    runBtn.disabled = false;
});
transpileBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    outputStr = "";
    debugStr = "";

    let code = codeEl.value;
    let transpiled = transpile(code);

    output(transpiled);
});
minifyBtn.addEventListener("click", async function() {
    outputEl.innerText = "";
    outputStr = "";
    debugStr = "";

    let code = codeEl.value;
    let minified = minifyVbf(code);

    output(minified);
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
#refresh the page to stop the program, i haven't implemented a stop button yet
#note: DEBUG doesn't transpile to bf
#enter input in the box above the code area
#you can also run the program in slow mode,
#which shows the program pointer (current instruction)

#here is an infinite counter program i made:
->+>>++[-<+]-[>>>-[+>>>-]++[-<<
++++++++++++++++++++++++++++++++++++++++++++++++.
------------------------------------------------
<+]->---------(----------)++++++++++(>+<)>[-
>>---------(----------)++++++++++(>+<)>
]<<+!(-!(->>>+<<<)+)->+[-<+]->>++++++++++.[-]<<]
`;


function escapeInput(str) {
    let newStr = "";
    for(let i=0; i<str.length; i++) {
        if(str[i] === "\\") {
            let c = str[i+1];
            if(!c) newStr += "";
            else if(c === "n") newStr += "\n";
            else if(c === "t") newStr += "\t";
            else if(c === "r") newStr += "\r";
            else if(c === "\\") newStr += "\\";
            else if(c === "\"") newStr += "\"";
            else if(c === "\'") newStr += "\'";
            else if(c === "0") newStr += "\0";
            else newStr += c;
            i++;
        } else {
            newStr += str[i];
        }
    }
    return newStr;
}