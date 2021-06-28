function getSequenceChanges(code) {
    let changes = [];
    let pointer = 0;

    for(let i=0; i<code.length; i++) {
        if(code[i] === ">") {
            pointer++;
        } else if(code[i] === "<") {
            pointer--;
        } else if(code[i] === "+") {
            let change = changes.find((change) => change[0] === pointer);
            if(change) {
                change[1]++;
                if(change[1] > 255) change[1] = 0;
            } else {
                change = changes.push([pointer, 1]);
            }
        } else if(code[i] === "-") {
            let change = changes.find((change) => change[0] === pointer);
            if(change) {
                change[1]--;
                if(change[1] < 0) change[1] = 255;
            } else {
                change = changes.push([pointer, 255]);
            }
        }
    }
    changes = changes.sort((a, b) => a[0] - b[0]);
    return [changes, pointer];
}
function minifySequence(code) {
    let [changes, targetPointer] = getSequenceChanges(code);

    let newCode = "";
    let pointer = 0;
    for(let i=0; i<changes.length; i++) {
        let ptrDiff = changes[i][0] - pointer;
        if(ptrDiff > 0) {
            newCode += ">".repeat(ptrDiff);
        } else {
            newCode += "<".repeat(-ptrDiff);
        }
        let targetVal = changes[i][1];
        if(targetVal > 128) {
            newCode += "-".repeat(256-targetVal);
        } else {
            newCode += "+".repeat(targetVal);
        }
        pointer += ptrDiff;
    }
    let ptrDiff = targetPointer - pointer;
    if(ptrDiff > 0) {
        newCode += ">".repeat(ptrDiff);
    } else {
        newCode += "<".repeat(-ptrDiff);
    }
    return newCode;
}

function minify(code) {
    //remove comments
    code = code.split("").reduce((prev, char) => ("+-><.,[]".includes(char) ? prev + char : prev), "");
    
    //minify sequences of only +-><
    let newCode = "";
    let sequence = "";
    for(let i=0; i<code.length; i++) {
        if("+-><".includes(code[i])) {
            sequence += code[i];
        } else {
            if(sequence !== "") {
                newCode += minifySequence(sequence);
                sequence = "";
            }
            newCode += code[i];
        }
    }
    if(sequence !== "") newCode += minifySequence(sequence);

    //remove loops directly after other loops
    let newCode2 = "";
    for(let i=0; i<newCode.length; i++) {
        if(newCode[i] === "[" && newCode[i-1] === "]") {
            let inset = 0;
            let j = i;
            for(; j<newCode.length; j++) {
                if(newCode[j] === "[") inset++;
                else if(newCode[j] === "]") inset--;
                if(inset === 0) break;
            }
            i = j;
        } else {
            newCode2 += newCode[i];
        }
    }

    return newCode2;
}