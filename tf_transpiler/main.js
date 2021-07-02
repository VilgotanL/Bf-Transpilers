let interpreter = createInterpreter({
    title: "Tapef*** Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Tapef***", href: "./idea.txt"},
    ],
    options: [
        {debug: "checkbox", text: "Debug: ", value: true},
        //{input: "text", text: "Input: ", value: "Hello, world!\\na"},
    ],
    buttons: [
        {transpile: "Transpile"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        let inStr = false;
        for(let i=0; i<code.length; i++) {
            if(inStr) {
                if(code[i] === "\\") {
                    append(code[i]);
                    i++;
                    if(code[i]) append(code[i]);
                } else if(code[i] === '"') {
                    inStr = false;
                    append(code[i]);
                } else {
                    append(code[i]);
                }
            } else {
                let isBf = "^v+-><.,;:[]{}()!()".includes(code[i]);
                if(code[i] === '"') {
                    inStr = true;
                    style("color: green;");
                } else if(isBf) {
                    style("color: #0055FF;");
                } else {
                    style(); //reset
                }
                append(code[i]);
            }
        }
    }
});

interpreter.onClick("transpile", async function() {
    interpreter.output(transpile(interpreter.code));
});
