<template>
  <div>
    <h1>用户中心</h1>
    <div ref="drag" id='drag' @drop="bindEvents" @dragover="onDragover" @dragleave="onDragleave">
      <input type="file" name="file" @change="handleFileChange">
    </div>
    <div>
      <el-progress :text-inside="true" :percentage="uploadProgress"></el-progress>
    </div>
    <el-button @click="uploadFile">上传文件</el-button>
    <div>
      <p>计算文件hash的进度</p>
      <el-progress :text-inside="true" :percentage="hashProgress"></el-progress>
    </div>

    <div>
      <div class="cube-container">
        <div class="cube" v-for="chunk in chunks" :key="chunk.name" :style="{width: cubeWidth + 'px'}">
          <div
            :class="{
              'uploading': chunk.progress > 0 && chunk.progress < 100,
              'success': chunk.progress == 100,
              'error': chunk.progress < 0
            }"
          >
            <i v-if="chunk.progress > 0 && chunk.progress < 100" class="el-icon-loading" style="`background: linear-gradient( #FFC107 ${percentFinish}%, #fff ${percentFinish}% );`" />
            <i v-if="chunk.progress == 100" class="el-icon-success" />
            <i v-if="chunk.progress < 0" class="el-icon-error" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import sparkMD5 from 'spark-md5'
const CHUNK_SIZE = 0.5 * 1024 * 1024 //文件切片大小

