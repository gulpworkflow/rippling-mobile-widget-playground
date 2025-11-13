import React from 'react';
import { sanitizeTheme } from '@rippling/pebble/Internals/hooks';
import Text from '@rippling/pebble/Text';
import { SEARCH_TEST_ID } from '../Select.constants';
import type { SearchInputProps } from './SearchInput.types';

const SearchInput = (props: SearchInputProps) => {
  const {
    isDisabled,
    onChange,
    onFocus,
    onBlur,
    onKeyDown,
    innerRef,
    placeholder,
    theme,
    value,
    ...rest
  } = props;

  return (
    <Text
      ref={innerRef}
      autoComplete="auto-complete-off"
      shouldPersistCursorPosition
      canClear={false}
      isDisabled={isDisabled}
      onBlur={onBlur}
      onChange={onChange}
      onFocus={onFocus}
      onKeyDown={onKeyDown}
      placeholder={placeholder}
      testId={SEARCH_TEST_ID}
      theme={sanitizeTheme(Text.THEMES.INLINE_SELECT_SEARCH, theme)}
      value={value}
      {...rest}
    />
  );
};

export default React.memo(SearchInput);
