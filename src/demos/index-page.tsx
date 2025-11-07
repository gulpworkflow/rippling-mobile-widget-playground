import React, { useState } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import { useNavigate } from 'react-router-dom';
import Icon from '@rippling/pebble/Icon';
import Card from '@rippling/pebble/Card';
import Drawer from '@rippling/pebble/Drawer';
import TableBasic from '@rippling/pebble/TableBasic';
import Avatar from '@rippling/pebble/Avatar';
import Tabs from '@rippling/pebble/Tabs';
import Label from '@rippling/pebble/Label';
import { APPEARANCES as BADGE_APPEARANCES } from '@rippling/pebble/Atoms/Badge/Badge.constants';
import { VStack } from '@rippling/pebble/Layout/Stack';

/**
 * Index Page
 * 
 * Landing page for the Pebble Playground showing all available demos.
 */

interface DemoCard {
  title: string;
  description: string;
  path: string;
  icon: string;
  folder: string; // Which folder this demo belongs to: 'official', 'team', '@username'
}

// All available demos (will be filtered based on VITE_SHOW_DEMOS env var)
const ALL_DEMO_CARDS: DemoCard[] = [
  {
    title: 'App Shell',
    description: 'Explore Rippling\'s main application shell with navigation, sidebar, and content areas.',
    path: '/app-shell-demo',
    icon: Icon.TYPES.HIERARCHY_HORIZONTAL_OUTLINE,
    folder: 'official',
  },
  {
    title: 'Design Tokens',
    description: 'Browse and explore Pebble design tokens including colors, spacing, and typography.',
    path: '/design-tokens-demo',
    icon: Icon.TYPES.CUP_DROPLET_OUTLINE,
    folder: '@paul',
  },
  {
    title: 'Animations',
    description: 'See Pebble animation patterns and transitions in action.',
    path: '/animations-demo',
    icon: Icon.TYPES.PLAY_CIRCLE_OUTLINE,
    folder: '@paul',
  },
  {
    title: 'Drawer Demo',
    description: 'Explore drawer and modal patterns with various configurations.',
    path: '/drawer-demo',
    icon: Icon.TYPES.DOCUMENT_OUTLINE,
    folder: '@paul',
  },
  {
    title: 'Forked Select Test',
    description: 'Test forked select component variations and interactions.',
    path: '/forked-select-test',
    icon: Icon.TYPES.LIST_OUTLINE,
    folder: '@paul',
  },
  {
    title: 'My Feature',
    description: 'My custom feature demo based on the app shell template.',
    path: '/my-feature-demo',
    icon: Icon.TYPES.STAR_OUTLINE,
    folder: '@paul',
  },
];

// Get demos that user has access to based on VITE_SHOW_DEMOS environment variable
const getAccessibleDemos = (): DemoCard[] => {
  const showDemos = import.meta.env.VITE_SHOW_DEMOS || 'official';
  
  // If set to 'all', show everything
  if (showDemos === 'all') {
    return ALL_DEMO_CARDS;
  }
  
  // Split by comma and trim whitespace
  const foldersToShow = showDemos.split(',').map((f: string) => f.trim());
  
  // Filter demos that match any of the specified folders
  return ALL_DEMO_CARDS.filter(demo => 
    foldersToShow.includes(demo.folder)
  );
};

// Filter demos based on active tab
const filterDemosByTab = (demos: DemoCard[], activeTab: string): DemoCard[] => {
  switch (activeTab) {
    case 'all':
      return demos; // Show all accessible demos
    case 'personal':
      // Show only current user's demos (@paul folder)
      // Private demos aren't in the list (gitignored)
      return demos.filter(demo => demo.folder === '@paul');
    case 'team':
      // Show team demos + other people's @ folders (exclude current user's @paul)
      return demos.filter(demo => 
        demo.folder === 'team' || (demo.folder.startsWith('@') && demo.folder !== '@paul')
      );
    case 'templates':
      return demos.filter(demo => demo.folder === 'official');
    default:
      return demos;
  }
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space1600} ${({ theme }) => (theme as StyledTheme).space800};
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space1000};
`;

const GreetingRow = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const GreetingText = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  opacity: 0.7;
`;

const Title = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2DisplayMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
`;

const Description = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  max-width: 800px;
  line-height: 1.6;
  
  a {
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: ${({ theme }) => (theme as StyledTheme).space800};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const SectionLabel = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const GuidesSection = styled.section`
  margin-top: ${({ theme }) => (theme as StyledTheme).space1200};
  padding-top: ${({ theme }) => (theme as StyledTheme).space1000};
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const GuidesTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space800} 0;
`;

const GuidesDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
  max-width: 800px;
`;

