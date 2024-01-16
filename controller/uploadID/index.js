const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");
const xlsx = require("xlsx");
const multer = require("multer");
const mimeTypes = require("mime-types");
const path = require("path");
const fs = require("fs");

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, "./uploads");
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
        cb(
            null,
            file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
        );
    },
});
const upload = multer({
    storage: storage,
});
router.route("/").post(upload.single("file"), async (req, res) => {
    const email = req.query.email;
    const path = req.file.path;
    const imageBase64 = fs.readFileSync(path, { encoding: 'base64' });
    const allowedFileTypes = ['image/jpeg', 'image/png', 'image/jpg'];

    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }

    if (!allowedFileTypes.includes(mimeTypes.lookup(req.file.originalname))) {
        // Delete the file if it's not the correct type
        fs.unlinkSync(req.file.path);

        return res
            .status(400)
            .json({ error: "Invalid file type." });
    }

    try {
        // Check if the file MIME type is XLSX
        const credentials = [imageBase64, email];

        const sql = `UPDATE user SET url = ? WHERE email = ?`;
        db.query(sql, credentials, (err, rows) => {
            if (err) {
                console.log(`Server error controller/uploadID/post: ${err}`)
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                })

            }
            return res.status(200).json({
                message: "Successfully Uploaded",
                data: imageBase64
            })
        });

    } catch (error) {
        console.log(`Server error controller/crime/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
});

module.exports = router;