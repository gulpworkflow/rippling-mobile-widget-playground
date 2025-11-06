import React, { useState } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import Button from '@rippling/pebble/Button';
import Modal from '@rippling/pebble/Modal';
import ModalFooter from '@rippling/pebble/Modal/ModalFooter';
import ModalCloseButton from '@rippling/pebble/Modal/ModalCloseButton';
import Drawer from '@rippling/pebble/Drawer';
import Dropdown from '@rippling/pebble/Dropdown';
import Select from '@rippling/pebble/Inputs/Select';
import ForkedSelect from './ForkedSelect'; // Our forked Select with rotating caret
import AnimatedForkedSelect from './AnimatedForkedSelect'; // Forked Select with animations
import { usePebbleTheme, StyledTheme } from '../utils/theme';
import { DURATION, EASING, SCALE, enteringMixins } from '../utils/animation-constants';
import AnimatedSelect from './AnimatedSelect';
import AnimatedDropdown from './AnimatedDropdown';

// Improved Button with active scale animation using CSS variable
const ImprovedButton = styled(Button)`
  transition: transform ${DURATION.fast} ${EASING.easeOut} !important;

  &:active {
    transform: scale(${SCALE.buttonActive}) !important;
  }

  /* Also apply on mousedown for immediate feedback */
  &[data-pressed='true'] {
    transform: scale(${SCALE.buttonActive}) !important;
  }
`;

// Modal backdrop fade animation
const fadeIn = keyframes`
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
`;

// Modal content fade + scale animation
const fadeScaleIn = keyframes`
  from {
    opacity: 0;
    transform: scale(${SCALE.initial});
  }
  to {
    opacity: 1;
    transform: scale(${SCALE.full});
  }
`;

// Drawer slide animation
const slideInRight = keyframes`
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
`;

// Wrapper for improved Modal animation
const ImprovedModalWrapper = styled.div`
  /* Override Pebble's default modal animations */
  > div > div {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut} !important;
  }

  /* Target the modal dialog specifically */
  [role='dialog'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut} !important;
  }

  /* Backdrop animation */
  > div:first-of-type {
    animation: ${fadeIn} ${DURATION.fast} ${EASING.easeOut} !important;
  }
`;

// Wrapper for improved Drawer animation
const ImprovedDrawerWrapper = styled.div`
  /* Override Pebble's default drawer animations */
  > div > div {
    animation: ${slideInRight} ${DURATION.standard} ${EASING.easeOut} !important;
  }

  [role='dialog'] {
    animation: ${slideInRight} ${DURATION.standard} ${EASING.easeOut} !important;
  }

  /* Also target the wrapper */
  > div {
    > div:last-child {
      animation: ${slideInRight} ${DURATION.standard} ${EASING.easeOut} !important;
    }
  }
`;

// Keyframe for fade + scale out
const fadeScaleOut = keyframes`
  from {
    opacity: 1;
    transform: scale(1);
  }
  to {
    opacity: 0;
    transform: scale(${SCALE.initial});
  }
`;

// Wrapper for improved Dropdown animation with exit support
const ImprovedDropdownWrapper = styled.div`
  /* Add a global style to handle exit animations */
  .improved-dropdown-menu-exit {
    animation: ${fadeScaleOut} ${DURATION.fast} ${EASING.easeIn} forwards;
    transform-origin: var(--transform-origin, top);
  }

  /* Target the dropdown menu for entrance */
  [role='menu'],
  [role='listbox'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
    transform-origin: var(--transform-origin, top);
  }
`;

// Wrapper for improved Select animation with exit support
const ImprovedSelectWrapper = styled.div`
  /* Add a global style to handle exit animations */
  .improved-select-menu-exit {
    animation: ${fadeScaleOut} ${DURATION.fast} ${EASING.easeIn} forwards;
    transform-origin: var(--transform-origin, top);
  }

  /* Target the select menu for entrance */
  [role='listbox'] {
    animation: ${fadeScaleIn} ${DURATION.fast} ${EASING.easeOut};
    transform-origin: var(--transform-origin, top);
  }
`;

