import React from 'react';
import styled from '@emotion/styled';
import { ALL_APPS, APP_GROUPS } from '@/data-models/apps';
import type { PersonaId } from '@/data-models/types';

const AppsModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: var(--chrome-backdrop);
  z-index: 30000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AppsModalPanel = styled.div`
  width: 600px;
  max-height: 80vh;
  background: var(--chrome-surface);
  border-radius: 14px;
  border: 1px solid var(--chrome-border);
  display: flex;
  flex-direction: column;
  overflow: hidden;
  box-shadow: 0 20px 60px var(--chrome-shadow);
`;

const AppsModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 16px 12px;
  border-bottom: 1px solid var(--chrome-border-subtle);
`;

const AppsModalTitle = styled.span`
  font-size: 15px;
  font-weight: 600;
  color: var(--chrome-text);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const AppsModalClose = styled.button`
  background: none;
  border: none;
  color: var(--chrome-text-muted);
  font-size: 13px;
  cursor: pointer;
  padding: 4px 8px;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &:hover { color: var(--chrome-text); }
`;

const AppsModalBody = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 4px 0 12px;
`;

const HudCheckboxRow = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 8px 14px;
  border-bottom: 1px solid var(--chrome-border-row);
  cursor: pointer;
  &:last-child {
    border-bottom: none;
  }
`;

const HudCheckbox = styled.input<{ primaryColor?: string }>`
  width: 16px;
  height: 16px;
  accent-color: ${({ primaryColor }) => primaryColor || '#6750A4'};
  cursor: pointer;
  flex-shrink: 0;
`;

const HudCheckboxLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: var(--chrome-text-secondary);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ModalGroupRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px 4px;
`;

const ModalGroupName = styled.span`
  font-size: 11px;
  font-weight: 600;
  color: var(--chrome-text-muted);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const ModalActionRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 14px 6px;
`;

const ModalActionLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 13px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  color: var(--chrome-accent);
  &:hover { opacity: 0.8; }
`;

const ModalActionSep = styled.span`
  color: var(--chrome-border);
  font-size: 13px;
`;

const ModalGroupActions = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

interface AppsModalProps {
  enabledApps: Set<string>;
  setEnabledApps: React.Dispatch<React.SetStateAction<Set<string>>>;
  persona: PersonaId;
  onboarding: boolean;
  primaryColor: string;
  updateParams: (p: PersonaId, o: boolean, apps: Set<string>) => void;
  onClose: () => void;
}

const AppsModal: React.FC<AppsModalProps> = ({
  enabledApps,
  setEnabledApps,
  persona,
  onboarding,
  primaryColor,
  updateParams,
  onClose,
}) => {
  const handleAppToggle = (appId: string) => {
    setEnabledApps(prev => {
      const next = new Set(prev);
      if (next.has(appId)) next.delete(appId); else next.add(appId);
      updateParams(persona, onboarding, next);
      return next;
    });
  };

  return (
    <AppsModalOverlay onClick={onClose}>
      <AppsModalPanel onClick={e => e.stopPropagation()}>
        <AppsModalHeader>
          <AppsModalTitle>Purchased SKU(s)</AppsModalTitle>
          <AppsModalClose onClick={onClose}>Done</AppsModalClose>
        </AppsModalHeader>
        <AppsModalBody>
          <ModalActionRow>
            <ModalActionLink
              onClick={() => {
                const next = new Set(ALL_APPS.map(a => a.id));
                setEnabledApps(next);
                updateParams(persona, onboarding, next);
              }}
            >Select all</ModalActionLink>
            <ModalActionSep>|</ModalActionSep>
            <ModalActionLink
              onClick={() => {
                const next = new Set<string>();
                setEnabledApps(next);
                updateParams(persona, onboarding, next);
              }}
            >Unselect all</ModalActionLink>
          </ModalActionRow>
          {APP_GROUPS.map(group => {
            const groupApps = ALL_APPS.filter(a => a.group === group);
            const groupIds = groupApps.map(a => a.id);
            return (
              <React.Fragment key={group}>
                <ModalGroupRow>
                  <ModalGroupName>{group}</ModalGroupName>
                  <ModalGroupActions>
                    <ModalActionLink
                      onClick={() => {
                        const next = new Set(enabledApps);
                        groupIds.forEach(id => next.add(id));
                        setEnabledApps(next);
                        updateParams(persona, onboarding, next);
                      }}
                    >Select all</ModalActionLink>
                    <ModalActionSep>|</ModalActionSep>
                    <ModalActionLink
                      onClick={() => {
                        const next = new Set(enabledApps);
                        groupIds.forEach(id => next.delete(id));
                        setEnabledApps(next);
                        updateParams(persona, onboarding, next);
                      }}
                    >Unselect all</ModalActionLink>
                  </ModalGroupActions>
                </ModalGroupRow>
                {groupApps.map(app => (
                  <HudCheckboxRow key={app.id}>
                    <HudCheckbox
                      type="checkbox"
                      checked={enabledApps.has(app.id)}
                      onChange={() => handleAppToggle(app.id)}
                      primaryColor={primaryColor}
                    />
                    <HudCheckboxLabel>{app.label}</HudCheckboxLabel>
                  </HudCheckboxRow>
                ))}
              </React.Fragment>
            );
          })}
        </AppsModalBody>
      </AppsModalPanel>
    </AppsModalOverlay>
  );
};

export default AppsModal;
