F.evalAST = function(ast) {
    var env = null;
    return ev(ast, env);
};

//evaluate an expression
function ev(ast, env) {
    if (typeof ast === "number" || ast === true || ast === false || ast === null)
        return ast;
    else {
        var tag = ast[0];
        var args = ast.slice(1);
        args.push(env);
        return impls[tag].apply(undefined, args);
    }
}
 
function checkArithmetic(x, y, env) {
    var evx = ev(x, env);
    var evy = ev(y, env);
    if(typeof evx == "number" && typeof evy == "number") {
        return [evx, evy];
    }
    else {
        throw new TypeError("arithmetic and relational operators should require args to be numbers")
    }
}

function checkBoolean(x, y, env) {
    var evx = ev(x, env);
    var evy = ev(y, env);
    if(typeof evx == "boolean" && typeof evy == "boolean") {
        return [evx, evy];
    }
    else {
        throw new TypeError("arithmetic and relational operators should require args to be numbers")
    }
}
var impls = {
    "+": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] + args[1];
    },
    "-": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] - args[1];
    },
    "*": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] * args[1];
    },
    "/": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        if(args[1] == 0) throw new Error("Division by zero!");
        // if(args[1] == 0) return 100;
        else return args[0] / args[1];
    },
    "%": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] % args[1];
    },
    "<": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] < args[1];
    },
    ">": function(e1, e2, env) {
        var args = checkArithmetic(e1, e2, env);
        return args[0] > args[1];
    },
    //The = and != operators should be able to compare any two values to one another, 
    //regardless of their types. E.g., (fun x -> x) = 5 should evaluate to false, 
    //not throw an exception.
    "=": function (e1, e2, env) {
        var ev1 = ev(e1, env);
        var ev2 = ev(e2, env);
        return ev1 === ev2;
    },
    "!=": function(e1, e2, env) {
        var ev1 = ev(e1, env);
        var ev2 = ev(e2, env);
        return ev1 != ev2;
    },
    "or": function(e1, e2, env) {
        var args = checkBoolean(e1, e2, env);
        return args[0] || args[1];
    },
    "and": function(e1, e2, env) {
        var args = checkBoolean(e1, e2, env);
        return args[0] && args[1];
    },
    "id": function(x, env) {
        var head = env;
        while(head != null) {
            if(head.name == x)
                return head.value;
            else head = head.next;
        }
        throw new Error("undefiend variable!");
    },
    "if": function(e1, e2, e3, env) {
        var con = ev(e1, env);
        if(typeof con == "boolean") {
            if(con) return ev(e2, env);
            else return ev(e3, env);
        }
        else throw new Error("condition expression needs to be evaluated to boolean!")
    },
    "let": function(x, e1, e2, env){
        var ev1 = ev(e1, env);
        // var subEnv = [x, ev1, env];
        var subEnv = {
            name: x,
            value: ev1,
            next : env
        };        
        return ev(e2, subEnv);
    },
    "fun": function(xlist, e, env) {
        return ['closure', xlist, e, env];
    },
    "call": function() {

        var env = arguments[arguments.length - 1];
        
        var args = Array.prototype.slice.call(arguments);
        args = args.slice(1, args.length - 1);
        
        var fun = ev(arguments[0], env);

        var funEnv = fun[3];
        if (args.length != fun[1].length) {
            throw new Error("number of arguments doesn't match");
        }
        else {
            var subEnv = funEnv;
            for(var i = 0; i < args.length; ++i) {
                subEnv = {
                    name: fun[1][i], 
                    value: ev(args[i], env), 
                    next: subEnv
                };
            }
        }
        return ev(fun[2], subEnv);
    }
}