let interpreter = createInterpreter({
    title: "Fast brainf**k Interpreter",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Brainf***", href: "https://esolangs.org/wiki/Brainfuck"},
    ],
    options: [
        {input: "text", text: "Input: ", value: "Hello, world!"},
    ],
    buttons: [
        {run: "Run"},
        {minify: "Minify"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        let prevBf = false;
        for(let i=0; i<code.length; i++) {
            let isBf = "+-><.,[]".includes(code[i]);
            if(isBf && !prevBf) {
                style("color: blue;");
            } else if(!isBf && prevBf) {
                style(); //reset
            }
            append(code[i]);
            prevBf = isBf;
        }
    }
});

interpreter.onClick("run", async function() {
    let input = interpreter.option("input");
    let js = generateJs(interpreter.code);
    console.log(js);

    await new Promise((res, rej) => {
        let worker = new Worker("worker.js");
        worker.onmessage = function(e) {
            if(e.data === "done") {
                res();
            } else {
                interpreter.output(String.fromCharCode(e.data));
            }
        }
        worker.postMessage({code: js, input: input});
    });
});
interpreter.onClick("minify", async function() {
    interpreter.output(minify(interpreter.code));
});
