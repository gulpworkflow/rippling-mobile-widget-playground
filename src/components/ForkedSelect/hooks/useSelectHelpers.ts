import { convertNestedListToFlatList } from '@rippling/ui-utils/List';
import { useCallback, useMemo } from 'react';
import type { Dispatch, SetStateAction } from 'react';
import { SELECT_ALL_VALUE } from '../Select.constants';
import { getValueFromSelectedOptions, hasAllItemsSelected } from '../Select.helpers';
import type {
  FlatListItem,
  NestedListItem,
  StateSelectedOption,
  Value,
  SelectProps,
} from '../Select.types';
import type { BaseSelectProps } from '../BaseSelect';
import type { OnClickEvent } from '@rippling/pebble/MenuList';

type Options = Pick<BaseSelectProps, 'isMulti' | 'selectedOptions' | 'list'> & {
  setSelectedOptions: Dispatch<SetStateAction<StateSelectedOption>>;
  setSelectedValues(newValue: Value): void;
  onChange: SelectProps['onChange'];
};

function useSelectHelpers({
  isMulti,
  selectedOptions,
  list,
  setSelectedOptions,
  onChange,
  setSelectedValues,
}: Options) {
  const setLatestSelectedValueAndOptions = useCallback(
    (newSelectedOptions: StateSelectedOption) => {
      setSelectedValues(getValueFromSelectedOptions(newSelectedOptions, isMulti));
      setSelectedOptions(newSelectedOptions);
    },
    [isMulti, setSelectedValues, setSelectedOptions],
  );

  const flatList = useMemo(() => {
    return convertNestedListToFlatList(list as NestedListItem[] | FlatListItem[]).flatList;
  }, [list]);

  const areAllItemsSelected = useMemo(() => {
    return isMulti && hasAllItemsSelected(selectedOptions, flatList);
  }, [flatList, isMulti, selectedOptions]);

  const onSelectOption = useCallback(
    (
      newlySelectedValues: Value,
      extraParams: {
        selectedOption?: StateSelectedOption;
        event?: OnClickEvent;
      },
    ) => {
      const { selectedOption: newlySelectedOptions, event } = extraParams;
      let updatedSelectedValues = newlySelectedValues;
      let updatedSelectedOptions = newlySelectedOptions;

      // Check if this is a created option
      const isCreatedOption = Array.isArray(newlySelectedOptions)
        ? newlySelectedOptions.some((option: any) => option?.isCreatedOption === true)
        : (newlySelectedOptions as any)?.isCreatedOption === true;

      if (updatedSelectedValues === SELECT_ALL_VALUE) {
        updatedSelectedValues = getValueFromSelectedOptions(flatList, isMulti);
        updatedSelectedOptions = flatList;
      }

      setSelectedValues(updatedSelectedValues);
      setSelectedOptions(updatedSelectedOptions);

      if (onChange) {
        onChange(updatedSelectedValues, updatedSelectedOptions, {
          event,
          created: isCreatedOption,
        });
      }
    },
    [flatList, isMulti, setSelectedOptions, onChange, setSelectedValues],
  );

  return { flatList, areAllItemsSelected, onSelectOption, setLatestSelectedValueAndOptions };
}

export default useSelectHelpers;
