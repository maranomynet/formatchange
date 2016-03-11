# FormatChange 
**... Smart window resize events for sites with responsive UI.**

FormatChange makes it trivially easy to tie tailor-made scripting effects to (CSS defined) **named** @media query breakpoints – and respond intelligently when users tilt their phones and tablets, or resize their browser windows.

You can subscribe/unsubscribe to notifications (custom event firing) whenever
it detects that a new (named) CSS @media query breakpoint has become active.

FormatChange has no dependencies, but provides a nice little jQuery plugin which triggers "formatchange" events on the `window` object.

## 0: Install and inclusion
 
    npm install formatchange

FormatChange is CommonJS (`require()`) friendly, using `module.exports` by default, and setting `FormatChange` as a global object only as a last resort.


## 1: Name your CSS breakpoints

FormatChange Monitors changes in a hidden Element's `:after { content:'' }` value (falling back to the hidden element's `font-family` in some browsers) as defined in your page's CSS code[*](http://adactio.com/journal/5429/).

So, first off, give a single name to each @media query breakpoint (format) you want your script to respond to.

```css
@media screen {
  #mediaformat { font-family: "phone"; }
  #mediaformat:after { content: "phone"; }
}
@media screen and (min-width: 500px) {
  #mediaformat { font-family: "phablet"; } #mediaformat:after { content: "phablet"; }
}
@media screen and (min-width: 700px) {
  #mediaformat { font-family: "tablet"; } #mediaformat:after { content: "tablet"; }
}
@media screen and (min-width: 950px) {
  #mediaformat { font-family: "netbook"; } #mediaformat:after { content: "netbook"; }
}
@media screen and (min-width: 1350px) {
  #mediaformat { font-family: "widescreen"; } #mediaformat:after { content: "widescreen"; }
}
```

## 2: Configure and initialize FormatChange

FormatChange is a constructor, but is very understanding about being called as a normal function.

```js
var formatMonitor = new FormatChange();
// ...or...
var formatMonitor = FormatChange();
```

The constructor accepts two optional Object arguments: `formatGroups` and `options`.

`formatGroups` allows you to optionally split the formats defined by your CSS into named groups – which can be convenient when handling format-change events (more on that below).

```js
var formatGroups = {
      Small: { phone:1, phablet:1 },
      Large: { tablet:1, netbook:1, widescreen:1 }
    };
```
The available `options` are as follows (showing default values):

```js
var options = {
      elmTagName: 'del',  // tagName for the generated hidden element
      elmId: 'mediaformat',  // id for the generated element
      defer: false,  // if `true` you must call .start() manually
      win: window, // the `window` object/scope to monitor.
    };
```
Then this:

```js
var formatMonitor = new FormatChange( formatGroups, options );
```

**NOTE:** All option and formatGroups defaults can be changed via `FormatChange.prototype.*`


## 3: Getting the current media format

As soon as FormatChange starts monitoring the viewport (on instantiation by default, or on `.start()` if the `defer` option is used) it writes information about the current media format into `formatMonitor.media`.

```js
var media = formatMonitor.media;
```

`media.is` – contains the name of the current media format. E.g. 'tablet', 'phone' or 'widescreen', etc.

`media.was` – starts out `undefined` but once a format change is detected it contains the name of the last media format.

If you have defined any `formatGroups` (as per example above) you'll also be provided with a set of dynamically defined boolean flags indicating if `media.is` is part of that group.

So, using the above example settings and CSS, a 768px wide viewport would result in a `media` object with these initial property values:

```js
media.is      === 'tablet',
media.was  === undefined,
// for the 'Small' group:
media.isSmall     === false,
media.wasSmall    === false,
media.becameSmall === false,
media.leftSmall   === false,
// for the 'Large' group:
media.isLarge     === true,
media.wasLarge    === false,
media.becameLarge === true,
media.leftLarge   === false,
```

Then if the user resizes the viewport width down to 360px, the `media` properties change to this:

```js
media.is      === 'phone',
media.was  === 'tablet',
// for the 'Small' group:
media.isSmall     === true,
media.wasSmall    === false,
media.becameSmall === true,
media.leftSmall   === false,
// for the 'Large' group:
media.isLarge     === false,
media.wasLarge    === true,
media.becameLarge === false,
media.leftLarge   === true,
```

A second reszie, now to 550px wide viewport, results in this:

