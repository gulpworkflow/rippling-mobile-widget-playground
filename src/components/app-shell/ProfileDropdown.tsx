import React from 'react';
import styled from '@emotion/styled';
import { getStateColor, useThemeSettings } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Dropdown from '@rippling/pebble/Dropdown';

interface ProfileDropdownProps {
  companyName: string;
  userInitial: string;
  adminMode: boolean;
  currentMode: 'light' | 'dark';
  onAdminModeToggle: () => void;
  theme: StyledTheme;
}

const ProfileSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  cursor: pointer;
  transition: background-color 150ms ease;

  &:hover {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  &:active {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'active')};
  }
`;

const CompanyName = styled.div<{ adminMode?: boolean }>`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLargeEmphasized};
  color: ${({ theme, adminMode }) => (adminMode ? 'white' : (theme as StyledTheme).colorOnSurface)};
  white-space: nowrap;
  transition: color 200ms ease;
`;

const UserAvatar = styled.div<{ adminMode?: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'white' : (theme as StyledTheme).colorPrimary};
  color: ${({ adminMode }) =>
    adminMode ? 'rgb(74, 0, 57)' : ({ theme }) => (theme as StyledTheme).colorOnPrimary};
  border: 1px solid
    ${({ adminMode }) =>
      adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  ${({ theme }) => (theme as StyledTheme).typestyleLabelMedium600};
  flex-shrink: 0;
  transition:
    background-color 200ms ease,
    color 200ms ease,
    border-color 200ms ease;
`;

export const ProfileDropdown: React.FC<ProfileDropdownProps> = ({
  companyName,
  userInitial,
  adminMode,
  currentMode,
  onAdminModeToggle,
  theme,
}) => {
  const { changeMode } = useThemeSettings();

  return (
    <Dropdown
      list={[
        {
          label: currentMode === 'light' ? 'Light Mode ✓' : 'Light Mode',
          leftIconType: Icon.TYPES.SUN_OUTLINE,
          value: 'light',
        },
        {
          label: currentMode === 'dark' ? 'Dark Mode ✓' : 'Dark Mode',
          leftIconType: Icon.TYPES.OVERNIGHT_OUTLINE,
          value: 'dark',
        },
        {
          isSeparator: true,
        },
        {
          label: adminMode ? 'Turn off Admin Mode' : 'Turn on Admin Mode',
          leftIconType: Icon.TYPES.LOCK_OUTLINE,
          value: 'admin',
        },
      ]}
      maxHeight={400}
      onChange={value => {
        if (value === 'admin') {
          onAdminModeToggle();
        } else if (value === 'light' || value === 'dark') {
          changeMode(value);
        }
      }}
      placement="bottom-end"
      shouldAutoClose
    >
      <ProfileSection theme={theme} style={{ cursor: 'pointer' }}>
        <CompanyName theme={theme} adminMode={adminMode}>
          {companyName}
        </CompanyName>
        <UserAvatar theme={theme} adminMode={adminMode}>
          {userInitial}
        </UserAvatar>
        <Icon
          type={Icon.TYPES.CHEVRON_DOWN}
          size={16}
          color={adminMode ? 'white' : theme.colorOnSurface}
        />
      </ProfileSection>
    </Dropdown>
  );
};

