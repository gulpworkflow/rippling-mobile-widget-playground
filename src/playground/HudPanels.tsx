import React, { useCallback } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import type { PersonaId } from '@/data-models/types';
import { ALL_APPS } from '@/data-models/apps';
import {
  PERSONA_OPTIONS,
  HOURLY_PERSONAS,
  PERSONA_DERIVATION,
  getIntentSummary,
} from '@/data-models/personas';


const UserIntentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

export const HudPanel = styled.div<{ position: 'left' | 'right'; open: boolean }>`
  position: fixed;
  top: 0;
  ${({ position }) => position}: 0;
  width: 350px;
  height: 100vh;
  background: var(--chrome-surface);
  color: var(--chrome-text);
  z-index: 19999;
  display: flex;
  flex-direction: column;
  padding: 64px 24px 24px;
  box-shadow: ${({ open }) => open ? '0 0 40px var(--chrome-shadow)' : 'none'};
  transform: translateX(${({ position, open }) =>
    open ? '0' : position === 'left' ? '-100%' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), background 0.3s ease, color 0.3s ease;
`;

const HudTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--chrome-text-muted);
  margin: 0 0 16px;
`;

const HudSections = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
  overflow-y: auto;
`;

const HudCard = styled.div`
  background: var(--chrome-surface-card);
  border: 1px solid var(--chrome-border);
  border-radius: 10px;
  overflow: hidden;
`;

const HudCardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: var(--chrome-text-heading);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  border-bottom: 1px solid var(--chrome-border-subtle);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HudRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid var(--chrome-border-row);
  &:last-child {
    border-bottom: none;
  }
`;

const HudRowLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: var(--chrome-text-secondary);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HudRowPlaceholder = styled.div<{ variant?: 'toggle' | 'dropdown' }>`
  width: ${({ variant }) => (variant === 'dropdown' ? '80px' : '34px')};
  height: 20px;
  border-radius: ${({ variant }) => (variant === 'dropdown' ? '4px' : '10px')};
  background: var(--chrome-overlay);
  border: 1px solid var(--chrome-border-subtle);
`;

const HudToggleSwitch = styled.button<{ on: boolean }>`
  width: 42px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  position: relative;
  background: ${({ on }) => (on ? '#4ade80' : 'var(--chrome-toggle-off)')};
  transition: background 0.2s ease;
  padding: 0;
  flex-shrink: 0;
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ on }) => (on ? '20px' : '2px')};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #fff;
    box-shadow: 0 1px 3px rgba(0,0,0,0.15);
    transition: left 0.2s ease;
  }
`;

const PersonaCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
  border-bottom: 1px solid var(--chrome-border-subtle);
`;

const PersonaAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
  border: 1.5px solid var(--chrome-border);
`;

const PersonaSelectInline = styled.select`
  flex: 1;
  padding: 6px 8px;
  background: var(--chrome-overlay);
  border: 1px solid var(--chrome-border);
  border-radius: 6px;
  color: var(--chrome-text);
  font-size: 13px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  outline: none;
  appearance: auto;
  &:focus {
    border-color: var(--chrome-accent);
  }
  option {
    background: var(--chrome-surface);
    color: var(--chrome-text);
  }
`;

const HudRowValue = styled.span`
  font-size: 12px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: var(--chrome-text-muted);
  text-align: right;
`;

const HudFooter = styled.div`
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--chrome-border-subtle);
  font-size: 11px;
  font-family: 'SF Mono', 'Menlo', 'Consolas', monospace;
  color: var(--chrome-text-muted);
  line-height: 1.5;
`;

const HudPillWrap = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  padding: 10px 14px;
  align-items: center;
`;

