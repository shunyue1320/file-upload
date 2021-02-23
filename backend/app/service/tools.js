const { Service } =require('egg')
const nodemailer = require('nodemailer')
const fse = require('fs-extra')
const path = require('path')

const userEmail = 'guojianbo6026@163.com'
const transporter = nodemailer.createTransport({
  service: '163',
  secureConnection: true,
  auth: {
    user: userEmail,
    pass: 'MBZYTZDEHONOJMKO'
  }
})

class ToolService extends Service {
  async sendMail(email, subject, text, html) {
    const mailOptions = {
      from: userEmail,
      cc: userEmail,
      to: email,
      subject,
      text,
      html
    }

    try {
      await transporter.sendMail(mailOptions)
      return true
    } catch(e) {
      return false
    }
  }

  async mergeFile(filePath, filehash, size) {
    const chunkDir = path.resolve(this.config.UPLOAD_DIR, filehash)
    let chunkNames = await fse.readdir(chunkDir)
    chunkNames.sort((a, b) => a.split('-')[1] - b.split('-')[1])
    const chunkPaths = chunkNames.map(cp => path.resolve(chunkDir, cp))
    await this.mergeChunks(chunkPaths, filePath, size)
  }
  async mergeChunks(chunkPaths, filePath, size) {
    const pipStream = (chunkPath, writeStream) => new Promise((resolve) => {
      const readStream = fse.createReadStream(chunkPath) // 读文件流
      readStream.pipe(writeStream) // 管道将读取的文件流入写入流
      readStream.on('end', () => {
        fse.unlinkSync(chunkPath) // 删除chunk块文件
        resolve()
      })
    })

    await Promise.all(chunkPaths.map((chunk, index) => {
      //pipStream(文件数据, 文件写入流) 将块文件合并
      pipStream(chunk, fse.createWriteStream(filePath, {
        start: index * size,
        end: (index + 1) * size
      }))
    }))
  }
}


module.exports = ToolService