# Changelog

## Unreleased...

- ... <!-- Add new lines here. Version number will be decided later -->
- `formatchange`:
  - **BREAKING** feat: Remove `FormatChange` class
  - feat: Add `makeFormatMonitor(groups, options)` factory function
- `formatchange/react`:
  - **BREAKING** feat: Remove `withMediaProps` HOC
  - **BREAKING** feat: Remove `makeFormatMonitorHook` factory
  - feat: Add `makeFormatMonitorHooks()` factory that produces two named hooks:
    `useFormatMonitor(callback)` and `useMedia()`
  - feat: Add hook `useFormatMonitor.media()` that returns a `media` object
    clone
  - fix: Perform lazy `useFormatMonitor`s initialization once only
- **BREAKING** feat: Remove module `formatchange/jquery`
- **BREAKING** feat: Remove module `formatchange/makeGroups`

## 2.3.1

_2023-10-07_

- docs: Add JSDoc comments with links to the v2-branch's README file

## 2.3.0

_2023-10-06_

- feat: If the monitored element has no generated content, then retry a few times
- feat: Make `useFormatMonitor` hooks return the `media` info object
- fix: Actually remove legacy media properties `.format`, `.lastFormat`

## 2.2.0

_2023-05-24_

- feat: Add `pkg.exports` to improve ESM `import` resolutions

## 2.1.0

_2022-12-15_

- feat: Allow passing callback/getter function to `makeFormatMonitorHook`
- fix(ts): Flag `FormatMonitorOptions.manual` as optional
- fix: Prevent error messages in `jsdom` environments

## 2.0.0 – 2.0.2

_2022-12-14_

- **BREAKING** feat: Remove support for ancient browsers
- **BREAKING** feat: Stop reading media name from `font-family`, use `::after` only
- **BREAKING** feat: Use named export for `FormatChange` class
- **BREAKING** feat: Always export `FormatChange`, perform no-op on missing `window`
- **BREAKING** feat: Split `FormatChange.jQueryPlugin` factory into standalone module `formatchange/jquery`
- **BREAKING** feat: Split `FormatChange.makeGroups` into standalone module `formatchange/makeGroups`
- **BREAKING** feat: `makeGroups`'s `group` values arrays of group names
- **BREAKING** feat: Remove `media.format` and `media.lastFormat`
- feat: Modernize and remove side-effects to improve tree-shaking

## 1.8.1

_2022-03-01_
 
- fix: Publish `react` module as ES5, for backwards compatibility

## 1.8.0

_2022-02-23_

- feat: React helpers:
  - feat: Add `makeFormatMonitorHook` custom react hook builder
  - feat: Add type declarations
  - feat: Deprecate `withMediaProps` HOC
- fix: Bugs in Type declarations

## 1.7.0

_2022-02-21_

- feat: Add TypeScript type declarations

## 1.6.3 / 1.6.4

_2018-11-04_

- Fix error when run on server/node. Export nothing/`undefined` when no `window` is found.
- Fix hydration of server-side-rendered HTML. Make HOC only use `getPropsFromMedia` on `componentDidMount`

## 1.6.2

_2018-10-31_

- Fix broken `FormatChange.makeGroups`

## 1.6.1

_2018-10-31_

- Fix missing minified script

## 1.6.0

_2018-10-31_

- Add `formatchange/react` module exporting `withMediaProps` HOC
- Add static helper `FormatChange.makeGroups`

## 1.5.0

_2018-09-24_

- Add `.subscribe(callback, runImmediately);` signature

## 1.4.2

_2016-03-11_

- Fix infinite recusion in window resize check.

## 1.4.1

_2016-03-11_

- Add a public `.check()` method for faster media checks with the `manual` option
- Fix errors and omissions in the documentation

## 1.4.0

_2016-03-11_

- Add `win` option to specify custom `window` object.  
  (This allows an `<iframe>` to be monitored by its host page.)
- Add `elm` option to provide a pre-generated monitoring Element.
  - Expose an instance's element as `.elm`
  - Query DOM for a preexisting element with `elmId`
- Add `manual` option to not bind `window.onresize`  
  (This allows a fully manual triggering of `.refresh()`
  which is extremely useful when emulating "element-queries")
- Improve the CSS "hiding" of the monitoring element.

## 1.3.1

_2016-03-10_

- Fix jQuery plugin re-run returning `undefined`

## 1.3.0

_2015-11-23_

- Always register the jQuery plugin if jQuery is defined  
  (This should be generally harmless, and creates a more seamless
  experience for developers moving from `<script>` tags
  towards Browserify or other CommonJS-like environment.)

## 1.2.0

_2015-07-02_

- Rename media.format/.lastFormat --> media.is/.was  
  (While still supporting the old property names)

## 1.1.2

_2015-06-16_

- Workaround for IE11 not computing `::after` immediately on new elms  
  (Apparent regression in v. 11.0.9600.17843)

## 1.1.1

_2015-06-13_

- Prevent subscription of falsy callbacks + instant double-trigger edge case

## 1.1.0

_2015-03-12_

- Auto-trigger bound jQuery events asynchronously - if they've not been manually triggered in the meantime.

## 1.0.2

_2014-09-22_

- Improve the CSS "hiding" of the monitoring element.

## 1.0.1

_2014-09-04_

- Improved documentation

## 1.0.0

_2014-09-03_

- Initial release as npm module
