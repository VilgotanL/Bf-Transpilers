const statements = ["declaration", "inc", "dec", "set", "add", "sub", "if", "while", "call"];
const varTypes = ["tape", "byte", "int", "unary_int"];


class LValue {
    constructor(varName, index) {
        this.varName = varName;
        this.index = index;
    }
}
class LiteralValue {
    constructor(isNumber, value) { //number or string literal
        this.isNumber = isNumber;
        this.value = value;
    }
}
class RValue {
    constructor(isLiteral, value) { //if isliteral, value is the LiteralValue, otherwise, value is the LValue
        this.isLiteral = isLiteral;
        this.value = value;
    }
}

class Statement {
    constructor(type) {
        this.type = type;
        assert(statements.includes(type), "Internal: unknown statement type at Statement constructor: "+type);
    }
}

class Parser {
    constructor() {

    }

    err(str) {
        err(str);
    }
    assert(bool, str) {
        if(!bool) this.err(err);
    }

    parse(tokens) {
        let i = 0;
        let statements = [];

        while(i < tokens.length && tokens[i].type !== "eof") {
            let [statement, nTokens] = this.nextStatement(tokens.slice(i));
            if(statement) {
                statements.push(statement);
            }
            i += nTokens;
        }

        return statements;
    }

    findBracket(tokens, start, errStr) {
        let inset = 1;
        for(let i=start; i<tokens.length; i++) {
            if(tokens[i].is("operator", "{")) {
                inset++;
            } else if(tokens[i].is("operator", "}")) {
                inset--;
                if(inset === 0) return i;
            }
        }
        this.err(errStr);
    }
    nextStatement(tokens) {
        let nTokens = 0;
        let statement;
        if(tokens[0].type === "keyword") { //declaration or if/while
            if(tokens[0].value === "if" || tokens[0].value === "while") {
                let type = tokens[0].value; //if or while
                this.assert(tokens[1].is("operator", "("), "Expected ( at "+type+" statement");

                let afterCondition = this.findToken(tokens, 2, "operator", ")", "Expected ) at "+type+" statement");
                let conditionTokens = tokens.slice(2, afterCondition);
                let afterBody;
                let bodyTokens = [];
                
                this.assert(tokens[afterCondition+1], "Expected token after condition at "+type+" statement");
                if(tokens[afterCondition+1].is("operator", "{")) {
                    afterBody = this.findBracket(tokens, afterCondition+2, "Expected } at "+type+" statement");
                    bodyTokens = tokens.slice(afterCondition+2, afterBody);
                } else {
                    afterBody = this.findToken(tokens, afterCondition+1, "operator", ";", "Expected ; at "+type+" statement");
                    bodyTokens = tokens.slice(afterCondition+1, afterBody+1);
                }

                //parse body
                let body = this.parse(bodyTokens);

                //parse condition
                let conditionOp = -1;
                for(let i=0; i<conditionTokens.length; i++) {
                    if(conditionTokens[i].is("operator", "==") || conditionTokens[i].is("operator", "!=")) {
                        conditionOp = i;
                        break;
                    }
                }

                let condition;
                let lvalue;
                let rvalue;
                if(conditionOp !== -1) {
                    condition = conditionTokens[conditionOp].value;
                    lvalue = this.parseLValue(conditionTokens.slice(0, conditionOp));
                    rvalue = this.parseRValue(conditionTokens.slice(conditionOp+1, conditionTokens.length));
                } else {
                    condition = "!=";
                    lvalue = this.parseLValue(conditionTokens.slice(0, conditionTokens.length));
                    rvalue = new RValue(true, new LiteralValue(true, 0));
                }

                statement = new Statement(type);
                statement.condition = condition;
                statement.conditionLValue = lvalue;
                statement.conditionRValue = rvalue;
                statement.body = body;

                nTokens = afterBody + 1;
            } else if(varTypes.includes(tokens[0].value)) {
                let type = tokens[0].value;

                this.assert(tokens[1].is("identifier"), "Expected identifier at variable declaration");
                this.assert(tokens[2].is("operator", ";"), "Expected ; after variable declaration");

                let name = tokens[1].value;
                statement = new Statement("declaration");
                statement.varName = name;
                statement.varType = type;

                nTokens = 3;
            } else {
                this.err("Unknown statement starting with keyword: "+tokens[0].value);
            }
        } else if(tokens[0].is("operator", ";")) {
            statement = null;
            nTokens = 1;
        } else {
            let semiColonIndex = this.findToken(tokens, 0, "operator", ";", "Expected ; after non if/while statement");
            nTokens = semiColonIndex + 1;
            tokens = tokens.slice(0, semiColonIndex);
            let lastToken = tokens[tokens.length-1];

            if(lastToken.is("operator", "++")) {
                let lvalue = this.parseLValue(tokens.slice(0, tokens.length-1));
                statement = new Statement("inc");
                statement.lvalue = lvalue;
            } else if(lastToken.is("operator", "--")) {
                let lvalue = this.parseLValue(tokens.slice(0, tokens.length-1));
                statement = new Statement("dec");
                statement.lvalue = lvalue;
            } else if(tokens.find((token) => token.is("operator", "="))) {
                let opIndex = this.findToken(tokens, 0, "operator", "=", "Internal: array.find found operator but not findToken");
                let lvalue = this.parseLValue(tokens.slice(0, opIndex));
                let rvalue = this.parseRValue(tokens.slice(opIndex+1, tokens.length));
                statement = new Statement("set");
                statement.lvalue = lvalue;
                statement.rvalue = rvalue;
            } else if(tokens.find((token) => token.is("operator", "+="))) {
                let opIndex = this.findToken(tokens, 0, "operator", "+=", "Internal: array.find found operator but not findToken");
                let lvalue = this.parseLValue(tokens.slice(0, opIndex));
                let rvalue = this.parseRValue(tokens.slice(opIndex+1, tokens.length));
                statement = new Statement("add");
                statement.lvalue = lvalue;
                statement.rvalue = rvalue;
            } else if(tokens.find((token) => token.is("operator", "-="))) {
                let opIndex = this.findToken(tokens, 0, "operator", "-=", "Internal: array.find found operator but not findToken");
                let lvalue = this.parseLValue(tokens.slice(0, opIndex));
                let rvalue = this.parseRValue(tokens.slice(opIndex+1, tokens.length));
                statement = new Statement("sub");
                statement.lvalue = lvalue;
                statement.rvalue = rvalue;
            } else if(tokens[0].is("identifier") && tokens[1].is("operator", "(") && lastToken.is("operator", ")")) { //function call
                let rvalue = this.parseRValue(tokens.slice(2, tokens.length-1));
                statement = new Statement("call");
                statement.funcName = tokens[0].value;
                statement.rvalue = rvalue;
            } else {
                this.err("Unknown statement");
            }
        }
        if(statement) {
            statement.firstToken = tokens[0];
        }

        return [statement, nTokens];
    }

