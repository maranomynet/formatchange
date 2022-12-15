import React, { useEffect, useRef } from "react";
import { FormatChange, FormatMonitorGroupConfig } from "../formatchange";

/**
 * @deprecated Prefer `makeFormatMonitorHook()` instead.
 *
 * (May get removed in v3.0)
 */
export const withMediaProps: (...args: any[]) => any = (
  TargetComponent,
  formatMonitor,
  getPropsFromMedia
) => {
  const getStateFromMedia =
    getPropsFromMedia ||
    TargetComponent.getPropsFromMedia ||
    ((media: any) => media);

  class FormatMonitored extends React.Component {
    constructor(props: any) {
      super(props);
      this.getStateFromMedia = (media: any) => {
        this.setState(getStateFromMedia(media));
      };
      // NOTE: Don't run getStateFromMedia here because it
      // breaks the hydration of server-side-rendered HTML.
      this.state = {};
    }
    getStateFromMedia: (media: any) => void;

    componentDidMount() {
      formatMonitor.subscribe(this.getStateFromMedia);
    }
    componentWillUnmount() {
      formatMonitor.unsubscribe(this.getStateFromMedia);
    }

    render() {
      return <TargetComponent {...this.props} {...this.state} />;
    }
  }
  return FormatMonitored;
};

// ===========================================================================

/**
 * A factory function that generates a react hook that is bound
 * to a specific `FormatChange` monitor instance.
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
  };
