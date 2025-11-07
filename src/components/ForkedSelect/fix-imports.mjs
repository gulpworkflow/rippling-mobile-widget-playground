import { readFileSync, writeFileSync, readdirSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Simple recursive file finder
function findFiles(dir, pattern = /\.(ts|tsx)$/) {
  const files = [];
  const entries = readdirSync(dir, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory() && entry.name !== 'node_modules') {
      files.push(...findFiles(fullPath, pattern));
    } else if (entry.isFile() && pattern.test(entry.name) && entry.name !== 'fix-imports.mjs') {
      files.push(fullPath);
    }
  }
  
  return files;
}

// Map of old import paths to new ones
const replacements = [
  // Two levels up (../../)
  [/from ['"]\.\.\/\.\.\/Spinner['"]/g, "from '@rippling/pebble/Spinner'"],
  [/from ['"]\.\.\/\.\.\/Text['"]/g, "from '@rippling/pebble/Text'"],
  [/from ['"]\.\.\/\.\.\/theme['"]/g, "from '@rippling/pebble/theme'"],
  [/from ['"]\.\.\/\.\.\/Icon['"]/g, "from '@rippling/pebble/Icon'"],
  [/from ['"]\.\.\/\.\.\/Popper['"]/g, "from '@rippling/pebble/Popper'"],
  [/from ['"]\.\.\/\.\.\/Switch['"]/g, "from '@rippling/pebble/Switch'"],
  [/from ['"]\.\.\/\.\.\/Checkbox['"]/g, "from '@rippling/pebble/Checkbox'"],
  [/from ['"]\.\.\/\.\.\/Input\.constants['"]/g, "from '@rippling/pebble/Inputs/Input.constants'"],
  [/from ['"]\.\.\/\.\.\/Input\.helpers['"]/g, "from '@rippling/pebble/Inputs/Input.helpers'"],
  [/from ['"]\.\.\/\.\.\/Input\.styles['"]/g, "from '@rippling/pebble/Inputs/Input.styles'"],
  [/from ['"]\.\.\/\.\.\/Input\.types['"]/g, "from '@rippling/pebble/Inputs/Input.types'"],
  [/from ['"]\.\.\/\.\.\/hooks['"]/g, "from '@rippling/pebble/Inputs/hooks'"],
  [
    /from ['"]\.\.\/\.\.\/hooks\/useInputContext['"]/g,
    "from '@rippling/pebble/Inputs/hooks/useInputContext'",
  ],
  [/from ['"]\.\.\/\.\.\/services\/logger['"]/g, "from '@rippling/pebble/services/logger'"],

  // Three levels up (../../../)
  [/from ['"]\.\.\/\.\.\/\.\.\/Icon['"]/g, "from '@rippling/pebble/Icon'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Text['"]/g, "from '@rippling/pebble/Text'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/theme['"]/g, "from '@rippling/pebble/theme'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/MenuList['"]/g, "from '@rippling/pebble/MenuList'"],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/MenuList\/MenuList\.constants['"]/g,
    "from '@rippling/pebble/MenuList/MenuList.constants'",
  ],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/MenuList\/MenuList\.helpers['"]/g,
    "from '@rippling/pebble/MenuList/MenuList.helpers'",
  ],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/MenuList\/MenuList\.types['"]/g,
    "from '@rippling/pebble/MenuList/MenuList.types'",
  ],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/MenuList\/atoms\/Styles\/BaseItem\.styles['"]/g,
    "from '@rippling/pebble/MenuList/atoms/Styles/BaseItem.styles'",
  ],
  [/from ['"]\.\.\/\.\.\/\.\.\/Popper['"]/g, "from '@rippling/pebble/Popper'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Form['"]/g, "from '@rippling/pebble/Form'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Avatar['"]/g, "from '@rippling/pebble/Avatar'"],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/Avatar\/Avatar\.styles['"]/g,
    "from '@rippling/pebble/Avatar/Avatar.styles'",
  ],
  [/from ['"]\.\.\/\.\.\/\.\.\/Chip['"]/g, "from '@rippling/pebble/Chip'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Chip\/Chip\.style['"]/g, "from '@rippling/pebble/Chip/Chip.style'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Typography['"]/g, "from '@rippling/pebble/Typography'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Label['"]/g, "from '@rippling/pebble/Label'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Layout\/Box['"]/g, "from '@rippling/pebble/Layout/Box'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/accessibility['"]/g, "from '@rippling/pebble/accessibility'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/hooks['"]/g, "from '@rippling/pebble/hooks'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/services\/logger['"]/g, "from '@rippling/pebble/services/logger'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/contexts['"]/g, "from '@rippling/pebble/contexts'"],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/contexts\/DO_NOT_USE_internal\/inputContext['"]/g,
    "from '@rippling/pebble/contexts/DO_NOT_USE_internal/inputContext'",
  ],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/contexts\/DO_NOT_USE_internal\/selectContext['"]/g,
    "from '@rippling/pebble/contexts/DO_NOT_USE_internal/selectContext'",
  ],
  [/from ['"]\.\.\/\.\.\/\.\.\/Atoms\/Country['"]/g, "from '@rippling/pebble/Atoms/Country'"],
  [/from ['"]\.\.\/\.\.\/\.\.\/Internals\/hooks['"]/g, "from '@rippling/pebble/Internals/hooks'"],
  [
    /from ['"]\.\.\/\.\.\/\.\.\/Internals\/TextFieldWithChip\/ChipsRenderer['"]/g,
    "from '@rippling/pebble/Internals/TextFieldWithChip/ChipsRenderer'",
  ],
  [/from ['"]\.\.\/\.\.\/\.\.\/emotionUtilities['"]/g, "from '@rippling/pebble/emotionUtilities'"],

  // Special cases - imports with multiple segments
  [
    /import { ellipsisStyle } from ['"]\.\.\/\.\.\/\.\.\/Typography['"]/g,
    "import { ellipsisStyle } from '@rippling/pebble/Typography'",
  ],
  [
    /import { getShowScrollbarAlwaysStyle } from ['"]\.\.\/\.\.\/\.\.\/emotionUtilities['"]/g,
    "import { getShowScrollbarAlwaysStyle } from '@rippling/pebble/emotionUtilities'",
  ],
  [
    /import { getCurrentTheme } from ['"]\.\.\/\.\.\/\.\.\/theme['"]/g,
    "import { getCurrentTheme } from '@rippling/pebble/theme'",
  ],
  [
    /import { sanitizeTheme } from ['"]\.\.\/\.\.\/\.\.\/Internals\/hooks['"]/g,
    "import { sanitizeTheme } from '@rippling/pebble/Internals/hooks'",
  ],
  [
    /import { useTheme, sanitizeTheme } from ['"]\.\.\/\.\.\/\.\.\/Internals\/hooks['"]/g,
    "import { useTheme, sanitizeTheme } from '@rippling/pebble/Internals/hooks'",
  ],
  [
    /import type { StaticList, List, ListAsyncFn } from ['"]\.\.\/\.\.\/Internals\/hooks\/useSetSearchResults['"]/g,
    "import type { StaticList, List, ListAsyncFn } from '@rippling/pebble/Internals/hooks/useSetSearchResults'",
  ],
];

// Find all TypeScript/JavaScript files
const files = findFiles(__dirname);

console.log(`Found ${files.length} files to process...`);

let totalReplacements = 0;

files.forEach(file => {
  let content = readFileSync(file, 'utf8');
  let fileReplacements = 0;

  replacements.forEach(([pattern, replacement]) => {
    const matches = content.match(pattern);
    if (matches) {
      fileReplacements += matches.length;
      content = content.replace(pattern, replacement);
    }
  });

  if (fileReplacements > 0) {
    writeFileSync(file, content, 'utf8');
    console.log(`  ✓ ${file.replace(__dirname + '/', '')} - ${fileReplacements} replacements`);
    totalReplacements += fileReplacements;
  }
});

console.log(`\nDone! Made ${totalReplacements} replacements across ${files.length} files.`);
