import React from 'react';
import styled from '@emotion/styled';
import { getStateColor, useThemeSettings } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Dropdown from '@rippling/pebble/Dropdown';
import breakpoints from '@rippling/pebble/Constants/Breakpoints';

// Hide the company label and chevron below small-tablet — only avatar shows.
const BELOW_SMALL_TABLET = `@media screen and (max-width: ${breakpoints.BREAKPOINT_SMALL_TABLET})`;

interface ProfileDropdownProps {
  companyName: string;
  userInitial: string;
  adminMode: boolean;
  currentMode: 'light' | 'dark';
  onAdminModeToggle: () => void;
  onPersonaSelect?: () => void;
  personaLabel?: string;
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

  ${BELOW_SMALL_TABLET} {
    display: none;
  }
`;

const ProfileChevron = styled.div`
  display: flex;
  align-items: center;

  ${BELOW_SMALL_TABLET} {
    display: none;
  }
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
  onPersonaSelect,
  personaLabel,
  theme,
}) => {
  const { changeMode } = useThemeSettings();

  const menuItems: any[] = [
    {
      label: currentMode === 'light' ? 'Light Mode \u2713' : 'Light Mode',
      leftIconType: Icon.TYPES.SUN_OUTLINE,
      value: 'light',
    },
    {
      label: currentMode === 'dark' ? 'Dark Mode \u2713' : 'Dark Mode',
      leftIconType: Icon.TYPES.OVERNIGHT_OUTLINE,
      value: 'dark',
    },
  ];

  if (onPersonaSelect) {
    menuItems.push(
      { isSeparator: true },
      {
        label: personaLabel || 'Switch persona',
        leftIconType: Icon.TYPES.PEOPLE_GROUP_OUTLINE,
        value: 'persona',
      },
    );
  }

  menuItems.push(
    { isSeparator: true },
    {
      label: adminMode ? 'Turn off Admin Mode' : 'Turn on Admin Mode',
      leftIconType: Icon.TYPES.LOCK_OUTLINE,
      value: 'admin',
    },
  );

  return (
    <Dropdown
      list={menuItems}
      maxHeight={400}
      onChange={value => {
        if (value === 'admin') {
          onAdminModeToggle();
        } else if (value === 'persona') {
          onPersonaSelect?.();
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
        <ProfileChevron theme={theme}>
          <Icon
            type={Icon.TYPES.CHEVRON_DOWN}
            size={16}
            color={adminMode ? 'white' : theme.colorOnSurface}
          />
        </ProfileChevron>
      </ProfileSection>
    </Dropdown>
  );
};

