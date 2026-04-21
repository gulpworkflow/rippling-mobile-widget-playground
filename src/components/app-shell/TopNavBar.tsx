import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { getStateColor } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Dropdown from '@rippling/pebble/Dropdown';
import breakpoints from '@rippling/pebble/Constants/Breakpoints';
import RipplingLogoBlack from '@/assets/rippling-logo-black.svg';
import RipplingLogoWhite from '@/assets/rippling-logo-white.svg';
import RipplingMonogramBlack from '@/assets/rippling-monogram-black.svg';
import RipplingMonogramWhite from '@/assets/rippling-monogram-white.svg';
import RipplingAiSpark from '@/assets/rippling-ai-spark.svg';
import { SearchBar } from './SearchBar';
import { ProfileDropdown } from './ProfileDropdown';

// Pebble responsive breakpoints (from @rippling/pebble/Constants/Breakpoints):
// - BREAKPOINT_SMALL_TABLET: 769px — below this = compact mobile nav
// - BREAKPOINT_TABLET:       1025px — below this = sidebar hidden, content full-width
const BELOW_TABLET = `@media screen and (max-width: ${breakpoints.BREAKPOINT_TABLET})`;
const BELOW_SMALL_TABLET = `@media screen and (max-width: ${breakpoints.BREAKPOINT_SMALL_TABLET})`;

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
  onPersonaSelect?: () => void;
  personaLabel?: string;
  onAiToggle?: () => void;
  aiPanelOpen?: boolean;
  onMenuToggle?: () => void;
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

  ${BELOW_TABLET} {
    gap: 0;
  }

  /* Admin-mode icon tint applied at the root so every icon across the bar
     turns white. Pebble's Icon renders as <span data-icon="..."> with the
     glyph painted via a ::before pseudo from an icon font, so the color
     property on the span is the only thing that actually tints the icon.
     We deliberately target [data-icon] because the emotion hashed class
     (StyledIcon) is stripped in production builds. */
  ${({ adminMode }) =>
    adminMode &&
    `
    [data-icon],
    [data-icon]::before {
      color: #ffffff !important;
    }
    button img {
      filter: brightness(0) invert(1) !important;
    }
  `}
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  width: 266px;

  ${BELOW_TABLET} {
    width: auto;
    flex-shrink: 0;
  }
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

  ${BELOW_SMALL_TABLET} {
    display: none;
  }
