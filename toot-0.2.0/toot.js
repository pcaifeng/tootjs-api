/******

******/

var toot = toot || {};

toot.extendClass = function (classDef, functions) {
    for (var fn in functions)
        classDef.prototype[fn] = functions[fn];

    classDef.thisClass = classDef.prototype;
};
toot.extendClassStatic = function (classDef, members) {
    for (var mb in members)
        classDef[mb] = members[mb];
};
toot.inherit = function (subClass, superClass) {
    var F = function () { };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    //Decouple the subclass and superclass, useful when calling overridden function in superclass.
    subClass.superClass = superClass.prototype;
};

toot._EVENT_PREFIX = "_$Event$_";
toot.defineEvent = function (classDef, events) {
    var isArray = events instanceof Array;
    if (isArray)
        for (var i = 0; i < events.length; i++)
            classDef.prototype[toot._EVENT_PREFIX + events[i].toLowerCase()] = true;
    else
        classDef.prototype[toot._EVENT_PREFIX + events.toLowerCase()] = true;
};
toot.defineEventStatic = function (obj, events) {
    var isArray = events instanceof Array;
    if (isArray)
        for (var i = 0; i < events.length; i++)
            obj[toot._EVENT_PREFIX + events[i].toLowerCase()] = true;
    else
        obj[toot._EVENT_PREFIX + events.toLowerCase()] = true;
};

toot.connect = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connect(senders[i], event, receiver, handler);
    else
        toot._connect(senders, event, receiver, handler);
};
toot._connect = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";

    sender[toot._EVENT_PREFIX][elc].push({ receiver: receiver, handler: handler });
};
toot.connectOnce = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connectOnce(senders[i], event, receiver, handler);
    else
        toot._connectOnce(senders, event, receiver, handler);
};
toot._connectOnce = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";

    sender[toot._EVENT_PREFIX][elc].push({ receiver: receiver, handler: handler, once: true });
};
toot.connectIfNo = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connectIfNo(senders[i], event, receiver, handler);
    else
        toot._connectIfNo(senders, event, receiver, handler);

};
toot._connectIfNo = function (sender, event, receiver, handler) {
    toot._disconnect(sender, event, receiver, handler);
    toot._connect(sender, event, receiver, handler)
};
toot.disconnect = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._disconnect(senders[i], event, receiver, handler);
    else
        toot._disconnect(senders, event, receiver, handler);
};
toot._disconnect = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        if (sender[toot._EVENT_PREFIX] && sender[toot._EVENT_PREFIX][elc]) {
            for (var i = 0, l = sender[toot._EVENT_PREFIX][elc].length; i < l; i++) {
                var handlerWrapper = sender[toot._EVENT_PREFIX][elc][i];
                if (handlerWrapper.receiver == receiver && handlerWrapper.handler == handler) {
                    sender[toot._EVENT_PREFIX][elc].splice(i, 1);
                    break;
                }
            }
        }
    }
    else
        throw sender + " has no " + event + " event";
};
toot.disconnectAll = function (senders, event) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._disconnectAll(senders[i], event);
    else
        toot._disconnectAll(senders, event);
};
toot._disconnectAll = function (sender, event) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        if (sender[toot._EVENT_PREFIX] && sender[toot._EVENT_PREFIX][elc]) {
            sender[toot._EVENT_PREFIX][elc] = [];
        }
    }
    else
        throw sender + " has no " + event + " event";
}
toot.fireEvent = function (sender, event, e) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";

    var fns = sender[toot._EVENT_PREFIX][elc].concat([]);
    for (var i = 0; i < fns.length; i++) {
        var fn = fns[i];
        fn.receiver ? fn.handler.call(fn.receiver, sender, e) : fn.handler(sender, e);
        if (fn.once)
            toot._disconnect(sender, event, fn.receiver, fn.handler);
    }
};

toot.CommonException = {
    NOT_IMPLEMENTED: "NOT_IMPLEMENTED"
}

toot.toot = function () {
    return "toot";
}