export default {
  data() {
    return {
      file: null,
      chunks: [],
      // uploadProgress: 0,
      hashProgress: 0
    }
  },
  computed: {
    cubeWidth() {
      return Math.ceil(Math.sqrt(this.chunks.length)) * 16
    },
    uploadProgress() {
      if (!this.file || !this.chunks.length) {
        return 0
      }
      const loaded = this.chunks.map(item => item.chunk.size * item.progress)
                                .reduce((acc, cur) => acc * cur, 0)

      // 上传成功的 / 需要上传的
      return parseInt( ((loaded / this.file.size) * 100).toFixed(2) )
    }
  },
  async mounted() {
    const res = await this.$http.get('/user/info')
  },
  methods: {
    handleFileChange(e) {
      const [ file ] = e.target.files
      if (!file) return
      this.file = file
    },
    onDragover(event) {
      event.preventDefault()
      this.$refs.drag.style.borderColor = '#04A0E8'
    },
    onDragleave(event) {
      event.preventDefault()
      this.$refs.drag.style.borderColor = '#eee'
    },
    bindEvents(event) {
      event.preventDefault();
      const [ file ] = event.dataTransfer.files
      this.file = file
    },
    async uploadFile() {
      if (!this.file) {
        alert('请选择文件')
        return
      }
      // if (!await this.isImage(this.file)) {
      //   alert('文件格式不对！')
      //   return
      // }

      const chunks = this.createFileChunk(this.file)
      this.hash = await this.calculateHashWorker(chunks)  // Worker计算hash
      // const hash2 = await this.calculateHashIdle(chunks)   // requestIdleCallback计算hash
      // const hash3 = await this.calculateHashSample() // 抽样计算hash
      // 咨询后端是否已上传有切片

      this.chunks = chunks.map((chunk, index) => {
        const name = this.hash + '-' + index
        return {
          hash: this.hash,
          name,
          index,
          chunk: chunk.file,
          progress: 0
        }
      })
      await this.uploadChunks()
    },
    createFileChunk(file, size = CHUNK_SIZE) {
      const chunks = []
      let cur = 0
      while (cur < this.file.size) {
        chunks.push({ index: cur, file: this.file.slice(cur, cur + size)})
        cur += size
      }
      return chunks
    },
    async calculateHashWorker(chunks) {
      return new Promise( resolve => {
        this.worker = new Worker('/plugins/hash.js')             // 开启一个外部进程
        this.worker.postMessage({ chunks }) // 给外部进程传递信息 
        this.worker.onmessage = e => {                   // 接收外部Worker回传的信息
          const { progress, hash } = e.data
          this.hashProgress = Number(progress.toFixed(2))
          if (hash) {
            resolve(hash)
          }
        }
      })
    },
    async calculateHashIdle(chunks) {
      return new Promise( resolve => {
        const spark = new sparkMD5.ArrayBuffer()
        let count = 0

        const appendToSpark = async file => {
          return new Promise( resolve => {
            const reader = new FileReader()
            reader.readAsArrayBuffer(file)
            reader.onload = e => {
              spark.append(e.target.result)
              resolve()
            }
          })
        }
        const workLoop = async deadline => {
          while (count < chunks.length && deadline.timeRemaining() > 1) {
            //浏览器存在空闲时间
            await appendToSpark(chunks[count].file)
            count++
            if (count < chunks.length) {
              this.hashProgress = Number( ((100 * count) / chunks.length).toFixed(2) )
            } else {
              this.hashProgress = 100
              resolve(spark.end())
            }
          }
          window.requestIdleCallback(workLoop) // 给 workLoop 函数一个浏览器状态参数 deadline
        }
        window.requestIdleCallback(workLoop)   // 给 workLoop 函数一个浏览器状态参数 deadline
      })
    },
    async calculateHashSample() {
      const spark = new sparkMD5.ArrayBuffer(), reader = new FileReader(),
      file = this.file, size = file.size, offset = 2 * 1024 * 1024
      // hash抽样: 第一个区块2M，中间区块取前中后各2个字节，最后区块数据全要
      let chunks = [file.slice(0, offset)]
      let cur = offset
      while (cur < size) {
        if (cur + offset >= size) {
          chunks.push(file.slice(cur, cur + offset))
        } else {
          const mid = cur + offset / 2, end = cur + offset
          chunks.push(file.slice(cur, cur + 2))
          chunks.push(file.slice(mid, mid + 2))
          chunks.push(file.slice(end - 2, end))
        }
        cur += offset
      }
      return await this.calculateHashIdle(chunks)
    },
    blobToString(blob) {
      return new Promise(reslove => {
        const reader = new FileReader()
        reader.onload = function() {
          const ret = reader.result.split('')
                      .map(v => v.charCodeAt())
                      .map(v => v.toString(16).toUpperCase())
                      .join(' ')                   
          reslove(ret)
        }
        reader.readAsBinaryString(blob) // 开启读取
      })
    },
    async isPng(file) {
      const ret = await this.blobToString(file.slice(0, 8))
      return (ret === '89 50 4E 47 D A 1A A')
    },
    async isJpg(file) {
      const len = file.size
      const start = await this.blobToString(file.slice(0, 2))
      const tail = await this.blobToString(file.slice(-2, len))
      return (start === 'FF D8') && (tail == 'FF D9')
    },
    async isGif(file) {
      // GIF89a 和 GIF87a
      // 前面6个16进制， '47 49 46 38 39 61' or '47 49 46 38 37 61'
      const ret = await this.blobToString(file.slice(0, 6))
      return (ret === '47 49 46 38 39 61') || (ret === '47 49 46 38 37 61')
    },
    async isImage(file) {
      return await this.isGif(file) || await this.isPng(file) || await this.isJpg(file)
    },
    async uploadChunks() {
      const requests = this.chunks.map(chunk => {
        const { hash, name, chunk: fileChunk } = chunk
        // 转promise
        const form = new FormData()
        form.append('hash', hash)
        form.append('name', name)
        form.append('chunk', fileChunk)
        return form
      }).map((form, index) => this.$http.post('/uploadfile', form, {
        onUploadProgress: progress => {
          //每个区块的进度条
          this.chunks[index].progress = Number(((progress.loaded / progress.total) * 100).toFixed(2))
        }
      }))
      // 并发量控制
      await Promise.all(requests)
      await this.mergeRequest()
    },
    async mergeRequest() {
      this.$http.post('/mergefile', {
        ext: this.file.name.split('.').pop(),
        size: CHUNK_SIZE,
        hash: this.hash
      })
    }
  }
}
</script>
<style lang="scss">
#drag {
  height: 100px;
  line-height: 100px;
  border: 2px dashed #eee;
  text-align: center;
  vertical-align: middle;
}

.cube-container {
  .cube {
    width: 14px;
    height: 14px;
    line-height: 12px;
    border: 1px solid white;
    background: #eee;
    float: left;

    > .success {
      background: green;
    }

    > .error {
      background: red;
    }
  }
}
</style>