import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import Icon from '@rippling/pebble/Icon';
import { usePebbleTheme } from '@/utils/theme';
import { getQuickActions, type QuickAction, type SkuFlags } from '@/data-models/quick-actions';
import type { PersonaId } from '@/data-models/types';
import WidgetCard from '@/widgets/framework/WidgetCard';
import BaseSheet from '@/widgets/framework/BaseSheet';
import {
  ShortcutsGrid,
  ShortcutItem,
  ShortcutIconCircle,
  ShortcutLabel,
  QUICK_ACTION_ICONS,
  PRODUCT_DISPLAY_NAMES,
} from '@/widgets/ShortcutsWidget';

const ShortcutsSheetGroup = styled.div`
  padding-bottom: 16px;
  margin-bottom: 16px;
  border-bottom: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  &:last-child {
    margin-bottom: 0;
    border-bottom: none;
  }
`;

const SheetFavoritesWidget = styled.div`
  margin-bottom: 12px;
`;

const SheetEditLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as any).colorPrimary || '#7a005d'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
`;

const ShortcutsSheetGroupTitleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 2px;
  background: none;
  border: none;
  padding: 0;
  cursor: pointer;
  font: inherit;
  color: inherit;
  margin-bottom: 4px;
`;

const ShortcutsSheetGroupTitleText = styled.span`
  font-size: 14px;
  font-weight: 400;
  letter-spacing: 0;
  color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  line-height: 1.3;
`;

const SearchBar = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 20px;
`;

const SearchInput = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
  height: 44px;
  padding: 0 16px;
  border-radius: 22px;
  background: ${({ theme }) => (theme as any).colorSurfaceContainerLow || 'rgba(0,0,0,0.06)'};
`;

