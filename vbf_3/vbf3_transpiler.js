const wordInstrs = ["jz", "jnz", "jeq", "jneq", "jmp", "int_init", "int_inc", "int_dec", "int_setz", "int_out", "int_in", "int_jz", "int_jnz", "print"];

function transpile_vbf3_to_intermediate(code) {
    let lines = code.split("\n");
    
    for(let i=0; i<lines.length; i++) {
        lines[i] = lines[i].split("#")[0].trim();
    }

    console.log(lines.join("\n"));

    //parse labels
    let labels = new Map([]);
    for(let i=0; i<lines.length; i++) {
        if(lines[i].startsWith("@") && lines[i].endsWith(":")) {
            let name = lines[i].substring(1, lines[i].length-1);
            if(!name) interpreter.err("Invalid label at line "+(i+1));
            if(labels.has(name)) interpreter.err("Duplicate label at line "+(i+1));
            labels.set(lines[i].substring(1, lines[i].length-1), i);
        }
    }

    console.log(labels);

    let newCode = "";

    for(let i=0; i<lines.length; i++) {
        let line = lines[i];
        let parts = line.split(" ");
        
        if(wordInstrs.includes(parts[0])) { //word/line instruction
            let instr = parts[0];
            let args = parts.slice(1);
            
            if(instr === "jz") {
                if(args.length < 1) interpreter.err("jz expected label at line "+(i+1));
                if(!args[0].startsWith("@")) interpreter.err("jz expected label at line "+(i+1));
                let name = args[0].substring(1);
                if(!labels.has(name)) interpreter.err("Unknown label: '@"+name+"' at line "+(i+1));
                newCode += "jeq 0 @"+name+"\n";
            }
        } else if(line.startsWith("@") && line.endsWith(":")) {
            newCode += line+"\n";
        }
    }

    return newCode;
}