const md5 = require('md5')
const jwt = require('jsonwebtoken')
const BaseController = require('./base')

const HashSalt = ':guojianbo@shunyue'
const createRule = {
  email: { type: 'email' },
  nickname: { type: 'string' },
  password: { type: 'string' },
  captcha: { type: 'string' }
}


class UserController extends BaseController {
  async login() {
    const { ctx, app } = this
    const { email, captcha, password } = ctx.request.body
    if (captcha.toUpperCase() !== ctx.session.captcha.toUpperCase()) {
      return this.error('验证码错误')
    }
    const user = await ctx.model.User.findOne({
      email,
      password: md5(password + HashSalt)
    })
    if (!user) {
      return this.error('邮箱或密码错误')
    }
    // 将用户信息加密成token返回
    const token = jwt.sign({
      _id: user._id,
      email
    }, app.config.jwt.secret, {
      expiresIn: '1h' //过期时间
    })
    this.success({ token, email, nickname: user.nickname })
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
      if (await this.checkEmail(email)) {
        this.error('邮箱已被注册！')
      } else {
        const ret = await ctx.model.User.create({
          email,
          nickname,
          password: md5(password + HashSalt)
        })

        if (ret._id) {
          this.message('注册成功')
        }
      }
    } else {
      this.error('验证码错误')
    }
  }
  async checkEmail(email) {
    const user = await this.ctx.model.User.findOne({ email })
    return user
  }
  async verify() {
    // 校验用户名是否存在
  }
  async info() {

  }
}

module.exports = UserController
