<template>
  <div>
    <h1>用户中心</h1>
  </div>
</template>
<script>
export default {
  async mounted() {
    const res = await this.$http.get('/user/info')
    console.log("init---", res)
  }
  
}
</script>
<style lang="">
  
</style>