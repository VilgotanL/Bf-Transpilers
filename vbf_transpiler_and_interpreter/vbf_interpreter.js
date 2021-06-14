function afterParentheses(code, i, open, close) {
    let inset = 0;
    let end;
    for(let j=i; j<code.length; j++) {
        if(code[j] === open) {
            inset++;
        } else if(code[j] === close) {
            inset--;
            if(inset === 0) {
                end = j;
                break;
            }
        }
    }
    if(end === undefined) err("Expected closing "+close);
    return end;
}
function beforeParentheses(code, i, open, close) {
    let inset = 0;
    let end;
    for(let j=i; j>=0; j--) {
        if(code[j] === close) {
            inset++;
        } else if(code[j] === open) {
            inset--;
            if(inset === 0) {
                end = j;
                break;
            }
        }
    }
    if(end === undefined) err("Expected opening "+open);
    return end;
}

async function runVbf(code, input) {
    //remove comments
    let lines = code.split("\n");
    for(let i=0; i<lines.length; i++) {
        let start = lines[i].split("#")[0].length;
        lines[i] = lines[i].substring(0, start) + " ".repeat(lines[i].length - start);
    }
    code = lines.join("\n");

    let mem = [0];
    let p = 0;
    let iters = 0;

    for(let i=0; i<code.length; i++) {
        if(code[i].trim() === "") continue; //whitespace
        

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
            if(p < 0) err("Pointer out of bounds");
        } else if(code[i] === ",") {
            mem[p] = (input[0] ?? "\0").charCodeAt(0) % 256;
            input = input.substring(1);
        } else if(code[i] === ".") {
            output(String.fromCharCode(mem[p]));
        } else if(code[i] === "(") {
            if((code[i-1] === "!" && mem[p] === 0) || (code[i-1] !== "!" && mem[p] !== 0)) {
                i = afterParentheses(code, i, "(", ")");
            }
        } else if(code[i] === ")") {
            //do nothing
        } else if(code[i] === "{") {
            if(mem[p] !== 0) {
                i = afterParentheses(code, i, "{", "}");
            }
        } else if(code[i] === "}") {
            if(mem[p] === 0) {
                i = beforeParentheses(code, i, "{", "}");
            }
        } else if(code[i] === "[") {
            if(mem[p] === 0) {
                i = afterParentheses(code, i, "[", "]");
            }
        } else if(code[i] === "]") {
            if(mem[p] !== 0) {
                i = beforeParentheses(code, i, "[", "]");
            }
        } else if(code.substring(i).startsWith("DEBUG") && debug) {
            output("\nMEM: " + mem.join(" ")+"\n");
            let strings = mem.join(" ").split(" ");
            strings.splice(p, 0, "#");
            strings = strings.join(" ");
            let n = "MEM: ".length + strings.indexOf("#");
            output(" ".repeat(n) + "^" + "\n");

            i += "DEBUG".length - 1;
        }

        if(slow) {
            highlightCharIndex = prevI;
            updateEditor();

            debugStr = ("MEM: " + mem.join(" ")+"\n");
            let strings = mem.join(" ").split(" ");
            strings.splice(p, 0, "#");
            strings = strings.join(" ");
            let n = "MEM: ".length + strings.indexOf("#");
            debugStr += (" ".repeat(n) + "^" + "\n");

            output("");

            await sleep(100);
        }
        iters++;
        if(iters > 2000) {
            iters = 0;
            await sleep(0);
        }
    }
    highlightCharIndex = -1;
    updateEditor();
}