import React from 'react';
import styled from '@emotion/styled';
import type { PersonaId } from '@/data-models/types';
import { ALL_APPS } from '@/data-models/apps';
import {
  PERSONA_OPTIONS,
  HOURLY_PERSONAS,
  PERSONA_DERIVATION,
  getIntentSummary,
} from '@/data-models/personas';

export const HudToggle = styled.button<{ position: 'left' | 'right' }>`
  position: fixed;
  top: 16px;
  ${({ position }) => position}: 16px;
  height: 36px;
  padding: 0 20px;
  gap: 8px;
  border-radius: 100px;
  border: 1px solid var(--chrome-border);
  background: var(--chrome-surface);
  color: var(--chrome-text);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20000;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0;
  box-shadow: 0 2px 8px var(--chrome-shadow);
  transition: opacity 0.2s ease, background 0.3s ease, color 0.3s ease;
  &:hover {
    opacity: 0.8;
  }
`;

export const UserIntentWrapper = styled.div`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 19998;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const UserIntentEyebrow = styled.span`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: var(--chrome-text-muted);
  padding-left: 2px;
`;

export const UserIntentCard = styled.button`
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

const UserIntentAvatar = styled.img`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const UserIntentContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
`;

const UserIntentPersona = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: var(--chrome-text);
  line-height: 1.2;
`;

const UserIntentRow = styled.span`
  font-size: 11px;
  font-weight: 500;
  color: var(--chrome-text-secondary);
  line-height: 1.3;
`;

const UserIntentPills = styled.span`
  display: flex;
  flex-wrap: wrap;
  gap: 4px 6px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  color: var(--chrome-text-muted);
`;

const UserIntentPill = styled.span`
  padding: 1px 5px;
  border-radius: 4px;
  background: var(--chrome-overlay);
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

// --- User Intent Card Component ---

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
  return (
    <UserIntentWrapper>
      <UserIntentEyebrow>User intent</UserIntentEyebrow>
      <UserIntentCard ref={rightToggleRef} onClick={onToggle} aria-label="Toggle User Intent panel" style={{ background: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#fff' : '#1a1a1a', borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }}>
        <UserIntentAvatar src={personaAvatar} alt="Persona" />
        <UserIntentContent>
          <UserIntentPersona>{PERSONA_OPTIONS.find(p => p.id === persona)?.label ?? 'Persona'}</UserIntentPersona>
          <UserIntentRow>{text}</UserIntentRow>
          {HOURLY_PERSONAS.includes(persona) && (
            <UserIntentPills>
              <UserIntentPill>{onClock ? 'On clock' : 'Off clock'}</UserIntentPill>
              <UserIntentPill>{shiftToday ? 'Shift today' : 'No shift today'}</UserIntentPill>
            </UserIntentPills>
          )}
        </UserIntentContent>
      </UserIntentCard>
    </UserIntentWrapper>
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
