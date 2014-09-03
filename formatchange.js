/* FormatChange  -- (c) 2012-2014 Hugsmiðjan ehf.   @license MIT/GPL */

// ----------------------------------------------------------------------------------
// FormatChange   --  https://github.com/maranomynet/formatchange
// ----------------------------------------------------------------------------------
// (c) 2012-2014 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
//  written by:
//   * Már Örlygsson        -- http://mar.anomy.net
//
// Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
// ----------------------------------------------------------------------------------

(function(){'use strict';

  var win = window;
  var doc = document;
  var w3cEvents = !!win.addEventListener;

  // var _extend = function (target, source) {
  //         for ( var k in source||{} )
  //         {
  //           target[k] = source[k];
  //         }
  //         return target;
  //       };
  var _beget = Object.create || function (prototype) {
          var F = function(){};
          F.prototype = prototype;
          return new F();
        };


  var FormatChange = function (groups, config) {
          var self = this;
          if ( !(this instanceof FormatChange) )
          {
            // tolerate cases when new is missing.
            return new FormatChange(groups, config);
          }
          else
          {
            config = config || {};
            config.elmTagName  &&  (self.elmTagName = config.elmTagName);
            config.elmId  &&  (self.elmId = config.elmId);
            if ( 'defer' in config ) { self.defer = config.defer; }

            self.formatGroups = groups ? groups : _beget(self.formatGroups);

            self.media = {};
            self._callbacks = [];

            // for (var i=0, callback; (callback = (config.callbacks||[])[i]); i++)
            // {
            //   self.subscribe(callback);
            // }

            // a self-bound handler-function for window.onresize events.
            self._$hdl = function () { self._getFormat(); };

            !self.defer  &&  self.start();
          }
        };


  FormatChange.prototype = {

      // Default options and format groups.
      elmTagName: 'del',
      elmId: 'mediaformat',
      defer: false,
      formatGroups: {},

      isRunning: function () { return this._on },

      start: function (afresh) {
          var self = this;

          // Define the Format Info object if needed
          if ( !self._on )
          {
            // build and inject the hidden monitoring element
            var elm = self._elm = doc.createElement(self.elmTagName||'del');
            var elm_style = elm.style;
            elm_style.position = 'absolute';
            elm_style.visibility = 'hidden';
            elm_style.width = 0;
            elm.id = self.elmId || 'mediaformat';
            doc.body.appendChild( elm );

            self._on = true;

            w3cEvents ?
                win.addEventListener('resize', self._$hdl):
                win.attachEvent('onresize',    self._$hdl);

            self.refresh(afresh);
          }
        },


      stop: function () {
          var self = this;
          var elm = self._elm;

          if ( self._on )
          {
            w3cEvents ?
                win.removeEventListener('resize', self._$hdl):
                win.detachEvent('onresize',       self._$hdl);
            elm.parentNode.removeChild(elm);
            delete self._elm;
            self._on = false;
          }
        },


      refresh: function (hardRefresh) {
          if (hardRefresh)
          {
            this.oldFormat = null;
          }
          this._getFormat();
          this._updateFlags(); // in case Group data has changed or something
        },


      subscribe: function (callback) {
          var self = this;
          self.unsubscribe(callback);
          self._callbacks.push(callback);
          // run callbacks immediately if .start()
          if ( self._on )
          {
            callback(self.media);
          }
        },


      unsubscribe: function (callback) {
          var _callbacks = this._callbacks;
          for (var i=0, cb; (cb = _callbacks[i]); i++)
          {
            if ( cb === callback )
            {
              _callbacks.splice(i,1);
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
          for (var grpName in formatGroups)
          {
            var grp = formatGroups[grpName];
            var is = !!(grp&&grp[media.format]);
            var was = !!(grp&&grp[media.lastFormat]);
            media['is'+grpName] = is;
            media['was'+grpName] = was;
            media['became'+grpName] = is && !was;
            media['left'+grpName] = !is && was;
            !grp && (delete formatGroups[grpName]); // delete when we've made sure all flags are set to false (cleanup)
          }
        },


      _getFormat: function () {
          var self = this;
          var media = self.media;
          var oldFormat = self.oldFormat;
          var elm = self._elm;

          var getComputedStyle = win.getComputedStyle;
          var newFormat = (
                  (getComputedStyle && getComputedStyle( elm, ':after' ).getPropertyValue('content'))  ||
                  (getComputedStyle ? getComputedStyle( elm, null ).getPropertyValue('fontFamily') : elm.currentStyle.fontFamily) ||
                  ''
                ).replace(/['"]/g,''); // some browsers return a quoted strings.

          if ( newFormat !== oldFormat )
          {
            media.format = newFormat;
            media.lastFormat = oldFormat;
            self.oldFormat = newFormat;
            self._updateFlags();
            // issue Notification
            for (var i=0, callback; (callback = self._callbacks[i]); i++)
            {
              callback(media);
            }
          }
        }

    };



  FormatChange.jQueryPlugin = function ($, defaultEventName) {
      var instances = {};
      $.formatChange = function (groups, config) {
          config = config || {};
          var evName = config.eventName || defaultEventName || 'formatchange';
          if ( !instances[evName] )
          {
            var fcInstance = instances[evName] = new FormatChange(groups, config);
            fcInstance.subscribe(function (media) {
                $(win).trigger(evName, [media]);
              });
            $.event.special[evName] = {
                add: function (handlObj) {
                    fcInstance._on  &&  handlObj.handler.call(win, $.Event(evName), fcInstance.media);
                  }
              };
          }
          return fcInstance;
        };
    };


  if ( typeof module === 'object'  &&  typeof module.exports === 'object' )
  {

    module.exports = FormatChange;

  }
  else
  {

    win.FormatChange = FormatChange;
    win.jQuery  &&  FormatChange.jQueryPlugin(win.jQuery);

  }


})();
