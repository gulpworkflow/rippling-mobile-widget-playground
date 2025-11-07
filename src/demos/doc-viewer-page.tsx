import React, { useEffect, useState } from 'react';
import styled from '@emotion/styled';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Icon from '@rippling/pebble/Icon';
import Button from '@rippling/pebble/Button';
import { marked } from 'marked';

/**
 * Doc Viewer Page
 * 
 * Dynamically renders markdown documentation files.
 * The markdown files are the source of truth.
 */

const DocViewerPage: React.FC = () => {
  const { theme } = usePebbleTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [htmlContent, setHtmlContent] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const filePath = searchParams.get('file');
  const title = searchParams.get('title') || 'Documentation';

  useEffect(() => {
    const loadMarkdown = async () => {
      if (!filePath) {
        setError('No file specified');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        // Import the markdown file dynamically
        const response = await fetch(`/${filePath}`);
        
        if (!response.ok) {
          throw new Error(`Failed to load file: ${response.statusText}`);
        }
        
        const text = await response.text();
        
        // Parse markdown to HTML
        const html = await marked.parse(text);
        setHtmlContent(html);
      } catch (err) {
        console.error('Error loading markdown:', err);
        setError(err instanceof Error ? err.message : 'Failed to load document');
      } finally {
        setIsLoading(false);
      }
    };

    loadMarkdown();
  }, [filePath]);

  return (
    <PageContainer theme={theme}>
      <ContentWrapper>
        <Header theme={theme}>
          <BackButton
            appearance={Button.APPEARANCES.GHOST}
            size={Button.SIZES.S}
            onClick={() => navigate('/')}
          >
            <Icon type={Icon.TYPES.ARROW_LEFT} size={16} />
            Back to Home
          </BackButton>
          <Title theme={theme}>{title}</Title>
          {filePath && (
            <FilePath theme={theme}>{filePath}</FilePath>
          )}
        </Header>

        {isLoading && (
          <LoadingMessage theme={theme}>Loading documentation...</LoadingMessage>
        )}

        {error && (
          <ErrorMessage theme={theme}>
            <Icon type={Icon.TYPES.ERROR} size={20} />
            {error}
          </ErrorMessage>
        )}

        {!isLoading && !error && htmlContent && (
          <Article 
            theme={theme}
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        )}
      </ContentWrapper>
    </PageContainer>
  );
};

const PageContainer = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space800};
`;

const ContentWrapper = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const BackButton = styled(Button)`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const Title = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2DisplayMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

const FilePath = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  font-family: monospace;
`;

const LoadingMessage = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-align: center;
  padding: ${({ theme }) => (theme as StyledTheme).space1600} 0;
`;

const ErrorMessage = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorError};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  background-color: ${({ theme }) => (theme as StyledTheme).colorErrorContainer};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerL};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
`;

const Article = styled.article`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  padding: ${({ theme }) => (theme as StyledTheme).space1000};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  
  h1 {
    ${({ theme }) => (theme as StyledTheme).typestyleV2DisplaySmall};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
  }
  
  h2 {
    ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    margin: ${({ theme }) => (theme as StyledTheme).space800} 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
    
    &:first-of-type {
      margin-top: 0;
    }
  }
  
  h3 {
    ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    margin: ${({ theme }) => (theme as StyledTheme).space600} 0 ${({ theme }) => (theme as StyledTheme).space300} 0;
  }
  
  h4 {
    ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    margin: ${({ theme }) => (theme as StyledTheme).space400} 0 ${({ theme }) => (theme as StyledTheme).space300} 0;
  }
  
  p {
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
    margin: 0 0 ${({ theme }) => (theme as StyledTheme).space400} 0;
    line-height: 1.6;
  }
  
  ul, ol {
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
  }
  
  code {
    ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
    padding: ${({ theme }) => (theme as StyledTheme).space100} ${({ theme }) => (theme as StyledTheme).space200};
    border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
    font-family: 'SF Mono', 'Monaco', 'Menlo', 'Courier New', monospace;
  }
  
  pre {
    background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerHighest};
    border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
    padding: ${({ theme }) => (theme as StyledTheme).space400};
    margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
    overflow-x: auto;
    
    code {
      ${({ theme }) => (theme as StyledTheme).typestyleV2CodeMedium};
      background-color: transparent;
      padding: 0;
      color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    }
  }
  
  blockquote {
    border-left: 4px solid ${({ theme }) => (theme as StyledTheme).colorPrimary};
    padding-left: ${({ theme }) => (theme as StyledTheme).space600};
    margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
    font-style: italic;
    
    p {
      margin-bottom: ${({ theme }) => (theme as StyledTheme).space300};
      
      &:last-child {
        margin-bottom: 0;
      }
    }
  }
  
  a {
    color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
    text-decoration: none;
    
    &:hover {
      text-decoration: underline;
    }
  }
  
  strong {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
    font-weight: 600;
  }
  
  hr {
    border: none;
    border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
    margin: ${({ theme }) => (theme as StyledTheme).space800} 0;
  }
  
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
    
    th, td {
      ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
      padding: ${({ theme }) => (theme as StyledTheme).space300};
      border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
      text-align: left;
    }
    
    th {
      background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
      color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
      font-weight: 600;
    }
    
    td {
      color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
    }
  }
`;

export default DocViewerPage;

