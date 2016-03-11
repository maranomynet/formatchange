/* FormatChange  -- (c) 2012-2016 Hugsmiðjan ehf.   @license MIT/GPL */

// ----------------------------------------------------------------------------------
// FormatChange   --  https://github.com/maranomynet/formatchange
// ----------------------------------------------------------------------------------
// (c) 2012-2016 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
//  written by:
//   * Már Örlygsson        -- http://mar.anomy.net
//
// Dual licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// and GPL 2.0 or above (http://www.gnu.org/licenses/old-licenses/gpl-2.0.html).
// ----------------------------------------------------------------------------------

(function(){'use strict';

  var win = window;
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
            self.win = config.win || self.win;
            self.elm = config.elm;
            if ( config.elmTagName ) { self.elmTagName = config.elmTagName; }
            if ( config.elmId ) { self.elmId = config.elmId; }
            if ( 'manual' in config ) { self.manual = config.manual; }
            if ( 'defer' in config ) { self.defer = config.defer; }

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
          }
        };


  FormatChange.prototype = {

      // Default options and format groups.
      elmTagName: 'del',
      elmId: 'mediaformat',
      manual: false,
      defer: false,
      win: win,
      formatGroups: {},

      isRunning: function () { return this._on; },

      start: function (afresh) {
          var self = this;

          // Define the Format Info object if needed
          if ( !self._on )
          {
            var win = self.win;
            // Ensure elm is defined
            if ( !self.elm )
            {
              var doc = win.document;
              var id = self.elmId || 'mediaformat';
              var elm = self.elm = doc.getElementById(id);

              if ( !elm )
              {
                // build and inject the hidden monitoring element
                elm = self.elm = doc.createElement(self.elmTagName||'del');
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
                doc.body.appendChild( elm );
              }
            }

            self._on = true;

            if ( !self.manual )
            {
              w3cEvents ?
                  win.addEventListener('resize', self._check):
                  win.attachEvent('onresize',    self._check);
            }

            self.refresh(afresh);
          }
        },


      stop: function () {
          var self = this;
          var elm = self.elm;

          if ( self._on )
          {
            if ( !self.manual )
            {
              w3cEvents ?
                  self.win.removeEventListener('resize', self._check):
                  self.win.detachEvent('onresize',       self._check);
            }
            if ( elm._isMine )
            {
              elm.parentNode.removeChild(elm);
              delete self.elm;
            }
            self._on = false;
          }
        },


      refresh: function (hardRefresh) {
          var self = this;
          if (hardRefresh)
          {
            self.oldFormat = null;
          }
          if ( self._on ) {
            if ( !self.check() )
            {
              // in case Group data has changed or something
              // even though check() returned false - indicating no format change.
              self._updateFlags();
            } 
          }
          return self._on;
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


      check: function () {
          var self = this;
          if ( self._on )
          {
            var media = self.media;
            var oldFormat = self.oldFormat;
            var elm = self.elm;

            var getComputedStyle = self.win.getComputedStyle;

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

            var changeOccurred = newFormat !== oldFormat;
            if ( changeOccurred )
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
            return changeOccurred;
          }
        }

    };



  FormatChange.jQueryPlugin = function ($, defaultEventName) {
      $.formatChange = function (groups, config) {
          config = config || {};
          var instanceWin = config.win || FormatChange.prototype.win || win;
          var instancesKey = '$formatchange_jquery_instances';
          var instances = instanceWin[instancesKey];
          if ( !instances ) {
            instances = instanceWin[instancesKey] = {};
          }
          var evName = config.eventName || defaultEventName || 'formatchange';
          var fcInstance = instances[evName];
          if ( !fcInstance )
          {
            fcInstance = instances[evName] = new FormatChange(groups, config);
            var triggered = '_$triggered';
            fcInstance.subscribe(function (media) {
                $(instanceWin).trigger(evName, [media]);
              });
            $.event.special[evName] = {
                add: function (handlObj) {
                    // async auto-trigger (allows the handler to .off() the handler on first run)
                    setTimeout(function(){
                        var handler = handlObj.handler;
                        if ( fcInstance._on  &&  !handler[triggered] )
                        {
                          handler.call(instanceWin, $.Event(evName), fcInstance.media);
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