const CodePath = styled.code`
  ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
`;

const ResourceLink = styled.a`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  text-decoration: none;
  cursor: pointer;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TableSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const TableHeader = styled.div`
  display: flex;
  flex-direction: row;
  align-items: baseline;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const TableTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const TableSeparator = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const TableDescription = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const DemoGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const DemoCardWrapper = styled.div`
  position: relative;
  cursor: pointer;
  transition: transform 150ms ease;
  
  &:hover {
    transform: translateY(-4px);
  }
  
  &:active {
    transform: translateY(-2px);
  }
`;

const BadgeWrapper = styled.div`
  position: absolute;
  top: ${({ theme }) => (theme as StyledTheme).space300};
  right: ${({ theme }) => (theme as StyledTheme).space300};
  z-index: 1;
  pointer-events: none;
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
`;

const CardIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  background-color: ${({ theme }) => (theme as StyledTheme).colorPrimaryVariant};
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const CardTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const CardDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.5;
`;

const AddCardWrapper = styled.div`
  cursor: pointer;
`;

const AddCardContent = styled.div`
  background-color: transparent;
  border: 2px dashed ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner3xl};
  padding: 44px 24px;
  display: flex;
  flex-direction: column;
  transition: border-color 150ms ease, background-color 150ms ease;
  
  &:hover {
    border-color: ${({ theme }) => (theme as StyledTheme).colorOutline};
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const AddCardIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${({ theme }) => (theme as StyledTheme).space400};
`;

const AddCardTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space200} 0;
  text-align: center;
`;

const AddCardDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.5;
  text-align: center;
`;

const DrawerContent = styled.div``;

const InstructionSection = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const InstructionTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
`;

const InstructionText = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space300} 0;
  line-height: 1.6;
`;

const CodeSnippet = styled.code`
  ${({ theme }) => (theme as StyledTheme).typestyleV2CodeMedium};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  padding: ${({ theme }) => (theme as StyledTheme).space200} ${({ theme }) => (theme as StyledTheme).space300};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  display: inline-block;
  margin: ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const StepNumber = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
  font-weight: 600;
  margin-right: ${({ theme }) => (theme as StyledTheme).space200};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => (theme as StyledTheme).space1600} ${({ theme }) => (theme as StyledTheme).space800};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const EmptyStateIcon = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
  opacity: 0.6;
`;

const EmptyStateTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
`;

const EmptyStateDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  max-width: 600px;
  margin: 0 auto;
  line-height: 1.6;

  code {
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    padding: 2px 6px;
    border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerS};
    ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
  }
