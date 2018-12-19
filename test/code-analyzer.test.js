import assert from 'assert';
import {parseCode} from '../src/js/code-analyzer';


describe('The javascript parser', () => {
    it('test0', () => {
        assert.equal(
            parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }', '')[0],
            'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x + 5);\n    } else {\n        return x + y + z + (0 + z + 5);\n    }\n}'
        );
    });

    it('test1', () => {
        assert.equal(
            parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; while (a < z) { c = a + b; z = c * 2; } return z; }', '')[0],
            'function foo(x, y, z) {\n    while (x + 1 < z) {\n    }\n    return z;\n}'
        );
    });

    it('test2', () => {
        assert.equal(
            parseCode('function foo(x, y, z){ let a = x + 1; let b = a + y; let c = 0; if (b < z) { c = c + 5; return x + y + z + c; } else if (b < z * 2) { c = c + x + 5; return x + y + z + c; } else { c = c + z + 5; return x + y + z + c; } }', '(x=1,y=2,z=3)')[0],
            'function foo(x, y, z) {\n    if (x + 1 + y < z) {\n        return x + y + z + 5;\n    } else if (x + 1 + y < z * 2) {\n        return x + y + z + (0 + x + 5);\n    } else {\n        return x + y + z + (0 + z + 5);\n    }\n}'
        );
    });

    
    it('test3', () => {
        assert.equal(
            parseCode('function foo(){ if (1 < 2) { var x = 1; return x; } }', '')[0],
            'function foo() {\n    if (1 < 2) {\n        return 1;\n    }\n}'
        );
    });

    it('test4', () => {
        assert.equal(
            parseCode('function foo(){ let x = 3; if (1 < 2) { x = 1 + 3; return 1; } }', '')[0],
            'function foo() {\n    if (1 < 2) {\n        return 1;\n    }\n}'
        );
    });

    it('test5', () => {
        assert.equal(
            parseCode('function foo() { if (true) { return 1; } let xxx = 3; }', '')[0],
            'function foo() {\n    if (true) {\n        return 1;\n    }\n}'
        );
    });

    it('test6', () => {
        assert.equal(
            parseCode('let a = x + 1; let b = a + y; let c = 0; function foo(x, y, z){ if (b < z) { c = c + 5; if (b < z * 2) { c = c + x + 5; return x + y + z + c; } } }', '')[0],
            'let a = x + 1;\nlet b = x + 1 + y;\nlet c = 0;\nfunction foo(x, y, z) {\n    if (x + 1 + y < z) {\n        if (x + 1 + y < z * 2) {\n            return x + y + z + (5 + x + 5);\n        }\n    }\n}'
        );
    });

    it('test7', () => {
        assert.equal(
            parseCode('', '')[0],
            ''
        );
    });

    it('test8', () => {
        assert.equal(
            parseCode('function foo(){}', '')[0],
            'function foo() {\n}'
        );
    });

    it('test9', () => {
        assert.equal(
            parseCode('let b = 2; function foo(x){ if (b < x) { return 3; } }', '')[0],
            'let b = 2;\nfunction foo(x) {\n    if (2 < x) {\n        return 3;\n    }\n}'
        );
    });
});


