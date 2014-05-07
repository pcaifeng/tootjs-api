/******
Requires: toot
******/

try {
    if (toot.toot() != "toot")
        throw 0;
}
catch (ex) {
    var msg = "toot.lib requires toot";
    alert(msg);
    throw msg;
}

toot.lib = toot.lib || {};

toot.lib.Pool = function (ctor) {
    this._ctor = ctor
    this._members = [];
    this._initializers = null;
    this._disposers = null;
    this._isNewLastPoped = false;
}
toot.extendClass(toot.lib.Pool, {
    pop: function () {
        var member = null;
        if (this._members.length > 0) {
            member = this._members.pop();
            this._isNewLastPoped = false;
        }
        else {
            member = new this._ctor();
            this._isNewLastPoped = true;
        }
        if (this._initializers)
            for (var i = 0, l = this._initializers.length; i < l; i++)
                if (this._initializers[i])
                    this._initializers[i](member, this);

        return member;
    },
    push: function (member) {
        if (this._disposers)
            for (var i = 0, l = this._disposers.length; i < l; i++)
                if (this._disposers[i])
                    this._disposers[i](member, this);
        this._members.push(member);
    },

    isNewLastPoped: function () { return this._isNewLastPoped },

    getInitializer: function () { return this._initializers && this._initializers.length > 0 ? this._initializers[0] : null },
    setInitializer: function (initializer) { this._initializers = [initializer] },
    getInitializers: function () { return this._initializers },
    setInitializers: function (initializers) { this._initializers = initializers },

    getDisposer: function () { return this._disposers && this._disposers.length > 0 ? this._disposers[0] : null },
    setDisposer: function (disposer) { this._disposers = [disposer] },
    getDisposers: function () { return this._disposers },
    setDisposers: function (disposers) { this._disposers = disposers }
});


toot.lib.toot = function () {
    return "toot.lib";
};