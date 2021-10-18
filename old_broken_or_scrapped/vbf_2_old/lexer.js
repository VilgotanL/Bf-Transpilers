const numeric = "0123456789";

function nextInt(code, lineNum) {
    let str = "";
    let n;
    if(code[0] === "'") { //character
        let c;
        if(code[1] === "\\") {
            if(code[2] === "n") c = "\n";
            else if(code[2] === "t") c = "\t";
            else if(code[2] === "0") c = "\0";
            else if(code[2] === "\\") c = "\\";
            else if(code[2] === "\"") c = "\"";
            else if(code[2] === "'") c = "'";
            else interpreter.err("Unknown escape combination at character literal: '\\"+code[2]+"' (line "+lineNum+")");
            if(code[3] !== "'") interpreter.err("Error: Expected ' after character literal at (line "+lineNum+")");
        } else {
            c = code[1];
            if(code[2] !== "'") interpreter.err("Error: Expected ' after character literal at (line "+lineNum+")");
        }
        n = c.charCodeAt(0) % 256;
    } else { //might be integer
        for(let i=0; i<code.length; i++) {
            if(numeric.includes(code[i])) {
                str += code[i];
            } else {
                break;
            }
        }
        n = Math.floor(Number(str)) % 256;
        if(!isFinite(n) || str.length === 0) n = null;
    }
    return [str, n];
}

class Token {
    constructor(type, value, start, end) {
        this.type = type;
        this.value = value;
        this.start = start;
        this.end = end;
    }
}

function lex(code) {
    let tokens = [];
    let lineNum = 1;
    for(let i=0; i<code.length; i++) {
        if(code[i] === "\n") {
            lineNum++;
            continue;
        }

        if(numeric.includes(code[i])) { //starts with numeric

        } else if("+-><".includes(code[i])) {
            let [intStr, n] = nextInt(code.substring(i+1), lineNum);
            if(n !== null) {
                if(!isFinite(n)) interpreter.err("Internal: n not finite / n is NaN");
                tokens.push(new Token(code[i], n, i, i+intStr.length+1));
                i += intStr.length;
            } else {
                tokens.push(new Token(code[i], 1, i, i+1));
            }
        } else if(code[i] === "=") {
            let [intStr, n] = nextInt(code.substring(i+1), lineNum);
            if(n !== null) {
                if(!isFinite(n)) interpreter.err("Internal: n not finite / n is NaN");
                tokens.push(new Token(code[i], n, i, i+intStr.length+1));
                i += intStr.length;
            } else {
                interpreter.err("Error: expected number after = (at line "+lineNum+")");
            }
        }
    }
    return tokens;
}