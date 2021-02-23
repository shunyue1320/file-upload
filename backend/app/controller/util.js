const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')
const fse = require('fs-extra')
const path = require('path')

class UtilController extends BaseController {
  async captcha() {
    const { ctx } = this
    const captcha = svgCaptcha.create({
      size: 4,
      width: 100,
      height: 40,
      fontSize: 50,
      noise: 3,
    })
    ctx.session.captcha = captcha.text
    ctx.response.type = 'image/svg+xml'
    ctx.body = captcha.data
  }

  async sendcode() {
    const { ctx } = this
    const email = ctx.query.email
    const code = Math.random().toString().slice(2,6)
    ctx.session.emailcode = code

    const subject = 'shunyue验证码'
    const text = ''
    const html = `<h2>【shunyue社区】</h2>验证码：<span>${code}</span>`
    const hasSend = await this.service.tools.sendMail(email, subject, text, html)
    if (hasSend) {
      this.message('发送成功！')
    } else {
      this.error('发送失败！')
    }
  }

  async uploadfile() {
    const { ctx } = this
    const file = ctx.request.files[0]
    const { hash, name } = ctx.request.body

    const chunkPath = path.resolve(this.config.UPLOAD_DIR, hash)
    // const filePath = path.resolve() //文件最终存储的位置(完整文件)
    if (!fse.existsSync(chunkPath)) {
      await fse.mkdir(chunkPath)
    }
    // 临时目录移至上传文件目录
    await fse.move(file.filepath, `${chunkPath}/${name}`)

    this.message(`${name} upload ok`)
  }

  async mergefile() {
    const { ctx } = this
    const { ext, size, hash } = ctx.request.body
    const filePath = path.resolve(this.config.UPLOAD_DIR, `${hash}.${ext}`)
    await this.ctx.service.tools.mergeFile(filePath, hash, size)
    this.success({
      url: `/public/${hash}.${ext}`
    })
  }
}

module.exports = UtilController
