# VitePress configuration

`config.ts` holds the site's title, navigation and sidebar. When you add, rename or remove a page under `docs/`, update the sidebar here.

`yarn build` (run in `docs/`) writes the static site to `.vitepress/dist` (git-ignored). `.github/workflows/deploy-docs.yml` builds it and publishes it to GitHub Pages at https://fasami.github.io/unisync/.
