import * as esprima from 'esprima';
import * as estraverse from 'estraverse';
import * as codegen from 'escodegen';
import * as safeeval from 'expr-eval';
var parser = safeeval.Parser;

var ast;
const parseCode = (code, input) => {
    var nodeList = [];
    ast = esprima.parseScript(code, {loc: true});
    something(ast, nodeList);
    ast = esprima.parseScript(codegen.generate(ast), {loc: true});
    var linetest = [];
    if(input != ''){
        var inputvec = fixInputVector(input);
        linetest = findPaintLines(ast, inputvec, nodeList);
    }
    return [codegen.generate(ast), linetest];
};


function something(p, nodeList) {
    if (p == null || p == undefined) 
        return;
    var myMap = {
        'Program': (p, nodeList) => {for (var x in p.body) {something(p.body[x], nodeList);}}, //p.body = p.body.filter((x) => x.type != 'VariableDeclaration');
        'VariableDeclaration': (p, nodeList)=> {for (var x in p.declarations) {something(p.declarations[x], nodeList);}},
        'VariableDeclarator': ParseVarDecl,
        'FunctionDeclaration': (p, nodeList) => {something(p.body, nodeList); deleteLets(p);},
        'BlockStatement': (p, nodeList) => {for (var x in p.body) {something(p.body[x], nodeList);} deleteExtra(p);},
        'IfStatement': parseIfStmt,
        'BinaryExpression': (p, nodeList) => {something(p.left, nodeList); something(p.right, nodeList);},
        'Identifier': (p, nodeList) => replaceNode(p, nodeList),
        'ExpressionStatement': (p, nodeList) => something(p.expression, nodeList),
        'ReturnStatement': (p, nodeList) => {replaceNode(p, nodeList); something(p.argument, nodeList);},
        'AssignmentExpression': parseAssExpr,
        'WhileStatement': parseWhileStmt,
    };
    if(p.type in myMap) myMap[p.type](p, nodeList);
}

function parseWhileStmt(p, nodeList) {
    replaceNode(p.test, nodeList);
    something(p.test, nodeList);
    var newNodeList = nodeList.slice();
    something(p.body, newNodeList);
}
function parseAssExpr(p, nodeList) {
    var val = replaceNode(p.right, nodeList);
    var name = p.left.name;
    var line = p.loc.start.line;
    nodeList.push({ name: name, line: line, val: val });
}
function parseIfStmt(p, nodeList) {
    replaceNode(p.test, nodeList);
    something(p.test, nodeList);
    var newNodeList = nodeList.slice();
    something(p.consequent, newNodeList);
    var newNodeList2 = nodeList.slice();
    something(p.alternate, newNodeList2);
}
function ParseVarDecl(p, nodeList) {
    var name = p.id.name;
    var line = p.loc.start.line;
    var val = replaceNode(p.init, nodeList);
    nodeList.push({ name: name, line: line, val: val });
}
function deleteExtra(node) {
    estraverse.replace(node, {
        enter: function (node) {
            if (node.type === esprima.Syntax.ExpressionStatement) {
                this.remove();
            }
        },
    });
}
function replaceNode(node, nodeList) {
    node = estraverse.replace(node, {
        enter: function (n) {
            if (n.type === esprima.Syntax.Identifier) {
                return replaceNodeID(n, nodeList);
            }
        },
    });return codegen.generate(node);}

function replaceNodeID(n, nodeList){
    var last; var lastLine = -1;
    for (var nlist in nodeList) {
        if (n.name == nodeList[nlist].name && nodeList[nlist].line >= lastLine){
            last = nodeList[nlist];
            lastLine = nodeList[nlist].line;
        }
    }
    if (last != undefined) {
        var x = tryEval(last.val);
        last.val = checkisNan(x, last.val);
        return esprima.parseScript(last.val, {loc: true}).body[0].expression;
    }
}

function checkisNan(x, val){
    return isNaN(x) ? val : String(x);
}
function tryEval(val){
    try {var x = eval(val);} catch (e){e;}
    return x;
}
function deleteLets(func) {
    var body = func.body;
    estraverse.replace(body, {
        leave: function (node) {
            if (node.type == 'VariableDeclaration') {
                this.remove();
            }
            else{
                this.skip();
            }
        }
    });
}
function fixInputVector(input){
    var splitted = input.replace(/\s/g, '').slice(1, -1).split(',');
    var inputvec = [];
    for(var x in splitted){
        var ind = splitted[x].split('=');
        inputvec[ind[0]] = eval(ind[1]);
    }
    return inputvec;
}
function addNodes(vec, nodes){
    var ans = vec;
    for(var x in nodes){
        //if(nodes[x].line < line){
        ans[nodes[x].name]= nodes[x].val;
        //}
    }
    return ans;
}

function findPaintLines(ast, input, nodeList){
    var ans = [];
    estraverse.traverse(ast, {
        enter: function (n) {
            if (n.type === esprima.Syntax.IfStatement) {
                var test = codegen.generate(n.test);
                var withNodes = addNodes(input, nodeList, n.loc.start.line);
                var test1 = parser.evaluate(test, withNodes);
                ans.push({line: n.test.loc.start.line, bol: test1});
            }
        },
    });

    return ans;
}
export {parseCode};

