import React, { useState, useRef, useEffect, useCallback } from 'react';
import styled from '@emotion/styled';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Chip from '@rippling/pebble/Chip';
import Dropdown from '@rippling/pebble/Dropdown';
import Tip from '@rippling/pebble/Tip';

// =============================================================================
// TYPE DEFINITIONS
// =============================================================================

export type AIComposerMode = 'embedded' | 'global';
export type AIJobState = 'idle' | 'composing' | 'queued' | 'generating' | 'awaiting_user' | 'applied' | 'error' | 'canceled';
export type ComposerCapability = 'attachments' | 'voice' | 'integrations' | 'context';

export interface ContextItem {
  id: string;
  label: string;
  type: 'scope' | 'source' | 'attachment' | 'indicator';
  icon?: string;
}

export interface AIComposerProps {
  // Mode
  mode?: AIComposerMode;
  
  // Input
  value?: string;
  placeholder?: string;
  autoGrow?: boolean;
  maxRows?: number;
  disabled?: boolean;
  
  // Context
  showContextShelf?: boolean;
  contextItems?: ContextItem[];
  
  // Capabilities
  capabilities?: ComposerCapability[];
  
  // State
  jobState?: AIJobState;
  
  // Callbacks
  onSubmit?: (value: string, contextItems?: ContextItem[]) => void;
  onChange?: (value: string) => void;
  onAddContext?: (item: ContextItem) => void;
  onRemoveContext?: (id: string) => void;
  
  // Theme
  theme: StyledTheme;
}

// =============================================================================
// CUSTOM ICONS (from Lucide - open source)
// =============================================================================

const MicrophoneIcon: React.FC<{ size?: number; color?: string }> = ({ size = 20, color = 'currentColor' }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="none"
    stroke={color}
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3Z" />
    <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
    <line x1="12" x2="12" y1="19" y2="22" />
  </svg>
);

// =============================================================================
// STYLED COMPONENTS
// =============================================================================

const ComposerContainer = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutline};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  overflow: hidden;
`;

const ContextShelf = styled.div`
  padding: 8px ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space200};
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  min-height: 20px;
  align-items: center;
`;

const ComposerInputWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space300} ${({ theme }) => (theme as StyledTheme).space300};
`;

const ComposerTextarea = styled.textarea<{ $disabled?: boolean; $minHeight?: number; $maxHeight?: number }>`
  width: 100%;
  min-height: ${({ $minHeight }) => $minHeight ? `${$minHeight}px` : '24px'};
  max-height: ${({ $maxHeight }) => $maxHeight ? `${$maxHeight}px` : 'none'};
  border: none;
  outline: none;
  resize: none;
  overflow: auto;
  background: transparent;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme, $disabled }) => $disabled ? (theme as StyledTheme).colorOnSurfaceVariant : (theme as StyledTheme).colorOnSurface};
  line-height: 24px;
  
  &::placeholder {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  }
  
  &:disabled {
    cursor: not-allowed;
  }
`;

const ComposerActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  flex-shrink: 0;
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0 0 0;
`;

const ActionGroup = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const CustomIconButton = styled.button<{ $disabled?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutline};
  background: transparent;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  transition: background-color 0.15s ease;
  
  &:hover:not(:disabled) {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
  
  &:focus {
    outline: 2px solid ${({ theme }) => (theme as StyledTheme).colorPrimary};
    outline-offset: 2px;
  }
`;

