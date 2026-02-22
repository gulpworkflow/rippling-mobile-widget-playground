import React, { useState, useRef, useEffect } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import RipplingLogo from '@/assets/rippling-logo-black.svg';

/**
 * Mobile Home Demo
 *
 * Wireframe-style mobile home screen matching Figma frame.
 * Uses liquid glass bottom navigation.
 *
 * Layout:
 * - Header: Rippling logo + apps icon + avatar
 * - Widget Zones (each zone wraps widgets):
 *   - Primary work: "What needs attention right now?"
 *   - Core actions: "What do I commonly do?"
 *   - Contextual: "What's the state of my world?"
 *   - Discovery/expansion: "What else is available?"
 * - Bottom nav: Home, Activity, Find, Chat + floating sparkles button
 */

// ─── Canvas / Frame ─────────────────────────────────────────────────────

const Canvas = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: #f5f2ef;

  @media (min-width: 501px) {
    background: #292929;
  }
`;

const PhoneMockup = styled.div`
  width: 100%;
  height: 100%;
  background: #f5f2ef;
  position: relative;
  overflow: visible;

  @media (min-width: 501px) {
    width: 393px;
    height: 852px;
    background: #f5f2ef;
    border-radius: 55px;
    padding: 8px;

    /* Frame overlay - renders ON TOP of the screen */
    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 55px;
      border: 8px solid #1c1c1e;
      box-shadow:
        0 0 0 2px #333,
        0 0 0 3px #1c1c1e,
        0 25px 50px rgba(0, 0, 0, 0.6),
        inset 0 0 0 1px rgba(255, 255, 255, 0.1);
      z-index: 9999;
      pointer-events: none;
    }

    /* Dynamic Island - on top of frame */
    &::before {
      content: '';
      position: absolute;
      top: 19px;
      left: 50%;
      transform: translateX(-50%);
      width: 126px;
      height: 36px;
      background: #000;
      border-radius: 18px;
      z-index: 10000;
    }
  }

  @media (max-width: 500px) {
    border-radius: 0;
    box-shadow: none;
    &::before, &::after {
      display: none;
    }
  }
`;

const PhoneScreen = styled.div<{ surfaceDim?: string; surface?: string }>`
  width: 100%;
  height: 100%;
  background: ${({ surface }) => surface || '#f5f2ef'};
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 185px;
    background: linear-gradient(
      to bottom,
      ${({ surfaceDim }) => surfaceDim || 'rgba(0, 0, 0, 0.06)'},
      ${({ surface }) => surface || '#f5f2ef'}
    );
    z-index: 0;
    pointer-events: none;
  }

  @media (min-width: 501px) {
    border-radius: 47px;
  }
  @media (max-width: 500px) {
    border-radius: 0;
  }
`;

// ─── Status Bar ─────────────────────────────────────────────────────────

const StatusBarBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 1999;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
`;

const StatusBar = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 54px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 36px 0;
  font-size: 16px;
  font-weight: 600;
  letter-spacing: 0.2px;
  color: #000;
  z-index: 2000;
  background: transparent;
`;

const StatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

// ─── Floating Avatar ────────────────────────────────────────────────────

const FloatingAvatar = styled.div`
  position: absolute;
  top: 58px;
  right: 16px;
  z-index: 2000;
`;

// ─── App Header (scrolls with content) ──────────────────────────────────

const AppHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 16px 16px;
  padding-right: 54px; /* leave space for floating avatar */
`;

const LogoImage = styled.img`
  width: 140px;
  height: auto;
`;

const HeaderRight = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const AppsButton = styled.button`
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #1a1a1a;
`;

const AvatarCircle = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
`;

// ─── Content Area ───────────────────────────────────────────────────────

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 54px 0 0; /* top padding for status bar */
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const WidgetZones = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 16px 120px;
`;

// ─── Widget Zone ────────────────────────────────────────────────────────

const WidgetZone = styled.div<{ flex?: number }>`
  flex: ${({ flex }) => flex ?? 1};
  min-height: 120px;
  border: 2px dashed rgba(0, 0, 0, 0.12);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  padding: 24px 16px;
`;

const ZoneLabel = styled.span`
  font-size: 17px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.45);
  text-align: center;
`;

const ZoneCaption = styled.span`
  font-size: 14px;
  font-weight: 400;
  font-style: italic;
  color: rgba(0, 0, 0, 0.3);
  text-align: center;
`;

// ─── Tab View Header ────────────────────────────────────────────────────

const TabViewHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 20px 12px;
  padding-right: 60px;
