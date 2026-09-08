module.exports = {
  overrides: [
    { test: /\.tsx$/, presets: ["@babel/preset-typescript", ["babel-preset-solid", {}]] },
    { test: /\.ts$/,  presets: ["@babel/preset-typescript"] },
  ],
}
