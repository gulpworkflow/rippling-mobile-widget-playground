import React, { useState, useMemo, useEffect, useCallback, useRef } from 'react';
import styled from '@emotion/styled';
import { Global, css } from '@emotion/react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@rippling/pebble/theme';
import Icon from '@rippling/pebble/Icon';
import { PhoneMockup } from '@/playground/PhoneFrame';
import { SAMPLE_USERS } from '@/data-models/sample-users';
import { PERSONA_OPTIONS } from '@/data-models/personas';

type T = { theme: any };

const Page = styled.div`
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  height: 100vh;
  overflow: hidden;
`;

const LeftPanel = styled.div`
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  padding: ${({ theme }: T) => theme.space1600} 5vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const RightPanel = styled.div`
  position: relative;
  background: #F0D8EE;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }: T) => theme.space1200};
  gap: 20px;
`;

const ModeToggle = styled.button<{ $isDark: boolean }>`
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $isDark }) => $isDark ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.55)'};
  color: ${({ $isDark }) => $isDark ? 'rgba(0,0,0,0.65)' : 'rgba(0,0,0,0.5)'};
  backdrop-filter: blur(4px);
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ $isDark }) => $isDark ? 'rgba(0,0,0,0.2)' : 'rgba(255,255,255,0.85)'};
    color: rgba(0,0,0,0.8);
  }
`;

const Eyebrow = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelMedium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }: T) => theme.colorPrimary};
  margin-bottom: ${({ theme }: T) => theme.space400};
`;

const Title = styled.h1`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 48px;
  font-weight: 700;
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0 0 ${({ theme }: T) => theme.space600} 0;
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const TitleFaded = styled.span`
  opacity: 0.45;
`;

const Description = styled.p`
  ${({ theme }: T) => theme.typestyleV2BodyLarge};
  line-height: 1.65;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }: T) => theme.space800} 0;
  max-width: 660px;
`;

const LinksGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space200};
  margin-bottom: ${({ theme }: T) => theme.space1200};
`;

const ExternalLink = styled.a`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurface};
  text-decoration: underline;
  text-underline-offset: 3px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }: T) => theme.space100};
  width: fit-content;

  &:hover {
    color: ${({ theme }: T) => theme.colorPrimary};
  }
`;

const ArrowIcon = () => (
  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink: 0 }}>
    <path d="M2.5 9.5L9.5 2.5M9.5 2.5H4M9.5 2.5V8" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

const SectionLabel = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelMedium};
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin-bottom: ${({ theme }: T) => theme.space600};
`;

const ProposalList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space300};
  max-width: 700px;
`;

const ProposalCard = styled.div<{ $clickable?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }: T) => theme.space400};
  padding: ${({ theme }: T) => theme.space600};
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  cursor: ${({ $clickable }) => $clickable ? 'pointer' : 'default'};
  transition: box-shadow 0.15s ease, transform 0.15s ease;

  ${({ $clickable }) => $clickable && `
    &:hover {
      box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
      transform: translateY(-1px);
    }
  `}
`;

const ProposalIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: ${({ theme }: T) => theme.shapeCornerLg};
  background: ${({ theme }: T) => theme.colorOnSurface};
  flex-shrink: 0;
`;

const ProposalText = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space100};
`;

const ProposalTitle = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyLarge};
  font-weight: 600;
  color: ${({ theme }: T) => theme.colorOnSurface};
`;

const ProposalDescription = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
`;

const PhoneContainer = styled.div`
  position: relative;
  transform: scale(0.95);
`;

const TapZone = styled.button<{ $side: 'left' | 'right' }>`
  position: absolute;
  top: 0;
  ${({ $side }) => $side}: 0;
  width: 50%;
  height: 100%;
  z-index: 10;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  -webkit-tap-highlight-color: transparent;

  &:active {
    background: ${({ $side }) =>
      $side === 'right'
        ? 'linear-gradient(to right, transparent, rgba(255,255,255,0.08))'
        : 'linear-gradient(to left, transparent, rgba(255,255,255,0.08))'};
  }
`;

const EmbeddedIframe = styled.iframe`
  width: 100%;
  height: 100%;
  border: none;
  display: block;
  border-radius: 47px;
  pointer-events: none;
`;

const TransitionOverlay = styled.div<{ $visible: boolean; $isDark: boolean }>`
  position: absolute;
  inset: 0;
  border-radius: 55px;
  background: ${({ $isDark }) => $isDark ? 'rgba(28, 28, 30, 0.85)' : 'rgba(245, 242, 239, 0.85)'};
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  z-index: 5;
  opacity: ${({ $visible }) => $visible ? 1 : 0};
  transition: opacity 0.25s ease;
  pointer-events: none;
`;

/* --- Pagination Dots --- */

const PagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
`;

const DotsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Dot = styled.button<{ $active: boolean }>`
  width: ${({ $active }) => $active ? '8px' : '6px'};
  height: ${({ $active }) => $active ? '8px' : '6px'};
  border-radius: 50%;
  border: none;
  padding: 0;
  background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.25)'};
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: ${({ $active }) => $active ? 'rgba(0, 0, 0, 0.85)' : 'rgba(0, 0, 0, 0.45)'};
  }
`;

const PersonaLabel = styled.div`
  font-size: 11px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.45);
  letter-spacing: 0.02em;
`;

