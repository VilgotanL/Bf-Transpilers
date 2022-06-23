const debugP = document.getElementById("debug_p");
const slowSleepTime = 200;

class ByteVar { //byte
    constructor(name) {
        this.name = name;
        this.value = 0;
    }
    err(str) {
        err(str + " (for byte '"+this.name+"')");
    }
    assert(bool, str) {
        if(!bool) this.err(str);
    }

    inc(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.value += 1;
        if(this.value > 255) this.value = 0;
    }
    dec(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.value -= 1;
        if(this.value < 0) this.value = 255;
    }
    set(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        if(rvalue.isLiteral) {
            this.assert(rvalue.value.isNumber, "Assignment statement requires number literal");
            let literalValue = rvalue.value.value;
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot assign to literal value not inbetween 0-255");
            this.value = literalValue;
        } else {
            this.err("Assigning to non-literal is currently not supported");
        }
    }
    add(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        if(rvalue.isLiteral) {
            this.assert(rvalue.value.isNumber, "Plus-equals statement requires number literal");
            let literalValue = rvalue.value.value;
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot plus-equals literal value not inbetween 0-255");
            this.value += literalValue;
            this.value %= 256;
        } else {
            this.err("Plus-equals non-literal is currently not supported");
        }
    }
    sub(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        if(rvalue.isLiteral) {
            this.assert(rvalue.value.isNumber, "Minus-equals statement requires number literal");
            let literalValue = rvalue.value.value;
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot minus-equals literal value not inbetween 0-255");
            this.value -= literalValue;
            if(this.value < 0) this.value += 256;
        } else {
            this.err("Minus-equals non-literal is currently not supported");
        }
    }
    out(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        output(String.fromCharCode(this.value));
    }
    reset() {
        this.value = 0;
    }
    if(index, condition, literalValue) {
        this.assert(index === undefined, "Cannot index non-tape");
        if(condition === "==") {
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot compare byte to literal value not inbetween 0-255");
            return this.value === literalValue;
        } else if(condition === "!=") {
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot compare byte to literal value not inbetween 0-255");
            return this.value !== literalValue;
        } else this.err("Internal: unknown condition: "+condition);
    }
}

class UnaryIntVar { //unary_int
    constructor(name) {
        this.name = name;
        this.value = 0;
    }
    err(str) {
        err(str + " (for unary_int '"+this.name+"')");
    }
    assert(bool, str) {
        if(!bool) this.err(str);
    }

    inc(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.value += 1;
    }
    dec(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.assert(this.value > 0, "Cannot decrement unary_int when already zero");
        this.value -= 1;
    }
    set(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        if(rvalue.isLiteral) {
            this.assert(rvalue.value.isNumber, "Assignment statement requires number literal");
            let literalValue = rvalue.value.value;
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot assign to literal value not inbetween 0-255");
            this.value = literalValue;
        } else {
            this.err("Cannot assign non-literal to unary_int");
        }
    }
    add(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.err("Plus-equals is not allowed for unary_int");
    }
    sub(index, rvalue) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.err("Minus-equals is not allowed for unary_int");
    }
    out(index) {
        this.assert(index === undefined, "Cannot index non-tape");
        this.err("Cannot out() unary_int");
    }
    reset() {
        this.value = 0;
    }
    if(index, condition, literalValue) { //TODO: allow == 0 too
        this.assert(index === undefined, "Cannot index non-tape");
        if(condition === "==") {
            this.err("The only allowed comparison for unary_int is != 0");
        } else if(condition === "!=") {
            this.assert(literalValue === 0, "The only allowed comparison for unary_int is != 0");
            return this.value !== 0;
        } else this.err("Internal: unknown condition: "+condition);
    }
}

class TapeVar { //tape
    constructor(name) {
        this.name = name;
        this.mem = [0];
        this.p = 0;
    }
    err(str) {
        err(str + " (for tape '"+this.name+"')");
    }
    assert(bool, str) {
        if(!bool) this.err(str);
    }

