/* FormatChange  -- (c) 2012-2025 Hugsmiðjan ehf.   @license MIT */

// ----------------------------------------------------------------------------------
// FormatChange   --  https://github.com/maranomynet/formatchange
// ----------------------------------------------------------------------------------
// (c) 2012-2025 Hugsmiðjan ehf  -- http://www.hugsmidjan.is
//  written and maintained by:
//   * Már Örlygsson  <mar.nospam@anomy.net>
//
// Licensed under a MIT licence (http://en.wikipedia.org/wiki/MIT_License)
// ----------------------------------------------------------------------------------

const copyGroupConfig = (groupConfig: unknown) =>
  groupConfig
    ? Object.fromEntries(
        Object.entries(groupConfig)
          .map(([group, config]) => {
            if (!config || typeof config !== 'object') {
              return;
            }
            return [
              group,
              Object.fromEntries(
                Object.entries(config).map(([key, val]) => [key, !!val])
              ),
            ] as const;
          })
          .filter(<T>(entry: T): entry is NonNullable<T> => !!entry)
      )
    : {};

const resolveWindow = (customWindow: Window | undefined) => {
  const win = customWindow || (typeof window !== 'undefined' ? window : undefined);
  // NOTE: `jsdom` doesn't have `window.getComputedStyle`...
  if (win && typeof win.getComputedStyle === 'function') {
    return win;
  }
};

const DEFAULT_CHECK_DELAY = 67;
const DEFAULT_ELM_ID = 'mediaformat';

// ---------------------------------------------------------------------------

type BaseMedia = { is: string; was?: string };

export type FormatMonitorMedia<Group extends string = string> = string extends Group
  ? BaseMedia
  : BaseMedia & Record<`${'is' | 'was' | 'became' | 'left'}${Group}`, boolean>;

// ---------------------------------------------------------------------------

export type FormatMonitorGroupConfig<Group extends string = string> = string extends Group
  ? Record<never, never>
  : Record<Group, Record<string, boolean>>;

// ---------------------------------------------------------------------------

export type FormatMonitorOptions = {
  /**
   * Optionally supply a pre-existing element to query
   */
  elm?: HTMLElement;

  /**
   * DOM id of the element to query. (Used if `elm` is missing)
   *
   * Default: `'mediaformat'`
   */
  elmId?: string;

  /**
   * Set to `true` if you want to `.start()` manually
   */
  defer?: boolean;

  /**
   * A custom `window` object/scope to monitor.
   * Useful when monitoring an iframe, etc.
   */
  win?: Window;

  /**
   * Set to `true` to disable the default `window.onresize` evend binding
   * and run `.check()` manually
   */
  manual?: boolean;

  /**
   * Custom minimum delay between throttled checks. This also applies to the
   * `window.onResize` event handler.
   *
   * Default: `67` ms
   */
  checkDelay?: number;
};

// ===========================================================================

/**
 * Factory function that generates a FormatMonitor instance.
 *
 * @see https://github.com/maranomynet/formatchange/tree/v3
 */
