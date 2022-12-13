import { FormatChange } from "./formatchange";
import { makeFormatMonitorHook } from "./src/react";

/* eslint-disable
  @typescript-eslint/ban-ts-comment,
  @typescript-eslint/no-unused-vars,
  @typescript-eslint/no-unsafe-member-access
*/

const formatMonitor1 = new FormatChange({
  Hamburger: { phone: true, phablet: true, tablet: true },
  Topmenu: { netbook: true, wide: true },
});
type MediaFormat1 = typeof formatMonitor1.media;
const groupConfig1 = formatMonitor1.formatGroups;
const Hamburger = groupConfig1.Hamburger;
// @ts-expect-error  (reason)
const notGroup1 = groupConfig1.asdf;
const Format1 = Hamburger.phone;
// @ts-expect-error  (reason)
const notFormat1 = Hamburger.notafoo;
const useFormatMonitor1 = makeFormatMonitorHook(formatMonitor1);

const formatMonitor2 = new FormatChange();
type MediaFormat2 = typeof formatMonitor2.media;
const groupConfig2 = formatMonitor2.formatGroups;
// @ts-expect-error  (reason)
const notGroup2 = groupConfig2.asdfasdf;
const useFormatMonitor2 = makeFormatMonitorHook(formatMonitor2);

const formatMonitor3 = new FormatChange({});
type MediaFormat3 = typeof formatMonitor3.media;
const groupConfig3 = formatMonitor3.formatGroups;
// @ts-expect-error  (reason)
const notGroup3 = groupConfig3.asdfasdf;
const useFormatMonitor3 = makeFormatMonitorHook(formatMonitor3);
