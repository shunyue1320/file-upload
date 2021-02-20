import Vue from 'vue'
import axios from 'axios'


const service = axios.create({
  baseURL: process.env.baseUrl
})

Vue.prototype.$http = service


export const http = service