`;

const MonogramLogo = styled.img`
  width: 28px;
  height: auto;
  display: none;
  cursor: pointer;
  padding: ${({ theme }) => (theme as StyledTheme).space200};
  margin: -${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  transition: background-color 150ms ease;

  &:hover {
    background-color: ${({ theme }) =>
      getStateColor((theme as StyledTheme).colorSurfaceBright, 'hover')};
  }

  ${BELOW_SMALL_TABLET} {
    display: block;
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
  height: 100%;
  position: relative;
`;

const SearchCenter = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  position: relative;
  left: 60px;

  ${BELOW_TABLET} {
    left: 0;
    justify-content: flex-end;
    padding-right: ${({ theme }) => (theme as StyledTheme).space200};
  }

  ${BELOW_SMALL_TABLET} {
    flex: 1;
    justify-content: flex-end;
    padding-right: 0;
  }
`;

// Desktop search bar wrapper — hidden on small breakpoints in favor of the
// search icon button (matches Pebble mobile nav pattern).
const DesktopSearch = styled.div`
  flex: 1;
  display: flex;
  justify-content: center;
  width: 100%;

  ${BELOW_SMALL_TABLET} {
    display: none;
  }
`;

// Mobile-only triggers (search / overflow / hamburger) are always rendered
// on a dark top bar per the screenshot mock, so their icons are hard-coded
// white regardless of adminMode or Pebble theme swaps.
//
// Pebble icons render as <span data-icon="..."> with a ::before glyph from
// the RipplingIconsKit icon font — NOT as an <svg>. So the only property
// that actually paints the glyph is color, applied to the span. Targeting
// [data-icon] beats Pebble's styled-components class rule in both dev and
// production builds (the StyledIcon emotion label is stripped in prod).
const forceWhiteIcons = `
  [data-icon],
  [data-icon]::before,
  button,
  button * {
    color: #ffffff !important;
  }
`;

// Icon-only search trigger shown below the small tablet breakpoint.
const MobileSearchTrigger = styled.div`
  display: none;

  ${BELOW_SMALL_TABLET} {
    display: flex;
  }

  ${forceWhiteIcons}
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  padding: 0 ${({ theme }) => (theme as StyledTheme).space400};

  ${BELOW_SMALL_TABLET} {
    padding: 0 ${({ theme }) => (theme as StyledTheme).space200};
  }
`;

const TopNavActions = styled.div`
  display: flex;
  align-items: center;

  button {
    position: relative;
  }
`;

// Expanded action buttons (help, create, notifications, AI) — hidden on
// small breakpoints; collapsed into the overflow "..." menu instead.
const ExpandedActions = styled.div`
  display: flex;
  align-items: center;

  ${BELOW_SMALL_TABLET} {
    display: none;
  }
`;

// Overflow "..." menu trigger — only visible below the small-tablet breakpoint.
const OverflowTrigger = styled.div`
  display: none;

  ${BELOW_SMALL_TABLET} {
    display: flex;
  }

  ${forceWhiteIcons}
`;

// Hamburger (nav drawer toggle) — only visible below the tablet breakpoint,
// since that's where we hide the persistent sidebar.
const HamburgerTrigger = styled.div`
  display: none;
  padding-left: ${({ theme }) => (theme as StyledTheme).space200};

  ${BELOW_TABLET} {
    display: flex;
  }

  ${forceWhiteIcons}
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

const AiButton = styled.button<{ $active?: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  cursor: pointer;
  background: ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorPrimaryContainer : 'transparent'};
  transition: background 0.12s;

  &:hover {
    background: ${({ $active, theme }) =>
      $active
        ? (theme as StyledTheme).colorPrimaryContainer
        : (theme as StyledTheme).colorSurfaceContainerLow};
  }

  img {
    width: 20px;
    height: 20px;
    filter: brightness(0);
  }
`;

const ProfileDivider = styled.div`
  padding: ${({ theme }) =>
    `0 ${(theme as StyledTheme).space300} 0 ${(theme as StyledTheme).space400}`};

  ${BELOW_SMALL_TABLET} {
    padding: ${({ theme }) =>
      `0 ${(theme as StyledTheme).space200}`};
  }
`;

// Mobile search overlay — replaces the top bar content when the user taps
// the mobile search icon. Keeps the search UX accessible at small widths.
const MobileSearchOverlay = styled.div<{ adminMode: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 56px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'rgb(74, 0, 57)' : (theme as StyledTheme).colorSurfaceBright};
  z-index: 101;
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: 0 ${({ theme }) => (theme as StyledTheme).space300};
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
  onPersonaSelect,
  personaLabel,
  onAiToggle,
  aiPanelOpen = false,
  onMenuToggle,
  theme,
}) => {
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const searchInputRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (mobileSearchOpen) {
      const input = searchInputRef.current?.querySelector('input');
      input?.focus();
    }
  }, [mobileSearchOpen]);

  const overflowMenuItems: any[] = [
    {
      label: 'Help',
      leftIconType: Icon.TYPES.HELP_OUTLINE,
      value: 'help',
    },
    {
      label: 'Create',
      leftIconType: Icon.TYPES.ADD_CIRCLE_OUTLINE,
      value: 'create',
    },
  ];

  if (showNotificationBadge) {
    overflowMenuItems.push({
      label: notificationCount > 0 ? `Notifications (${notificationCount})` : 'Notifications',
      leftIconType: Icon.TYPES.NOTIFICATION_OUTLINE,
      value: 'notifications',
    });
  }

  if (onAiToggle) {
    overflowMenuItems.push(
      { isSeparator: true },
      {
        label: 'AI Assistant',
        leftIconType: Icon.TYPES.STAR_OUTLINE,
        value: 'ai',
      },
    );
  }

  const logoIsLight = adminMode || currentMode === 'dark';

  return (
    <>
      <TopNav theme={theme} adminMode={adminMode}>
        <LeftSection theme={theme}>
          <LogoContainer theme={theme}>
            <Logo
              theme={theme}
              src={logoIsLight ? RipplingLogoWhite : RipplingLogoBlack}
              alt="Rippling"
              onClick={onLogoClick}
            />
            <MonogramLogo
              theme={theme}
              src={logoIsLight ? RipplingMonogramWhite : RipplingMonogramBlack}
              alt="Rippling"
              onClick={onLogoClick}
            />
          </LogoContainer>
        </LeftSection>

        <RightSection theme={theme}>
          <SearchCenter theme={theme}>
            <DesktopSearch>
              <SearchBar
                placeholder={searchPlaceholder}
                adminMode={adminMode}
                theme={theme}
              />
            </DesktopSearch>
            <MobileSearchTrigger>
              <Button.Icon
                icon={Icon.TYPES.SEARCH_OUTLINE}
                aria-label="Search"
                tip="Search"
                appearance={Button.APPEARANCES.GHOST}
                size={Button.SIZES.M}
                onClick={() => setMobileSearchOpen(true)}
              />
            </MobileSearchTrigger>
          </SearchCenter>

          <ActionsContainer theme={theme}>
            <TopNavActions theme={theme}>
              <ExpandedActions>
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
                {onAiToggle && (
                  <AiButton
                    theme={theme}
                    $active={aiPanelOpen}
                    onClick={onAiToggle}
                    aria-label="AI Assistant"
                    title="AI Assistant"
                  >
                    <img src={RipplingAiSpark} alt="" />
                  </AiButton>
                )}
              </ExpandedActions>

              <OverflowTrigger>
                <Dropdown
                  list={overflowMenuItems}
                  maxHeight={400}
                  onChange={value => {
                    if (value === 'ai') onAiToggle?.();
                  }}
                  placement="bottom-end"
                  shouldAutoClose
                >
                  <Button.Icon
                    icon={Icon.TYPES.MORE_HORIZONTAL}
                    aria-label="More actions"
                    tip="More"
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.M}
                  />
                </Dropdown>
              </OverflowTrigger>
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
              onPersonaSelect={onPersonaSelect}
              personaLabel={personaLabel}
              theme={theme}
            />

            {onMenuToggle && (
              <HamburgerTrigger theme={theme}>
                <VerticalDivider theme={theme} adminMode={adminMode} />
                <div style={{ paddingLeft: 8 }}>
                  <Button.Icon
                    icon={Icon.TYPES.HAMBURGER}
                    aria-label="Open navigation menu"
                    tip="Menu"
                    appearance={Button.APPEARANCES.GHOST}
                    size={Button.SIZES.M}
                    onClick={onMenuToggle}
                  />
                </div>
              </HamburgerTrigger>
            )}
          </ActionsContainer>
        </RightSection>
      </TopNav>

      {mobileSearchOpen && (
        <MobileSearchOverlay theme={theme} adminMode={adminMode} ref={searchInputRef}>
          <Button.Icon
            icon={Icon.TYPES.ARROW_LEFT}
            aria-label="Close search"
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.M}
            onClick={() => setMobileSearchOpen(false)}
          />
          <div style={{ flex: 1 }}>
            <SearchBar
              placeholder={searchPlaceholder}
              adminMode={adminMode}
              theme={theme}
            />
          </div>
        </MobileSearchOverlay>
      )}
    </>
  );
};
