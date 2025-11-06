import React, { useState } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '../utils/theme';
import Tabs from '@rippling/pebble/Tabs';
import Tip from '@rippling/pebble/Tip';

interface ColorToken {
  name: string;
  value: string;
  description: string;
  onColors?: Array<{
    name: string;
    value: string;
    description: string;
    tipContent?: string;
  }>;
}

interface ColorCategory {
  title: string;
  description: string;
  tokens: ColorToken[];
}

const Content = styled.div`
  padding: ${({ theme }) => (theme as StyledTheme).space800};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const Title = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleDisplayMedium700};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space300} 0;
`;

const Subtitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleBodyLarge400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const CategorySection = styled.section`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const CategoryTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleHeadingMedium700};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const CategoryDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleBodyMedium400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const ColorCard = styled.div<{ bgColor: string; textColor: string; showBorder?: boolean }>`
  background-color: ${({ bgColor }) => bgColor};
  color: ${({ textColor }) => textColor};
  border-radius: 24px;
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  transition: transform 150ms ease, box-shadow 150ms ease;
  border: ${({ showBorder, theme }) => 
    showBorder ? `1px solid ${(theme as StyledTheme).colorOutlineVariant}` : 'none'};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ColorName = styled.div<{ textColor: string }>`
  ${({ theme }) => (theme as StyledTheme).typestyleLabelLarge600};
  color: ${({ textColor }) => textColor};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space100};
`;

const ColorValue = styled.div<{ textColor: string }>`
  ${({ theme }) => (theme as StyledTheme).typestyleBodySmall400};
  color: ${({ textColor }) => textColor};
  font-family: 'Monaco', 'Courier New', monospace;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ColorDescription = styled.div<{ textColor: string }>`
  ${({ theme }) => (theme as StyledTheme).typestyleBodySmall400};
  color: ${({ textColor }) => textColor};
  opacity: 0.8;
`;

const OnColorsContainer = styled.div<{ parentBgColor: string }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  margin-top: ${({ theme }) => (theme as StyledTheme).space600};
  padding-top: ${({ theme }) => (theme as StyledTheme).space400};
  border-top: 1px solid rgba(128, 128, 128, 0.2);
  background-color: ${({ parentBgColor }) => parentBgColor};
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerS};
  margin: 0 calc(-1 * ${({ theme }) => (theme as StyledTheme).space400});
  margin-top: ${({ theme }) => (theme as StyledTheme).space600};
`;

const OnColorItem = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
`;

const OnColorCircle = styled.div<{ color: string }>`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background-color: ${({ color }) => color};
  flex-shrink: 0;
`;

const OnColorLabel = styled.span<{ color: string }>`
  ${({ theme }) => (theme as StyledTheme).typestyleBodySmall400};
  color: ${({ color }) => color};
  white-space: nowrap;
  font-weight: 500;
`;

const TypographyList = styled.div`
  display: flex;
  flex-direction: column;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  padding: ${({ theme }) => (theme as StyledTheme).space800};
  border-radius: 24px; /* Using 24px (2XL) since shapeCornerXL (16px) may not be prominent enough */
  overflow: hidden; /* Ensures child content respects the border radius */
`;

const TypographyRow = styled.div`
  display: grid;
  grid-template-columns: 2fr 2fr 1fr 3fr;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
  padding: ${({ theme }) => (theme as StyledTheme).space600} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  align-items: center;
  transition: background-color 150ms ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceDim};
  }
`;

const TypographyName = styled.div<{ tokenKey: string }>`
  ${({ theme, tokenKey }) => (theme as StyledTheme)[tokenKey]};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const TypographyToken = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleBodyMedium400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  font-family: 'Monaco', 'Menlo', 'Courier New', monospace;
  cursor: pointer;
  user-select: all;
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space300};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerS};
  transition: background-color 150ms ease, color 150ms ease;

  &:hover {
    background-color: ${({ theme }) => (theme as StyledTheme).colorPrimaryContainer};
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  }

  &:active {
    background-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
    color: ${({ theme }) => (theme as StyledTheme).colorOnPrimary};
  }
