const codeEl = document.getElementById("code");
const outputEl = document.getElementById("output");
const minifyBtn = document.getElementById("minify_btn");
const outputInfo = document.getElementById("output_info");
const prettifyMinifiedCheckbox = document.getElementById("prettify_minified_checkbox");

let prettifyMinified = prettifyMinifiedCheckbox.checked;


function setInfoClass(str) {
    outputInfo.classList.remove("output_info_green", "output_info_red");
    outputInfo.classList.add(str);
}
function greenInfo(str) {
    outputInfo.innerText = str;
    setInfoClass("output_info_green");
}
function err(str) {
    outputInfo.innerText = str;
    setInfoClass("output_info_red");
    throw new Error(str);
}
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


minifyBtn.addEventListener("click", async function() {
    outputEl.innerText = "";

    let code = codeEl.value;
    let minified = minify(code);

    greenInfo("Minified from "+countBfInstructions(code)+" instructions to "+minified.length+" instructions");

    if(prettifyMinified) minified = prettify(minified);

    output(minified);
});

prettifyMinifiedCheckbox.addEventListener("change", function() {
    prettifyMinified = prettifyMinifiedCheckbox.checked;
});