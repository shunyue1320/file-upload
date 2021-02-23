// 安装 spark-md5 后将min.js放入 static 内访问

self.importScripts('spark-md5.min.js') // 引入 spark-md5

self.onmessage = e => {                // 接收主线程传递的参数
  const { chunks } = e.data
  const spark = new self.SparkMD5.ArrayBuffer()

  let progress = 0, count = 0

  const loadNext = index => {
    if (index == 0) {
      progress = 0
      count = 0
    }
    const reader = new FileReader()
    reader.readAsArrayBuffer(chunks[index].file)
    reader.onload = e => {
      count++
      spark.append(e.target.result)    // 将读取的内容添加入spark生成hash
      if (count == chunks.length) {
        self.postMessage({
          progress: 100,
          hash: spark.end()
        })
      } else {
        progress += 100 / chunks.length
        self.postMessage({ progress })
        loadNext(count)
      }
    }
  }
  loadNext(0)
}

