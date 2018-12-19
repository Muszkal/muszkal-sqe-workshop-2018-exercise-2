import $ from 'jquery';
import {parseCode} from './code-analyzer';

$(document).ready(function () {
    $('#codeSubmissionButton').click(() => {
        $('parsedCode').empty();
        let code = $('#codePlaceholder').val();
        let input = $('#inputVector').val();
        let ans = parseCode(code, input);
        writeCode(ans);

    });
});

function writeCode(ans) {
    var z = ans[0].split('\n');
    for (var x in z) {
        var k = undefined;
        for (var n in ans[1]) {
            if (ans[1][n].line - 1 == x) {
                k = ans[1][n];
                break;
            }
        }
        var firstLine = z[x];
        if (k != undefined) 
            firstLine = checkK(k, z[x]);
        $('p').append(firstLine + '<br>');
    }
}

function checkK(k, line) {
    var firstLine;
    if (k.bol) 
        firstLine = '<mark style="background-color: green "> ' + line + '</mark>';
    else 
        firstLine = '<mark style="background-color: red "> ' + line + '</mark>';
    return firstLine;
}
