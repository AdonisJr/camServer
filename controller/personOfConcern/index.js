const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const JWT = require("../../middleware/JWT");

const multer = require('multer');
const mimeTypes = require("mime-types");
const path = require('path');
const fs = require("fs");

// Set up storage for uploaded files
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'images/'); // specify the directory where you want to save the files
    },
    filename: function (req, file, cb) {
        cb(null, `${file.fieldname}-${Date.now()}${path.extname(file.originalname)}`);
    }
});
const upload = multer({
    storage: storage,
});

router
    .route("/")
    .get(JWT.verifyAccessToken, (req, res) => {
        let filter = req.query.filter || "";
        let keywords = req.query.keywords;
        const credentials = [
            filter,
            "%" + keywords + "%",
            filter,
            "%" + keywords + "%",
            filter,
            "%" + keywords + "%",
        ];

        try {
            let sql = "";
            sql = "SELECT * FROM person_of_concern WHERE type = ? AND first_name LIKE ? OR type = ? AND last_name LIKE ? OR type = ? AND last_known_address LIKE ?";


            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/officer/get: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/officer/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(upload.single('image'), async (req, res) => {
        const allowedImageMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            // Add more image MIME types if needed
        ];

        const filePath = req.file?.path || null;
        let imageBase64 = ""
        if (filePath) {
            imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        }

        const fileMimeType = req.file?.mimetype;
        const {
            first_name,
            middle_name,
            last_name,
            gender,
            last_known_address,
            type,
            alias,
            officer_id,
            height,
            weight
        } = req.body;
        const id = crypto.randomUUID().split("-")[4];

        // check the mimetype
        if (!allowedImageMimeTypes.includes(fileMimeType) && filePath) {
            // Delete the file if it's not the correct type
            fs.unlinkSync(filePath);

            return res
                .status(400)
                .json({ error: "Invalid file type. Only image files are allowed." });
        }

        // Respond with a success message

        const credentials = [
            id,
            first_name,
            middle_name,
            last_name,
            gender,
            last_known_address,
            type,
            alias,
            officer_id,
            height,
            weight
        ];
        let sql = "";
        if (!req.file) {
            sql = `INSERT INTO person_of_concern (id, first_name, middle_name, last_name, gender, last_known_address, type, alias, officer_id, weight, height) 
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
        } else {
            sql = `INSERT INTO person_of_concern (id, first_name, middle_name, last_name, gender, last_known_address, type, alias, officer_id, weight, height, url) 
            values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            credentials.push(imageBase64)
        }

        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/personOfConcern/post: ${err}`);
                    if (req.file) {
                        fs.unlinkSync(filePath);
                    }
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                if (req.file) {
                    fs.unlinkSync(filePath);
                }
                return res.status(200).json({
                    status: 200,
                    message: "Successfully created",
                    data: rows,
                });
            });
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(filePath);
            }
            console.log(`Server error controller/personOfConcern/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

// UPDATE AND DELETE API

router
    .route("")
    .put(upload.single('image'), async (req, res) => {
        const allowedImageMimeTypes = [
            "image/jpeg",
            "image/png",
            "image/gif",
            // Add more image MIME types if needed
        ];

        const filePath = req.file?.path || null;
        let imageBase64 = ""
        if (filePath) {
            imageBase64 = fs.readFileSync(filePath, { encoding: 'base64' });
        }

        const fileMimeType = req.file?.mimetype;
        const {
            first_name,
            last_name,
            gender,
            last_known_address,
            type,
            alias,
            officer_id,
            url,
            weight,
            height,
            middle_name,
            remarks,
            status
        } = req.body;
        const id = req.query.id;

        // check the mimetype
        if (!allowedImageMimeTypes.includes(fileMimeType) && filePath) {
            // Delete the file if it's not the correct type
            fs.unlinkSync(filePath);

            return res
                .status(400)
                .json({ error: "Invalid file type. Only image files are allowed." });
        }

        try {
            const credentials = [
                first_name,
                last_name,
                gender,
                last_known_address,
                type,
                alias,
                officer_id,
                middle_name,
                weight,
                height,
                remarks,
                status
            ];

            let sql = ""
            if (!req.file) {
                sql = `UPDATE person_of_concern SET first_name = ?, last_name = ?, gender = ?, last_known_address = ?, type = ?, alias = ?, officer_id = ?, middle_name = ?, weight = ?, height = ?, remarks = ?, status = ?
                    WHERE id = ?`;
                credentials.push(id)
            } else {
                sql = `UPDATE person_of_concern SET first_name = ?, last_name = ?, gender = ?, last_known_address = ?, type = ?, alias = ?, officer_id = ?, middle_name = ?, weight = ?, height = ?, remarks = ?, status = ?, url = ?
                    WHERE id = ?`;
                credentials.push(imageBase64, id)
            }

            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    if (req.file) {
                        fs.unlinkSync(filePath);
                    }
                    console.log(`Server error controller/personOfConcern/put: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                if (req.file) {
                    fs.unlinkSync(filePath);
                }
                return res.status(200).json({
                    status: 200,
                    message: "Successfully updated",
                    data: rows,
                });
            });
        } catch (error) {
            if (req.file) {
                fs.unlinkSync(filePath);
            }
            console.log(`Server error controller/personOfConcern/put: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .delete((req, res) => {
        const id = req.query.id;
        try {
            const sql = "DELETE FROM person_of_concern WHERE id = ?";
            db.query(sql, id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/personOfConcern/delete: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }
                return res.status(200).json({
                    status: 200,
                    message: "Successfully Deleted",
                    data: rows,
                });
            });
        } catch (error) {
            console.log(`Server error controller/personOfConcern/delete: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

module.exports = router;