import type { TextProps, TextRefObject } from '@rippling/pebble/Text';

export type SearchInputProps = TextProps & {
  isLoading?: boolean;
  innerRef: React.RefObject<TextRefObject>;
};
