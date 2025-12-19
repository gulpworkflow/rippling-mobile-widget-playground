import React, { useState, useEffect } from 'react';
import Modal from '@rippling/pebble/Modal';
import Button from '@rippling/pebble/Button';
import Input from '@rippling/pebble/Inputs';
import Icon from '@rippling/pebble/Icon';
import Tip from '@rippling/pebble/Tip';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';

/**
 * CreateCompositionModal
 * 
 * Modal for creating a new composition.
 * Features:
 * - Name input (prefilled with "Composition {n}")
 * - System name input (read-only, auto-generated from name)
 * - Info tooltip for system name
 * - Cancel and Save buttons
 */

interface CreateCompositionModalProps {
  isVisible: boolean;
  nextCompositionNumber: number;
  onCancel: () => void;
  onSave: (name: string, systemName: string) => void;
}

// Helper function to convert name to snake_case for system name
const toSnakeCase = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, '_'); // Replace spaces with underscores
};

export const CreateCompositionModal: React.FC<CreateCompositionModalProps> = ({
  isVisible,
  nextCompositionNumber,
  onCancel,
  onSave,
}) => {
  const { theme } = usePebbleTheme();
  const defaultName = `Composition ${nextCompositionNumber}`;
  
  const [name, setName] = useState(defaultName);
  const [systemName, setSystemName] = useState(toSnakeCase(defaultName));

  // Reset form when modal becomes visible
  useEffect(() => {
    if (isVisible) {
      const newDefaultName = `Composition ${nextCompositionNumber}`;
      setName(newDefaultName);
      setSystemName(toSnakeCase(newDefaultName));
    }
  }, [isVisible, nextCompositionNumber]);

  // Auto-generate system name from name
  useEffect(() => {
    setSystemName(toSnakeCase(name));
  }, [name]);

  const handleSave = () => {
    if (name.trim() && systemName.trim()) {
      onSave(name.trim(), systemName);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && name.trim()) {
      handleSave();
    }
  };

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onCancel}
      title="Create composition"
      aria-modal="true"
    >
      <ModalBody theme={theme}>
        <FormField theme={theme}>
          <Label theme={theme}>Name</Label>
          <Input.Text
            id="composition-name"
            value={name}
            onChange={(e: any) => setName(e?.target?.value || e)}
            onKeyDown={handleKeyDown}
            placeholder="Enter composition name"
            size={Input.Text.SIZES.M}
            autoFocus
          />
        </FormField>

        <FormField theme={theme}>
          <LabelRow>
            <Label theme={theme}>System name</Label>
            <Tip
              content="System name cannot be changed once set. It's used as a unique identifier."
              maxWidth={250}
            >
              <Icon
                type={Icon.TYPES.QUESTION_CIRCLE_OUTLINE}
                size={16}
                color={theme.colorOnSurfaceVariant}
              />
            </Tip>
          </LabelRow>
          <Input.Text
            id="composition-system-name"
            value={systemName}
            readOnly
            size={Input.Text.SIZES.M}
            disabled
          />
          <HelperText theme={theme}>
            Auto-generated from name
          </HelperText>
        </FormField>
      </ModalBody>
      
      <Modal.Footer>
        <Button
          appearance={Button.APPEARANCES.OUTLINE}
          onClick={onCancel}
          size={Button.SIZES.M}
        >
          Cancel
        </Button>
        <Button
          appearance={Button.APPEARANCES.PRIMARY}
          onClick={handleSave}
          size={Button.SIZES.M}
          disabled={!name.trim()}
        >
          Save
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ModalBody = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const Label = styled.label`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const LabelRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const HelperText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

