function createInterpreter(options) {
    const interpreter = {};


    const mainDiv = document.createElement("div");
    mainDiv.className = "main_div";
    
    const titleBar = document.createElement("div");
    titleBar.className = "title_bar";
    mainDiv.appendChild(titleBar);
    
    const titleH1 = document.createElement("h1");
    titleH1.innerText = options.title;
    titleBar.appendChild(titleH1);

    for(let i=0; i<options.titlebar.length; i++) {
        let el = options.titlebar[i];

        if(el.p) {
            const p = document.createElement("p");
            p.innerText = el.p;
            titleBar.appendChild(p);
        } else {
            const a = document.createElement("a");
            a.innerText = el.a;
            a.href = el.href;
            titleBar.appendChild(a);
        }
    }

    const optionsDiv = document.createElement("div");
    optionsDiv.className = "options";
    mainDiv.appendChild(optionsDiv);

    const optionInputs = [];
    for(let i=0; i<options.options.length; i++) {
        let option = options.options[i];
        let keys = Object.keys(option);
        let name;
        let type;
        
        for(let j=0; j<keys.length; j++) {
            if(keys[j] !== "text" && keys[j] !== "value") {
                name = keys[j];
                type = option[keys[j]];
            }
        }

        const optionP = document.createElement("p");
        optionP.innerText = option.text;
        const optionInput = document.createElement("input");
        optionInput.type = type;
        if(type === "checkbox") {
            optionInput.checked = option.value;
        } else if(type === "text") {
            optionInput.value = option.value;
            optionInput.spellcheck = false;
        }

        optionsDiv.append(optionP, optionInput);
        optionInputs.push([name, optionInput]);
    }

    const codeWrapper = document.createElement("div");
    codeWrapper.className = "code_wrapper";
    mainDiv.appendChild(codeWrapper);

    const codeSyntaxPre = document.createElement("pre");
    codeSyntaxPre.classList = "code_syntax";
    codeWrapper.appendChild(codeSyntaxPre);
    
    const codeEl = document.createElement("textarea");
    codeEl.className = "code";
    codeEl.spellcheck = false;
    codeEl.value = options.code;
    codeWrapper.appendChild(codeEl);

    //buttons
    const buttonsDiv = document.createElement("div");
    buttonsDiv.className = "buttons";
    mainDiv.appendChild(buttonsDiv);
    
    const buttons = [];
    for(let i=0; i<options.buttons.length; i++) {
        let button = options.buttons[i];
        let name = Object.keys(button)[0];
        let text = button[name];

        const btn = document.createElement("button");
        btn.innerText = text;
        buttonsDiv.appendChild(btn);
        buttons.push([name, btn]);
    }

    const outputEl = document.createElement("pre");
    outputEl.className = "output";
    outputEl.spellcheck = false;
    outputEl.innerText = options.output;
    mainDiv.appendChild(outputEl);

    const theme = options.theme === "dark" ? "dark_theme" : "light_theme";
    document.body.classList.add(theme);
    document.body.appendChild(mainDiv);

    function setButtonsDisabled(bool) {
        for(let i=0; i<buttons.length; i++) {
            buttons[i][1].disabled = bool;
        }
    }

    interpreter.onClick = function(btnName, callback) {
        let btn = buttons.find((el) => el[0] === btnName)[1];
        if(!btn) throw new Error("cannot find button with name '"+btnName+"'");

        btn.addEventListener("click", async function() {
            setButtonsDisabled(true);

            outputEl.innerHTML = "";

            let returnVal = callback();
            if(returnVal instanceof Promise) {
                returnVal = await returnVal;
            }

            setButtonsDisabled(false);
        });
    }

    interpreter.option = function(name) {
        let option = optionInputs.find((data) => data[0] === name);
        if(!option) throw new Error("cannot find option with name '"+name+"'");
        let inputEl = option[1];

        if(inputEl.type === "checkbox") {
            return inputEl.checked;
        } else if(inputEl.type === "text") {
            return stringEscape(inputEl.value);
        }
    }
    function stringEscape(str) {
        let escaped = "";
        for(let i=0; i<str.length; i++) {
            if(str[i] === "\\") {
                let c = str[i+1];
                if(c === "\\") escaped += "\\";
                else if(c === "n") escaped += "\n";
                else if(c === "t") escaped += "\t";
                else if(c === "\"") escaped += "\"";
                else if(c === "'") escaped += "'";
                else if(c === "0") escaped += "\0";
                else escaped += c;
                i++;
            } else escaped += str[i];
        }
        return escaped;
    }

    let codeValue = options.code;
    Object.defineProperty(interpreter, "code", {
        get: function() {
            return codeValue;
        },
        set: function(val) {
            codeValue = val.toString();
            codeEl.value = codeValue;
            updateEditor();
        },
    });

    let highlights = [];
    let updateEditor = initEditor(codeSyntaxPre, codeEl, codeWrapper, generateHighlightingHtml);
    codeEl.addEventListener("input", function() {
        codeValue = codeEl.value;
    });
    function generateHighlightingHtml(code) {
        let html = '<span>';
        let currChar = 0;
        let currStyle = "";
        let prevStyle = "";

        function append(code) {
            for(let i=0; i<code.length; i++) {
                let highlight = highlights.find((h) => currChar >= h[0] && currChar < h[1]);
                let style;
                if(highlight) {
                    style = currStyle + highlight[2];
                } else {
                    style = currStyle;
                }
                if(style !== prevStyle) {
                    html += '</span><span style="' + style + '">';
                }
                html += escapeHtml(code[i]);
                currChar++;
                prevStyle = style;
            }
        }
        function style(css) {
            if(css) {
                currStyle = css;
            } else {
                currStyle = "";
            }
        }

        options.highlight(code, append, style);

        html += '</span>';
        return html;
    }

    interpreter.highlight = function(start, end, css) {
        highlights.push([start, end, css]);
        updateEditor();
    }
    interpreter.clearHighlights = function() {
        highlights = [];
        updateEditor();
    }

    interpreter.output = function(str) {
        outputEl.innerHTML += escapeHtml(""+str);
    }
    interpreter.input = function(str) {
        return prompt(str || "Input:") || "";
    }
    interpreter.err = function(str) {
        outputEl.innerHTML += '<span class="error_span">\n' + escapeHtml(str) + '</span>';
        setButtonsDisabled(false);
        throw new Error(str);
    }

    return interpreter;
}

