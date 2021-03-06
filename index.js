var Mixin = require('@weddell/mixwith').Mixin;

var EventEmitterMixin = Mixin(function(superClass) {
    return class extends superClass {
        constructor(opts) {
            super(opts);
            Object.defineProperties(this, {
                _callbacks: {value: {}}
            });
        }

        on(eventName, callback) {
            if (Array.isArray(eventName)) {
                eventName.forEach(evName => this.on(evName, callback));
            } else {
                if (!(eventName in this._callbacks)) {
                    this._callbacks[eventName] = [];
                }
                this._callbacks[eventName] = this._callbacks[eventName].concat(callback);
            }
            return () => this.off(eventName, callback);
        }

        once(eventName, callback) {
            return this.on(eventName, function() {
                callback.apply(this, arguments);
                this.off(eventName, callback)
            });
        }

        off(eventName, callback) {
            if (Array.isArray(eventName)) {
                return eventName.map(off, callback);
            } else {
                if (eventName in this._callbacks) {
                    if (callback) {
                        var i = this._callbacks[eventName].indexOf(callback);
                        if (i > -1) {
                            this._callbacks[eventName].splice(i, 1);
                        }
                        if (!this._callbacks[eventName].length) {
                            delete this._callbacks[eventName];
                        }
                        return true;
                    }
                    delete this._callbacks[eventName];
                    return true;               
                }
                return false;
            }
        }

        trigger(eventName, eventObj, thisArg) {
            eventObj = Object.assign({}, eventObj, {eventName});
            if (Array.isArray(eventName)) {
                return eventName.map(evtName => this.trigger(evtName, eventObj, thisArg));
            } else {
                var cbs = eventName in this._callbacks ? this._callbacks[eventName] : [];
                return cbs.map(cb => cb.call(thisArg || this, eventObj));
            }
        }
    }
});

module.exports = EventEmitterMixin;
