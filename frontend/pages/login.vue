<template>
  <div class="login-container">
    <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="loginForm">
      <div class="title-container">
        <img src="/logo.png" alt="" width="50">
      </div>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" ></el-input>
      </el-form-item>

      <el-form-item prop="emailcode" label="邮箱验证码" class="captcha-container">
        <div class="captcha">
          <el-button type="primary" :disabled="send.timer > 0" @click="sendEmailCode">{{ sendText }}</el-button>
        </div>
        <el-input v-model="form.emailcode" placeholder="请输入邮箱验证码" style="width: 80%"></el-input>
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" ></el-input>
      </el-form-item>

      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha">
          <img :src="captchaUrl" alt="" @click="updateCaptcha">
        </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码" style="width: 70%"></el-input>
      </el-form-item>

      <el-form-item prop="" label=" " style="text-align: center;">
        <el-button type="primary" @click.native.prevent="handleLogin">登录</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import md5 from 'md5'

export default {
  layout: 'login',
  data () {
    return {
      captchaUrl: '/api/captcha',
      send: {
        timer: 0,

      },
      form: {
        email: '',
        captcha: '',
        password: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式！'}
        ],
        emailcode: [
          { required: true, message: '请输入邮箱验证码' }
        ],
        captcha: [
          { required: true, message: '请输入验证码' }
        ],
        password: [
          { required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6~12位的密码' }
        ]
      }
    }
  },
  computed: {
    sendText() {
      if (0 >= this.send.timer) {
        return '发送'
      } else {
        return `${this.send.timer}s后发送`
      }
    }
  },
  methods: {
    async sendEmailCode() {
      await this.$http.get(`sendcode?email=${this.form.email}`)

      this.send.timer = 10
      this.timer = setInterval(() => {
        this.send.timer -= 1
        if ( this.send.timer === 0) {
          clearInterval(this.timer)
        }
      }, 1000);
    },
    updateCaptcha() {
      this.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
    },
    handleLogin() {
      this.$refs.loginForm.validate(async valid => {
        if (valid) {
          const form = {
            email: this.form.email,
            password: md5(this.form.password),
            captcha: this.form.captcha,
            emailcode: this.form.emailcode
          }

          try {
            const res = await this.$http.post('/user/login', form)
            if (res.code == 0) {
              //登录成功存储token
              this.$message.success('登录成功！')
              localStorage.setItem('token', res.data.token)
              setTimeout(() => {
                this.$router.push('/')
              })
            } else {
              this.$message.error(res.message)
            }
          } catch(error) {
            console.error(error)
          }
        }
      })
    }
  }
}
</script>

<style>
.login-form {
  width: 800px;
  margin: 50px auto;
}
</style>