function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function escapeHtml(str) {
    return str.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;").replaceAll("'", "&#039;");
}

function initEditor(syntaxEl, codeEl, wrapper, generateHighlightingHtml) {
    function updateEditor() {
        syntaxEl.innerHTML = generateHighlightingHtml(codeEl.value)+"\n\n\n\n"; //the newlines fix a weird scrolling bug, 4 to be safe, 2 probably only needed
        syntaxEl.scrollTop = codeEl.scrollTop;
        syntaxEl.scrollLeft = codeEl.scrollLeft;
    
        codeEl.style.width = wrapper.clientWidth+"px";
        codeEl.style.height = wrapper.clientHeight+"px";
        syntaxEl.style.height = wrapper.clientHeight+"px";
        syntaxEl.style.width = wrapper.clientWidth+"px";
    }

    window.addEventListener("load", function() {
        codeEl.addEventListener("scroll", updateEditor);
        //codeEl.addEventListener("mousemove", updateEditor); //for resizing
        codeEl.addEventListener("input", updateEditor);
        window.addEventListener("resize", updateEditor);
        updateEditor();
    });

    function insertText(text) {
        let val = code.value;
        let newCPos = codeEl.selectionStart + text.length;
        code.value = val.substring(0, codeEl.selectionStart) + text + val.substring(codeEl.selectionEnd);
        codeEl.selectionStart = newCPos;
        codeEl.selectionEnd = newCPos;

        updateEditor();
    }

    codeEl.addEventListener("keydown", function(e) {
        if(e.keyCode === 9 || e.which === 9) {
            e.preventDefault();

            insertText("\t");
        }
    });

    return updateEditor;
}
