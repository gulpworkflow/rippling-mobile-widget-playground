import { initI18nTranslations } from '@rippling/lib-i18n';
import Button from '@rippling/pebble/Button';
import Drawer from '@rippling/pebble/Drawer';
import Dropdown from '@rippling/pebble/Dropdown';
import ListItem from '@rippling/pebble/ListItem';
import oneUiService from '@rippling/pebble/services';
import { ThemeProvider, useThemeSettings, THEME_CONFIGS } from '@rippling/pebble/theme';
import resources from '@rippling/pebble/translations/locales/en-US/one-ui.json';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import GlobalStyle from '@rippling/pebble/GlobalStyle';
import Icon from '@rippling/pebble/Icon';
import ModalDemo from './demos/@paul/modal-demo';
import AnimationsDemo from './demos/@paul/animations-demo';
import DesignTokensDemo from './demos/@paul/design-tokens-demo';
import ForkedSelectTest from './demos/@paul/forked-select-test';
import MyFeatureDemo from './demos/@paul/my-feature-demo';
import AppShellDemo from './demos/official/app-shell-demo';
import CompositionManagerDemo from './demos/@dvora/CompositionManager/composition-manager-demo';
import { CompositionDetail } from './demos/@dvora/CompositionManager/compositions/CompositionDetail';
import IndexPage from './demos/index-page';
import GettingStartedPage from './demos/getting-started-page';
import DocViewerPage from './demos/doc-viewer-page';
import { usePebbleTheme } from './utils/theme';
// import { debounce } from 'lodash'; // Unused - kept for potential editor restoration

// Initialize @rippling/ui package
oneUiService.init({} as any);

const defaultNameSpace = 'one-ui';
const namespaces = [defaultNameSpace];
const language = 'en-US';
const supportedLanguages = [language];

// Initialize translation (dependency of @rippling/pebble)
function init() {
  return initI18nTranslations({
    resources: {
      [language]: {
        [defaultNameSpace]: resources,
      },
    },
    namespaces,
    supportedLanguages,
    defaultNameSpace,
    fallbackLanguage: language,
    language,
    debug: true,
  });
}

const container = document.getElementById('root') as HTMLElement;

let root = (window as any).__root__;

if (!root) {
  root = ReactDOM.createRoot(container);
  (window as any).__root__ = root;
}

const storeStates = (params: Record<string, unknown>) =>
  window.localStorage.setItem('pebble-editor-playground', JSON.stringify(params));
const getStoredStates = () =>
  JSON.parse(window.localStorage.getItem('pebble-editor-playground') || '{}');

enum EditorType {
  // RICH_TEXT = 'rich-text',
  // DOCUMENT = 'document',
  // INLINE = 'inline',
  MODAL_DEMO = 'modal-demo',
  ANIMATIONS = 'animations',
  DESIGN_TOKENS = 'design-tokens',
  FORKED_SELECT_TEST = 'forked-select-test',
  MY_FEATURE = 'my-feature',
  APP_SHELL = 'app-shell',
  COMPOSITION_MANAGER = 'composition-manager',
}

// Map demo types to URL paths
const DEMO_ROUTES: Record<EditorType, string> = {
  [EditorType.APP_SHELL]: '/app-shell-demo',
  [EditorType.DESIGN_TOKENS]: '/design-tokens-demo',
  [EditorType.ANIMATIONS]: '/animations-demo',
  [EditorType.MODAL_DEMO]: '/drawer-demo',
  [EditorType.FORKED_SELECT_TEST]: '/forked-select-test',
  [EditorType.MY_FEATURE]: '/my-feature-demo',
  [EditorType.COMPOSITION_MANAGER]: '/app-studio/composition-manager',
};

// Reverse map for path to demo type
const PATH_TO_DEMO: Record<string, EditorType> = Object.entries(DEMO_ROUTES).reduce(
  (acc, [type, path]) => {
    acc[path] = type as EditorType;
    return acc;
  },
  {} as Record<string, EditorType>,
);

