const { Service } =require('egg')
const nodemailer = require('nodemailer')

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
}


module.exports = ToolService