// modules are defined as an array
// [ module function, map of requires ]
//
// map of requires is short require name -> numeric require
//
// anything defined in a previous bundle is accessed via the
// orig method which is the require for previous bundles
parcelRequire = (function (modules, cache, entry, globalName) {
  // Save the require from previous bundle to this closure if any
  var previousRequire = typeof parcelRequire === 'function' && parcelRequire;
  var nodeRequire = typeof require === 'function' && require;

  function newRequire(name, jumped) {
    if (!cache[name]) {
      if (!modules[name]) {
        // if we cannot find the module within our internal map or
        // cache jump to the current global require ie. the last bundle
        // that was added to the page.
        var currentRequire = typeof parcelRequire === 'function' && parcelRequire;
        if (!jumped && currentRequire) {
          return currentRequire(name, true);
        }

        // If there are other bundles on this page the require from the
        // previous one is saved to 'previousRequire'. Repeat this as
        // many times as there are bundles until the module is found or
        // we exhaust the require chain.
        if (previousRequire) {
          return previousRequire(name, true);
        }

        // Try the node require function if it exists.
        if (nodeRequire && typeof name === 'string') {
          return nodeRequire(name);
        }

        var err = new Error('Cannot find module \'' + name + '\'');
        err.code = 'MODULE_NOT_FOUND';
        throw err;
      }

      localRequire.resolve = resolve;
      localRequire.cache = {};

      var module = cache[name] = new newRequire.Module(name);

      modules[name][0].call(module.exports, localRequire, module, module.exports, this);
    }

    return cache[name].exports;

    function localRequire(x){
      return newRequire(localRequire.resolve(x));
    }

    function resolve(x){
      return modules[name][1][x] || x;
    }
  }

  function Module(moduleName) {
    this.id = moduleName;
    this.bundle = newRequire;
    this.exports = {};
  }

  newRequire.isParcelRequire = true;
  newRequire.Module = Module;
  newRequire.modules = modules;
  newRequire.cache = cache;
  newRequire.parent = previousRequire;
  newRequire.register = function (id, exports) {
    modules[id] = [function (require, module) {
      module.exports = exports;
    }, {}];
  };

  var error;
  for (var i = 0; i < entry.length; i++) {
    try {
      newRequire(entry[i]);
    } catch (e) {
      // Save first error but execute all entries
      if (!error) {
        error = e;
      }
    }
  }

  if (entry.length) {
    // Expose entry point to Node, AMD or browser globals
    // Based on https://github.com/ForbesLindesay/umd/blob/master/template.js
    var mainExports = newRequire(entry[entry.length - 1]);

    // CommonJS
    if (typeof exports === "object" && typeof module !== "undefined") {
      module.exports = mainExports;

    // RequireJS
    } else if (typeof define === "function" && define.amd) {
     define(function () {
       return mainExports;
     });

    // <script>
    } else if (globalName) {
      this[globalName] = mainExports;
    }
  }

  // Override the current require with this new one
  parcelRequire = newRequire;

  if (error) {
    // throw error from earlier, _after updating parcelRequire_
    throw error;
  }

  return newRequire;
})({"../node_modules/events/events.js":[function(require,module,exports) {
// Copyright Joyent, Inc. and other Node contributors.
//
// Permission is hereby granted, free of charge, to any person obtaining a
// copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to permit
// persons to whom the Software is furnished to do so, subject to the
// following conditions:
//
// The above copyright notice and this permission notice shall be included
// in all copies or substantial portions of the Software.
//
// THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS
// OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN
// NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
// DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR
// OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE
// USE OR OTHER DEALINGS IN THE SOFTWARE.
'use strict';

var R = typeof Reflect === 'object' ? Reflect : null;
var ReflectApply = R && typeof R.apply === 'function' ? R.apply : function ReflectApply(target, receiver, args) {
  return Function.prototype.apply.call(target, receiver, args);
};
var ReflectOwnKeys;

if (R && typeof R.ownKeys === 'function') {
  ReflectOwnKeys = R.ownKeys;
} else if (Object.getOwnPropertySymbols) {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target).concat(Object.getOwnPropertySymbols(target));
  };
} else {
  ReflectOwnKeys = function ReflectOwnKeys(target) {
    return Object.getOwnPropertyNames(target);
  };
}

function ProcessEmitWarning(warning) {
  if (console && console.warn) console.warn(warning);
}

var NumberIsNaN = Number.isNaN || function NumberIsNaN(value) {
  return value !== value;
};

function EventEmitter() {
  EventEmitter.init.call(this);
}

module.exports = EventEmitter; // Backwards-compat with node 0.10.x

EventEmitter.EventEmitter = EventEmitter;
EventEmitter.prototype._events = undefined;
EventEmitter.prototype._eventsCount = 0;
EventEmitter.prototype._maxListeners = undefined; // By default EventEmitters will print a warning if more than 10 listeners are
// added to it. This is a useful default which helps finding memory leaks.

var defaultMaxListeners = 10;

function checkListener(listener) {
  if (typeof listener !== 'function') {
    throw new TypeError('The "listener" argument must be of type Function. Received type ' + typeof listener);
  }
}

Object.defineProperty(EventEmitter, 'defaultMaxListeners', {
  enumerable: true,
  get: function () {
    return defaultMaxListeners;
  },
  set: function (arg) {
    if (typeof arg !== 'number' || arg < 0 || NumberIsNaN(arg)) {
      throw new RangeError('The value of "defaultMaxListeners" is out of range. It must be a non-negative number. Received ' + arg + '.');
    }

    defaultMaxListeners = arg;
  }
});

EventEmitter.init = function () {
  if (this._events === undefined || this._events === Object.getPrototypeOf(this)._events) {
    this._events = Object.create(null);
    this._eventsCount = 0;
  }

  this._maxListeners = this._maxListeners || undefined;
}; // Obviously not all Emitters should be limited to 10. This function allows
// that to be increased. Set to zero for unlimited.


EventEmitter.prototype.setMaxListeners = function setMaxListeners(n) {
  if (typeof n !== 'number' || n < 0 || NumberIsNaN(n)) {
    throw new RangeError('The value of "n" is out of range. It must be a non-negative number. Received ' + n + '.');
  }

  this._maxListeners = n;
  return this;
};

function _getMaxListeners(that) {
  if (that._maxListeners === undefined) return EventEmitter.defaultMaxListeners;
  return that._maxListeners;
}

EventEmitter.prototype.getMaxListeners = function getMaxListeners() {
  return _getMaxListeners(this);
};

EventEmitter.prototype.emit = function emit(type) {
  var args = [];

  for (var i = 1; i < arguments.length; i++) args.push(arguments[i]);

  var doError = type === 'error';
  var events = this._events;
  if (events !== undefined) doError = doError && events.error === undefined;else if (!doError) return false; // If there is no 'error' event listener then throw.

  if (doError) {
    var er;
    if (args.length > 0) er = args[0];

    if (er instanceof Error) {
      // Note: The comments on the `throw` lines are intentional, they show
      // up in Node's output if this results in an unhandled exception.
      throw er; // Unhandled 'error' event
    } // At least give some kind of context to the user


    var err = new Error('Unhandled error.' + (er ? ' (' + er.message + ')' : ''));
    err.context = er;
    throw err; // Unhandled 'error' event
  }

  var handler = events[type];
  if (handler === undefined) return false;

  if (typeof handler === 'function') {
    ReflectApply(handler, this, args);
  } else {
    var len = handler.length;
    var listeners = arrayClone(handler, len);

    for (var i = 0; i < len; ++i) ReflectApply(listeners[i], this, args);
  }

  return true;
};

function _addListener(target, type, listener, prepend) {
  var m;
  var events;
  var existing;
  checkListener(listener);
  events = target._events;

  if (events === undefined) {
    events = target._events = Object.create(null);
    target._eventsCount = 0;
  } else {
    // To avoid recursion in the case that type === "newListener"! Before
    // adding it to the listeners, first emit "newListener".
    if (events.newListener !== undefined) {
      target.emit('newListener', type, listener.listener ? listener.listener : listener); // Re-assign `events` because a newListener handler could have caused the
      // this._events to be assigned to a new object

      events = target._events;
    }

    existing = events[type];
  }

  if (existing === undefined) {
    // Optimize the case of one listener. Don't need the extra array object.
    existing = events[type] = listener;
    ++target._eventsCount;
  } else {
    if (typeof existing === 'function') {
      // Adding the second element, need to change to array.
      existing = events[type] = prepend ? [listener, existing] : [existing, listener]; // If we've already got an array, just append.
    } else if (prepend) {
      existing.unshift(listener);
    } else {
      existing.push(listener);
    } // Check for listener leak


    m = _getMaxListeners(target);

    if (m > 0 && existing.length > m && !existing.warned) {
      existing.warned = true; // No error code for this since it is a Warning
      // eslint-disable-next-line no-restricted-syntax

      var w = new Error('Possible EventEmitter memory leak detected. ' + existing.length + ' ' + String(type) + ' listeners ' + 'added. Use emitter.setMaxListeners() to ' + 'increase limit');
      w.name = 'MaxListenersExceededWarning';
      w.emitter = target;
      w.type = type;
      w.count = existing.length;
      ProcessEmitWarning(w);
    }
  }

  return target;
}

EventEmitter.prototype.addListener = function addListener(type, listener) {
  return _addListener(this, type, listener, false);
};

EventEmitter.prototype.on = EventEmitter.prototype.addListener;

EventEmitter.prototype.prependListener = function prependListener(type, listener) {
  return _addListener(this, type, listener, true);
};

function onceWrapper() {
  if (!this.fired) {
    this.target.removeListener(this.type, this.wrapFn);
    this.fired = true;
    if (arguments.length === 0) return this.listener.call(this.target);
    return this.listener.apply(this.target, arguments);
  }
}

function _onceWrap(target, type, listener) {
  var state = {
    fired: false,
    wrapFn: undefined,
    target: target,
    type: type,
    listener: listener
  };
  var wrapped = onceWrapper.bind(state);
  wrapped.listener = listener;
  state.wrapFn = wrapped;
  return wrapped;
}

EventEmitter.prototype.once = function once(type, listener) {
  checkListener(listener);
  this.on(type, _onceWrap(this, type, listener));
  return this;
};

EventEmitter.prototype.prependOnceListener = function prependOnceListener(type, listener) {
  checkListener(listener);
  this.prependListener(type, _onceWrap(this, type, listener));
  return this;
}; // Emits a 'removeListener' event if and only if the listener was removed.


EventEmitter.prototype.removeListener = function removeListener(type, listener) {
  var list, events, position, i, originalListener;
  checkListener(listener);
  events = this._events;
  if (events === undefined) return this;
  list = events[type];
  if (list === undefined) return this;

  if (list === listener || list.listener === listener) {
    if (--this._eventsCount === 0) this._events = Object.create(null);else {
      delete events[type];
      if (events.removeListener) this.emit('removeListener', type, list.listener || listener);
    }
  } else if (typeof list !== 'function') {
    position = -1;

    for (i = list.length - 1; i >= 0; i--) {
      if (list[i] === listener || list[i].listener === listener) {
        originalListener = list[i].listener;
        position = i;
        break;
      }
    }

    if (position < 0) return this;
    if (position === 0) list.shift();else {
      spliceOne(list, position);
    }
    if (list.length === 1) events[type] = list[0];
    if (events.removeListener !== undefined) this.emit('removeListener', type, originalListener || listener);
  }

  return this;
};

EventEmitter.prototype.off = EventEmitter.prototype.removeListener;

EventEmitter.prototype.removeAllListeners = function removeAllListeners(type) {
  var listeners, events, i;
  events = this._events;
  if (events === undefined) return this; // not listening for removeListener, no need to emit

  if (events.removeListener === undefined) {
    if (arguments.length === 0) {
      this._events = Object.create(null);
      this._eventsCount = 0;
    } else if (events[type] !== undefined) {
      if (--this._eventsCount === 0) this._events = Object.create(null);else delete events[type];
    }

    return this;
  } // emit removeListener for all listeners on all events


  if (arguments.length === 0) {
    var keys = Object.keys(events);
    var key;

    for (i = 0; i < keys.length; ++i) {
      key = keys[i];
      if (key === 'removeListener') continue;
      this.removeAllListeners(key);
    }

    this.removeAllListeners('removeListener');
    this._events = Object.create(null);
    this._eventsCount = 0;
    return this;
  }

  listeners = events[type];

  if (typeof listeners === 'function') {
    this.removeListener(type, listeners);
  } else if (listeners !== undefined) {
    // LIFO order
    for (i = listeners.length - 1; i >= 0; i--) {
      this.removeListener(type, listeners[i]);
    }
  }

  return this;
};

function _listeners(target, type, unwrap) {
  var events = target._events;
  if (events === undefined) return [];
  var evlistener = events[type];
  if (evlistener === undefined) return [];
  if (typeof evlistener === 'function') return unwrap ? [evlistener.listener || evlistener] : [evlistener];
  return unwrap ? unwrapListeners(evlistener) : arrayClone(evlistener, evlistener.length);
}

EventEmitter.prototype.listeners = function listeners(type) {
  return _listeners(this, type, true);
};

EventEmitter.prototype.rawListeners = function rawListeners(type) {
  return _listeners(this, type, false);
};

EventEmitter.listenerCount = function (emitter, type) {
  if (typeof emitter.listenerCount === 'function') {
    return emitter.listenerCount(type);
  } else {
    return listenerCount.call(emitter, type);
  }
};

EventEmitter.prototype.listenerCount = listenerCount;

function listenerCount(type) {
  var events = this._events;

  if (events !== undefined) {
    var evlistener = events[type];

    if (typeof evlistener === 'function') {
      return 1;
    } else if (evlistener !== undefined) {
      return evlistener.length;
    }
  }

  return 0;
}

EventEmitter.prototype.eventNames = function eventNames() {
  return this._eventsCount > 0 ? ReflectOwnKeys(this._events) : [];
};

function arrayClone(arr, n) {
  var copy = new Array(n);

  for (var i = 0; i < n; ++i) copy[i] = arr[i];

  return copy;
}

function spliceOne(list, index) {
  for (; index + 1 < list.length; index++) list[index] = list[index + 1];

  list.pop();
}

function unwrapListeners(arr) {
  var ret = new Array(arr.length);

  for (var i = 0; i < ret.length; ++i) {
    ret[i] = arr[i].listener || arr[i];
  }

  return ret;
}
},{}],"../node_modules/reconnecting-websocket/dist/reconnecting-websocket-mjs.js":[function(require,module,exports) {
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;

/*! *****************************************************************************
Copyright (c) Microsoft Corporation. All rights reserved.
Licensed under the Apache License, Version 2.0 (the "License"); you may not use
this file except in compliance with the License. You may obtain a copy of the
License at http://www.apache.org/licenses/LICENSE-2.0

THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
MERCHANTABLITY OR NON-INFRINGEMENT.

See the Apache Version 2.0 License for specific language governing permissions
and limitations under the License.
***************************************************************************** */

/* global Reflect, Promise */
var extendStatics = function (d, b) {
  extendStatics = Object.setPrototypeOf || {
    __proto__: []
  } instanceof Array && function (d, b) {
    d.__proto__ = b;
  } || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
  };

  return extendStatics(d, b);
};

function __extends(d, b) {
  extendStatics(d, b);

  function __() {
    this.constructor = d;
  }

  d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
}

function __values(o) {
  var m = typeof Symbol === "function" && o[Symbol.iterator],
      i = 0;
  if (m) return m.call(o);
  return {
    next: function () {
      if (o && i >= o.length) o = void 0;
      return {
        value: o && o[i++],
        done: !o
      };
    }
  };
}

function __read(o, n) {
  var m = typeof Symbol === "function" && o[Symbol.iterator];
  if (!m) return o;
  var i = m.call(o),
      r,
      ar = [],
      e;

  try {
    while ((n === void 0 || n-- > 0) && !(r = i.next()).done) ar.push(r.value);
  } catch (error) {
    e = {
      error: error
    };
  } finally {
    try {
      if (r && !r.done && (m = i["return"])) m.call(i);
    } finally {
      if (e) throw e.error;
    }
  }

  return ar;
}

function __spread() {
  for (var ar = [], i = 0; i < arguments.length; i++) ar = ar.concat(__read(arguments[i]));

  return ar;
}

var Event =
/** @class */
function () {
  function Event(type, target) {
    this.target = target;
    this.type = type;
  }

  return Event;
}();

var ErrorEvent =
/** @class */
function (_super) {
  __extends(ErrorEvent, _super);

  function ErrorEvent(error, target) {
    var _this = _super.call(this, 'error', target) || this;

    _this.message = error.message;
    _this.error = error;
    return _this;
  }

  return ErrorEvent;
}(Event);

var CloseEvent =
/** @class */
function (_super) {
  __extends(CloseEvent, _super);

  function CloseEvent(code, reason, target) {
    if (code === void 0) {
      code = 1000;
    }

    if (reason === void 0) {
      reason = '';
    }

    var _this = _super.call(this, 'close', target) || this;

    _this.wasClean = true;
    _this.code = code;
    _this.reason = reason;
    return _this;
  }

  return CloseEvent;
}(Event);
/*!
 * Reconnecting WebSocket
 * by Pedro Ladaria <pedro.ladaria@gmail.com>
 * https://github.com/pladaria/reconnecting-websocket
 * License MIT
 */


var getGlobalWebSocket = function () {
  if (typeof WebSocket !== 'undefined') {
    // @ts-ignore
    return WebSocket;
  }
};
/**
 * Returns true if given argument looks like a WebSocket class
 */


var isWebSocket = function (w) {
  return typeof w !== 'undefined' && !!w && w.CLOSING === 2;
};

var DEFAULT = {
  maxReconnectionDelay: 10000,
  minReconnectionDelay: 1000 + Math.random() * 4000,
  minUptime: 5000,
  reconnectionDelayGrowFactor: 1.3,
  connectionTimeout: 4000,
  maxRetries: Infinity,
  maxEnqueuedMessages: Infinity,
  startClosed: false,
  debug: false
};

var ReconnectingWebSocket =
/** @class */
function () {
  function ReconnectingWebSocket(url, protocols, options) {
    var _this = this;

    if (options === void 0) {
      options = {};
    }

    this._listeners = {
      error: [],
      message: [],
      open: [],
      close: []
    };
    this._retryCount = -1;
    this._shouldReconnect = true;
    this._connectLock = false;
    this._binaryType = 'blob';
    this._closeCalled = false;
    this._messageQueue = [];
    /**
     * An event listener to be called when the WebSocket connection's readyState changes to CLOSED
     */

    this.onclose = null;
    /**
     * An event listener to be called when an error occurs
     */

    this.onerror = null;
    /**
     * An event listener to be called when a message is received from the server
     */

    this.onmessage = null;
    /**
     * An event listener to be called when the WebSocket connection's readyState changes to OPEN;
     * this indicates that the connection is ready to send and receive data
     */

    this.onopen = null;

    this._handleOpen = function (event) {
      _this._debug('open event');

      var _a = _this._options.minUptime,
          minUptime = _a === void 0 ? DEFAULT.minUptime : _a;
      clearTimeout(_this._connectTimeout);
      _this._uptimeTimeout = setTimeout(function () {
        return _this._acceptOpen();
      }, minUptime);
      _this._ws.binaryType = _this._binaryType; // send enqueued messages (messages sent before websocket open event)

      _this._messageQueue.forEach(function (message) {
        return _this._ws.send(message);
      });

      _this._messageQueue = [];

      if (_this.onopen) {
        _this.onopen(event);
      }

      _this._listeners.open.forEach(function (listener) {
        return _this._callEventListener(event, listener);
      });
    };

    this._handleMessage = function (event) {
      _this._debug('message event');

      if (_this.onmessage) {
        _this.onmessage(event);
      }

      _this._listeners.message.forEach(function (listener) {
        return _this._callEventListener(event, listener);
      });
    };

    this._handleError = function (event) {
      _this._debug('error event', event.message);

      _this._disconnect(undefined, event.message === 'TIMEOUT' ? 'timeout' : undefined);

      if (_this.onerror) {
        _this.onerror(event);
      }

      _this._debug('exec error listeners');

      _this._listeners.error.forEach(function (listener) {
        return _this._callEventListener(event, listener);
      });

      _this._connect();
    };

    this._handleClose = function (event) {
      _this._debug('close event');

      _this._clearTimeouts();

      if (_this._shouldReconnect) {
        _this._connect();
      }

      if (_this.onclose) {
        _this.onclose(event);
      }

      _this._listeners.close.forEach(function (listener) {
        return _this._callEventListener(event, listener);
      });
    };

    this._url = url;
    this._protocols = protocols;
    this._options = options;

    if (this._options.startClosed) {
      this._shouldReconnect = false;
    }

    this._connect();
  }

  Object.defineProperty(ReconnectingWebSocket, "CONNECTING", {
    get: function () {
      return 0;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket, "OPEN", {
    get: function () {
      return 1;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket, "CLOSING", {
    get: function () {
      return 2;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket, "CLOSED", {
    get: function () {
      return 3;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "CONNECTING", {
    get: function () {
      return ReconnectingWebSocket.CONNECTING;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "OPEN", {
    get: function () {
      return ReconnectingWebSocket.OPEN;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSING", {
    get: function () {
      return ReconnectingWebSocket.CLOSING;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "CLOSED", {
    get: function () {
      return ReconnectingWebSocket.CLOSED;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "binaryType", {
    get: function () {
      return this._ws ? this._ws.binaryType : this._binaryType;
    },
    set: function (value) {
      this._binaryType = value;

      if (this._ws) {
        this._ws.binaryType = value;
      }
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "retryCount", {
    /**
     * Returns the number or connection retries
     */
    get: function () {
      return Math.max(this._retryCount, 0);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "bufferedAmount", {
    /**
     * The number of bytes of data that have been queued using calls to send() but not yet
     * transmitted to the network. This value resets to zero once all queued data has been sent.
     * This value does not reset to zero when the connection is closed; if you keep calling send(),
     * this will continue to climb. Read only
     */
    get: function () {
      var bytes = this._messageQueue.reduce(function (acc, message) {
        if (typeof message === 'string') {
          acc += message.length; // not byte size
        } else if (message instanceof Blob) {
          acc += message.size;
        } else {
          acc += message.byteLength;
        }

        return acc;
      }, 0);

      return bytes + (this._ws ? this._ws.bufferedAmount : 0);
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "extensions", {
    /**
     * The extensions selected by the server. This is currently only the empty string or a list of
     * extensions as negotiated by the connection
     */
    get: function () {
      return this._ws ? this._ws.extensions : '';
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "protocol", {
    /**
     * A string indicating the name of the sub-protocol the server selected;
     * this will be one of the strings specified in the protocols parameter when creating the
     * WebSocket object
     */
    get: function () {
      return this._ws ? this._ws.protocol : '';
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "readyState", {
    /**
     * The current state of the connection; this is one of the Ready state constants
     */
    get: function () {
      if (this._ws) {
        return this._ws.readyState;
      }

      return this._options.startClosed ? ReconnectingWebSocket.CLOSED : ReconnectingWebSocket.CONNECTING;
    },
    enumerable: true,
    configurable: true
  });
  Object.defineProperty(ReconnectingWebSocket.prototype, "url", {
    /**
     * The URL as resolved by the constructor
     */
    get: function () {
      return this._ws ? this._ws.url : '';
    },
    enumerable: true,
    configurable: true
  });
  /**
   * Closes the WebSocket connection or connection attempt, if any. If the connection is already
   * CLOSED, this method does nothing
   */

  ReconnectingWebSocket.prototype.close = function (code, reason) {
    if (code === void 0) {
      code = 1000;
    }

    this._closeCalled = true;
    this._shouldReconnect = false;

    this._clearTimeouts();

    if (!this._ws) {
      this._debug('close enqueued: no ws instance');

      return;
    }

    if (this._ws.readyState === this.CLOSED) {
      this._debug('close: already closed');

      return;
    }

    this._ws.close(code, reason);
  };
  /**
   * Closes the WebSocket connection or connection attempt and connects again.
   * Resets retry counter;
   */


  ReconnectingWebSocket.prototype.reconnect = function (code, reason) {
    this._shouldReconnect = true;
    this._closeCalled = false;
    this._retryCount = -1;

    if (!this._ws || this._ws.readyState === this.CLOSED) {
      this._connect();
    } else {
      this._disconnect(code, reason);

      this._connect();
    }
  };
  /**
   * Enqueue specified data to be transmitted to the server over the WebSocket connection
   */


  ReconnectingWebSocket.prototype.send = function (data) {
    if (this._ws && this._ws.readyState === this.OPEN) {
      this._debug('send', data);

      this._ws.send(data);
    } else {
      var _a = this._options.maxEnqueuedMessages,
          maxEnqueuedMessages = _a === void 0 ? DEFAULT.maxEnqueuedMessages : _a;

      if (this._messageQueue.length < maxEnqueuedMessages) {
        this._debug('enqueue', data);

        this._messageQueue.push(data);
      }
    }
  };
  /**
   * Register an event handler of a specific event type
   */


  ReconnectingWebSocket.prototype.addEventListener = function (type, listener) {
    if (this._listeners[type]) {
      // @ts-ignore
      this._listeners[type].push(listener);
    }
  };

  ReconnectingWebSocket.prototype.dispatchEvent = function (event) {
    var e_1, _a;

    var listeners = this._listeners[event.type];

    if (listeners) {
      try {
        for (var listeners_1 = __values(listeners), listeners_1_1 = listeners_1.next(); !listeners_1_1.done; listeners_1_1 = listeners_1.next()) {
          var listener = listeners_1_1.value;

          this._callEventListener(event, listener);
        }
      } catch (e_1_1) {
        e_1 = {
          error: e_1_1
        };
      } finally {
        try {
          if (listeners_1_1 && !listeners_1_1.done && (_a = listeners_1.return)) _a.call(listeners_1);
        } finally {
          if (e_1) throw e_1.error;
        }
      }
    }

    return true;
  };
  /**
   * Removes an event listener
   */


  ReconnectingWebSocket.prototype.removeEventListener = function (type, listener) {
    if (this._listeners[type]) {
      // @ts-ignore
      this._listeners[type] = this._listeners[type].filter(function (l) {
        return l !== listener;
      });
    }
  };

  ReconnectingWebSocket.prototype._debug = function () {
    var args = [];

    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }

    if (this._options.debug) {
      // not using spread because compiled version uses Symbols
      // tslint:disable-next-line
      console.log.apply(console, __spread(['RWS>'], args));
    }
  };

  ReconnectingWebSocket.prototype._getNextDelay = function () {
    var _a = this._options,
        _b = _a.reconnectionDelayGrowFactor,
        reconnectionDelayGrowFactor = _b === void 0 ? DEFAULT.reconnectionDelayGrowFactor : _b,
        _c = _a.minReconnectionDelay,
        minReconnectionDelay = _c === void 0 ? DEFAULT.minReconnectionDelay : _c,
        _d = _a.maxReconnectionDelay,
        maxReconnectionDelay = _d === void 0 ? DEFAULT.maxReconnectionDelay : _d;
    var delay = 0;

    if (this._retryCount > 0) {
      delay = minReconnectionDelay * Math.pow(reconnectionDelayGrowFactor, this._retryCount - 1);

      if (delay > maxReconnectionDelay) {
        delay = maxReconnectionDelay;
      }
    }

    this._debug('next delay', delay);

    return delay;
  };

  ReconnectingWebSocket.prototype._wait = function () {
    var _this = this;

    return new Promise(function (resolve) {
      setTimeout(resolve, _this._getNextDelay());
    });
  };

  ReconnectingWebSocket.prototype._getNextUrl = function (urlProvider) {
    if (typeof urlProvider === 'string') {
      return Promise.resolve(urlProvider);
    }

    if (typeof urlProvider === 'function') {
      var url = urlProvider();

      if (typeof url === 'string') {
        return Promise.resolve(url);
      }

      if (!!url.then) {
        return url;
      }
    }

    throw Error('Invalid URL');
  };

  ReconnectingWebSocket.prototype._connect = function () {
    var _this = this;

    if (this._connectLock || !this._shouldReconnect) {
      return;
    }

    this._connectLock = true;
    var _a = this._options,
        _b = _a.maxRetries,
        maxRetries = _b === void 0 ? DEFAULT.maxRetries : _b,
        _c = _a.connectionTimeout,
        connectionTimeout = _c === void 0 ? DEFAULT.connectionTimeout : _c,
        _d = _a.WebSocket,
        WebSocket = _d === void 0 ? getGlobalWebSocket() : _d;

    if (this._retryCount >= maxRetries) {
      this._debug('max retries reached', this._retryCount, '>=', maxRetries);

      return;
    }

    this._retryCount++;

    this._debug('connect', this._retryCount);

    this._removeListeners();

    if (!isWebSocket(WebSocket)) {
      throw Error('No valid WebSocket class provided');
    }

    this._wait().then(function () {
      return _this._getNextUrl(_this._url);
    }).then(function (url) {
      // close could be called before creating the ws
      if (_this._closeCalled) {
        return;
      }

      _this._debug('connect', {
        url: url,
        protocols: _this._protocols
      });

      _this._ws = _this._protocols ? new WebSocket(url, _this._protocols) : new WebSocket(url);
      _this._ws.binaryType = _this._binaryType;
      _this._connectLock = false;

      _this._addListeners();

      _this._connectTimeout = setTimeout(function () {
        return _this._handleTimeout();
      }, connectionTimeout);
    });
  };

  ReconnectingWebSocket.prototype._handleTimeout = function () {
    this._debug('timeout event');

    this._handleError(new ErrorEvent(Error('TIMEOUT'), this));
  };

  ReconnectingWebSocket.prototype._disconnect = function (code, reason) {
    if (code === void 0) {
      code = 1000;
    }

    this._clearTimeouts();

    if (!this._ws) {
      return;
    }

    this._removeListeners();

    try {
      this._ws.close(code, reason);

      this._handleClose(new CloseEvent(code, reason, this));
    } catch (error) {// ignore
    }
  };

  ReconnectingWebSocket.prototype._acceptOpen = function () {
    this._debug('accept open');

    this._retryCount = 0;
  };

  ReconnectingWebSocket.prototype._callEventListener = function (event, listener) {
    if ('handleEvent' in listener) {
      // @ts-ignore
      listener.handleEvent(event);
    } else {
      // @ts-ignore
      listener(event);
    }
  };

  ReconnectingWebSocket.prototype._removeListeners = function () {
    if (!this._ws) {
      return;
    }

    this._debug('removeListeners');

    this._ws.removeEventListener('open', this._handleOpen);

    this._ws.removeEventListener('close', this._handleClose);

    this._ws.removeEventListener('message', this._handleMessage); // @ts-ignore


    this._ws.removeEventListener('error', this._handleError);
  };

  ReconnectingWebSocket.prototype._addListeners = function () {
    if (!this._ws) {
      return;
    }

    this._debug('addListeners');

    this._ws.addEventListener('open', this._handleOpen);

    this._ws.addEventListener('close', this._handleClose);

    this._ws.addEventListener('message', this._handleMessage); // @ts-ignore


    this._ws.addEventListener('error', this._handleError);
  };

  ReconnectingWebSocket.prototype._clearTimeouts = function () {
    clearTimeout(this._connectTimeout);
    clearTimeout(this._uptimeTimeout);
  };

  return ReconnectingWebSocket;
}();

var _default = ReconnectingWebSocket;
exports.default = _default;
},{}],"index.js":[function(require,module,exports) {
"use strict";

var _events = _interopRequireDefault(require("events"));

var _reconnectingWebsocket = _interopRequireDefault(require("reconnecting-websocket"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createPeer(localVideoElement, remoteVideoElement, signalingChannel, localCallId) {
  var peer = new RTCPeerConnection();
  var constraints = {
    video: true
  };
  signalingChannel.subscribe(function (_ref) {
    var toId = _ref.toId,
        fromId = _ref.fromId,
        desc = _ref.desc;

    if (desc) {
      if (desc.type === 'offer' && toId === localCallId) {
        console.log('offer:setRemoteDescription');
        peer.setRemoteDescription(desc).then(function () {
          console.log('offer:getUserMedia');
          return navigator.mediaDevices.getUserMedia(constraints);
        }).then(function (stream) {
          console.log('offer:addTrack');
          stream.getTracks().forEach(function (track) {
            return peer.addTrack(track, stream);
          });
          console.log('offer:createAnswer');
          return peer.createAnswer();
        }).then(function (answer) {
          console.log('offer:setLocalDescription');
          return peer.setLocalDescription(answer);
        }).then(function () {
          console.log('offer:sendAnswer');
          setTimeout(function () {
            signalingChannel.emit({
              toId: fromId,
              fromId: toId,
              desc: peer.localDescription
            });
          }, 0);
        });
      } else if (desc.type === 'answer' && toId === localCallId) {
        console.log('answer:setRemoteDescription');
        peer.setRemoteDescription(desc);
      }
    }
  });

  peer.ontrack = function (event) {
    if (remoteVideoElement.srcObject) return;
    remoteVideoElement.srcObject = event.streams[0];
  };

  return function callTo(remoteCallId) {
    console.log('call:getUserMedia');
    navigator.mediaDevices.getUserMedia(constraints).then(function (stream) {
      console.log('call:addTrack');
      stream.getTracks().forEach(function (track) {
        return peer.addTrack(track, stream);
      });
      localVideoElement.srcObject = stream;
    }).then(function () {
      console.log('call:createOffer');
      return peer.createOffer();
    }).then(function (offer) {
      console.log('call:setLocalDescription');
      return peer.setLocalDescription(offer);
    }).then(function () {
      console.log('call:sendOffer');
      setTimeout(function () {
        return signalingChannel.emit({
          toId: remoteCallId,
          fromId: localCallId,
          desc: peer.localDescription
        });
      }, 0);
    });
  };
}

function wsSignalingChannel() {
  var socket = new _reconnectingWebsocket.default("wss://wss.homefs.biz");
  var emitter = new _events.default();
  socket.addEventListener("message", function (message) {
    try {
      var msg = JSON.parse(message.data);
      emitter.emit('message', msg);
    } catch (e) {
      /* NOP */
    }
  });
  return {
    subscribe: function subscribe(cb) {
      emitter.on('message', function (msg) {
        return cb(msg);
      });
    },
    emit: function emit(msg) {
      socket.send(JSON.stringify(msg));
    }
  };
}

(function main() {
  var ownId = window.location.search;
  var video1 = document.getElementById("video1");
  var video2 = document.getElementById("video2");
  var form = document.getElementById("form");
  var signalingChannel = wsSignalingChannel();
  var call = createPeer(video1, video2, signalingChannel, ownId);
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    var name = form.elements[0].value;
    call(name);
  });
  navigator.mediaDevices.getUserMedia({
    video: true
  }).then(function (stream) {
    video1.srcObject = stream;
  });
})();
},{"events":"../node_modules/events/events.js","reconnecting-websocket":"../node_modules/reconnecting-websocket/dist/reconnecting-websocket-mjs.js"}],"../node_modules/parcel-bundler/src/builtins/hmr-runtime.js":[function(require,module,exports) {
var global = arguments[3];
var OVERLAY_ID = '__parcel__error__overlay__';
var OldModule = module.bundle.Module;

function Module(moduleName) {
  OldModule.call(this, moduleName);
  this.hot = {
    data: module.bundle.hotData,
    _acceptCallbacks: [],
    _disposeCallbacks: [],
    accept: function (fn) {
      this._acceptCallbacks.push(fn || function () {});
    },
    dispose: function (fn) {
      this._disposeCallbacks.push(fn);
    }
  };
  module.bundle.hotData = null;
}

module.bundle.Module = Module;
var checkedAssets, assetsToAccept;
var parent = module.bundle.parent;

if ((!parent || !parent.isParcelRequire) && typeof WebSocket !== 'undefined') {
  var hostname = "" || location.hostname;
  var protocol = location.protocol === 'https:' ? 'wss' : 'ws';
  var ws = new WebSocket(protocol + '://' + hostname + ':' + "63231" + '/');

  ws.onmessage = function (event) {
    checkedAssets = {};
    assetsToAccept = [];
    var data = JSON.parse(event.data);

    if (data.type === 'update') {
      var handled = false;
      data.assets.forEach(function (asset) {
        if (!asset.isNew) {
          var didAccept = hmrAcceptCheck(global.parcelRequire, asset.id);

          if (didAccept) {
            handled = true;
          }
        }
      }); // Enable HMR for CSS by default.

      handled = handled || data.assets.every(function (asset) {
        return asset.type === 'css' && asset.generated.js;
      });

      if (handled) {
        console.clear();
        data.assets.forEach(function (asset) {
          hmrApply(global.parcelRequire, asset);
        });
        assetsToAccept.forEach(function (v) {
          hmrAcceptRun(v[0], v[1]);
        });
      } else if (location.reload) {
        // `location` global exists in a web worker context but lacks `.reload()` function.
        location.reload();
      }
    }

    if (data.type === 'reload') {
      ws.close();

      ws.onclose = function () {
        location.reload();
      };
    }

    if (data.type === 'error-resolved') {
      console.log('[parcel] ✨ Error resolved');
      removeErrorOverlay();
    }

    if (data.type === 'error') {
      console.error('[parcel] 🚨  ' + data.error.message + '\n' + data.error.stack);
      removeErrorOverlay();
      var overlay = createErrorOverlay(data);
      document.body.appendChild(overlay);
    }
  };
}

function removeErrorOverlay() {
  var overlay = document.getElementById(OVERLAY_ID);

  if (overlay) {
    overlay.remove();
  }
}

function createErrorOverlay(data) {
  var overlay = document.createElement('div');
  overlay.id = OVERLAY_ID; // html encode message and stack trace

  var message = document.createElement('div');
  var stackTrace = document.createElement('pre');
  message.innerText = data.error.message;
  stackTrace.innerText = data.error.stack;
  overlay.innerHTML = '<div style="background: black; font-size: 16px; color: white; position: fixed; height: 100%; width: 100%; top: 0px; left: 0px; padding: 30px; opacity: 0.85; font-family: Menlo, Consolas, monospace; z-index: 9999;">' + '<span style="background: red; padding: 2px 4px; border-radius: 2px;">ERROR</span>' + '<span style="top: 2px; margin-left: 5px; position: relative;">🚨</span>' + '<div style="font-size: 18px; font-weight: bold; margin-top: 20px;">' + message.innerHTML + '</div>' + '<pre>' + stackTrace.innerHTML + '</pre>' + '</div>';
  return overlay;
}

function getParents(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return [];
  }

  var parents = [];
  var k, d, dep;

  for (k in modules) {
    for (d in modules[k][1]) {
      dep = modules[k][1][d];

      if (dep === id || Array.isArray(dep) && dep[dep.length - 1] === id) {
        parents.push(k);
      }
    }
  }

  if (bundle.parent) {
    parents = parents.concat(getParents(bundle.parent, id));
  }

  return parents;
}

function hmrApply(bundle, asset) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (modules[asset.id] || !bundle.parent) {
    var fn = new Function('require', 'module', 'exports', asset.generated.js);
    asset.isNew = !modules[asset.id];
    modules[asset.id] = [fn, asset.deps];
  } else if (bundle.parent) {
    hmrApply(bundle.parent, asset);
  }
}

function hmrAcceptCheck(bundle, id) {
  var modules = bundle.modules;

  if (!modules) {
    return;
  }

  if (!modules[id] && bundle.parent) {
    return hmrAcceptCheck(bundle.parent, id);
  }

  if (checkedAssets[id]) {
    return;
  }

  checkedAssets[id] = true;
  var cached = bundle.cache[id];
  assetsToAccept.push([bundle, id]);

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    return true;
  }

  return getParents(global.parcelRequire, id).some(function (id) {
    return hmrAcceptCheck(global.parcelRequire, id);
  });
}

function hmrAcceptRun(bundle, id) {
  var cached = bundle.cache[id];
  bundle.hotData = {};

  if (cached) {
    cached.hot.data = bundle.hotData;
  }

  if (cached && cached.hot && cached.hot._disposeCallbacks.length) {
    cached.hot._disposeCallbacks.forEach(function (cb) {
      cb(bundle.hotData);
    });
  }

  delete bundle.cache[id];
  bundle(id);
  cached = bundle.cache[id];

  if (cached && cached.hot && cached.hot._acceptCallbacks.length) {
    cached.hot._acceptCallbacks.forEach(function (cb) {
      cb();
    });

    return true;
  }
}
},{}]},{},["../node_modules/parcel-bundler/src/builtins/hmr-runtime.js","index.js"], null)
//# sourceMappingURL=/src.e31bb0bc.js.map