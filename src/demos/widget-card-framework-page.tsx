import React from 'react';
import styled from '@emotion/styled';
import { useTheme, useThemeSettings } from '@rippling/pebble/theme';
import { useNavigate } from 'react-router-dom';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import Status from '@rippling/pebble/Status';
import WidgetCard, { ContentSlot } from '@/widgets/framework/WidgetCard';
import baseComponentImg from '@/assets/widget-card-base-component.png';
import homeScreenImg from '@/assets/widget-card-home-screen.png';
import todayPaystubImg from '@/assets/widget-today-paystub.png';

type T = { theme: any };

/* ================================================================
   Page-level layout
   ================================================================ */

const PageWrapper = styled.div`
  min-height: 100vh;
  background: ${({ theme }: T) => theme.colorSurfaceBright};
`;

const ModeToggle = styled.button<{ $isDark: boolean }>`
  position: fixed;
  top: 12px;
  right: 12px;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: none;
  padding: 0;
  cursor: pointer;
  background: ${({ $isDark }) => $isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.06)'};
  color: ${({ $isDark }) => $isDark ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.5)'};
  backdrop-filter: blur(4px);
  transition: background 0.2s ease, color 0.2s ease;

  &:hover {
    background: ${({ $isDark }) => $isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.12)'};
    color: ${({ $isDark }) => $isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.8)'};
  }
`;

const ContentColumn = styled.div`
  max-width: 960px;
  margin: 0 auto;
  padding: 0 ${({ theme }: T) => theme.space800};
`;

const Section = styled.section`
  padding: ${({ theme }: T) => theme.space1600} 0;
`;

const SectionDivider = styled.hr`
  border: none;
  border-top: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  margin: 0;
`;

/* ================================================================
   Typography
   ================================================================ */

const BackRow = styled.div`
  padding: ${({ theme }: T) => theme.space600} 0 0;
`;

const HeroTitle = styled.h1`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 56px;
  font-weight: 700;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0;
`;

const HeroTagline = styled.p`
  font-size: 20px;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: ${({ theme }: T) => theme.space600} 0 0;
  line-height: 1.6;
`;

const SectionTitle = styled.h2`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 32px;
  font-weight: 700;
  letter-spacing: -0.02em;
  line-height: 1.15;
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0 0 ${({ theme }: T) => theme.space800} 0;
`;

const SectionSubtitle = styled.p`
  ${({ theme }: T) => theme.typestyleV2BodyLarge};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: -${({ theme }: T) => theme.space400} 0 ${({ theme }: T) => theme.space800} 0;
  max-width: 640px;
  line-height: 1.6;
`;

/* ================================================================
   Considerations (3 cards)
   ================================================================ */

const ConsiderationsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: ${({ theme }: T) => theme.space600};
`;

const ConsiderationCard = styled.div`
  padding: ${({ theme }: T) => theme.space600};
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
`;

const ConsiderationTitle = styled.h3`
  ${({ theme }: T) => theme.typestyleV2TitleMedium};
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0 0 ${({ theme }: T) => theme.space200} 0;
`;

const ConsiderationBody = styled.p`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.55;
`;

/* ================================================================
   What Exists Today — gap table
   ================================================================ */

const TodayColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: T) => theme.space800};
  align-items: start;
`;

const TodayProse = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyLarge};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  line-height: 1.65;
`;

const TodayImage = styled.img`
  width: 100%;
  max-width: 380px;
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  margin-top: ${({ theme }: T) => theme.space800};
  display: block;
`;

const GapTable = styled.div`
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  overflow: hidden;
`;

const GapTableHeader = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${({ theme }: T) => theme.space400};
  padding: ${({ theme }: T) => theme.space400} ${({ theme }: T) => theme.space600};
  border-bottom: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
`;

const GapTableHeaderCell = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelLarge};
  color: ${({ theme }: T) => theme.colorOnSurface};
`;

const GapRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: ${({ theme }: T) => theme.space400};
  padding: ${({ theme }: T) => theme.space400} ${({ theme }: T) => theme.space600};

  &:not(:last-child) {
    border-bottom: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
  }
`;

const GapLabel = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  font-weight: 600;
  color: ${({ theme }: T) => theme.colorOnSurface};
`;

const GapDetail = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  line-height: 1.5;
`;

/* ================================================================
   Anatomy — annotated widget card
   ================================================================ */

