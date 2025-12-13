/** @type {import('tailwindcss').Config} */
export default {
  presets: [require('@influix/config/tailwind')],
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
    '../../packages/ui/src/**/*.{js,ts,jsx,tsx}',
  ],
  darkMode: 'class',
};
