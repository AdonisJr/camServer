const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");


const findWanted = (req, res, next) => {
    const officer_id = req.body.officer_id;
    const type = req.body.type;
    try {
        let sql = "";
        if (type === 'wanted') {
            sql = "SELECT * FROM person_of_concern WHERE officer_id = ? AND type = 'WANTED PERSON' ORDER BY created_at desc";

        } else {
            sql = "SELECT * FROM person_of_concern WHERE officer_id = ? AND type = 'MISSING PERSON' ORDER BY created_at desc";

        }
        db.query(sql, officer_id, (err, rows) => {
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
        const type = req.query.type;
        try {
            sql = `SELECT person_history.person_id, person_history.officer_id, person_history.type, person_of_concern.* FROM person_history 
            INNER JOIN person_of_concern ON person_history.person_id = person_of_concern.id 
            WHERE person_history.officer_id = ? AND person_history.type = ? ORDER BY person_of_concern.created_at DESC, person_of_concern.updated_at DESC
            `;

            db.query(sql, [officer_id, type], (err, rows) => {
                if (err) {
                    console.log(`Server error controller/personHistory/get: ${err}`);
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
            console.log(`Server error controller/personHistory/get: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    })
    .post(findWanted, async (req, res) => {

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


        const sql = `INSERT INTO person_history (person_id, officer_id, type) 
    values (?, ?, ?)`;
        try {
            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/personHistory/post: ${err}`);
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
            console.log(`Server error controller/personHistory/post: ${error}`);
            res.status(500).json({
                status: 500,
                message: `Internal Server Error, ${error}`,
            });
        }
    });


module.exports = router;