const AnatomyContainer = styled.div`
  background: ${({ theme }: T) => theme.colorSurfaceContainerLow};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  padding: ${({ theme }: T) => theme.space1200} ${({ theme }: T) => theme.space1600};
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${({ theme }: T) => theme.space800};
`;

const AnatomyCardWrapper = styled.div`
  position: relative;
  width: 361px;
`;

const Callout = styled.div<{ $top: number; $left: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left}px;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #D8B4FE;
  color: #fff;
  font-size: 12px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

const CalloutLine = styled.div<{ $top: number; $left: number; $height: number }>`
  position: absolute;
  top: ${({ $top }) => $top}px;
  left: ${({ $left }) => $left + 11}px;
  width: 1px;
  height: ${({ $height }) => $height}px;
  background: #D8B4FE;
  z-index: 1;
`;

const AnatomyLegend = styled.div`
  display: grid;
  grid-template-columns: auto 1fr;
  column-gap: ${({ theme }: T) => theme.space300};
  row-gap: ${({ theme }: T) => theme.space200};
  align-items: center;
  width: fit-content;
`;

const LegendNumber = styled.div`
  width: 22px;
  height: 22px;
  border-radius: 50%;
  background: #D8B4FE;
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
`;

const LegendText = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurface};
`;

const LegendSuffix = styled.span`
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  font-style: italic;
`;

/* ================================================================
   Widget Row (wrapper)
   ================================================================ */

const WidgetRowContainer = styled.div`
  display: flex;
  align-items: start;
  gap: ${({ theme }: T) => theme.space1200};
`;

const PhoneColumn = styled.div`
  position: relative;
  width: 393px;
  flex-shrink: 0;
  background: ${({ theme }: T) => theme.colorSurfaceContainerLow};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  padding: ${({ theme }: T) => theme.space600} 0;
`;

const WidgetZonesPreview = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0 16px;
`;

const DimensionLabel = styled.div`
  position: absolute;
  ${({ theme }: T) => theme.typestyleV2LabelSmall};
  color: #D8B4FE;
  font-weight: 600;
  white-space: nowrap;
`;

const DimensionLine = styled.div`
  position: absolute;
  background: #D8B4FE;
`;

const WrapperAnnotations = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }: T) => theme.space600};
`;

const AnnotationItem = styled.div`
  display: flex;
  align-items: start;
  gap: ${({ theme }: T) => theme.space300};
`;

const AnnotationDot = styled.div`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #D8B4FE;
  flex-shrink: 0;
  margin-top: 6px;
`;

const AnnotationText = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  line-height: 1.55;
`;

const AnnotationStrong = styled.span`
  color: ${({ theme }: T) => theme.colorOnSurface};
  font-weight: 600;
`;

/* ================================================================
   Variations row
   ================================================================ */

const VariationsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: ${({ theme }: T) => theme.space600};
`;

const VariationSlot = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space300};
`;

const VariationLabel = styled.div`
  ${({ theme }: T) => theme.typestyleV2LabelMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  text-align: center;
`;

/* ================================================================
   Ownership — two columns
   ================================================================ */

const OwnershipColumns = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: T) => theme.space800};
`;

const OwnershipCard = styled.div`
  padding: ${({ theme }: T) => theme.space800};
  background: ${({ theme }: T) => theme.colorSurfaceBright};
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
`;

const OwnershipTitle = styled.h3`
  ${({ theme }: T) => theme.typestyleV2TitleMedium};
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0 0 ${({ theme }: T) => theme.space400} 0;
`;

const OwnershipList = styled.div`
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space200};
`;

const OwnershipItem = styled.div`
  display: flex;
  align-items: start;
  gap: ${({ theme }: T) => theme.space300};
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  line-height: 1.55;

  &::before {
    content: '';
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #D8B4FE;
    flex-shrink: 0;
    margin-top: 6px;
  }
`;

/* ================================================================
   Design Principles — definition list
   ================================================================ */

const DefinitionList = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: T) => theme.space800};
`;

const DefinitionItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }: T) => theme.space200};
`;

const DefinitionTerm = styled.dt`
  ${({ theme }: T) => theme.typestyleV2TitleSmall};
  color: ${({ theme }: T) => theme.colorOnSurface};
  margin: 0;
`;

const DefinitionDesc = styled.dd`
  ${({ theme }: T) => theme.typestyleV2BodyMedium};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.55;
`;

/* ================================================================
   Figma reference images
   ================================================================ */

const FigmaImageGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }: T) => theme.space600};
`;

