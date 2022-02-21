export type FormatMonitorMedia<
  Group extends string | undefined = undefined,
  GroupName extends string = Group extends string
    ? `${"is" | "was" | "became" | "left"}${Group}`
    : never
> = {
  is: string;
  was?: string;
} & Record<GroupName, boolean>;

export type FormatMonitorCallback<
  T extends FormatMonitorMedia = FormatMonitorMedia
> = (media: T) => void;

export type FormatMonitorGroupConfig<Group extends string> = Record<
  Group,
  Record<string, boolean>
>;

export type FormatMonitorOptions = {
  /**  Optionally supply a pre-existing element to query */
  elm?: HTMLElement;
  /** DOM id of the element to query. (Used if `elm` is missing)
   *
   * Default: `'mediaformat'`
   */
  elmId?: string;
  /** Tag-name used when auto-generating an element to query
   *
   * Default: `'del'`
   */
  elmTagName?: string;
  /** Set to `true` if you want to `.start()` manually */
  defer?: boolean;
  /** A custom `window` object/scope to monitor. */
  win?: Window;
  /** Set to `true` to disable `window.onresize` evend binding and run `.check()` manually */
  manual: false;
};
// ---------------------------------------------------------------------------

export default class FormatChange<Group extends string> {
  constructor(
    groups?: FormatMonitorGroupConfig<Group>,
    options?: FormatMonitorOptions
  );

  /** The current FormatMonitorMedia object */
  media: FormatMonitorMedia<Group>;

  /**
   * The groups object that was passed to the constructor.
   * If this property is changed you must run `.refresh()`.
   */
  formatGroups: FormatMonitorGroupConfig<Group>;

  /**
   * Whenever FormatChange detects a new `format` it runs any callbacks that have `.subscribe()`d to be notified, passing them a reference to the `formatMonitor.media` object.
   *
   * Each callback is immediately run upon subscription if `formatMonitor.isRunning() === true` – so no separate "initialization" is required.
   *
   * If the callback should not be run immediately, then pass `false` as a second parameter to `.subscribe()`  – like so: `formatMonitor.subscribe( myEventCallback, false )`
   */
  subscribe(
    callback: (media: FormatMonitorMedia<Group>) => void,
    runImmediately?: boolean
  ): void;
  /** Cancels a subscription */
  unsubscribe(callback: (media: FormatMonitorMedia<Group>) => void): void;

  /** Tells you if the `window.onresize` monitoring is active or not. If your monitor is set to `manual`, it simply tells you if it has been started. */
  isRunning(): boolean;
  /**
   * Binds the `window.onresize` event handler to poll the CSS and trigger event callbacks.
   * This method is called internally when a `FormatChange` instance is created – unless the `defer` option is passed.
   */
  start(): void;
  /**
   * Stop monitoring.
   * This does NOT unsubscribe any callbacks – only stops the onResize CSS-polling and triggering of events
   */
  stop(): void;

  /**
   * Quickly queries if the format has changed and triggers subscriptions if needed. This is the method to use with the `manual` option.
   *
   * Returns `true` if a change was detected and subscriptions were triggered.
   */
  check(): boolean;

  /**
   * Refreshes the `media` object and triggers subscriptions when appropriate – (always if a "hard-refresh" boolean argument is passed via `.refresh(true)`).
   *
   * This is the method to run if you have dynamically changed the formatGroups config or something weird.
   *
   * Returns `true` if the refresh was performed (i.e. if the monitoring `isRunning()`)
   */
  refresh(hardRefresh?: boolean): boolean;

  /** Esoteric helper that maps a complex mediaFormats config object, into a `FormatMonitorGroupConfig`  */
  static makeGroups<Group extends string>(
    groupConfig: Record<
      string,
      {
        group?: Group;
        [x: string | number]: unknown;
      }
    >
  ): FormatMonitorGroupConfig<Group>;
}
