import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NullType commons JS",
  description: "Set of reusable code for js projects",
  head: [['link', { rel: 'icon', href: `${process.env.BASE_URL ?? '/'}favicon.ico` }]],
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Features',
        items: [
          { text: 'Event emitter', link: '/features/event-emitter/' },
          { text: 'Modddel', link: '/features/modddel/' },
          { text: 'Object helper', link: '/features/object-helper/' },
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nulltype-dev/commons-js' }
    ]
  },
  base: process.env.BASE_URL
})
