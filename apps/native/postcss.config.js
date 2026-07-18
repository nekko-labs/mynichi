module.exports = {
  plugins: [
    require('react-strict-dom/postcss-plugin')({
      include: ['src/**/*.{js,jsx,mjs,ts,tsx}']
    }),
    require('autoprefixer')
  ]
};
