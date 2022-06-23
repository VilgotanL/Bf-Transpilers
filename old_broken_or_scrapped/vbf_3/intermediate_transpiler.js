//intermediate transpiler
//(goto transpiler)


function transpile_intermediate(code) {
    let lines = code.split("\n");
    let sections = [];
    let currSplit = "";

    for(let i=0; i<lines.length; i++) {
        let line = lines[i].split("#")[0].trim();
        let parts = line.split(" ");
        if(parts[0] === "jeq" || parts[0] === "jneq" || parts[0] === "jmp") {
            currSplit += line;
            sections.push(currSplit);
            currSplit = "";
        } else if(line.startsWith("@") && line.endsWith(":")) {
            sections.push(currSplit);
            currSplit = line+"\n";
        } else {
            currSplit += line+"\n";
        }
    }
    sections.push(currSplit);

    console.log(sections);

    let nSections = sections.length;

    let labels = new Map([]);
    //parse labels
    for(let i=0; i<sections.length; i++) {
        let lines = sections[i].split("\n");
        if(lines[0].startsWith("@") && lines[0].endsWith(":")) {
            let name = lines[0].substring(1, lines[0].length-1);
            console.log(name, i);
            labels.set(name, i);
        }
    }

    let newCode = "+>->+" + ">".repeat(nSections) + "-- >>---<< <+[-<+]- #init sections and memptr\n";
    newCode += "<[> #main loop at exit_flag\n\n";
    
    for(let i=0; i<sections.length; i++) {
        newCode += ">".repeat(i+1) + "!(- #section "+(i+1)+"\n";
        newCode += "++[-->++]-- +++[--->>+++]--- < #go to mem anchor, then memptr-1\n\n#CODE:\n";

        let lines = sections[i].split("\n");
        if(lines[0].startsWith("@") && lines[0].endsWith(":")) {
            lines.shift(); //remove first element
        }
        for(let j=0; j<lines.length; j++) {
            let line = lines[j];
            let parts = line.split(" ");
            if(j === lines.length-1 && (parts[0] === "jeq" || parts[0] === "jneq" || parts[0] === "jmp")) {
                newCode += "#END CODE\n\n";
                if(parts[0] === "jmp") {
                    if(!parts[1].startsWith("@")) interpreter.err("JMP expected @ infront of label");
                    let name = parts[1].substring(1);

                    newCode += "#jmp\n";
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    let n = labels.get(name);
                    if(!n) interpreter.err("Unknown label: '"+name+"'");
                    newCode += ">".repeat(n+1) + "+" + "<".repeat(n+1) + " #set section flag\n";
                    newCode += ") +[-<+]- #section end\n\n";
                } else if(parts[0] === "jeq") {
                    if(!parts[2].startsWith("@")) interpreter.err("JEQ expected @ infront of label");
                    let name = parts[2].substring(1);
                    let num = Math.floor(Number(parts[1]));
                    if(!isFinite(num)) interpreter.err("Invalid number for JEQ");
                    while(num < 0) num += 256;
                    num %= 256;

                    newCode += "#jeq\n";
                    newCode += "-".repeat(num) + "(" + "+".repeat(num) + " #IF EQ\n";
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    let n = labels.get(name);
                    if(!n) interpreter.err("Unknown label: '"+name+"'");
                    newCode += ">".repeat(n+1) + "+" + "<".repeat(n+1) + " #set section flag\n";
                    
                    newCode += "++[-->++]-- +++[--->>+++]--- < #go to mem anchor, then memptr-1\n";
                    newCode += "-".repeat(num) + ")" /*+ "+".repeat(num)*/ + " #IF EQ END\n";
                    
                    newCode += /*"-".repeat(num) +*/ "!(" + "+".repeat(num) + " #IF NOT EQ\n";
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    //IF NOT EQ
                    if(i+1 < nSections) {
                        newCode += ">".repeat(i+2) + "+" + "<".repeat(i+2) + " #set section flag\n";
                        //newCode += ") +[-<+]- #section end\n\n";
                    } else {
                        newCode += "<[-]>" + " #set exit_flag to zero\n";
                        //newCode += ") +[-<+]- #section end\n\n";
                    }
                    
                    newCode += "++[-->++]-- +++[--->>+++]--- < #go to mem anchor, then memptr-1\n";
                    newCode += "-".repeat(num) + ")" + "+".repeat(num) + " #IF NOT EQ END\n";
                    
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    newCode += ") +[-<+]- #section end\n\n";
                } else if(parts[0] === "jneq") {
                    if(!parts[2].startsWith("@")) interpreter.err("JNEQ expected @ infront of label");
                    let name = parts[2].substring(1);
                    let num = Math.floor(Number(parts[1]));
                    if(!isFinite(num)) interpreter.err("Invalid number for JNEQ");
                    while(num < 0) num += 256;
                    num %= 256;

                    newCode += "#jneq\n";
                    newCode += "-".repeat(num) + "!(" + "+".repeat(num) + " #IF NEQ\n";
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    let n = labels.get(name);
                    if(!n) interpreter.err("Unknown label: '"+name+"'");
                    newCode += ">".repeat(n+1) + "+" + "<".repeat(n+1) + " #set section flag\n";
                    
                    newCode += "++[-->++]-- +++[--->>+++]--- < #go to mem anchor, then memptr-1\n";
                    newCode += "-".repeat(num) + ")" /*+ "+".repeat(num)*/ + " #IF NEQ END\n";
                    
                    newCode += /*"-".repeat(num) +*/ "(" + "+".repeat(num) + " #IF NOT NEQ\n";
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    //IF NOT EQ
                    if(i+1 < nSections) {
                        newCode += ">".repeat(i+2) + "+" + "<".repeat(i+2) + " #set section flag\n";
                        //newCode += ") +[-<+]- #section end\n\n";
                    } else {
                        newCode += "<[-]>" + " #set exit_flag to zero\n";
                        //newCode += ") +[-<+]- #section end\n\n";
                    }
                    
                    newCode += "++[-->++]-- +++[--->>+++]--- < #go to mem anchor, then memptr-1\n";
                    newCode += "-".repeat(num) + ")" + "+".repeat(num) + " #IF NOT NEQ END\n";
                    
                    newCode += "<++[--<<++]-- #go to mem anchor\n";
                    newCode += "<+[-<+]- #go to main anchor\n";

                    newCode += ") +[-<+]- #section end\n\n";
                }
            } else if(j === lines.length-1) {
                newCode += "#END CODE\n\n";

                newCode += "#next\n";
                newCode += "<++[--<<++]-- #go to mem anchor\n";
                newCode += "<+[-<+]- #go to main anchor\n";

                let n = i+1;
                if(n < nSections) {
                    newCode += ">".repeat(n+1) + "+" + "<".repeat(n+1) + " #set section flag\n";
                    newCode += ") +[-<+]- #section end\n\n";
                } else {
                    newCode += "<[-]>" + " #set exit_flag to zero\n";
                    newCode += ") +[-<+]- #section end\n\n";
                }
            } else {
                for(let k=0; k<line.length; k++) {
                    if(line[k] === ">") {
                        newCode += ">+++>>---<";
                    } else if(line[k] === "<") {
                        newCode += ">+++<<---<";
                    } else {
                        newCode += line[k];
                    }
                }
                newCode += "\n";
            }
        }
    }
    newCode += "<] #main loop end";
    
    return newCode;
}