if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheemString = require('../scheem').evalScheemString;
    var parse = PEG.buildParser(fs.readFileSync('scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
}

suite('add', function() {
    test('two numbers test', function() {
        assert.deepEqual(evalScheemString("(+ 3 5)", {}),
                         8);
    });
    test('a number and an expression test ', function() {
        assert.deepEqual(evalScheemString("(+ 3 (+ 2 2))", {}),
                         7);
    });
    test('a dog and a cat test ', function() {
        assert.throws(function () {evalScheemString("(+ dog cat)", {})});
    });
    test('a "dog" and 5 test', function() {
        assert.throws(function () {evalScheemString("(+ 'dog 5)", {})});
    });
});

suite('numbers w/o env', function() {
    test('5 test', function() {
        evalScheemString('5', {}) ==
                         5;
    });
    test('(+ 2 3) test', function() {
        assert.deepEqual(evalScheemString('(+ 2 3)', {}),
                         5);
    });
    test('(* 2 3) test', function() {
        assert.deepEqual(evalScheemString('(* 2 3)', {}),
                         6);
    });
    test('(/ 1 2) test', function() {
       assert.deepEqual(evalScheemString('(/ 1 2)', {}),
                         0.5);
    });
    test('(* (/ 8 4) (+ 1 1)) test', function() {
        assert.deepEqual(evalScheemString('(* (/ 8 4) (+ 1 1))', {}),
                         4);
   });
});

suite('numbers with env', function() {
    var env = {x:2, y:3, z:10};

    test('5 test', function() {
        assert.deepEqual(evalScheemString('5', env),
                         5);
    });
    test('x test', function() {
        assert.deepEqual(evalScheemString('x', env),
                         2);
    });
    test('(+ 2 3) test', function() {
        assert.deepEqual(evalScheemString("(+ 2 3)", env),
                         5);
    });
    test('(* y 3) test', function() {
        assert.deepEqual(evalScheemString("(* y 3)", env),
                         9);
    });
    test('(/ z (+ x y)) test', function() {
        assert.deepEqual(evalScheemString("(/ z (+ x y))", env),
                         2);
    });
});

suite('defing & setting values', function() {
    var env = {x:2, y:3, z:10};

    test('evaluation of define test', function() {
        assert.deepEqual(evalScheemString("(define a 5)", env),
                         0);
    });
    test('(define a 5) test', function() {
        assert.deepEqual(env,
                         {x:2, y:3, z:10, a:5});
    });
    test('(set! a 1) test', function() {
        var tmp = evalScheemString("(set! a 1)", env);
        assert.deepEqual(env,
                         {x:2, y:3, z:10, a:1});
    });
    test('(set! x 7) test', function() {
        var tmp = evalScheemString("(set! x 7)", env);
        assert.deepEqual(env,
                         {x:7, y:3, z:10, a:1});
    });
    test('(set! y (+ x 1)) test', function() {
        var tmp = evalScheemString("(set! y (+ x 1))", env);
        assert.deepEqual(env,
                         {x:7, y:8, z:10, a:1});
    });
});

suite('begin & set!', function() {
    test('(begin 1 2 3) test', function() {
        assert.deepEqual(evalScheemString("(begin 1 2 3)", {}),
                         3);
    });
    test('(begin (+ 2 2)) test', function() {
        assert.deepEqual(evalScheemString("(begin (+ 2 2))", {}),
                         4);
    });
    var env = {x:1, y:2};
    test('(begin x y x) test', function() {
        assert.deepEqual(evalScheemString("(begin x y x)", env),
                         1);
    });
    test('(begin (set! x 5) (set! x (+ y x) x)) test', function() {
        assert.deepEqual(evalScheemString("(begin (set! x 5) (set! x (+ y x)) x)", env),
                         7);
    });
});

suite('quotation', function() {
    test('quote a number test', function() {
        assert.deepEqual(evalScheemString("(quote 3)", {}),
                         3);
    });
    test('quote an atom test ', function() {
        assert.deepEqual(evalScheemString("(quote dog)", {}),
                         'dog');
    });
    test('quote a list test', function() {
        assert.deepEqual(evalScheemString("'(1 2 3)", {}),
                         [1, 2, 3]);
    });
    test('(quote (+ 2 3)) test', function() {
        assert.deepEqual(evalScheemString("'(+ 2 3)", {}),
                         ['+', 2, 3]);
    });
    test('(quote (quote (+ 2 3))) test', function() {
        assert.deepEqual(evalScheemString("(quote (quote (+ 2 3)))", {}),
                         ['quote', ['+', 2, 3]]);
    });
});

suite('comparison', function() {
    test('(< 2 2) test', function() {
        assert.deepEqual(evalScheemString("(< 2 2)", {}),
                         '#f');
    });
    test('(= 2 2) test', function() {
        assert.deepEqual(evalScheemString("(= 2 2)", {}),
                         '#t');
    });
    test('(> 2 2) test', function() {
        assert.deepEqual(evalScheemString("(> 2 2)", {}),
                         '#f');
    });
    test('(<= 2 2) test', function() {
        assert.deepEqual(evalScheemString("(<= 2 2)", {}),
                         '#t');
    });
    test('(>= 2 2) test', function() {
        assert.deepEqual(evalScheemString("(>= 2 2)", {}),
                         '#t');
    });
    test('(< 2 3) test ', function() {
        assert.deepEqual(evalScheemString("(< 2 3)", {}),
                         '#t');
    });
    test('(= 2 3) test ', function() {
        assert.deepEqual(evalScheemString("(= 2 3)", {}),
                         '#f');
    });
    test('(> 2 3) test ', function() {
        assert.deepEqual(evalScheemString("(> 2 3)", {}),
                         '#f');
    });
    test('(< (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheemString("(< (+ 1 1) (+ 2 3))", {}),
                         '#t');
    });
    test('(<= (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheemString("(<= (+ 1 1) (+ 2 3))", {}),
                         '#t');
    });
    test('(>= (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheemString("(>= (+ 1 1) (+ 2 3))", {}),
                         '#f');
    });
});

suite('conditionals', function() {
    test('(if (= 1 1) 2 3) test', function() {
        assert.deepEqual(evalScheemString("(if (= 1 1) 2 3)", {}),
                         2);
    });
    test('(if (= 1 0) 2 3) test', function() {
        assert.deepEqual(evalScheemString("(if (= 1 0) 2 3)", {}),
                         3);
    });
    test('(if (= 1 1) 2 error) test', function() {
        assert.deepEqual(evalScheemString("(if (= 1 1) 2 error)", {}),
                         2);
    });
    test('(if (= 1 0) error 3) test', function() {
        assert.deepEqual(evalScheemString("(if (= 1 0) error 3)", {}),
                         3);
    });
    test('(if (= 1 1) (if (= 2 3) 10 11) 12) test', function() {
        assert.deepEqual(evalScheemString("(if (= 1 1) (if (= 2 3) 10 11) 12)", {}),
                         11);
    });
});

