const BaseController = require('./base')

const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' },
}


class UserController extends BaseController {
  async login() {

  }
  async register() {
    const { ctx } = this
    try {
      ctx.validate(createRule)
    } catch (e) {
      return this.error('参数校验失败', -1, e.errors)
    }

    const { email, password, captcha, nickname } = ctx.request.body
    console.log(email, password, captcha, nickname)

    if (captcha.toUpperCase() === ctx.session.captcha.toUpperCase()) {


      this.success({ name: '111' })
    } else {
      this.error('验证码错误')
    }
  }
  async verify() {
    // 校验用户名是否存在
  }
  async info() {

  }
}

module.exports = UserController
