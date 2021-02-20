<template>
  <div class="login-container">
    <el-form class="login-form" label-width="100px" :model="form" :rules="rules" ref="registerForm">
      <div class="title-container">
        <img src="/logo.png" alt="" width="50">
      </div>
      <el-form-item prop="email" label="邮箱">
        <el-input v-model="form.email" placeholder="请输入邮箱" ></el-input>
      </el-form-item>

      <el-form-item prop="captcha" label="验证码" class="captcha-container">
        <div class="captcha">
          <img :src="code.captchaUrl" alt="" @click="updateCaptcha">
        </div>
        <el-input v-model="form.captcha" placeholder="请输入验证码" style="width: 80%"></el-input>
      </el-form-item>

      <el-form-item prop="nickname" label="昵称">
        <el-input v-model="form.nickname" placeholder="请输入呢称" ></el-input>
      </el-form-item>

      <el-form-item prop="password" label="密码">
        <el-input v-model="form.password" type="password" placeholder="请输入密码" ></el-input>
      </el-form-item>

      <el-form-item prop="repassword" label="确认密码">
        <el-input v-model="form.repassword" type="password" placeholder="请再次输入密码" ></el-input>
      </el-form-item>

      <el-form-item prop="" label=" " style="text-align: center;">
        <el-button type="primary" @click.native.prevent="handleRegister">注册</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import md5 from 'md5'

export default {
  layout: 'login',
  data() {
    return {
      form: {
        email: '',
        captcha: '',
        nickname: '',
        password: '',
        repassword: ''
      },
      rules: {
        email: [
          { required: true, message: '请输入邮箱' },
          { type: 'email', message: '请输入正确的邮箱格式！'}
        ],
        captcha: [
          { required: true, message: '请输入验证码' }
        ],
        nickname: [
          { required: true, message: '请输入用户名' }
        ],
        password: [
          { required: true, pattern: /^[\w_-]{6,12}$/g, message: '请输入6~12位的密码' }
        ],
        repassword: [
          { required: true, message: '请再次输入密码' },
          { validator: (rule, value, callback) => {
            if (value !== this.form.password) {
              callback(new Error('两次密码不一致'))
            }
            callback()
          }}
        ]
      },
      code: {
        captchaUrl: '/api/captcha'
      }
    }
  },
  methods: {
    updateCaptcha() {
      this.code.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
    },
    handleRegister() {
      this.$refs.registerForm.validate(async valid => {
        console.log("$axios", this.$axios.defaults.baseURL)
        if (valid) {
          const form = {
            email: this.form.email,
            nickname: this.form.nickname,
            password: md5(this.form.password),
            captcha: this.form.captcha
          }

          try {
            const res = await this.$http.post('/user/register', form)
            if (res.code == 0) {
              this.$alert('注册成功', '成功', {
                confirmButtonText: '去登入',
                callback: () => {
                  this.$router.push('/login')
                }
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
<style lang="">
  
</style>