const GlobalStatusBar = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space300};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  margin-top: ${({ theme }) => (theme as StyledTheme).space300};
`;

const StatusDot = styled.span<{ $state: AIJobState }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: ${({ theme, $state }) => {
    switch ($state) {
      case 'generating':
      case 'queued': return (theme as StyledTheme).colorPrimary;
      case 'error': return (theme as StyledTheme).colorError;
      case 'applied': return (theme as StyledTheme).colorSuccess;
      default: return (theme as StyledTheme).colorOnSurfaceVariant;
    }
  }};
  animation: ${({ $state }) => ($state === 'generating' ? 'pulse 1.5s infinite' : 'none')};
  
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

const StatusText = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

const getJobStateLabel = (state: AIJobState): string => {
  switch (state) {
    case 'composing': return 'Composing...';
    case 'queued': return 'Queued...';
    case 'generating': return 'Generating...';
    case 'awaiting_user': return 'Awaiting input';
    case 'applied': return 'Applied';
    case 'error': return 'Error';
    case 'canceled': return 'Canceled';
    default: return '';
  }
};

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export const AIComposer: React.FC<AIComposerProps> = ({
  mode = 'global',
  value: controlledValue,
  placeholder = 'Ask anything',
  autoGrow = true,
  maxRows = 6,
  disabled = false,
  showContextShelf = true,
  contextItems: controlledContextItems,
  capabilities = ['attachments', 'context'],
  jobState = 'idle',
  onSubmit,
  onChange,
  onAddContext,
  onRemoveContext,
  theme,
}) => {
  // Internal state for uncontrolled mode
  const [internalValue, setInternalValue] = useState('');
  const [internalContextItems, setInternalContextItems] = useState<ContextItem[]>([]);
  
  // Use controlled or internal state
  const inputValue = controlledValue !== undefined ? controlledValue : internalValue;
  const contextItems = controlledContextItems !== undefined ? controlledContextItems : internalContextItems;
  
  // Textarea ref for auto-grow
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Line height constant
  const LINE_HEIGHT = 24;
  const MIN_ROWS = 1;
  const minHeight = MIN_ROWS * LINE_HEIGHT;
  const maxHeight = maxRows * LINE_HEIGHT;
  
  // Auto-resize textarea
  const adjustTextareaHeight = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea || !autoGrow) return;
    
    textarea.style.height = 'auto';
    const scrollHeight = textarea.scrollHeight;
    const newHeight = Math.min(Math.max(scrollHeight, minHeight), maxHeight);
    textarea.style.height = `${newHeight}px`;
  }, [autoGrow, minHeight, maxHeight]);
  
  useEffect(() => {
    adjustTextareaHeight();
  }, [inputValue, adjustTextareaHeight]);
  
  // Helpers
  const hasCapability = (cap: ComposerCapability) => capabilities.includes(cap);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newValue = e.target.value;
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }
    onChange?.(newValue);
  };
  
  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit?.(inputValue, contextItems);
      if (controlledValue === undefined) {
        setInternalValue('');
      }
    }
  };
  
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };
  
  const handleAddContextItem = (item: ContextItem) => {
    if (controlledContextItems === undefined) {
      setInternalContextItems(prev => [...prev, item]);
    }
    onAddContext?.(item);
  };
  
  const handleRemoveContextItem = (id: string) => {
    if (controlledContextItems === undefined) {
      setInternalContextItems(prev => prev.filter(item => item.id !== id));
    }
    onRemoveContext?.(id);
  };
  
  return (
    <>
      <ComposerContainer theme={theme}>
        {/* Context Shelf - Global mode */}
        {showContextShelf && mode === 'global' && (
          <ContextShelf theme={theme}>
            {contextItems.map(item => (
              <Chip
                key={item.id}
                icon={item.icon}
                size={Chip.SIZES.M}
                isCloseable
                onClose={() => handleRemoveContextItem(item.id)}
              >
                {item.label}
              </Chip>
            ))}
            
            {hasCapability('context') && (
              <Tip content="Mention a person, job, or other record" placement={Tip.PLACEMENTS.TOP}>
                <span>
                  <Dropdown
                    list={[
                      { value: 'current-page', label: 'Current Page', leftIconType: Icon.TYPES.DOCUMENT_OUTLINE },
                      { value: 'selected-text', label: 'Selected Text', leftIconType: Icon.TYPES.FONT_HIGHLIGHT_OUTLINE },
                      { value: 'file', label: 'File...', leftIconType: Icon.TYPES.FOLDER_OUTLINE },
                      { value: 'knowledge-base', label: 'Knowledge Base', leftIconType: Icon.TYPES.BOOKS_OUTLINE },
                      { value: 'employee-record', label: 'Employee Record', leftIconType: Icon.TYPES.USER_OUTLINE },
                    ]}
                    onChange={(_, option) => {
                      handleAddContextItem({
                        id: String(Date.now()),
                        label: option.label ?? '',
                        type: 'scope',
                        icon: option.leftIconType ?? Icon.TYPES.DOCUMENT_OUTLINE,
                      });
                    }}
                    isPositionFixed
                  >
                    <Chip size={Chip.SIZES.M}>
                      @ Add Context
                    </Chip>
                  </Dropdown>
                </span>
              </Tip>
            )}
          </ContextShelf>
        )}
        
        {/* Input + Actions */}
        <ComposerInputWrapper theme={theme}>
          <ComposerTextarea
            ref={textareaRef}
            theme={theme}
            placeholder={placeholder}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            $disabled={disabled}
            $minHeight={minHeight}
            $maxHeight={autoGrow ? maxHeight : undefined}
          />
          
          <ComposerActions theme={theme}>
            {/* Leading slot */}
            <ActionGroup theme={theme}>
              {hasCapability('attachments') && (
                <Tip content="Add attachment" placement={Tip.PLACEMENTS.TOP}>
                  <span>
                    <Button.Icon
                      icon={Icon.TYPES.ADD}
                      size={Button.SIZES.S}
                      appearance={Button.APPEARANCES.OUTLINE}
                      aria-label="Add attachment"
                      isDisabled={disabled}
                    />
                  </span>
                </Tip>
              )}
              {hasCapability('integrations') && (
                <Tip content="Connect integration" placement={Tip.PLACEMENTS.TOP}>
                  <span>
                    <Button.Icon
                      icon={Icon.TYPES.DATA_CONNECTOR_OUTLINE}
                      size={Button.SIZES.S}
                      appearance={Button.APPEARANCES.OUTLINE}
                      aria-label="Add integration"
                      isDisabled={disabled}
                    />
                  </span>
                </Tip>
              )}
            </ActionGroup>
            
            {/* Trailing slot */}
            <ActionGroup theme={theme}>
              {hasCapability('voice') && (
                <Tip content="Voice input" placement={Tip.PLACEMENTS.TOP}>
                  <CustomIconButton
                    theme={theme}
                    $disabled={disabled}
                    disabled={disabled}
                    aria-label="Voice input"
                  >
                    <MicrophoneIcon size={16} />
                  </CustomIconButton>
                </Tip>
              )}
              <Tip content="Send message" placement={Tip.PLACEMENTS.TOP}>
                <span>
                  <Button.Icon
                    icon={Icon.TYPES.ARROW_UP}
                    size={Button.SIZES.S}
                    appearance={Button.APPEARANCES.PRIMARY}
                    aria-label="Send"
                    isDisabled={disabled || !inputValue.trim()}
                    onClick={handleSubmit}
                  />
                </span>
              </Tip>
            </ActionGroup>
          </ComposerActions>
        </ComposerInputWrapper>
      </ComposerContainer>
      
      {/* Global Mode: Inline Status */}
      {mode === 'global' && jobState !== 'idle' && (
        <GlobalStatusBar theme={theme}>
          <StatusDot theme={theme} $state={jobState} />
          <StatusText theme={theme}>{getJobStateLabel(jobState)}</StatusText>
          {jobState === 'generating' && (
            <Button 
              size={Button.SIZES.XS} 
              variant={Button.VARIANTS.TEXT}
            >
              Stop
            </Button>
          )}
        </GlobalStatusBar>
      )}
    </>
  );
};

export default AIComposer;

