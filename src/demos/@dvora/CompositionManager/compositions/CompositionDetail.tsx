import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Button from '@rippling/pebble/Button';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import { Composition } from '../types';
import { getFromLocalStorage } from '@/utils/localStorage';

/**
 * CompositionDetail
 * 
 * Placeholder page for creating/editing a composition.
 * Shows composition details and provides navigation back to the list.
 * 
 * Future: Will contain the full composition builder UI.
 */

export const CompositionDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { theme } = usePebbleTheme();
  const [composition, setComposition] = useState<Composition | null>(null);

  const isNewComposition = id === 'new';

  useEffect(() => {
    if (!isNewComposition && id) {
      // Load the composition from localStorage
      const compositions = getFromLocalStorage<Composition[]>('compositions', []);
      const found = compositions.find(c => c.id === id);
      setComposition(found || null);
    }
  }, [id, isNewComposition]);

  const handleBackToList = () => {
    navigate('/app-studio/composition-manager');
  };

  const handleMenuAction = (value: string) => {
    if (!composition) return;

    switch (value) {
      case 'manage-access':
        console.log('Manage access for composition:', composition.id, composition.name);
        break;
      default:
        break;
    }
  };

  return (
    <Container theme={theme}>
      <Header theme={theme}>
        <BackButton
          appearance={Button.APPEARANCES.GHOST}
          size={Button.SIZES.M}
          icon={{
            type: Icon.TYPES.ARROW_LEFT_OUTLINE,
            alignment: Button.ICON_ALIGNMENTS.LEFT,
          }}
          onClick={handleBackToList}
        >
          Back to Compositions
        </BackButton>
      </Header>

      <Content theme={theme}>
        <TitleRow>
          <Title theme={theme}>
            {isNewComposition ? 'Create Composition' : 'Edit Composition'}
          </Title>
          {!isNewComposition && composition && (
            <ActionButton
              appearance={Button.APPEARANCES.GHOST}
              size={Button.SIZES.M}
              onClick={() => handleMenuAction('manage-access')}
              icon={{
                type: Icon.TYPES.USER_OUTLINE,
                alignment: Button.ICON_ALIGNMENTS.LEFT,
              }}
            >
              Manage access
            </ActionButton>
          )}
        </TitleRow>

        {!isNewComposition && composition && (
          <CompositionInfo theme={theme}>
            <InfoRow theme={theme}>
              <Label theme={theme}>Name:</Label>
              <Value theme={theme}>{composition.name}</Value>
            </InfoRow>
            <InfoRow theme={theme}>
              <Label theme={theme}>System Name:</Label>
              <Value theme={theme}>{composition.systemName}</Value>
            </InfoRow>
            <InfoRow theme={theme}>
              <Label theme={theme}>Used In:</Label>
              <Value theme={theme}>{composition.usedIn.join(', ')}</Value>
            </InfoRow>
            <InfoRow theme={theme}>
              <Label theme={theme}>Created By:</Label>
              <Value theme={theme}>{composition.createdBy}</Value>
            </InfoRow>
            <InfoRow theme={theme}>
              <Label theme={theme}>Created:</Label>
              <Value theme={theme}>
                {new Date(composition.createdDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </Value>
            </InfoRow>
          </CompositionInfo>
        )}

        {!isNewComposition && !composition && (
          <ErrorMessage theme={theme}>
            Composition not found. It may have been deleted.
          </ErrorMessage>
        )}

        <Placeholder theme={theme}>
          <PlaceholderIcon>
            <Icon
              type={Icon.TYPES.DOCUMENT_OUTLINE}
              size={48}
              color={theme.colorOnSurfaceVariant}
            />
          </PlaceholderIcon>
          <PlaceholderText theme={theme}>
            Composition builder UI will be implemented here.
          </PlaceholderText>
          <PlaceholderDescription theme={theme}>
            This is a placeholder page. Future functionality will include:
            <ul>
              <li>Visual composition canvas</li>
              <li>Component library browser</li>
              <li>Property editors</li>
              <li>Preview and save capabilities</li>
            </ul>
          </PlaceholderDescription>
        </Placeholder>
      </Content>
    </Container>
  );
};

const Container = styled.div`
  min-height: 100vh;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurface};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
`;

const Header = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const BackButton = styled(Button)`
  /* Additional styling if needed */
`;

const Content = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const TitleRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const Title = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2DisplaySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const ActionButton = styled(Button)`
  /* Additional styling if needed */
`;

const CompositionInfo = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const InfoRow = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  padding: ${({ theme }) => (theme as StyledTheme).space300} 0;
  border-bottom: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};

  &:last-child {
    border-bottom: none;
  }
`;

const Label = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  min-width: 120px;
`;

const Value = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const ErrorMessage = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorError};
  padding: ${({ theme }) => (theme as StyledTheme).space600};
  background-color: ${({ theme }) => (theme as StyledTheme).colorErrorContainer};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerM};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space800};
`;

const Placeholder = styled.div`
  text-align: center;
  padding: ${({ theme }) => (theme as StyledTheme).space1600};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  border: 2px dashed ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

const PlaceholderIcon = styled.div`
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space600};
  opacity: 0.6;
`;

const PlaceholderText = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin-bottom: ${({ theme }) => (theme as StyledTheme).space400};
`;

const PlaceholderDescription = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  max-width: 600px;
  margin: 0 auto;

  ul {
    text-align: left;
    margin-top: ${({ theme }) => (theme as StyledTheme).space400};
    padding-left: ${({ theme }) => (theme as StyledTheme).space600};
  }

  li {
    margin: ${({ theme }) => (theme as StyledTheme).space200} 0;
  }
`;

