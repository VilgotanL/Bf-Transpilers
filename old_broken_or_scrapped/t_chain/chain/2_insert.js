import {MovePtr, Add, Sub, Set, Right, Left, Input, Output, WhileNz, EndWhileNz, Move} from "./1_basic.js";


function MovePtr2(n, allocMem = true) {
    if(allocMem) {
        if(n >= 0) Right2(n);
        else Left2(-n);
    } else {
        if(n >= 0) Right(n*2);
        else Left(-n*2);
    }
}
function Add2(n, offset = 0) {
    MovePtr2(offset);
    Add(n);
    MovePtr2(-offset);
}
function Sub2(n, offset = 0) {
    MovePtr2(offset);
    Sub(n);
    MovePtr2(-offset);
}
function Set2(n, offset = 0) {
    MovePtr2(offset);
    Set(n);
    MovePtr2(-offset);
}
function Right2(n = 1) {
    for(let i=0; i<n; i++) {
        Right(1);
        Set(1);
        Right(1);
    }
}
function Left2(n = 1) {
    Left(n*2);
}
function Move2(off1, off2, setZero = true) { //subject to optimization (unneccesary mem allocation)
    if(setZero) {
        Set2(0, off2);
    }
    MovePtr2(off1);
    WhileNz();
    Sub2(1);
    Add2(1, off2-off1);
    EndWhileNz();
    MovePtr2(-off1);
}
function Copy2(off1, off2, setZero = true) {
    Set2(0, off2);
    MovePtr2(off1);

    Right(1); Set(0); Right(2); Set(0); Left(3);
    WhileNz();
        Sub(1); Right(1); Add(1); Right(2); Add(1); Left(3);
    EndWhileNz(); //now 0 x _ x
    Right(3);
    Move(0, -3, false);
    Add(1);
    Left(2); //now x x _ 1 (ptr at 2nd)
    WhileNz();
        Sub(1); Left(1); MovePtr((off2-off1)*2); Add(1); MovePtr((off1-off2)*2); Right(1);
    EndWhileNz();
    Add(1);
    Left();

    MovePtr2(-off1);
}
function Input2(offset = 0) {
    Input(offset*2);
}
function Output2(offset = 0) {
    Output(offset*2);
}
function WhileNz2(offset = 0) {
    WhileNz(offset*2);
}
function EndWhileNz2(offset = 0) {
    EndWhileNz(offset*2);
}

function PrintChar(n) {
    Set(n, 1);
    Output(1);
    Set(1, 1);
}
function Print(str) {
    for(let i=0; i<str.length; i++) {
        PrintChar(str.charCodeAt(i));
    }
}

function Insert(n = 1, offset = 0) {
    MovePtr2(offset);

    Right(); Set(0); Right(2);
    WhileNz(); Right(2); EndWhileNz();
    for(let i=0; i<n; i++) Add(1, i*2);

    WhileNz();
        Left();
            Move(0, n*2, false);
        Left();
    EndWhileNz();
    Add(1);
    Left();

    MovePtr2(-offset);
}

function Remove(n = 1, offset = 0) {
    MovePtr2(offset);

    Right(); Set(0);
    for(let i=0; i<n; i++) {
        Right(); Set(0); Right(); Set(0);
    }
    Add(1);
    WhileNz();
        Right();
        Move(0, -n*2, false);
        Right();
    EndWhileNz();
    Left(2);
    Sub(1);
    Left(2);
    WhileNz(); Left(2); EndWhileNz();
    Add(1); Left();
    for(let i=0; i<n-1; i++) {
        Left(); Add(1); Left();
    }
    
    MovePtr2(-offset);
}

let ifOffsets = [];
function IfNot(n, offset = 0) { //not equals
    if(n === undefined) throw new Error("IfNot(n) needs n");
    ifOffsets.push(offset);
    MovePtr2(offset, false);

    //before
    Right(); Set(0); Right(2); Set(0); Left(3);
    WhileNz();
        Sub(1); Right(); Add(1); Right(2); Add(1); Left(3);
    EndWhileNz();
    Right(3);

    Move(0, -3, false);
    Add(1); Left(2);

    Sub(n); //R

    WhileNz();
        Set(0); Add(1); Left();

    MovePtr2(-offset, false);
}
function If(n, offset = 0) { //equals
    if(n === undefined) throw new Error("If(n) needs n");
    ifOffsets.push(offset);
    MovePtr2(offset, false);

    //before
    Right(); Set(0); Right(2); Set(0); Left(3);
    WhileNz();
        Sub(1); Right(); Add(1); Right(2); Add(1); Left(3);
    EndWhileNz();

    Right(1);
    Move(0, -1, false);
    Add(1); Right(2);

    Sub(n); //R

    WhileNz();
        Left(2); Sub(1); Right(2); Set(0);
    EndWhileNz();
    Add(1); Left(2);
    
    WhileNz();
        Left();

    MovePtr2(-offset, false);
}
function EndIf() {
    if(ifOffsets.length <= 0) throw new Error("Unbalanced ifs");
    let offset = ifOffsets.pop();
    MovePtr2(offset, false);

    //after
        Right(); Set(0); EndWhileNz();
        Add(1); Left();

    MovePtr2(-offset, false);
}


