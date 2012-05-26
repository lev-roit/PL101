if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var assert = require('chai').assert;
    var PEG = require('pegjs');
    var fs = require('fs');
    var evalScheem = require('../scheem').evalScheem;
    var parser_data = fs.readFileSync('scheem.peg', 'utf-8');
    var parse = PEG.buildParser(parser_data).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
}

suite('add', function() {
    test('two numbers test', function() {
        assert.deepEqual(evalScheem(['+', 3, 5], {}), 8);
    });
    test('a number and an expression test ', function() {
        assert.deepEqual(evalScheem(['+', 3, ['+', 2, 2]], {}),
                         7);
    });
    test('a dog and a cat test ', function() {
        assert.throws(function () {evalScheem(['+', 'dog', 'cat'], {})});
    });
    test('a "dog" and 5 test', function() {
        assert.throws(function () {evalScheem(['+', ['quote', 'dog'], 5], {})});
    });
});

suite('numbers w/o env', function() {
    test('5 test', function() {
        assert.deepEqual(evalScheem(5, {}),
                         5);
    });
    test('(+ 2 3) test', function() {
        assert.deepEqual(evalScheem(['+', 2, 3], {}),
                         5);
    });
    test('(* 2 3) test', function() {
        assert.deepEqual(evalScheem(['*', 2, 3], {}),
                         6);
    });
    test('(/ 1 2) test', function() {
       assert.deepEqual(evalScheem(['/', 1, 2], {}),
                         0.5);
    });
    test('(* (/ 8 4) (+ 1 1)) test', function() {
        assert.deepEqual(evalScheem(['*', ['/', 8, 4], ['+', 1, 1]], {}),
                         4);
   });
});

suite('numbers with env', function() {
    var env = {x:2, y:3, z:10};

    test('5 test', function() {
        assert.deepEqual(evalScheem(5, env),
                         5);
    });
    test('x test', function() {
        assert.deepEqual(evalScheem('x', env),
                         2);
    });
    test('(+ 2 3) test', function() {
        assert.deepEqual(evalScheem(['+', 2, 3], env),
                         5);
    });
    test('(* y 3) test', function() {
        assert.deepEqual(evalScheem(['*', 'y', 3], env),
                         9);
    });
    test('(/ z (+ x y)) test', function() {
        assert.deepEqual(evalScheem(['/', 'z', ['+', 'x', 'y']], env),
                         2);
    });
});

suite('defing & setting values', function() {
    var env = {x:2, y:3, z:10};

    test('evaluation of define test', function() {
        assert.deepEqual(evalScheem(['define', 'a', 5], env),
                         0);
    });
    test('(define a 5) test', function() {
        assert.deepEqual(env,
                         {x:2, y:3, z:10, a:5});
    });
    test('(set! a 1) test', function() {
        var tmp = evalScheem(['set!', 'a', 1], env);
        assert.deepEqual(env,
                         {x:2, y:3, z:10, a:1});
    });
    test('(set! x 7) test', function() {
        var tmp = evalScheem(['set!', 'x', 7], env);
        assert.deepEqual(env,
                         {x:7, y:3, z:10, a:1});
    });
    test('(set! y (+ x 1)) test', function() {
        var tmp = evalScheem(['set!', 'y', ['+', 'x', 1]], env);
        assert.deepEqual(env,
                         {x:7, y:8, z:10, a:1});
    });
});

suite('begin & set!', function() {
    test('(begin 1 2 3) test', function() {
        assert.deepEqual(evalScheem(['begin', 1, 2, 3], {}),
                         3);
    });
    test('(begin (+ 2 2)) test', function() {
        assert.deepEqual(evalScheem(['begin', ['+', 2, 2]], {}),
                         4);
    });
    var env = {x:1, y:2};
    test('(begin x y x) test', function() {
        assert.deepEqual(evalScheem(['begin', 'x', 'y', 'x'], env),
                         1);
    });
    test('(begin (set! x 5) (set! x (+ y x)) x) test', function() {
        assert.deepEqual(evalScheem(['begin', ['set!', 'x', 5], ['set!', 'x', ['+', 'y', 'x']], 'x'], env),
                         7);
    });
});

suite('quotation', function() {
    test('quote a number test', function() {
        assert.deepEqual(evalScheem(['quote', 3], {}),
                         3);
    });
    test('quote an atom test ', function() {
        assert.deepEqual(evalScheem(['quote', 'dog'], {}),
                         'dog');
    });
    test('quote a list test', function() {
        assert.deepEqual(evalScheem(['quote', [1, 2, 3]], {}),
                         [1, 2, 3]);
    });
    test('(quote (+ 2 3)) test', function() {
        assert.deepEqual(evalScheem(['quote', ['+', 2, 3]], {}),
                         ['+', 2, 3]);
    });
    test('(quote (quote (+ 2 3))) test', function() {
        assert.deepEqual(evalScheem(['quote', ['quote', ['+', 2, 3]]], {}),
                         ['quote', ['+', 2, 3]]);
    });
});

