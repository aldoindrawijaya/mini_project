const { db, query } = require("../database");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("../helpers/nodeMailer");
const Mail = require("nodemailer/lib/mailer");

module.exports = {
  register: async (req, res) => {
    const { username, email, phone, password, store_name } = req.body;

    let getEmailQuery = `SELECT * FROM user WHERE email=${db.escape(email)}`;
    let isEmailExist = await query(getEmailQuery);
    if (isEmailExist.length > 0) {
      return res.status(200).send({ message: "Email has been used" });
    }

    const salt = await bcrypt.genSalt(10);
    const hashPassword = await bcrypt.hash(password, salt);

    let addUserQuery = `INSERT INTO user VALUES (null, ${db.escape(
      username
    )}, ${db.escape(email)}, ${db.escape(phone)},${db.escape(
      hashPassword
    )}, ${db.escape(store_name)} )`;

    let addUserResult = await query(addUserQuery);

    let payload = { id: addUserResult.insertId };
    const token = jwt.sign(payload, "joe", { expiresIn: "4h" });

    let mail = {
      from: `Admin <aldoindrawijaya11@gmail.com>`,
      to: `${email}`,
      subject: `Verfied your account`,
      html: `
      <div>
      <p>Thanks for register, you need to activate your account,</p>
      <a href="http://localhost:3000/verification/${token}">Click Here</a>
      <span>to activate</span>
      </div>
      `,
    };
    let response = await nodemailer.sendMail(mail);

    return res
      .status(200)
      .send({ data: addUserResult, message: "Register success" });
  },

  login: async (req, res) => {
    try {
      const { email, password } = req.body;
      const isEmailExist = await query(
        `SELECT * FROM user WHERE email=${db.escape(email)}`
      );
      if (isEmailExist.length == 0) {
        return res
          .status(200)
          .send({ message: "Email or Password is Invalid", success: false });
      }
      //   if (!isEmailExist[0].isActive) {
      //     return res
      //       .status(200)
      //       .send({ message: "Please Verified your account  ", success: false });
      //   }

      const isValid = await bcrypt.compare(password, isEmailExist[0].password);

      if (!isValid) {
        return res
          .status(200)
          .send({ message: "Email or Password is incorrect", success: false });
      }

      let payload = {
        id: isEmailExist[0].id_users,
      };

      const token = jwt.sign(payload, "joe", { expiresIn: "1h" });

      return res.status(200).send({
        message: "Login Success",
        token,
        data: {
          id: isEmailExist[0].id_users,
          username: isEmailExist[0].username,
          email: isEmailExist[0].email,
          phone: isEmailExist[0].phone,
          store_name: isEmailExist[0].store_name,
        },
        success: true,
      });
    } catch (error) {
      res.status(error.status || 500).send(error);
    }
  },
};