```js
media.is      === 'phablet',
media.was  === 'phone',
// for the 'Small' group:
media.isSmall     === true,
media.wasSmall    === true,
media.becameSmall === false,
media.leftSmall   === false,
// for the 'Large' group:
media.isLarge     === false,
media.wasLarge    === false,
media.becameLarge === false,
media.leftLarge   === false,
```

If we now decide to add a new format group "Funky", the appropriate boolean flags for that group `.(is|was|became|left)Funky` are created (either next time a format change is detected or once `.refresh()` has been called), like so:

```js
formatMonitor.formatGroups.Funky = { phone:1, tablet:1, widescreen:1 };

formatMonitor.refresh();
// formatMonitor.refresh(true); // to force-trigger a "formatchange" event.

alert( media.is );      // --> "phablet"
alert( media.was );  // --> "phone"
alert( media.isFunky );     // --> false
alert( media.wasFunky );    // --> true
alert( media.becameFunky ); // --> false
alert( media.leftFunky );   // --> true
```


## 4: Subscribe to formatchange events.

Whenever FormatChange detects a new `format` it runs any callbacks that have `.subscribe()`d to be notified, passing them a reference to the `formatMonitor.media` object.

```js
formatMonitor.subscribe(myEventCallback);

function myEventCallback (media) {
      // media === formatMonitor.media
      if ( media.is === 'phone' ) {
        // init mobile menu
      }
      if ( media.was === 'tablet' ) {
        // tear down tablet UI
      }
    };
```

Each callback is immediately run upon subscription if `formatMonitor.isRunning() === true` – so no separate "initialization" is required.

Subscriptions can be cancelled any time:

```js
formatMonitor.unsubscribe(myEventCallback);
```



## 4: Start, stop, refresh!

`formatMonitor.isRunning()` tells you if the `window.onresize` monitoring is active or not.

Call `formatMonitor.stop()` any time to stop monitoring.
This does NOT unbind any subscribed "formatchange" event callbacks – only stops the onResize CSS-polling and triggering of events

`formatMonitor.start()` Binds a `window.onresize` event handler to poll the CSS and trigger event callbacks.
This method is called internally when a `FormatChange` instance is created – unless the `defer` option is passed.

Starting and stopping does not delete or reset the `media` object. This means that restarting (i.e. `.start()` after a `.stop()`) will not re-trigger a 'formatchange' event – unless the window size (or CSS) changed in the meantime – or if if a "hard-refresh" argument is passed (i.e. `.start(true)`).

`formatMonitor.refresh()` refreshes the `media` object and triggers "formatchange" event when appropriate – unless a "hard-refresh" boolean argument is passed (i.e. `.refresh(true)`).


# jQuery plugin

If FormatChange detects the presence of `window.jQuery` it automatically runs this command:

```js
FormatChange.jQueryPlugin( window.jQuery, 'formatchange' );
```

This adds a `jQuery.formatChange()` utility method, that generates and returns `new FormatChange()` instances, and allows you to bind `formatchange` events handlers using jQuery's `.on` and `.off` methods. Like so:

```js
var formatMonitor = $.formatChange( formatGroups, options );

$(window).on('formatchange', function (e, media) {
    // media === formatMonitor.media
    if ( media.is === 'phone' ) {
      // init mobile menu
    }
    if ( media.was === 'tablet' ) {
      // tear down tablet UI
    }
  });
```

(Note: Event handlers are auto-triggered upon binding – if `formatMonitor.isRunning() === true` – so no separate "initialization" is required. The auto-triggering occurs after a `setTimeout` of 0 ms, if the handler hasn't been triggerd manually in the meantime.)

`jQuery.formatChange()` accepts the same arguments as the `FormatChange` constructor. 

In addition it accepts an `eventName` option – which in turn results in the creation of a separate `FormatChange` instance with its own hidden element, its own CSS breakpoint names and `formatGroups`, etc...

```css
#foobar { font-family: "default"; }
#foobar:after { content: "default"; }
@media screen and (max-width: 500px) and (min-height:800px) {
  #foobar { font-family: "portrait"; } #foobar:after { content: "portrait"; }
}
@media screen and (min-width: 800px) and (max-height:500px) {
  #foobar { font-family: "landscape"; } #foobar:after { content: "landscape"; }
}
```

```js
var aspectMonitor =  $.formatChange(null, {
                          elmId:'foobar',
                          eventName:'aspectchange'
                        });

$(window).on('aspectchange', function (e, aMedia) {
    // aMedia === aspectMonitor.media;
    if ( aMedia.is === 'portrait' ) {
      // do stuff...
    }
    else if ( aMedia.was === 'default' ) {
      // do stuff...
    }
  });
```



