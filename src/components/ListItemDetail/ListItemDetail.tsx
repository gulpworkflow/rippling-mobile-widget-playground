import React from 'react';
import styled from '@emotion/styled';
import Checkbox from '@rippling/pebble/Inputs/Checkbox';
import Label from '@rippling/pebble/Label';

// ─── Types ───────────────────────────────────────────────────────────────

export type ListItemPrefixType = 'avatar' | 'icon' | 'checkbox';

export interface ListItemPrefix {
  type: ListItemPrefixType;
  /** Avatar: image URL. Icon: Pebble Icon.TYPES constant. Checkbox: ignored. */
  value?: string;
  /** Background color for icon circle prefix */
  iconBg?: string;
  /** Icon color override (defaults to white for icon prefix) */
  iconColor?: string;
  /** Checkbox checked state */
  checked?: boolean;
  /** Checkbox onChange handler */
  onCheckChange?: (checked: boolean) => void;
}

export interface ListItemLabel {
  text: string;
  /** Pebble Label appearance: 'error' | 'warning' | 'success' | 'neutral' | 'primary' | 'tertiary'. Defaults to 'neutral'. */
  appearance?: 'error' | 'warning' | 'success' | 'neutral' | 'primary' | 'tertiary';
}

export interface ListItemSuffix {
  type: 'text' | 'icon' | 'avatar' | 'label';
  value?: string;
  color?: string;
}

export interface ListItemDetailProps {
  /** Primary item name (mandatory, bold) */
  name: string;
  /** Secondary description text (truncated) */
  subtext?: string;
  /** Colored label/badge below subtext */
  label?: ListItemLabel;
  /** Category/source text shown bottom-left */
  category?: string;
  /** Timestamp — rendered via formatTimestamp or as raw string */
  timestamp?: Date | string;
  /** Left-side prefix element */
  prefix?: ListItemPrefix;
  /** Right-side suffix element */
  suffix?: ListItemSuffix;
  /** Tap handler for the entire row */
  onClick?: () => void;
  /** If true, show bottom divider (default true) */
  showDivider?: boolean;
  /** If true, use compact spacing (for widget embedding) */
  compact?: boolean;
}

export interface ListItemDetailListProps {
  items: ListItemDetailProps[];
  /** Maximum items to display (default 5) */
  maxItems?: number;
  /** If true, show "View all" footer with count */
  showViewAll?: boolean;
  totalCount?: number;
  onViewAll?: () => void;
}

// ─── Time Formatting ─────────────────────────────────────────────────────

function formatTimestamp(ts: Date | string): string {
  if (typeof ts === 'string') return ts;
  const now = new Date();
  const diff = now.getTime() - ts.getTime();
  const mins = Math.floor(diff / 60000);
  const hrs = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m`;
  if (hrs < 24) return `${hrs}h`;
  if (days < 7) return `${days}d`;
  return ts.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
}

// ─── Styled Components ───────────────────────────────────────────────────

const Row = styled.button<{ $compact?: boolean }>`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: ${({ $compact }) => ($compact ? '10px 0' : '12px 0')};
  background: none;
  border: none;
  width: 100%;
  text-align: left;
  cursor: pointer;
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;

  &:active {
    opacity: 0.7;
  }
`;

const Divider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant || 'rgba(0, 0, 0, 0.08)'};
  margin-left: 52px;
`;

type StyledTheme = Record<string, string>;

const PrefixSlot = styled.div`
  flex-shrink: 0;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AvatarImg = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
`;

const IconCircle = styled.div<{ $bg?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ $bg }) => $bg || 'rgba(0, 0, 0, 0.08)'};
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CheckboxWrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const CenterContent = styled.div`
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const ItemName = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMediumEmphasized};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface || '#1a1a1a'};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Subtext = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.55)'};
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 80ch;
`;

const LabelWrap = styled.div`
  align-self: flex-start;
  margin-top: 2px;
`;

const MetaRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 6px;
`;

const Category = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  white-space: nowrap;
`;

const Timestamp = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
  white-space: nowrap;
  margin-left: auto;
`;

const SuffixSlot = styled.div`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  padding-top: 2px;
`;

const SuffixText = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant || 'rgba(0, 0, 0, 0.45)'};
`;

