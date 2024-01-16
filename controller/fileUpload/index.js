const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");
const xlsx = require("xlsx");
const multer = require("multer");
const mimeTypes = require("mime-types");
const path = require("path");
const fs = require("fs");

const storage = multer.memoryStorage({
    destination: function(req, file, cb) {
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
router.route("/").post(upload.single("file"), async(req, res) => {
    const officer_id = req.query["id"];
    const allowedMimeTypes = [
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];


    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded." });
    }
    if (!allowedMimeTypes.includes(mimeTypes.lookup(req.file.originalname))) {
        // Delete the file if it's not the correct type
        fs.unlinkSync(req.file.path);

        return res
            .status(400)
            .json({ error: "Invalid file type. Only XLSX files are allowed." });
    }

    try {
        // Check if the file MIME type is XLSX

        const buffer = req.file.buffer;
        const workbook = xlsx.read(buffer, { type: "buffer" });
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        const data = xlsx.utils.sheet_to_json(sheet);
        data.map((row) => {
            const credentials = [
                officer_id,
                row[Object.keys(row)[0]],
                row[Object.keys(row)[1]],
                row[Object.keys(row)[2]],
                row[Object.keys(row)[3]],
                row[Object.keys(row)[4]],
                row[Object.keys(row)[5]],
                row[Object.keys(row)[6]],
                row[Object.keys(row)[7]],
                row[Object.keys(row)[8]],
                row[Object.keys(row)[9]],
                row[Object.keys(row)[10]],
                row[Object.keys(row)[11]],
                row[Object.keys(row)[12]],
                1,
            ];
            const sql = `INSERT INTO crime_reported (officer_id, province, city, barangay, type_place, date_reported, time_reported, date_committed, time_committed, stages_felony, offense, case_status, latitude, longitude, validated)
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    return console.log(`Server error controller/crime/post: ${err}`);

                }

            });
        });
        return res.status(200).json({
            status: 200,
            message: `Successfully saved (${data.length}) items.`,
        });
    } catch (error) {
        console.log(`Server error controller/crime/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }

    // for (const row of data) {
    //     // Construct the INSERT query dynamically based on the row data
    //     const columns = Object.keys(row).join(', ');
    //     const values = Object.values(row).map(value => connection.escape(value)).join(', ');
    //     // const insertQuery = `INSERT INTO your_table_name (${columns}) VALUES (${values})`;

    //     // // Execute the INSERT query
    //     // await connection.query(insertQuery);
    //     console.log(data[row])
    // }

    //     console.log(credentials)
});

module.exports = router;