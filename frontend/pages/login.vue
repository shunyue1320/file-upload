<template>
  <div>
    <el-form class="login-form" :rules="form">
      <el-form-item props="email">
        <span>
          <li class="el-icon-mobile"></li>
        </span>
        <el-input placeholder="邮箱"></el-input>
      </el-form-item>
      <el-form-item props="password">
        <span>
          <li class="el-icon-lock"></li>
        </span>
        <el-input placeholder="密码"></el-input>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  layout: 'login',
  data () {
    return {
      form: []
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
