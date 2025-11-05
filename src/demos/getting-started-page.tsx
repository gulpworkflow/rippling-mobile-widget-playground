import React from 'react';
import styled from '@emotion/styled';
import { useTheme } from '@rippling/pebble/theme';
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
  background-color: ${({ theme }) => (theme as any).colorSurface};
  padding: ${({ theme }) => (theme as any).space1000} ${({ theme }) => (theme as any).space800};
`;

const ContentWrapper = styled.div`
  max-width: 800px;
  margin: 0 auto;
`;

const BackButton = styled.div`
  margin-bottom: ${({ theme }) => (theme as any).space600};
`;

const Article = styled.article`
  background-color: ${({ theme }) => (theme as any).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as any).shapeCornerXl};
  padding: ${({ theme }) => (theme as any).space1000};
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant};
`;

const Title = styled.h1`
  ${({ theme }) => (theme as any).typestyleV2DisplaySmall};
  color: ${({ theme }) => (theme as any).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as any).space600} 0;
`;

const Section = styled.section`
  margin-bottom: ${({ theme }) => (theme as any).space800};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  ${({ theme }) => (theme as any).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as any).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as any).space400} 0;
`;

const Paragraph = styled.p`
  ${({ theme }) => (theme as any).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as any).space400} 0;
  line-height: 1.6;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OrderedList = styled.ol`
  ${({ theme }) => (theme as any).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as any).space400} 0;
  padding-left: ${({ theme }) => (theme as any).space600};
  line-height: 1.8;
  
  li {
    margin-bottom: ${({ theme }) => (theme as any).space300};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  strong {
    color: ${({ theme }) => (theme as any).colorOnSurface};
    font-weight: 600;
  }
`;

const UnorderedList = styled.ul`
  ${({ theme }) => (theme as any).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as any).space400} 0;
  padding-left: ${({ theme }) => (theme as any).space600};
  line-height: 1.8;
  
  li {
    margin-bottom: ${({ theme }) => (theme as any).space300};
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  code {
    ${({ theme }) => (theme as any).typestyleV2CodeSmall};
    background-color: ${({ theme }) => (theme as any).colorSurfaceContainerHighest};
    padding: ${({ theme }) => (theme as any).space50} ${({ theme }) => (theme as any).space200};
    border-radius: ${({ theme }) => (theme as any).shapeCornerS};
    color: ${({ theme }) => (theme as any).colorOnSurface};
  }
`;

const CodeBlock = styled.pre`
  ${({ theme }) => (theme as any).typestyleV2CodeMedium};
  background-color: ${({ theme }) => (theme as any).colorSurfaceContainerHighest};
  padding: ${({ theme }) => (theme as any).space500};
  border-radius: ${({ theme }) => (theme as any).shapeCornerM};
  overflow-x: auto;
  margin: ${({ theme }) => (theme as any).space400} 0;
  color: ${({ theme }) => (theme as any).colorOnSurface};
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant};
`;

const Callout = styled.div`
  background-color: ${({ theme }) => (theme as any).colorPrimaryContainer};
  padding: ${({ theme }) => (theme as any).space500};
  border-radius: ${({ theme }) => (theme as any).shapeCornerM};
  margin: ${({ theme }) => (theme as any).space400} 0;
  border-left: 4px solid ${({ theme }) => (theme as any).colorPrimary};
  
  p {
    ${({ theme }) => (theme as any).typestyleV2BodyMedium};
    color: ${({ theme }) => (theme as any).colorOnPrimaryContainer};
    margin: 0;
  }
`;