suite('comparison', function() {
    test('(< 2 2) test', function() {
        assert.deepEqual(evalScheem(['<', 2, 2], {}),
                         '#f');
    });
    test('(= 2 2) test', function() {
        assert.deepEqual(evalScheem(['=', 2, 2], {}),
                         '#t');
    });
    test('(> 2 2) test', function() {
        assert.deepEqual(evalScheem(['>', 2, 2], {}),
                         '#f');
    });
    test('(<= 2 2) test', function() {
        assert.deepEqual(evalScheem(['<=', 2, 2], {}),
                         '#t');
    });
    test('(>= 2 2) test', function() {
        assert.deepEqual(evalScheem(['>=', 2, 2], {}),
                         '#t');
    });
    test('(< 2 3) test ', function() {
        assert.deepEqual(evalScheem(['<', 2, 3], {}),
                         '#t');
    });
    test('(= 2 3) test ', function() {
        assert.deepEqual(evalScheem(['=', 2, 3], {}),
                         '#f');
    });
    test('(> 2 3) test ', function() {
        assert.deepEqual(evalScheem(['>', 2, 3], {}),
                         '#f');
    });
    test('(< (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheem(['<', ['+', 1, 1], ['+', 2, 3]], {}),
                         '#t');
    });
    test('(<= (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheem(['<=', ['+', 1, 1], ['+', 2, 3]], {}),
                         '#t');
    });
    test('(>= (+ 1 1) (+ 2 3)) test', function() {
        assert.deepEqual(evalScheem(['>=', ['+', 1, 1], ['+', 2, 3]], {}),
                         '#f');
    });
});

suite('conditionals', function() {
    test('(if (= 1 1) 2 3) test', function() {
        assert.deepEqual(evalScheem(['if', ['=', 1, 1], 2, 3], {}),
                         2);
    });
    test('(if (= 1 0) 2 3) test', function() {
        assert.deepEqual(evalScheem(['if', ['=', 1, 0], 2, 3], {}),
                         3);
    });
    test('(if (= 1 1) 2 error) test', function() {
        assert.deepEqual(evalScheem(['if', ['=', 1, 1], 2, 'error'], {}),
                         2);
    });
    test('(if (= 1 0) error 3) test', function() {
        assert.deepEqual(evalScheem(['if', ['=', 1, 0], 'error', 3], {}),
                         3);
    });
    test('(if (= 1 1) (if (= 2 3) 10 11) 12) test', function() {
        assert.deepEqual(evalScheem(['if', ['=', 1, 1], ['if', ['=', 2, 3], 10, 11], 12], {}),
                         11);
    });
});

suite('parse', function() {
    test('a number test', function() {
        assert.deepEqual(parse('42'),
                         42);
    });
    test('a variable test', function() {
        assert.deepEqual(parse('x'),
                         'x');
    });
    test('a code test', function() {
        var code = ";; Factorial function \n \
                    (define factorial           ;; factorial function 'string1' %% ## 'string2' \n \
                        (lambda (n) \n \
                            (if (= n 0) 1 (      ;; comm \n \
                                 * n (factorial  (- n 1)))))) \n \
                    \n \
                    (define factorial1 \n \
                        (lambda (n) \n \
                            (if (= n 0) 1 \n \
                                (* n (factorial1 (- n 1)))))) \n \
                    \n \
                    abcde 1 '2 '(3 4 5) 'x \n \
                    \n \
                    ;; Factorial function \n \
                    (define factorial2 \n \
                        (lambda (n) \n \
                            (if (= n 0) 1 \n \
                                (* n (factorial2 (- n 1)))))) \n \
                    \n \
                    ;;End comment";

        var pattern = 
        [
           [
              "define",
              "factorial",
              [
                 "lambda",
                 [
                    "n"
                 ],
                 [
                    "if",
                    [
                       "=",
                       "n",
                       0
                    ],
                    1,
                    [
                       "*",
                       "n",
                       [
                          "factorial",
                          [
                             "-",
                             "n",
                             1
                          ]
                       ]
                    ]
                 ]
              ]
           ],
           [
              "define",
              "factorial1",
              [
                 "lambda",
                 [
                    "n"
                 ],
                 [
                    "if",
                    [
                       "=",
                       "n",
                       0
                    ],
                    1,
                    [
                       "*",
                       "n",
                       [
                          "factorial1",
                          [
                             "-",
                             "n",
                             1
                          ]
                       ]
                    ]
                 ]
              ]
           ],
           "abcde",
           1,
           [
              "quote",
              2
           ],
           [
              "quote",
              [
                 3,
                 4,
                 5
              ]
           ],
           [
              "quote",
              "x"
           ],
           [
              "define",
              "factorial2",
              [
                 "lambda",
                 [
                    "n"
                 ],
                 [
                    "if",
                    [
                       "=",
                       "n",
                       0
                    ],
                    1,
                    [
                       "*",
                       "n",
                       [
                          "factorial2",
                          [
                             "-",
                             "n",
                             1
                          ]
                       ]
                    ]
                 ]
              ]
           ]
        ];

        assert.deepEqual(parse(code),
                         pattern);
    });
});