    allocForIndex(i) {
        while(i >= this.mem.length) this.mem.push(0);
    }
    getIndex(i) {
        this.assert(i >= 0, "Cannot index tape at negative cell indexes");
        this.allocForIndex(i);
        return this.mem[i];
    }
    setIndex(i, val) {
        this.assert(i >= 0, "Cannot index tape at negative cell indexes");
        this.allocForIndex(i);
        this.assert(val >= 0 && val < 256, "Internal: TapeVar.setIndex got val not between 0-255");
        this.mem[i] = val;
    }

    inc(index) {
        if(index === undefined) {
            this.p++;
            if(this.p >= this.mem.length) this.mem.push(0); //actually not needed but ill keep it anyway
        } else {
            let i = this.p + index;
            let n = this.getIndex(i);
            n++;
            if(n > 255) n = 0;
            this.setIndex(i, n);
        }
    }
    dec(index) {
        if(index === undefined) {
            this.p--;
            this.assert(this.p >= 0, "Pointer out of bounds");
        } else {
            let i = this.p + index;
            let n = this.getIndex(i);
            n--;
            if(n < 0) n = 255;
            this.setIndex(i, n);
        }
    }
    set(index, rvalue) {
        this.err("unimplemented =");
    }
    add(index, rvalue) {
        this.err("unimplemented +=");
    }
    sub(index, rvalue) {
        this.err("unimplemented -=");
    }
    out(index) {
        if(index === undefined) {
            this.err("Cannot out() tape pointer, index required");
        } else {
            let i = this.p + index;
            output(String.fromCharCode(this.getIndex(i)));
        }
    }

    reset() {
        this.mem = [0];
        this.p = 0;
    }
    if(index, condition, literalValue) {
        this.assert(index !== undefined, "Cannot compare tape pointer, index required");
        if(condition === "==") {
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot compare tape cell to literal value not inbetween 0-255");
            return this.getIndex(this.p + index) === literalValue;
        } else if(condition === "!=") {
            this.assert(literalValue >= 0 && literalValue < 256, "Cannot compare tape cell to literal value not inbetween 0-255");
            return this.getIndex(this.p + index) !== literalValue;
        } else this.err("Internal: unknown condition: "+condition);
    }
}

function parseDeclarations(vars, statements) {
    for(let i=0; i<statements.length; i++) {
        let s = statements[i];
        if(s.type === "declaration") {
            let varInstance;
            if(s.varType === "byte") {
                varInstance = new ByteVar(s.varName);
            } else if(s.varType === "tape") {
                varInstance = new TapeVar(s.varName);
            } else if(s.varType === "unary_int") {
                varInstance = new UnaryIntVar(s.varName);
            } else err("unimplemented var type");
            vars.set(s.varName, varInstance);
        } else if(s.type === "while" || s.type === "if") {
            parseDeclarations(vars, s.body);
        }
    }
}

