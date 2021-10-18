let interpreter = createInterpreter({
    title: "Bf Transpiler Chain",
    theme: "light",
    titlebar: [
        {p: "by VilgotanL"},
        {a: "Brainf***", href: "https://esolangs.org/wiki/Brainfuck"},
    ],
    options: [
        {minify: "checkbox", text: "Minify: ", value: false},
    ],
    buttons: [
        {transpile: "Transpile"},
        {run: "Run"},
    ],
    code: "code here",
    output: "output here",
    highlight: function(code, append, style) {
        append(code);
    }
});

window.output = () => {};

import {
    MovePtr, Add, Sub, Set, Right, Left,
    Input, Output, WhileNz, EndWhileNz, Move, Copy,
    PrintChar, Print, Insert, Remove, IfNot, If, EndIf, While, WhileNot, EndWhile, PrintNum, ReadNum
} from "./chain/2_insert.js";


interpreter.onClick("run", async function() {
    await run(transpile(interpreter.code));
});
interpreter.onClick("transpile", async function() {
    interpreter.output(transpile(interpreter.code));
});

function transpile(code) {
    let generated = "";
    window.output = function(str) {
        generated += str;
    }
    try {
        eval(code);
    } catch(e) {
        console.log(e);
        interpreter.err(e.toString());
    }
    return generated;
}

async function run(code) {
    let mem = [0];
    let input = "";
    let p = 0;

    let iters = 0;
    for(let i=0; i<code.length; i++) {
        let prevI = i;

        if(code[i] === "+") {
            mem[p]++;
            if(mem[p] > 255) mem[p] = 0;
        } else if(code[i] === "-") {
            mem[p]--;
            if(mem[p] < 0) mem[p] = 255;
        } else if(code[i] === ">") {
            p++;
            if(p >= mem.length) mem.push(0);
        } else if(code[i] === "<") {
            p--;
            if(p < 0) interpreter.err("Error: Pointer out of bounds!");
        } else if(code[i] === ",") {
            if(input.length === 0) {
                input += (prompt("Enter line of input:")||"") + "\n";
            }
            mem[p] = (input.charCodeAt(0) || 0) % 256;
            input = input.substring(1);
        } else if(code[i] === ".") {
            interpreter.output(String.fromCharCode(mem[p]));
        } else if(code[i] === "[") {
            if(mem[p] === 0) {
                let inset = 0;
                for(let j=i; j<code.length; j++) {
                    if(code[j] === "[") inset++;
                    if(code[j] === "]") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) interpreter.err("Error: Expected ]");
            }
        } else if(code[i] === "]") {
            if(mem[p] !== 0) {
                let inset = 0;
                for(let j=i; j>=0; j--) {
                    if(code[j] === "]") inset++;
                    if(code[j] === "[") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) interpreter.err("Error: Expected [");
            }
        }

        iters++;
        if(iters >= 1000) {
            await new Promise((r) => requestAnimationFrame(r));
            iters = 0;
        }
    }
}


/* 2_insert
Set(69);

let equals = 69;
If(equals);
    Print("equal to "+equals);
EndIf();
IfNot(equals);
    Print("not equal to "+equals);
EndIf();
*/