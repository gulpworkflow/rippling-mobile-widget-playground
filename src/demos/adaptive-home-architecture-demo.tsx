import React, { useState, useMemo } from 'react';
import styled from '@emotion/styled';
import { keyframes } from '@emotion/react';
import { useTheme } from '@rippling/pebble/theme';
import { useNavigate } from 'react-router-dom';
import Button from '@rippling/pebble/Button';
import Avatar from '@rippling/pebble/Avatar';
import { SAMPLE_USERS, type SampleUser } from '@/data-models/sample-users';
import { PERSONA_OPTIONS, PERSONA_DERIVATION, getZoneWidgets } from '@/data-models/personas';
import { getQuickActions } from '@/data-models/quick-actions';
import { enabledAppsToSkuFlags } from '@/widgets/framework/widget-helpers';
import { ALL_APPS } from '@/data-models/apps';
import { widgetIdToTitle } from '@/widgets/framework/widget-helpers';

// --- Color palette (not tied to Pebble — this is a project doc) ---

const COLORS = {
  signal: { bg: '#FFF3E0', border: '#FFB74D', text: '#E65100', chipBg: '#FFE0B2', label: '#BF360C' },
  intent: { bg: '#E3F2FD', border: '#64B5F6', text: '#0D47A1', chipBg: '#BBDEFB', label: '#1565C0' },
  expression: { bg: '#E8F5E9', border: '#81C784', text: '#1B5E20', chipBg: '#C8E6C9', label: '#2E7D32' },
  zone: { primary: '#4CAF50', core: '#66BB6A', contextual: '#81C784', discovery: '#A5D6A7' },
  page: { bg: '#FAFAFA', rail: '#FFFFFF', header: '#FFFFFF' },
  arrow: '#BDBDBD',
  selected: { bg: '#263238', text: '#FFFFFF', meta: '#B0BEC5' },
  unselected: { bg: '#FFFFFF', text: '#212121', meta: '#757575', border: '#E0E0E0', hover: '#F5F5F5' },
};

// --- Animations ---

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(4px); }
  to { opacity: 1; transform: translateY(0); }
`;

// --- Layout ---

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${COLORS.page.bg};
  display: flex;
  flex-direction: column;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
`;

const Header = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 32px;
  background: ${COLORS.page.header};
  border-bottom: 1px solid #E0E0E0;
`;

const Title = styled.h1`
  font-size: 20px;
  font-weight: 700;
  color: #212121;
  margin: 0;
  letter-spacing: -0.01em;
`;

const Main = styled.main`
  display: flex;
  flex: 1;
  overflow: hidden;
`;

// --- Left Rail ---

const LeftRail = styled.aside`
  width: 240px;
  flex-shrink: 0;
  border-right: 1px solid #E0E0E0;
  overflow-y: auto;
  padding: 16px;
  background: ${COLORS.page.rail};
`;

const RailLabel = styled.div`
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #9E9E9E;
  margin-bottom: 12px;
  padding-left: 8px;
`;

const UserCard = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 10px 12px;
  margin-bottom: 6px;
  border: 1px solid ${({ $selected }) => $selected ? COLORS.selected.bg : COLORS.unselected.border};
  border-radius: 8px;
  background: ${({ $selected }) => $selected ? COLORS.selected.bg : COLORS.unselected.bg};
  cursor: pointer;
  text-align: left;
  font-family: inherit;
  transition: all 0.15s ease;

  &:hover {
    background: ${({ $selected }) => $selected ? COLORS.selected.bg : COLORS.unselected.hover};
  }
`;

const UserInfo = styled.div`
  min-width: 0;
  flex: 1;
`;

const UserName = styled.div<{ $selected: boolean }>`
  font-size: 13px;
  font-weight: 600;
  color: ${({ $selected }) => $selected ? COLORS.selected.text : COLORS.unselected.text};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const UserMeta = styled.div<{ $selected: boolean }>`
  font-size: 11px;
  color: ${({ $selected }) => $selected ? COLORS.selected.meta : COLORS.unselected.meta};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  margin-top: 1px;
`;

// --- Center Pane ---

const CenterPane = styled.div`
  flex: 1;
  overflow: auto;
  padding: 32px;
`;

const ColumnHeaders = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px 1fr 40px 1fr;
  gap: 0;
  margin-bottom: 24px;
  align-items: center;
`;

const ColumnHeaderCell = styled.div<{ $color: string }>`
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: ${({ $color }) => $color};
  padding-bottom: 8px;
  border-bottom: 2px solid ${({ $color }) => $color};
`;

const ArrowCell = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding-bottom: 8px;
  color: ${COLORS.arrow};
  font-size: 20px;
`;

const ColumnsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 40px 1fr 40px 1fr;
  gap: 0;
  align-items: start;
  animation: ${fadeIn} 0.25s ease;
`;

const ColumnContent = styled.div<{ $bgColor: string; $borderColor: string }>`
  background: ${({ $bgColor }) => $bgColor};
  border: 1px solid ${({ $borderColor }) => $borderColor};
  border-radius: 12px;
  padding: 20px;
  min-height: 200px;
`;

