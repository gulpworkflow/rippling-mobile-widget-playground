import styled from '@emotion/styled';

export const Canvas = styled.div`
  width: 100%;
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  background: #f5f2ef;
  transition: background 0.3s ease;

  @media (min-width: 501px) {
    background: var(--chrome-bg, #292929);
  }
`;

export const PhoneMockup = styled.div<{ isDark?: boolean }>`
  width: 100%;
  height: 100%;
  background: ${({ isDark }) => isDark ? '#1c1c1e' : '#f5f2ef'};
  position: relative;
  overflow: visible;
  transition: background 0.3s ease;

  @media (min-width: 501px) {
    width: 393px;
    height: 852px;
    background: ${({ isDark }) => isDark ? '#1c1c1e' : '#e8e4df'};
    border-radius: 55px;
    padding: 8px;

    &::after {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      border-radius: 55px;
      border: 8px solid #1c1c1e;
      box-shadow: ${({ isDark }) => isDark
        ? `0 0 0 2px #333,
           0 0 0 3px #1c1c1e,
           0 25px 50px rgba(0, 0, 0, 0.6),
           inset 0 0 0 1px rgba(255, 255, 255, 0.1)`
        : `0 0 0 2px #d4d0ca,
           0 0 0 3px #c8c4be,
           0 25px 50px rgba(0, 0, 0, 0.12),
           inset 0 0 0 1px rgba(0, 0, 0, 0.05)`};
      z-index: 9999;
      pointer-events: none;
      transition: border-color 0.3s ease, box-shadow 0.3s ease;
    }

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

export const PhoneScreen = styled.div<{ surfaceDim?: string; surface?: string }>`
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
    .embed-mode & { border-radius: 47px; }
    :not(.embed-mode) & { border-radius: 0; }
  }
`;

export const StatusBarBlur = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 100px;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  z-index: 3500;
  pointer-events: none;
  mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
  -webkit-mask-image: linear-gradient(to bottom, black 0%, black 25%, transparent 60%);
  @media (max-width: 500px) {
    .embed-mode & { display: block; }
    :not(.embed-mode) & { display: none; }
  }
`;

export const StatusBar = styled.div`
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
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  z-index: 3501;
  background: transparent;
  @media (max-width: 500px) {
    .embed-mode & { display: flex; }
    :not(.embed-mode) & { display: none; }
  }
`;

export const StatusIcons = styled.div`
  display: flex;
  align-items: center;
  gap: 5px;
`;

export const FloatingAvatar = styled.div`
  position: absolute;
  top: 58px;
  right: 16px;
  z-index: 2000;
  @media (max-width: 500px) {
    :not(.embed-mode) & { top: calc(env(safe-area-inset-top, 0px) + 12px); }
  }
`;

export const AvatarCircle = styled.img`
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
  border: 1.5px solid rgba(255, 255, 255, 0.6);
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.12);
  flex-shrink: 0;
`;

export const ContentArea = styled.div<{ $scrollLocked?: boolean }>`
  flex: 1;
  overflow-y: ${({ $scrollLocked }) => ($scrollLocked ? 'hidden' : 'auto')};
  -webkit-overflow-scrolling: touch;
  overscroll-behavior: contain;
  scrollbar-width: none;
  -ms-overflow-style: none;
  padding: 54px 0 0;
  display: flex;
  flex-direction: column;
  position: relative;
  z-index: 1;
  @media (max-width: 500px) {
    :not(.embed-mode) & { padding-top: env(safe-area-inset-top, 12px); }
  }

  &::-webkit-scrollbar {
    display: none;
  }
`;

export const SignalBars = () => (
  <svg width="17" height="12" viewBox="0 0 17 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0" y="9" width="3" height="3" rx="0.5" fill="currentColor"/>
    <rect x="4.5" y="6" width="3" height="6" rx="0.5" fill="currentColor"/>
    <rect x="9" y="3" width="3" height="9" rx="0.5" fill="currentColor"/>
    <rect x="13.5" y="0" width="3" height="12" rx="0.5" fill="currentColor"/>
  </svg>
);

export const WifiIcon = () => (
  <svg width="16" height="12" viewBox="0 0 16 12" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M8 11.5C8.83 11.5 9.5 10.83 9.5 10C9.5 9.17 8.83 8.5 8 8.5C7.17 8.5 6.5 9.17 6.5 10C6.5 10.83 7.17 11.5 8 11.5Z" fill="currentColor"/>
    <path d="M4.46 7.46C5.4 6.52 6.64 6 8 6C9.36 6 10.6 6.52 11.54 7.46" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M1.86 4.86C3.5 3.22 5.64 2.3 8 2.3C10.36 2.3 12.5 3.22 14.14 4.86" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
  </svg>
);

export const BatteryIcon = () => (
  <svg width="27" height="13" viewBox="0 0 27 13" fill="none" xmlns="http://www.w3.org/2000/svg">
    <rect x="0.5" y="0.5" width="22" height="12" rx="2.5" stroke="currentColor" strokeOpacity="0.35"/>
    <rect x="2" y="2" width="19" height="9" rx="1.5" fill="currentColor"/>
    <path d="M24 4.5V8.5C25.1 8.17 25.1 4.83 24 4.5Z" fill="currentColor" fillOpacity="0.4"/>
  </svg>
);