const HudPill = styled.button<{ removable?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 10px;
  border-radius: 9999px;
  font-size: 11px;
  font-weight: 500;
  color: var(--chrome-text-secondary);
  background: var(--chrome-overlay);
  border: 1px solid var(--chrome-border);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.4;
  white-space: nowrap;
  cursor: ${({ removable }) => removable ? 'pointer' : 'default'};
  transition: background 0.15s, border-color 0.15s;

  & > .pill-x {
    font-size: 10px;
    line-height: 1;
    color: var(--chrome-pill-x);
    margin-left: 2px;
    transition: color 0.15s;
  }

  ${({ removable }) => removable && `
    &:hover {
      background: var(--chrome-pill-hover-bg);
      border-color: var(--chrome-pill-hover-border);
    }
    &:hover > .pill-x {
      color: var(--chrome-pill-x-hover);
    }
  `}
`;

const HudPillMore = styled.button`
  display: inline-block;
  padding: 3px 0;
  font-size: 11px;
  font-weight: 500;
  color: var(--chrome-accent);
  background: none;
  border: none;
  cursor: pointer;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  white-space: nowrap;
  &:hover {
    text-decoration: underline;
  }
`;

const HudEditButton = styled.button`
  padding: 5px 12px;
  border-radius: 6px;
  border: 1px solid var(--chrome-border);
  background: var(--chrome-overlay);
  color: var(--chrome-text-secondary);
  font-size: 12px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  cursor: pointer;
  flex-shrink: 0;
  &:hover {
    background: var(--chrome-overlay-hover);
  }
`;

// --- Shared HUD Chip Components ---

const HudChipWrapper = styled.div<{ $position: 'left' | 'right' }>`
  position: fixed;
  top: 16px;
  ${({ $position }) => $position}: 16px;
  z-index: 19998;
  display: flex;
  flex-direction: column;
  gap: 4px;
  @media (max-width: 768px) {
    display: none;
  }
`;

const HudChipEyebrow = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--chrome-text-muted);
  padding-left: 2px;
`;

const HudChipCard = styled.button`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 10px 14px;
  border-radius: 12px;
  border: 1px solid var(--chrome-border);
  background: var(--chrome-surface);
  color: var(--chrome-text);
  cursor: pointer;
  text-align: left;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: opacity 0.2s ease, background 0.3s ease, color 0.3s ease;
  max-width: 280px;
  box-shadow: 0 2px 8px var(--chrome-shadow);
  &:hover {
    opacity: 0.95;
  }
`;

const HudChipIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: var(--chrome-overlay);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  color: var(--chrome-text-secondary);
`;

const HudChipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const HudChipTitle = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--chrome-text);
  line-height: 1.2;
`;

const HudChipRow = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--chrome-text-secondary);
  line-height: 1.3;
`;

const HudChipPills = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--chrome-text-muted);
`;

const HudChipPill = styled.span`
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--chrome-overlay);
`;

// --- System Status Chip ---

interface SystemStatusSummaryProps {
  leftToggleRef: React.Ref<HTMLButtonElement>;
  onToggle: () => void;
  darkMode: boolean;
}

export const SystemStatusSummary: React.FC<SystemStatusSummaryProps> = ({
  leftToggleRef, onToggle, darkMode,
}) => {
  const cardStyle = {
    background: darkMode ? '#1a1a1a' : '#ffffff',
    color: darkMode ? '#fff' : '#1a1a1a',
    borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  };
  return (
    <HudChipWrapper $position="left">
      <HudChipEyebrow>System status</HudChipEyebrow>
      <HudChipCard ref={leftToggleRef} onClick={onToggle} aria-label="Toggle System Display panel" style={cardStyle}>
        <HudChipIcon style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
          <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor">
            <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
          </svg>
        </HudChipIcon>
        <HudChipContent>
          <HudChipTitle>iOS</HudChipTitle>
          <HudChipPills>
            <HudChipPill>{darkMode ? 'Dark mode' : 'Light mode'}</HudChipPill>
          </HudChipPills>
        </HudChipContent>
      </HudChipCard>
    </HudChipWrapper>
  );
};

// --- User Intent Chip ---

interface UserIntentSummaryProps {
  persona: PersonaId;
  personaAvatar: string;
  onClock: boolean;
  shiftToday: boolean;
  rightToggleRef: React.Ref<HTMLButtonElement>;
  onToggle: () => void;
  darkMode: boolean;
}