const IndexPage: React.FC = () => {
  const navigate = useNavigate();
  useTheme();
  const [activeIndex, setActiveIndex] = useState(0);
  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [darkMode, setDarkMode] = useState(true);
  const fadeTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const autoPlayRef = useRef<ReturnType<typeof setInterval>>();
  const pausedUntilRef = useRef(0);

  const switchPersona = useCallback((next: number, manual = false) => {
    if (next === activeIndex) return;
    if (manual) pausedUntilRef.current = Date.now() + 12000;
    setTransitioning(true);
    setActiveIndex(next);
    clearTimeout(fadeTimerRef.current);
    fadeTimerRef.current = setTimeout(() => {
      setDisplayedIndex(next);
    }, 180);
  }, [activeIndex]);

  const handleIframeLoad = useCallback(() => {
    setTimeout(() => setTransitioning(false), 80);
  }, []);

  useEffect(() => {
    autoPlayRef.current = setInterval(() => {
      if (Date.now() < pausedUntilRef.current) return;
      setActiveIndex(prev => {
        const next = (prev + 1) % SAMPLE_USERS.length;
        setTransitioning(true);
        clearTimeout(fadeTimerRef.current);
        fadeTimerRef.current = setTimeout(() => setDisplayedIndex(next), 180);
        return next;
      });
    }, 5000);
    return () => {
      clearInterval(autoPlayRef.current);
      clearTimeout(fadeTimerRef.current);
    };
  }, []);

  const displayedUser = SAMPLE_USERS[displayedIndex];
  const activeUser = SAMPLE_USERS[activeIndex];
  const personaLabel = PERSONA_OPTIONS.find(p => p.id === activeUser.persona)?.label ?? activeUser.persona;

  const iframeSrc = useMemo(() => {
    const apps = displayedUser.enabledApps ?? [];
    const params = new URLSearchParams({
      persona: displayedUser.persona,
      embed: '1',
      ...(darkMode && { dark: '1' }),
      ...(apps.length > 0 && { apps: apps.join(',') }),
      ...(displayedUser.onboarding && { onboarding: '1' }),
    });
    return `/mobile-home-demo?${params.toString()}`;
  }, [displayedUser, darkMode]);

  return (
    <>
      <Global styles={css`body { margin: 0; overflow: hidden; }`} />
      <Page>
      <LeftPanel>
        <Eyebrow>Project Hub</Eyebrow>
        <Title>Creating composable surfaces: <TitleFaded>Mobile&nbsp;home</TitleFaded></Title>
        <Description>
          Rippling's mobile home screen currently presents the same static
          experience to every user, regardless of their role, responsibilities,
          or which products their company has enabled. An hourly shift worker
          sees the same layout as a Benefits Admin. A contractor sees the same
          app grid as a company owner.
        </Description>

        <LinksGroup>
          <ExternalLink href="#">
            Why do this now? <ArrowIcon />
          </ExternalLink>
          <ExternalLink href="#">
            What is this/What is it not? <ArrowIcon />
          </ExternalLink>
          <ExternalLink href="#">
            How could this scale? <ArrowIcon />
          </ExternalLink>
        </LinksGroup>

        <SectionLabel>Proposal</SectionLabel>
        <ProposalList>
          <ProposalCard
            $clickable
            onClick={() => navigate('/widget-card-framework')}
          >
            <ProposalIcon />
            <ProposalText>
              <ProposalTitle>Reusable WidgetCard framework</ProposalTitle>
              <ProposalDescription>
                A foundational component that any team can adopt
              </ProposalDescription>
            </ProposalText>
          </ProposalCard>

          <ProposalCard
            $clickable
            onClick={() => navigate('/mobile-home-demo')}
          >
            <ProposalIcon />
            <ProposalText>
              <ProposalTitle>Adaptive home experience</ProposalTitle>
              <ProposalDescription>
                Tailored to who the user is, what products they have, and what they can do
              </ProposalDescription>
            </ProposalText>
          </ProposalCard>

        </ProposalList>
      </LeftPanel>

      <RightPanel>
        <ModeToggle
          $isDark={darkMode}
          onClick={() => setDarkMode(d => !d)}
          aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon type={darkMode ? Icon.TYPES.SUN_OUTLINE : Icon.TYPES.OVERNIGHT_OUTLINE} size={16} />
        </ModeToggle>
        <PhoneContainer>
          <TapZone
            $side="left"
            onClick={() => switchPersona(activeIndex > 0 ? activeIndex - 1 : SAMPLE_USERS.length - 1, true)}
            aria-label="Previous persona"
          />
          <TapZone
            $side="right"
            onClick={() => switchPersona(activeIndex < SAMPLE_USERS.length - 1 ? activeIndex + 1 : 0, true)}
            aria-label="Next persona"
          />
          <TransitionOverlay $visible={transitioning} $isDark={darkMode} />
          <PhoneMockup isDark={darkMode}>
            <EmbeddedIframe
              key={displayedUser.id}
              src={iframeSrc}
              title={`Mobile Home — ${displayedUser.name}`}
              onLoad={handleIframeLoad}
            />
          </PhoneMockup>
        </PhoneContainer>

        <PagerContainer>
          <DotsRow role="progressbar" aria-label="Sample users" aria-valuenow={activeIndex + 1} aria-valuemax={SAMPLE_USERS.length}>
            {SAMPLE_USERS.map((user, i) => (
              <Dot
                key={user.id}
                $active={i === activeIndex}
                onClick={() => switchPersona(i, true)}
                aria-label={`${user.name} — ${PERSONA_OPTIONS.find(p => p.id === user.persona)?.label}`}
              />
            ))}
          </DotsRow>
          <PersonaLabel>{activeUser.name} · {personaLabel}</PersonaLabel>
        </PagerContainer>
      </RightPanel>
    </Page>
    </>
  );
};

export default IndexPage;
