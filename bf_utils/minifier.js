function minify(code) {
    let newCode = "";

    for(let i=0; i<code.length; i++) {
        if("+-><,.[]".includes(code[i])) {
            let last = newCode[newCode.length-1];
            
            newCode += code[i];

            if(code[i] === "+" && last === "-") {
                newCode = newCode.slice(0, -2);
            } else if(code[i] === "-" && last === "+") {
                newCode = newCode.slice(0, -2);
            } else if(code[i] === ">" && last === "<") {
                newCode = newCode.slice(0, -2);
            } else if(code[i] === "<" && last === ">") {
                newCode = newCode.slice(0, -2);
            }
        }
    }

    while(newCode.startsWith("[")) { //remove initial loops
        newCode = newCode.split("]").slice(1).join("]");
    }

    let newCode2 = "";
    for(let i=0; i<newCode.length; i++) {
        if(newCode[i] === "[" && newCode[i-1] === "]") {
            let inset = 0;
            for(let j=i; j<newCode.length; j++) {
                if(newCode[j] === "[") inset++;
                else if(newCode[j] === "]") inset--;
                if(inset === 0) {
                    i = j;
                    break;
                }
            }
            if(inset !== 0) err("Unbalanced [ and ]");
        } else {
            newCode2 += newCode[i];
        }
    }

    return newCode2;
}

function countBfInstructions(code) {
    let n = 0;
    for(let i=0; i<code.length; i++) {
        if("+-><,.[]".includes(code[i])) n++;
    }
    return n;
}

function prettify(code) {
    let newCode = "";

    let i=0;
    for(; i<code.length; i += 100) {
        newCode += code.substring(i, i+100)+"\n";
    }
    newCode += code.substring(i, code.length);
    return newCode;
}