`;

const TypographyStyle = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleBodySmall400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const TypographyUsage = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleBodySmall400};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const DesignTokensDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  // Type assertion needed because theme types don't include all token properties
  const tokens = theme as any;
  const [activeTabIndex, setActiveTabIndex] = useState<number>(0);

  // Helper function to get contrast color for text
  // Strategy: Use Pebble's semantic "on" color tokens which are designed for proper contrast
  const getContrastColor = (bgColor: string): string => {
    // Map background colors to their semantic "on" colors
    // This ensures WCAG-compliant contrast as defined by the design system
    const colorMap: Record<string, string> = {
      // Primary & Secondary
      [tokens.colorPrimary]: tokens.colorOnPrimary,
      [tokens.colorPrimaryVariant || tokens.colorPrimary]: tokens.colorOnPrimary,
      [tokens.colorSecondary]: tokens.colorOnSecondary || tokens.colorOnPrimary,
      [tokens.colorSecondaryVariant || tokens.colorSecondary]: tokens.colorOnSecondary || tokens.colorOnPrimary,
      
      // Surface colors
      [tokens.colorSurface]: tokens.colorOnSurface,
      [tokens.colorSurfaceBright]: tokens.colorOnSurface,
      [tokens.colorSurfaceDim]: tokens.colorOnSurface,
      
      // Semantic colors (vivid)
      [tokens.colorSuccess]: tokens.colorOnSuccess || tokens.colorOnPrimary,
      [tokens.colorError]: tokens.colorOnError || tokens.colorOnPrimary,
      [tokens.colorWarning]: tokens.colorOnWarning || tokens.colorOnSurface,
      [tokens.colorInfo]: tokens.colorOnInfo || tokens.colorOnPrimary,
      
      // Semantic container colors (muted backgrounds)
      [tokens.colorSuccessContainer]: tokens.colorOnSuccessContainer,
      [tokens.colorErrorContainer]: tokens.colorOnErrorContainer,
      [tokens.colorWarningContainer]: tokens.colorOnWarningContainer,
      [tokens.colorInfoContainer]: tokens.colorOnInfoContainer,
      
      // Border colors - use surface text colors
      [tokens.colorOutline]: tokens.colorOnSurface,
      [tokens.colorOutlineVariant]: tokens.colorOnSurface,
    };
    
    // If we have a semantic mapping, use it
    if (colorMap[bgColor]) {
      return colorMap[bgColor];
    }
    
    // Fallback: Calculate luminance for colors not in our map
    // This handles any edge cases or variant colors
    const getLuminance = (hexColor: string): number => {
      // Remove # if present
      const hex = hexColor.replace('#', '');
      
      // Convert to RGB
      const r = parseInt(hex.substr(0, 2), 16) / 255;
      const g = parseInt(hex.substr(2, 2), 16) / 255;
      const b = parseInt(hex.substr(4, 2), 16) / 255;
      
      // Calculate relative luminance (simplified)
      const luminance = 0.2126 * r + 0.7152 * g + 0.0722 * b;
      
      // Return dark text for light backgrounds, light text for dark backgrounds
      return luminance;
    };
    
    try {
      const luminance = getLuminance(bgColor);
      // If background is light (luminance > 0.5), use dark text
      // If background is dark (luminance <= 0.5), use light text
      return luminance > 0.5 ? tokens.colorOnSurface : tokens.colorOnPrimary;
    } catch (e) {
      // If we can't calculate (e.g., not a hex color), default to dark text
      return tokens.colorOnSurface;
    }
  };

  const colorCategories: ColorCategory[] = [
    {
      title: 'Primary & Secondary',
      description: 'Main brand colors used for primary actions and accents.',
      tokens: [
        {
          name: 'Primary',
          value: tokens.colorPrimary,
          description: 'Primary brand color for main actions and highlights',
          onColors: [
            {
              name: 'On Primary',
              value: tokens.colorOnPrimary,
              description: 'Text/icon color on primary',
              tipContent: 'Use for text, icons, and elements on primary color backgrounds. Typically white or light-colored for contrast against the vivid primary color.',
            },
          ],
        },
        {
          name: 'Primary Variant',
          value: tokens.colorPrimaryVariant || tokens.colorPrimary,
          description: 'Darker variant of primary color',
        },
        {
          name: 'Secondary',
          value: tokens.colorSecondary,
          description: 'Secondary accent color',
          onColors: [
            {
              name: 'On Secondary',
              value: tokens.colorOnSecondary || tokens.colorOnPrimary,
              description: 'Text/icon color on secondary',
              tipContent: 'Use for text, icons, and elements on secondary color backgrounds. Ensures proper contrast on secondary accent colors.',
            },
          ],
        },
        {
          name: 'Secondary Variant',
          value: tokens.colorSecondaryVariant || tokens.colorSecondary,
          description: 'Variant of secondary color',
        },
      ],
    },
    {
      title: 'Surface Colors',
      description: 'Base background colors for pages, cards, and major UI surfaces.',
      tokens: [
        {
          name: 'Surface',
          value: tokens.colorSurface,
          description: 'Default surface background (cards, panels, page background)',
          onColors: [
            {
              name: 'On Surface',
              value: tokens.colorOnSurface,
              description: 'Primary text/icon on surfaces',
              tipContent: 'Use for primary body text, headings, and icons on surface backgrounds. This is your main text color throughout the application.',
            },
            {
              name: 'On Surface Variant',
              value: tokens.colorOnSurfaceVariant,
              description: 'Secondary text/icon on surfaces',
              tipContent: 'Use for secondary text, captions, placeholders, and disabled states. Lower emphasis than On Surface for visual hierarchy.',
            },
          ],
        },
        {
          name: 'Surface Bright',
          value: tokens.colorSurfaceBright,
          description: 'Elevated surface (modals, popovers, cards)',
        },
        {
          name: 'Surface Dim',
          value: tokens.colorSurfaceDim,
          description: 'Subtle background for less emphasis',
        },
      ],
    },
    {
      title: 'Surface Containers',
      description: 'Subtle elevation variations for nested containers, hover states, and layered UI elements.',
      tokens: [
        {
          name: 'Surface Container Low',
          value: tokens.colorSurfaceContainerLow,
          description: 'Lowest elevation - use for very subtle hover states',
        },
        {
          name: 'Surface Container',
          value: tokens.colorSurfaceContainer,
          description: 'Default container elevation - use for nested backgrounds',
        },
        {
          name: 'Surface Container High',
          value: tokens.colorSurfaceContainerHigh,
          description: 'Higher elevation - use for layered nested surfaces',
        },
        {
          name: 'Surface Container Highest',
          value: tokens.colorSurfaceContainerHighest,
          description: 'Highest elevation - use for input fields, code blocks',
        },
      ],
    },
    {
      title: 'Semantic Colors',
      description: 'Status colors for notices, snackbars, badges, and validation states.',
      tokens: [
        {
          name: 'Success Container',
          value: tokens.colorSuccessContainer,
          description: 'Background for success messages (SnackBar, Notice, Badge)',
          onColors: [
            {
              name: 'On Success Container',
              value: tokens.colorOnSuccessContainer,
              description: 'Body text on success backgrounds',
              tipContent: 'Use for body text, labels, and descriptions inside success notifications, snackbars, and badges. This ensures readable text on the light success container background.',
            },
            {
              name: 'Success',
              value: tokens.colorSuccess,
              description: 'Icons, borders, and accent elements',
              tipContent: 'Use for icons, borders, links, and focus states within success messages. This vivid green provides visual emphasis and draws attention to interactive or important elements.',
            },
          ],
        },
        {
          name: 'Error Container',
          value: tokens.colorErrorContainer,
          description: 'Background for error messages and validation',
          onColors: [
            {
              name: 'On Error Container',
              value: tokens.colorOnErrorContainer,
              description: 'Body text on error backgrounds',
              tipContent: 'Use for error messages, validation text, and helper text in form fields. This color ensures your error messages are clearly readable on the light red container background.',
            },
            {
              name: 'Error',
              value: tokens.colorError,
              description: 'Icons, borders, and accent elements',
              tipContent: 'Use for error icons, invalid input borders, and destructive action buttons. This vivid red signals danger and critical states, making errors immediately recognizable.',
            },
          ],
        },
        {
          name: 'Warning Container',
          value: tokens.colorWarningContainer,
          description: 'Background for warning messages',
          onColors: [
            {
              name: 'On Warning Container',
              value: tokens.colorOnWarningContainer,
              description: 'Body text on warning backgrounds',
              tipContent: 'Use for warning messages, caution labels, and explanatory text in notices. This ensures your warnings are easy to read on the light amber container background.',
            },
            {
              name: 'Warning',
              value: tokens.colorWarning,
              description: 'Icons, borders, and accent elements',
              tipContent: 'Use for warning icons, attention-grabbing borders, and interactive elements that need caution. This amber color signals warnings without the severity of red errors.',
            },
          ],
        },
        {
          name: 'Info Container',
          value: tokens.colorInfoContainer,
          description: 'Background for informational messages',
          onColors: [
            {
              name: 'On Info Container',
              value: tokens.colorOnInfoContainer,
              description: 'Body text on info backgrounds',
              tipContent: 'Use for informational messages, tips, and helper text in tooltips or notices. This ensures your helpful information is readable on the light blue container background.',
            },
            {
              name: 'Info',
              value: tokens.colorInfo,
              description: 'Icons, borders, and accent elements',
              tipContent: 'Use for info icons, clickable links, and elements needing visual prominence in informational contexts. This blue indicates helpful, non-critical information.',
            },
          ],
        },
      ],
    },
    {
      title: 'Borders & Outlines',
      description: 'Colors for borders, dividers, and outlines.',
      tokens: [
        {
          name: 'Outline',
          value: tokens.colorOutline,
          description: 'Standard borders and dividers',
        },
        {
          name: 'Outline Variant',
          value: tokens.colorOutlineVariant,
          description: 'Subtle borders for less emphasis',
        },
      ],
    },
  ];

  const typographyCategories = [
    {
      title: 'Display',
      description: 'Largest text styles for hero sections and major page titles.',
      tokens: [
        {
          name: 'Display Large',
          tokenKey: 'typestyleDisplayLarge600',
          style: '48px / 56px / Semibold',
          usage: 'Use for hero headlines on landing pages or major marketing sections.',
        },
        {
          name: 'Display Medium',
          tokenKey: 'typestyleDisplayMedium600',
          style: '38px / 46px / Semibold',
          usage: 'Use for large page titles or section heroes that need visual impact.',
        },
        {
          name: 'Display Small',
          tokenKey: 'typestyleDisplaySmall600',
          style: '28px / 36px / Semibold',
          usage: 'Use for prominent page titles or major section headers.',
        },
      ],
    },
    {
      title: 'Title',
      description: 'Card titles, list item headers, and component titles.',
      tokens: [
        {
          name: 'Title Extra Large',
          tokenKey: 'typestyleTitleExtraLarge600',
          style: '22px / 28px / Semibold',
          usage: 'Use for card headers, dialog titles, or major section headings within a page.',
        },
        {
          name: 'Title Large',
          tokenKey: 'typestyleTitleLarge600',
          style: '18px / 24px / Semibold',
          usage: 'Use for subsection headings, panel titles, or emphasis in larger bodies of text.',
        },
        {
          name: 'Title Medium',
          tokenKey: 'typestyleTitleMedium600',
          style: '16px / 22px / Semibold',
          usage: 'Use for card titles, list group headers, or component section headings.',
        },
        {
          name: 'Title Small',
          tokenKey: 'typestyleTitleSmall600',
          style: '14px / 20px / Semibold',
          usage: 'Use for list item titles, small card headers, or compact UI section titles.',
        },
      ],
    },
    {
      title: 'Body',
      description: 'Standard body text for paragraphs and content.',
      tokens: [
        {
          name: 'Body Large Emphasized',
          tokenKey: 'typestyleBodyLarge600',
          style: '16px / 24px / Semibold',
          usage: 'Use for emphasized paragraphs, introductory text, or key information that needs prominence.',
        },
        {
          name: 'Body Large Medium',
          tokenKey: 'typestyleBodyLarge500',
          style: '16px / 24px / Medium',
          usage: 'Use for standard body text in dense layouts or when you need better readability.',
        },
        {
          name: 'Body Medium Emphasized',
          tokenKey: 'typestyleBodyMedium600',
          style: '14px / 20px / Semibold',
          usage: 'Use for emphasized sentences, highlighted information, or subheadings in body text.',
        },
        {
          name: 'Body Medium',
          tokenKey: 'typestyleBodyMedium500',
          style: '14px / 20px / Medium',
          usage: 'Use for standard body text, list items, form fields, or general UI text.',
        },
        {
          name: 'Body Medium Regular',
          tokenKey: 'typestyleBodyMedium400',
          style: '14px / 20px / Regular',
          usage: 'Use for default body copy, descriptions, or secondary information.',
        },
        {
          name: 'Body Small Emphasized',
          tokenKey: 'typestyleBodySmall600',
          style: '12px / 18px / Semibold',
          usage: 'Use for emphasized captions, metadata, or small UI elements that need emphasis.',
        },
        {
          name: 'Body Small Medium',
          tokenKey: 'typestyleBodySmall500',
          style: '12px / 18px / Medium',
          usage: 'Use for table cells, compact lists, or dense UI sections.',
        },
        {
          name: 'Body Small',
          tokenKey: 'typestyleBodySmall400',
          style: '12px / 18px / Regular',
          usage: 'Use for captions, helper text, timestamps, or supplementary information.',
        },
      ],
    },
    {
      title: 'Label',
      description: 'Labels for form fields, buttons, and UI elements.',
      tokens: [
        {
          name: 'Label Extra Large Bold',
          tokenKey: 'typestyleLabelExtraLarge700',
          style: '16px / 24px / Bold',
          usage: 'Use for large button labels or prominent CTAs that need maximum emphasis.',
        },
        {
          name: 'Label Extra Large Semibold',
          tokenKey: 'typestyleLabelExtraLarge600',
          style: '16px / 24px / Semibold',
          usage: 'Use for primary button labels, key form labels, or important action text.',
        },
        {
          name: 'Label Large',
          tokenKey: 'typestyleLabelLarge600',
          style: '14px / 20px / Semibold',
          usage: 'Use for standard button labels, form field labels, or navigation items.',
        },
        {
          name: 'Label Medium Bold',
          tokenKey: 'typestyleLabelMedium700',
          style: '13px / 18px / Bold',
          usage: 'Use for emphasized small buttons, badges, or status indicators.',
        },
        {
          name: 'Label Medium Semibold',
          tokenKey: 'typestyleLabelMedium600',
          style: '13px / 18px / Semibold',
          usage: 'Use for compact buttons, tabs, chips, or small form labels.',
        },
        {
          name: 'Label Small',
          tokenKey: 'typestyleLabelSmall600',
          style: '11px / 16px / Semibold',
          usage: 'Use for tiny buttons, tags, pill labels, or very compact UI elements.',
        },
      ],
    },
  ];

  const renderColorTab = () => (
    <>
      <Header>
        <Title>Color System</Title>
        <Subtitle>
          Pebble's aliased color tokens organized by semantic roles. All colors are theme-aware
          and support both light and dark modes.
        </Subtitle>
      </Header>

      {colorCategories.map((category) => (
        <CategorySection key={category.title}>
          <CategoryTitle>{category.title}</CategoryTitle>
          <CategoryDescription>{category.description}</CategoryDescription>
          <ColorGrid>
            {category.tokens.map((token) => {
              const textColor = getContrastColor(token.value);
              const showBorder = category.title === 'Surface Colors';
              return (
                <ColorCard 
                  key={token.name} 
                  bgColor={token.value} 
                  textColor={textColor}
                  showBorder={showBorder}
                >
                  <div>
                    <div>
                      <ColorName textColor={textColor}>{token.name}</ColorName>
                      <ColorValue textColor={textColor}>{token.value}</ColorValue>
                    </div>
                    <ColorDescription textColor={textColor}>
                      {token.description}
                    </ColorDescription>
                  </div>
                  
                  {token.onColors && token.onColors.length > 0 && (
                    <OnColorsContainer parentBgColor={token.value}>
                      {token.onColors.map((onColor) => (
                        <Tip
                          key={onColor.name}
                          content={onColor.tipContent || onColor.description}
                          placement={Tip.PLACEMENTS.RIGHT}
                          maxWidth={320}
                        >
                          <OnColorItem>
                            <OnColorCircle color={onColor.value} />
                            <OnColorLabel color={onColor.value}>{onColor.name}</OnColorLabel>
                          </OnColorItem>
                        </Tip>
                      ))}
                    </OnColorsContainer>
                  )}
                </ColorCard>
              );
            })}
          </ColorGrid>
        </CategorySection>
      ))}
    </>
  );

  const handleCopyToken = async (tokenKey: string) => {
    try {
      await navigator.clipboard.writeText(`theme.${tokenKey}`);
      // Optional: Show a toast notification here
    } catch (err) {
      console.error('Failed to copy token:', err);
    }
  };

  const renderTypographyTab = () => (
    <>
      <Header>
        <Title>Typography System</Title>
        <Subtitle>
          Pebble's typography tokens provide consistent text styles across your application.
          All styles are responsive and optimized for readability.
        </Subtitle>
      </Header>

      {typographyCategories.map((category) => (
        <CategorySection key={category.title}>
          <CategoryTitle>{category.title}</CategoryTitle>
          <CategoryDescription>{category.description}</CategoryDescription>
          <TypographyList>
            {category.tokens.map((token) => (
              <TypographyRow key={token.name}>
                <TypographyName tokenKey={token.tokenKey}>
                  {token.name}
                </TypographyName>
                <TypographyToken 
                  onClick={() => handleCopyToken(token.tokenKey)}
                  title="Click to copy token name"
                >
                  theme.{token.tokenKey}
                </TypographyToken>
                <TypographyStyle>{token.style}</TypographyStyle>
                <TypographyUsage>{token.usage}</TypographyUsage>
              </TypographyRow>
            ))}
          </TypographyList>
        </CategorySection>
      ))}
    </>
  );

  return (
    <Tabs 
      isVertical 
      activeIndex={activeTabIndex} 
      onChange={(index) => setActiveTabIndex(typeof index === 'number' ? index : parseInt(index, 10))}
      width={240}
    >
      <Tabs.Tab title="Color">
        <Content>{renderColorTab()}</Content>
      </Tabs.Tab>
      <Tabs.Tab title="Typography">
        <Content>{renderTypographyTab()}</Content>
      </Tabs.Tab>
    </Tabs>
  );
};

export default DesignTokensDemo;
