import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "NullType commons JS",
  description: "Set of reusable code for js projects",
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    nav: [
      { text: 'Home', link: '/' },
    ],

    sidebar: [
      {
        text: 'Features',
        items: [
          { text: 'Object helper', link: '/features/object-helper/' },
          { text: 'Event emitter', link: '/features/event-emitter/' }
        ]
      }
    ],

    socialLinks: [
      { icon: 'github', link: 'https://github.com/nulltype-dev/commons-js' }
    ]
  },
  base: process.env.BASE_URL
})
