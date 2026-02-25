import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { ALL_APPS, APP_GROUPS } from '@/data-models/apps';

const AppListContainer = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  margin-top: 16px;
`;

const AppGroupHeader = styled.div`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.4)'};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 4px 6px;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &:first-of-type {
    padding-top: 4px;
  }
`;

const AppRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 4px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.05)'};
  &:last-child {
    border-bottom: none;
  }
`;

const AppIconBox = styled.div<{ primary?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 10px;
  background: ${({ primary }) => primary || '#6750A4'};
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AppLabel = styled.span`
  ${({ theme }) => (theme as any).typestyleV2BodyLargeEmphasized};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
`;

const AppChevron = styled.span`
  margin-left: auto;
  font-size: 16px;
  color: ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0, 0, 0, 0.2)'};
`;

const DiscoveryAppList: React.FC<{ enabledApps: Set<string>; primary?: string }> = ({ enabledApps, primary }) => {
  const visibleApps = ALL_APPS.filter(a => enabledApps.has(a.id) && !a.hideFromAppList);
  const groups = APP_GROUPS.filter(g => visibleApps.some(a => a.group === g));
  if (groups.length === 0) return null;
  return (
    <AppListContainer>
      {groups.map(group => (
        <React.Fragment key={group}>
          <AppGroupHeader>{group}</AppGroupHeader>
          {visibleApps.filter(a => a.group === group).map(app => (
            <AppRow key={app.id}>
              <AppIconBox primary={primary}>
                <Icon type={app.icon} size={20} color="#fff" />
              </AppIconBox>
              <AppLabel>{app.displayName ?? app.label}</AppLabel>
              <AppChevron>›</AppChevron>
            </AppRow>
          ))}
        </React.Fragment>
      ))}
    </AppListContainer>
  );
};

export default DiscoveryAppList;
