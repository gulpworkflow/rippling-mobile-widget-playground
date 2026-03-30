import React from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';


const BottomNavBlur = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 80px;
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  z-index: 2999;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 50%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 50%);
`;

const BottomNav = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 0 12px 4px;
  z-index: 3000;

  @media (min-width: 501px) {
    border-radius: 0 0 39px 39px;
  }
  @media (max-width: 500px) {
    position: fixed;
    border-radius: 0;
  }
`;

const BottomNavRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CircleButton = styled.button<{ isDark?: boolean; $active?: boolean }>`
  width: 52px;
  height: 52px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${({ isDark }) => isDark
    ? 'linear-gradient(-45deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.14) 100%)'
    : 'linear-gradient(-45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.45) 100%)'};
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid ${({ isDark }) => isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'};
  border-radius: 50%;
  box-shadow: ${({ isDark }) => isDark
    ? '0 1px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)'
    : '0 1px 8px rgba(0,0,0,0.03), inset 0 0.5px 0 rgba(255,255,255,0.7)'};
  cursor: pointer;
  padding: 0;
  transition: transform 0.15s ease;

  &:active {
    transform: scale(0.92);
  }
`;

const AccessoryPill = styled.button<{ isDark?: boolean }>`
  flex: 1;
  height: 52px;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 6px 0 6px;
  background: ${({ isDark }) => isDark
    ? 'linear-gradient(-45deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.14) 100%)'
    : 'linear-gradient(-45deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0.35) 50%, rgba(255,255,255,0.45) 100%)'};
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid ${({ isDark }) => isDark ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.5)'};
  border-radius: 100px;
  box-shadow: ${({ isDark }) => isDark
    ? '0 1px 8px rgba(0,0,0,0.3), inset 0 0.5px 0 rgba(255,255,255,0.1)'
    : '0 1px 8px rgba(0,0,0,0.07), inset 0 0.5px 0 rgba(255,255,255,0.7)'};
  cursor: pointer;
  transition: transform 0.15s ease;
  text-align: left;

  &:active {
    transform: scale(0.97);
  }
`;

const AccessoryIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 8px;
  color: ${({ theme }) => (theme as any).colorPrimary};
`;

const AccessoryLabel = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  flex: 1;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  opacity: 0.65;
`;


const HomeIndicatorBar = styled.div`
  width: 134px;
  height: 3px;
  background: #1a1a1a;
  border-radius: 100px;
  margin: 5px auto 3px;
  animation: fadeIndicator 1s ease-out 3s forwards;
  @keyframes fadeIndicator {
    to { opacity: 0; }
  }
`;

export const navItems: Array<{ id: string; label: string; iconOutline: string; iconFilled: string; sku?: string }> = [
  { id: 'home', label: 'Home', iconOutline: Icon.TYPES.HOME_OUTLINE, iconFilled: Icon.TYPES.HOME_FILLED },
  { id: 'activity', label: 'Activity', iconOutline: Icon.TYPES.NOTIFICATION_OUTLINE, iconFilled: Icon.TYPES.NOTIFICATION_FILLED },
  { id: 'find', label: 'Find', iconOutline: Icon.TYPES.SEARCH_OUTLINE, iconFilled: Icon.TYPES.SEARCH_FILLED },
  { id: 'chat', label: 'Chat', iconOutline: Icon.TYPES.COMMENTS_OUTLINE, iconFilled: Icon.TYPES.COMMENTS_FILLED, sku: 'chat' },
];

interface BottomNavigationProps {
  activeNav: number;
  setActiveNav: (idx: number) => void;
  enabledApps: Set<string>;
  darkMode: boolean;
  indicatorColor: string;
}

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeNav, setActiveNav, darkMode, indicatorColor }) => {
  return (
    <>
      <BottomNavBlur />
      <BottomNav>
        <BottomNavRow>
          <CircleButton
            isDark={darkMode}
            $active={activeNav === 1}
            onClick={() => setActiveNav(1)}
            aria-label="Activity"
          >
            <Icon
              type={Icon.TYPES.NOTIFICATION_OUTLINE}
              size={22}
              color={indicatorColor}
            />
          </CircleButton>

          <AccessoryPill isDark={darkMode} onClick={() => {}}>
            <AccessoryIcon>
              <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
                <path d="M6.46408 13.0041C10.4723 12.3102 13.7947 9.62068 15.3717 5.99496C14.2054 4.2129 13.3799 2.18447 13.0021 0C11.8563 6.62731 6.62835 11.8544 0 13.0041C6.62835 14.1539 11.8563 19.381 13.0062 26.0083C13.384 23.8238 14.2095 21.7954 15.3758 20.0133C13.7947 16.3876 10.4764 13.6981 6.46819 13.0041H6.46408ZM18.4682 5.46527C17.8029 9.30862 14.7721 12.3389 10.9282 13.0041C14.7721 13.6693 17.7988 16.6997 18.4682 20.543C19.1335 16.6997 22.1643 13.6693 26.0083 13.0041C22.1643 12.3389 19.1376 9.30862 18.4682 5.46527Z" fill="currentColor" />
              </svg>
            </AccessoryIcon>
            <AccessoryLabel>What needs to be done?</AccessoryLabel>
          </AccessoryPill>

          <CircleButton
            isDark={darkMode}
            onClick={() => setActiveNav(2)}
            aria-label="Find"
          >
            <Icon
              type={Icon.TYPES.SEARCH_OUTLINE}
              size={22}
              color={indicatorColor}
            />
          </CircleButton>
        </BottomNavRow>
        <HomeIndicatorBar style={{ background: indicatorColor }} />
      </BottomNav>
    </>
  );
};

export default BottomNavigation;
