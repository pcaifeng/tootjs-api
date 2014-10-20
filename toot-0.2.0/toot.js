/**
 * @class toot
 * Toot 核心库
 * 定义toot对象
 */
 
var toot = toot || {};


/**
 * @method extendclass
 * 在类基础上，扩展方法（处理函数）和属性
 * @param {*}     classDef   类
 * @param {Array} functions  包含扩展方法和属性的对象
 * # 说明和例子
 *  给类添加一些方法,是之前的事件名的实际执行方法，但此时未进行连接，与之前的事件名还无关联
 *
 *  公开的，实例可访问
 *
     *     @example
     *     toot.extendclass(classA,{
     *          tclick:function1(){},
     *          tfocus:function2(){},
     *          ...
	 *          });   //给类classA添加了tclick,tfocus等方法
 */
toot.extendclass = function (classDef, functions) {
    for (var fn in functions)
        classDef.prototype[fn] = functions[fn];

    classDef.thisclass = classDef.prototype;
};

/**
 * @method extendClassStatic
 * 在类基础上，扩展静态方法（处理函数）和静态属性
 * @param {*}     classDef  类
 * @param {Array} members   包含扩展方法和属性的对象
 * # 说明和例子
 * 给类添加一些静态方法,是之前的事件名的实际执行方法，但此时未进行连接，与之前的事件名还无关联
 *
 * 私有的，实例无法访问
 *
 *     @example
 *     toot.extendClassStatic(classA,{
 *	              tclick:function1(){}
 *				 ,tfocus:function2(){}
 *				 ,...
 *				 });   //给类classA添加了tclick,tfocus等静态方法
 */
toot.extendClassStatic = function (classDef, members) {
    for (var mb in members)
        classDef[mb] = members[mb];
};



/**
 * 继承类
 * @method inherit
 * @param {*} subClass    继承的类/子类
 * @param {*} superClass  父类
 * # 说明
 * 继承的是父类原型prototype里的属性和方法，无法继承父类自身的属性方法
 *
 * 同时子类无法修改父类中的原型属性和方法
 *
 *      @example
 *      subClass.superClass = superClass.prototype;
 *                       //这句代码给子类添加了一个指向父类原型的静态属性subClass.SuperClass，允许子类访问父类原型的属性和方法
 */
toot.inherit = function (subClass, superClass) {
    var F = function () { };
    F.prototype = superClass.prototype;
    subClass.prototype = new F();
    subClass.prototype.constructor = subClass;
    //Decouple the subclass and superclass, useful when calling overridden function in superclass.
	//这边给子类提供了一个对象能够修改父类的原型属性和方法
    subClass.superClass = superClass.prototype;
};

/**
 * 事件前缀
 * @type {string}
 * @private
 * # 说明
 * 为了和自带的事件名作区分，加了个前缀
 * 
 * 假如定义的事件名为onclick,这与html元素自带的onclick事件重名，可能会产生冲突
 */
toot._EVENT_PREFIX = "_$Event$_";



/**
 * @method defineEvent
 * 定义事件
 * @param {*}     classDef  类
 * @param {Array} events    传入的事件名（字符串或字符串数组）
 * # 说明和例子
 * 给定义的类添加了一些事件,只是属性，没有实际的执行代码
 * 
 * 公开的，可以被实例访问
 *
 *     @example
 *     toot.defineEvent(classA,["click","focus",...])  // 给类classA添加了click,focus等事件
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
 * @param {*}     obj     类
 * @param {Array} events  传入的事件名（单个或数组）
 * # 说明和例子
 * 给定义的类添加了一些事件,只是属性，没有实际的执行代码
 * 
 * 公用事件,所有实例都能通过类来访问，
 *
 * 可以通过类来驱动多个实例 
 *
 *     @example
 *     toot.defineEventStatic(classA,["click","focus",...])    //给类A添加了click,focus等静态事件
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
 * @method connect
 * 连接事件和处理函数
 * @param {Object}   senders   实例对象（单个或数组）
 * @param {String}   event     事件类型（事件名）  
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * # 说明和例子
 * (实例对象,事件名，作用域，处理函数)  作用域：自身（this），其他对象
 *
 * 对每一个实例对象的同一事件连接到相同的处理函数（作用域相同，处理函数相同）
 *     
 *     @example
 *     假设B和C为classA的实例
 *     toot.connect(B, "click", this, B.tclick);   
 *                                      // 将实例B的click事件和tclick函数连接,第三个参数this表明作用域为该语句的执行环境
 *     toot.connect(C, "click", txtB, C.tclick);       
 *                                      // 将实例C的click事件和tclick函数连接
 *                                      // 第三个参数B表明作用域在B内,则C的click事件能影响到B
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
 * @method _connect
 * 连接事件和处理函数的内部处理
 * @param {Object}   senders   实例对象
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * @private
 * 连接的内部操作，判断事件名是否存在，是的话连接事件函数，否则报错
 *
 * 将对每一个实例对象的同一事件连接到相同的处理函数  
 */
toot._connect = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();
 
    if (sender[toot._EVENT_PREFIX + elc]) {
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";

    sender[toot._EVENT_PREFIX][elc].push({ receiver: receiver, handler: handler }); //将作用域和函数push到指定事件下,触发事件时调用
};