let whileOffsets = [];
function While(n, offset = 0) {
    if(n === undefined) throw new Error("While(n) needs n");
    whileOffsets.push(["while", n, offset]);
    MovePtr2(offset, false);

    _whileCheck(n);
    Right(); WhileNz(); Left();

    MovePtr2(-offset, false);
}

function WhileNot(n, offset = 0) {
    if(n === undefined) throw new Error("WhileNot(n) needs n");
    whileOffsets.push(["whilenot", n, offset]);
    MovePtr2(offset, false);

    Sub(n); WhileNz(); Add(n);

    MovePtr2(-offset, false);
}

function EndWhile() {
    if(whileOffsets.length <= 0) throw new Error("Unbalanced whiles");
    let [whileType, n, offset] = whileOffsets.pop();

    if(whileType === "whilenot") { //whilenot
        MovePtr2(offset, false);

        Sub(n); EndWhileNz(); Add(n);

        MovePtr2(-offset, false);
    } else { //while
        MovePtr2(offset, false);
        
        _whileCheck(n);
        Right(); EndWhileNz(); Add(1); Left();

        MovePtr2(-offset, false);
    }
}

function _whileCheck(n) { //>[-]>>[-]<<<[->+>>+<<<]>[-<+>]+>> R- [[-]<<->>]+<<<
    Right(); Set(0); Right(2); Set(0); Left(3);
    WhileNz();
        Sub(1); Right(); Add(1); Right(2); Add(1); Left(3);
    EndWhileNz();
    Right();
    Move(0, -1, false);
    Add(1);
    Right(2);

    Sub(n);

    WhileNz();
        Set(0); Left(2); Sub(1); Right(2);
    EndWhileNz();
    Add(1);
    Left(3);
}


//Useful Functions
function PrintNum() {
    // x 0 0 0 0
    Insert(4);

    Copy2(0, 1);
    Right(2);
    WhileNz();
        Sub(1);
        Right(2);
        Add(1);
        If(10);
            Sub(10);
            Right(2);
            Add(1);
            If(10);
                Sub(10);
                Add(1, 2);
            EndIf();
            Left(2);
        EndIf();
        Left(2);
    EndWhileNz();

    Add(10);
    Right(6);
    While(0);
        Left(2);
    EndWhile();
    If(10);
        PrintChar(48);
    EndIf();
    WhileNot(10);
        Add(48);
        Output();
        Set(0);
        Left(2);
    EndWhile();
    Left(2);

    Remove(4);
}
/*function ReadNum() {
    Set(0);
    Insert(2);
    Right(4);
    Add(2);
    Left(2);

    Input();
    If(0);
        Add(10);
    EndIf();
    WhileNot(10)
        Sub(48);
        Right(2);
        If(2);
            Left(2); WhileNz(); Sub(1); Left(2); Add(100); Right(2); EndWhileNz(); Right(2);
        EndIf();
        If(1);
            Left(2); WhileNz(); Sub(1); Left(2); Add(10); Right(2); EndWhileNz(); Right(2);
        EndIf();
        If(0);
            Left(2); WhileNz(); Sub(1); Left(2); Add(1); Right(2); EndWhileNz(); Right(2);
        EndIf();
        Sub(1);
        Left(2);
        
        //check again
        Input();
        If(0);
            Add(10);
        EndIf();
    EndWhile();
    Left(2);

    Remove(2);
}*/
function ReadNum() {
    Set(0);

    Insert(2);
    Right(2);
    Input();
    If(0); //\0 becomes \n
        Add(10);
    EndIf();
    WhileNot(10)
        Left(2);
        Insert(1);
        Right(2);
        Input();
        If(0);
            Add(10);
        EndIf();
    EndWhile();
    Set(0);

    Right(2);
    WhileNz();
        Sub(48);
        Left(2);
        
        If(0);
            Right(2); WhileNz(); Sub(1); Left(4); Add(1); Right(4); EndWhileNz(); Left(2);
        EndIf();
        If(1);
            Right(2); WhileNz(); Sub(1); Left(4); Add(10); Right(4); EndWhileNz(); Left(2);
        EndIf();
        If(2);
            Right(2); WhileNz(); Sub(1); Left(4); Add(100); Right(4); EndWhileNz(); Left(2);
        EndIf();
        Add(1);
        
        Remove();
        Right(2);
    EndWhileNz();

    Left(4);
    Remove(2);
}


export {
    MovePtr2 as MovePtr, Add2 as Add, Sub2 as Sub, Set2 as Set, Right2 as Right, Left2 as Left,
    Input2 as Input, Output2 as Output, WhileNz2 as WhileNz, EndWhileNz2 as EndWhileNz, Move2 as Move, Copy2 as Copy, 
    PrintChar, Print, Insert, Remove, IfNot, If, EndIf, While, WhileNot, EndWhile, PrintNum, ReadNum
};