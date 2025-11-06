import React, { useState } from 'react';
import { usePebbleTheme, StyledTheme } from '../utils/theme';
import Select from '@rippling/pebble/Inputs/Select';

/**
 * Test demo for override system
 * Shows that components can be customized via src/overrides/
 */
const OverrideSystemTest: React.FC = () => {
  const { theme } = usePebbleTheme();
  const [selectedValue, setSelectedValue] = useState<string | undefined>();

  const options = [
    { label: 'Option 1', value: '1' },
    { label: 'Option 2', value: '2' },
    { label: 'Option 3', value: '3' },
  ];

  return (
    <div
      style={{
        padding: theme.space800,
        backgroundColor: theme.colorSurface,
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          ...theme.typestyleHeadingLarge600,
          color: theme.colorOnSurface,
          marginBottom: theme.space400,
        }}
      >
        Override System Test
      </h1>

      <p
        style={{
          ...theme.typestyleBodyMedium400,
          color: theme.colorOnSurfaceVariant,
          marginBottom: theme.space600,
        }}
      >
        Testing the override system. This uses Pebble source via Vite aliases.
        To customize, run: <code>yarn override Select</code>
      </p>

      <div style={{ maxWidth: '400px' }}>
        <Select
          id="test-select"
          isRequired={false}
          placeholder="Choose an option..."
          list={options}
          value={selectedValue}
          onChange={(value) => setSelectedValue(value as string)}
        />
      </div>

      {selectedValue && (
        <div
          style={{
            marginTop: theme.space400,
            padding: theme.space400,
            backgroundColor: theme.colorSuccessContainer,
            color: theme.colorOnSuccessContainer,
            borderRadius: theme.shapeCornerM,
          }}
        >
          ✓ Selected value: {selectedValue}
        </div>
      )}
    </div>
  );
};

export default OverrideSystemTest;

