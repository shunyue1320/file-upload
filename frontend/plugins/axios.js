import Vue from 'vue'
import axios from 'axios'


const service = axios.create({
  baseURL: process.env.baseUrl
})

service.interceptors.response.use(
  async response => {
    let { data } = response
    return data
  }
)

Vue.prototype.$http = service


export const http = service
