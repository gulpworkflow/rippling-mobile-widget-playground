import React, { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react';
import styled from '@emotion/styled';
import Notice from '@rippling/pebble/Notice';
import Button from '@rippling/pebble/Button';
import Icon from '@rippling/pebble/Icon';
import Status from '@rippling/pebble/Status';
import { useTheme } from '@rippling/pebble/theme';
import { StyledTheme } from '@/utils/theme';
import adDataCloudImg from '@/assets/ad-data-cloud.png';

/**
 * NoticeStackDemo
 *
 * Prototype of the intent-based banner framework on Home. Separates
 * "system / workflow" messages (notices + tasks) from "growth / discovery"
 * messages (ads, campaigns) and enforces a clear priority:
 *
 *  - System and Growth are mutually exclusive on Home at any moment.
 *  - Within System: Critical (Tier 1) pre-empts Actionable (Tier 2).
 *  - Growth is a single-slot ad. It only renders when System is empty.
 *
 * The stacking math for Actionable is ported from Pebble's Snackbar stack
 * (peek/scale/hover-expand) but renders in document flow so CTAs and a11y
 * semantics are preserved.
 *
 * NOTE: The greeting/HomePrompt/Recents+Tasks/AdBanner visuals are inlined
 * copies from `desktop-home-4-22-shippable.tsx` — simplified where the
 * fidelity isn't essential to this demo's story (no @mention dropdown,
 * no FLIP animation on recents dismiss). If both surfaces stay around,
 * extracting these to a shared module is a reasonable follow-up.
 */

type Severity = 'critical' | 'actionable';

interface DemoNotice {
  id: string;
  severity: Severity;
  title: string;
  description: string;
  primaryLabel?: string;
}

// ─── Sample notices per tier ────────────────────────────────────────────────

const CRITICAL_NOTICES: DemoNotice[] = [
  {
    id: 'crit-1',
    severity: 'critical',
    title: '[Action Required] — Submit updated banking information',
    description:
      'Your recurring bank information request is past due. To ensure there is no disruption to your credit line, please upload your recent bank statements for all material cash and operating accounts. Failure to submit updated information will result in a reduced credit limit until the required information is provided.',
    primaryLabel: 'Submit now',
  },
];

// Realistic, variable-length pool modeled on production Rippling notices.
// Deliberately mixes long (3–5 lines), medium (2 lines) and short (1 line)
// descriptions so the stacking math has to handle real content variability.
const ACTIONABLE_POOL: DemoNotice[] = [
  {
    id: 'act-1',
    severity: 'actionable',
    title: 'Submit updated bank information',
    description:
      "We are requesting information for a credit review related to your Rippling account(s). Submit your most recent 3 months' bank statements for all cash accounts or connect your accounts via Plaid. To avoid any disruption to your account, complete this request as soon as possible.",
    primaryLabel: 'Submit now',
  },
  {
    id: 'act-2',
    severity: 'actionable',
    title: 'Submit updated banking information',
    description:
      "Due to a recent payment failure on your Rippling account, additional financial information is required to ensure adequate funds and avoid future payment issues. Upload your most recent 3 months' of cash and operating bank account statements or connect your accounts to Plaid as soon as possible.",
    primaryLabel: 'Submit now',
  },
  {
    id: 'act-3',
    severity: 'actionable',
    title: 'Complete HIPAA training',
    description: 'Due by Friday. Estimated 12 minutes.',
    primaryLabel: 'Start training',
  },
  {
    id: 'act-4',
    severity: 'actionable',
    title: 'Enroll in 2026 benefits',
    description:
      'Open enrollment closes in 5 days. Your current elections will carry over if no action is taken, but you may be missing savings on newly added plans.',
    primaryLabel: 'Enroll',
  },
];

// ─── Recents + Tasks sample data (ported from shippable) ───────────────────

const RECENT_ITEMS = [
  { icon: Icon.TYPES.CREDIT_CARD_OUTLINE, name: 'Bills', context: 'Finance' },
  { icon: Icon.TYPES.HEART_OUTLINE, name: 'COBRA', context: 'Benefits' },
  { icon: Icon.TYPES.DOLLAR_CIRCLE_OUTLINE, name: 'Payroll overview', context: '' },
];

const TODO_ITEMS = [
  { icon: Icon.TYPES.WARNING_TRIANGLE_OUTLINE, label: 'Overdue', count: '2 items' },
  { icon: Icon.TYPES.CALENDAR_OUTLINE, label: 'Due within 7 days', count: '1 item' },
  { icon: Icon.TYPES.TASKS_OUTLINE, label: 'New', count: '12 unread' },
];

// ─── Layout ─────────────────────────────────────────────────────────────────

const PageShell = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => (theme as StyledTheme).colorSurface};
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${({ theme }) => (theme as StyledTheme).space1000}
    ${({ theme }) => (theme as StyledTheme).space600}
    ${({ theme }) => (theme as StyledTheme).space1600};
`;

const ContentCol = styled.div`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 744px;
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const SystemZone = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

// ─── Greeting + HomePrompt (ported) ────────────────────────────────────────

const GreetingRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  margin-top: ${({ theme }) => (theme as StyledTheme).space1200};
`;

const PromptHeading = styled.h1`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-align: center;
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const PromptWrap = styled.div`
  position: relative;
  width: 100%;
  box-sizing: border-box;
`;

const PromptCard = styled.div`
  width: 100%;
  height: 120px;
  background-color: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  box-shadow: rgba(0, 0, 0, 0.05) 0px 1px 1px 0px;
  padding: 20px 12px 12px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  cursor: text;
  box-sizing: border-box;
  outline: none;
  transition: border-color 0.2s ease;

  &:focus-within {
    border-color: rgba(0, 0, 0, 0.2);
  }
`;

