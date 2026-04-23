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
  height: 100vh;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
`;

const LeftPanelInner = styled.div`
  padding: 5vw 5vw ${({ theme }: T) => theme.space1200};
  display: flex;
  flex-direction: column;
`;

const RightPanel = styled.div`
  position: relative;
  height: 100vh;
  background: #F0D8EE;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }: T) => theme.space800} ${({ theme }: T) => theme.space1200};
  gap: 16px;
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

const Description = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyLarge};
  line-height: 1.65;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }: T) => theme.space1200} 0;
  max-width: 660px;
`;

const DescriptionLead = styled.p`
  margin: 0 0 ${({ theme }: T) => theme.space400} 0;
`;

const OutcomesList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space400};
`;

const OutcomeItem = styled.li`
  position: relative;
  padding-left: ${({ theme }: T) => theme.space600};

  &::before {
    content: '';
    position: absolute;
    left: 0;
    top: 0.7em;
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: ${({ theme }: T) => theme.colorOnSurface};
  }

  strong {
    color: ${({ theme }: T) => theme.colorOnSurface};
    font-weight: 600;
  }
`;

const ChevronDownIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
    <path d="M3.5 5.25L7 8.75L10.5 5.25" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

type ProposalCategory = {
  id: string;
  title: string;
  description: string;
  items: Array<{ label: string; path: string }>;
};

const PROPOSAL_CATEGORIES: ProposalCategory[] = [
  {
    id: 'mobile',
    title: 'Mobile experience',
    description: 'Adaptive home on the mobile app',
    items: [
      { label: 'Mobile home demo', path: '/mobile-home-demo' },
      { label: 'Adaptive home architecture', path: '/adaptive-home-architecture' },
    ],
  },
  {
    id: 'web',
    title: 'Web experience',
    description: 'The same adaptive system, rendered for desktop web',
    items: [
      { label: 'Desktop web home 4/22, Shippable', path: '/desktop-home-4-22-shippable' },
      { label: 'Desktop web home 4/22', path: '/desktop-home-demo-4-22' },
      { label: 'Desktop web home v2', path: '/desktop-home-demo-v2' },
      { label: 'Desktop web home', path: '/desktop-home-demo' },
      { label: 'Desktop web home B', path: '/desktop-home-b' },
      { label: 'Notice stack (severity-tiered)', path: '/notice-stack-demo' },
    ],
  },
  {
    id: 'widget',
    title: 'Widget framework',
    description: 'The reusable foundation any team can adopt',
    items: [
      { label: 'Reusable WidgetCard framework', path: '/widget-card-framework' },
      { label: 'Widget canvas', path: '/widget-canvas' },
    ],
  },
];

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

const ProposalCard = styled.div`
  display: flex;
  flex-direction: column;
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  overflow: hidden;
  transition: box-shadow 0.15s ease;
`;

const ProposalRow = styled.button`
  display: flex;
  width: 100%;
  align-items: center;
  gap: ${({ theme }: T) => theme.space400};
  padding: ${({ theme }: T) => theme.space600};
  background: transparent;
  border: none;
  text-align: left;
  color: inherit;
  font: inherit;
  cursor: pointer;

  &:hover {
    background: ${({ theme }: T) => theme.colorSurfaceContainerLow};
  }
`;

const ProposalRowContent = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: ${({ theme }: T) => theme.space400};
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

const ExpandIndicator = styled.span<{ $expanded: boolean }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  flex-shrink: 0;
  transition: transform 0.2s ease;
  transform: ${({ $expanded }) => $expanded ? 'rotate(180deg)' : 'rotate(0deg)'};
`;

const ExpandedList = styled.ul<{ $expanded: boolean }>`
  list-style: disc;
  margin: 0;
  padding: 0 ${({ theme }: T) => theme.space600} ${({ theme }: T) => theme.space600} 76px;
  display: ${({ $expanded }) => $expanded ? 'flex' : 'none'};
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space200};
  border-top: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  padding-top: ${({ theme }: T) => theme.space400};
`;

const ExpandedItem = styled.li`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};

  button {
    background: none;
    border: none;
    padding: 0;
    color: ${({ theme }: T) => theme.colorOnSurface};
    cursor: pointer;
    text-decoration: underline;
    text-underline-offset: 3px;
    font: inherit;
    text-align: left;

    &:hover {
      color: ${({ theme }: T) => theme.colorPrimary};
    }
  }
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
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
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
        <LeftPanelInner>
        <Eyebrow>Project Hub</Eyebrow>
        <Title>
          &ldquo;Snack-size&rdquo;&nbsp;UI:
          <br />
          <TitleFaded>Creating composable surfaces</TitleFaded>
        </Title>
        <Description>
          <DescriptionLead>Two business outcomes drive this work:</DescriptionLead>
          <OutcomesList>
            <OutcomeItem>
              <strong>Unbundling.</strong> Rippling should feel equally complete
              whether a customer buys one SKU or a hundred. Once a customer is on
              Rippling, growing into new products should never require relearning
              the product.
            </OutcomeItem>
            <OutcomeItem>
              <strong>AI adoption.</strong> Pricing across the industry is
              shifting from seat-based access to usage-based models, so sustained
              usage is what now drives revenue. Composable, widget-sized surfaces
              pair naturally with AI and scale down to the form factors AI lives in,
              which is how we get people to actually use it.
            </OutcomeItem>
          </OutcomesList>
        </Description>

        <SectionLabel>Proposal</SectionLabel>
        <ProposalList>
          {PROPOSAL_CATEGORIES.map((category) => {
            const isExpanded = expandedCategory === category.id;
            return (
              <ProposalCard key={category.id}>
                <ProposalRow
                  onClick={() => setExpandedCategory(isExpanded ? null : category.id)}
                  aria-label={isExpanded ? `Collapse ${category.title}` : `Expand ${category.title}`}
                  aria-expanded={isExpanded}
                >
                  <ProposalRowContent>
                    <ProposalIcon />
                    <ProposalText>
                      <ProposalTitle>{category.title}</ProposalTitle>
                      <ProposalDescription>{category.description}</ProposalDescription>
                    </ProposalText>
                  </ProposalRowContent>
                  <ExpandIndicator $expanded={isExpanded} aria-hidden="true">
                    <ChevronDownIcon />
                  </ExpandIndicator>
                </ProposalRow>
                <ExpandedList $expanded={isExpanded}>
                  {category.items.map((item) => (
                    <ExpandedItem key={item.path}>
                      <button onClick={() => navigate(item.path)}>{item.label}</button>
                    </ExpandedItem>
                  ))}
                </ExpandedList>
              </ProposalCard>
            );
          })}
        </ProposalList>
        </LeftPanelInner>
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
