/* FormatChange  -- (c) 2012-2015 Hugsmiðjan ehf.   @license MIT/GPL */

// ----------------------------------------------------------------------------------
// FormatChange   --  https://github.com/maranomynet/formatchange
// ----------------------------------------------------------------------------------
// (c) 2012-2015 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
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
            elm_style.visibility = elm_style.overflow = 'hidden';
            elm_style.width = elm_style.height = 0;
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
          if ( callback )
          {
            self.unsubscribe(callback);
            self._callbacks.push(callback);
            // run callbacks immediately if .start()
            if ( self._on && !self._triggering )
            {
              callback(self.media);
            }
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
            var is = !!(grp&&grp[media.is]);
            var was = !!(grp&&grp[media.was]);
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

          // Here's the thing...
          // Old Opera browsers (mainly surviving on older Android devices and possibly STB/embededs)
          // always returns the *actual* font-family, not the value specified in the CSS.
          // Thus we need to use `:after{ content:'foo' }
          // However, as of Internet Explorer v. 11.0.9600.17843, :after content's style
          // isn't immediately computed until on the next tick - always returning 'none',
          // (Also: some much older version's of IE don't support :after for computedStyle at all)
          // All this forces us to use font-family for IE.
          //
          // Future plan is to rely exclusively on font-family, as soon as Opera <13 is totally off the radar.
          var newFormat = (getComputedStyle && getComputedStyle( elm, ':after' ).getPropertyValue('content'));
          if ( !newFormat || newFormat === 'none' )
          {
            newFormat = (getComputedStyle ? getComputedStyle( elm, null ).getPropertyValue('font-family') : elm.currentStyle.fontFamily) ||
                        '';
          }
          newFormat = newFormat.replace(/['"]/g,''); // some browsers return a quoted strings.

          if ( newFormat !== oldFormat )
          {
            media.is = media.format = newFormat;
            media.was = media.lastFormat = oldFormat;
            self.oldFormat = newFormat;
            self._updateFlags();
            // issue Notification
            self._triggering = true;
            for (var i=0, callback; (callback = self._callbacks[i]); i++)
            {
              callback(media);
            }
            self._triggering = false;
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
            var triggered = '_$triggered';
            fcInstance.subscribe(function (media) {
                $(win).trigger(evName, [media]);
              });
            $.event.special[evName] = {
                add: function (handlObj) {
                    // async auto-trigger (allows the handler to .off() the handler on first run)
                    setTimeout(function(){
                        var handler = handlObj.handler;
                        if ( fcInstance._on  &&  !handler[triggered] )
                        {
                          handler.call(win, $.Event(evName), fcInstance.media);
                        }
                      }, 0);
                  },
                handle: function( event ) {
                    var handler = event.handleObj.handler;
                    // mark handlers as triggered - to avoid double-triggering by the auto-trigger (see above)
                    handler[triggered] = !0;
                    return handler.apply( this, arguments );
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
  }
  var jQuery = win.jQuery;
  jQuery  &&  !jQuery.formatChange  &&  FormatChange.jQueryPlugin( jQuery );


})();
