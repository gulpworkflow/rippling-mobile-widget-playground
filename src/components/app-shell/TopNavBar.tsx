import React from 'react';
import styled from '@emotion/styled';
import { getStateColor } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import { SearchBar } from './SearchBar';
import { ProfileDropdown } from './ProfileDropdown';

interface TopNavBarProps {
  companyName: string;
  userInitial: string;
  adminMode: boolean;
  currentMode: 'light' | 'dark';
  searchPlaceholder?: string;
  onAdminModeToggle: () => void;
  onLogoClick?: () => void;
  showNotificationBadge?: boolean;
  notificationCount?: number;
  theme: StyledTheme;
}

const TopNav = styled.nav<{ adminMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'rgb(74, 0, 57)' : (theme as StyledTheme).colorSurfaceBright};
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  align-items: center;
  padding: 0;
  z-index: 100;
  gap: ${({ theme }) => (theme as StyledTheme).space500};
  transition: background-color 200ms ease;
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  width: 266px;
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  height: 56px;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400};
  flex: 1;
`;

const Logo = styled.img`
  width: 127px;
  height: auto;
  display: block;
  cursor: pointer;
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  margin: -${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
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

const VerticalDivider = styled.div<{ adminMode?: boolean }>`
  width: 1px;
  height: 24px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'white' : (theme as StyledTheme).colorOnSurface};
  opacity: ${({ adminMode }) => (adminMode ? 0.3 : 0.2)};
`;

const RightSection = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400};
`;

const TopNavActions = styled.div<{ adminMode?: boolean }>`
  display: flex;
  align-items: center;

  button {
    position: relative;
  }

  ${({ adminMode }) =>
    adminMode &&
    `
    button svg,
    button i,
    button [class*="Icon"] {
      color: white !important;
      fill: white !important;
    }
  `}
`;

const NotificationBadge = styled.div`
  position: absolute;
  top: 6px;
  right: 6px;
  width: 16px;
  height: 16px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorError};
  border-radius: 50%;
  border: 2px solid ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  font-size: 10px;
  font-weight: 600;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ProfileDivider = styled.div`
  padding: ${({ theme }) =>
    `0 ${(theme as StyledTheme).space300} 0 ${(theme as StyledTheme).space400}`};
`;

export const TopNavBar: React.FC<TopNavBarProps> = ({
  companyName,
  userInitial,
  adminMode,
  currentMode,
  searchPlaceholder,
  onAdminModeToggle,
  onLogoClick,
  showNotificationBadge = false,
  notificationCount = 0,
  theme,
}) => {
  return (
    <TopNav theme={theme} adminMode={adminMode}>
      <LeftSection theme={theme}>
        <LogoContainer theme={theme}>
          <Logo
            src={adminMode || currentMode === 'dark' ? RipplingLogoWhite : RipplingLogoBlack}
            alt="Rippling"
            onClick={onLogoClick}
          />
        </LogoContainer>
        <VerticalDivider theme={theme} adminMode={adminMode} />
      </LeftSection>

      <RightSection theme={theme}>
        <SearchBar 
          placeholder={searchPlaceholder} 
          adminMode={adminMode} 
          theme={theme} 
        />

        <ActionsContainer theme={theme}>
          <TopNavActions theme={theme} adminMode={adminMode}>
            <Button.Icon
              icon={Icon.TYPES.HELP_OUTLINE}
              aria-label="Help"
              tip="Get help and support"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.M}
            />
            <Button.Icon
              icon={Icon.TYPES.ADD_CIRCLE_OUTLINE}
              aria-label="Create"
              tip="Create new item"
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.M}
            />
            {showNotificationBadge && (
              <div style={{ position: 'relative' }}>
                <Button.Icon
                  icon={Icon.TYPES.NOTIFICATION_OUTLINE}
                  aria-label="Notifications"
                  tip="View notifications"
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.M}
                />
                {notificationCount > 0 && (
                  <NotificationBadge theme={theme}>{notificationCount}</NotificationBadge>
                )}
              </div>
            )}
          </TopNavActions>

          <ProfileDivider theme={theme}>
            <VerticalDivider theme={theme} adminMode={adminMode} />
          </ProfileDivider>

          <ProfileDropdown
            companyName={companyName}
            userInitial={userInitial}
            adminMode={adminMode}
            currentMode={currentMode}
            onAdminModeToggle={onAdminModeToggle}
            theme={theme}
          />
        </ActionsContainer>
      </RightSection>
    </TopNav>
  );
};