const Playground = (props: { className?: string }) => {
  const { className } = props;
  const navigate = useNavigate();
  const location = useLocation();

  const storedData = React.useMemo(() => {
    try {
      return getStoredStates();
    } catch (error) {
      console.error(error);
      return {};
    }
  }, []);

  const { changeMode } = useThemeSettings() as any;
  const { theme, mode: currentMode } = usePebbleTheme();

  // Get current demo type from URL path
  const getCurrentDemoFromPath = React.useCallback(() => {
    return PATH_TO_DEMO[location.pathname] ?? EditorType.DESIGN_TOKENS;
  }, [location.pathname]);

  const [editorType, setEditorType] = React.useState(() => getCurrentDemoFromPath());

  // Sync URL when demo changes
  React.useEffect(() => {
    const path = DEMO_ROUTES[editorType];
    if (path && location.pathname !== path) {
      navigate(path, { replace: false });
    }
  }, [editorType, navigate, location.pathname]);

  // Sync demo when URL changes
  React.useEffect(() => {
    const demoFromPath = getCurrentDemoFromPath();
    if (demoFromPath !== editorType) {
      setEditorType(demoFromPath);
    }
  }, [location.pathname, getCurrentDemoFromPath, editorType]);
  // const [inlineCSS, setInlineCSS] = React.useState<typeof Inline>();
  const [isEditable, setIsEditable] = React.useState(storedData.isEditable ?? true);
  const [isDisabled, setIsDisabled] = React.useState(storedData.isDisabled ?? false);
  const [showPreview, setShowPreview] = React.useState(storedData.showPreview ?? false);
  const [logTypingPerf, setLogTypingPerf] = React.useState(storedData.logTypingPerf ?? false);
  const [showEditorBasedPreview, setShowEditorBasedPreview] = React.useState(
    storedData.showEditorBasedPreview ?? false,
  );
  const [showJSON, setShowJSON] = React.useState(storedData.showJSON ?? false);
  const [isDemoSwitcherOpen, setIsDemoSwitcherOpen] = React.useState(false);
  const [isTopBarVisible, setIsTopBarVisible] = React.useState(true);

  React.useEffect(() => {
    storeStates({
      editorType,
      isEditable,
      isDisabled,
      showPreview,
      logTypingPerf,
      showEditorBasedPreview,
      showJSON,
    });
  }, [
    editorType,
    isEditable,
    isDisabled,
    showPreview,
    logTypingPerf,
    showEditorBasedPreview,
    showJSON,
  ]);

  // Keyboard shortcut to toggle top bar visibility
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Cmd+K on Mac, Ctrl+K on Windows/Linux
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsTopBarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Commented out - currently unused since editors are disabled
  // const reportError = React.useCallback((error: Error) => {
  //   console.error(error);
  //   SnackBar.error(error.message);
  // }, []);

  // const handleChange = React.useMemo(
  //   () =>
  //     !logTypingPerf && (showPreview || showJSON || showEditorBasedPreview)
  //       ? debounce(async ({ html, json }: { html: () => Promise<string>; json: () => any }) => {
  //           setHtml(await html());
  //           setJson(json());
  //         }, 250)
  //       : undefined,
  //   [logTypingPerf, showPreview, showJSON, showEditorBasedPreview],
  // );

  const DEMO_OPTIONS = [
    // { type: EditorType.RICH_TEXT, label: 'Rich Text Editor' },
    // { type: EditorType.DOCUMENT, label: 'Document Editor' },
    // { type: EditorType.INLINE, label: 'Inline Editor' },
    { type: EditorType.APP_SHELL, label: 'App Shell' },
    { type: EditorType.DESIGN_TOKENS, label: 'Design Tokens' },
    { type: EditorType.ANIMATIONS, label: 'Animations' },
    { type: EditorType.MODAL_DEMO, label: 'Drawer Demo' },
    { type: EditorType.FORKED_SELECT_TEST, label: 'Forked Select Test' },
    { type: EditorType.MY_FEATURE, label: 'My Feature' },
    { type: EditorType.COMPOSITION_MANAGER, label: 'Composition Manager' },
  ];

  const SETTINGS_OPTIONS = [
    {
      label: isEditable ? 'Make Read-Only' : 'Make Editable',
      onClick: () => setIsEditable(!isEditable),
    },
    {
      label: isDisabled ? 'Enable Editor' : 'Disable Editor',
      onClick: () => setIsDisabled(!isDisabled),
    },
    {
      label: showEditorBasedPreview ? 'Hide Editor Preview' : 'Show Editor Preview',
      onClick: () => setShowEditorBasedPreview(!showEditorBasedPreview),
    },
    {
      label: showPreview ? 'Hide HTML Preview' : 'Show HTML Preview',
      onClick: () => setShowPreview(!showPreview),
    },
    {
      label: showJSON ? 'Hide JSON Preview' : 'Show JSON Preview',
      onClick: () => setShowJSON(!showJSON),
    },
    {
      label: logTypingPerf ? 'Disable Performance Logging' : 'Enable Performance Logging',
      onClick: () => setLogTypingPerf(!logTypingPerf),
    },
  ];

  const settingsDropdown = (
    <Dropdown
      key="Settings"
      list={SETTINGS_OPTIONS.map((option, index) => ({
        label: option.label,
        value: index,
      }))}
      onChange={value => {
        SETTINGS_OPTIONS[value].onClick();
      }}
      shouldAutoClose
    >
      <Button.Icon
        aria-label="settings"
        icon={Icon.TYPES.SETTINGS_OUTLINE}
        size={Button.SIZES.S}
        appearance={Button.APPEARANCES.OUTLINE}
      />
    </Dropdown>
  );

  const toggleTheme = (
    <Button.Icon
      key="Theme"
      aria-label="toggle-theme"
      icon={currentMode === 'dark' ? Icon.TYPES.SUN_OUTLINE : Icon.TYPES.OVERNIGHT_OUTLINE}
      size={Button.SIZES.S}
      appearance={Button.APPEARANCES.OUTLINE}
      onClick={() => changeMode(currentMode === 'dark' ? 'light' : 'dark')}
    />
  );

  const toggleEditor = (
    <Button key="Editor" size={Button.SIZES.S} onClick={() => setIsDemoSwitcherOpen(true)}>
      Switch Demo
    </Button>
  );

  const demoSwitcherDrawer = (
    <Drawer
      isVisible={isDemoSwitcherOpen}
      onCancel={() => setIsDemoSwitcherOpen(false)}
      title="Switch Demo"
      isCompact
      width={320}
    >
      <div style={{ padding: '0' }}>
        {DEMO_OPTIONS.map(demo => (
          <ListItem
            key={demo.type}
            title={demo.label}
            rightRenderer={
              demo.type === editorType ? (
                <Icon type={Icon.TYPES.CHECK} color={theme.colorPrimary} size={20} />
              ) : null
            }
            onClick={() => {
              setEditorType(demo.type);
              setIsDemoSwitcherOpen(false);
            }}
          />
        ))}
      </div>
    </Drawer>
  );

  const getCurrentDemoName = () => {
    const demo = DEMO_OPTIONS.find(d => d.type === editorType);
    return demo?.label || 'Pebble Playground';
  };

  const buttons = (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        display: isTopBarVisible ? 'flex' : 'none',
        gap: '10px',
        padding: '16px 20px',
        justifyContent: 'space-between',
        alignItems: 'center',
        backgroundColor: theme.colorSurfaceBright,
        borderBottom: `1px solid ${theme.colorOutlineVariant}`,
        zIndex: 1000,
      }}
    >
      <h1
        style={{
          margin: 0,
          fontSize: '18px',
          fontWeight: 600,
          color: theme.colorOnSurface,
        }}
      >
        {getCurrentDemoName()}
      </h1>
      <div style={{ display: 'flex', gap: '10px' }}>
        {settingsDropdown}
        {toggleTheme}
        {toggleEditor}
      </div>
    </div>
  );

  // Add keyboard shortcut listener for cmd+K
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Check for Cmd+K (Mac) or Ctrl+K (Windows/Linux)
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        e.stopPropagation();
        setIsTopBarVisible(prev => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <>
      {editorType !== EditorType.APP_SHELL && editorType !== EditorType.MY_FEATURE && editorType !== EditorType.COMPOSITION_MANAGER && buttons}
      <div
        role="main"
        style={{
          backgroundColor: theme.colorSurface,
          minHeight: '100vh',
          paddingTop: isTopBarVisible && editorType !== EditorType.APP_SHELL && editorType !== EditorType.MY_FEATURE && editorType !== EditorType.COMPOSITION_MANAGER ? '60px' : '0',
          transition: 'padding-top 0.2s ease',
        }}
        className={className}
      >
        {demoSwitcherDrawer}
        {/* EDITORS DISABLED - See EDITOR_ISSUE_ANALYSIS.md */}
        {/* {editorType === EditorType.RICH_TEXT && (
        <>
          {isTopBarVisible && buttons}
          <div style={{ maxWidth: '900px', margin: '20px auto 0' }}>
            <RichTextEditor
              editable={isEditable}
              disabled={isDisabled}
              onError={reportError}
              features={{ fileUpload: true, variables: true }}
              typingPerfLogger={logTypingPerf ? console.log : undefined}
              onChange={handleChange}
              variables={SAMPLE_VARIABLES}
              placeholder="Enter your subject"
              initialContent={html}
              DO_NOT_USE_enableBlockExperience
            />
          </div>
        </>
      )}

      {editorType === EditorType.DOCUMENT && (
        <DocumentEditor
          disabled={isDisabled}
          onError={reportError}
          features={{ fileUpload: true, variables: true, page: true, advanceListPatterns: true }}
          typingPerfLogger={logTypingPerf ? console.log : undefined}
          onChange={handleChange}
          containerStyle={{ height: '100vh' }}
          header={isTopBarVisible ? buttons : undefined}
          variables={SAMPLE_VARIABLES}
          inlineCSS={inlineCSS}
          initialContent={html}
          placeholder="Enter your subject"
        />
      )}
      {editorType === EditorType.INLINE && (
        <>
          {isTopBarVisible && buttons}
          <div style={{ maxWidth: '900px', margin: '20px auto 0' }}>
            <InlineEditor
              placeholder="Enter your subject"
              editable={isEditable}
              disabled={isDisabled}
              onError={reportError}
              variables={SAMPLE_VARIABLES}
              multiLine={false}
              initialContent={html}
              features={{ variables: true }}
            />
          </div>
        </>
      )} */}

        {editorType === EditorType.APP_SHELL && <AppShellDemo />}

        {editorType === EditorType.DESIGN_TOKENS && <DesignTokensDemo />}

        {editorType === EditorType.MODAL_DEMO && <ModalDemo />}

        {editorType === EditorType.ANIMATIONS && <AnimationsDemo />}

        {editorType === EditorType.FORKED_SELECT_TEST && <ForkedSelectTest />}

        {editorType === EditorType.MY_FEATURE && <MyFeatureDemo />}

        {editorType === EditorType.COMPOSITION_MANAGER && <CompositionManagerDemo />}

        {/* EDITOR PREVIEW DISABLED - See EDITOR_ISSUE_ANALYSIS.md */}
        {/* <div style={{ maxWidth: '900px', margin: '32px auto 0' }}>
        {!logTypingPerf && showEditorBasedPreview && (
          <>
            <p style={{ textDecoration: 'underline' }}>Editor Preview</p>
            <hr />
            {editorType === EditorType.RICH_TEXT && (
              <RichTextEditor
                onError={console.log}
                key={html}
                initialContent={html}
                features={{ fileUpload: true, variables: true }}
                variables={SAMPLE_VARIABLES}
              />
            )}
            {editorType === EditorType.DOCUMENT && (
              <DocumentEditor
                onError={console.log}
                key={html}
                initialContent={html}
                features={{ fileUpload: true, variables: true, page: true }}
                variables={SAMPLE_VARIABLES}
                containerStyle={{ height: 'auto' }}
                disabled
                toolbar={false}
              />
            )}
          </>
        )}
        {!logTypingPerf && showPreview && (
          <>
            <p style={{ textDecoration: 'underline' }}>HTML Preview</p>
            <hr />
            <ReactShadow.div>
              <div dangerouslySetInnerHTML={{ __html: html }} />
            </ReactShadow.div>
          </>
        )}
        {!logTypingPerf && showJSON && (
          <>
            <p style={{ textDecoration: 'underline' }}>JSON Preview</p>
            <hr />
            <ReactJson src={json} />
          </>
        )}
      </div> */}
      </div>
    </>
  );
};

init().then(() => {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider themeConfigs={THEME_CONFIGS} defaultTheme="berry" defaultColorMode="light">
          <GlobalStyle />
          <Routes>
            <Route path="/" element={<IndexPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/docs" element={<DocViewerPage />} />
            <Route path="/app-shell-demo" element={<Playground />} />
            <Route path="/design-tokens-demo" element={<Playground />} />
            <Route path="/animations-demo" element={<Playground />} />
            <Route path="/drawer-demo" element={<Playground />} />
            <Route path="/forked-select-test" element={<Playground />} />
            <Route path="/my-feature-demo" element={<Playground />} />
            <Route path="/app-studio/composition-manager" element={<Playground />} />
            <Route path="/app-studio/composition-manager/compositions/:id" element={<CompositionDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
