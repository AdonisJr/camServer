const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

router
    .route("/")
    .get((req, res) => {

        const { id } = req.params;
        res.status(200).json({ message: 'wewew', id: id })

    })
    .post((req, res) => {
        const { email, password } = req.body;
        console.log(email, password)
        try {
            const sql = "SELECT * FROM user where email = ?";
            db.query(sql, email, async(err, rows) => {
                if (err)
                    return res.status(500).json({
                        status: 500,
                        error: "Internal Server Error",
                        message: "Server Error, Please try again" + err,
                    });

                if (rows.length === 0)
                    return res.status(400).json({
                        status: 400,
                        error: "Email not found",
                        message: "The provided email address does not exist in our system.",
                    });

                const isPasswordValid = await bcrypt.compare(
                    password,
                    rows[0].password
                );

                if (!isPasswordValid)
                    return res.status(401).json({
                        status: 401,
                        error: "Invalid credentials",
                        message: "The provided password is incorrect.",
                    });

                if(rows[0].activate === 0) return res.status(401).json({
                    status: 401,
                    error: "Invalid",
                    message : "Your account is not yet activated, please contact administrator."
                })
                // if (rows[0].role !== "admin")
                //   return res.status(403).json({
                //     status: 403,
                //     error: "Permission denied",
                //     message:
                //       "You do not have administrative privileges to perform this action.",
                //   });

                const result = {
                    id: rows[0].id
                        // first_name: rows[0].first_name,
                        // last_name: rows[0].last_name,
                        // email: rows[0].email,
                        // ranks: rows[0].ranks,
                        // phone_number: rows[0].phone_number,
                };

                const accessToken = await JWT.getAccessToken(result);

                return res.status(200).json({ status: 200, message: "Access Granted", data: accessToken });
            });
        } catch (error) {
            console.log(`Error: controller/auth/post${error}`);
            return res.status(500).json({
                error: "Internal server error",
                message: "An unexpected error occurred while processing your request. Please try again later.",
            });
        }
    });

module.exports = router;