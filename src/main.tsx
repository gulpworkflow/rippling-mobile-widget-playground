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
import IndexPage from './demos/index-page';
import GettingStartedPage from './demos/getting-started-page';
import DocViewerPage from './demos/doc-viewer-page';

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
          <Global styles={css`body { letter-spacing: normal; }`} />
          <Routes>
            {/* Main pages */}
            <Route path="/" element={<IndexPage />} />
            <Route path="/getting-started" element={<GettingStartedPage />} />
            <Route path="/docs" element={<DocViewerPage />} />
            
            {/* Mobile Home Prototype */}
            <Route path="/mobile-home-demo" element={<MobileHomeDemo />} />
            
            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </ThemeProvider>
      </BrowserRouter>
    </StrictMode>,
  );
});
