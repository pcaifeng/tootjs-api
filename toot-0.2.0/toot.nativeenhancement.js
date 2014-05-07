if (!Array.prototype.indexOf) {
    Array.prototype.indexOf = function (item) {
        for (var i = 0, l = this.length; i < l; i++) {
            if (this[i] == item) return i;
        }
        return -1;
    };
};

if (!window.JSON)
    document.writeln('<script type="text/javascript" src="/content3/Scripts/json2.js"><\/script>');