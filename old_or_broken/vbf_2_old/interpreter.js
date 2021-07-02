async function run(code, input) {
    let mem = [0];
    let p = 0;

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

        interpreter.clearHighlights();
        interpreter.highlight(prevI, prevI+1, "background-color: lawngreen;");

        if(interpreter.option("slow")) await sleep(1);
    }
    interpreter.clearHighlights();
}