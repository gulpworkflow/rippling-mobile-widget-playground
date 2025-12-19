import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from '@emotion/styled';
import Button from '@rippling/pebble/Button';
import Icon from '@rippling/pebble/Icon';
import TableBasic from '@rippling/pebble/TableBasic';
import Dropdown from '@rippling/pebble/Dropdown';
import { usePebbleTheme, StyledTheme } from '@/utils/theme';
import { Composition, MOCK_COMPOSITIONS } from './types';
import { getFromLocalStorage, setInLocalStorage } from '@/utils/localStorage';
import { DeleteCompositionModal } from './compositions/DeleteCompositionModal';
import { CreateCompositionModal } from './compositions/CreateCompositionModal';

/**
 * CompositionsTab Component
 *
 * Displays the list of compositions (building blocks for apps).
 * Shows drafts, templates, and reusable components.
 *
 * Features:
 * - Empty state with CTA to create composition
 * - TableBasic list view with composition data
 * - Edit/Delete actions per row
 * - Delete confirmation modal
 * - localStorage persistence
 */

const STORAGE_KEY = 'compositions';

export const CompositionsTab: React.FC = () => {
  const { theme } = usePebbleTheme();
  const navigate = useNavigate();

  const [compositions, setCompositions] = useState<Composition[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [compositionToDelete, setCompositionToDelete] = useState<Composition | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Load compositions from localStorage on mount
  useEffect(() => {
    loadCompositions();
  }, []);

  const loadCompositions = () => {
    const stored = getFromLocalStorage<Composition[]>(STORAGE_KEY, []);
    const showMockCompositions = getFromLocalStorage<boolean>('showMockCompositions', true);

    // Initialize with mock data if localStorage is empty
    if (stored.length === 0) {
      setInLocalStorage(STORAGE_KEY, MOCK_COMPOSITIONS);
      setCompositions(MOCK_COMPOSITIONS);
    } else {
      // Filter out mock data if showMockCompositions is false
      const filtered = showMockCompositions ? stored : stored.filter(c => !c.isMockData);
      setCompositions(filtered);
    }
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  const handleCreateCancel = () => {
    setShowCreateModal(false);
  };

  const handleCreateSave = (name: string, systemName: string) => {
    // Generate a unique ID
    const newId = `comp-${Date.now()}`;

    // Create new composition
    const newComposition: Composition = {
      id: newId,
      name,
      systemName,
      usedIn: [],
      createdBy: 'You',
      createdDate: new Date().toISOString(),
      isMockData: false,
    };

    // Add to compositions array and save to localStorage
    const updated = [...compositions, newComposition];
    setCompositions(updated);
    setInLocalStorage(STORAGE_KEY, [
      ...getFromLocalStorage<Composition[]>(STORAGE_KEY, []),
      newComposition,
    ]);

    // Close modal
    setShowCreateModal(false);

    // Navigate to the new composition
    navigate(`/app-studio/composition-manager/compositions/${newId}`);
  };

  const getNextCompositionNumber = (): number => {
    // Find the highest number from existing "Composition N" names
    const numbers = compositions
      .map(c => {
        const match = c.name.match(/^Composition (\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      })
      .filter(n => n > 0);

    return numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
  };

  const handleEdit = (id: string) => {
    navigate(`/app-studio/composition-manager/compositions/${id}`);
  };

  const handleDeleteClick = (composition: Composition) => {
    setCompositionToDelete(composition);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = () => {
    if (compositionToDelete) {
      const updated = compositions.filter(c => c.id !== compositionToDelete.id);
      setCompositions(updated);
      setInLocalStorage(STORAGE_KEY, updated);
    }
    setShowDeleteModal(false);
    setCompositionToDelete(null);
  };

  const handleDeleteCancel = () => {
    setShowDeleteModal(false);
    setCompositionToDelete(null);
  };

  const handleMenuAction = (composition: Composition, value: string) => {
    switch (value) {
      case 'delete':
        handleDeleteClick(composition);
        break;
      case 'manage-access':
        console.log('Manage access for composition:', composition.id, composition.name);
        break;
      default:
        break;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Show empty state if no compositions exist
  if (compositions.length === 0) {
    return (
      <>
        <EmptyState theme={theme}>
          <EmptyStateIcon>
            <Icon
              type={Icon.TYPES.DOCUMENT_OUTLINE}
              size={48}
              color={theme.colorOnSurfaceVariant}
            />
          </EmptyStateIcon>
          <EmptyStateTitle theme={theme}>No compositions yet</EmptyStateTitle>
          <EmptyStateDescription theme={theme}>
            Create your first composition to start building reusable UI components for your apps.
          </EmptyStateDescription>
          <EmptyStateActions>
            <Button
              appearance={Button.APPEARANCES.PRIMARY}
              size={Button.SIZES.M}
              onClick={handleCreate}
              icon={{
                type: Icon.TYPES.ADD_CIRCLE_OUTLINE,
                alignment: Button.ICON_ALIGNMENTS.LEFT,
              }}
            >
              Create composition
            </Button>
          </EmptyStateActions>
        </EmptyState>
      </>
    );
  }

  // Show table view when compositions exist
  return (
    <>
      <Header theme={theme}>
        <HeaderContent>
          <HeaderTitle theme={theme}>Compositions</HeaderTitle>
          <HeaderDescription theme={theme}>
            {compositions.length} {compositions.length === 1 ? 'composition' : 'compositions'}
          </HeaderDescription>
        </HeaderContent>
        <HeaderActions>
          <Button
            appearance={Button.APPEARANCES.PRIMARY}
            size={Button.SIZES.M}
            onClick={handleCreate}
            icon={{
              type: Icon.TYPES.ADD_CIRCLE_OUTLINE,
              alignment: Button.ICON_ALIGNMENTS.LEFT,
            }}
          >
            New
          </Button>
        </HeaderActions>
      </Header>

      <TableContainer theme={theme}>
        <TableBasic>
          <TableBasic.THead>
            <TableBasic.Tr>
              <TableBasic.Th>Name</TableBasic.Th>
              <TableBasic.Th>System name</TableBasic.Th>
              <TableBasic.Th>Used in</TableBasic.Th>
              <TableBasic.Th>Created by</TableBasic.Th>
              <TableBasic.Th>Created</TableBasic.Th>
              <TableBasic.Th align={TableBasic.ALIGNMENTS.RIGHT}>Actions</TableBasic.Th>
            </TableBasic.Tr>
          </TableBasic.THead>
          <TableBasic.TBody>
            {compositions.map(composition => (
              <TableBasic.Tr key={composition.id}>
                <TableBasic.Td>
                  <CompositionName theme={theme}>{composition.name}</CompositionName>
                </TableBasic.Td>
                <TableBasic.Td>
                  <SystemName theme={theme}>{composition.systemName}</SystemName>
                </TableBasic.Td>
                <TableBasic.Td>
                  <UsedInList theme={theme}>{composition.usedIn.join(', ')}</UsedInList>
                </TableBasic.Td>
                <TableBasic.Td>{composition.createdBy}</TableBasic.Td>
                <TableBasic.Td>{formatDate(composition.createdDate)}</TableBasic.Td>
                <TableBasic.Td align={TableBasic.ALIGNMENTS.RIGHT}>
                  <ActionButtons>
                    <ActionButton
                      appearance={Button.APPEARANCES.GHOST}
                      size={Button.SIZES.S}
                      onClick={() => handleEdit(composition.id)}
                      aria-label={`Edit ${composition.name}`}
                    >
                      <Icon type={Icon.TYPES.EDIT_OUTLINE} size={16} />
                    </ActionButton>
                    <Dropdown
                      list={[
                        {
                          label: 'Manage access',
                          leftIconType: Icon.TYPES.USER_OUTLINE,
                          value: 'manage-access',
                        },
                        {
                          label: 'Delete',
                          leftIconType: Icon.TYPES.TRASH_OUTLINE,
                          value: 'delete',
                        },
                      ]}
                      onChange={value => handleMenuAction(composition, value as string)}
                      shouldAutoClose
                      placement="bottom-end"
                    >
                      <ActionButton
                        appearance={Button.APPEARANCES.GHOST}
                        size={Button.SIZES.S}
                        aria-label={`More options for ${composition.name}`}
                      >
                        <Icon type={Icon.TYPES.MORE_VERTICAL} size={16} />
                      </ActionButton>
                    </Dropdown>
                  </ActionButtons>
                </TableBasic.Td>
              </TableBasic.Tr>
            ))}
          </TableBasic.TBody>
        </TableBasic>
      </TableContainer>

      <DeleteCompositionModal
        isVisible={showDeleteModal}
        compositionName={compositionToDelete?.name || ''}
        onCancel={handleDeleteCancel}
        onConfirm={handleDeleteConfirm}
      />

      <CreateCompositionModal
        isVisible={showCreateModal}
        nextCompositionNumber={getNextCompositionNumber()}
        onCancel={handleCreateCancel}
        onSave={handleCreateSave}
      />
    </>
  );
};

// Styled Components

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space1600} ${(theme as StyledTheme).space800}`};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerXl};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  max-width: 600px;
  margin: ${({ theme }) => (theme as StyledTheme).space800} auto;
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
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0 0 ${({ theme }) => (theme as StyledTheme).space600} 0;
  line-height: 1.5;
`;

const EmptyStateActions = styled.div`
  display: flex;
  justify-content: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  /* padding: ${({ theme }) => (theme as StyledTheme).space400} 0; */
`;

const HeaderContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const HeaderTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const HeaderDescription = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const TableContainer = styled.div`
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner3xl};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  overflow: hidden;
`;

const CompositionName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  font-weight: 600;
`;

const SystemName = styled.code`
  ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space100} ${(theme as StyledTheme).space200}`};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary};
`;

const UsedInList = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  justify-content: flex-end;
`;

const ActionButton = styled(Button)`
  /* Additional styling if needed */
`;