export const UserIntentSummary: React.FC<UserIntentSummaryProps> = ({
  persona, personaAvatar, onClock, shiftToday, rightToggleRef, onToggle, darkMode,
}) => {
  const s = getIntentSummary(persona);
  let text = `${s.employment} \u2022 Manager: ${s.manager} \u2022 Admin: ${s.admin}`;
  if (s.owner) text += ` \u2022 Owner: ${s.owner}`;
  const cardStyle = {
    background: darkMode ? '#1a1a1a' : '#ffffff',
    color: darkMode ? '#fff' : '#1a1a1a',
    borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  };
  return (
    <HudChipWrapper $position="right">
      <HudChipEyebrow>User intent</HudChipEyebrow>
      <HudChipCard ref={rightToggleRef} onClick={onToggle} aria-label="Toggle User Intent panel" style={cardStyle}>
        <UserIntentAvatar src={personaAvatar} alt="Persona" />
        <HudChipContent>
          <HudChipTitle>{PERSONA_OPTIONS.find(p => p.id === persona)?.label ?? 'Persona'}</HudChipTitle>
          <HudChipRow>{text}</HudChipRow>
          {HOURLY_PERSONAS.includes(persona) && (
            <HudChipPills>
              <HudChipPill>{onClock ? 'On clock' : 'Off clock'}</HudChipPill>
              <HudChipPill>{shiftToday ? 'Shift today' : 'No shift today'}</HudChipPill>
            </HudChipPills>
          )}
        </HudChipContent>
      </HudChipCard>
    </HudChipWrapper>
  );
};

// --- Left HUD Panel ---

interface LeftHudPanelProps {
  panelRef: React.Ref<HTMLDivElement>;
  open: boolean;
  darkMode: boolean;
  setDarkMode: React.Dispatch<React.SetStateAction<boolean>>;
}

