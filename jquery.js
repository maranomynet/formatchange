const FormatChange = require("./formatchange");

jQueryPlugin = function (jQuery, defaultEventName) {
  const $ = jQuery || window.jQuery;
  defaultEventName = defaultEventName || "formatchange";

  $.formatChange = function (groups, config) {
    config = config || {};
    var instanceWin = config.win || FormatChange.prototype.win || window;
    var instancesKey = "$formatchange_jquery_instances";
    var instances = instanceWin[instancesKey];
    if (!instances) {
      instances = instanceWin[instancesKey] = {};
    }
    var evName = config.eventName || defaultEventName;
    var fcInstance = instances[evName];
    if (!fcInstance) {
      fcInstance = instances[evName] = new FormatChange(groups, config);
      var triggered = "_$triggered";
      fcInstance.subscribe(function (media) {
        $(instanceWin).trigger(evName, [media]);
      });
      $.event.special[evName] = {
        add: function (handlObj) {
          // async auto-trigger (allows the handler to .off() the handler on first run)
          setTimeout(function () {
            var handler = handlObj.handler;
            if (fcInstance._on && !handler[triggered]) {
              handler.call(instanceWin, $.Event(evName), fcInstance.media);
            }
          }, 0);
        },
        handle: function (event) {
          var handler = event.handleObj.handler;
          // mark handlers as triggered - to avoid double-triggering by the auto-trigger (see above)
          handler[triggered] = !0;
          return handler.apply(this, arguments);
        },
      };
    }
    return fcInstance;
  };
  return $;
};

exports.jQueryPlugin = FormatChange;
