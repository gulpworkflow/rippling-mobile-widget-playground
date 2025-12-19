import React from 'react';
import Modal from '@rippling/pebble/Modal';
import Button from '@rippling/pebble/Button';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';

/**
 * DeleteCompositionModal
 * 
 * Confirmation modal for deleting a composition.
 * Follows the Blocking Confirmation pattern for destructive actions.
 */

interface DeleteCompositionModalProps {
  isVisible: boolean;
  compositionName: string;
  onCancel: () => void;
  onConfirm: () => void;
}

export const DeleteCompositionModal: React.FC<DeleteCompositionModalProps> = ({
  isVisible,
  compositionName,
  onCancel,
  onConfirm,
}) => {
  const { theme } = usePebbleTheme();

  return (
    <Modal
      isVisible={isVisible}
      onCancel={onCancel}
      title="Delete composition?"
      aria-modal="true"
    >
      <ModalBody theme={theme}>
        Are you sure you want to delete <strong>"{compositionName}"</strong>? This action cannot be undone in this prototype.
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
          appearance={Button.APPEARANCES.DESTRUCTIVE}
          onClick={onConfirm}
          size={Button.SIZES.M}
        >
          Delete
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

const ModalBody = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  line-height: 1.5;

  strong {
    font-weight: 600;
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

