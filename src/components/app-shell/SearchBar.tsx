import React from 'react';
import styled from '@emotion/styled';
import { StyledTheme } from '@/utils/theme';
import Icon from '@rippling/pebble/Icon';

interface SearchBarProps {
  placeholder?: string;
  adminMode?: boolean;
  theme: StyledTheme;
}

const StyledSearchBar = styled.div<{ adminMode?: boolean }>`
  flex: 1;
  max-width: 600px;
  background-color: ${({ theme, adminMode }) =>
    adminMode ? 'rgba(255, 255, 255, 0.2)' : (theme as StyledTheme).colorSurfaceContainerHighest};
  opacity: 0.75;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  padding: ${({ theme }) =>
    `${(theme as StyledTheme).space200} ${(theme as StyledTheme).space300}`};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  transition:
    opacity 0.15s ease,
    background-color 200ms ease;

  &:focus-within {
    opacity: 1;
  }

  input {
    flex: 1;
    background: transparent;
    border: none;
    ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
    color: ${({ adminMode }) =>
      adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOnSurface};
    padding: 0;

    &::placeholder {
      color: ${({ adminMode }) =>
        adminMode ? 'white' : ({ theme }) => (theme as StyledTheme).colorOnSurface};
    }

    &:focus {
      outline: none;
    }
  }
`;

export const SearchBar: React.FC<SearchBarProps> = ({ 
  placeholder = 'Search or jump to...', 
  adminMode = false,
  theme 
}) => {
  return (
    <StyledSearchBar theme={theme} adminMode={adminMode}>
      <Icon
        type={Icon.TYPES.SEARCH_OUTLINE}
        size={20}
        color={adminMode ? 'white' : theme.colorOnSurface}
      />
      <input id="global-search" type="text" placeholder={placeholder} />
    </StyledSearchBar>
  );
};

