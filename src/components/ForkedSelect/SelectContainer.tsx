/*
  Note: Dng this instead of React.memo(Select) to avoid tsx errors
 */
import React from 'react';
import Popper from '@rippling/pebble/Popper';
import Select from './Select';
import AsyncSelect from './AsyncSelect/AsyncSelect';
import type {
  List,
  ListAsyncFn,
  NestedListItem,
  FlatListItem,
  SelectProps,
  SelectRef,
} from './Select.types';
import { VARIANTS } from './Select.constants';

const isAsyncList = (list: List) => typeof list === 'function';

function renderSelect(props: SelectProps, ref: React.Ref<SelectRef>) {
  const { list, ...rest } = props;
  if (isAsyncList(list)) {
    return <AsyncSelect ref={ref} list={list as ListAsyncFn} {...rest} />;
  }
  return <Select ref={ref} list={list as NestedListItem[] | FlatListItem[]} {...rest} />;
}

const EnhancedSelect = React.forwardRef<SelectRef, SelectProps>((props, ref) =>
  renderSelect(props, ref),
);

/*
 Ability to select multiple values from select dropdown
 */
const MultiSelect = React.forwardRef<SelectRef, SelectProps>((props, ref) =>
  renderSelect(
    {
      ...props,
      isMulti: true,
    },
    ref,
  ),
);
MultiSelect.displayName = 'Input.Select.Multi';

const AppGroup = React.forwardRef<SelectRef, SelectProps>((props, ref) =>
  renderSelect(
    {
      ...props,
      isAppGroup: true,
      isMulti: true,
      theme: Select.THEMES.TRANSPARENT_BORDER,
    },
    ref,
  ),
);
AppGroup.displayName = 'Input.Select.AppGroup';

export default Object.assign(EnhancedSelect, {
  Multi: MultiSelect,
  AppGroup,
  VARIANTS,
  THEMES: Select.THEMES,
  SIZES: Select.SIZES,
  PLACEMENTS: Popper.PLACEMENTS,
});