export const LeftHudPanel: React.FC<LeftHudPanelProps> = ({ panelRef, open, darkMode, setDarkMode }) => (
  <HudPanel ref={panelRef} position="left" open={open} style={{ background: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#fff' : '#1a1a1a' }}>
    <HudTitle>System</HudTitle>
    <HudSections>
      <HudCard>
        <HudCardHeader>Navigation</HudCardHeader>
        <HudRow><HudRowLabel>Tab bar style</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
        <HudRow><HudRowLabel>Show labels</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
        <HudRow><HudRowLabel>Tab order</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
      </HudCard>

      <HudCard>
        <HudCardHeader>Appearance</HudCardHeader>
        <HudRow>
          <HudRowLabel>Dark mode</HudRowLabel>
          <HudToggleSwitch on={darkMode} onClick={() => setDarkMode(prev => !prev)} />
        </HudRow>
      </HudCard>

      <HudCard>
        <HudCardHeader>Home Framework</HudCardHeader>
        <HudRow><HudRowLabel>Layout mode</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
        <HudRow><HudRowLabel>Widget density</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
      </HudCard>

      <HudCard>
        <HudCardHeader>Experiments</HudCardHeader>
        <HudRow><HudRowLabel>Liquid glass</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
        <HudRow><HudRowLabel>Haptic feedback</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
      </HudCard>
    </HudSections>
  </HudPanel>
);

// --- Right HUD Panel ---

interface RightHudPanelProps {
  panelRef: React.Ref<HTMLDivElement>;
  open: boolean;
  darkMode: boolean;
  persona: PersonaId;
  personaAvatar: string;
  enabledApps: Set<string>;
  setEnabledApps: React.Dispatch<React.SetStateAction<Set<string>>>;
  onboarding: boolean;
  shiftToday: boolean;
  setShiftToday: React.Dispatch<React.SetStateAction<boolean>>;
  onClock: boolean;
  setOnClock: React.Dispatch<React.SetStateAction<boolean>>;
  handlePersonaChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  handleOnboardingToggle: () => void;
  setAppsModalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  updateParams: (p: PersonaId, o: boolean, apps: Set<string>) => void;
}

export const RightHudPanel: React.FC<RightHudPanelProps> = ({
  panelRef, open, darkMode, persona, personaAvatar,
  enabledApps, setEnabledApps, onboarding,
  shiftToday, setShiftToday, onClock, setOnClock,
  handlePersonaChange, handleOnboardingToggle,
  setAppsModalOpen, updateParams,
}) => (
  <HudPanel ref={panelRef} position="right" open={open} style={{ background: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#fff' : '#1a1a1a' }}>
    <HudTitle>User Intent</HudTitle>
    <HudSections>
      <HudCard>
        <PersonaCardHeader>
          <PersonaAvatar src={personaAvatar} alt="Persona" />
          <PersonaSelectInline value={persona} onChange={handlePersonaChange}>
            {PERSONA_OPTIONS.map(p => (
              <option key={p.id} value={p.id}>{p.label}</option>
            ))}
          </PersonaSelectInline>
        </PersonaCardHeader>
        {PERSONA_DERIVATION[persona].map(d => (
          <HudRow key={d.property}>
            <HudRowLabel>{d.property}</HudRowLabel>
            <HudRowValue>{d.value}</HudRowValue>
          </HudRow>
        ))}
      </HudCard>

      {HOURLY_PERSONAS.includes(persona) && (
        <HudCard>
          <HudCardHeader>Hourly intent</HudCardHeader>
          <HudRow>
            <HudRowLabel>Shift today</HudRowLabel>
            <HudToggleSwitch on={shiftToday} onClick={() => setShiftToday(prev => !prev)} />
          </HudRow>
          <HudRow>
            <HudRowLabel>On clock</HudRowLabel>
            <HudToggleSwitch on={onClock} onClick={() => setOnClock(prev => !prev)} />
          </HudRow>
        </HudCard>
      )}

      <HudCard>
        <HudCardHeader>
          Purchased SKU(s)
          <HudEditButton onClick={() => setAppsModalOpen(true)}>Edit</HudEditButton>
        </HudCardHeader>
        <HudPillWrap>
          {(() => {
            const enabled = ALL_APPS.filter(a => enabledApps.has(a.id));
            const shown = enabled.slice(0, 10);
            const remaining = enabled.length - shown.length;
            return (
              <>
                {shown.map(app => (
                  <HudPill key={app.id} removable onClick={() => {
                    setEnabledApps(prev => {
                      const next = new Set(prev);
                      next.delete(app.id);
                      updateParams(persona, onboarding, next);
                      return next;
                    });
                  }}>
                    {app.label}<span className="pill-x">{'\u2715'}</span>
                  </HudPill>
                ))}
                {remaining > 0 && (
                  <HudPillMore onClick={() => setAppsModalOpen(true)}>+{remaining} more</HudPillMore>
                )}
                {enabled.length === 0 && (
                  <HudPill>No apps selected</HudPill>
                )}
              </>
            );
          })()}
        </HudPillWrap>
      </HudCard>

      <HudCard>
        <HudCardHeader>Scenario</HudCardHeader>
        <HudRow>
          <HudRowLabel>Is Onboarding?</HudRowLabel>
          <HudToggleSwitch on={onboarding} onClick={handleOnboardingToggle} />
        </HudRow>
        <HudRow><HudRowLabel>Time of day</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
        <HudRow><HudRowLabel>Notifications</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
      </HudCard>

      <HudCard>
        <HudCardHeader>Data Profile</HudCardHeader>
        <HudRow><HudRowLabel>Company size</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
        <HudRow><HudRowLabel>Industry</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
      </HudCard>
    </HudSections>
    <HudFooter>
      State: persona={persona}, onboarding={String(onboarding)}, apps={enabledApps.size}/{ALL_APPS.length}
    </HudFooter>
  </HudPanel>
);

// --- Mobile HUD Sheet ---

const sheetSlideUp = keyframes`
  from { transform: translateY(100%); }
  to { transform: translateY(0); }
`;

const sheetFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const MobileSheetBackdrop = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media (max-width: 768px) {
    display: ${({ $isOpen }) => ($isOpen ? 'block' : 'none')};
  }
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 30000;
  animation: ${sheetFadeIn} 0.2s ease-out;
`;

const MobileSheetPanel = styled.div`
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 30001;
  border-radius: 20px 20px 0 0;
  padding: 12px 20px 32px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  animation: ${sheetSlideUp} 0.3s cubic-bezier(0.32, 0.72, 0, 1);
`;

const MobileSheetHandle = styled.div`
  width: 36px;
  height: 4px;
  border-radius: 2px;
  background: var(--chrome-text-muted);
  margin: 0 auto 4px;
  opacity: 0.5;
`;

const MobileSheetSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const MobileSheetChipCard = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 14px;
  border: 1px solid var(--chrome-border-subtle);
  background: var(--chrome-surface-card);
  color: var(--chrome-text);
  cursor: pointer;
  text-align: left;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background 0.15s ease;
  width: 100%;
  &:active {
    background: var(--chrome-overlay-hover);
  }
`;

const MobileSheetChipContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
  min-width: 0;
  flex: 1;
`;

const MobileSheetChipTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--chrome-text);
  line-height: 1.2;
`;

const MobileSheetChipSub = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: var(--chrome-text-secondary);
  line-height: 1.3;
`;

const MobileSheetChevron = styled.span`
  font-size: 18px;
  color: var(--chrome-text-muted);
  flex-shrink: 0;
`;

interface MobileHudSheetProps {
  isOpen: boolean;
  onClose: () => void;
  darkMode: boolean;
  persona: PersonaId;
  personaAvatar: string;
  onClock: boolean;
  shiftToday: boolean;
  onOpenSystemPanel: () => void;
  onOpenUserIntentPanel: () => void;
}

export const MobileHudSheet: React.FC<MobileHudSheetProps> = ({
  isOpen, onClose, darkMode, persona, personaAvatar,
  onClock, shiftToday, onOpenSystemPanel, onOpenUserIntentPanel,
}) => {
  const s = getIntentSummary(persona);
  const personaLabel = PERSONA_OPTIONS.find(p => p.id === persona)?.label ?? 'Persona';
  const isHourly = HOURLY_PERSONAS.includes(persona);

  const systemSummary = `iOS \u00b7 ${darkMode ? 'Dark mode' : 'Light mode'}`;
  let intentSummary = `${s.employment} \u00b7 ${s.manager ? 'Manager' : 'IC'}`;
  if (isHourly) intentSummary += ` \u00b7 ${onClock ? 'On clock' : 'Off clock'} \u00b7 ${shiftToday ? 'Shift today' : 'No shift'}`;

  const panelBg = darkMode ? '#1a1a1a' : '#ffffff';

  const handleSystem = useCallback(() => {
    onClose();
    requestAnimationFrame(() => onOpenSystemPanel());
  }, [onClose, onOpenSystemPanel]);

  const handleIntent = useCallback(() => {
    onClose();
    requestAnimationFrame(() => onOpenUserIntentPanel());
  }, [onClose, onOpenUserIntentPanel]);

  if (!isOpen) return null;

  return (
    <>
      <MobileSheetBackdrop $isOpen={isOpen} onClick={onClose} />
      <MobileSheetPanel style={{ background: panelBg }}>
        <MobileSheetHandle />

        <MobileSheetSection>
          <HudChipEyebrow>Configuration</HudChipEyebrow>

          <MobileSheetChipCard onClick={handleSystem}>
            <HudChipIcon style={{ background: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)' }}>
              <svg width="16" height="16" viewBox="0 0 384 512" fill="currentColor">
                <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184 4 273.5c0 26.2 4.8 53.3 14.4 81.2 12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
              </svg>
            </HudChipIcon>
            <MobileSheetChipContent>
              <MobileSheetChipTitle>System Status</MobileSheetChipTitle>
              <MobileSheetChipSub>{systemSummary}</MobileSheetChipSub>
            </MobileSheetChipContent>
            <MobileSheetChevron>›</MobileSheetChevron>
          </MobileSheetChipCard>

          <MobileSheetChipCard onClick={handleIntent}>
            <UserIntentAvatar src={personaAvatar} alt="Persona" />
            <MobileSheetChipContent>
              <MobileSheetChipTitle>{personaLabel}</MobileSheetChipTitle>
              <MobileSheetChipSub>{intentSummary}</MobileSheetChipSub>
            </MobileSheetChipContent>
            <MobileSheetChevron>›</MobileSheetChevron>
          </MobileSheetChipCard>
        </MobileSheetSection>
      </MobileSheetPanel>
    </>
  );
};
