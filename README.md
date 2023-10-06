# FormatChange

**... Smart window resize events for sites with responsive UI.**

FormatChange makes it trivially easy to tie tailor-made scripting effects to (CSS defined) **named** @media query breakpoints – and respond intelligently when users tilt their phones and tablets, or resize their browser windows.

You can subscribe/unsubscribe to notifications (custom event firing) whenever
it detects that a new (named) CSS @media query breakpoint has become active.

<!-- prettier-ignore-start -->

- [HOWTO / API](#howto--api)
  - [0: Install](#0-install)
  - [1: Name your CSS breakpoints](#1-name-your-css-breakpoints)
  - [2: Configure and initialize FormatChange](#2-configure-and-initialize-formatchange)
  - [3: Getting the current media format](#3-getting-the-current-media-format)
  - [4: Subscribe to formatchange events.](#4-subscribe-to-formatchange-events)
  - [5: Start, stop, refresh!](#5-start-stop-refresh)
- [Helpers](#helpers)
  - [React `makeFormatMonitorHook`](#react-makeformatmonitorhook)
  - [`makeGroups(normalizedCfg)` Helper](#makegroupsnormalizedcfg-helper)
  - [jQuery Plugin](#jquery-plugin)
  - [React `withMediaProps` HOC](#react-withmediaprops-hoc)

<!-- prettier-ignore-end -->

## HOWTO / API

### 0: Install

```sh
yarn add formatchange
# or...
npm install formatchange
```

### 1: Name your CSS breakpoints

FormatChange Monitors changes in a hidden Element's `::after { content: '' }` value, as defined in your page's CSS code.

So, first off, give a single name to each @media query breakpoint (format) you want your script to respond to.

```css
@media screen {
  #mediaformat::after {
    content: "phone";
  }
}
@media screen and (min-width: 500px) {
  #mediaformat::after {
    content: "phablet";
  }
}
@media screen and (min-width: 700px) {
  #mediaformat::after {
    content: "tablet";
  }
}
@media screen and (min-width: 950px) {
  #mediaformat::after {
    content: "netbook";
  }
}
@media screen and (min-width: 1350px) {
  #mediaformat::after {
    content: "widescreen";
  }
}
```

### 2: Configure and initialize FormatChange

FormatChange is a constructor, but is very understanding about being called as a normal function.

```js
import { FormatChange } from "formatchange";

var formatMonitor = new FormatChange();
```

The constructor accepts two optional Object arguments: `formatGroups` and `options`.

`formatGroups` allows you to optionally split the formats defined by your CSS into named groups – which can be convenient when handling format-change events (more on that below).

```js
var formatGroups = {
  Small: { phone: 1, phablet: 1 },
  Large: { tablet: 1, netbook: 1, widescreen: 1 },
};
```

The available `options` are as follows (showing default values):

```js
var options = {
  // Optionally supply a pre-existing element to query
  elm: null,

  // DOM id of the element to query. (Used if `elm` is missing)
  elmId: "mediaformat",

  // Tag-name used when auto-generating an element to query
  elmTagName: "del",

  // Set to `true` if you want to `.start()` manually
  defer: false,

  // A custom `window` object/scope to monitor.
  win: window,

  // Set to `true` to disable `window.onresize` evend binding
  // and run `.check()` manually
  manual: false,
};
```

Then this:

```js
var formatMonitor = new FormatChange(formatGroups, options);
```

**NOTE:** All option and formatGroups defaults can be changed via `FormatChange.prototype.*`

### 3: Getting the current media format

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
formatMonitor.formatGroups.Funky = { phone: 1, tablet: 1, widescreen: 1 };

formatMonitor.refresh();
// formatMonitor.refresh(true); // to force-trigger a "formatchange" event.

alert(media.is); // --> "phablet"
alert(media.was); // --> "phone"
alert(media.isFunky); // --> false
alert(media.wasFunky); // --> true
alert(media.becameFunky); // --> false
alert(media.leftFunky); // --> true
```

### 4: Subscribe to formatchange events.

Whenever FormatChange detects a new `format` it runs any callbacks that have `.subscribe()`d to be notified, passing them a reference to the `formatMonitor.media` object.

```js
formatMonitor.subscribe(myEventCallback);

function myEventCallback(media) {
  // media === formatMonitor.media
  if (media.is === "phone") {
    // init mobile menu
  }
  if (media.was === "tablet") {
    // tear down tablet UI
  }
}
```

Each callback is immediately run upon subscription if `formatMonitor.isRunning() === true` – so no separate "initialization" is required.

If the callback should not be run immediately, then pass `false` as a second parameter to `.subscribe()` – like so: `formatMonitor.subscribe( myEventCallback, false )`

Subscriptions can be cancelled any time:

```js
formatMonitor.unsubscribe(myEventCallback);
```

### 5: Start, stop, refresh!

`formatMonitor.isRunning()` tells you if the `window.onresize` monitoring is active or not. If your monitor is set to `manual`, it simply tells you if it has been started.

Call `formatMonitor.stop()` any time to stop monitoring.
This does NOT unbind any subscribed "formatchange" event callbacks – only stops the onResize CSS-polling and triggering of events

`formatMonitor.start()` Binds the `window.onresize` event handler to poll the CSS and trigger event callbacks.
This method is called internally when a `FormatChange` instance is created – unless the `defer` option is passed.

Starting and stopping does not delete or reset the `media` object. This means that restarting (i.e. `.start()` after a `.stop()`) will not re-trigger a 'formatchange' event – unless the window size (or CSS) changed in the meantime – or if if a "hard-refresh" argument is passed (i.e. `.start(true)`).

`formatMonitor.check()` quickly queries if the format has changed and triggers "formatchange" event if needed. This is the method to use with the `manual` option.

`formatMonitor.refresh()` refreshes the `media` object and triggers "formatchange" event when appropriate – unless a "hard-refresh" boolean argument is passed (i.e. `.refresh(true)`).

## Helpers

FormatChange comes with a few helpers.

### React `makeFormatMonitorHook`

A factory function that generates a react hook that is bound to a specific `FormatChange` monitor instance.

```js
import { FormatChange } from "formatchange";
import { makeFormatMonitorHook } from "formatchange/react";

var formatMonitor = new FormatChange(/* groups, options */);
export const useFormatMonitor = makeFormatMonitorHook(formatMonitor);

// elsewhere off in some React component file

export const MyComponent = (props) => {
  const [isPhone, setPhoneFormat] = React.useState(false);
  useFormatMonitor((media) => {
    setPhoneFormat(media.is === "phone");
  });

  return <div>Phone format: {String(isPhone)}</div>;
};
```

The generated hook returns `FormatChange` instance's `media` object, in case you want to use it directly.
(NOTE: The object may or may not be initialized yet.)

You can also pass a getter callback which returns the `FormatChange` instance.
This may be the preferred signature for JS libraries that want to provide side-effect free `imort`s.

```js
let _formatMonitor;

export const useFormatMonitor = makeFormatMonitorHook(() => {
  if (!_formatMonitor) {
    _formatMonitor = new FormatChange(/* groups, options */);
  }
  return _formatMonitor;
});
```

### `makeGroups(normalizedCfg)` Helper

This opinionated helper takes a normalized config object and creates a `formatGroup` object that fits into the FormatChange constructor.

This can be useful when your media-format config is stored in a .json file that is then read and interpreted by multiple sources.

Example use:

```js
import { makeGroups } from "formatchange/makeGroups";

const mediaFormats = {
  desktop: { minW: 900, group: "Large" },
  tablet: { minW: 700, maxW: 900, group: ["Large", "Handheld"] },
  phone: { maxW: 480, group: ["Small", "Handheld"] },
  // Formats without `group` are ignored by `makeGroups`
  tablet_up: { minW: 700 },
  phone_tablet: { maxW: 900 },
};
const groupConfig = makeGroups(mediaFormats);
console.log(groupConfig)
/*
  {
    Small: { phone: true },
    Large: { tablet: true, desktop: true },
    Handheld: { tablet: true, phone: true },
  }
*/
const myFormatMonitor = new FormatChange(groupConfig);
```

### jQuery Plugin

FormatChange provides a convenient jQuery plugin.

```js
import { jQueryPlugin } from "formatchange/jquery";

jQueryPlugin();
```

This adds a `jQuery.formatChange()` utility method, that generates and returns `new FormatChange()` instances, and allows you to bind `formatchange` events handlers using jQuery's `.on` and `.off` methods. Like so:

```js
// initialize/instantiate FormatChange
var formatMonitor = $.formatChange(formatGroups, options);

$(window).on("formatchange", function (e, media) {
  // media === formatMonitor.media
  if (media.is === "phone") {
    // init mobile menu
  }
  if (media.was === "tablet") {
    // tear down tablet UI
  }
});
```

(Note: Event handlers are auto-triggered upon binding – if `formatMonitor.isRunning() === true` – so no separate "initialization" is required. The auto-triggering occurs after a `setTimeout` of 0 ms, if the handler hasn't been triggerd manually in the meantime.)

`jQuery.formatChange()` accepts the same arguments as the `FormatChange` constructor.

In addition it accepts an `eventName` option – which in turn results in the creation of a separate `FormatChange` instance with its own hidden element, its own CSS breakpoint names and `formatGroups`, etc...

```css
#aspectformat::after {
  content: "default";
}
@media screen and (max-width: 500px) and (min-height: 800px) {
  #aspectformat::after {
    content: "portrait";
  }
}
@media screen and (min-width: 800px) and (max-height: 500px) {
  #aspectformat::after {
    content: "landscape";
  }
}
```

```js
var aspectMonitor = $.formatChange(null, {
  elmId: "aspectformat",
  eventName: "aspectchange",
});

$(window).on("aspectchange", function (e, aMedia) {
  // aMedia === aspectMonitor.media;
  if (aMedia.is === "portrait") {
    // do stuff...
  } else if (aMedia.was === "default") {
    // do stuff...
  }
});
```

You can also pass custom jQuery instances and/or custom default event name to `jQueryPlugin()`:

```js
const myJQuery = jQuery.noConflict();

jQueryPlugin(myJQuery, "myDefaultEventName");

var formatMonitor = myJQuery.formatChange();

myJQuery(window).on("myDefaultEventName", function (e, media) {
  // ...
});
```

### React `withMediaProps` HOC

Learn by example:

```js
import { FormatChange } from "formatchange";
import { withMediaProps } from "formatchange/react";

const myMonitor = new FormatChange();

// Mapper function that returns an object with media-related
// props to be spread on the wrapped component
const media2Props = (media) => ({
  isSmall: media.is === "phone" || media.is === "phablet",
});

// With static class-method
class Foo extends React.Component {
  static getPropsFromMedia(media) {
    return media2Props(media);
  }
  /* ... */
}
const MonitoredFoo = withMediaProps(Foo, myMonitor);

// With mapper as a third HOC parameter
class Bar extends React.Component {
  /* ... */
}
const MonitoredBar = withMediaProps(Bar, myMonitor, media2Props);

// With dumb default mapper `(media) => media`
class Baz extends React.Component {
  /* ... */
}
const MonitoredBaz = withMediaProps(Baz, myMonitor);
```

