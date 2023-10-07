import {
  FormatChange,
  FormatMonitorGroupConfig,
  FormatMonitorOptions,
} from "./formatchange";

/**
 * Adds a `jQuery.formatChange()` utility method, that generates and returns
 * `new FormatChange()` instances, and allows you to bind `formatchange` event
 * handlers using jQuery's `.on` and `.off` methods.
 *
 * @see https://github.com/maranomynet/formatchange/tree/v2#jquery-plugin
 */
export declare const jQueryPlugin: <T>(
  jQuery?: T,
  defaultEventName?: string
) => T & {
  formatChange: <
    GroupConfig extends FormatMonitorGroupConfig | object = object
  >(
    groups?: GroupConfig,
    options?: FormatMonitorOptions
  ) => FormatChange<GroupConfig>;
};
