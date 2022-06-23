function transpile(code) {
    let newCode = "";
    let lowLevel = false;

    newCode += "->>>>->>--<<<<<< #INIT\n\n";

    for(let i=0; i<code.length; i++) {

        if(code[i] === "v") {
            if(lowLevel) interpreter.err("Cannot go to lower level when already at lower level");
            lowLevel = true;

            newCode += "> #v\n";
        } else if(code[i] === "^") {
            if(!lowLevel) interpreter.err("Cannot go to outer level when already at outer level");
            lowLevel = false;

            newCode += "<+[-<<+]- #^\n";
        } else if(code[i] === '"') { //string printing
            let codes = [];
            let j;
            for(j = i+1; j<code.length; j++) {
                if(code[j] === "\\") {
                    let nextChar = code[j+1];
                    if(!nextChar) interpreter.err("Unending string at \\");
                    if(nextChar === "n") codes.push(10);
                    else if(nextChar === "t") codes.push(9);
                    else if(nextChar === "\\") codes.push(92);
                    else if(nextChar === "\"") codes.push(34);
                    else if(nextChar === "'") codes.push(39);
                    else if(nextChar === "0") codes.push(0);
                    else if(nextChar === "(") {
                        let done = false;
                        let str = "";
                        for(let k = j+2; k<code.length; k++) {
                            if(code[k] === ")") {
                                done = true;
                                j += str.length + 1;
                                break;
                            } else {
                                str += code[k];
                            }
                        }
                        if(!done) interpreter.err("Unending string at \\(");
                        let num = Math.floor(Number(str)) % 256;
                        if(!isFinite(num) || !str.trim()) interpreter.err("Invalid number for \\(n) in string: '"+str+"'");

                        codes.push(num);
                    } else interpreter.err("Unknown escape combo: '\\"+nextChar+"'");
                    j++;
                    console.log("AFTER", code.substring(j+1));
                } else if(code[j] === '"') {
                    break;
                } else {
                    codes.push(code.charCodeAt(j));
                }
            }
            if(j >= code.length) interpreter.err("Unending string");
            i = j;

            //turn ascii codes into vbf
            newCode += "#PRINT STRING\n";
            if(lowLevel) {
                newCode += ">"; //go to zero cell
            } else {
                newCode += ">>";
            }

            let curr = 0;
            for(let i=0; i<codes.length; i++) {
                let target = codes[i] % 256;
                let diff = target - curr;
                if(diff > 0) {
                    newCode += "+".repeat(diff);
                } else {
                    newCode += "-".repeat(-diff);
                }
                newCode += ".";
                curr = target;
            }
            if(curr > 0) newCode += "[-]";

            if(lowLevel) {
                newCode += "<"; //go back
            } else {
                newCode += "<<";
            }

            newCode += " #end print\n";
        } else if(lowLevel) { //low level
            if(code[i] === "+") {
                newCode += "+ ";
            } else if(code[i] === "-") {
                newCode += "- ";
            } else if(code[i] === "<") {
                newCode += "<< #<\n";
            } else if(code[i] === ">") {
                newCode += ">>>+(-->>++[-->>++]>>--<<<<++[--[->>+<<]<[->>+<<]<++]>>-<<+)-< #>\n";
            } else if(code[i] === ",") {
                newCode += "[-], #,\n";
            } else if(code[i] === ".") {
                newCode += ". #.\n";
            } else if(code[i] === "_") {
                newCode += "[-]\n";
            } else if(code[i] === "[") {
                newCode += "[\n";
            } else if(code[i] === "]") {
                newCode += "]\n";
            } else if(code[i] === "{") {
                newCode += "{\n";
            } else if(code[i] === "}") {
                newCode += "}\n";
            } else if(code[i] === "(") {
                newCode += "(\n";
            } else if(code[i] === "!" && code[i+1] === "(") {
                newCode += "!(\n";
                i++;
            } else if(code[i] === ")") {
                newCode += ")\n";
            } else if(code[i] === ";") {
                interpreter.err("Cannot do ; on inner level");
            } else if(code[i] === ":") {
                interpreter.err("Cannot do : on inner level");
            }
        } else { //OUTER LEVEL
            if(code[i] === "+") {
                newCode += ">---------(----------)++++++++++{>>>+(-->>++[-->>++]>>--<<<<++[--[->>+<<]<[->>+<<]<++]>>-<<+)-<---------(----------)++++++++++}<+[-<<+]- #outer +\n";
            } else if(code[i] === "-") {
                interpreter.err("Unimplemented - for outer level");
            } else if(code[i] === "<") {
                newCode += "<<+[-<<+]- #outer <\n";
            } else if(code[i] === ">") {
                newCode += ">>+[->>+]->>++(>>->>--<<<<++)--<< #outer >\n";
            } else if(code[i] === ",") {
                newCode += ">[-],>+<(>-<)----------(>[-]<)++++++++++>[->>+(-->>++[-->>++]>>--<<<<++[--[->>+<<]<[->>+<<]<++]>>-<<+)-<[-],>+<(>-<)----------(>[-]<)++++++++++>]+[->[-]>+]-<<+[-<<+]- #outer ,\n";
            } else if(code[i] === ".") {
                newCode += ">[.>>]<+[-<<+]- #outer .\n";
            } else if(code[i] === "_") {
                newCode += ">>+[-<[-]>>>+]-<<+[-<<+]- #outer _\n";
            } else if(code[i] === ":") {
                newCode += ">>+[->>+]-<<+<<+(>>-<<)->!(>[-]<)>[-<<+<<+(>>-<<)->!(>[-]<)]<<+!([-<<+]->>+<<+)->!(>[-]+<)>(<++++++++++++++++++++++++++++++++++++++++++++++++.[-]>)!([->>+]-<{<<}++++++++++++++++++++++++++++++++++++++++++++++++.------------------------------------------------<+[-<++++++++++++++++++++++++++++++++++++++++++++++++.------------------------------------------------<+]->>)<< #outer :\n";
            }
        }
    }

    return newCode;
}