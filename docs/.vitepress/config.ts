import { defineConfig } from "vitepress";

export default defineConfig({
  title: "UniSync Docs",
  description: "Documentation for UniSync: class routines, class changes and notices for university departments",
  base: "/unisync/",
  ignoreDeadLinks: [/^http:\/\/localhost/],

  themeConfig: {
    nav: [
      { text: "Home", link: "/" },
      { text: "Guide", link: "/guide/" },
      { text: "Architecture", link: "/architecture/overview" },
      { text: "API", link: "/api/" },
    ],

    sidebar: [
      {
        text: "Guide",
        items: [
          { text: "Getting Started", link: "/guide/" },
          { text: "Installation", link: "/guide/installation" },
          { text: "Department Setup (web)", link: "/guide/department-setup" },
          { text: "Mobile App", link: "/guide/mobile-app" },
          { text: "Deployment", link: "/guide/deployment" },
        ],
      },
      {
        text: "Architecture",
        items: [
          { text: "Overview", link: "/architecture/overview" },
          { text: "Database Schema", link: "/architecture/database-schema" },
          {
            text: "Notification System",
            link: "/architecture/notification-system",
          },
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
      { icon: "github", link: "https://github.com/FAsami/unisync" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present UniSync Team",
    },
  },
});