/**
 * 连接事件和仅使用一次处理函数 处理函数执行一次后将被销毁
 * @method connectOnce
 * @param {Object}   senders   实例对象（单个或数组）
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * # 说明和例子
 * 参数说明参考上述connect函数，操作基本一样，差异在之后的内部实现
 *
 * 在事件下添加了一个once属性，之后的触发函数fireEvent会根据是否存在该属性判断是否删除事件
 *
 *     @example
 *     toot.connectOnce(txtB, "click", this, txtB.tclick);     // tclick函数在执行一次后会被销毁
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
 * 连接事件和仅使用一次处理函数 处理函数执行一次后将被销毁的内部实现
 * @method _connectOnce
 * @param {Object}   senders   实例对象
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * @private
 * 添加了一个once属性，之后的触发函数fireEvent会根据是否存在该属性判断是否删除该函数
 */
toot._connectOnce = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";

    sender[toot._EVENT_PREFIX][elc].push({ receiver: receiver, handler: handler, once: true });//添加了一个once属性，之后的触发函数fireEvent会根据是否存在该属性判断是否删除
};

/**
 * @method connectIfNo
 * 连接事件和处理函数连接之前，先销毁该事件目前已有的第一个相同处理函数
 * @param {Object}   senders   实例对象（单个或数组）
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * # 说明和例子
 * 为同一个事件连接相同函数时会删除已有的第一个相同函数，若连接的为不同的函数，则已有函数保留，触发事件时会执行全部函数
 *
 *     @example
 *     toot._connectIfNo(A,"show",this,this.play)
 *                                // 若show事件下存在相同作用域的play函数，会在删除原有play函数后连接新的play函数
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
 * 连接事件和处理函数连接之前，先销毁该事件目前已有第一个同名处理函数的内部实现
 * @param {Object}   senders   实例对象
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * @private
 */
toot._connectIfNo = function (sender, event, receiver, handler) {
    toot._disconnect(sender, event, receiver, handler);       //删除原有handle函数
    toot._connect(sender, event, receiver, handler);          //连接新的handle函数
};

/**
 * @method disconnect
 * 销毁事件和处理函数的关系
 * @param {Object}   senders   实例对象（单个或数组）
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * # 说明和例子
 * 删除senders中event事件的指定处理函数
 *
 *     @example
 *     toot.disconnect(A,"show",this,this.play) 
 *                               // 删除实例A下Show事件的play处理函数    
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
 * @param {Object}   senders   实例对象
 * @param {String}   event     事件类型（事件名）
 * @param {Object}   receiver  处理函数的this指向（作用域），如果为null可能导致异常
 * @param {Function} handler   处理函数
 * @private
 * 找到event事件下的handler函数删除，成功一次立即退出
 */
toot._disconnect = function (sender, event, receiver, handler) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        if (sender[toot._EVENT_PREFIX] && sender[toot._EVENT_PREFIX][elc]) {
            for (var i = 0, l = sender[toot._EVENT_PREFIX][elc].length; i < l; i++) {            //遍历event事件下的处理函数
                var handlerWrapper = sender[toot._EVENT_PREFIX][elc][i];
                if (handlerWrapper.receiver == receiver && handlerWrapper.handler == handler) {  //查找event下是否存在handle处理函数
                    sender[toot._EVENT_PREFIX][elc].splice(i, 1);                                //删除函数操作,删除成功退出循环
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
 * 销毁event事件和处理函数之间的关系
 * 将对每一个实例对象的同一事件与其下的处理函数断开连接
 * @param {Object} senders  实例对象（单个或数组）
 * @param {String} event    事件类型（事件名）
 * # 说明和例子
 * 删除senders下event事件中的所有处理函数
 *
 *     @example
 *     toot.disconnectAll(A,"show");
 *                         // 删除实例A下show事件的所有处理函数
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
 * 销毁event事件和处理函数之间的关系的内部实现
 * @param {Object} senders  实例对象（单个或数组）
 * @param {String} event    事件类型（事件名）
 * @private
 * 将sender对象的event事件下的所有处理函数清空
 */
toot._disconnectAll = function (sender, event) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {
        if (sender[toot._EVENT_PREFIX] && sender[toot._EVENT_PREFIX][elc]) {
            sender[toot._EVENT_PREFIX][elc] = [];                                 //删除event事件下的所有处理函数
        }
    }
    else
        throw sender + " has no " + event + " event";
}

/**
 * @method fireEvent
 * 触发事件 (绑定在该事件名上的所有处理函数)
 * @param {Object} senders 实例对象
 * @param {String} event   事件类型（事件名）
 * @param {Event}  e       事件参数 (指向html元素的原生事件对象)
 * # 说明和例子
 * 触发sender实例下event事件中的所有处理函数，作用域为event下的receiver属性
 *
 * fn.receiver ? fn.handler.call(fn.receiver, sender, e) : fn.handler(sender, e)
 *
 * 三目运算——判断receiver的作用域，存在则让作用域变成receiver作用域，为null则不作改变;
 *
 *     @example
 *     $(button).click(function(e){
 *           toot.fireEvent(A,"show", e);
 *      });                 // 点击button控件，会触发实例A下的show事件
 */
toot.fireEvent = function (sender, event, e) {
    var elc = event.toLowerCase();

    if (sender[toot._EVENT_PREFIX + elc]) {                                         //判断事件是否存在
        sender[toot._EVENT_PREFIX] = sender[toot._EVENT_PREFIX] || {};
        sender[toot._EVENT_PREFIX][elc] = sender[toot._EVENT_PREFIX][elc] || [];
    }
    else
        throw sender + " has no " + event + " event";                               //不存在，抛出异常

    var fns = sender[toot._EVENT_PREFIX][elc].concat([]);
    for (var i = 0; i < fns.length; i++) {
        var fn = fns[i];
        fn.receiver ? fn.handler.call(fn.receiver, sender, e) : fn.handler(sender, e);//判断receiver的作用域，存在则让作用域变成receiver作用域，为null则不作改变;
        if (fn.once)                                                                 //存在once属性，则执行一次后删除
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