async function run(statements) {
    console.log(statements);

    let vars = new Map([]);

    //parse declarations
    parseDeclarations(vars, statements);

    function getVar(name) {
        let varInstance = vars.get(name);
        assert(varInstance, "Unknown variable: "+name);
        return varInstance;
    }

    async function runStatement(statement) {
        if(slow) {
            highlightTokenStart = statement.firstToken.start;
            updateEditor();
        }

        if(statement.type === "declaration") {
            //reset variable
            let varInstance = getVar(statement.varName);
            varInstance.reset();
        } else if(statement.type === "inc") {
            let lvalue = statement.lvalue;
            let varInstance = getVar(lvalue.varName);
            varInstance.inc(lvalue.index);
        } else if(statement.type === "dec") {
            let lvalue = statement.lvalue;
            let varInstance = getVar(lvalue.varName);
            varInstance.dec(lvalue.index);
        } else if(statement.type === "set") {
            let lvalue = statement.lvalue;
            let rvalue = statement.rvalue;
            let varInstance = getVar(lvalue.varName);
            console.log(statement, varInstance);
            varInstance.set(lvalue.index, rvalue);
        } else if(statement.type === "add") {
            let lvalue = statement.lvalue;
            let rvalue = statement.rvalue;
            let varInstance = getVar(lvalue.varName);
            console.log(statement, varInstance);
            varInstance.add(lvalue.index, rvalue);
        } else if(statement.type === "sub") {
            let lvalue = statement.lvalue;
            let rvalue = statement.rvalue;
            let varInstance = getVar(lvalue.varName);
            console.log(statement, varInstance);
            varInstance.sub(lvalue.index, rvalue);
        } else if(statement.type === "call") {
            let name = statement.funcName;
            let rvalue = statement.rvalue;

            if(name === "out") {
                if(rvalue.isLiteral) {
                    assert(rvalue.value.isNumber, "out() expected non-string");
                    output(String.fromCharCode(rvalue.value.value));
                } else {
                    let lvalue = rvalue.value;
                    let varInstance = getVar(lvalue.varName);
                    varInstance.out(lvalue.index);
                }
            } else err("unimplemented function: "+name);
            
        } else if(statement.type === "if") {
            let condition = statement.condition;
            let condLValue = statement.conditionLValue;
            let condRValue = statement.conditionRValue;
            let body = statement.body;

            assert(condRValue.isLiteral, "if statements only support literal values for RValue");
            assert(condRValue.value.isNumber, "if statements only support literal numbers for RValue");
            let literalValue = condRValue.value.value;

            let varInstance = getVar(condLValue.varName);
            let result = varInstance.if(condLValue.index, condition, literalValue);

            if(result) {
                let statements = body;
                for(let i=0; i<statements.length; i++) {
                    await runStatement(statements[i]);
                    if(slow) await sleep(slowSleepTime);
                }
            }

        } else if(statement.type === "while") {
            let condition = statement.condition;
            let condLValue = statement.conditionLValue;
            let condRValue = statement.conditionRValue;
            let body = statement.body;

            assert(condRValue.isLiteral, "if statements only support literal values for RValue");
            assert(condRValue.value.isNumber, "if statements only support literal numbers for RValue");
            let literalValue = condRValue.value.value;

            let varInstance = getVar(condLValue.varName);
            let result = varInstance.if(condLValue.index, condition, literalValue);

            while(result) {
                let statements = body;
                for(let i=0; i<statements.length; i++) {
                    await runStatement(statements[i]);
                    if(slow) await sleep(slowSleepTime);
                }

                result = varInstance.if(condLValue.index, condition, literalValue);
            }

        } else err("Internal: unknown statement type: "+statement.type);

        //debugP.innerText = getVar("a").p + "; " + getVar("a").mem.join(" "); //for debugging
    }

    for(let i=0; i<statements.length; i++) {
        await runStatement(statements[i]);
        if(slow) await sleep(slowSleepTime);
    }
    highlightTokenStart = -1;
    updateEditor();
}


function bf2bfpl(code) {
    let newCode = "tape x;\n";

    for(let i=0; i<code.length; i++) {
        if(code[i] === "+") {
            newCode += "x[0]++;\n";
        } else if(code[i] === "-") {
            newCode += "x[0]--;\n";
        } else if(code[i] === ">") {
            newCode += "x++;\n";
        } else if(code[i] === "<") {
            newCode += "x--;\n";
        } else if(code[i] === ",") {
            newCode += "in(x[0]);\n";
        } else if(code[i] === ".") {
            newCode += "out(x[0]);\n";
        } else if(code[i] === "[") {
            newCode += "while(x[0]) {\n";
        } else if(code[i] === "]") {
            newCode += "}\n";
        }
    }
    return newCode;
}