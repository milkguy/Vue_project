//修改默认打包入口文件
module.exports = {
  chainWebpack: (config) => {
    //发布模式
    config.when(process.env.NODE_ENV === "production", (config) => {
      config.entry("app").clear().add("./src/main-prod.js");
      config.set("externals", {
        vue: "Vue",
        "vue-router": "VueRouter",
        axios: "axios",
        lodash: "_",
        echarts: "echarts",
        nprogress: "NProgress",
        "vue-quill-editor": "VueQuillEditor",
      });
      config.plugin("html").tap((args) => {
        args[0].isProd = true;
        return args;
      });
      //产品发布阶段默认打包入口的调整方式
    });
    //开发模式
    config.when(process.env.NODE_ENV === "development", (config) => {
      config.entry("app").clear().add("./src/main-dev.js");
      //产品发布阶段默认打包入口的调整方式
    });
    config.plugin("html").tap((args) => {
      args[0].isProd = false;
      return args;
    });
  },
};
