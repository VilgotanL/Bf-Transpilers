var interpreter = createInterpreter({
    title: "VBF 3 Transpiler",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Brainf***", href: "https://esolangs.org/wiki/Brainfuck"},
    ],
    options: [
        {debug: "checkbox", text: "Debug: ", value: true},
        //{input: "text", text: "Input: ", value: "Hello, world!\\na"},
    ],
    buttons: [
        {VBF3ToIntermediate: "VBF 3 to Intermediate"},
        {intermediateToVBF: "Intermediate to VBF"},
        {intermediateToBf: "Intermediate to bf"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        let lines = code.split("\n");
        for(let i=0; i<lines.length; i++) {
            let parts = lines[i].split("#");
            style();
            append(parts[0]);
            style("color: #00a900;");
            parts[0] = "";
            append(parts.join("#"));
            if(i < lines.length-1) append("\n");
        }
    }
});

interpreter.onClick("intermediateToVBF", async function() {
    interpreter.output(transpile_intermediate(interpreter.code));
});
interpreter.onClick("intermediateToBf", async function() {
    let vbf = transpile_intermediate(interpreter.code);
    let bf = transpileVbfToBf(vbf);

    interpreter.output(bf);
});
interpreter.onClick("VBF3ToIntermediate", async function() {
    let intermediate = transpile_vbf3_to_intermediate(interpreter.code);

    interpreter.output(intermediate);
});
