module.exports = {
  typescript: {
    check: true, // type-check stories during Storybook build
  },
  stories: ['../stories/**/*.stories.@(js|jsx|ts|tsx|mdx)'],
  addons: ['@storybook/addon-links', '@storybook/addon-essentials'],
  webpackFinal: async (config, { configType }) => {
    config.module.rules.push({
      test: /\.less$/,
      use: [
        require.resolve('style-loader'),
        {
          loader: require.resolve('css-loader'),
          options: {
            modules: false,
            importLoaders: 1,
          },
        },
        require.resolve('less-loader'),
      ],
    });
    return config;
  },
};
