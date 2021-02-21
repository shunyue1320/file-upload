const BaseController = require('./base')
const svgCaptcha = require('svg-captcha')

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
}

module.exports = UtilController