export const makeFormatMonitor = <Group extends string>(
  groupConfig?: FormatMonitorGroupConfig<Group>,
  options: FormatMonitorOptions = {}
) => {
  type Media = FormatMonitorMedia<Group>;
  type Callback = (media: Readonly<Media>) => void;

  const groups = copyGroupConfig(groupConfig);

  const media: Media = { is: '' } satisfies BaseMedia as Media;

  const _updateGroupFlags = () => {
    for (const grpName in groups) {
      const grp = groups[grpName];
      const is = !!(grp && grp[media.is]);
      const was = !!(grp && grp[media.was || '']);
      const _media = media as Record<string, boolean>;
      _media[`is${grpName}`] = is;
      _media[`was${grpName}`] = was;
      _media[`became${grpName}`] = is && !was;
      _media[`left${grpName}`] = !is && was;
    }
  };

  const win = resolveWindow(options.win);
  let elm: (HTMLElement & { __isMine?: true }) | undefined = options.elm;
  const elmId = options.elmId || DEFAULT_ELM_ID;

  const bindResizeEvent = !options.manual;

  let running = false;

  const _callbacks: Array<Callback> = [];
  let _triggering = false;

  const unsubscribe = (callback: Callback): void => {
    const idx = _callbacks.indexOf(callback);
    if (idx > -1) {
      _callbacks.splice(idx, 1);
    }
  };

  const subscribe = (callback: Callback, runImmediately?: boolean): void => {
    unsubscribe(callback);
    _callbacks.push(callback);
    if (running && runImmediately !== false && !_triggering) {
      callback(media);
    }
  };

  let checkFailures = 0;
  let oldFormat: string | undefined;

  const check = !win
    ? (): boolean | undefined => (running ? false : undefined)
    : (): boolean | undefined => {
        if (!running) {
          return;
        }
        let newFormat = win.getComputedStyle(elm!, '::after').content;
        if (newFormat === 'none' && checkFailures < 10) {
          checkFailures++;
          setTimeout(check, 67);
          return;
        }
        checkFailures = 0; // reset failure count

        newFormat = newFormat.replace(/['"]/g, '');

        const changeOccurred = newFormat !== oldFormat;
        if (changeOccurred) {
          media.is = newFormat;
          media.was = oldFormat;
          oldFormat = newFormat;
          _updateGroupFlags();
          _triggering = true;
          _callbacks.forEach((callback) => callback(media));
          _triggering = false;
        }
        return changeOccurred;
      };

  const checkDelay = options.checkDelay || DEFAULT_CHECK_DELAY;
  let checkTimeout: ReturnType<typeof setTimeout> | undefined;
  let calledWhileThrottling = false;

  const checkThrottled = !win
    ? (): void => undefined
    : (): void => {
        if (checkTimeout) {
          calledWhileThrottling = true;
          return;
        }
        check();
        checkTimeout = setTimeout(() => {
          calledWhileThrottling && check();
          calledWhileThrottling = false;
          checkTimeout = undefined;
        }, checkDelay);
      };

  const refresh = (hardRefresh?: boolean): boolean | undefined => {
    if (hardRefresh) {
      oldFormat = undefined;
    }
    return check();
  };

  const isRunning = (): boolean => running;

  const start = !win
    ? (): void => {
        running = true;
      }
    : (afresh?: boolean): void => {
        if (running) {
          return;
        }
        running = true;
        const doc = win.document;
        if (!elm) {
          elm = doc.getElementById(elmId) || undefined;
        }
        if (!elm) {
          elm = doc.createElement('del');
          elm.id = elmId;
          const elmStyle = elm.style;
          elmStyle.position = 'absolute';
          elmStyle.visibility = elmStyle.overflow = 'hidden';
          elmStyle.border =
            elmStyle.padding =
            elmStyle.margin =
            elmStyle.width =
            elmStyle.height =
              '0';
          elm.__isMine = true;
          doc.body.append(elm);
        }

        if (bindResizeEvent) {
          win.addEventListener('resize', checkThrottled);
        }

        refresh(afresh);
      };

  const stop = !win
    ? (): void => {
        running = false;
      }
    : (): void => {
        if (!running) {
          return;
        }
        running = false;
        if (bindResizeEvent) {
          win.removeEventListener('resize', checkThrottled);
        }
        if (elm && elm.__isMine) {
          elm.remove();
          elm = undefined;
        }
      };

  // Start by adding group flags (all false) to the media object
  _updateGroupFlags();

  if (!options.defer) {
    // Initialize the monitor immediately
    start();
  }

  return {
    /**
     * Whenever FormatChange detects a new `format` it runs any callbacks that have
     * `.subscribe()`d to be notified, passing them a reference to the
     * `formatMonitor.media` object.
     *
     * Each callback is immediately run upon subscription if
     * `formatMonitor.isRunning() === true` – so no separate "initialization" is
     * required.
     *
     * If the callback should NOT be run immediately, then pass `false` as a second
     * parameter to `.subscribe()`  – like so:
     *
     * ```js
     * formatMonitor.subscribe( myEventCallback, false )
     * ```
     */
    subscribe,

    /** Cancels a subscription */
    unsubscribe,

    /**
     * Tells you if the `window.onresize` monitoring is active or not. If your
     * monitor is set to `manual`, it simply tells you if it has been started.
     */
    isRunning,

    /**
     * Binds the `window.onresize` event handler to poll the CSS and trigger
     * event callbacks.
     *
     * This method is called automatically when a `FormatChange` instance is
     * created – unless the `defer` option is passed.
     */
    start,

    /**
     * Stop monitoring.
     * This does NOT unsubscribe any callbacks – only stops the onResize
     * CSS-polling and triggering of events
     */
    stop,

    /**
     * Quickly queries if the format has changed and triggers subscriptions if
     * needed. This is the method to use with the `manual` option.
     *
     * Returns:
     * - `true` if a change was detected and subscriptions were triggered.
     * - `false` if no change was detected.
     * - `undefined` if the monitor is not running or a check was not performed.
     */
    check,

    /**
     * Throttled version of check, perfect for binding to events that can fire
     * rapidly (like `resize`).
     */
    checkThrottled,

    /**
     * Refreshes the `media` object and triggers subscriptions when appropriate.
     * Similar to `check()`, with the added option to pass a `hardRefresh`
     * boolean argument to force a refresh (and trigger event callbacks) even
     * if the format hasn't really changed.
     *
     * Returns:
     * - `undefined` if the monitor is not running.
     * - `boolean` indicating if a change was detected and subscriptions triggered.
     */
    refresh,

    /**
     * The current FormatMonitorMedia object singleton
     */
    media: media as Readonly<FormatMonitorMedia<Group>>,
  };
};

export type FormatMonitor<Group extends string = string> = ReturnType<
  typeof makeFormatMonitor<Group>
>;
