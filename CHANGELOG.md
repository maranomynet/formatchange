# Changelog for FormatChange

## Unreleased...
* ... <!-- Add new lines here. Version number will be decided later -->
* feat: Add TypeScript type declarations


## 1.6.3 / 1.6.4
_2018-11-04_
* Fix error when run on server/node. Export nothing/`undefined` when no `window` is found.
* Fix hydration of server-side-rendered HTML. Make HOC only use `getPropsFromMedia` on `componentDidMount`

## 1.6.2
_2018-10-31_
* Fix broken `FormatChange.makeGroups`

## 1.6.1
_2018-10-31_
* Fix missing minified script

## 1.6.0
_2018-10-31_
* Add `formatchange/react` module exporting `withMediaProps` HOC
* Add static helper `FormatChange.makeGroups`

## 1.5.0
_2018-09-24_
* Add `.subscribe(callback, runImmediately);` signature

## 1.4.2
_2016-03-11_
* Fix infinite recusion in window resize check.

## 1.4.1
_2016-03-11_
* Add a public `.check()` method for faster media checks with the `manual` option
* Fix errors and omissions in the documentation

## 1.4.0
_2016-03-11_
* Add `win` option to specify custom `window` object.  
(This allows an `<iframe>` to be monitored by its host page.)
* Add `elm` option to provide a pre-generated monitoring Element.
    * Expose an instance's element as `.elm`
    * Query DOM for a preexisting element with `elmId`
* Add `manual` option to not bind `window.onresize`  
(This allows a fully manual triggering of `.refresh()`
which is extremely useful when emulating "element-queries")
* Improve the CSS "hiding" of the monitoring element.

## 1.3.1
_2016-03-10_
* Fix jQuery plugin re-run returning `undefined`

## 1.3.0
_2015-11-23_
* Always register the jQuery plugin if jQuery is defined  
(This should be generally harmless, and creates a more seamless
experience for developers moving from `<script>` tags
towards Browserify or other CommonJS-like environment.)

## 1.2.0
_2015-07-02_
* Rename media.format/.lastFormat --> media.is/.was  
(While still supporting the old property names)

## 1.1.2
_2015-06-16_
* Workaround for IE11 not computing `::after` immediately on new elms  
(Apparent regression in v. 11.0.9600.17843)

## 1.1.1
_2015-06-13_
* Prevent subscription of falsy callbacks + instant double-trigger edge case

## 1.1.0
_2015-03-12_
* Auto-trigger bound jQuery events asynchronously - if they've not been manually triggered in the meantime.

## 1.0.2
_2014-09-22_
* Improve the CSS "hiding" of the monitoring element.

## 1.0.1
_2014-09-04_
* Improved documentation 

## 1.0.0
_2014-09-03_
* Initial release as npm module 