const FigmaImage = styled.img`
  width: 100%;
  border-radius: ${({ theme }: T) => theme.shapeCorner2xl};
  border: 1px solid ${({ theme }: T) => theme.colorOutlineVariant};
`;

const FigmaCaption = styled.div`
  ${({ theme }: T) => theme.typestyleV2BodySmall};
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  text-align: center;
  margin-top: ${({ theme }: T) => theme.space200};
`;

/* ================================================================
   Small reusable pieces for widget demos
   ================================================================ */

const BodyPlaceholderBleed = styled.div<{ $height?: number }>`
  width: calc(100% + 24px);
  margin: 2px -12px 0;
  height: ${({ $height }) => $height ?? 100}px;
  background: #F5D0CE;
`;

const CustomFooterPlaceholder = styled.div`
  width: 100%;
  height: 32px;
  background: #F5D0CE;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.35);
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const BodyPlaceholder = styled.div<{ $height?: number }>`
  width: 100%;
  height: ${({ $height }) => $height ?? 100}px;
  background: #F5D0CE;
  border-radius: 12px;
`;

const HeroContent = styled.div`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const HeroAmount = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: ${({ theme }: T) => theme.colorOnSurface};
  line-height: 1.2;
`;

const HeroSubtext = styled.div`
  font-size: 13px;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin-top: 4px;
`;

const ShiftHero = styled.div`
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShiftTime = styled.div`
  font-size: 22px;
  font-weight: 600;
  color: ${({ theme }: T) => theme.colorOnSurface};
  line-height: 1.2;
`;

const ShiftLocation = styled.div`
  font-size: 13px;
  color: ${({ theme }: T) => theme.colorOnSurfaceVariant};
  margin-top: 2px;
`;

/* ================================================================
   Component
   ================================================================ */

