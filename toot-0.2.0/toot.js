/**
 * @class toot
 * Toot 核心库
 */
var toot = toot || {};

/**
 * @method extendclass
 * 在类基础上，扩展方法和属性
 * @param {*} classDef  传入类原型
 * @param {Array} functions  扩展方法的数组
 */
toot.extendclass = function (classDef, functions) {
    for (var fn in functions)
        classDef.prototype[fn] = functions[fn];

    classDef.thisclass = classDef.prototype;
};

/**
 * @method extendClassStatic
 * 在类继承上，扩展静态方法和属性
 * @param {*} classDef  传入类原型
 * @param {Array} members  扩展方法的数组
 */
toot.extendClassStatic = function (classDef, members) {
    for (var mb in members)
        classDef[mb] = members[mb];
};

/**
 * 继承类
 * @method inherit
 * @param {*} subClass  继承的类
 * @param {*} superClass  父类
 */
toot.inherit = function (subClass, superClass) {
    var F = function () { };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    //Decouple the subclass and superclass, useful when calling overridden function in superclass.
    subClass.superClass = superClass.prototype;
};

/**
 * 事件前缀
 * @type {string}
 * @private
 */
toot._EVENT_PREFIX = "_$Event$_";

/**
 * @method defineEvent
 * 定义事件
 * @param {*} classDef  类的原型
 * @param {Array} events  传入的事件
 */
toot.defineEvent = function (classDef, events) {
    var isArray = events instanceof Array;
    if (isArray)
        for (var i = 0; i < events.length; i++)
            classDef.prototype[toot._EVENT_PREFIX + events[i].toLowerCase()] = true;
    else
        classDef.prototype[toot._EVENT_PREFIX + events.toLowerCase()] = true;
};

/**
 * @method defineEventStatic
 * 定义静态事件
 * @param {*} classDef  类的原型
 * @param {Array} events  传入的事件
 */
toot.defineEventStatic = function (obj, events) {
    var isArray = events instanceof Array;
    if (isArray)
        for (var i = 0; i < events.length; i++)
            obj[toot._EVENT_PREFIX + events[i].toLowerCase()] = true;
    else
        obj[toot._EVENT_PREFIX + events.toLowerCase()] = true;
};

/**
 * 连接事件和处理函数
 * @method connect
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 */
toot.connect = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connect(senders[i], event, receiver, handler);
    else
        toot._connect(senders, event, receiver, handler);
};

/**
 * 连接事件和处理函数的内部处理
 * @method _connect
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 * @private
 */
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

/**
 * 连接事件和仅使用一次处理函数 处理函数执行一次后将被销毁
 * @method connectOnce
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 */
toot.connectOnce = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connectOnce(senders[i], event, receiver, handler);
    else
        toot._connectOnce(senders, event, receiver, handler);
};

/**
 * 连接事件和仅使用一次处理函数 处理函数执行一次后将被销毁 的内部实现
 * @method _connectOnce
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 * @private
 */
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

/**
 * @method connectIfNo
 * 连接事件和处理函数 连接之前，先销毁该事件目前已有的处理函数
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 */
toot.connectIfNo = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._connectIfNo(senders[i], event, receiver, handler);
    else
        toot._connectIfNo(senders, event, receiver, handler);

};
/**
 * @method _connectIfNo
 * 连接事件和处理函数 连接之前，先销毁该事件目前已有的处理函数 的内部实现
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 * @private
 */
toot._connectIfNo = function (sender, event, receiver, handler) {
    toot._disconnect(sender, event, receiver, handler);
    toot._connect(sender, event, receiver, handler)
};

/**
 * @method disconnect
 * 销毁事件和处理函数的关系
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 */
toot.disconnect = function (senders, event, receiver, handler) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._disconnect(senders[i], event, receiver, handler);
    else
        toot._disconnect(senders, event, receiver, handler);
};

/**
 * @method _disconnect
 * 销毁事件和处理函数的关系 的内部实现
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Object} receiver 处理函数的this指向，如果为null则不做改变
 * @param {Function} handler 处理函数
 * @private
 */
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

/**
 * @method disconnectAll
 * 销毁所有事件和处理函数之间的关系
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 */
toot.disconnectAll = function (senders, event) {
    var isArray = senders instanceof Array;
    if (isArray)
        for (var i = 0; i < senders.length; i++)
            toot._disconnectAll(senders[i], event);
    else
        toot._disconnectAll(senders, event);
};

/**
 * @method _disconnectAll
 * 销毁所有事件和处理函数之间的关系 的内部实现
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @private
 */
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

/**
 * @method fireEvent
 * 触发事件 (绑定在该事件名上的所有处理函数)
 * @param {Object} senders 将对每一个obj的同一事件连接到相同的处理函数
 * @param {String} event 事件类型
 * @param {Event} e 事件参数
 */
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

/**
 * Toot 错误文案
 * @type {{NOT_IMPLEMENTED: string}}
 */
toot.CommonException = {
    NOT_IMPLEMENTED: "NOT_IMPLEMENTED"
}

/**
 * @method toot
 * 返回命名空间
 * @returns {string}
 * @ignore
 */
toot.toot = function () {
    return "toot";
}
