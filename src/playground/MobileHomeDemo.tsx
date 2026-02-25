import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Global, css } from '@emotion/react';
import { useSearchParams } from 'react-router-dom';
import { usePebbleTheme } from '@/utils/theme';
import { ThemeProvider, THEME_CONFIGS } from '@rippling/pebble/theme';
import type { PersonaId } from '@/data-models/types';
import { PERSONA_OPTIONS, getZoneWidgets } from '@/data-models/personas';
import { ALL_APPS, PERSONA_DEFAULT_SKUS } from '@/data-models/apps';
import { Canvas, PhoneMockup } from '@/playground/PhoneFrame';
import ThemedPhoneScreen from '@/playground/ThemedPhoneScreen';
import { HudToggle, UserIntentSummary, LeftHudPanel, RightHudPanel } from '@/playground/HudPanels';
import AppsModal from '@/playground/AppsModal';

const MobileHomeDemo: React.FC = () => {
  const { theme } = usePebbleTheme();
  const [searchParams, setSearchParams] = useSearchParams();
  const [activeNav, setActiveNav] = useState(0);
  const [leftPanelOpen, setLeftPanelOpen] = useState(false);
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [appsModalOpen, setAppsModalOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const leftPanelRef = useRef<HTMLDivElement>(null);
  const leftToggleRef = useRef<HTMLButtonElement>(null);
  const rightPanelRef = useRef<HTMLDivElement>(null);
  const rightToggleRef = useRef<HTMLButtonElement>(null);

  const initialPersona = (PERSONA_OPTIONS.find(p => p.id === searchParams.get('persona'))?.id) ?? 'hourly_operator';
  const initialOnboarding = searchParams.get('onboarding') === '1';
  const initialApps = (() => {
    const appsParam = searchParams.get('apps');
    if (appsParam) return new Set(appsParam.split(',').filter(Boolean));
    return new Set(PERSONA_DEFAULT_SKUS[initialPersona] ?? []);
  })();
  const [persona, setPersona] = useState<PersonaId>(initialPersona);
  const [onboarding, setOnboarding] = useState(initialOnboarding);
  const [enabledApps, setEnabledApps] = useState<Set<string>>(initialApps);
  const [shiftToday, setShiftToday] = useState(initialPersona === 'hourly_operator');
  const [onClock, setOnClock] = useState(false);

  const updateParams = useCallback((p: PersonaId, o: boolean, apps: Set<string>) => {
    const allEnabled = apps.size === ALL_APPS.length;
    const params: Record<string, string> = { persona: p, onboarding: o ? '1' : '0' };
    if (!allEnabled) params.apps = Array.from(apps).join(',');
    setSearchParams(params, { replace: true });
  }, [setSearchParams]);

  const handlePersonaChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value as PersonaId;
    const defaultSkus = new Set(PERSONA_DEFAULT_SKUS[val] ?? []);
    setPersona(val);
    setEnabledApps(defaultSkus);
    setShiftToday(val === 'hourly_operator');
    setOnClock(false);
    updateParams(val, onboarding, defaultSkus);
  }, [onboarding, updateParams]);

  const handleOnboardingToggle = useCallback(() => {
    setOnboarding(prev => {
      const next = !prev;
      updateParams(persona, next, enabledApps);
      return next;
    });
  }, [persona, enabledApps, updateParams]);

  const zoneWidgets = getZoneWidgets(persona, onboarding, enabledApps);
  const personaAvatar = PERSONA_OPTIONS.find(p => p.id === persona)?.avatar ?? PERSONA_OPTIONS[0].avatar;

  useEffect(() => {
    const root = document.documentElement;
    const vars: Record<string, [string, string]> = {
      '--chrome-bg': ['#292929', '#f0ede8'],
      '--chrome-surface': ['#1a1a1a', '#ffffff'],
      '--chrome-surface-card': ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.03)'],
      '--chrome-text': ['#fff', '#1a1a1a'],
      '--chrome-text-secondary': ['rgba(255,255,255,0.75)', 'rgba(0,0,0,0.65)'],
      '--chrome-text-muted': ['rgba(255,255,255,0.35)', 'rgba(0,0,0,0.4)'],
      '--chrome-text-heading': ['rgba(255,255,255,0.9)', 'rgba(0,0,0,0.8)'],
      '--chrome-border': ['rgba(255,255,255,0.12)', 'rgba(0,0,0,0.1)'],
      '--chrome-border-subtle': ['rgba(255,255,255,0.06)', 'rgba(0,0,0,0.06)'],
      '--chrome-border-row': ['rgba(255,255,255,0.04)', 'rgba(0,0,0,0.06)'],
      '--chrome-overlay': ['rgba(255,255,255,0.1)', 'rgba(0,0,0,0.05)'],
      '--chrome-overlay-hover': ['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.08)'],
      '--chrome-toggle-off': ['rgba(255,255,255,0.15)', 'rgba(0,0,0,0.15)'],
      '--chrome-accent': ['#7ec8e3', '#0066cc'],
      '--chrome-shadow': ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.08)'],
      '--chrome-backdrop': ['rgba(0,0,0,0.6)', 'rgba(0,0,0,0.3)'],
      '--chrome-pill-hover-bg': ['rgba(255,80,80,0.2)', 'rgba(255,60,60,0.1)'],
      '--chrome-pill-hover-border': ['rgba(255,80,80,0.35)', 'rgba(255,60,60,0.25)'],
      '--chrome-pill-x': ['rgba(255,255,255,0.35)', 'rgba(0,0,0,0.3)'],
      '--chrome-pill-x-hover': ['rgba(255,120,120,0.9)', 'rgba(220,50,50,0.8)'],
    };
    for (const [prop, [dark, light]] of Object.entries(vars)) {
      root.style.setProperty(prop, darkMode ? dark : light);
    }
  }, [darkMode]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        leftPanelOpen &&
        leftPanelRef.current &&
        !leftPanelRef.current.contains(e.target as Node) &&
        leftToggleRef.current &&
        !leftToggleRef.current.contains(e.target as Node)
      ) {
        setLeftPanelOpen(false);
      }
      if (
        rightPanelOpen &&
        rightPanelRef.current &&
        !rightPanelRef.current.contains(e.target as Node) &&
        rightToggleRef.current &&
        !rightToggleRef.current.contains(e.target as Node)
      ) {
        setRightPanelOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [leftPanelOpen, rightPanelOpen]);

  return (
    <>
      <Global
        styles={css`
          * { box-sizing: border-box; }
          body { margin: 0; padding: 0; overflow-x: hidden; }
        `}
      />

      <HudToggle ref={leftToggleRef} position="left" onClick={() => setLeftPanelOpen(prev => !prev)} aria-label="Toggle System Display panel" style={{ background: darkMode ? '#1a1a1a' : '#ffffff', color: darkMode ? '#fff' : '#1a1a1a', borderColor: darkMode ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)' }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"><rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2"/><path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/></svg>
        System Display
      </HudToggle>

      <UserIntentSummary
        persona={persona}
        personaAvatar={personaAvatar}
        onClock={onClock}
        shiftToday={shiftToday}
        rightToggleRef={rightToggleRef}
        onToggle={() => setRightPanelOpen(prev => !prev)}
        darkMode={darkMode}
      />

      <LeftHudPanel
        panelRef={leftPanelRef}
        open={leftPanelOpen}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
      />

      <RightHudPanel
        panelRef={rightPanelRef}
        open={rightPanelOpen}
        darkMode={darkMode}
        persona={persona}
        personaAvatar={personaAvatar}
        enabledApps={enabledApps}
        setEnabledApps={setEnabledApps}
        onboarding={onboarding}
        shiftToday={shiftToday}
        setShiftToday={setShiftToday}
        onClock={onClock}
        setOnClock={setOnClock}
        handlePersonaChange={handlePersonaChange}
        handleOnboardingToggle={handleOnboardingToggle}
        setAppsModalOpen={setAppsModalOpen}
        updateParams={updateParams}
      />

      {appsModalOpen && (
        <AppsModal
          enabledApps={enabledApps}
          setEnabledApps={setEnabledApps}
          persona={persona}
          onboarding={onboarding}
          primaryColor={theme.colorPrimaryContainer}
          updateParams={updateParams}
          onClose={() => setAppsModalOpen(false)}
        />
      )}

      <Canvas style={{ background: darkMode ? '#292929' : '#f0ede8' }}>
        <PhoneMockup isDark={darkMode}>
          <ThemeProvider themeConfigs={THEME_CONFIGS} defaultTheme="berry" colorMode={darkMode ? 'dark' : 'light'}>
            <ThemedPhoneScreen
              activeNav={activeNav}
              setActiveNav={setActiveNav}
              zoneWidgets={zoneWidgets}
              enabledApps={enabledApps}
              persona={persona}
              onboarding={onboarding}
              personaAvatar={personaAvatar}
              darkMode={darkMode}
            />
          </ThemeProvider>
        </PhoneMockup>
      </Canvas>
    </>
  );
};

export default MobileHomeDemo;
