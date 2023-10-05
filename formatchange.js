/* FormatChange  -- (c) 2012-2022 Hugsmiðjan ehf.   @license MIT/GPL */

// ----------------------------------------------------------------------------------
// FormatChange   --  https://github.com/maranomynet/formatchange
// ----------------------------------------------------------------------------------
// (c) 2012-2022 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
//  written by:
//   * Már Örlygsson        -- http://mar.anomy.net
//
// Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
// ----------------------------------------------------------------------------------


var _beget = Object.create || function (prototype) {
  var F = function () {};
  F.prototype = prototype;
  return new F();
};

// FYI: `jsdom` doesn't have `window.getComputedStyle`...
var isBrowser = (window) => !!(window && window.getComputedStyle)


var FormatChange = function (groups, config) {
  var self = this;
  if (!(this instanceof FormatChange)) {
    // tolerate cases when new is missing.
    return new FormatChange(groups, config);
  }

  config = config || {};
  self.win = config.win || self.win;
  self.elm = config.elm;
  if (config.elmTagName) {
    self.elmTagName = config.elmTagName;
  }
  if (config.elmId) {
    self.elmId = config.elmId;
  }
  if ('manual' in config) {
    self.manual = config.manual;
  }
  if ('defer' in config) {
    self.defer = config.defer;
  }

  self.formatGroups = groups || _beget(self.formatGroups);

  self.media = {};
  self._callbacks = [];

  // for (var i=0, callback; (callback = (config.callbacks||[])[i]); i++)
  // {
  //   self.subscribe(callback);
  // }

  // a self-bound handler-function for window.onresize events.
  self._check = function () { self.check(); };

  !self.defer  &&  self.start();
};


FormatChange.prototype = {
  // Default options and format groups.
  elmTagName: 'del',
  elmId: 'mediaformat',
  manual: false,
  defer: false,
  win: typeof window !== 'undefined' ? window : undefined,
  formatGroups: {},
  
  oldFormat: null,
  _failures: true,

  isRunning: function () {
    return this._on;
  },

  start: function (afresh) {
    // Only define the Format Info object if needed
    // Also: Don't start if window is undefined
    if (this._on || !isBrowser(this.win)) {
      return;
    }
    // Ensure elm is defined
    if (!this.elm) {
      var doc = this.win.document;
      var id = this.elmId || 'mediaformat';
      var elm = this.elm = doc.getElementById(id);

      if (!elm) {
        // build and inject the hidden monitoring element
        elm = this.elm = doc.createElement(this.elmTagName||'del');
        var elm_style = elm.style;
        elm_style.position = 'absolute';
        elm_style.visibility =
        elm_style.overflow = 'hidden';
        elm_style.border =
        elm_style.padding =
        elm_style.margin =
        elm_style.width =
        elm_style.height = 0;
        elm.id = id;
        elm._isMine = true;
        doc.body.appendChild(elm);
      }
    }

    this._on = true;

    if (!this.manual) {
      this.win.addEventListener('resize', this._check);
    }

    this.refresh(afresh);
  },

  stop: function () {
    var elm = this.elm;
    if (!this._on) {
      return;
    }
    if (!this.manual) {
      this.win.removeEventListener('resize', this._check);
    }
    if (elm._isMine) {
      elm.parentNode.removeChild(elm);
      delete this.elm;
    }
    this._on = false;
  },

  refresh: function (hardRefresh) {
    if (hardRefresh) {
      this.oldFormat = null;
    }
    if (this._on && !this.check()) {
      // in case Group data has changed or something
      // even though check() returned false - indicating no format change.
      this._updateFlags();
    }
    return this._on;
  },

  subscribe: function (callback, runImmediately) {
    if (!callback) {
      return;
    }
    this.unsubscribe(callback);
    this._callbacks.push(callback);
    // run callbacks immediately if .start()
    if (runImmediately !== false && this._on && !this._triggering) {
      callback(this.media);
    }
  },


  unsubscribe: function (callback) {
    if (!callback) {
      return;
    }
    for (var i=0, cb; (cb = this._callbacks[i]); i++) {
      if (cb === callback) {
        this._callbacks.splice(i,1);
        break;
      }
    }
  },

  _on: false,

  // update the static group-related flags.
  _updateFlags: function () {
    var self = this;
    var media = self.media;
    var formatGroups = self.formatGroups;
    for (var grpName in formatGroups) {
      var grp = formatGroups[grpName];
      var is = !!(grp&&grp[media.is]);
      var was = !!(grp&&grp[media.was]);
      media['is'+grpName] = is;
      media['was'+grpName] = was;
      media['became'+grpName] = is && !was;
      media['left'+grpName] = !is && was;
      !grp && (delete formatGroups[grpName]); // delete when we've made sure all flags are set to false (cleanup)
    }
  },

  check: function () {
    if (!this._on) {
      return;
    }
    var media = this.media;
    var oldFormat = this.oldFormat;
    var newFormat = this.win.getComputedStyle(this.elm, '::after').content;
    if (newFormat === 'none' && this._failures < 10) {
      this._failures++;
      setTimeout(() => this.check(), 67);
      return;
    }
    newFormat = newFormat.replace(/['"]/g, '');

    var changeOccurred = newFormat !== oldFormat;
    if (changeOccurred) {
      media.is = media.format = newFormat;
      media.was = media.lastFormat = oldFormat;
      this.oldFormat = newFormat;
      this._updateFlags();
      // issue Notification
      this._triggering = true;
      for (var i=0, callback; (callback = this._callbacks[i]); i++) {
        callback(media);
      }
      this._triggering = false;
    }
    return changeOccurred;
  },

};

exports.FormatChange = FormatChange