import React, { useEffect, useRef } from "react";
import { FormatChange, FormatMonitorGroupConfig } from "../formatchange";

/**
 * A factory function that generates a react hook that is bound
 * to a specific `FormatChange` monitor instance.
 * 
 * @see https://github.com/maranomynet/formatchange/tree/v2#react-makeformatmonitorhook
 */
export const makeFormatMonitorHook =
  <G extends string, C extends FormatMonitorGroupConfig<G>>(
    formatMonitor: FormatChange<C> | (() => FormatChange<C>)
  ) =>
  (callback: ((media: FormatChange<C>["media"]) => void) | undefined) => {
    const fmtMonitor =
      typeof formatMonitor === "function" ? formatMonitor() : formatMonitor;
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const hasCallback = !!callback;
    useEffect(() => {
      if (callbackRef.current) {
        const callCallback = (media: typeof fmtMonitor["media"]) =>
          callbackRef.current && callbackRef.current(media);
        fmtMonitor.subscribe(callCallback);
        return () => {
          fmtMonitor.unsubscribe(callCallback);
        };
      }
    }, [hasCallback]);
    return fmtMonitor.media;
  };
