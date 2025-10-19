# Unisync Documentation

This directory contains the VitePress documentation for the Unisync project.

## Quick Start

```bash
# Install dependencies
yarn install

# Start the dev server
yarn dev

# Build for production
yarn build

# Preview the production build
yarn preview
```

## Development

The documentation site will be available at `http://localhost:5173` when running `yarn dev`.

## Building

To build the static site:

```bash
yarn build
```

The built site will be in `.vitepress/dist/` directory.

## Deployment

The built site can be deployed to any static hosting service like:

- GitHub Pages
- Netlify
- Vercel
- AWS S3
- Or served from your own server

## Project Structure

```
docs/
├── .vitepress/
│   ├── config.ts          # VitePress configuration
│   └── dist/              # Build output (ignored by git)
├── guide/
│   ├── index.md           # Getting Started
│   └── installation.md    # Installation guide
├── api/
│   ├── index.md           # API overview
│   └── authentication.md  # Auth documentation
├── index.md               # Homepage
├── package.json
└── README.md              # This file
```

## Writing Documentation

VitePress uses Markdown with some extensions:

- **Frontmatter**: YAML metadata at the top of files
- **Custom containers**: `::: tip`, `::: warning`, etc.
- **Code blocks**: With syntax highlighting
- **Vue components**: Can be used in Markdown

See the [VitePress documentation](https://vitepress.dev) for more information.
