
const AntDesignThemePlugin = require("antd-theme-webpack-plugin");
const path = require("path");

const options = {
  antDir: path.join(__dirname, "./node_modules/ant-design-vue"), //antd包位置
  stylesDir: path.join(__dirname, "./src/styles/theme"), //主题文件所在文件夹
  varFile: path.join(__dirname, "./src/styles/theme/variables.less"), // 自定义默认的主题色
  mainLessFile: path.join(__dirname, "./src/styles/theme/index.less"), // 项目中其他自定义的样式（如果不需要动态修改其他样式，该文件可以为空）
  outputFilePath: path.join(__dirname, "./public/color.less"), //提取的less文件输出到什么地方
  themeVariables: [
    "@ak-sider-bg",
    "@primary-color",
    "@menu-bg",
    "@menu-dark-bg",
    "@menu-dark-submenu-bg",
    "@menu-dark-item-active-bg",
    "@menu-dark-item-hover-bg",
    "@menu-dark-color",
    "@layout-header-background",
    "@breadcrumb-base-color",
    "@breadcrumb-last-item-color",
    "@breadcrumb-link-color",
    "@breadcrumb-link-color-hover",
    "@table-header-bg",
    "@table-header-color",
  ], //要改变的主题变量
  indexFileName: "./public/index.html", // index.html所在位置
  generateOnce: false // 是否只生成一次（if you don't want to generate color.less on each chnage in code to make build process fast in development mode, assign it true value. But if you have new changes in your styles, you need to re-run your build process npm start.）
};


module.exports = {
  publicPath: './',
  lintOnSave: false,
  productionSourceMap: false,
  pluginOptions: {
    i18n: {
      locale: 'en',
      fallbackLocale: 'en',
      localeDir: 'locales',
      enableInSFC: false
    }
  },
  devServer: {
    proxy: {
      '/api': {
        // target: 'http://127.0.0.1/api',
        target: 'http://192.168.124.3/api',
        ws: true,
        changeOrigin: true,
        pathRewrite: {
          '^/api': ''
        }
      }
    }
  },
  css: {
    loaderOptions: {
      less: {
        lessOptions: {
          modifyVars: {
            //多主题编译，全参数请参考"https://github.com/vueComponent/ant-design-vue/blob/master/components/style/themes/default.less"
            // "primary-color": "#ffffff",
          },
          javascriptEnabled: true
        }
      }
    }
  },
  configureWebpack: {
    plugins: [new AntDesignThemePlugin(options)]
  }


}

