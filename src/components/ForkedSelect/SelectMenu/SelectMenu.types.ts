import type { FlatListItem, MenuListProps } from '@rippling/pebble/MenuList';
import type { MenuListAriaProps, OnClickHandler } from '@rippling/pebble/MenuList/MenuList.types';
import type { PopperProps, TargetRenderer } from '@rippling/pebble/Popper';
import type { INPUT_SIZES } from '@rippling/pebble/Inputs/Input.constants';
import type { ListFooter, Value } from '../Select.types';

export type SelectMenuProps = Pick<PopperProps, 'isPositionFixed' | 'shouldUsePortal'> &
  Pick<
    MenuListProps,
    'onActiveIndexChange' | 'width' | 'maxWidth' | 'minWidth' | keyof MenuListAriaProps
  > & {
    children: TargetRenderer | React.ReactNode;
    emptyListPlaceholder?: string | React.ReactNode;
    footer?: ListFooter;
    header?: React.ReactNode;
    height?: number;
    isMenuOpen: boolean;
    isMulti: boolean;
    list: FlatListItem[];
    onClick: OnClickHandler;
    placement?: any;
    searchQuery?: string;
    shouldFlipIfNoSpace?: boolean;
    shouldScrollToSelectedValue?: MenuListProps['shouldScrollToSelectedValue'];
    value?: Value;
    size?: INPUT_SIZES;
  };
