if (typeof module !== 'undefined') {
    // In Node.js load required modules
    var PEG = require('pegjs');
    var fs = require('fs');
    var parse = PEG.buildParser(fs.readFileSync('./scheem.peg', 'utf-8')).parse;
} else {
    // In browser assume loaded by <script>
    var parse = SCHEEM.parse;
    var assert = chai.assert;
}

var getNumber = function(expr, env) {
    var num = evalScheem(expr, env);
    if (typeof num === 'number') {
        return num;
    }
    else {
        throw new Error("'" + num +"' is not a number");
    }
};

// An implementation of evalScheem
var evalScheem = function (expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Strings are variable references
    if (typeof expr === 'string') {
        if (env[expr] == undefined) {
            throw new Error("'" + expr +"' is undefined");
        }
        else {
            return env[expr];
        }
    }

    if (typeof expr[0] !== 'string')
        expr.unshift('begin');

    // Look at head of list for operation
    switch (expr[0]) {
        case '+':
            return getNumber(expr[1], env) +
                   getNumber(expr[2], env);
        case '-':
            return getNumber(expr[1], env) -
                   getNumber(expr[2], env);
        case '*':
            return getNumber(expr[1], env) *
                   getNumber(expr[2], env);
        case '/':
            return getNumber(expr[1], env) /
                   getNumber(expr[2], env);
        case 'define':
            env[expr[1]] = evalScheem(expr[2], env);
            return 0;
        case 'set!':
            if (env[expr[1]] === undefined) {
                throw new Error("'" + expr[1] +"' is undefined");
            }
            else {
                env[expr[1]] = evalScheem(expr[2], env);
            }
            return 0;
        case 'begin':
            var result = 0;
            for (var i = 1; i < expr.length; i++)
                result = evalScheem(expr[i], env);
            return result;
        case 'quote':
            return expr[1];
        case 'cons':
            var a = evalScheem(expr[2]);
            a.unshift(evalScheem(expr[1]));
            return a;
        case 'car':
            return evalScheem(expr[1]).shift();
        case 'cdr':
            return evalScheem(expr[1]).slice(1);
        case '=':
            var eq =
                (getNumber(expr[1], env) ===
                 getNumber(expr[2], env));
            if (eq) return '#t';
            return '#f';
        case '<':
            var less =
                (getNumber(expr[1], env) < 
                 getNumber(expr[2], env));
            return (less) ? '#t' : '#f';
        case '>':
            var bigger =
                (getNumber(expr[1], env) > 
                 getNumber(expr[2], env));
            return (bigger) ? '#t' : '#f';
        case '<=':
            var le =
                (getNumber(expr[1], env) <= 
                 getNumber(expr[2], env));
            return (le) ? '#t' : '#f';
        case '>=':
            var be =
                (getNumber(expr[1], env) >= 
                 getNumber(expr[2], env));
            return (be) ? '#t' : '#f';
        case 'if':
            return (evalScheem(expr[1], env) == '#t') ?
                    evalScheem(expr[2], env) :
                    evalScheem(expr[3], env);
    }
};

var evalScheemString = function (code, env) {
    var expr = parse(code);
    var pat = evalScheem(expr, env);
    return pat;
};

// If we are used as Node module, export evalScheem
if (typeof module !== 'undefined') {
    module.exports.evalScheem = evalScheem;
    module.exports.evalScheemString = evalScheemString;
}

