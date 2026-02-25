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
  justify-content: space-between;
  gap: 10px;
`;

const TabBar = styled.div<{ isDark?: boolean }>`
  display: flex;
  align-items: stretch;
  justify-content: center;
  flex: 0 0 auto;
  height: 60px;
  padding: 2px;
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
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  flex: 0 0 auto;
  width: 69px;
  height: 52px;
  padding: 0 4px;
  border-radius: 100px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: ${({ active, theme }) =>
    active
      ? (theme as any).colorSurfaceContainer
      : 'transparent'};
`;

const NavLabel = styled.span<{ active?: boolean }>`
  font-size: 10px;
  font-weight: ${({ active }) => (active ? 600 : 500)};
  color: ${({ theme }) => (theme as any).colorOnSurface || '#1a1a1a'};
  line-height: 1;
  letter-spacing: 0;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FloatingSettingsButton = styled.button<{ isDark?: boolean }>`
  width: 60px;
  height: 60px;
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
  align-self: center;
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

const BottomNavigation: React.FC<BottomNavigationProps> = ({ activeNav, setActiveNav, enabledApps, darkMode, indicatorColor }) => {
  const filteredNavItems = navItems.filter(item => !item.sku || enabledApps.has(item.sku));
  return (
    <>
      <BottomNavBlur />
      <BottomNav>
        <BottomNavRow>
          <TabBar isDark={darkMode}>
            {filteredNavItems.map((item, idx) => (
              <NavItem
                key={item.id}
                active={idx === activeNav}
                onClick={() => setActiveNav(idx)}
              >
                <Icon
                  type={idx === activeNav ? item.iconFilled : item.iconOutline}
                  size={22}
                  color={indicatorColor}
                />
                <NavLabel active={idx === activeNav}>{item.label}</NavLabel>
              </NavItem>
            ))}
          </TabBar>
          <FloatingSettingsButton isDark={darkMode} aria-label="Customize">
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill={indicatorColor}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill={indicatorColor}/>
              <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill={indicatorColor}/>
            </svg>
          </FloatingSettingsButton>
        </BottomNavRow>
        <HomeIndicatorBar style={{ background: indicatorColor }} />
      </BottomNav>
    </>
  );
};

export default BottomNavigation;
