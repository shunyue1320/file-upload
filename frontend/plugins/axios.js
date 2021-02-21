import Vue from 'vue'
import axios from 'axios'
import { MessageBox } from 'element-ui'


const service = axios.create({
  baseURL: process.env.baseUrl
})

export default ({ store, redirect }) => {
  // 请求拦截
  service.interceptors.request.use(
    async config => {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.common['Authorization'] = `Bearer ${token}`
      }
      return config
    }
  )

  // 响应拦截
  service.interceptors.response.use(
    async response => {
      let { data } = response
      
      switch (data.code) {
        case -666:
        case -1:
          MessageBox.confirm(data.message, '提示', {
            confirmButtonText: '去登录',
            showCancelButton: false,
            type: 'warning'
          }).then(() => {
            localStorage.removeItem('token')
            redirect({ path: 'login' })
          })
          break;

        default:
          break;
      }
      return data
    }
  )
}

Vue.prototype.$http = service


export const http = service