`;

const IndexPage: React.FC = () => {
  const { theme } = usePebbleTheme();
  const navigate = useNavigate();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [activeTabIndex, setActiveTabIndex] = useState(0);

  // Tab configuration: maps index to filter type
  const tabFilters = ['all', 'personal', 'team', 'templates'];
  const activeTabFilter = tabFilters[activeTabIndex];

  // Get user preferences from environment (with safe fallbacks)
  const userName = import.meta.env.VITE_USER_NAME;
  const githubAvatar = import.meta.env.VITE_USER_GITHUB_AVATAR;
  const gravatarUrl = import.meta.env.VITE_USER_GRAVATAR;
  
  // Prefer GitHub avatar, fallback to Gravatar
  const avatarUrl = githubAvatar || gravatarUrl;
  
  // Create personalized greeting with fallback to "Rippler"
  const firstName = userName ? userName.split(' ')[0] : 'Rippler';
  const displayName = userName || 'User';

  // Get accessible demos based on env var, then filter by active tab
  const accessibleDemos = getAccessibleDemos();
  const filteredDemos = filterDemosByTab(accessibleDemos, activeTabFilter);

  // Calculate badge counts for each tab
  const allCount = accessibleDemos.length;
  const personalCount = accessibleDemos.filter(demo => demo.folder === '@paul').length;
  const teamCount = accessibleDemos.filter(demo => 
    demo.folder === 'team' || (demo.folder.startsWith('@') && demo.folder !== '@paul')
  ).length;
  const templatesCount = accessibleDemos.filter(demo => demo.folder === 'official').length;

  // Tab descriptions
  const tabDescriptions = {
    all: 'All demos you have access to',
    personal: 'Your personal demos and experiments',
    team: 'Shared demos from teammates',
    templates: 'Official starter templates you can copy',
  };
  
  const currentDescription = tabDescriptions[activeTabFilter as keyof typeof tabDescriptions];

  return (
    <PageContainer theme={theme}>
      <ContentWrapper>
        <Header theme={theme}>
          <GreetingRow theme={theme}>
            {avatarUrl ? (
              <Avatar
                size={Avatar.SIZES.S}
                image={avatarUrl}
                name={displayName}
                alt={`${displayName} avatar`}
              />
            ) : (
              <Avatar
                size={Avatar.SIZES.S}
                name={displayName}
              />
            )}
            <GreetingText theme={theme}>Hi {firstName}</GreetingText>
          </GreetingRow>
          <Title theme={theme}>Welcome to your Pebble Playground</Title>
          <Description theme={theme}>
            A prototyping environment for exploring and building with Rippling's Pebble Design System. 
            Experiment with components, tokens, and patterns in an interactive sandbox.
            {' '}
            <a href="/getting-started" onClick={(e) => { e.preventDefault(); navigate('/getting-started'); }}>
              Learn how to get started
            </a>
            {' '}creating your own demos.
          </Description>
        </Header>

        {/* Section header with tabs */}
        <SectionHeader theme={theme}>
          <SectionLabel theme={theme}>
            {currentDescription}
          </SectionLabel>
          
          <Tabs.SWITCH activeIndex={activeTabIndex} onChange={(index) => setActiveTabIndex(Number(index))}>
            <Tabs.Tab 
              title="All" 
              badge={{ 
                text: String(allCount), 
                appearance: activeTabIndex === 0 ? BADGE_APPEARANCES.PRIMARY_LIGHT : BADGE_APPEARANCES.NEUTRAL 
              }} 
            />
            <Tabs.Tab 
              title="Personal" 
              badge={{ 
                text: String(personalCount), 
                appearance: activeTabIndex === 1 ? BADGE_APPEARANCES.PRIMARY_LIGHT : BADGE_APPEARANCES.NEUTRAL 
              }} 
            />
            <Tabs.Tab 
              title="Team" 
              badge={{ 
                text: String(teamCount), 
                appearance: activeTabIndex === 2 ? BADGE_APPEARANCES.PRIMARY_LIGHT : BADGE_APPEARANCES.NEUTRAL 
              }} 
            />
            <Tabs.Tab 
              title="Templates" 
              badge={{ 
                text: String(templatesCount), 
                appearance: activeTabIndex === 3 ? BADGE_APPEARANCES.PRIMARY_LIGHT : BADGE_APPEARANCES.NEUTRAL 
              }} 
            />
          </Tabs.SWITCH>
        </SectionHeader>

        {activeTabFilter === 'personal' && filteredDemos.length === 0 && (
          <EmptyState theme={theme}>
            <EmptyStateIcon theme={theme}>
              <Icon type={Icon.TYPES.ADD_CIRCLE_OUTLINE} size={48} color={theme.colorOnSurfaceVariant} />
            </EmptyStateIcon>
            <EmptyStateTitle theme={theme}>No personal demos yet</EmptyStateTitle>
            <EmptyStateDescription theme={theme}>
              Get started by creating your first demo! Click the "+ Create New Demo" button below.
              <br /><br />
              Tip: Start in your <code>private/</code> folder for experiments, then move to <code>@paul/</code> when ready to share.
            </EmptyStateDescription>
          </EmptyState>
        )}

        {activeTabFilter === 'team' && filteredDemos.length === 0 && (
          <EmptyState theme={theme}>
            <EmptyStateIcon theme={theme}>
              <Icon type={Icon.TYPES.USERS_OUTLINE} size={48} color={theme.colorOnSurfaceVariant} />
            </EmptyStateIcon>
            <EmptyStateTitle theme={theme}>No team demos yet</EmptyStateTitle>
            <EmptyStateDescription theme={theme}>
              Team demos and other collaborators' demos will appear here once they're added to the repository.
            </EmptyStateDescription>
          </EmptyState>
        )}

        <DemoGrid theme={theme}>
          {filteredDemos.map((demo) => {
            const isOfficialTemplate = demo.folder === 'official';
            
            return (
              <DemoCardWrapper
                key={demo.path}
                onClick={() => navigate(demo.path)}
              >
                {isOfficialTemplate && (
                  <BadgeWrapper theme={theme}>
                    <Label size={Label.SIZES.S} appearance={Label.APPEARANCES.NEUTRAL}>
                      Official Template
                    </Label>
                  </BadgeWrapper>
                )}
                <Card.Layout padding={Card.Layout.PADDINGS.PX_24}>
                  <CardContent>
                    <CardIcon theme={theme}>
                      <Icon 
                        type={demo.icon} 
                        size={24} 
                        color={theme.colorPrimary}
                      />
                    </CardIcon>
                    <CardTitle theme={theme}>{demo.title}</CardTitle>
                    <CardDescription theme={theme}>
                      {demo.description}
                    </CardDescription>
                  </CardContent>
                </Card.Layout>
              </DemoCardWrapper>
            );
          })}
          
          {/* Create New Demo Card */}
          <AddCardWrapper onClick={() => setIsDrawerOpen(true)}>
            <AddCardContent theme={theme}>
              <AddCardIcon theme={theme}>
                <Icon 
                  type={Icon.TYPES.ADD_CIRCLE_OUTLINE} 
                  size={24} 
                  color={theme.colorOnSurface} 
                />
              </AddCardIcon>
              <AddCardTitle theme={theme}>Create a New Demo</AddCardTitle>
            </AddCardContent>
          </AddCardWrapper>
        </DemoGrid>

        {/* How AI Consumes Pebble Section */}
        <GuidesSection theme={theme}>
          <GuidesTitle theme={theme}>How AI Consumes Pebble</GuidesTitle>
          
          <VStack gap="3rem">
            <TableSection theme={theme}>
              <TableHeader theme={theme}>
                <TableTitle theme={theme}>Primary</TableTitle>
                <TableSeparator theme={theme}>•</TableSeparator>
                <TableDescription theme={theme}>
                  AI's automatic workflow — checks these constantly without being asked
                </TableDescription>
              </TableHeader>
              <TableBasic>
              <TableBasic.THead>
                <TableBasic.Tr>
                  <TableBasic.Th>Resource</TableBasic.Th>
                  <TableBasic.Th>Description</TableBasic.Th>
                  <TableBasic.Th>Source</TableBasic.Th>
                  <TableBasic.Th>Location</TableBasic.Th>
                </TableBasic.Tr>
              </TableBasic.THead>
              
              <TableBasic.TBody>
                <TableBasic.Tr>
                  <TableBasic.Td>
                    .cursorrules
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Primary directive, token reference, component gotchas
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Hand-written for AI agents
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>.cursorrules</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/COMPONENT_CATALOG.md&title=Component Catalog');
                      }}
                    >
                      Component Catalog
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Component props, examples, and common gotchas
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Hand-curated from Pebble source
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/COMPONENT_CATALOG.md</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    Existing code files
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Pattern matching for token usage and component patterns
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Live code examples in demos
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>src/demos/*.tsx</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    Pebble source
                  </TableBasic.Td>
                  <TableBasic.Td>
                    When Catalog is missing info or needs deeper understanding
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Rippling Pebble monorepo
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>../pebble/packages/rippling-ui/</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
              </TableBasic.TBody>
            </TableBasic>
            </TableSection>
            
            <TableSection theme={theme}>
              <TableHeader theme={theme}>
                <TableTitle theme={theme}>Secondary</TableTitle>
                <TableSeparator theme={theme}>•</TableSeparator>
                <TableDescription theme={theme}>
                  AI uses these only when explicitly directed or when primary sources don't have enough context
                </TableDescription>
              </TableHeader>
              <TableBasic>
              <TableBasic.THead>
                <TableBasic.Tr>
                  <TableBasic.Th>Resource</TableBasic.Th>
                  <TableBasic.Th>Description</TableBasic.Th>
                  <TableBasic.Th>Source</TableBasic.Th>
                  <TableBasic.Th>Location</TableBasic.Th>
                </TableBasic.Tr>
              </TableBasic.THead>
              
              <TableBasic.TBody>
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/TOKEN_CATALOG.md&title=Token Catalog');
                      }}
                    >
                      Token Catalog
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Full list of colors, spacing, typography, shapes
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Hand-curated from Pebble source
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/TOKEN_CATALOG.md</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/AI_PROMPTING_GUIDE.md&title=AI Prompting Guide');
                      }}
                    >
                      AI Prompting Guide
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Usage patterns and best practices
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Hand-written for AI context
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/AI_PROMPTING_GUIDE.md</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/guides/components/README.md&title=Component Guides');
                      }}
                    >
                      Component Guides
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    When to use, accessibility, design rationale
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Synced from Confluence RDS
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/guides/components/</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/guides/patterns/README.md&title=Design Patterns');
                      }}
                    >
                      Pattern Guides
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    UX patterns and layout solutions
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Synced from Confluence RDS
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/guides/patterns/</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
                
                <TableBasic.Tr>
                  <TableBasic.Td>
                    <ResourceLink 
                      theme={theme}
                      onClick={(e) => {
                        e.preventDefault();
                        navigate('/docs?file=docs/guides/tokens/README.md&title=Token Documentation');
                      }}
                    >
                      Token Guides
                    </ResourceLink>
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Detailed token documentation
                  </TableBasic.Td>
                  <TableBasic.Td>
                    Auto-generated from Pebble npm
                  </TableBasic.Td>
                  <TableBasic.Td>
                    <CodePath theme={theme}>docs/guides/tokens/</CodePath>
                  </TableBasic.Td>
                </TableBasic.Tr>
              </TableBasic.TBody>
            </TableBasic>
            </TableSection>
          </VStack>
        </GuidesSection>
      </ContentWrapper>

      {/* Instructions Drawer */}
      <Drawer
        isVisible={isDrawerOpen}
        onCancel={() => setIsDrawerOpen(false)}
        title="Create a New Demo with Cursor"
        width={600}
      >
        <DrawerContent theme={theme}>
          <InstructionSection theme={theme}>
            <InstructionTitle theme={theme}>
              <StepNumber theme={theme}>Step 1:</StepNumber>
              Open Cursor Chat
            </InstructionTitle>
            <InstructionText theme={theme}>
              Press <strong>Cmd+L</strong> (Mac) or <strong>Ctrl+L</strong> (Windows/Linux) to open Cursor's chat interface.
            </InstructionText>
          </InstructionSection>

          <InstructionSection theme={theme}>
            <InstructionTitle theme={theme}>
              <StepNumber theme={theme}>Step 2:</StepNumber>
              Create Your Demo (Copy & Paste)
            </InstructionTitle>
            <InstructionText theme={theme}>
              Copy this prompt into Cursor (replace "My Feature" with your demo name):
            </InstructionText>
            <CodeSnippet theme={theme}>
              Create a new demo called "My Feature" by copying app-shell-demo.tsx
            </CodeSnippet>
            <InstructionText theme={theme}>
              Cursor will automatically create the file, wire it up in main.tsx, and add a card to the index page.
            </InstructionText>
          </InstructionSection>

          <InstructionSection theme={theme}>
            <InstructionTitle theme={theme}>
              <StepNumber theme={theme}>Step 3:</StepNumber>
              Customize the Content
            </InstructionTitle>
            <InstructionText theme={theme}>
              Now tell Cursor what you want to build. Use simple, direct commands:
            </InstructionText>
            <CodeSnippet theme={theme}>
              Replace the main content with a data table showing employee records with search and filters
            </CodeSnippet>
            <CodeSnippet theme={theme}>
              Update the content area to show a dashboard with 4 metric cards and a chart
            </CodeSnippet>
            <CodeSnippet theme={theme}>
              Add a multi-step form wizard in the main content section
            </CodeSnippet>
          </InstructionSection>

          <InstructionSection theme={theme}>
            <InstructionTitle theme={theme}>
              <StepNumber theme={theme}>Step 4:</StepNumber>
              Refine and Iterate
            </InstructionTitle>
            <InstructionText theme={theme}>
              Continue with natural language commands to polish your demo:
            </InstructionText>
            <CodeSnippet theme={theme}>
              Update the sidebar navigation items
            </CodeSnippet>
            <CodeSnippet theme={theme}>
              Adjust spacing to match the design system
            </CodeSnippet>
            <CodeSnippet theme={theme}>
              Add a loading state to the table
            </CodeSnippet>
            <CodeSnippet theme={theme}>
              Make the layout responsive for mobile
            </CodeSnippet>
          </InstructionSection>

          <InstructionSection theme={theme}>
            <InstructionTitle theme={theme}>
              <StepNumber theme={theme}>💡 Pro Tips:</StepNumber>
            </InstructionTitle>
            <InstructionText theme={theme}>
              • Cursor has access to all documentation automatically<br/>
              • The app shell gives you navigation, sidebar, and content areas<br/>
              • Focus on customizing the main content - keep the shell structure<br/>
              • Use simple, direct commands for best results
            </InstructionText>
          </InstructionSection>
        </DrawerContent>
      </Drawer>
    </PageContainer>
  );
};

export default IndexPage;

