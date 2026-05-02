import { defineConfig } from 'vite';
import monkey from 'vite-plugin-monkey';

const ICON =
  'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+PHBhdGggZD0iTTMyIDQgTDU4IDE3IFY0NyBMMzIgNjAgTDYgNDcgVjE3IFogTTYgMTcgTDMyIDMwIEw1OCAxNyBNMzIgMzAgVjYwIiBmaWxsPSJub25lIiBzdHJva2U9IiMwMDY2Y2MiIHN0cm9rZS13aWR0aD0iMyIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPjwvc3ZnPg==';

const REPO_RAW = 'https://raw.githubusercontent.com/Mayurifag/inex-ge-userscript/release';

export default defineConfig({
  plugins: [
    monkey({
      entry: 'src/main.js',
      userscript: {
        name: 'inex.ge tweaks',
        namespace: 'https://github.com/Mayurifag/inex-ge-userscript',
        description:
          'Quality-of-life tweaks for inex.ge parcels page: force perPage=20, hide Recipient column, hide takeout parcels, hide send date in tracking column, replace Flight number cell with two-row last-status info (tooltip preserved, Linguist-friendly), click-to-sort by arrival date.',
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
  ],
  build: {
    minify: false,
  },
});
