const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT = require("../../middleware/JWT");

// GET ALL AND INSERT OFFICER

const findEmail = (req, res, next) => {
    const email = req.body.email;

    try {
        let sql = "SELECt * FROM user WHERE email = ?";
        db.query(sql, email, (err, rows) => {
            if (err) {
                console.log(`Server error controller/findEmail: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }
            if (rows.length !== 0) return res.status(401).json({
                status: 401,
                message: `Email already exist.`,
            });
            next();
        })
    } catch (error) {
        console.log(`Server error controller/findEmail/ ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
}

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        const id = req.query.id || "";
        try {
            let sql = "";
            if (id) {
                sql = "SELECT * FROM user WHERE id = ?";
            } else {
                sql = "SELECT * FROM user WHERE role = 'user'";
            }

            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/get: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                const result = {
                    id: rows[0].id,
                    first_name: rows[0].first_name,
                    last_name: rows[0].last_name,
                    email: rows[0].email,
                    ranks: rows[0].ranks,
                    phone_number: rows[0].phone_number,
                    role: rows[0].role,
                    birth_date: rows[0].birth_date,
                    address: rows[0].address
                }
                if (id) return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                });

                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(findEmail, async (req, res) => {
        const { first_name, last_name, email, password, ranks, phone_number, role } =
            req.body;
        const id = crypto.randomUUID().split("-")[4];
        const hashedPassword = await bcrypt.hash(password, 13);

        const credentials = [
            id,
            first_name,
            last_name,
            email,
            hashedPassword,
            phone_number,
            role,
        ];

        const sql = `INSERT INTO user (id, first_name, last_name, email, password, phone_number, role) 
    values (?, ?, ?, ?, ?, ?, ?)`;
        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/post: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "Successfully created",
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

// UPDATE AND DELETE API

router
    .route("/")
    .put(async (req, res) => {
        const { first_name, last_name, birth_date, address, phone_number, role, password, activate } = req.body;
        const id = req.query.id;
        try {
            const sql = `UPDATE user SET first_name = ?, last_name = ?, birth_date = ?, address = ?, activate = ?, phone_number = ?, role = ?
       WHERE id = ?
      `;

            const credentials = [
                first_name,
                last_name,
                birth_date,
                address,
                activate,
                phone_number,
                role,
                id,
            ];
            
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/put: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: "Successfully updated",
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/user/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete(JWT.verifyAccessToken, (req, res) => {
        const id = req.params.id;
        try {
            const sql = 'DELETE FROM user WHERE id = ?';
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/user/delete: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: 'Successfully Deleted',
                    data: rows
                })
            })
        } catch (error) {
            console.log(`Server error controller/user/delete: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

module.exports = router;