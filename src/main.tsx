import { initI18nTranslations } from '@rippling/lib-i18n';
import oneUiService from '@rippling/pebble/services';
import { ThemeProvider, THEME_CONFIGS } from '@rippling/pebble/theme';
import resources from '@rippling/pebble/translations/locales/en-US/one-ui.json';
import React, { StrictMode } from 'react';
import * as ReactDOM from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import GlobalStyle from '@rippling/pebble/GlobalStyle';
import { Global, css } from '@emotion/react';
import MobileHomeDemo from './playground/MobileHomeDemo';
import AdaptiveHomeArchitectureDemo from './demos/adaptive-home-architecture-demo';
import IndexPage from './demos/index-page';
import GettingStartedPage from './demos/getting-started-page';
import DocViewerPage from './demos/doc-viewer-page';
import PlaygroundArchivePage from './demos/playground-archive-page';
import WidgetCardFrameworkPage from './demos/widget-card-framework-page';
import DesktopHomeDemo from './demos/desktop-home-demo';
import DesktopHomeDemoV2 from './demos/desktop-home-demo-v2';
import DesktopHomeDemo422 from './demos/desktop-home-demo-4-22';

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

init().then(() => {
  root.render(
    <StrictMode>
      <BrowserRouter>
        <ThemeProvider themeConfigs={THEME_CONFIGS} defaultTheme="berry" defaultColorMode="light">
          <GlobalStyle />
          <Global styles={css`
  body { letter-spacing: normal; }
  /* Native feel: remove tap flash, reduce 300ms delay */
  button, a, [role="button"], [tabindex]:not([tabindex="-1"]) {
    -webkit-tap-highlight-color: transparent;
    touch-action: manipulation;
  }
  /* Pressed state for instant feedback */
  button:active, a:active, [role="button"]:active {
    opacity: 0.9;
  }
`} />
          <Routes>
            {/* Main pages */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/docs" element={<DocViewerPage />} />
            <Route path="/playground-archive" element={<PlaygroundArchivePage />} />
            
            {/* Mobile Home Prototype */}
            <Route path="/mobile-home-demo" element={<MobileHomeDemo />} />
            <Route path="/adaptive-home-architecture" element={<AdaptiveHomeArchitectureDemo />} />
            <Route path="/widget-card-framework" element={<WidgetCardFrameworkPage />} />
            <Route path="/desktop-home-demo" element={<DesktopHomeDemo />} />
            <Route path="/desktop-home-demo-v2" element={<DesktopHomeDemoV2 />} />
            <Route path="/desktop-home-demo-4-22" element={<DesktopHomeDemo422 />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