// ─── List Container ──────────────────────────────────────────────────────

const ListContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ViewAllButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: ${({ theme }) => (theme as StyledTheme).colorPrimary || '#6750A4'};
  font-family: 'Basel Grotesk', -apple-system, BlinkMacSystemFont, sans-serif;

  &:active {
    opacity: 0.7;
  }
`;

// ─── Prefix Renderer ─────────────────────────────────────────────────────

const PrefixRenderer: React.FC<{ prefix: ListItemPrefix; iconRender?: (type: string, size: number, color: string) => React.ReactNode }> = ({ prefix, iconRender }) => {
  if (prefix.type === 'avatar') {
    return (
      <PrefixSlot>
        <AvatarImg src={prefix.value} alt="" />
      </PrefixSlot>
    );
  }
  if (prefix.type === 'icon' && iconRender && prefix.value) {
    return (
      <PrefixSlot>
        <IconCircle $bg={prefix.iconBg}>
          {iconRender(prefix.value, 20, prefix.iconColor || '#fff')}
        </IconCircle>
      </PrefixSlot>
    );
  }
  if (prefix.type === 'checkbox') {
    return (
      <PrefixSlot>
        <CheckboxWrap onClick={(e) => e.stopPropagation()}>
          <Checkbox
            value={prefix.checked ?? false}
            onChange={() => prefix.onCheckChange?.(!prefix.checked)}
          />
        </CheckboxWrap>
      </PrefixSlot>
    );
  }
  return null;
};

// ─── ListItemDetail Component ────────────────────────────────────────────

export const ListItemDetail: React.FC<ListItemDetailProps & {
  iconRender?: (type: string, size: number, color: string) => React.ReactNode;
}> = ({
  name,
  subtext,
  label,
  category,
  timestamp,
  prefix,
  suffix,
  onClick,
  showDivider = true,
  compact,
  iconRender,
}) => {
  return (
    <>
      <Row $compact={compact} onClick={onClick} type="button">
        {prefix && <PrefixRenderer prefix={prefix} iconRender={iconRender} />}
        <CenterContent>
          <ItemName>{name}</ItemName>
          {subtext && <Subtext>{subtext}</Subtext>}
          {label && (
            <LabelWrap>
              <Label
                size={Label.SIZES.S}
                appearance={
                  label.appearance === 'error' ? Label.APPEARANCES.ERROR
                  : label.appearance === 'warning' ? Label.APPEARANCES.WARNING
                  : label.appearance === 'success' ? Label.APPEARANCES.SUCCESS
                  : label.appearance === 'primary' ? Label.APPEARANCES.PRIMARY_LIGHT
                  : label.appearance === 'tertiary' ? Label.APPEARANCES.TERTIARY
                  : Label.APPEARANCES.NEUTRAL
                }
              >
                {label.text}
              </Label>
            </LabelWrap>
          )}
          {(category || timestamp) && (
            <MetaRow>
              {category && <Category>{category}</Category>}
              {timestamp && <Timestamp>{formatTimestamp(timestamp)}</Timestamp>}
            </MetaRow>
          )}
        </CenterContent>
        {suffix && (
          <SuffixSlot>
            {suffix.type === 'text' && <SuffixText>{suffix.value}</SuffixText>}
          </SuffixSlot>
        )}
      </Row>
      {showDivider && <Divider />}
    </>
  );
};

// ─── ListItemDetailList Component ────────────────────────────────────────

export const ListItemDetailList: React.FC<ListItemDetailListProps & {
  iconRender?: (type: string, size: number, color: string) => React.ReactNode;
}> = ({
  items,
  maxItems = 5,
  showViewAll,
  totalCount,
  onViewAll,
  iconRender,
}) => {
  const visible = items.slice(0, maxItems);
  return (
    <ListContainer>
      {visible.map((item, i) => (
        <ListItemDetail
          key={i}
          {...item}
          showDivider={i < visible.length - 1}
          iconRender={iconRender}
        />
      ))}
      {showViewAll && (
        <ViewAllButton onClick={onViewAll}>
          View all{totalCount != null ? ` (${totalCount})` : ''}
        </ViewAllButton>
      )}
    </ListContainer>
  );
};

export default ListItemDetail;
