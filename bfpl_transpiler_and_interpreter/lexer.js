const tokenTypes = ["keyword", "identifier", "operator", "string", "number", "eof"];
const operators = [";", "{", "}", "(", ")", "[", "]", "=", ",", "-", "==", "!=", "++", "--", "+=", "-="];
const keywords = ["if", "while", "tape", "byte", "int", "unary_int"];
const alphabetic = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ_";
const numeric = "0123456789";
// // and /* */ are comments

class Token {
    constructor(type, value, start, end, line) {
        assert(tokenTypes.includes(type), "Internal: Unknown token type at Token constructor");
        this.type = type;
        this.value = value;
        this.start = start; //start from beginning of program
        this.end = end;
    }

    is(type, value) {
        if(value !== undefined) {
            return this.type === type && this.value === value;
        } else {
            return this.type === type;
        }
    }
}

class Lexer {
    constructor() {

    }

    lex(code) {
        let tokens = [];
        let i = 0;

        while(i < code.length) {
            if(code[i].trim() === "") { //whitespace
                i++;
                continue;
            }

            if(code.substring(i).startsWith("//")) { //single line comment
                i += this.afterNextLine(code.substring(i));
                continue;
            } else if(code.substring(i).startsWith("/*")) { //multi-line comment
                i += this.afterMultilineComment(code.substring(i));
                continue;
            }

            if(alphabetic.includes(code[i])) { //identifier or keyword
                let [str, parseLength] = this.parseIdentifier(code.substring(i), this.getLine(code, i));

                if(keywords.includes(str)) {
                    tokens.push(new Token("keyword", str, i, i + parseLength));
                } else {
                    tokens.push(new Token("identifier", str, i, i + parseLength));
                }
                i += parseLength;
            } else if(numeric.includes(code[i])) { //number
                let [num, parseLength] = this.parseNumber(code.substring(i), this.getLine(code, i));

                tokens.push(new Token("number", num, i, i + parseLength));
                i += parseLength;
            } else if(code[i] === '"') { //string
                let [str, parseLength] = this.parseString(code.substring(i), this.getLine(code, i));
                
                tokens.push(new Token("string", str, i, i + parseLength));
                i += parseLength;
            } else { //probably an operator, or an error
                let sortedOps = operators.sort((a, b) => b.length - a.length); //sort the operators by longest first
                let op = null;

                for(let j=0; j<sortedOps.length; j++) {
                    if(code.substring(i).startsWith(sortedOps[j])) {
                        op = sortedOps[j];
                        break;
                    }
                }
                assert(op !== null, "Unknown token at line " + this.getLine(code, i));

                tokens.push(new Token("operator", op, i, i + op.length));
                i += op.length;
            }

        }
        tokens.push(new Token("eof", null, code.length, code.length));
        return tokens;
    }

    afterNextLine(code) {
        for(let i=0; i<code.length; i++) {
            if(code[i] === "\n") return i+1;
        }
        return code.length;
    }

    afterMultilineComment(code) {
        for(let i=0; i<code.length; i++) {
            if(code.substring(i, i+2) === "*/") return i+2;
        }
        return code.length;
    }

    getLine(code, i) {
        return code.substring(0, i).split("\n").length;
    }

    parseString(code, line) { //strings can be multiline
        assert(code.startsWith('"'), "Internal: parseString got code without starting \"");

        let str = "";
        let i = 1;
        let done = false;

        for(; i<code.length; i++) {
            if(code[i] === '"') {
                done = true;
                i++;
                break;
            } else if(code[i] === '\\') {
                assert(i != code.length-1, "Unending string at line " + line);
                str += this.fromEscapeChar(code[i+1]);
                i++;
            } else {
                str += code[i];
            }
        }

        assert(done, "Unending string at line " + line);

        return [str, i];
    }

    fromEscapeChar(char) {
        if(char === "\\") return "\\";
        if(char === "n") return "\n";
        if(char === "\"") return "\"";
        if(char === "'") return "'";
        if(char === "t") return "\t";
        if(char === "0") return "\0";
        err("Unknown backslash escape combination: '\\" + char + "'");
    }

    parseIdentifier(code, line) {
        assert(alphabetic.includes(code[0]), "Internal: parseIdentifier got code starting with non-alphabetic character");

        let str = code[0];
        let i = 1;

        for(; i < code.length; i++) {
            if(alphabetic.includes(code[i]) || numeric.includes(code[i])) {
                str += code[i];
            } else {
                break;
            }
        }

        return [str, i];
    }

    parseNumber(code, line) { //not negative signs, .14 and 14. are'nt allowed
        assert(numeric.includes(code[0]), "Internal: parseNumber got code starting with non-numeric character");
        
        let str = code[0];
        let decimalPoint = false;
        let i = 1;

        for(; i < code.length; i++) {
            if(numeric.includes(code[i])) {
                str += code[i];
            } else if(code[i] === "." && numeric.includes(code[i+1]) && !decimalPoint) { // .X
                str += ".";
                decimalPoint = true; //prevents multiple . in number literals
            } else {
                break;
            }
        }

        let n = parseFloat(str);
        assert(isFinite(n), "Internal: parseFloat returned NaN");

        return [n, i];
    }
}