`;

const TabViewTitle = styled.h1`
  ${({ theme }) => (theme as any).typestyleV2TitleMedium};
  color: #1a1a1a;
  margin: 0;
`;

// ─── Activity View ──────────────────────────────────────────────────────

const ActivityView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Activity</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Find View ──────────────────────────────────────────────────────────


const FindView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Find</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Chat View ──────────────────────────────────────────────────────────

const ChatView: React.FC = () => (
  <>
    <TabViewHeader>
      <TabViewTitle>Chat</TabViewTitle>
    </TabViewHeader>
  </>
);

// ─── Home View ──────────────────────────────────────────────────────────

const HomeView: React.FC<{ theme: any }> = ({ theme }) => (
  <>
    <AppHeader>
      <LogoImage src={RipplingLogo} alt="Rippling" />
      <HeaderRight>
        <AppsButton aria-label="Apps">
          <Icon type={Icon.TYPES.APPS_OUTLINE} size={22} color={theme.colorOnSurfaceVariant} />
        </AppsButton>
      </HeaderRight>
    </AppHeader>
    <WidgetZones>
      <WidgetZone flex={1.3}>
        <ZoneLabel>Primary work</ZoneLabel>
        <ZoneCaption>What needs attention right now?</ZoneCaption>
      </WidgetZone>

      <WidgetZone flex={1}>
        <ZoneLabel>Core actions</ZoneLabel>
        <ZoneCaption>What do I commonly do?</ZoneCaption>
      </WidgetZone>

      <WidgetZone flex={1}>
        <ZoneLabel>Contextual</ZoneLabel>
        <ZoneCaption>What's the state of my world?</ZoneCaption>
      </WidgetZone>

      <WidgetZone style={{ minHeight: 400 }}>
        <ZoneLabel>Discovery/expansion</ZoneLabel>
        <ZoneCaption>What else is available?</ZoneCaption>
      </WidgetZone>
    </WidgetZones>
  </>
);

// ─── Bottom Navigation (Liquid Glass) ───────────────────────────────────

const BottomNavBlur = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 110px;
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 2999;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, transparent 0%, black 30%);
  -webkit-mask-image: linear-gradient(to bottom, transparent 0%, black 30%);
`;

const BottomNav = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  padding: 0 12px 12px;
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
  gap: 10px;
`;

const TabBar = styled.div`
  display: flex;
  align-items: stretch;
  justify-content: space-around;
  flex: 1;
  height: 60px;
  padding: 2px;
  background: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.45) 100%
  );
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 100px;
  box-shadow:
    0 1px 8px rgba(0, 0, 0, 0.07),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.7);
`;

const NavItem = styled.div<{ active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 3px;
  cursor: pointer;
  flex: 1;
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
  color: #1a1a1a;
  line-height: 1;
  letter-spacing: 0;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const FloatingSettingsButton = styled.button`
  width: 60px;
  height: 60px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(
    -45deg,
    rgba(255, 255, 255, 0.2) 0%,
    rgba(255, 255, 255, 0.35) 50%,
    rgba(255, 255, 255, 0.45) 100%
  );
  backdrop-filter: blur(16px) saturate(120%);
  -webkit-backdrop-filter: blur(16px) saturate(120%);
  border: 0.5px solid rgba(255, 255, 255, 0.5);
  border-radius: 50%;
  box-shadow:
    0 1px 8px rgba(0, 0, 0, 0.03),
    inset 0 0.5px 0 rgba(255, 255, 255, 0.7);
  cursor: pointer;
  padding: 0;
  align-self: center;
`;

const HomeIndicatorBar = styled.div`
  width: 134px;
  height: 5px;
  background: #1a1a1a;
  border-radius: 100px;
  margin: 8px auto 4px;
