onmessage = function(e) {
    let code = e.data.code;
    let input = e.data.input;
    function i() {
        let code = (input.charCodeAt(0) || 0) % 256;
        input = input.substring(1);
        return code;
    }
    function o(code) {
        postMessage(code);
    }
    eval(code);
    postMessage("done");
}