const AnimationsDemo = () => {
  const { theme } = usePebbleTheme();

  // State for each component demo
  const [isModalBeforeOpen, setIsModalBeforeOpen] = useState(false);
  const [isModalAfterVisible, setIsModalAfterVisible] = useState(false);
  const [isClosing, setIsClosing] = useState(false);
  const [isDrawerBeforeOpen, setIsDrawerBeforeOpen] = useState(false);
  const [isDrawerAfterOpen, setIsDrawerAfterOpen] = useState(false);
  const [selectBeforeValue, setSelectBeforeValue] = useState<string | undefined>(undefined);
  const [selectAfterValue, setSelectAfterValue] = useState<string | undefined>(undefined);

  // Button demo state
  const [buttonSize, setButtonSize] = useState<string>(Button.SIZES.M);
  const [buttonAppearance, setButtonAppearance] = useState<string>(Button.APPEARANCES.PRIMARY);

  // Button options
  const buttonSizes = [
    { label: 'XS', value: Button.SIZES.XS },
    { label: 'S', value: Button.SIZES.S },
    { label: 'M', value: Button.SIZES.M },
    { label: 'L', value: Button.SIZES.L },
  ];

  const buttonAppearances = [
    { label: 'Primary', value: Button.APPEARANCES.PRIMARY },
    { label: 'Accent', value: Button.APPEARANCES.ACCENT },
    { label: 'Destructive', value: Button.APPEARANCES.DESTRUCTIVE },
    { label: 'Success', value: Button.APPEARANCES.SUCCESS },
    { label: 'Outline', value: Button.APPEARANCES.OUTLINE },
    { label: 'Ghost', value: Button.APPEARANCES.GHOST },
  ];

  // Prevent page shift when modal/drawer opens by adding scrollbar gutter
  React.useEffect(() => {
    document.documentElement.style.scrollbarGutter = 'stable';
    return () => {
      document.documentElement.style.scrollbarGutter = '';
    };
  }, []);

  // Handle modal after close with animation delay
  const handleModalAfterClose = React.useCallback(() => {
    setIsClosing(true);
    setTimeout(() => {
      setIsModalAfterVisible(false);
      setIsClosing(false);
    }, 150); // Match DURATION.fast
  }, []);

  const handleModalAfterOpen = React.useCallback(() => {
    setIsModalAfterVisible(true);
  }, []);

  const sectionStyle: React.CSSProperties = {
    marginBottom: '4rem',
    padding: '2rem 0',
  };

  const titleStyle: React.CSSProperties = {
    fontSize: '24px',
    fontWeight: 600,
    marginBottom: '1.5rem',
    color: theme.colorOnSurface,
  };

  const comparisonCardStyle: React.CSSProperties = {
    backgroundColor: theme.colorSurfaceBright,
    borderRadius: '12px',
    padding: '2rem',
    marginBottom: '1.5rem',
    border: `1px solid ${theme.colorOutlineVariant}`,
  };

  const comparisonContainerStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '2rem',
  };

  const columnStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: '1rem',
    alignItems: 'flex-start',
  };

  const labelStyle: React.CSSProperties = {
    fontSize: '14px',
    fontWeight: 600,
    color: theme.colorOnSurfaceVariant,
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  };

  const explanationStyle: React.CSSProperties = {
    fontSize: '14px',
    lineHeight: '1.6',
    color: theme.colorOnSurfaceVariant,
  };

  const codeStyle: React.CSSProperties = {
    fontFamily: 'monospace',
    backgroundColor: theme.colorSurface,
    padding: '2px 6px',
    borderRadius: '4px',
    fontSize: '13px',
  };

  return (
    <div
      style={{
        padding: '2rem',
        maxWidth: '1200px',
        margin: '0 auto',
        backgroundColor: theme.colorSurface,
        minHeight: '100vh',
      }}
    >
      <h1
        style={{
          fontSize: '32px',
          fontWeight: 700,
          marginBottom: '1rem',
          color: theme.colorOnSurface,
        }}
      >
        Animation System
      </h1>
      <p
        style={{
          fontSize: '16px',
          color: theme.colorOnSurfaceVariant,
          marginBottom: '3rem',
          lineHeight: '1.6',
        }}
      >
        A collection of animation patterns following modern best practices. Based on principles from{' '}
        <a
          href="https://emilkowal.ski/ui/7-practical-animation-tips"
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: theme.colorPrimary }}
        >
          Emil Kowalski's animation tips
        </a>{' '}
        and shadcn's aesthetic.
      </p>

      {/* Button Demo */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Button</h2>
        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
          <Dropdown
            list={buttonSizes}
            onChange={value => {
              const selected = buttonSizes.find(s => s.value === value);
              if (selected) setButtonSize(selected.value);
            }}
            shouldAutoClose
          >
            <Button size={Button.SIZES.S} appearance={Button.APPEARANCES.GHOST}>
              Size: {buttonSizes.find(s => s.value === buttonSize)?.label || 'M'}
            </Button>
          </Dropdown>
          <Dropdown
            list={buttonAppearances}
            onChange={value => {
              const selected = buttonAppearances.find(a => a.value === value);
              if (selected) setButtonAppearance(selected.value);
            }}
            shouldAutoClose
          >
            <Button size={Button.SIZES.S} appearance={Button.APPEARANCES.GHOST}>
              Appearance:{' '}
              {buttonAppearances.find(a => a.value === buttonAppearance)?.label || 'Primary'}
            </Button>
          </Dropdown>
        </div>
        <div style={comparisonCardStyle}>
          <div style={comparisonContainerStyle}>
            <div style={columnStyle}>
              <span style={labelStyle}>Before</span>
              <Button appearance={buttonAppearance as any} size={buttonSize as any}>
                Click Me
              </Button>
            </div>
            <div style={columnStyle}>
              <span style={labelStyle}>After</span>
              <div style={{ display: 'flex' }}>
                <span
                  style={{
                    display: 'block',
                    transition: `transform ${DURATION.fast} ${EASING.easeOut}`,
                    transformOrigin: '50% 50%',
                    willChange: 'transform',
                  }}
                  onMouseDown={e => {
                    e.currentTarget.style.transform = `scale(${SCALE.buttonActive})`;
                  }}
                  onMouseUp={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <Button appearance={buttonAppearance as any} size={buttonSize as any}>
                    Click Me
                  </Button>
                </span>
              </div>
            </div>
          </div>
        </div>
        <div style={explanationStyle}>
          <strong>Improvement:</strong> Added subtle scale-down effect on active state (
          <code style={codeStyle}>scale({SCALE.buttonActive})</code>) to provide immediate tactile
          feedback. Makes the interface feel more responsive.
          <br />
          <br />
          <strong>Variables:</strong> <code style={codeStyle}>duration: {DURATION.fast}</code>,{' '}
          <code style={codeStyle}>easing: {EASING.easeOut}</code>,{' '}
          <code style={codeStyle}>scale: {SCALE.buttonActive}</code>
        </div>
      </section>

      {/* Modal Demo */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Modal</h2>
        <div style={comparisonCardStyle}>
          <div style={comparisonContainerStyle}>
            <div style={columnStyle}>
              <span style={labelStyle}>Before</span>
              <Button
                appearance={Button.APPEARANCES.PRIMARY}
                size={Button.SIZES.M}
                onClick={() => setIsModalBeforeOpen(true)}
              >
                Open Modal
              </Button>
              <Modal
                isVisible={isModalBeforeOpen}
                onCancel={() => setIsModalBeforeOpen(false)}
                title="Before Animation"
              >
                <div style={{ padding: '1rem' }}>
                  <p>This is the default modal animation.</p>
                </div>
                <ModalFooter>
                  <ModalCloseButton>Close</ModalCloseButton>
                </ModalFooter>
              </Modal>
            </div>
            <div style={columnStyle}>
              <span style={labelStyle}>After</span>
              <Button
                appearance={Button.APPEARANCES.PRIMARY}
                size={Button.SIZES.M}
                onClick={handleModalAfterOpen}
              >
                Open Modal
              </Button>
              <Modal
                isVisible={isModalAfterVisible}
                onCancel={handleModalAfterClose}
                title="After Animation"
                shouldNotAnimate={true}
                overlayClassName={`improved-modal-overlay${isClosing ? ' closing' : ''}`}
              >
                <div style={{ padding: '1rem' }}>
                  <p>
                    Improved animation: Fade + scale from {SCALE.initial} with ease-out curve on
                    both enter and exit.
                  </p>
                </div>
                <ModalFooter>
                  <ModalCloseButton>Close</ModalCloseButton>
                </ModalFooter>
              </Modal>
              <style>{`
              .improved-modal-overlay {
                animation: improvedFadeIn ${DURATION.fast} ${EASING.easeOut} !important;
              }
              
              .improved-modal-overlay.closing {
                animation: improvedFadeOut ${DURATION.fast} ${EASING.easeIn} !important;
              }
              
              .improved-modal-overlay [role="dialog"] {
                animation: improvedFadeScaleIn ${DURATION.fast} ${EASING.easeOut} !important;
              }
              
              .improved-modal-overlay.closing [role="dialog"] {
                animation: improvedFadeScaleOut ${DURATION.fast} ${EASING.easeIn} !important;
              }
              
              @keyframes improvedFadeIn {
                from {
                  opacity: 0;
                }
                to {
                  opacity: 1;
                }
              }
              
              @keyframes improvedFadeOut {
                from {
                  opacity: 1;
                }
                to {
                  opacity: 0;
                }
              }
              
              @keyframes improvedFadeScaleIn {
                from {
                  opacity: 0;
                  transform: scale(${SCALE.initial});
                }
                to {
                  opacity: 1;
                  transform: scale(1);
                }
              }
              
              @keyframes improvedFadeScaleOut {
                from {
                  opacity: 1;
                  transform: scale(1);
                }
                to {
                  opacity: 0;
                  transform: scale(${SCALE.initial});
                }
              }
            `}</style>
            </div>
          </div>
        </div>
        <div style={explanationStyle}>
          <strong>Improvement:</strong> Modal enters and exits with fade + scale from{' '}
          <code style={codeStyle}>{SCALE.initial}</code> instead of <code style={codeStyle}>0</code>
          . This creates a more natural, balloon-like appearance that doesn't feel like it comes
          from nowhere. Uses <code style={codeStyle}>ease-out</code> on enter (starts fast) and{' '}
          <code style={codeStyle}>ease-in</code> on exit (ends fast) for natural motion.
          <br />
          <br />
          <strong>Variables:</strong> <code style={codeStyle}>duration: {DURATION.fast}</code>,{' '}
          <code style={codeStyle}>
            easing: {EASING.easeOut} / {EASING.easeIn}
          </code>
          , <code style={codeStyle}>initialScale: {SCALE.initial}</code>
          <br />
          <br />
          <strong>Mixin:</strong> <code style={codeStyle}>enteringMixins.fadeScaleIn</code> +{' '}
          <code style={codeStyle}>exitingMixins.fadeScaleOut</code>
        </div>
      </section>

      {/* Drawer Demo */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Drawer</h2>
        <div style={comparisonCardStyle}>
          <div style={comparisonContainerStyle}>
            <div style={columnStyle}>
              <span style={labelStyle}>Before</span>
              <Button
                appearance={Button.APPEARANCES.PRIMARY}
                size={Button.SIZES.M}
                onClick={() => setIsDrawerBeforeOpen(true)}
              >
                Open Drawer
              </Button>
              <Drawer
                isVisible={isDrawerBeforeOpen}
                onCancel={() => setIsDrawerBeforeOpen(false)}
                title="Before Animation"
              >
                <div style={{ padding: '1rem' }}>
                  <p>This is the default drawer slide animation.</p>
                </div>
                <Drawer.Footer>
                  <Drawer.CloseButton>Close</Drawer.CloseButton>
                </Drawer.Footer>
              </Drawer>
            </div>
            <div style={columnStyle}>
              <span style={labelStyle}>After</span>
              <Button
                appearance={Button.APPEARANCES.PRIMARY}
                size={Button.SIZES.M}
                onClick={() => setIsDrawerAfterOpen(true)}
              >
                Open Drawer
              </Button>
              <Drawer
                isVisible={isDrawerAfterOpen}
                onCancel={() => setIsDrawerAfterOpen(false)}
                title="After Animation"
                shouldNotAnimate={true}
                overlayClassName="improved-drawer-overlay"
              >
                <div style={{ padding: '1rem' }}>
                  <p>
                    Improved animation: Smooth slide with {DURATION.standard} duration and ease-out
                    curve for responsive feel.
                  </p>
                </div>
                <Drawer.Footer>
                  <Drawer.CloseButton>Close</Drawer.CloseButton>
                </Drawer.Footer>
              </Drawer>
              <style>{`
              .improved-drawer-overlay [role="dialog"] {
                animation: improvedSlideInRight ${DURATION.standard} ${EASING.easeOut} !important;
              }
              
              @keyframes improvedSlideInRight {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>
            </div>
          </div>
        </div>
        <div style={explanationStyle}>
          <strong>Improvement:</strong> Drawer slides in with{' '}
          <code style={codeStyle}>{DURATION.standard}</code> duration using{' '}
          <code style={codeStyle}>ease-out</code> curve. Starts fast for immediate feedback, then
          eases to a gentle stop.
          <br />
          <br />
          <strong>Variables:</strong> <code style={codeStyle}>duration: {DURATION.standard}</code>,{' '}
          <code style={codeStyle}>easing: {EASING.easeOut}</code>
          <br />
          <br />
          <strong>Mixin:</strong> <code style={codeStyle}>enteringMixins.slideInRight</code>
        </div>
      </section>

      {/* Select Demo */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Select</h2>
        <div style={comparisonCardStyle}>
          <div style={comparisonContainerStyle}>
            <div style={columnStyle}>
              <span style={labelStyle}>Before</span>
              <Select
                placeholder="Select Currency"
                list={[
                  { label: 'Ethereum', value: 'eth' },
                  { label: 'Bitcoin', value: 'btc' },
                  { label: 'Solana', value: 'sol' },
                ]}
                value={selectBeforeValue}
                onChange={value => setSelectBeforeValue(value as string)}
              />
            </div>
            <div style={columnStyle}>
              <span style={labelStyle}>After</span>
              <AnimatedForkedSelect
                id="select-after"
                isRequired={false}
                placeholder="Select Currency"
                list={[
                  { label: 'Ethereum', value: 'eth' },
                  { label: 'Bitcoin', value: 'btc' },
                  { label: 'Solana', value: 'sol' },
                ]}
                value={selectAfterValue}
                onChange={value => setSelectAfterValue(value as string)}
              />
            </div>
          </div>
        </div>
        <div style={explanationStyle}>
          <strong>Improvement:</strong> Select menu opens and closes with fade + scale from{' '}
          <code style={codeStyle}>{SCALE.initial}</code> in{' '}
          <code style={codeStyle}>{DURATION.fast}</code>, matching the Dropdown animation. The caret
          icon rotates smoothly 180° instead of swapping between up/down icons. Uses{' '}
          <code style={codeStyle}>ease-out</code> on enter (starts fast) and{' '}
          <code style={codeStyle}>ease-in</code> on exit (ends fast) for natural motion.
          <br />
          <br />
          <strong>Variables:</strong> <code style={codeStyle}>duration: {DURATION.fast}</code>,{' '}
          <code style={codeStyle}>
            easing: {EASING.easeOut} / {EASING.easeIn}
          </code>
          , <code style={codeStyle}>initialScale: {SCALE.initial}</code>
          <br />
          <br />
          <strong>Mixin:</strong> <code style={codeStyle}>enteringMixins.fadeScaleIn</code> +{' '}
          <code style={codeStyle}>exitingMixins.fadeScaleOut</code>
          <br />
          <br />
          <strong>Note:</strong> The rotating caret and enter/exit animations required forking
          Pebble's Select component to replace icon swapping with CSS rotation, add state management
          for closing delays, and apply custom animations.
        </div>
      </section>

      {/* Dropdown Demo */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Dropdown</h2>
        <div style={comparisonCardStyle}>
          <div style={comparisonContainerStyle}>
            <div style={columnStyle}>
              <span style={labelStyle}>Before</span>
              <Dropdown
                list={[
                  { label: 'Edit', value: 'edit' },
                  { label: 'Duplicate', value: 'duplicate' },
                  { label: 'Archive', value: 'archive' },
                  { label: 'Delete', value: 'delete' },
                ]}
              >
                <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.M}>
                  Actions
                </Button>
              </Dropdown>
            </div>
            <div style={columnStyle}>
              <span style={labelStyle}>After</span>
              <AnimatedDropdown
                list={[
                  { label: 'Edit', value: 'edit' },
                  { label: 'Duplicate', value: 'duplicate' },
                  { label: 'Archive', value: 'archive' },
                  { label: 'Delete', value: 'delete' },
                ]}
              >
                <Button appearance={Button.APPEARANCES.OUTLINE} size={Button.SIZES.M}>
                  Actions
                </Button>
              </AnimatedDropdown>
            </div>
          </div>
        </div>
        <div style={explanationStyle}>
          <strong>Improvement:</strong> Dropdown menu opens with fade + scale from{' '}
          <code style={codeStyle}>{SCALE.initial}</code> in{' '}
          <code style={codeStyle}>{DURATION.fast}</code>. Uses origin-aware animation (scales from
          trigger position) with <code style={codeStyle}>ease-out</code> for snappy feel.
          <br />
          <br />
          <strong>Variables:</strong> <code style={codeStyle}>duration: {DURATION.fast}</code>,{' '}
          <code style={codeStyle}>easing: {EASING.easeOut}</code>,{' '}
          <code style={codeStyle}>initialScale: {SCALE.initial}</code>
          <br />
          <br />
          <strong>Mixin:</strong> <code style={codeStyle}>enteringMixins.fadeScaleIn</code> +{' '}
          <code style={codeStyle}>transform-origin</code>
        </div>
      </section>

      {/* Animation System Overview */}
      <section style={sectionStyle}>
        <h2 style={titleStyle}>Animation System Constants</h2>
        <div style={explanationStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '1rem', fontSize: '16px', fontWeight: 600 }}>
            Duration Tokens
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>
              <code style={codeStyle}>fast: {DURATION.fast}</code> - Quick interactions (buttons,
              tooltips)
            </li>
            <li>
              <code style={codeStyle}>standard: {DURATION.standard}</code> - Most UI animations
              (drawers, modals)
            </li>
            <li>
              <code style={codeStyle}>long: {DURATION.long}</code> - Complex transitions (page
              changes)
            </li>
          </ul>

          <h3
            style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '16px', fontWeight: 600 }}
          >
            Easing Curves
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>
              <code style={codeStyle}>easeOut: {EASING.easeOut}</code> - For entering elements
              (starts fast)
            </li>
            <li>
              <code style={codeStyle}>easeIn: {EASING.easeIn}</code> - For exiting elements
            </li>
            <li>
              <code style={codeStyle}>easeInOut: {EASING.easeInOut}</code> - For elements that
              transform
            </li>
          </ul>

          <h3
            style={{ marginTop: '1.5rem', marginBottom: '1rem', fontSize: '16px', fontWeight: 600 }}
          >
            Scale Values
          </h3>
          <ul style={{ margin: 0, paddingLeft: '1.5rem' }}>
            <li>
              <code style={codeStyle}>buttonActive: {SCALE.buttonActive}</code> - Button press
              feedback
            </li>
            <li>
              <code style={codeStyle}>initial: {SCALE.initial}</code> - Starting scale for entering
              elements
            </li>
            <li>
              <code style={codeStyle}>full: {SCALE.full}</code> - Final scale (100%)
            </li>
          </ul>
        </div>
      </section>
    </div>
  );
};

export default AnimationsDemo;
