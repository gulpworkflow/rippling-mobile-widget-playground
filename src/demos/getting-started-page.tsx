import React from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import { useNavigate } from 'react-router-dom';
import Button from '@rippling/pebble/Button';
import Icon from '@rippling/pebble/Icon';

/**
 * Getting Started Page
 *
 * Instructions for designers on how to use Pebble Playground.
 */

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space1000}
    ${({ theme }) => (theme as StyledTheme).space800};
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const BackButton = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
`;

const Article = styled.article`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  padding: ${({ theme }) => (theme as StyledTheme).space1000};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const Title = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2DisplaySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
`;

const Paragraph = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
  line-height: 1.6;

  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderedList = styled.ol`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
  padding-left: ${({ theme }) => (theme as StyledTheme).space600};
  line-height: 1.8;

  li {
    margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};

    &:last-child {
      margin-bottom: 0;
    }
  }

  strong {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    font-weight: 600;
  }
`;

const UnorderedList = styled.ul`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
  padding-left: ${({ theme }) => (theme as StyledTheme).space600};
  line-height: 1.8;

  li {
    margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};

    &:last-child {
      margin-bottom: 0;
    }
  }

  code {
    ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHighest};
    padding: ${({ theme }) => (theme as StyledTheme).space50}
      ${({ theme }) => (theme as StyledTheme).space200};
    border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerS};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  }
`;

const CodeBlock = styled.pre`
  ${({ theme }) => (theme as StyledTheme).typestyleV2CodeMedium};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHighest};
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  overflow-x: auto;
  margin: ${({ theme }) => (theme as StyledTheme).space400} 0;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const Callout = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorPrimaryContainer};
  padding: ${({ theme }) => (theme as StyledTheme).space500};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  margin: ${({ theme }) => (theme as StyledTheme).space400} 0;
  border-left: 4px solid ${({ theme }) => (theme as StyledTheme).colorPrimary};

  p {
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    color: ${({ theme }) => (theme as StyledTheme).colorOnPrimaryContainer};
    margin: 0;
  }
`;

const GettingStartedPage: React.FC = () => {
  const { theme } = usePebbleTheme();
  const navigate = useNavigate();

  return (
    <PageContainer theme={theme}>
      <ContentWrapper>
        <BackButton theme={theme}>
          <Button
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.M}
            icon={Icon.TYPES.ARROW_LEFT}
            onClick={() => navigate('/')}
          >
            Back to Home
          </Button>
        </BackButton>

        <Article theme={theme}>
          <Title theme={theme}>Getting Started with Pebble Playground</Title>

          <Section theme={theme}>
            <SectionTitle theme={theme}>What is Pebble Playground?</SectionTitle>
            <Paragraph theme={theme}>
              Pebble Playground is an interactive environment for designers and developers to
              prototype and experiment with Rippling's Pebble Design System. It provides a fast way
              to build demos, test component combinations, and explore design patterns without the
              overhead of a full production environment.
            </Paragraph>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Quick Start for Designers</SectionTitle>
            <Paragraph theme={theme}>
              You don't need to be an engineer to use this playground. Here's how to get started:
            </Paragraph>
            <OrderedList theme={theme}>
              <li>
                <strong>Explore existing demos</strong> - Click through the demo cards on the home
                page to see examples of what's possible with Pebble components.
              </li>
              <li>
                <strong>Open Cursor</strong> - This playground works with Cursor's AI assistant. Open the chat with <code>Cmd+L</code> (Mac) or <code>Ctrl+L</code> (Windows).
              </li>
              <li>
                <strong>Describe what you want</strong> - Tell Cursor what you want to build in plain English. Be specific about the components and layout you need.
              </li>
              <li>
                <strong>Let AI build it</strong> - Cursor will create the files, write the code, and wire everything up. You'll see your demo appear on the homepage.
              </li>
              <li>
                <strong>Iterate</strong> - Ask Cursor to make changes: "Make that button larger" or "Use a card layout instead" or "Add a search bar at the top."
              </li>
            </OrderedList>
            <Callout theme={theme}>
              <p>
                <strong>💡 New to AI coding?</strong> Don't worry! You're not writing code—you're describing what you want in natural language. Cursor handles the technical details, and you review the results. Think of it as working with a really fast, really patient engineer.
              </p>
            </Callout>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Key Resources</SectionTitle>
            <UnorderedList theme={theme}>
              <li>
                <code>docs/COMPONENT_CATALOG.md</code> - Quick reference for all Pebble components
              </li>
              <li>
                <code>docs/TOKEN_CATALOG.md</code> - Design tokens for colors, spacing, typography
              </li>
              <li>
                <code>docs/guides/components/</code> - Detailed component documentation
              </li>
              <li>
                <code>docs/guides/patterns/</code> - Common UX patterns and best practices
              </li>
              <li>
                <code>src/demos/</code> - Example demos you can learn from
              </li>
            </UnorderedList>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Creating Your First Demo</SectionTitle>
            <Paragraph theme={theme}>Here's a simple example to get you started:</Paragraph>
            <CodeBlock theme={theme}>{`import React from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import Button from '@rippling/pebble/Button';

const MyDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  
  return (
    <Container theme={theme}>
      <Button appearance={Button.APPEARANCES.PRIMARY}>
        Hello Pebble!
      </Button>
    </Container>
  );
};

const Container = styled.div\`
  padding: \${({ theme }) => (theme as StyledTheme).space600};
  background-color: \${({ theme }) => (theme as StyledTheme).colorSurface};
\`;

export default MyDemo;`}</CodeBlock>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Tips for Better Results</SectionTitle>
            <Paragraph theme={theme}>
              Here are some tips to help Cursor create better demos for you:
            </Paragraph>
            <UnorderedList theme={theme}>
              <li>
                <strong>Be specific</strong> - Instead of "build a form," say "build a form with email, password, and a submit button"
              </li>
              <li>
                <strong>Reference existing demos</strong> - Say "Create a demo similar to app-shell-demo but with a data table instead"
              </li>
              <li>
                <strong>Iterate incrementally</strong> - Make one change at a time. It's easier to review and undo if needed.
              </li>
              <li>
                <strong>Test as you go</strong> - Check each change in the browser before asking for the next one
              </li>
            </UnorderedList>
            <Callout theme={theme}>
              <p>
                <strong>💡 Why start with app-shell-demo?</strong> It includes Rippling's standard app layout (navigation bar, sidebar, content area) so your prototypes look production-ready from the start. You can customize or remove any parts you don't need.
              </p>
            </Callout>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Best Practices</SectionTitle>
            <UnorderedList theme={theme}>
              <li>
                Always import and use the <code>usePebbleTheme()</code> hook for accessing theme
                tokens
              </li>
              <li>Use Pebble components instead of building from scratch</li>
              <li>
                Check component APIs in the docs before using - they might differ from expectations
              </li>
              <li>Test your demo in both light and dark modes</li>
              <li>Keep demos focused on a single concept or pattern</li>
            </UnorderedList>
          </Section>

          <Callout theme={theme}>
            <p>
              <strong>💡 Pro Tip:</strong> Use <code>Cmd+K</code> (Mac) or <code>Ctrl+K</code>{' '}
              (Windows) to toggle the top bar visibility in demos for a cleaner preview.
            </p>
          </Callout>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Need Help?</SectionTitle>
            <Paragraph theme={theme}>If you run into issues or have questions:</Paragraph>
            <UnorderedList theme={theme}>
              <li>
                Check the <code>docs/COMPONENT_CATALOG.md</code> "Common Gotchas" section
              </li>
              <li>
                Look at similar demos in <code>src/demos/</code> for examples
              </li>
              <li>
                Review the component's Confluence documentation in{' '}
                <code>docs/guides/components/</code>
              </li>
              <li>Ask your team members who have experience with Pebble</li>
            </UnorderedList>
          </Section>
        </Article>
      </ContentWrapper>
    </PageContainer>
  );
};

export default GettingStartedPage;
