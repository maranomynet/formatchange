import {
  FormatChange,
  FormatMonitorGroupConfig,
  FormatMonitorOptions,
} from "./formatchange";

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
