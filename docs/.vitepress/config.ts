import { defineConfig } from "vitepress";

export default defineConfig({
  title: "Unisync Docs",
  description: "Documentation for the Unisync project",
  base: "/unisync/",
  ignoreDeadLinks: [/^http:\/\/localhost/],

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
        text: "Configuration",
        items: [
          { text: "Provider Setup Guide", link: "/guide/providers" },
          { text: "Quick Reference", link: "/guide/provider-quick-reference" },
        ],
      },
      {
        text: "Event Management",
        items: [
          {
            text: "Managing Events and Schedules",
            link: "/guide/managing-events",
          },
        ],
      },
      {
        text: "Architecture",
        items: [
          { text: "Database Schema", link: "/architecture/database-schema" },
          {
            text: "Event Management System",
            link: "/architecture/event-system",
          },
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
      { icon: "github", link: "https://github.com/FASami/unisync" },
    ],

    footer: {
      message: "Released under the MIT License.",
      copyright: "Copyright © 2025-present Unisync Team",
    },
  },
});
