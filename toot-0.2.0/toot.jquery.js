/******
Requires: jQuery 1.4.4
******/

try {
    if ($().jquery != "1.4.4")
        throw 0;
}
catch (ex) {
    var msg = "toot.jquery requires jQuery 1.4.4";
    alert(msg);
    throw msg;
}

toot = toot || {};
toot.jquery = {};

//Imports the jQuery object into toot and restores the global references.
toot.jquery.$ = $.noConflict(true);

//If empty, which means it's the first time the global variable occupied,
//it's fine to reset the jQuery reference for later use.
if (typeof $ == "undefined")
    $ = toot.jquery.$;
if (typeof jQuery == "undefined")
    jQuery = toot.jquery.$;


toot.jquery.toot = function () {
    return "toot.jquery";
}