import { useMemo } from 'react';
import type { FuseOptions } from '@rippling/ui-utils/Fuse';
import { DEFAULT_FUSE_OPTIONS } from '../Select.constants';

type SelectFuseOptions = {
  fuseOptions: FuseOptions;
};

function useSelectFuseOptions(props: SelectFuseOptions) {
  const { fuseOptions: fuseOptionsProp } = props;

  const fuseOptions = useMemo(() => {
    return {
      ...DEFAULT_FUSE_OPTIONS,
      ...fuseOptionsProp,
    };
  }, [fuseOptionsProp]);

  return fuseOptions;
}

export { useSelectFuseOptions };
