import { throttle } from 'lodash';

export const logger = throttle((...args) => {
  // eslint-disable-next-line no-console
  console.debug(args);
}, 60);