`;

// ─── SVG Icons (matching Figma) ─────────────────────────────────────────

const AppsGridIcon = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="3" y="3" width="7" height="7" rx="1.5" stroke="#1a1a1a" strokeWidth="1.8"/>
    <rect x="14" y="3" width="7" height="7" rx="1.5" stroke="#1a1a1a" strokeWidth="1.8"/>
    <rect x="3" y="14" width="7" height="7" rx="1.5" stroke="#1a1a1a" strokeWidth="1.8"/>
    <rect x="14" y="14" width="7" height="7" rx="1.5" stroke="#1a1a1a" strokeWidth="1.8"/>
    <line x1="21" y1="14" x2="21" y2="10.5" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
  </svg>
);

const SettingsSliderIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
    <line x1="4" y1="6" x2="20" y2="6" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="4" y1="12" x2="20" y2="12" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
    <line x1="4" y1="18" x2="20" y2="18" stroke="#1a1a1a" strokeWidth="1.8" strokeLinecap="round"/>
    <circle cx="8" cy="6" r="2.5" fill="#f5f2ef" stroke="#1a1a1a" strokeWidth="1.8"/>
    <circle cx="16" cy="12" r="2.5" fill="#f5f2ef" stroke="#1a1a1a" strokeWidth="1.8"/>
    <circle cx="10" cy="18" r="2.5" fill="#f5f2ef" stroke="#1a1a1a" strokeWidth="1.8"/>
  </svg>
);

// ─── Status bar icons ───────────────────────────────────────────────────

const SignalBars = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="9" width="3" height="3" rx="0.5" fill="#1a1a1a"/>
    <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="#1a1a1a"/>
    <rect x="9" y="3" width="3" height="9" rx="0.5" fill="#1a1a1a"/>
    <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="#1a1a1a"/>
  </svg>
);

const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.5C8.83 11.5 9.5 10.83 9.5 10C9.5 9.17 8.83 8.5 8 8.5C7.17 8.5 6.5 9.17 6.5 10C6.5 10.83 7.17 11.5 8 11.5Z" fill="#1a1a1a"/>
    <path d="M4.46 7.46C5.4 6.52 6.64 6 8 6C9.36 6 10.6 6.52 11.54 7.46" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M1.86 4.86C3.5 3.22 5.64 2.3 8 2.3C10.36 2.3 12.5 3.22 14.14 4.86" stroke="#1a1a1a" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="#1a1a1a" strokeOpacity="0.35"/>
    <rect x="2" y="2" width="19" height="9" rx="1.5" fill="#1a1a1a"/>
    <path d="M24 4.5V8.5C25.1 8.17 25.1 4.83 24 4.5Z" fill="#1a1a1a" fillOpacity="0.4"/>
  </svg>
);

// ─── HUD Panels ─────────────────────────────────────────────────────────

const HudToggle = styled.button<{ position: 'left' | 'right' }>`
  position: fixed;
  top: 16px;
  ${({ position }) => position}: 16px;
  height: 36px;
  padding: 0 12px;
  gap: 6px;
  border-radius: 8px;
  border: none;
  background: #1a1a1a;
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 20000;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  letter-spacing: 0;
  transition: opacity 0.2s ease;
  &:hover {
    opacity: 0.8;
  }
`;

const HudToggleAvatar = styled.img`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  object-fit: cover;
  flex-shrink: 0;
`;

const HudPanel = styled.div<{ position: 'left' | 'right'; open: boolean }>`
  position: fixed;
  top: 0;
  ${({ position }) => position}: 0;
  width: 350px;
  height: 100vh;
  background: #1a1a1a;
  color: #fff;
  z-index: 19999;
  display: flex;
  flex-direction: column;
  padding: 64px 24px 24px;
  transform: translateX(${({ position, open }) =>
    open ? '0' : position === 'left' ? '-100%' : '100%'});
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
`;

const HudTitle = styled.h2`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1.5px;
  color: rgba(255, 255, 255, 0.35);
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
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 10px;
  overflow: hidden;
`;

const HudCardHeader = styled.div`
  padding: 12px 14px;
  font-size: 13px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HudRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.04);
  &:last-child {
    border-bottom: none;
  }
