import Styled from '@emotion/styled';
import React from 'react';
import { useTranslation } from '@rippling/lib-i18n/useTranslation';
import type { SwitchProps } from '@rippling/pebble/Inputs/Switch';
import Switch from '@rippling/pebble/Inputs/Switch';
import { ScreenReaderOnly } from '@rippling/pebble/accessibility';
import { useUniqueId } from '@rippling/pebble/hooks';
import type { CheckboxProps } from '@rippling/pebble/Inputs/Checkbox';
import Checkbox from '@rippling/pebble/Inputs/Checkbox';
import Text from '@rippling/pebble/Text';
import { usePebbleTheme, StyledTheme } from '../../../utils/theme';

/** styles * */
const StyledSwitchContainer = Styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
  height: ${(
    { theme }, // @ts-expect-error TODO: migrate core token to alias - don't add further usage of this token
  ) => theme.size1000};
`;
/** End: styles * */

/** contants * */
enum TOGGLE_TYPES {
  CHECKBOX = 'checkbox',
  SWITCH = 'switch',
}
/** End: contants * */

/** types * */
export type SelectAllToggleProps = Pick<
  SwitchProps,
  'aria-label' | 'aria-labelledby' | 'value' | 'isDisabled' | 'onChange' | 'name'
> &
  Pick<CheckboxProps, 'isIndeterminate'> & {
    selectedCount: number;
    /**
     * Whether to show the selection count
     */
    selectionCount?: boolean;
    /**
     * The type of the toggle
     */
    type?: TOGGLE_TYPES;
  };
/** End: types * */

const I18N_SKIP_DEFAULT_NAME = 'select-all';

const SelectAllToggle = (props: SelectAllToggleProps) => {
  const {
    isDisabled,
    onChange,
    name = I18N_SKIP_DEFAULT_NAME,
    selectedCount,
    value,
    isIndeterminate,
    selectionCount,
    'aria-label': ariaLabel,
    'aria-labelledby': ariaLabelledBy,
    type = TOGGLE_TYPES.SWITCH,
  } = props;

  const { theme } = usePebbleTheme();
  const { t } = useTranslation('one-ui', { keyPrefix: 'inputs.select.selectAllToggle' });
  const switchLabel = t('switchLabel');

  // eslint-disable-next-line rippling-eslint/no-hard-coded-strings
  const id = useUniqueId({ prefix: 'select-all-toggle' });

  const ariaLabelProps: Pick<SwitchProps, 'aria-label' | 'aria-labelledby'> = {};
  if (ariaLabelledBy) {
    ariaLabelProps['aria-labelledby'] = [ariaLabelledBy, id].join(' ');
  } else if (ariaLabel) {
    ariaLabelProps['aria-label'] = [ariaLabel, switchLabel].join(',');
  } else if (type === TOGGLE_TYPES.CHECKBOX) {
    ariaLabelProps['aria-label'] = switchLabel;
  }

  const showSelectionCount = selectionCount === undefined || selectionCount === true;

  function rederToggle() {
    if (type && type === TOGGLE_TYPES.CHECKBOX) {
      return (
        <Checkbox
          isDisabled={isDisabled}
          isIndeterminate={isIndeterminate}
          name={name}
          onChange={onChange}
          label={switchLabel}
          value={value}
          theme={Checkbox.THEMES.REVERSE}
          {...ariaLabelProps}
        />
      );
    }

    return (
      <Switch
        isDisabled={isDisabled}
        name={name}
        offLabel={switchLabel}
        onChange={onChange}
        onLabel={switchLabel}
        rightAlign
        value={value}
        {...ariaLabelProps}
      />
    );
  }

  return (
    <StyledSwitchContainer>
      {showSelectionCount ? (
        <Text
          typestyle={theme.typestyleBodyMedium600}
          color={isDisabled ? theme.colorOnDisabledSurface : theme.colorOnSurface}
        >
          {t('selectedCount', { selectedCount })}
        </Text>
      ) : (
        <span /> // Need to render something to keep the layout consistent
      )}
      {rederToggle()}
      <ScreenReaderOnly id={id}>{switchLabel}</ScreenReaderOnly>
    </StyledSwitchContainer>
  );
};

SelectAllToggle.TOGGLE_TYPES = TOGGLE_TYPES;

export default SelectAllToggle;
