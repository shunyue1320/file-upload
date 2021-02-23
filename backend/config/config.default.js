/* eslint valid-jsdoc: "off" */

'use strict'
const path = require('path')

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {}

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1613742178255_4762'

  // 允许上传任何文件
  config.multipart = {
    mode: 'file',
    whitelist: () => true
  }

  config.UPLOAD_DIR = path.resolve(__dirname, '..', 'app/public')

  // add your middleware config here
  config.middleware = []

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  }

  return {
    ...config,
    ...userConfig,
    security: {
      csrf: {
        enable: false, //不校验认证
      },
    },
    mongoose: {
      client: {
        url: 'mongodb://127.0.0.1:27017/fileupload',
        options: {},
      }
    },
    jwt: {
      secret: ':guojianbo@shunyue'
    }
  }
}
