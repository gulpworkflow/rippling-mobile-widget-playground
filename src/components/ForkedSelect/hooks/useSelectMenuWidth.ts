import type { RefObject } from 'react';
import { useRef, useLayoutEffect, useCallback } from 'react';
import { throttle } from 'lodash';
import { BORDER_WIDTH } from '../Select.constants';

type DropdownOptions = {
  containerRef: RefObject<HTMLDivElement>;
  menuWidth?: number;
};

const MENU_WIDTH_THROTTLE_DELAY = 200;

/**
 * To set menu width on first menu visibility
 */
export default function useSelectMenuWidth(
  isMenuOpen: boolean,
  setMenuWidthCb: (width: number) => void,
  options: DropdownOptions,
) {
  const isDropdownWidthCalculatedRef = useRef(false);
  const { containerRef, menuWidth } = options;

  const updateMenuWidth = useCallback(() => {
    isDropdownWidthCalculatedRef.current = true;
    // fixed when dropdown width comes from context/props
    if (menuWidth) {
      setMenuWidthCb(menuWidth);
      return;
    }

    if (containerRef.current) {
      setMenuWidthCb(containerRef.current.offsetWidth - BORDER_WIDTH * 2);
    }
  }, [setMenuWidthCb, menuWidth, containerRef]);

  // update default menu width if not done already
  useLayoutEffect(() => {
    if (isMenuOpen && !isDropdownWidthCalculatedRef.current) {
      updateMenuWidth();
    }
  }, [updateMenuWidth, isMenuOpen]);

  // add an observer for container width change, to recalculate menu width
  useLayoutEffect(() => {
    if (containerRef.current) {
      const debouncedUpdater = throttle(updateMenuWidth, MENU_WIDTH_THROTTLE_DELAY);
      const resizeObserver = new window.ResizeObserver(debouncedUpdater);
      resizeObserver.observe(containerRef.current);

      return () => {
        resizeObserver.disconnect();
      };
    }
    return undefined;
  }, [updateMenuWidth, containerRef]);
}
