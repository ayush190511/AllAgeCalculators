// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import react from '@astrojs/react';

// https://astro.build/config
export default defineConfig({
  redirects: {
    '/calculator': '/',
    '/age-calculator': '/',
    '/upsc': '/upsc-age-calculator',
    '/retirement': '/retirement-age-calculator',
    '/dog-age': '/dog-age-calculator',
    '/baby-age': '/baby-age-calculator',
    '/date-diff': '/date-difference-calculator',
  },
  devToolbar: {
    enabled: false
  },
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [react()],
});
