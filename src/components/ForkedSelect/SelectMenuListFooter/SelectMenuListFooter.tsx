import React, { isValidElement } from 'react';
import Typography from '@rippling/pebble/Typography';
import type { ListFooter } from '../Select.types';
import type { ListFooterObject } from '../BaseSelect/BaseSelect.types';

const SelectMenuListFooter = ({
  footer,
  searchQuery,
}: {
  footer?: ListFooter;
  searchQuery?: string | undefined;
}) => {
  if (typeof footer === 'function') {
    return footer({ searchQuery });
  }

  if (typeof footer === 'object' && !isValidElement(footer)) {
    const { label, onClick } = footer as ListFooterObject;
    const labelText = typeof label === 'string' ? label : label({ searchQuery });

    return <Typography.Anchor onClick={onClick}>{labelText}</Typography.Anchor>;
  }

  return <>{footer}</>;
};

export default SelectMenuListFooter;
