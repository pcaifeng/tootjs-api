/******
Requires: toot and toot.jquery
******/

try {
    if (!(toot.toot() == "toot" && toot.jquery.toot() == "toot.jquery"))
        throw 0;
}
catch (ex) {
    var msg = "toot.ui requires toot, toot.jquery";
    alert(msg);
    throw msg;
}

toot.ui = toot.ui || {};


//Run the code in init function, so the code can still use $ directly
toot.ui._init = function ($) {

    toot.ui.textToHTML = function (text) {
        text = text.replace(/</g, "&lt;");
        text = text.replace(/>/g, "&gt;");

        text = text.replace(/ /g, "&nbsp;");
        text = text.replace(/\b&nbsp;/g, " ");
        text = text.replace(/\r\n|\r|\n/g, "<br>");
        return text;
    };

    toot.ui.Component = function (element) {
        this._element = element;
        this._parent = null;
        if (this.constructor == arguments.callee) this._init();
    };
    toot.defineEvent(toot.ui.Component, ["click", "dblclick", "change", "beforeChange"]);
    toot.extendClass(toot.ui.Component, {

        _init: function () {

            this._init_manageEvents();
            this._init_render();

        },
        _init_manageEvents: function () {
            var _this = this;
            $(this._element).click(function (e) {
                toot.fireEvent(_this, "click", e);
            });
            $(this._element).dblclick(function (e) {
                toot.fireEvent(_this, "dblclick", e);
            });
        },
        _init_render: function () {
            this._render();
        },
        _render: function () {
            this._renderVisible();
            this._renderZIndex();
        },

        _visible: true,
        isVisible: function () {
            return this._visible;
        },
        setVisible: function (visible, opt_force) {
            if (!(opt_force || this._visible != visible))
                return;
            this._visible = visible;
            this._renderVisible();
        },
        _renderVisible: function () {
            if (this._visible)
                $(this._element).show();
            else
                $(this._element).hide();
        },

        _zIndex: null,
        getZIndex: function () {
            return this._zIndex;
        },
        setZIndex: function (zIndex) {
            if (this._zIndex == zIndex) return;
            this._zIndex = zIndex;
            this._renderZIndex();
        },
        _renderZIndex: function () {
            if (this._zIndex == null) this._element.style.zIndex = "";
            else this._element.style.zIndex = this._zIndex + "";
        },

        getElement: function () {
            return this._element;
        },
        _textToHTML: function (text) {
            return toot.ui.textToHTML(text);
        },
        getParent: function () {
            return this._parent;
        },
        setParent: function (parent) {
            this._parent = parent;
        },

        appendTo: function (element) {
            element.appendChild(this._element);
        },
        replaceTo: function (element) {
            element.parentNode.replaceChild(this._element, element);
        },
        insertBefore: function (element) {
            element.parentNode.insertBefore(this._element, element);
        },
        removeFromParent: function () {
            if (this._element.parentNode)
                this._element.parentNode.removeChild(this._element);
        }
    });


    toot.ui.Label = function (element) {
        toot.ui.Component.call(this, element);
        this._text = "";
        if (this.constructor == arguments.callee) this._init();
    };
    toot.inherit(toot.ui.Label, toot.ui.Component);
    toot.extendClass(toot.ui.Label, {

        _render: function () {
            toot.ui.Label.superClass._render.call(this);
            this._renderText();
        },

        getText: function () {
            return this._text;
        },
        setText: function (text) {
            if (text == null) this._text = "";
            else this._text = text + "";

            this._renderText();
        },
        _renderText: function () {
            if (this._text)
                this._element.innerHTML = this._textToHTML(this._text);
            else
                this._element.innerHTML = "&nbsp;";
        }
    });


    toot.ui.TextBoxType = {
        SingleLine: 0,
        MultiLine: 1
    };

    toot.ui.TextBoxState = {
        Enabled: 0,
        Readonly: 1,
        Disabled: 2
    }

    toot.ui.TextBox = function (txtElement) {
        toot.ui.Component.call(this, txtElement);
        if (this._element.nodeName.toLowerCase() == "input" && txtElement.type.toLowerCase() == "text")
            this._textBoxType = toot.ui.TextBoxType.SingleLine;
        else if (this._element.nodeName.toLowerCase() == "textarea")
            this._textBoxType = toot.ui.TextBoxType.MultiLine;
        else
            throw "wrong element type";
        this._validationHightlightedStyleConfig = null;
        if (this.constructor == arguments.callee) this._init();
    }
    toot.inherit(toot.ui.TextBox, toot.ui.Component);
    toot.extendClass(toot.ui.TextBox, {

        _init_manageEvents: function () {
            toot.ui.TextBox.superClass._init_manageEvents.call(this);
            var _this = this;
            $(this._element).bind("change", function () {
                toot.fireEvent(_this, "change");
            });
        },
        _init_render: function () {
            this._render();
            this.setValue(null);
        },

        _render: function () {
            toot.ui.TextBox.superClass._render.call(this);
            this._renderState();
            this._renderValidationHightlighted();
        },


        getTextBoxType: function () {
            return this._textBoxType;
        },

        _state: toot.ui.TextBoxState.Enabled,
        getState: function () {
            return this._state;
        },
        setState: function (state) {
            if (this._state == state)
                return;
            this._state = state;
            this._renderState();
        },
        _renderState: function () {
            if (this._state == toot.ui.TextBoxState.Enabled) {
                this._element.disabled = false;
                $(this._element).removeAttr("readonly");
            }
            else if (this._state == toot.ui.TextBoxState.Readonly) {
                this._element.disabled = false;
                $(this._element).attr("readonly", "readonly");
            }
            else if (this._state == toot.ui.TextBoxState.Disabled) {
                $(this._element).get(0).disabled = true;
            }
        },

        getValue: function () {
            //            // === "" detection for ie bug
            return this._element.value === "" ? "" : this._element.value;
        },
        setValue: function (value) {
            if (value == null) this._element.value = "";
            else this._element.value = value + "";
        },

        setFocused: function (focus) {
            if (focus)
                this._element.focus();
            else
                this._element.blur();
        },
        setSelect: function () {
            this._element.select();
        },

        _validationHightlighted: false,
        isValidationHighlighted: function () {
            return this._validationHightlighted;
        },
        setValidationHightlighted: function (highlight) {
            this._validationHightlighted = highlight;
            this._renderValidationHightlighted();
        },
        _renderValidationHightlighted: function () {
            if (this._validationHightlightedStyleConfig) {
                if (this._validationHightlighted)
                    $(this._element).removeClass(this._validationHightlightedStyleConfig.closed).addClass(this._validationHightlightedStyleConfig.open);
                else
                    $(this._element).removeClass(this._validationHightlightedStyleConfig.open).addClass(this._validationHightlightedStyleConfig.closed);
            }
        },
        setValidationHightlightedStyleConfig: function (config) {
            this._validationHightlightedStyleConfig = config;
            this._renderValidationHightlighted();
        }
    });



    toot.ui.Control = function (element) {
        toot.ui.Component.call(this, element);
        if (this._element.nodeName.toLowerCase() == "a")
            this._element.href = "javascript:;";
        if (this.constructor == arguments.callee) this._init();
    };
    toot.inherit(toot.ui.Control, toot.ui.Component);
    toot.defineEvent(toot.ui.Control, "action");
    toot.extendClass(toot.ui.Control, {

        _init_manageEvents: function () {
            toot.ui.Control.superClass._init_manageEvents.call(this);
            var _this = this;
            $(this._element).click(function (e) {
                if (_this._enabled)
                    toot.fireEvent(_this, "action", e);
            });
        },
        _render: function () {
            toot.ui.Control.superClass._render.call(this);
            this._renderEnabled();
        },

        _enabled: true,
        isEnabled: function () {
            return this._enabled;
        },
        setEnabled: function (enable) {
            if (this._enabled == enable) return;
            this._enabled = enable;
            this._renderEnabled();
        },
        _renderEnabled: function () { }
    });


    toot.ui.Button = function (element) {
        toot.ui.Control.call(this, element);
        this._enabledStyleConfig = null;
        if (this.constructor == arguments.callee) this._init();
    };
    toot.inherit(toot.ui.Button, toot.ui.Control);
    toot.extendClass(toot.ui.Button, {
        setEnabledStyleConfig: function (config) {
            this._enabledStyleConfig = config;
            this._renderEnabled();
        },
        _renderEnabled: function () {
            if (this._enabledStyleConfig) {
                if (this._enabled)
                    $(this._element).removeClass(this._enabledStyleConfig.disabled).addClass(this._enabledStyleConfig.enabled);
                else
                    $(this._element).removeClass(this._enabledStyleConfig.enabled).addClass(this._enabledStyleConfig.disabled);
            }
        }
    });

    toot.ui.MenuItem = function (element) {
        toot.ui.Control.call(this, element);
    };
    toot.inherit(toot.ui.MenuItem, toot.ui.Control);
    //    toot.extendClass(toot.ui.MenuItem, {
    //});


};

toot.ui._init(toot.jquery.$);

toot.ui.toot = function () {
    return "toot.ui";
}