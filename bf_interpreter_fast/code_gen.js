function generateJs(code) {
    code = minify(code);

    //remove initial loops
    while(code.startsWith("[")) {
        let inset = 0;
        for(let i=0; i<code.length; i++) {
            if(code[i] === "[") inset++;
            else if(code[i] === "]") inset--;
            if(inset === 0) {
                code = code.substring(i+1);
                break;
            }
        }
        if(inset !== 0) interpreter.err("Unbalanced [ and ]");
    }

    //replace [-] and [+] with 0 (set zero instruction)
    code = code.replaceAll("[-]", "0").replaceAll("[+]", "0");

    //convert ++++ to +4 in tokens
    let tokens = [];
    for(let i=0; i<code.length; i++) {
        if("+-><".includes(code[i])) {
            let instr = code[i];
            let len = 0;
            for(let j=i; j<code.length; j++) {
                if(code[j] === instr) {
                    len++;
                } else break;
            }
            tokens.push([instr, len]);
            i += len-1;
        } else {
            tokens.push([code[i]]);
        }
    }
    
    //generate code from tokens
    let js = "let m=[0],p=0;\n";

    for(let i=0; i<tokens.length; i++) {
        let instr = tokens[i][0];
        let n = tokens[i][1];
        if(instr === ">") {
            js += `p+=${n};while(p>=m.length)m.push(0);`;
        } else if(instr === "<") {
            js += `p-=${n};`;
        } else if(instr === "+") {
            js += `m[p]+=${n};m[p]%=256;`;
        } else if(instr === "-") {
            js += `m[p]-=${n};m[p]=(m[p]+256)%256;`;
        } else if(instr === ",") {
            js += `m[p]=i();`;
        } else if(instr === ".") {
            js += `o(m[p]);`;
        } else if(instr === "[") {
            js += `while(m[p]){`;
        } else if(instr === "]") {
            js += `}`;
        } else if(instr === "0") {
            js += `m[p]=0;`;
        }
    }

    return js;
}