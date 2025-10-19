import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Unisync Documentation",
  description: "Documentation for the Unisync project",
  base: "/docs/",

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "API", link: "/api/" },
    ],

    sidebar: [
      {
        text: "Introduction",
        items: [
          { text: "Getting Started", link: "/guide/" },
          { text: "Installation", link: "/guide/installation" },
        ],
      },
      {
        text: "API Reference",
        items: [
          { text: "Overview", link: "/api/" },
          { text: "Authentication", link: "/api/authentication" },
        ],
      },
    ],

    socialLinks: [
      { icon: "github", link: "https://github.com/yourusername/unisync" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present Unisync Team",
    },
  },
});
