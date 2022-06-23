

class HighlightingLexer { //DOES NOT RETURN ACCURATE TOKENS, returns single character identifiers if non-whitespace invalid token
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

                if(op !== null) {
                    tokens.push(new Token("operator", op, i, i + op.length));
                    i += op.length;
                } else {
                    tokens.push(new Token("identifier", code.substring(i, i + 1), i, i + 1));
                    i += 1;
                }
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
                str += code[i] + (code[i+1] || "");
                i++;
            } else {
                str += code[i];
            }
        }

        return [str, i];
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

let highlightingLexer = new HighlightingLexer();
let highlightingParser = new Parser();
highlightingParser.err = function() {};

function getAllStatements(statements) {
    let allStatements = [];

    for(let i=0; i<statements.length; i++) {
        allStatements.push(statements[i]);
        if(statements[i].type === "if" || statements[i].type === "while") {
            allStatements = allStatements.concat(getAllStatements(statements[i].body));
        }
    }

    return allStatements;
}

function generateHighlightingHtml(code) {
    let tokens = highlightingLexer.lex(code);
    let statements = [];
    let allStatements = [];
    let html = "";

    try {
        statements = highlightingParser.parse(tokens);
        allStatements = getAllStatements(statements);
    } catch(e) {
        //do nothing
    }

    const spanEnd = '</span>';
    const stringSpan = '<span class="string_span">';
    const numberSpan = '<span class="number_span">';
    const keywordSpan = '<span class="keyword_span">';
    const identifierSpan = '<span class="identifier_span">';
    const operatorSpan = '<span class="operator_span">';
    const commentSpan = '<span class="comment_span">';
    const codePtrSpan = '<span class="code_ptr_span">';

    for(let i=0; i<code.length; i++) {
        if(tokens[0].start === i) {
            let token = tokens.shift();

            if(allStatements.find((statement) => statement.firstToken === token && statement.firstToken.start === highlightTokenStart)) {
                html += codePtrSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
                continue;
            }

            if(token.type === "string") {
                html += stringSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            } else if(token.type === "number") {
                html += numberSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            } else if(token.type === "keyword") {
                html += keywordSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            } else if(token.type === "identifier") {
                html += identifierSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            } else if(token.type === "operator") {
                html += operatorSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            } else {
                html += identifierSpan + code.substring(i, token.end) + spanEnd;
                i = token.end - 1;
            }
        } else if(code[i].trim() !== "") {
            html += commentSpan + code[i] + spanEnd;
        } else {
            html += code[i];
        }
    }

    return html;
}