const PromptInputRow = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  width: 100%;
`;

const PromptInput = styled.textarea`
  flex: 1;
  background: transparent;
  border: none;
  resize: none;
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  min-height: 20px;
  padding: 0;
  margin: 0;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  }

  caret-color: ${({ theme }) => (theme as StyledTheme).colorPrimary};

  &:focus {
    outline: none;
  }
`;

const PromptActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
`;

const PromptActionsRight = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

/**
 * Slimmed-down port of the shippable demo's HomePrompt. Same visual shell
 * (PromptCard + textarea + Pro button + submit) but drops the @mention
 * dropdown — not essential to this demo's banner-framework story.
 */
const HomePromptLite: React.FC = React.memo(() => {
  const promptRef = useRef<HTMLTextAreaElement>(null);
  const [value, setValue] = useState('');
  return (
    <PromptWrap>
      <PromptCard onClick={() => promptRef.current?.focus()}>
        <PromptInputRow>
          <PromptInput
            ref={promptRef}
            placeholder="Ask, make, or search anything..."
            rows={1}
            value={value}
            onChange={(e) => setValue(e.target.value)}
          />
        </PromptInputRow>
        <PromptActions>
          <Button
            appearance={Button.APPEARANCES.OUTLINE}
            size={Button.SIZES.S}
            onClick={(e: React.MouseEvent) => e.stopPropagation()}
          >
            Pro
            <Icon type={Icon.TYPES.CHEVRON_DOWN} size={14} color="currentColor" />
          </Button>
          <PromptActionsRight>
            <Button.Icon
              icon={Icon.TYPES.ARROW_UP}
              aria-label="Submit"
              appearance={Button.APPEARANCES.PRIMARY}
              size={Button.SIZES.S}
              isDisabled={!value.trim()}
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            />
          </PromptActionsRight>
        </PromptActions>
      </PromptCard>
    </PromptWrap>
  );
});
HomePromptLite.displayName = 'HomePromptLite';

// ─── Shortcuts (Recents + Your tasks, ported) ──────────────────────────────

const ShortcutsSection = styled.div`
  width: 100%;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => (theme as StyledTheme).space2400};

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => (theme as StyledTheme).space400};
  }
`;

const ShortcutsColumn = styled.div`
  display: flex;
  flex-direction: column;
`;

const ShortcutsColumnHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-left: -16px;
`;

const ShortcutsColumnRow = styled.a`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: ${({ theme }) => (theme as StyledTheme).space150};
  margin: 0 -${({ theme }) => (theme as StyledTheme).space150};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  text-decoration: none;
  color: inherit;
  cursor: pointer;
  transition: background 0.15s ease;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

const ShortcutsRowLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  flex: 1;
  min-width: 0;
`;

const ShortcutsRowMeta = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  white-space: nowrap;
`;

const ShortcutsRowDismiss = styled.span`
  opacity: 0;
  transition: opacity 0.15s ease;
  flex-shrink: 0;

  ${ShortcutsColumnRow}:hover & {
    opacity: 1;
  }
`;

const ShortcutsRowContext = styled.span`
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const ShortcutsEmptyLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
`;

// ─── Ad Banner (Growth zone — ported) ──────────────────────────────────────

const AdBanner = styled.div`
  width: 100%;
  box-sizing: border-box;
`;

const AdBannerCard = styled.div`
  display: flex;
  align-items: stretch;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceInverse};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  overflow: hidden;
  position: relative;
`;

const AdBannerImage = styled.div`
  width: 200px;
  min-height: 120px;
  flex-shrink: 0;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const AdBannerBody = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space400}
    ${({ theme }) => (theme as StyledTheme).space600};
`;

const AdBannerEyebrow = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const AdBannerTitle = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceInverse};
  margin: 0;
`;

const AdBannerDesc = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceInverse};
  opacity: 0.7;
  margin: 0;
  max-width: 520px;
`;

const AdBannerActions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  margin-top: ${({ theme }) => (theme as StyledTheme).space100};
`;

const AdBannerCTA = styled.button`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  background: #F5A623;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  padding: ${({ theme }) => (theme as StyledTheme).space200}
    ${({ theme }) => (theme as StyledTheme).space400};
  cursor: pointer;
  transition: opacity 0.15s ease;

  &:hover {
    opacity: 0.9;
  }
`;

const AdBannerLink = styled.button`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  background: none;
  border: none;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceInverse};
  cursor: pointer;
  padding: 0;

  &:hover {
    text-decoration: underline;
  }
`;

const AdBannerDismiss = styled.button`
  position: absolute;
  top: ${({ theme }) => (theme as StyledTheme).space300};
  right: ${({ theme }) => (theme as StyledTheme).space300};
  width: 28px;
  height: 28px;
  border: none;
  background: none;
  cursor: pointer;
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceInverse};
  opacity: 0.7;
  display: grid;
  place-items: center;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  transition: background 0.1s, opacity 0.1s;

  &:hover {
    opacity: 1;
    background: rgba(255, 255, 255, 0.1);
  }
`;

// ─── Stack ─────────────────────────────────────────────────────────────────

const STACK_GUTTER = 12;    // px, gap between cards when expanded
// VISIBLE_PEEK is intentionally sized to match the Pebble Notice border
// radius (shapeCorner3xl = 16px). Matching these two values means the
// shell's bottom-corner curve fits exactly within the visible peek strip,
// so each layer reads as a naturally rounded card-bottom rather than a
// squashed partial arc or a flat rectangle.
const VISIBLE_PEEK = 16;
const SCALE_STEP = 0.035;   // per-depth horizontal scale reduction
const MIN_SCALE = 0.9;
const MAX_VISIBLE_PEEK = 2; // cards peeking behind front when collapsed
                             // (front + 2 = 3 total visual layers)
const STACK_THRESHOLD = 1;  // stacking only kicks in above this count

/**
 * Border wrapper applied to the Pebble Notice root (which is always the first
 * and only child of this wrapper). Pebble's Notice has a `shapeCorner3xl`
 * (16px) radius and an outline, but no perimeter border. When notices stack,
 * their tinted backgrounds blend together visually — a subtle border separates
 * each card so the depth reads clearly.
 *
 * Applied uniformly to every notice in the demo (solo, front-of-stack, peek)
 * so stacked + unstacked notices have consistent chrome.
 */
const BorderedNotice = styled.div<{ $hidden?: boolean }>`
  & > div {
    border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.04);
  }
  /* When we've lifted the wrap's overflow clip so the shell's shadow can
     extend, we need another way to keep the real notice's content from
     showing around the shell. visibility:hidden hides the subtree but
     preserves its layout box for measurement. */
  ${({ $hidden }) => ($hidden ? 'visibility: hidden;' : '')}
