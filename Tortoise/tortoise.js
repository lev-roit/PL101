// Lookup for variable and return it value
var lookup = function (env, v) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        return env.bindings[v];
    return lookup(env.outer, v);
};


// Lookup for variable and update it value
var update = function (env, v, val) {
    if (!(env.hasOwnProperty('bindings')))
        throw new Error(v + " not found");
    if (env.bindings.hasOwnProperty(v))
        env.bindings[v] = val;
    else
        update(env.outer, v, val);
};


// Update env in place to add a top-most binding from v to val
var add_binding = function (env, v, val) {
    if (!(env.hasOwnProperty('bindings'))) {
        env['outer'] = {};
        env['bindings'] = {};
    }
    env.bindings[v] = val;
};


// Evaluate a Tortoise expression, return value
var evalExpr = function(expr, env) {
    // Numbers evaluate to themselves
    if (typeof expr === 'number') {
        return expr;
    }
    // Look at tag to see what to do
    switch (expr.tag) {
        // Simple built-in binary operations
        case '<':
            return evalExpr(expr.left, env) < evalExpr(expr.right, env);
        case '>':
            return evalExpr(expr.left, env) > evalExpr(expr.right, env);
        case '<=':
            return evalExpr(expr.left, env) <= evalExpr(expr.right, env);
        case '>=':
            return evalExpr(expr.left, env) >= evalExpr(expr.right, env);
        case '==':
            return evalExpr(expr.left, env) == evalExpr(expr.right, env);
        case '+':
            return evalExpr(expr.left, env) + evalExpr(expr.right, env);
        case '-':
            return evalExpr(expr.left, env) - evalExpr(expr.right, env);
        case '*':
            return evalExpr(expr.left, env) * evalExpr(expr.right, env);
        case '/':
            return evalExpr(expr.left, env) / evalExpr(expr.right, env);
        case 'call':
            // Get function value
            var func = lookup(env, expr.name);
            // Evaluate arguments to pass
            var ev_args = [];
            var i = 0;
            for(i = 0; i < expr.args.length; i++) {
                ev_args[i] = evalExpr(expr.args[i], env);
            }
            var val = func.apply(null, ev_args);
//            log_console('call ' + expr.name + ' ' + expr.args.length + ' ' + ev_args[0] + ':' + val);
            return val;
        case 'ident':
            return lookup(env, expr.name);
    }
};


// Evaluate a Tortoise statement, return value
var evalStatement = function(stmt, env) {
    var val = undefined;
    // Statements always have tags
    switch (stmt.tag) {
        // A single expression
        case 'ignore':
            // Just evaluate expression
            return evalExpr(stmt.body, env);
        // Declare new variable
        case 'var':
            // New variable gets default value of 0
            val = evalExpr(stmt.val, env);
            add_binding(env, stmt.name, val);
            return 0;
        case ':=':
            // Evaluate right hand side
            val = evalExpr(stmt.right, env);
            update(env, stmt.left, val);
            return val;
        case 'if':
            if(evalExpr(stmt.expr, env)) {
                val = evalStatements(stmt.body, env);
            }
            return val;
        case 'repeat':
            // Your code here
            var rep = evalExpr(stmt.expr, env);
            while (rep-- > 0) {
                val = evalStatements(stmt.body, env);
            }
            return val;
        case 'while':
            // Your code here
            while (evalExpr(stmt.expr, env)) {
                val = evalStatements(stmt.body, env);
            }
            return val;
        case 'define':
            // name args body
            var new_func = function() {
                // This function takes any number of arguments
                var i;
                var new_env;
                var new_bindings;
                new_bindings = { };
                for(i = 0; i < stmt.args.length; i++) {
                    new_bindings[stmt.args[i]] = arguments[i];
                }
                new_env = { bindings: new_bindings, outer: env };
                return evalStatements(stmt.body, new_env);
            };
            add_binding(env, stmt.name, new_func);
            return 0;
    }
};


// Evaluate a Tortoise statements, return value
var evalStatements = function (seq, env) {
    var i;
    var val = undefined;
    for(i = 0; i < seq.length; i++) {
        val = evalStatement(seq[i], env);
    }
    return val;
};

