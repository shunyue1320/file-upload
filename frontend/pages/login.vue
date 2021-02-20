<template>
  <div>
    <el-form class="login-form" :rules="rules">
      <el-form-item prop="email">
        <span>
          <li class="el-icon-mobile"></li>
        </span>
        <el-input placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item prop="password">
        <span>
          <li class="el-icon-lock"></li>
        </span>
        <el-input placeholder="密码"></el-input>
      </el-form-item>
      <el-form-item prop="captcha">
        <el-input placeholder="验证码"></el-input>
        <img :src="captchaUrl" alt="" @click="updateCaptcha">
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  layout: 'login',
  data () {
    return {
      captchaUrl: '/api/captcha',
      rules: {}
    }
  },
  methods: {
    updateCaptcha() {
      this.captchaUrl = `/api/captcha?_t=${new Date().getTime()}`
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
