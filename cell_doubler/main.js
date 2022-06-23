let interpreter = createInterpreter({
    title: "BF Cell Doubler",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "The translation table", href: "doc.html"},
        {p: "Note: the output and input aren't optimized"},
    ],
    options: [
        {noContract: "checkbox", text: "Dont use loops to contract plus/minus sequences (programs become much bigger):", value: false},
    ],
    buttons: [
        {transpile: "Transpile"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
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
});

interpreter.onClick("transpile", async function() {
    let code = interpreter.code;

    let generated = ">>>";
    
    const map = {
        ">": ">>>>",
        "<": "<<<<",
        "+": "+>+<[>-]>[<<+>>>]<[-]<",
        "-": ">+<[>-]>[<<->>>]<[-]<-",
        "+n": "<<N[->>+>+<[>-]>[<<+>>>]<[-]<<<]>>", //used to make the programs much smaller, but slightly slower
        "-n": "<<N[->>>+<[>-]>[<<->>>]<[-]<-<<]>>",
        ".": ".",
        ",": ",",
        "[": "<<+>[>>+<<<-]<[<]>[-]>>>[-<<<+>>>]<>+<[<<+>>>-]>[>]<[-]<<<[[-]>>",
        "]": "<<+>[>>+<<<-]<[<]>[-]>>>[-<<<+>>>]<>+<[<<+>>>-]>[>]<[-]<<<]>>",
    };

    for(let i=0; i<code.length; i++) {
        if(!interpreter.option("noContract") && code[i] === "+") {
            let n = 0;
            for(; n<256; n++) { //max 256
                if(code[i] === "+") i++;
                else break;
            }
            console.log(n);
            i--;
            if(n > 1) generated += map["+n"].replaceAll("N", "+".repeat(n));
            else generated += map["+"];
        } else if(!interpreter.option("noContract") && code[i] === "-") {
            let n = 0;
            for(; n<256; n++) { //max 256
                if(code[i] === "-") i++;
                else break;
            }
            console.log(n);
            i--;
            if(n > 1) generated += map["-n"].replaceAll("N", "+".repeat(n));
            else generated += map["-"];
        } else generated += map[code[i]] || "";
    }

    interpreter.output(generated);
});
