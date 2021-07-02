const terminal = document.getElementById("terminal");


function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms));
}
function output(str) {
    terminal.innerText += str;
}
async function input(str) {
    if(str) output(str);
    let input = document.createElement("input");
    input.setAttribute("size", "auto");
    input.spellcheck = false;
    terminal.appendChild(input);
    input.focus();

    return new Promise((res) => {
        function onKeyPress(e) {
            if(e.keyCode === 13 || e.which === 13) {
                e.preventDefault();
                let inp = input.value;
                input.removeEventListener("keypress", onKeyPress);
                terminal.removeEventListener("click", onClick);
                input.remove();
                output(inp+"\n");
                res(inp);
            }
        }
        input.addEventListener("keypress", onKeyPress);
        function onClick() {
            console.log("ONCLICK");
            input.focus();
        }
        terminal.addEventListener("click", onClick);
    });
}

async function run(code) {
    let mem = [0];
    let p = 0;
    let inpBuffer = "";

    let iters = 0;
    for(let i=0; i<code.length; i++) {
        console.log("INSTR", code[i]);
        if(code[i] === "+") {
            mem[p]++;
            if(mem[p] > 255) mem[p] = 0;
        } else if(code[i] === "-") {
            mem[p]--;
            if(mem[p] < 0) mem[p] = 255;
        } else if(code[i] === ">") {
            p++;
            if(p >= mem.length) mem.push(0);
        } else if(code[i] === "<") {
            p--;
            if(p < 0) {
                output("\nError: Pointer out of bounds!");
                break;
            }
        } else if(code[i] === ",") {
            if(inpBuffer.length > 0) {
                mem[p] = inpBuffer.charCodeAt(0) % 256;
                console.log("A", mem[p]);
                inpBuffer = inpBuffer.substring(1);
            } else {
                console.log("BUFFER", inpBuffer);
                inpBuffer = await input(">")+"\n";
                mem[p] = inpBuffer.charCodeAt(0) % 256;
                console.log("B", mem[p]);
                inpBuffer = inpBuffer.substring(1);
            }
        } else if(code[i] === ".") {
            console.log(String.fromCharCode(mem[p]));
            output(String.fromCharCode(mem[p]));
        } else if(code[i] === "[") {
            if(mem[p] === 0) {
                let inset = 0;
                for(let j=i; j<code.length; j++) {
                    if(code[j] === "[") inset++;
                    if(code[j] === "]") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) {
                    output("Error: Expected ]");
                    break;
                }
            }
        } else if(code[i] === "]") {
            if(mem[p] !== 0) {
                let inset = 0;
                for(let j=i; j>=0; j--) {
                    if(code[j] === "]") inset++;
                    if(code[j] === "[") inset--;
                    if(inset === 0) {
                        i = j;
                        break;
                    }
                }
                if(inset !== 0) {
                    output("Error: Expected [");
                    break;
                }
            }
        }
        iters++;
        if(iters > 1000) {
            iters = 0;
            await sleep(0);
        }
        console.log("AFTER");
    }
    console.log("DONE");
}

async function program() {
    terminal.innerHTML = "";
    while(true) {
        let code = await input("\nBF>");
        await run(code);
    }
}
program();