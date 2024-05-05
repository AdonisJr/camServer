const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");

const findCrime = (req, res, next) => {
    const officer_id = req.body.officer_id;
    try {
        let sql = "SELECT * FROM crime_reported WHERE officer_id = ? AND validated = 0 ORDER BY created_at desc";
        db.query(sql, [officer_id], (err, rows) => {
            if (err) return console.log(err);
            req.crime_id = rows[0].id;
            next();
        })
    } catch (error) {
        console.log(`Server error controller/history/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
}
const findWanted = (req, res, next) => {
    const officer_id = req.body.officer_id;
    try {
        let sql = "SELECT * FROM person_of_concern WHERE officer_id = ? AND type = 'WANTED PERSON' ORDER BY created_at desc";
        db.query(sql, [officer_id], (err, rows) => {
            if (err) return console.log(err);
            req.person_id = rows[0].id;
            next();
        })
    } catch (error) {
        console.log(`Server error controller/history/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
}

router
    .route("/")
    .get((req, res) => {
        // const currentDate = new Date();
        // const formattedDate = currentDate.toISOString().slice(0, 10);
        const officer_id = req.query.officer_id;
        try {
            sql = "SELECT history.id, crime_reported.* FROM history INNER JOIN crime_reported ON history.crime_id = crime_reported.id INNER JOIN user ON history.officer_id = user.id WHERE history.officer_id = ?";

            db.query(sql, officer_id, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/crime/get: ${err}`);
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
            console.log(`Server error controller/crime/get: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(findCrime, async (req, res) => {

        const {
            officer_id,
        } = req.body;
        // const report_number = crypto.randomUUID().split("-")[4];

        const credentials = [
            req.crime_id,
            officer_id
        ];


        const sql = `INSERT INTO history (crime_id, officer_id) 
    values (?, ?)`;
        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/crime/post: ${err}`);
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
            console.log(`Server error controller/crime/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });

router.post('/wanted', findWanted, (req, res) => {
    const {
        officer_id,
        type
    } = req.body;
    // const report_number = crypto.randomUUID().split("-")[4];

    const credentials = [
        req.person_id,
        officer_id,
        type
    ];

    const sql = `INSERT INTO history (crime_id, officer_id, type) 
    values (?, ?, ?)`;
    try {
        db.query(sql, credentials, (err, rows) => {
            if (err) {
                console.log(`Server error controller/crime/post: ${err}`);
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
        console.log(`Server error controller/crime/post: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

module.exports = router;