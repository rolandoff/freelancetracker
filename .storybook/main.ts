import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-links'
  ],
  "framework": "@storybook/react-vite",
  viteFinal: async (config) => {
    // Set base path for subfolder deployment
    // Comment out this line for local development
    config.base = '/storybook/';
    return config;
  }
};
export default config;