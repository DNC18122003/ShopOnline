const transporter = require("../configs/mail.config");

const sendMail = async (to, subject, html) => {
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to,
    subject,
    html,
  });
};

module.exports = { sendMail };
/*
Vì sao đặt ở service?

Có thể tái sử dụng cho reset password

Có thể thêm logic retry

Có thể thay đổi sang SendGrid sau này
*/