`;

const HudRowLabel = styled.span`
  font-size: 13px;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.55);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HudRowPlaceholder = styled.div<{ variant?: 'toggle' | 'dropdown' }>`
  width: ${({ variant }) => (variant === 'dropdown' ? '80px' : '34px')};
  height: 20px;
  border-radius: ${({ variant }) => (variant === 'dropdown' ? '4px' : '10px')};
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

// ─── Component ──────────────────────────────────────────────────────────

const MobileHomeDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  const [activeNav, setActiveNav] = useState(0);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftToggleRef = useRef<HTMLButtonElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const rightToggleRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        leftPanelOpen &&
        leftPanelRef.current &&
        !leftPanelRef.current.contains(e.target as Node) &&
        leftToggleRef.current &&
        !leftToggleRef.current.contains(e.target as Node)
      ) {
        setLeftPanelOpen(false);
      }
      if (
        rightPanelOpen &&
        rightPanelRef.current &&
        !rightPanelRef.current.contains(e.target as Node) &&
        rightToggleRef.current &&
        !rightToggleRef.current.contains(e.target as Node)
      ) {
        setRightPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leftPanelOpen, rightPanelOpen]);

  const navItems = [
    { label: 'Home', iconOutline: Icon.TYPES.HOME_OUTLINE, iconFilled: Icon.TYPES.HOME_FILLED },
    { label: 'Activity', iconOutline: Icon.TYPES.NOTIFICATION_OUTLINE, iconFilled: Icon.TYPES.NOTIFICATION_FILLED },
    { label: 'Find', iconOutline: Icon.TYPES.SEARCH_OUTLINE, iconFilled: Icon.TYPES.SEARCH_FILLED },
    { label: 'Chat', iconOutline: Icon.TYPES.COMMENTS_OUTLINE, iconFilled: Icon.TYPES.COMMENTS_FILLED },
  ];

  return (
    <>
      <Global
        styles={css`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow-x: hidden; }
        `}
      />

      {/* HUD Toggle Buttons */}
      <HudToggle ref={leftToggleRef} position="left" onClick={() => setLeftPanelOpen(prev => !prev)} aria-label="Toggle System Display panel">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="#fff" strokeWidth="2"/><path d="M8 21h8M12 17v4" stroke="#fff" strokeWidth="2" strokeLinecap="round"/></svg>
        System Display
      </HudToggle>
      <HudToggle ref={rightToggleRef} position="right" onClick={() => setRightPanelOpen(prev => !prev)} aria-label="Toggle Persona panel">
        <HudToggleAvatar src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Persona" />
        User Intent
      </HudToggle>

      {/* HUD Panels */}
      <HudPanel ref={leftPanelRef} position="left" open={leftPanelOpen}>
        <HudTitle>System</HudTitle>
        <HudSections>
          <HudCard>
            <HudCardHeader>Navigation</HudCardHeader>
            <HudRow><HudRowLabel>Tab bar style</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Show labels</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
            <HudRow><HudRowLabel>Tab order</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
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

      <HudPanel ref={rightPanelRef} position="right" open={rightPanelOpen}>
        <HudTitle>Persona</HudTitle>
        <HudSections>
          <HudCard>
            <HudCardHeader>Persona</HudCardHeader>
            <HudRow><HudRowLabel>Role</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Permissions</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Scenario</HudCardHeader>
            <HudRow><HudRowLabel>Time of day</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Notifications</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>

          <HudCard>
            <HudCardHeader>Data Profile</HudCardHeader>
            <HudRow><HudRowLabel>Company size</HudRowLabel><HudRowPlaceholder variant="dropdown" /></HudRow>
            <HudRow><HudRowLabel>Active modules</HudRowLabel><HudRowPlaceholder variant="toggle" /></HudRow>
          </HudCard>
        </HudSections>
      </HudPanel>

      <Canvas>
        <PhoneMockup>
          <PhoneScreen surfaceDim={theme.colorSurfaceDim} surface={theme.colorSurface}>
            {/* Status Bar - blur layer + fixed overlay */}
            <StatusBarBlur />
            <StatusBar>
              <span>9:41</span>
              <StatusIcons>
                <SignalBars />
                <WifiIcon />
                <BatteryIcon />
              </StatusIcons>
            </StatusBar>

            {/* Floating Avatar - stays fixed */}
            <FloatingAvatar>
              <AvatarCircle src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&h=100&fit=crop&crop=face" alt="Profile" />
            </FloatingAvatar>

            {/* Scrollable content: switches based on active tab */}
            <ContentArea key={activeNav}>
              {activeNav === 0 && <HomeView theme={theme} />}
              {activeNav === 1 && <ActivityView />}
              {activeNav === 2 && <FindView />}
              {activeNav === 3 && <ChatView />}
            </ContentArea>

            {/* Bottom Nav - Blur Layer + Liquid Glass */}
            <BottomNavBlur />
            <BottomNav>
              <BottomNavRow>
                <TabBar>
                  {navItems.map((item, idx) => (
                    <NavItem
                      key={item.label}
                      active={idx === activeNav}
                      onClick={() => setActiveNav(idx)}
                    >
                      <Icon
                        type={idx === activeNav ? item.iconFilled : item.iconOutline}
                        size={22}
                        color="#1a1a1a"
                      />
                      <NavLabel active={idx === activeNav}>{item.label}</NavLabel>
                    </NavItem>
                  ))}
                </TabBar>
                <FloatingSettingsButton aria-label="Customize">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill="black"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill="black"/>
                    <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill="black"/>
                  </svg>
                </FloatingSettingsButton>
              </BottomNavRow>
              <HomeIndicatorBar />
            </BottomNav>
          </PhoneScreen>
        </PhoneMockup>
      </Canvas>
    </>
  );
};

export default MobileHomeDemo;
