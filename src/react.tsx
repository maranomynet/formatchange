import { useEffect, useRef, useState } from 'react';

import type { FormatMonitor, FormatMonitorMedia } from './formatchange';

/**
 * A factory function that generates helpful react hooks that are bound
 * to a specific `FormatChange` monitor instance.
 *
 * @see https://github.com/maranomynet/formatchange/tree/v3#makeformatmonitorhooks
 */
export const makeFormatMonitorHooks = <G extends string>(
  formatMonitor: FormatMonitor<G> | (() => FormatMonitor<G>)
) => {
  let _fmtMonitor: FormatMonitor<G> | undefined;
  const initializeFormatMonitor = () => {
    if (!_fmtMonitor) {
      _fmtMonitor = typeof formatMonitor === 'function' ? formatMonitor() : formatMonitor;
    }
    return _fmtMonitor;
  };

  const useFormatMonitor = (
    callback: ((media: Readonly<FormatMonitorMedia<G>>) => void) | undefined
  ) => {
    const fmtMonitor = initializeFormatMonitor();
    const callbackRef = useRef(callback);
    callbackRef.current = callback;

    const hasCallback = !!callback;

    useEffect(() => {
      if (callbackRef.current) {
        const callCallback: NonNullable<typeof callback> = (media) =>
          callbackRef.current!(media);

        fmtMonitor.subscribe(callCallback);
        return () => {
          fmtMonitor.unsubscribe(callCallback);
        };
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [
      hasCallback,
      // fmtMonitor // this is actually stable
    ]);

    return fmtMonitor.media;
  };

  const useMedia = () => {
    const fmtMonitor = initializeFormatMonitor();
    const [media, setMedia] = useState(() => ({ ...fmtMonitor.media }));
    useFormatMonitor((m) => setMedia({ ...m }));
    return media;
  };

  return {
    /**
     * Accepts a callback function that will be called when the `media` object
     * changes.
     *
     * The callback is stored internally in a ref object to guarantee the last
     * passed callback is used.
     *
     * If `undefined` is passed, the callback subscription is removed.
     *
     * @see https://github.com/maranomynet/formatchange/tree/v3#makeFormatMonitorHooks
     */
    useFormatMonitor,

    /**
     * Returns a copy of the current `media` object values.
     * Triggers a re-render when the screen-format changes.
     *
     * @see https://github.com/maranomynet/formatchange/tree/v3#makeFormatMonitorHooks
     */
    useMedia,
  };
};