const GettingStartedPage: React.FC = () => {
  const { theme } = useTheme();
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
              Pebble Playground is an interactive environment for designers and developers to prototype
              and experiment with Rippling's Pebble Design System. It provides a fast way to build demos,
              test component combinations, and explore design patterns without the overhead of a full
              production environment.
            </Paragraph>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Quick Start for Designers</SectionTitle>
            <Paragraph theme={theme}>
              You don't need to be an engineer to use this playground. Here's how to get started:
            </Paragraph>
            <OrderedList theme={theme}>
              <li>
                <strong>Explore existing demos</strong> - Click through the demo cards on the home page
                to see examples of what's possible with Pebble components.
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
              <li><code>docs/COMPONENT_CATALOG.md</code> - Quick reference for all Pebble components</li>
              <li><code>docs/TOKEN_CATALOG.md</code> - Design tokens for colors, spacing, typography</li>
              <li><code>docs/guides/components/</code> - Detailed component documentation</li>
              <li><code>docs/guides/patterns/</code> - Common UX patterns and best practices</li>
              <li><code>src/demos/</code> - Example demos you can learn from</li>
            </UnorderedList>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Creating Your First Demo</SectionTitle>
            <Paragraph theme={theme}>
              The easiest way to create a new demo is by using Cursor's AI chat. You don't need to run terminal commands or manually create files—just describe what you want to build.
            </Paragraph>
            
            <Paragraph theme={theme}>
              <strong>Step 1: Open Cursor's chat</strong> (Cmd+L or Ctrl+L)
            </Paragraph>
            
            <Paragraph theme={theme}>
              <strong>Step 2: Use this prompt format:</strong>
            </Paragraph>
            
            <CodeBlock theme={theme}>{`Create a new demo called "[Your Demo Name]" by copying app-shell-demo.tsx.

Show [describe what you want to build].

Use Pebble components.`}</CodeBlock>

            <Paragraph theme={theme}>
              <strong>Example prompts:</strong>
            </Paragraph>
            
            <UnorderedList theme={theme}>
              <li>
                <em>"Create a new demo called 'Employee Directory' by copying app-shell-demo.tsx. Show a list of employees with avatars, names, and job titles. Use Pebble components."</em>
              </li>
              <li>
                <em>"Create a new demo called 'Settings Panel' by copying app-shell-demo.tsx. Show a form with toggle switches, text inputs, and a save button. Use Pebble components."</em>
              </li>
              <li>
                <em>"Create a new demo called 'Task Manager' by copying app-shell-demo.tsx. Show a list of tasks with checkboxes and delete buttons. Use Pebble components."</em>
              </li>
            </UnorderedList>

            <Paragraph theme={theme}>
              <strong>What Cursor does automatically:</strong>
            </Paragraph>
            
            <OrderedList theme={theme}>
              <li>Creates a new file in <code>src/demos/your-demo-name.tsx</code></li>
              <li>Copies the app shell structure (navigation, sidebar, content area)</li>
              <li>Wires it up in <code>src/main.tsx</code> with routes and demo switcher</li>
              <li>Adds a card to the homepage in <code>src/demos/index-page.tsx</code></li>
              <li>Uses proper Pebble components and design tokens</li>
            </OrderedList>

            <Callout theme={theme}>
              <p>
                <strong>💡 Why start with app-shell-demo?</strong> It includes Rippling's standard app layout (navigation bar, sidebar, content area) so your prototypes look production-ready from the start. You can customize or remove any parts you don't need.
              </p>
            </Callout>

            <Paragraph theme={theme}>
              After Cursor creates your demo, visit <code>http://localhost:4201</code> and you'll see it listed on the homepage. Click it to view and start iterating!
            </Paragraph>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Tips for Better Results</SectionTitle>
            <UnorderedList theme={theme}>
              <li><strong>Be specific:</strong> Instead of "a form," say "a form with text inputs for name and email, and a submit button"</li>
              <li><strong>Reference components:</strong> Mention Pebble component names when you know them: "Use Card.Layout for the container"</li>
              <li><strong>Test both themes:</strong> Toggle between light and dark mode to ensure your demo looks good in both</li>
              <li><strong>Iterate incrementally:</strong> Start simple, then ask for refinements one at a time</li>
              <li><strong>Ask questions:</strong> If you're unsure, ask Cursor: "What Pebble components should I use for a settings form?"</li>
            </UnorderedList>
          </Section>

          <Section theme={theme}>
            <SectionTitle theme={theme}>Need Help?</SectionTitle>
            <Paragraph theme={theme}>
              If you run into issues or have questions:
            </Paragraph>
            <UnorderedList theme={theme}>
              <li>Check the <code>docs/COMPONENT_CATALOG.md</code> "Common Gotchas" section</li>
              <li>Look at similar demos in <code>src/demos/</code> for examples</li>
              <li>Review the component's Confluence documentation in <code>docs/guides/components/</code></li>
              <li>Ask your team members who have experience with Pebble</li>
            </UnorderedList>
          </Section>
        </Article>
      </ContentWrapper>
    </PageContainer>
  );
};

export default GettingStartedPage;