const ArrowColumn = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
  color: ${COLORS.arrow};
`;

const ArrowSvg = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
    <path d="M5 12H19M19 12L13 6M19 12L13 18" stroke={COLORS.arrow} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

// --- Chips & Groups ---

const GroupLabel = styled.div<{ $color: string }>`
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: ${({ $color }) => $color};
  margin-bottom: 8px;
  margin-top: 16px;

  &:first-of-type {
    margin-top: 0;
  }
`;

const ChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-bottom: 4px;
`;

const Chip = styled.span<{ $bg: string; $color: string; $border?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 1px solid ${({ $border, $bg }) => $border ?? $bg};
  line-height: 1.4;
  animation: ${fadeIn} 0.2s ease;
`;

const PropertyChip = styled.span<{ $bg: string; $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  line-height: 1.3;
`;

const PropertyLabel = styled.span`
  font-weight: 600;
  opacity: 0.7;
`;

const WidgetNumber = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 50%;
  font-size: 10px;
  font-weight: 700;
  background: rgba(0,0,0,0.1);
  flex-shrink: 0;
`;

const ZoneDivider = styled.div`
  height: 1px;
  background: rgba(0,0,0,0.08);
  margin: 8px 0;
`;

const KeyValueBlock = styled.div`
  background: rgba(255,255,255,0.6);
  border: 1px solid rgba(0,0,0,0.06);
  border-radius: 8px;
  padding: 12px;
  margin-top: 8px;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  font-size: 11px;
  line-height: 1.6;
`;

const KeyValueLine = styled.div<{ $color: string }>`
  color: ${({ $color }) => $color};

  strong {
    font-weight: 600;
    opacity: 0.7;
  }
`;

const PersonaBadge = styled.div<{ $bg: string; $color: string; $border: string }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 14px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  font-family: 'SF Mono', 'Fira Code', 'Consolas', monospace;
  background: ${({ $bg }) => $bg};
  color: ${({ $color }) => $color};
  border: 2px solid ${({ $border }) => $border};
`;

const ZONE_LABELS: Record<string, { label: string; color: string }> = {
  primary: { label: 'Primary zone', color: COLORS.zone.primary },
  core: { label: 'Core zone', color: COLORS.zone.core },
  contextual: { label: 'Contextual zone', color: COLORS.zone.contextual },
  discovery: { label: 'Discovery zone', color: COLORS.zone.discovery },
};

const AdaptiveHomeArchitectureDemo: React.FC = () => {
  const { theme } = useTheme();
  const navigate = useNavigate();
  const [selected, setSelected] = useState<SampleUser>(SAMPLE_USERS[0]);

  const enabledSet = useMemo(
    () => new Set(selected.enabledApps ?? []),
    [selected.enabledApps],
  );
  const onboarding = selected.onboarding ?? false;

  const zoneWidgets = useMemo(
    () => getZoneWidgets(selected.persona, onboarding, enabledSet),
    [selected.persona, onboarding, enabledSet],
  );

  const skuFlags = useMemo(() => enabledAppsToSkuFlags(enabledSet), [enabledSet]);

  const quickActions = useMemo(
    () => getQuickActions({ persona: selected.persona, skuFlags, onboarding }),
    [selected.persona, skuFlags, onboarding],
  );

  const derivation = PERSONA_DERIVATION[selected.persona] ?? [];
  const enabledApps = selected.enabledApps ?? [];
  const activeSkuFlags = Object.entries(skuFlags).filter(([, v]) => v).map(([k]) => k);

  const handleViewPrototype = () => {
    const apps = selected.enabledApps ?? [];
    const params = new URLSearchParams({
      persona: selected.persona,
      ...(apps.length > 0 && { apps: apps.join(',') }),
      ...(onboarding && { onboarding: '1' }),
    });
    navigate(`/mobile-home-demo?${params.toString()}`);
  };

  let widgetIndex = 0;

  return (
    <PageContainer>
      <Header>
        <Title>Adaptive Home Architecture</Title>
        <Button
          appearance={Button.APPEARANCES.PRIMARY}
          onClick={handleViewPrototype}
        >
          View prototype →
        </Button>
      </Header>
      <Main>
        <LeftRail>
          <RailLabel>Sample users</RailLabel>
          {SAMPLE_USERS.map(user => {
            const isSelected = selected.id === user.id;
            return (
              <UserCard
                key={user.id}
                $selected={isSelected}
                onClick={() => setSelected(user)}
              >
                <Avatar
                  image={user.avatar}
                  title={user.name}
                  size={Avatar.SIZES.S}
                />
                <UserInfo>
                  <UserName $selected={isSelected}>{user.name}</UserName>
                  <UserMeta $selected={isSelected}>
                    {user.company} · {PERSONA_OPTIONS.find(p => p.id === user.persona)?.label ?? user.persona}
                  </UserMeta>
                </UserInfo>
              </UserCard>
            );
          })}
        </LeftRail>
        <CenterPane>
          <ColumnHeaders>
            <ColumnHeaderCell $color={COLORS.signal.label}>Signals</ColumnHeaderCell>
            <ArrowCell>→</ArrowCell>
            <ColumnHeaderCell $color={COLORS.intent.label}>Intent Resolution</ColumnHeaderCell>
            <ArrowCell>→</ArrowCell>
            <ColumnHeaderCell $color={COLORS.expression.label}>Experience Expression</ColumnHeaderCell>
          </ColumnHeaders>

          <ColumnsGrid key={selected.id}>
            {/* --- SIGNALS --- */}
            <ColumnContent $bgColor={COLORS.signal.bg} $borderColor={COLORS.signal.border}>
              <GroupLabel $color={COLORS.signal.label}>RoleWithCompany</GroupLabel>
              <ChipRow>
                {derivation.map((d, i) => (
                  <PropertyChip key={i} $bg={COLORS.signal.chipBg} $color={COLORS.signal.text}>
                    <PropertyLabel>{d.property}:</PropertyLabel> {d.value}
                  </PropertyChip>
                ))}
              </ChipRow>

              <GroupLabel $color={COLORS.signal.label}>Enabled SKUs</GroupLabel>
              <ChipRow>
                {enabledApps.map(id => {
                  const app = ALL_APPS.find(a => a.id === id);
                  return (
                    <Chip key={id} $bg={COLORS.signal.chipBg} $color={COLORS.signal.text} $border={COLORS.signal.border}>
                      {app?.displayName ?? app?.label ?? id}
                    </Chip>
                  );
                })}
              </ChipRow>

              <GroupLabel $color={COLORS.signal.label}>Lifecycle</GroupLabel>
              <ChipRow>
                <Chip
                  $bg={onboarding ? '#FFF9C4' : COLORS.signal.chipBg}
                  $color={COLORS.signal.text}
                  $border={onboarding ? '#FDD835' : COLORS.signal.border}
                >
                  onboarding: {String(onboarding)}
                </Chip>
              </ChipRow>
            </ColumnContent>

            <ArrowColumn><ArrowSvg /></ArrowColumn>

            {/* --- INTENT RESOLUTION --- */}
            <ColumnContent $bgColor={COLORS.intent.bg} $borderColor={COLORS.intent.border}>
              <GroupLabel $color={COLORS.intent.label}>Resolved persona</GroupLabel>
              <PersonaBadge $bg={COLORS.intent.chipBg} $color={COLORS.intent.text} $border={COLORS.intent.border}>
                {selected.persona}
              </PersonaBadge>

              <GroupLabel $color={COLORS.intent.label}>HomeContext</GroupLabel>
              <KeyValueBlock>
                <KeyValueLine $color={COLORS.intent.text}>
                  <strong>persona:</strong> {selected.persona}
                </KeyValueLine>
                <KeyValueLine $color={COLORS.intent.text}>
                  <strong>onboarding:</strong> {String(onboarding)}
                </KeyValueLine>
                <KeyValueLine $color={COLORS.intent.text}>
                  <strong>skuFlags:</strong>
                </KeyValueLine>
                {activeSkuFlags.map(flag => (
                  <KeyValueLine key={flag} $color={COLORS.intent.text}>
                    &nbsp;&nbsp;{flag}: <span style={{ color: '#1B5E20', fontWeight: 600 }}>true</span>
                  </KeyValueLine>
                ))}
              </KeyValueBlock>
            </ColumnContent>

            <ArrowColumn><ArrowSvg /></ArrowColumn>

            {/* --- EXPERIENCE EXPRESSION --- */}
            <ColumnContent $bgColor={COLORS.expression.bg} $borderColor={COLORS.expression.border}>
              {(['primary', 'core', 'contextual', 'discovery'] as const).map(zone => {
                const widgets = zoneWidgets[zone];
                if (!widgets || widgets.length === 0) return null;
                const { label, color } = ZONE_LABELS[zone];
                return (
                  <React.Fragment key={zone}>
                    <GroupLabel $color={color}>{label}</GroupLabel>
                    <ChipRow>
                      {widgets.map(id => {
                        widgetIndex++;
                        return (
                          <Chip key={id} $bg={COLORS.expression.chipBg} $color={COLORS.expression.text} $border={COLORS.expression.border}>
                            <WidgetNumber>{widgetIndex}</WidgetNumber>
                            {widgetIdToTitle(id, selected.persona)}
                          </Chip>
                        );
                      })}
                    </ChipRow>
                    <ZoneDivider />
                  </React.Fragment>
                );
              })}

              <GroupLabel $color={COLORS.expression.label}>Quick actions</GroupLabel>
              <ChipRow>
                {quickActions.actions.map(a => (
                  <Chip key={a.id} $bg="#FFFFFF" $color={COLORS.expression.text} $border={COLORS.expression.border}>
                    {a.label}
                  </Chip>
                ))}
              </ChipRow>
            </ColumnContent>
          </ColumnsGrid>
        </CenterPane>
      </Main>
    </PageContainer>
  );
};

export default AdaptiveHomeArchitectureDemo;
