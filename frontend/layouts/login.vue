<template>
  <div>
    <Nuxt />
  </div>
</template>
<script>
export default {
  
}
</script>
<style lang="scss">
.login-container {
  width: 100%;
  min-height: 100%;
  .login-form {
    width: 40rem;
    padding: 2rem 0;
    margin: 0 auto;
    overflow: hidden;
  }
  .title-container {
    text-align: center;
    margin-bottom: 1rem;
    img {
      width: 10rem;
    }
  }
  .captcha-container {
    .captcha {
      position: absolute;
      right: -1rem;
      img {
        width: 10rem;
        height: 2.5rem;
        cursor: pointer;
      }
    }
  }
}
</style>