const WidgetCardFrameworkPage: React.FC = () => {
  const { theme, mode } = useTheme();
  const { changeMode } = useThemeSettings();
  const navigate = useNavigate();
  const isDark = mode === 'dark';
  const sv = theme.colorOnSurfaceVariant;
  const ov = theme.colorOutlineVariant;
  const pc = theme.colorPrimaryContainer;
  const noop = () => {};

  return (
    <PageWrapper>
      <ModeToggle
        $isDark={isDark}
        onClick={() => changeMode(isDark ? 'light' : 'dark')}
        aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <Icon type={isDark ? Icon.TYPES.SUN_OUTLINE : Icon.TYPES.OVERNIGHT_OUTLINE} size={16} />
      </ModeToggle>
      <ContentColumn>

        {/* Back nav */}
        <BackRow>
          <Button.Icon
            icon={Icon.TYPES.ARROW_LEFT}
            aria-label="Back to project hub"
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={() => navigate('/')}
          />
        </BackRow>

        {/* ============================================================
            1. Hero
            ============================================================ */}
        <Section style={{ paddingBottom: 0 }}>
          <HeroTitle>WidgetCard</HeroTitle>
          <HeroTagline>
            A consistent card container with three flexible zones.
            It owns the chrome. You own the content.
          </HeroTagline>
        </Section>

        {/* ============================================================
            2. Anatomy
            ============================================================ */}
        <Section>
          <AnatomyContainer>
            <AnatomyCardWrapper>
              {/* Callout 1: Header / title — above left */}
              <CalloutLine $top={-28} $left={60} $height={28} />
              <Callout $top={-52} $left={49}>1</Callout>

              {/* Callout 2: Meta — above right */}
              <CalloutLine $top={-28} $left={320} $height={28} />
              <Callout $top={-52} $left={309}>2</Callout>

              {/* Callout 3: Content — right side, pointing to body */}
              <div style={{ position: 'absolute', top: 90, left: 373, width: 28, height: 1, background: '#D8B4FE', zIndex: 1 }} />
              <Callout $top={78} $left={401}>3</Callout>

              {/* Callout 4: Footer — right side, pointing to footer */}
              <div style={{ position: 'absolute', top: 195, left: 373, width: 28, height: 1, background: '#D8B4FE', zIndex: 1 }} />
              <Callout $top={183} $left={401}>4</Callout>

              <WidgetCard
                title="Upcoming Shift"
                onTitleClick={noop}
                surfaceVariant={sv}
                outlineVariant={ov}
                primaryColor={pc}
                meta={<Status appearance={Status.APPEARANCES.SUCCESS} size={Status.SIZES.S} text="Clocked In" />}
                actions={[
                  { label: 'Shift details', variant: 'secondary' },
                  { label: 'Clock out', variant: 'primary' },
                ]}
              >
                <BodyPlaceholder />
              </WidgetCard>
            </AnatomyCardWrapper>

            <AnatomyLegend>
              <LegendNumber>1</LegendNumber>
              <LegendText>Header <LegendSuffix>(title + chevron)</LegendSuffix></LegendText>
              <LegendNumber>2</LegendNumber>
              <LegendText>Meta <LegendSuffix>(right-aligned — status, badge, timestamp, or menu)</LegendSuffix></LegendText>
              <LegendNumber>3</LegendNumber>
              <LegendText>Content <LegendSuffix>(body — product teams own this entirely)</LegendSuffix></LegendText>
              <LegendNumber>4</LegendNumber>
              <LegendText>Footer <LegendSuffix>(action buttons or custom content)</LegendSuffix></LegendText>
            </AnatomyLegend>
          </AnatomyContainer>

          <OwnershipColumns style={{ marginTop: theme.space1200 }}>
            <div>
              <OwnershipTitle>WidgetCard owns</OwnershipTitle>
              <OwnershipList>
                <OwnershipItem>Card background, border, and border radius</OwnershipItem>
                <OwnershipItem>Header layout — title left, meta right</OwnershipItem>
                <OwnershipItem>Padding and spacing between zones</OwnershipItem>
                <OwnershipItem>Chevron icon when title is tappable</OwnershipItem>
                <OwnershipItem>Footer button layout (1 = full-width, 2 = side-by-side)</OwnershipItem>
                <OwnershipItem>Light and dark mode theming</OwnershipItem>
              </OwnershipList>
            </div>
            <div>
              <OwnershipTitle>You own</OwnershipTitle>
              <OwnershipList>
                <OwnershipItem>Everything inside the content zone (body)</OwnershipItem>
                <OwnershipItem>Everything inside the meta slot (badges, status, menus)</OwnershipItem>
                <OwnershipItem>Custom footer content (when not using action buttons)</OwnershipItem>
                <OwnershipItem>Data fetching and state management</OwnershipItem>
                <OwnershipItem>Accessibility for interactive content you provide</OwnershipItem>
              </OwnershipList>
            </div>
          </OwnershipColumns>
        </Section>

        <SectionDivider />

        {/* ============================================================
            3. Considerations
            ============================================================ */}
        <Section>
          <SectionTitle>Considerations</SectionTitle>
          <ConsiderationsRow>
            <ConsiderationCard>
              <ConsiderationTitle>Consistent</ConsiderationTitle>
              <ConsiderationBody>
                Every widget shares the same card chrome — background, border,
                radius, and spacing — so the home screen feels unified regardless
                of which team built each widget.
              </ConsiderationBody>
            </ConsiderationCard>
            <ConsiderationCard>
              <ConsiderationTitle>Flexible</ConsiderationTitle>
              <ConsiderationBody>
                Three optional zones — header, content, footer — each accept
                any content. No prescribed layouts, no forced patterns.
                Use what you need.
              </ConsiderationBody>
            </ConsiderationCard>
            <ConsiderationCard>
              <ConsiderationTitle>Restrained</ConsiderationTitle>
              <ConsiderationBody>
                The component does the minimum. No data fetching, no state
                management, no opinions on what goes inside. It wraps your
                content and gets out of the way.
              </ConsiderationBody>
            </ConsiderationCard>
          </ConsiderationsRow>
        </Section>

        <SectionDivider />

        {/* ============================================================
            4. What Exists Today
            ============================================================ */}
        <Section>
          <SectionTitle>What exists today</SectionTitle>
          <TodayColumns>
            <div>
              <TodayProse>
                <p style={{ margin: '0 0 16px' }}>
                  Pebble Mobile ships a <strong>Widget</strong> component today. It provides
                  card chrome, a header with title, action buttons as horizontal
                  pills, app branding in the footer, and themed styling.
                </p>
                <p style={{ margin: 0 }}>
                  It works well for its original context. But the new home experience
                  surfaces gaps that WidgetCard is designed to close.
                </p>
              </TodayProse>
              <TodayImage src={todayPaystubImg} alt="Current Pebble Mobile Widget — paystub example" />
            </div>
            <GapTable>
              <GapTableHeader>
                <GapTableHeaderCell>Gap</GapTableHeaderCell>
                <GapTableHeaderCell>Detail</GapTableHeaderCell>
              </GapTableHeader>
              <GapRow>
                <GapLabel>Actions are required</GapLabel>
                <GapDetail>Every widget must have action buttons, even if the widget is purely informational.</GapDetail>
              </GapRow>
              <GapRow>
                <GapLabel>No header meta slot</GapLabel>
                <GapDetail>No way to render right-aligned content like a status badge, timestamp, or overflow menu.</GapDetail>
              </GapRow>
              <GapRow>
                <GapLabel>No tappable title</GapLabel>
                <GapDetail>Title doesn't support tap-to-navigate with a chevron affordance.</GapDetail>
              </GapRow>
              <GapRow>
                <GapLabel>Only 2 variants</GapLabel>
                <GapDetail>"Default" and "banner" don't cover the range of home widget presentations needed.</GapDetail>
              </GapRow>
              <GapRow>
                <GapLabel>Coupled to app identity</GapLabel>
                <GapDetail>App title and logo are required for the default variant. The new home experience de-emphasizes per-widget app attribution.</GapDetail>
              </GapRow>
            </GapTable>
          </TodayColumns>
        </Section>

        <SectionDivider />

        {/* ============================================================
            5. Widget Row (wrapper)
            ============================================================ */}
        <Section>
          <SectionTitle>Widget row</SectionTitle>
          <SectionSubtitle>
            The layout wrapper that holds WidgetCards on screen. It controls
            margins and spacing — the cards fill the available width.
          </SectionSubtitle>
          <WidgetRowContainer>
            <PhoneColumn>
              {/* Left margin annotation */}
              <DimensionLine style={{ top: 24, left: 0, width: 16, height: 1 }} />
              <DimensionLine style={{ top: 18, left: 0, width: 1, height: 13 }} />
              <DimensionLine style={{ top: 18, left: 15, width: 1, height: 13 }} />
              <DimensionLabel style={{ top: 8, left: 2, fontSize: 10 }}>16px</DimensionLabel>

              {/* Right margin annotation */}
              <DimensionLine style={{ top: 24, right: 0, width: 16, height: 1 }} />
              <DimensionLine style={{ top: 18, right: 0, width: 1, height: 13 }} />
              <DimensionLine style={{ top: 18, right: 15, width: 1, height: 13 }} />
              <DimensionLabel style={{ top: 8, right: 2, fontSize: 10 }}>16px</DimensionLabel>

              <WidgetZonesPreview>
                <WidgetCard title="Upcoming Shift" onTitleClick={noop} surfaceVariant={sv} outlineVariant={ov} primaryColor={pc} meta={<Status appearance={Status.APPEARANCES.SUCCESS} size={Status.SIZES.S} text="Clocked In" />} actions={[{ label: 'Shift details', variant: 'secondary' }, { label: 'Clock out', variant: 'primary' }]}>
                  <BodyPlaceholder $height={80} />
                </WidgetCard>

                <WidgetCard title="My Pay" onTitleClick={noop} surfaceVariant={sv} outlineVariant={ov} meta={<Icon type={Icon.TYPES.MORE_VERTICAL} size={14} color={sv} />}>
                  <BodyPlaceholder $height={60} />
                </WidgetCard>

                <WidgetCard title="Approvals" onTitleClick={noop} surfaceVariant={sv} outlineVariant={ov}>
                  <BodyPlaceholder $height={70} />
                </WidgetCard>

                <WidgetCard title="Nearby" onTitleClick={noop} surfaceVariant={sv} outlineVariant={ov} footer={<CustomFooterPlaceholder>Custom footer content</CustomFooterPlaceholder>}>
                  <BodyPlaceholderBleed $height={100} />
                </WidgetCard>

                <WidgetCard title="" surfaceVariant={sv} outlineVariant={ov}>
                  <BodyPlaceholder $height={60} />
                </WidgetCard>

                <WidgetCard title="Benefits" onTitleClick={noop} surfaceVariant={sv} outlineVariant={ov} actions={[{ label: 'View details', variant: 'secondary' }]}>
                  <BodyPlaceholder $height={50} />
                </WidgetCard>
              </WidgetZonesPreview>

              {/* Gap annotation between card 1 and 2 — centered in column */}
              <div style={{
                position: 'absolute',
                top: 216,
                left: 0,
                right: 0,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 4,
                zIndex: 2,
              }}>
                <div style={{ width: 40, height: 1, background: '#D8B4FE' }} />
                <span style={{ fontSize: 10, fontWeight: 600, color: '#D8B4FE', whiteSpace: 'nowrap' }}>12px</span>
                <div style={{ width: 40, height: 1, background: '#D8B4FE' }} />
              </div>
            </PhoneColumn>

            <WrapperAnnotations>
              <AnnotationItem>
                <AnnotationDot />
                <AnnotationText>
                  <AnnotationStrong>16px horizontal margins</AnnotationStrong> on each side keep cards
                  inset from the screen edge.
                </AnnotationText>
              </AnnotationItem>
              <AnnotationItem>
                <AnnotationDot />
                <AnnotationText>
                  <AnnotationStrong>12px vertical gap</AnnotationStrong> between each card creates
                  consistent rhythm without crowding.
                </AnnotationText>
              </AnnotationItem>
              <AnnotationItem>
                <AnnotationDot />
                <AnnotationText>
                  <AnnotationStrong>~4 widgets maximum</AnnotationStrong> per screen is the recommended
                  guideline. This is a design principle, not a technical limit — the
                  home screen should feel focused, not like a dashboard.
                </AnnotationText>
              </AnnotationItem>
              <AnnotationItem>
                <AnnotationDot />
                <AnnotationText>
                  The wrapper is the <AnnotationStrong>layout primitive</AnnotationStrong>.
                  WidgetCard is the <AnnotationStrong>content primitive</AnnotationStrong>.
                  They work together.
                </AnnotationText>
              </AnnotationItem>
            </WrapperAnnotations>
          </WidgetRowContainer>
        </Section>

        <SectionDivider />

        {/* ============================================================
            8. Design Principles
            ============================================================ */}
        <Section>
          <SectionTitle>Design principles</SectionTitle>
          <DefinitionList>
            <DefinitionItem>
              <DefinitionTerm>One purpose per widget</DefinitionTerm>
              <DefinitionDesc>Every widget should do one thing and do it clearly. A shift widget shows the current shift. An earnings widget shows pay info. If a widget tries to serve two purposes, it should be two widgets.</DefinitionDesc>
            </DefinitionItem>
            <DefinitionItem>
              <DefinitionTerm>Hierarchy emphasizes dynamic content</DefinitionTerm>
              <DefinitionDesc>The most valuable, most dynamic content should have the strongest visual emphasis. Static labels and titles should be small and quiet. The content the user came for should be large and prominent.</DefinitionDesc>
            </DefinitionItem>
            <DefinitionItem>
              <DefinitionTerm>Only one element gets emphasis</DefinitionTerm>
              <DefinitionDesc>Each widget gets one "hero" element — the single piece of content with elevated visual weight. Everything else supports it. If two things are competing for attention, the widget lacks focus.</DefinitionDesc>
            </DefinitionItem>
            <DefinitionItem>
              <DefinitionTerm>Less is more</DefinitionTerm>
              <DefinitionDesc>If removing a widget from the home screen doesn't degrade the user's experience, it shouldn't exist. Every widget must earn its space. Every label, data point, and action should justify its presence.</DefinitionDesc>
            </DefinitionItem>
            <DefinitionItem>
              <DefinitionTerm>Clean, impactful visuals</DefinitionTerm>
              <DefinitionDesc>Widgets should feel calm and confident, not busy. Generous whitespace, restrained use of color, clear typographic hierarchy. The home screen is a focused starting point, not a dashboard.</DefinitionDesc>
            </DefinitionItem>
          </DefinitionList>
        </Section>

        <SectionDivider />

        {/* ============================================================
            9. Figma reference
            ============================================================ */}
        <Section>
          <SectionTitle>Figma reference</SectionTitle>
          <FigmaImageGrid>
            <div>
              <FigmaImage src={baseComponentImg} alt="WidgetCard base component variations in Figma" />
              <FigmaCaption>Base component — light and dark variants</FigmaCaption>
            </div>
            <div>
              <FigmaImage src={homeScreenImg} alt="WidgetCard on the home screen in Figma" />
              <FigmaCaption>Home screen — consistent zones</FigmaCaption>
            </div>
          </FigmaImageGrid>
        </Section>

        {/* Bottom padding */}
        <div style={{ height: 80 }} />
      </ContentColumn>
    </PageWrapper>
  );
};

export default WidgetCardFrameworkPage;
