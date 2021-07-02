let interpreter = createInterpreter({
    title: "VBF 2 Transpiler and Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "VBF 2 on Esolangs", href: "https://esolangs.org/wiki/VBF_2"},
        {a: "Specification", href: "./spec.html"},
    ],
    options: [
        {slow: "checkbox", text: "Slow: ", value: true},
        {input: "text", text: "Input: ", value: "Hello, world!\\n"},
    ],
    buttons: [
        {run: "Run"},
        {transpile: "Transpile"},
        {minify: "Minify"},
    ],
    code: "code here",
    output: "output here",
    highlight: highlight,
});

interpreter.onClick("run", async function() {
    console.log(lex(interpreter.code));
    //await run(interpreter.code, interpreter.option("input"));
});

function highlight(code, append, style) {
    let prevBf = false;
    for(let i=0; i<code.length; i++) {
        let isBf = "+-><.,[]".includes(code[i]);
        if(isBf && !prevBf) {
            style("color: #0055FF;");
        } else if(!isBf && prevBf) {
            style(); //reset
        }
        append(code[i]);
        prevBf = isBf;
    }
}