`;

/**
 * Synthetic "stack edge" rendered on top of behind cards while collapsed.
 * It's a dumb tinted rectangle (no text, no icons, no buttons) that exactly
 * replicates the Notice's chrome: matching severity background, matching
 * border and radius. Only its bottom ~16px is visually uncovered by the front
 * card, so users see a clean colored edge — never fragments of real content.
 *
 * On expand, this fades to 0 opacity and the real Notice underneath becomes
 * visible, so screen reader users + keyboard users never interact with an
 * empty shell.
 */
const StackShellCard = styled.div<{
  $severity: Severity;
  $visible: boolean;
}>`
  position: absolute;
  inset: 0;
  z-index: 1;
  pointer-events: none;
  background: ${({ theme, $severity }) => {
    const t = theme as StyledTheme;
    switch ($severity) {
      case 'critical':
        return t.colorErrorContainer;
      case 'actionable':
      default:
        return t.colorWarningContainer;
    }
  }};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner3xl};
  /* Directional drop shadow so each layer casts onto what's behind it.
     This is what makes the rounded bottom-corner curves visible even when
     the next layer is a similar tint — the curve's edge catches the shadow
     and reads crisply. Without this, middle layers sandwich between similar
     colors and their curves fade into the background. */
  box-shadow: 0 4px 6px -2px rgba(0, 0, 0, 0.08),
    0 1px 2px rgba(0, 0, 0, 0.04);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  transition: opacity 180ms ease;
`;

const StackShell = styled.div<{ $expandedHeight: number; $collapsedHeight: number; $isExpanded: boolean }>`
  position: relative;
  width: 100%;
  height: ${({ $isExpanded, $expandedHeight, $collapsedHeight }) =>
    $isExpanded ? $expandedHeight : $collapsedHeight}px;
  transition: height 260ms cubic-bezier(0.2, 0.8, 0.2, 1);
`;

const StackCardWrap = styled.div<{
  $translateY: number;
  $scale: number;
  $zIndex: number;
  $isBehind: boolean;
  $isExpanded: boolean;
  $clipHeight: number | null;
}>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  transform-origin: top center;
  transform: translateY(${({ $translateY }) => $translateY}px)
    scale(${({ $scale }) => $scale});
  z-index: ${({ $zIndex }) => $zIndex};
  opacity: ${({ $isBehind, $isExpanded }) => ($isBehind && !$isExpanded ? 0.9 : 1)};
  transition:
    transform 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    height 260ms cubic-bezier(0.2, 0.8, 0.2, 1),
    opacity 180ms ease;

  /* Collapsed behind cards: pin to the front card's height exactly.
     Note: we deliberately do NOT set overflow: hidden here — the shell's
     drop shadow needs to be able to extend outside the wrap so it casts
     onto the layer behind. The inner BorderedNotice gets visibility:hidden
     in this state (via $hidden on it) to keep its content from
     showing through around the shell. */
  ${({ $clipHeight }) =>
    $clipHeight != null
      ? `
      height: ${$clipHeight}px;
    `
      : ''}

  /* Collapsed behind cards: hide from pointer input too */
  ${({ $isBehind, $isExpanded }) =>
    $isBehind && !$isExpanded ? 'pointer-events: none;' : ''}
`;

const StackCountPill = styled.button<{ $visible: boolean }>`
  position: absolute;
  top: -${({ theme }) => (theme as StyledTheme).space300};
  right: ${({ theme }) => (theme as StyledTheme).space400};
  z-index: 100;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
  padding: ${({ theme }) => (theme as StyledTheme).space100}
    ${({ theme }) => (theme as StyledTheme).space300};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceInverse ?? '#1C1C1E'};
  color: ${({ theme }) => (theme as StyledTheme).colorOnPrimary ?? '#fff'};
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  opacity: ${({ $visible }) => ($visible ? 1 : 0)};
  pointer-events: ${({ $visible }) => ($visible ? 'auto' : 'none')};
  transition: opacity 180ms ease;
`;

interface NoticeStackProps {
  notices: DemoNotice[];
  onDismiss?: (id: string) => void;
  ariaLabel: string;
}

/**
 * NoticeStack
 *
 * Ports the peek/scale/hover-expand math from Pebble's SnackbarContainer,
 * but renders in document flow and uses real Notice.Warning / Notice.Error
 * children so CTAs and a11y semantics are preserved.
 *
 * Key differences from Pebble's Snackbar stack:
 *  - No portal, no global store — pure props.
 *  - Expand is triggered by pointerenter *or* focus-within (keyboard-friendly).
 *  - Collapsed back-cards get pointer-events: none and inert, so their
 *    primary buttons aren't tab targets while hidden.
 *  - A visible "+N more" count pill is the affordance that something is
 *    stacked, rather than relying solely on the scaled-edge visual.
 */
