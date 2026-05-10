import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';
import { minify as minifyJs } from 'rolldown/utils';

const ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZD0iTTMyIDQgTDU4IDE3IFY0NyBMMzIgNjAgTDYgNDcgVjE3IFogTTYgMTcgTDMyIDMwIEw1OCAxNyBNMzIgMzAgVjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';

const REPO_RAW = 'https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/release';

function stripDarkCss(css) {
  if (css.startsWith('export default ')) {
    css = JSON.parse(css.slice('export default '.length).replace(/;$/, ''));
  }

  return minifyCss(
    css
      .replace(/\/\*\s*==UserStyle==[\s\S]*?==\/UserStyle==\s*\*\//, '')
      .replace(/\/\*[\s\S]*?\*\//g, '')
      .replace(/@-moz-document[^{]+\{/, '')
      .replace(/\}\s*$/, '')
      .trim(),
  );
}

function minifyCss(css) {
  let out = '';
  let quote = '';
  let space = false;
  for (const ch of css) {
    if (quote) {
      out += ch;
      if (ch === quote) quote = '';
    } else if (ch === '"' || ch === "'") {
      if (space && out) out += ' ';
      out += ch;
      quote = ch;
      space = false;
    } else if (/\s/.test(ch)) {
      space = true;
    } else {
      if (space && out && !'{}:;,>'.includes(ch)) out += ' ';
      out += ch;
      space = false;
    }
  }
  return out.replace(/\s*([{}:;,>])\s*/g, '$1').replace(/;}+/g, '}');
}

async function minifyUserscript(code) {
  const end = '// ==/UserScript==';
  const i = code.indexOf(end);
  if (i < 0) return (await minifyJs('inex-ge.user.js', code, {})).code;

  const headerEnd = i + end.length;
  const header = code.slice(0, headerEnd);
  const body = code.slice(headerEnd).trim();
  const minified = (await minifyJs('inex-ge.user.js', body, {})).code;
  return `${header}\n${minified}`;
}

export default defineConfig({
  plugins: [
    {
      name: 'strip-dark-css-raw',
      enforce: 'pre',
      transform(code, id) {
        if (!id.includes('/src/dark.user.css?raw')) return null;
        return { code: `export default ${JSON.stringify(stripDarkCss(code))};`, map: null };
      },
    },
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'inex.ge tweaks',
        namespace: 'https://github.com/Mayurifag/inex-ge-userscript',
        description:
          'Quality-of-life tweaks for inex.ge parcels page: force perPage=40, hide Recipient column, hide takeout parcels, remove clutter, replace Flight cell with last status + arrival, click-to-sort by arrival, expand truncated tracking, translate Georgian statuses, strip price prefix from description, suppress modal click after text-drag, optional dark theme.',
        match: ['https://inex.ge/*'],
        'run-at': 'document-start',
        noframes: true,
        icon: ICON,
        homepageURL: 'https://github.com/Mayurifag/inex-ge-userscript',
        supportURL: 'https://github.com/Mayurifag/inex-ge-userscript/issues',
        updateURL: `${REPO_RAW}/inex-ge.user.js`,
        downloadURL: `${REPO_RAW}/inex-ge.user.js`,
      },
      build: {
        fileName: 'inex-ge.user.js',
      },
      server: {
        open: false,
      },
    }),
    {
      name: 'minify-userscript-output',
      enforce: 'post',
      async generateBundle(_, bundle) {
        const chunk = bundle['inex-ge.user.js'];
        if (chunk?.type === 'chunk') chunk.code = await minifyUserscript(chunk.code);
      },
    },
  ],
  build: {
    minify: 'oxc',
    cssMinify: true,
  },
});
