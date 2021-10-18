function MovePtr(n) {
    if(n >= 0) {
        output(">".repeat(n));
    } else {
        output("<".repeat(-n));
    }
}

function Add(n, offset = 0) {
    MovePtr(offset);
    output("+".repeat(n));
    MovePtr(-offset);
}
function Sub(n, offset = 0) {
    MovePtr(offset);
    output("-".repeat(n));
    MovePtr(-offset);
}
function Set(n, offset = 0) {
    MovePtr(offset);
    output("[-]");
    output("+".repeat(n));
    MovePtr(-offset);
}
function Right(n = 1) {
    output(">".repeat(n));
}
function Left(n = 1) {
    output("<".repeat(n));
}
function Input(offset = 0) {
    MovePtr(offset);
    output(",");
    MovePtr(-offset);
}
function Output(offset = 0) {
    MovePtr(offset);
    output(".");
    MovePtr(-offset);
}

let loopOffsets = [];
function WhileNz(offset = 0) {
    MovePtr(offset);
    output("[");
    MovePtr(-offset);
    loopOffsets.push(offset);
}
function EndWhileNz() {
    if(loopOffsets.length <= 0) throw new Error("Unmatched loops");
    let offset = loopOffsets.pop();
    MovePtr(offset);
    output("]");
    MovePtr(-offset);
}

function Move(off1, off2, setZero = true) {
    if(setZero) {
        Set(0, off2);
    }
    MovePtr(off1);
    WhileNz();
    Sub(1);
    Add(1, off2-off1);
    EndWhileNz();
    MovePtr(-off1);
}

export {MovePtr, Add, Sub, Set, Right, Left, Input, Output, WhileNz, EndWhileNz, Move};