    findToken(tokens, start, type, value, errStr) {
        for(let i=start; i<tokens.length; i++) {
            if(tokens[i].is(type, value)) {
                return i;
            }
        }
        this.err(errStr);
    }

    parseLValue(tokens) {
        this.assert(tokens[0] && tokens[0].type === "identifier", "LValue must start with identifier");
        if(tokens.length === 1) {
            return new LValue(tokens[0].value);
        } else if(tokens.length === 4) {
            this.assert(tokens[1].is("operator", "["), "LValue must be single identifier or identifer and index");
            this.assert(tokens[3].is("operator", "]"), "LValue must be single identifier or identifer and index");
            this.assert(tokens[2].is("number"), "LValue index must be number");
            this.assert(tokens[2].value === Math.floor(tokens[2].value), "LValue number must be an integer");

            return new LValue(tokens[0].value, tokens[2].value);
        } else if(tokens.length === 5) {
            this.assert(tokens[1].is("operator", "["), "LValue must be single identifier or identifer and index");
            this.assert(tokens[2].is("operator", "-"), "LValue must be single identifier or identifer and index");
            this.assert(tokens[4].is("operator", "]"), "LValue must be single identifier or identifer and index");
            this.assert(tokens[3].is("number"), "LValue index must be number");
            this.assert(tokens[3].value === Math.floor(tokens[3].value), "LValue number must be an integer");

            return new LValue(tokens[0].value, -tokens[3].value);
        } else {
            this.err("Invalid LValue");
        }
    }
    parseRValue(tokens) {
        if(tokens.length === 1 && tokens[0].is("number")) {
            this.assert(tokens[0].value === Math.floor(tokens[0].value), "RValue literal must be an integer");
            return new RValue(true, new LiteralValue(true, tokens[0].value));
        } else if(tokens.length === 2 && tokens[0].is("operator", "-") && tokens[1].is("number")) {
            this.assert(tokens[1].value === Math.floor(tokens[1].value), "RValue literal must be an integer");
            return new RValue(true, new LiteralValue(true, -tokens[1].value));
        } else if(tokens.length === 1 && tokens[0].is("string")) {
            return new RValue(true, new LiteralValue(false, tokens[0].value));
        } else {
            return new RValue(false, this.parseLValue(tokens));
        }
    }
}