const SearchInputField = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: 16px;
  color: ${({ theme }) => (theme as any).colorOnSurface || '#000'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;
  &::placeholder { color: ${({ theme }) => (theme as any).colorOnSurfaceVariant || 'rgba(0,0,0,0.5)'}; }
  &:focus { outline: none; }
`;

const AISparkleButton = styled.button`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: 1px solid ${({ theme }) => (theme as any).colorOutlineVariant || 'rgba(0,0,0,0.12)'};
  border-radius: 50%;
  background: ${({ theme }) => (theme as any).colorSurfaceBright || '#fff'};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ShortcutsSheet: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  persona: PersonaId;
  skuFlags: SkuFlags;
  onboarding: boolean;
}> = ({ isOpen, onClose, persona, skuFlags, onboarding }) => {
  const { theme } = usePebbleTheme();
  const [searchQuery, setSearchQuery] = useState('');

  const quickActionsResult = getQuickActions({ persona, skuFlags, onboarding, maxCount: 50 });
  const favorites = getQuickActions({ persona, skuFlags, onboarding, maxCount: 4 }).actions;
  const favoriteIds = useMemo(() => new Set(favorites.map(a => a.id)), [favorites]);
  const groups = useMemo(() => {
    const byProduct: Record<string, QuickAction[]> = {};
    const q = searchQuery.trim().toLowerCase();
    for (const a of quickActionsResult.all) {
      if (favoriteIds.has(a.id)) continue;
      if (q && !a.label.toLowerCase().includes(q)) continue;
      const key = a.product;
      if (!byProduct[key]) byProduct[key] = [];
      byProduct[key].push(a);
    }
    return Object.entries(byProduct).map(([product, actions]) => ({
      product: PRODUCT_DISPLAY_NAMES[product] ?? product,
      actions,
    }));
  }, [quickActionsResult.all, searchQuery, favoriteIds]);

  const searchFooter = (
    <SearchBar>
      <SearchInput>
        <Icon type={Icon.TYPES.SEARCH_OUTLINE} size={20} color={theme.colorOnSurfaceVariant} />
        <SearchInputField
          type="search"
          placeholder="Search shortcuts"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search shortcuts"
        />
      </SearchInput>
      <AISparkleButton type="button" aria-label="Open AI assistant">
        <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path fillRule="evenodd" clipRule="evenodd" d="M1.0871 5.2088C2.69493 4.77473 3.96253 3.50712 4.3966 1.89929H5.60339C6.03746 3.50712 7.30506 4.77473 8.9129 5.2088V6.41559C7.30506 6.84966 6.03746 8.11725 5.60339 9.72509L4.3966 9.7251C3.96253 8.11727 2.69493 6.84966 1.0871 6.41559V5.2088ZM2.85513 5.81219C3.74179 6.32997 4.48222 7.07041 4.99999 7.95706C5.51777 7.0704 6.2582 6.32996 7.14486 5.81219C6.2582 5.29442 5.51777 4.55398 5 3.66732C4.48222 4.55398 3.74179 5.29442 2.85513 5.81219Z" fill={theme.colorOnSurfaceVariant}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M6.92043 10.6255C9.54082 9.91804 11.6058 7.853 12.3133 5.23263H13.5201C14.2275 7.853 16.2925 9.91804 18.9129 10.6255V11.8323C16.2925 12.5397 14.2275 14.6047 13.5201 17.2251L12.3133 17.2251C11.6058 14.6047 9.54082 12.5397 6.92043 11.8323V10.6255ZM8.84684 11.2289C10.6124 12.0975 12.048 13.5332 12.9167 15.2987C13.7853 13.5332 15.221 12.0975 16.9865 11.2289C15.221 10.3602 13.7853 8.92455 12.9167 7.15903C12.048 8.92455 10.6124 10.3602 8.84684 11.2289Z" fill={theme.colorOnSurfaceVariant}/>
          <path fillRule="evenodd" clipRule="evenodd" d="M5.6466 13.566C5.37655 14.5663 4.5874 15.3554 3.5871 15.6255V16.8323C4.5874 17.1023 5.37655 17.8915 5.6466 18.8918L6.85339 18.8918C7.12345 17.8915 7.91259 17.1023 8.9129 16.8323V15.6255C7.91259 15.3554 7.12345 14.5663 6.85339 13.566H5.6466ZM6.24999 17.2721C5.96679 16.8657 5.61317 16.5121 5.20671 16.2289C5.61317 15.9457 5.96679 15.592 6.25 15.1856C6.5332 15.592 6.88682 15.9457 7.29328 16.2289C6.88682 16.5121 6.5332 16.8657 6.24999 17.2721Z" fill={theme.colorOnSurfaceVariant}/>
        </svg>
      </AISparkleButton>
    </SearchBar>
  );

  return (
    <BaseSheet
      isOpen={isOpen}
      onClose={onClose}
      title="All shortcuts"
      initialDetent="medium"
      expandOnScroll
      footer={searchFooter}
    >
      <SheetFavoritesWidget>
        <WidgetCard
          title="Favorites"
          meta={<SheetEditLink type="button" onClick={() => {}}>Edit</SheetEditLink>}
          surfaceVariant={theme.colorOnSurfaceVariant}
          outlineVariant={theme.colorOutlineVariant}
        >
          <ShortcutsGrid>
            {favorites.map(a => (
              <ShortcutItem key={a.id}>
                <ShortcutIconCircle>
                  <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={theme.colorOnSurface} />
                </ShortcutIconCircle>
                <ShortcutLabel>{a.label}</ShortcutLabel>
              </ShortcutItem>
            ))}
          </ShortcutsGrid>
        </WidgetCard>
      </SheetFavoritesWidget>
      {groups.map(({ product, actions }) => (
        <ShortcutsSheetGroup key={product}>
          <ShortcutsSheetGroupTitleButton type="button" onClick={() => {}} aria-label={`Go to ${product}`}>
            <ShortcutsSheetGroupTitleText>{product}</ShortcutsSheetGroupTitleText>
            <Icon type={Icon.TYPES.CHEVRON_RIGHT} size={16} color={theme.colorOnSurfaceVariant} />
          </ShortcutsSheetGroupTitleButton>
          <ShortcutsGrid scrollable>
            {actions.map(a => (
              <ShortcutItem key={a.id} $scrollable>
                <ShortcutIconCircle>
                  <Icon type={QUICK_ACTION_ICONS[a.id]} size={20} color={theme.colorOnSurface} />
                </ShortcutIconCircle>
                <ShortcutLabel>{a.label}</ShortcutLabel>
              </ShortcutItem>
            ))}
          </ShortcutsGrid>
        </ShortcutsSheetGroup>
      ))}
    </BaseSheet>
  );
};

export default ShortcutsSheet;
