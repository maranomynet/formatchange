import { makeFormatMonitor } from './src/formatchange';

const formatMonitor = makeFormatMonitor({
  Hamburger: { phone: true, phablet: true, tablet: true },
  Topmenu: { netbook: true, wide: true },
});
type MediaFormat1 = typeof formatMonitor.media;