const NoticeStack: React.FC<NoticeStackProps> = ({ notices, onDismiss, ariaLabel }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({});

  // Measure each notice's natural rendered height once per `notices` change.
  // We measure the INNER child (the BorderedNotice wrapping the Pebble
  // Notice) rather than the StackCardWrap, because the wrap gets a fixed
  // `height` when behind + collapsed — measuring the wrap would report that
  // clipped value and corrupt the expanded-layout math. The inner child is
  // unconstrained and always reflects the notice's true natural height.
  useLayoutEffect(() => {
    const next: Record<string, number> = {};
    let changed = false;
    const prevKeys = Object.keys(heights);
    notices.forEach((n) => {
      const outer = cardRefs.current[n.id];
      const inner = outer?.firstElementChild as HTMLElement | null;
      if (inner) {
        const h = inner.offsetHeight;
        next[n.id] = h;
        if (heights[n.id] !== h) changed = true;
      }
    });
    if (changed || prevKeys.length !== Object.keys(next).length) {
      setHeights(next);
    }
    // `heights` intentionally omitted from deps — we only want to re-measure
    // when the set of notices changes, not when our own state update fires.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [notices]);

  const frontHeight = notices[0] ? heights[notices[0].id] ?? 0 : 0;

  const expandedHeight = useMemo(
    () =>
      notices.reduce(
        (acc, n, i) => acc + (heights[n.id] ?? 0) + (i > 0 ? STACK_GUTTER : 0),
        0,
      ),
    [notices, heights],
  );

  const collapsedHeight = useMemo(() => {
    if (notices.length <= 1) return frontHeight;
    // Front card + visible peek strip for each back card up to MAX_VISIBLE_PEEK
    const peek = Math.min(notices.length - 1, MAX_VISIBLE_PEEK) * VISIBLE_PEEK;
    return frontHeight + peek;
  }, [frontHeight, notices.length]);

  const handleFocus = useCallback(() => setIsExpanded(true), []);
  const handleBlur = useCallback((e: React.FocusEvent<HTMLDivElement>) => {
    // Only collapse when focus leaves the stack entirely
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setIsExpanded(false);
    }
  }, []);

  if (notices.length === 0) return null;

  // Single notice → no stacking behavior, just render it
  if (notices.length <= STACK_THRESHOLD) {
    return (
      <BorderedNotice>
        <NoticeRenderer
          notice={notices[0]}
          onClose={onDismiss ? () => onDismiss(notices[0].id) : undefined}
        />
      </BorderedNotice>
    );
  }

  return (
    <StackShell
      $expandedHeight={expandedHeight}
      $collapsedHeight={collapsedHeight}
      $isExpanded={isExpanded}
      onPointerEnter={() => setIsExpanded(true)}
      onPointerLeave={() => setIsExpanded(false)}
      onFocus={handleFocus}
      onBlur={handleBlur}
      role="region"
      aria-label={ariaLabel}
    >
      <StackCountPill
        $visible={!isExpanded && notices.length > 1}
        onClick={() => setIsExpanded(true)}
        aria-label={`Expand ${notices.length - 1} more notices`}
      >
        +{notices.length - 1} more
      </StackCountPill>

      {notices.map((notice, i) => {
        const isBehind = i > 0;
        let translateY = 0;
        let scale = 1;
        const zIndex = notices.length - i;
        // Depth drives scale + offset (clamped so everything past
        // MAX_VISIBLE_PEEK overlaps at the deepest layer in collapsed state).
        const depth = Math.min(i, MAX_VISIBLE_PEEK);

        if (!isExpanded) {
          // Collapsed: scale from top-center inset the card horizontally;
          // the extended-shell + wrap overflow:hidden trick means we only see
          // straight vertical side walls in the visible peek, so the scale
          // inset reads as a clean stepped affordance without corner artifacts.
          // translateY compensates for scale so the scaled bottom still
          // lands exactly `depth * VISIBLE_PEEK` below the front card bottom:
          //   scaledBottom = translateY + frontHeight * scale
          //   target       = frontHeight + depth * VISIBLE_PEEK
          //   ⇒ translateY = frontHeight * (1 - scale) + depth * VISIBLE_PEEK
          scale = Math.max(MIN_SCALE, 1 - depth * SCALE_STEP);
          translateY = frontHeight * (1 - scale) + depth * VISIBLE_PEEK;
        } else {
          // Expanded: lay out cards vertically with measured gutters
          translateY = notices
            .slice(0, i)
            .reduce((acc, n) => acc + (heights[n.id] ?? 0) + STACK_GUTTER, 0);
          scale = 1;
        }

        const collapsedAndBehind = isBehind && !isExpanded;
        // Clip back cards to the front card's height when collapsed so
        // taller notices (more description, wider buttons) don't spill their
        // bottoms out past the front card. Null = no clip (expanded or front).
        const clipHeight = collapsedAndBehind && frontHeight > 0 ? frontHeight : null;

        return (
          <StackCardWrap
            key={notice.id}
            ref={(el) => {
              cardRefs.current[notice.id] = el;
            }}
            $translateY={translateY}
            $scale={scale}
            $zIndex={zIndex}
            $isBehind={isBehind}
            $isExpanded={isExpanded}
            $clipHeight={clipHeight}
            aria-hidden={collapsedAndBehind || undefined}
            // Only spread `inert` when actually inert — spreading undefined
            // can cause React to render inert="" anyway with some versions.
            {...(collapsedAndBehind ? ({ inert: '' } as Record<string, string>) : {})}
          >
            <BorderedNotice $hidden={collapsedAndBehind}>
              <NoticeRenderer
                notice={notice}
                onClose={onDismiss ? () => onDismiss(notice.id) : undefined}
              />
            </BorderedNotice>
            {/* Shell paints over behind cards while collapsed, giving the
                stack a clean abstract "N layers" look independent of the
                real notice's content. Only rendered for back cards — the
                front card always shows real content. */}
            {isBehind && (
              <StackShellCard
                $severity={notice.severity}
                $visible={!isExpanded}
                aria-hidden
              />
            )}
          </StackCardWrap>
        );
      })}
    </StackShell>
  );
};

// ─── Notice renderer (maps severity → Pebble Notice variant) ───────────────

const NoticeRenderer: React.FC<{ notice: DemoNotice; onClose?: () => void }> = ({
  notice,
  onClose,
}) => {
  const commonProps = {
    title: notice.title,
    description: notice.description,
    primaryAction: notice.primaryLabel
      ? { title: notice.primaryLabel, onClick: () => {} }
      : undefined,
    isCloseable: Boolean(onClose),
    onClose: onClose ? () => onClose() : undefined,
  };

  switch (notice.severity) {
    case 'critical':
      return <Notice.Error {...commonProps} />;
    case 'actionable':
    default:
      return <Notice.Warning {...commonProps} />;
  }
};

// ─── HUD ───────────────────────────────────────────────────────────────────

const HudToggleButton = styled.button`
  position: fixed;
  top: ${({ theme }) => (theme as StyledTheme).space400};
  right: ${({ theme }) => (theme as StyledTheme).space400};
  z-index: 300;
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding: ${({ theme }) => (theme as StyledTheme).space200}
    ${({ theme }) => (theme as StyledTheme).space400};
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
`;

const Hud = styled.div<{ $visible: boolean }>`
  position: fixed;
  top: ${({ theme }) => (theme as StyledTheme).space1600};
  right: ${({ theme }) => (theme as StyledTheme).space400};
  z-index: 200;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceBright};
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCorner2xl};
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  padding: ${({ theme }) => (theme as StyledTheme).space400};
  width: 300px;
  display: ${({ $visible }) => ($visible ? 'flex' : 'none')};
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space300};
  max-height: calc(100vh - ${({ theme }) => (theme as StyledTheme).space2400});
  overflow-y: auto;
`;

const HudSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const HudLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HudSegmented = styled.div`
  display: flex;
  background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerLg};
  padding: 2px;
  gap: 2px;
`;

const HudSegment = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: ${({ theme }) => (theme as StyledTheme).space200} 0;
  background: ${({ $active, theme }) =>
    $active ? (theme as StyledTheme).colorSurfaceBright : 'transparent'};
  color: ${({ $active, theme }) =>
    $active
      ? (theme as StyledTheme).colorOnSurface
      : (theme as StyledTheme).colorOnSurfaceVariant};
  border: none;
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  cursor: pointer;
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  box-shadow: ${({ $active }) =>
    $active ? '0 1px 2px rgba(0,0,0,0.08)' : 'none'};
`;

const HudDivider = styled.div`
  height: 1px;
  background: ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
`;

// Muted footer indicator. The zone indicator is intentionally de-emphasized
// now — the primary mental model is the two big layer toggles; what's
// currently showing is a derived status, not a control.
const HudFooterLabel = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const HudFooterValue = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

// Container for nested sub-controls (tier/count under System). When the
// parent layer is off, the group fades and becomes non-interactive so it
// reads as "these only matter when the layer is on" without shifting the
// layout of the HUD.
const HudSubGroup = styled.div<{ $disabled: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  padding-left: ${({ theme }) => (theme as StyledTheme).space300};
  border-left: 2px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  opacity: ${({ $disabled }) => ($disabled ? 0.4 : 1)};
  pointer-events: ${({ $disabled }) => ($disabled ? 'none' : 'auto')};
  transition: opacity 120ms ease;
`;

const HudLayerTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const HudLayerName = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
`;

const HudLayerPosition = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
`;

const HudResetButton = styled.button`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelMedium};
  padding: ${({ theme }) => (theme as StyledTheme).space200}
    ${({ theme }) => (theme as StyledTheme).space300};
  background: transparent;
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerMd};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => (theme as StyledTheme).colorSurfaceContainerLow};
  }
`;

// ─── Rules documentation block ─────────────────────────────────────────────
//
// Visual treatment: no card chrome. A single full-width hairline sets the
// block apart from the interactive content above, and everything renders
// in `colorOnSurfaceVariant` by default so it reads as "meta commentary"
// rather than another feature on the page.

const RulesBlock = styled.section`
  width: 100%;
  max-width: 744px;
  margin-top: ${({ theme }) => (theme as StyledTheme).space1600};
  padding-top: ${({ theme }) => (theme as StyledTheme).space800};
  border-top: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space600};
`;

const RulesHeader = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const RulesEyebrow = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.8px;
`;

const RulesTitle = styled.h2`
  ${({ theme }) => (theme as StyledTheme).typestyleV2TitleSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const RulesSubtitle = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.5;
`;

// ── Container definitions (System / Growth) ─────────────────────────────────

const ContainerGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => (theme as StyledTheme).space600};

  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => (theme as StyledTheme).space400};
  }
`;

const ContainerBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
`;

const ContainerTag = styled.span<{ $kind: 'system' | 'growth' }>`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  padding: 2px ${({ theme }) => (theme as StyledTheme).space200};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerSm};
  background: ${({ theme, $kind }) =>
    $kind === 'system'
      ? (theme as StyledTheme).colorWarningContainer
      : (theme as StyledTheme).colorInfoContainer};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  align-self: flex-start;
`;

const ContainerField = styled.div`
  display: grid;
  grid-template-columns: 80px 1fr;
  gap: ${({ theme }) => (theme as StyledTheme).space200};
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodySmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  line-height: 1.5;
`;

const ContainerFieldLabel = styled.span`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// ── Priority rules ──────────────────────────────────────────────────────────

const RulesSectionLabel = styled.h3`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  text-transform: uppercase;
  letter-spacing: 0.8px;
  margin: 0;
`;

const RulesList = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
`;

const RuleItem = styled.div`
  display: flex;
  gap: ${({ theme }) => (theme as StyledTheme).space400};
  align-items: flex-start;
`;

const RuleNumber = styled.div`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  min-width: 24px;
  height: 24px;
  display: grid;
  place-items: center;
  border: 1px solid ${({ theme }) => (theme as StyledTheme).colorOutlineVariant};
  border-radius: ${({ theme }) => (theme as StyledTheme).shapeCornerFull};
  flex-shrink: 0;
`;

const RuleBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => (theme as StyledTheme).space100};
`;

const RuleHead = styled.h4`
  ${({ theme }) => (theme as StyledTheme).typestyleV2LabelLarge};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurface};
  margin: 0;
`;

const RuleDesc = styled.p`
  ${({ theme }) => (theme as StyledTheme).typestyleV2BodyMedium};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  line-height: 1.5;
`;

const RuleDiagram = styled.pre`
  ${({ theme }) => (theme as StyledTheme).typestyleV2CodeSmall};
  color: ${({ theme }) => (theme as StyledTheme).colorOnSurfaceVariant};
  margin: 0;
  overflow-x: auto;
  line-height: 1.6;
`;

// ─── Main demo ─────────────────────────────────────────────────────────────

type ActiveZone = 'critical' | 'actionable' | 'growth' | 'none';
type SystemTier = 'critical' | 'actionable';

const ZONE_LABELS: Record<ActiveZone, string> = {
  critical: 'System layer — Critical',
  actionable: 'System layer — Actionable',
  growth: 'Growth layer — Ad',
  none: 'Nothing',
};

const NoticeStackDemo: React.FC = () => {
  useTheme();

  // Simplified mental model: two top-level layer toggles (System / Growth),
  // with sub-controls nested under System for tier + count. This maps to
  // how a non-engineer describes the system: "turn on the System layer to
  // see it above the greeting; turn on the Growth layer to see it below."
  const [systemOn, setSystemOn] = useState(true);
  const [systemTier, setSystemTier] = useState<SystemTier>('actionable');
  const [actionableCount, setActionableCount] = useState(2);
  const [growthOn, setGrowthOn] = useState(true);

  const [hudOpen, setHudOpen] = useState(true);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const [adDismissed, setAdDismissed] = useState(false);
  const [dismissedRecents, setDismissedRecents] = useState<Set<string>>(new Set());

  // Derived inputs to the underlying priority logic. The NoticeStack/zone
  // code below stays unchanged — we just collapse the simpler HUD state
  // into the counts it expects.
  const effectiveCriticalCount = systemOn && systemTier === 'critical' ? 1 : 0;
  const effectiveActionableCount =
    systemOn && systemTier === 'actionable' ? actionableCount : 0;

  const criticalNotices = useMemo(
    () =>
      CRITICAL_NOTICES.slice(0, effectiveCriticalCount).filter(
        (n) => !dismissed.has(n.id),
      ),
    [effectiveCriticalCount, dismissed],
  );
  const actionableNotices = useMemo(
    () =>
      ACTIONABLE_POOL.slice(0, effectiveActionableCount).filter(
        (n) => !dismissed.has(n.id),
      ),
    [effectiveActionableCount, dismissed],
  );

  // Zone routing: System wins over Growth; within System, Critical wins
  // over Actionable. If neither System tier has content, the Growth slot
  // gets a chance — but only if the ad hasn't been dismissed.
  const activeZone: ActiveZone = useMemo(() => {
    if (criticalNotices.length > 0) return 'critical';
    if (actionableNotices.length > 0) return 'actionable';
    if (growthOn && !adDismissed) return 'growth';
    return 'none';
  }, [criticalNotices.length, actionableNotices.length, growthOn, adDismissed]);

  const handleDismiss = useCallback((id: string) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);

  const handleDismissRecent = useCallback((name: string) => {
    setDismissedRecents((prev) => {
      const next = new Set(prev);
      next.add(name);
      return next;
    });
  }, []);

  // HUD setters reset notice dismissals so toggling feels predictable
  // (otherwise you might flip System on and see fewer notices than expected
  // because some are still in the dismissed set).
  const toggleSystem = useCallback((on: boolean) => {
    setSystemOn(on);
    setDismissed(new Set());
  }, []);
  const chooseTier = useCallback((tier: SystemTier) => {
    setSystemTier(tier);
    setDismissed(new Set());
  }, []);
  const chooseActionableCount = useCallback((n: number) => {
    setActionableCount(n);
    setDismissed(new Set());
  }, []);
  const toggleGrowth = useCallback((on: boolean) => {
    setGrowthOn(on);
    setAdDismissed(false);
  }, []);
  const resetDismissals = useCallback(() => {
    setDismissed(new Set());
    setAdDismissed(false);
    setDismissedRecents(new Set());
  }, []);

  const visibleRecents = RECENT_ITEMS.filter((item) => !dismissedRecents.has(item.name));

  return (
    <>
      <HudToggleButton
        onClick={() => setHudOpen((o) => !o)}
        aria-label={hudOpen ? 'Close HUD' : 'Open HUD'}
      >
        <Icon type={Icon.TYPES.SETTINGS_OUTLINE} size={14} />
        Prototype config
      </HudToggleButton>

      <Hud $visible={hudOpen}>
        {/* ─── SYSTEM LAYER ─────────────────────────────────────── */}
        <HudSection>
          <HudLayerTitle>
            <HudLayerName>System layer</HudLayerName>
            <HudLayerPosition>Above the greeting</HudLayerPosition>
          </HudLayerTitle>
          <HudSegmented>
            <HudSegment $active={!systemOn} onClick={() => toggleSystem(false)}>
              Off
            </HudSegment>
            <HudSegment $active={systemOn} onClick={() => toggleSystem(true)}>
              On
            </HudSegment>
          </HudSegmented>

          <HudSubGroup $disabled={!systemOn}>
            <HudLabel>Tier</HudLabel>
            <HudSegmented>
              <HudSegment
                $active={systemTier === 'critical'}
                onClick={() => chooseTier('critical')}
              >
                Critical
              </HudSegment>
              <HudSegment
                $active={systemTier === 'actionable'}
                onClick={() => chooseTier('actionable')}
              >
                Actionable
              </HudSegment>
            </HudSegmented>

            <HudSubGroup $disabled={systemTier !== 'actionable'}>
              <HudLabel>Count</HudLabel>
              <HudSegmented>
                {[1, 2, 3].map((n) => (
                  <HudSegment
                    key={n}
                    $active={actionableCount === n}
                    onClick={() => chooseActionableCount(n)}
                  >
                    {n}
                  </HudSegment>
                ))}
              </HudSegmented>
            </HudSubGroup>
          </HudSubGroup>
        </HudSection>

        <HudDivider />

        {/* ─── GROWTH LAYER ─────────────────────────────────────── */}
        <HudSection>
          <HudLayerTitle>
            <HudLayerName>Growth layer</HudLayerName>
            <HudLayerPosition>Below the greeting</HudLayerPosition>
          </HudLayerTitle>
          <HudSegmented>
            <HudSegment $active={!growthOn} onClick={() => toggleGrowth(false)}>
              Off
            </HudSegment>
            <HudSegment $active={growthOn} onClick={() => toggleGrowth(true)}>
              On
            </HudSegment>
          </HudSegmented>
        </HudSection>

        <HudDivider />

        <HudSection>
          <HudResetButton onClick={resetDismissals}>
            Reset dismissals
          </HudResetButton>
        </HudSection>

        <HudDivider />

        {/* ─── Active-zone footer (muted, lowest prominence) ──── */}
        <HudSection>
          <HudFooterLabel>Currently showing</HudFooterLabel>
          <HudFooterValue>{ZONE_LABELS[activeZone]}</HudFooterValue>
        </HudSection>
      </Hud>

      <PageShell>
        <ContentCol>
          {/* ─── SYSTEM ZONE (above greeting) ─────────────────────── */}
          {(criticalNotices.length > 0 || actionableNotices.length > 0) && (
            <SystemZone>
              {criticalNotices.length > 0 ? (
                <NoticeStack
                  notices={criticalNotices}
                  onDismiss={handleDismiss}
                  ariaLabel={`${criticalNotices.length} critical notice${criticalNotices.length === 1 ? '' : 's'}`}
                />
              ) : (
                <NoticeStack
                  notices={actionableNotices}
                  onDismiss={handleDismiss}
                  ariaLabel={`${actionableNotices.length} action-needed notice${actionableNotices.length === 1 ? '' : 's'}`}
                />
              )}
            </SystemZone>
          )}

          {/* ─── GREETING + AI INPUT ──────────────────────────────── */}
          <GreetingRow>
            <PromptHeading>
              <svg width="26" height="26" viewBox="0 0 26 26" fill="none" style={{ flexShrink: 0 }}>
                <path
                  d="M6.46408 13.0041C10.4723 12.3102 13.7947 9.62068 15.3717 5.99496C14.2054 4.2129 13.3799 2.18447 13.0021 0C11.8563 6.62731 6.62835 11.8544 0 13.0041C6.62835 14.1539 11.8563 19.381 13.0062 26.0083C13.384 23.8238 14.2095 21.7954 15.3758 20.0133C13.7947 16.3876 10.4764 13.6981 6.46819 13.0041H6.46408ZM18.4682 5.46527C17.8029 9.30862 14.7721 12.3389 10.9282 13.0041C14.7721 13.6693 17.7988 16.6997 18.4682 20.543C19.1335 16.6997 22.1643 13.6693 26.0083 13.0041C22.1643 12.3389 19.1376 9.30862 18.4682 5.46527Z"
                  fill="currentColor"
                />
              </svg>
              What are you working on?
            </PromptHeading>
          </GreetingRow>
          <HomePromptLite />

          {/* ─── RECENTS + YOUR TASKS ─────────────────────────────── */}
          <ShortcutsSection>
            <ShortcutsColumn>
              <ShortcutsColumnHeader>
                <Button
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.M}
                  icon={{ alignment: Button.ICON_ALIGNMENTS.RIGHT, type: Icon.TYPES.CHEVRON_RIGHT }}
                  onClick={() => {}}
                >
                  Recents
                </Button>
              </ShortcutsColumnHeader>
              {visibleRecents.length === 0 ? (
                <ShortcutsEmptyLabel>No recent activity</ShortcutsEmptyLabel>
              ) : (
                visibleRecents.map((item) => (
                  <ShortcutsColumnRow
                    key={item.name}
                    href="#"
                    onClick={(e: React.MouseEvent) => e.preventDefault()}
                  >
                    <Icon type={item.icon} size={16} />
                    <ShortcutsRowLabel>
                      {item.name}
                      {item.context ? (
                        <ShortcutsRowContext> in {item.context}</ShortcutsRowContext>
                      ) : (
                        ''
                      )}
                    </ShortcutsRowLabel>
                    <ShortcutsRowDismiss>
                      <Button.Icon
                        icon={Icon.TYPES.CLOSE}
                        aria-label={`Remove ${item.name}`}
                        appearance={Button.APPEARANCES.GHOST}
                        size={Button.SIZES.XS}
                        onClick={(e: React.MouseEvent) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleDismissRecent(item.name);
                        }}
                      />
                    </ShortcutsRowDismiss>
                  </ShortcutsColumnRow>
                ))
              )}
            </ShortcutsColumn>

            <ShortcutsColumn>
              <ShortcutsColumnHeader>
                <Button
                  appearance={Button.APPEARANCES.GHOST}
                  size={Button.SIZES.M}
                  icon={{ alignment: Button.ICON_ALIGNMENTS.RIGHT, type: Icon.TYPES.CHEVRON_RIGHT }}
                  onClick={() => {}}
                >
                  Your tasks
                </Button>
                <Status
                  appearance={Status.APPEARANCES.PRIMARY}
                  text="14 pending"
                  size={Status.SIZES.M}
                  outlined
                />
              </ShortcutsColumnHeader>
              {TODO_ITEMS.map((item) => (
                <ShortcutsColumnRow
                  key={item.label}
                  href="#"
                  onClick={(e: React.MouseEvent) => e.preventDefault()}
                >
                  <Icon type={item.icon} size={16} />
                  <ShortcutsRowLabel>{item.label}</ShortcutsRowLabel>
                  <ShortcutsRowMeta>{item.count}</ShortcutsRowMeta>
                </ShortcutsColumnRow>
              ))}
            </ShortcutsColumn>
          </ShortcutsSection>

          {/* ─── GROWTH ZONE (below tasks, only when System empty) ── */}
          {activeZone === 'growth' && (
            <AdBanner>
              <AdBannerCard>
                <AdBannerImage>
                  <img src={adDataCloudImg} alt="Rippling Data Cloud" />
                </AdBannerImage>
                <AdBannerBody>
                  <AdBannerEyebrow>Rippling Data Cloud</AdBannerEyebrow>
                  <AdBannerTitle>People and business data, together</AdBannerTitle>
                  <AdBannerDesc>
                    Connect Rippling with 3rd party business tools to get decision-ready insights and trigger automations, without spreadsheets or switching services.
                  </AdBannerDesc>
                  <AdBannerActions>
                    <AdBannerCTA>Start trial</AdBannerCTA>
                    <AdBannerLink>Learn more</AdBannerLink>
                  </AdBannerActions>
                </AdBannerBody>
                <AdBannerDismiss aria-label="Dismiss" onClick={() => setAdDismissed(true)}>
                  <Icon type={Icon.TYPES.CLOSE} size={16} color="currentColor" />
                </AdBannerDismiss>
              </AdBannerCard>
            </AdBanner>
          )}
        </ContentCol>

        {/* ─── RULES OF THE SYSTEM (documentation) ────────────────── */}
        <RulesBlock aria-labelledby="rules-title">
          <RulesHeader>
            <RulesEyebrow>About this prototype</RulesEyebrow>
            <RulesTitle id="rules-title">Home's two banner layers</RulesTitle>
            <RulesSubtitle>
              Home has two layers of banner messaging. The <strong>System layer</strong> sits above the greeting and holds workflow and compliance messages. The <strong>Growth layer</strong> sits below the greeting and holds promotional content. Only one layer is active at a time.
            </RulesSubtitle>
          </RulesHeader>

          <ContainerGrid>
            <ContainerBlock>
              <ContainerTag $kind="system">System layer</ContainerTag>
              <ContainerField>
                <ContainerFieldLabel>Position</ContainerFieldLabel>
                <span>Above the greeting</span>
              </ContainerField>
              <ContainerField>
                <ContainerFieldLabel>Purpose</ContainerFieldLabel>
                <span>Help users complete workflows or comply with product requirements.</span>
              </ContainerField>
              <ContainerField>
                <ContainerFieldLabel>Content</ContainerFieldLabel>
                <span>Static notices · urgent tasks · compliance reminders</span>
              </ContainerField>
            </ContainerBlock>

            <ContainerBlock>
              <ContainerTag $kind="growth">Growth layer</ContainerTag>
              <ContainerField>
                <ContainerFieldLabel>Position</ContainerFieldLabel>
                <span>Below the greeting</span>
              </ContainerField>
              <ContainerField>
                <ContainerFieldLabel>Purpose</ContainerFieldLabel>
                <span>Surface product discovery, cross-sell, and experimentation.</span>
              </ContainerField>
              <ContainerField>
                <ContainerFieldLabel>Content</ContainerFieldLabel>
                <span>Predefined campaigns · AI suggestions · cross-sell ads</span>
              </ContainerField>
            </ContainerBlock>
          </ContainerGrid>

          <RulesSectionLabel>Priority rules</RulesSectionLabel>
          <RulesList>
            <RuleItem>
              <RuleNumber>1</RuleNumber>
              <RuleBody>
                <RuleHead>The two layers are mutually exclusive</RuleHead>
                <RuleDesc>
                  Only one layer renders at a time. If the System layer has anything to show, the Growth layer stays hidden. Free-trial banners and first-run experiences sit outside this framework.
                </RuleDesc>
              </RuleBody>
            </RuleItem>

            <RuleItem>
              <RuleNumber>2</RuleNumber>
              <RuleBody>
                <RuleHead>Within the System layer, Critical pre-empts Actionable</RuleHead>
                <RuleDesc>
                  If any Tier 1 (Critical) message exists, only Critical renders. Otherwise Tier 2 (Actionable) messages render as one stack with shared background and hover-to-expand behavior.
                </RuleDesc>
              </RuleBody>
            </RuleItem>

            <RuleItem>
              <RuleNumber>3</RuleNumber>
              <RuleBody>
                <RuleHead>The Growth layer is a single slot</RuleHead>
                <RuleDesc>
                  When the System layer is empty, the Growth layer renders whatever the CMT ads system picks — predefined campaign, AI suggestion, or ad. One slot, no stacking. Dismissing the ad clears the layer for this session.
                </RuleDesc>
              </RuleBody>
            </RuleItem>
          </RulesList>

          <RuleDiagram>{`decision order:
  has critical?   ──▶ SYSTEM layer ▸ Critical    (above greeting)
       │  no
       ▼
  has actionable? ──▶ SYSTEM layer ▸ Actionable  (above greeting, stacked)
       │  no
       ▼
  has growth ad?  ──▶ GROWTH layer ▸ Ad          (below greeting)
       │  no
       ▼
  nothing  (just greeting, prompt, and tasks)`}</RuleDiagram>
        </RulesBlock>
      </PageShell>
    </>
  );
};

export default NoticeStackDemo;
