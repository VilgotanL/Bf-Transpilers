function transpile(code) { //vbf to bf
    let bf = "";

    for(let i=0; i<code.length; i++) {
        if(code[i].trim() === "") continue; //whitespace
        if(code[i] === "#") { //comment
            while(code[i] !== "\n" && i < code.length) i++;
            i--;
            continue;
        }

        if("+-,.[]".includes(code[i])) {
            bf += code[i];
        } else if(code[i] === ">") {
            bf += ">>";
        } else if(code[i] === "<") {
            bf += "<<";
        } else if(code[i] === "(") {
            if(code[i-1] === "!") { //if not 0
                bf += "[->+>>+<<<]>[-<+>]>>[[-]<<<";
            } else { //if 0
                bf += "[->+>>+<<<]>>>[-<<<+>>>]+<<[[-]>>-<<]>>[-<<<";
            }
        } else if(code[i] === ")") { //endif, same for ( and !(
            bf += ">>>]<<<";
        } else if(code[i] === "{") { //while zero
            bf += "[->+>>+<<<]>>>[-<<<+>>>]+<<[[-]>>-<<]>>[-<<<";
        } else if(code[i] === "}") { //endwhile
            bf += "[->+>>+<<<]>>>[-<<<+>>>]+<<[[-]>>-<<]>>]<<<";
        }
    }

    return bf;
}