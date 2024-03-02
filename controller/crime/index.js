const express = require("express");
const router = express.Router();
const db = require("../../utils/database");
const crypto = require("node:crypto");


router
    .route("/")
    .get((req, res) => {
        // const currentDate = new Date();
        // const formattedDate = currentDate.toISOString().slice(0, 10);

        try {
            sql = "SELECT * FROM crime_reported WHERE validated = 1 ORDER BY created_at desc";


            db.query(sql, (err, rows) => {
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
    .post(async (req, res) => {

        const {
            officer_id,
            region,
            province,
            city,
            barangay,
            type_place,
            date_reported,
            time_reported,
            date_committed,
            time_committed,
            stages_felony,
            offense,
            longitude,
            latitude,
        } = req.body;
        // const report_number = crypto.randomUUID().split("-")[4];
        const credentials = [
            officer_id,
            region,
            province,
            city,
            barangay,
            type_place,
            date_reported,
            time_reported,
            date_committed,
            time_committed,
            stages_felony,
            offense,
            "Under Investigation",
            longitude,
            latitude,
            0
        ];

        const sql = `INSERT INTO crime_reported (officer_id, region, province, city, barangay, type_place, date_reported, time_reported, date_committed, time_committed, stages_felony, offense, case_status, longitude, latitude, validated) 
    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
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

// UPDATE AND DELETE API

router
    .route("/")
    .put(async (req, res) => {
        const {
            barangay,
            type_place,
            date_reported,
            time_reported,
            date_committed,
            time_committed,
            stages_felony,
            offense,
            case_status,
            longitude,
            latitude,
            validated
        } = req.body;
        const id = req.query.id;
        console.log(id);
        try {
            const sql = `UPDATE crime_reported SET barangay = ?, type_place = ?, date_reported = ?, time_reported = ?,
                          date_committed = ?, time_committed = ?, stages_felony = ?, offense = ?, case_status = ?, longitude = ?, latitude = ?, validated = ?
             WHERE id = ?
    `;
            const credentials = [
                barangay,
                type_place,
                date_reported,
                time_reported,
                date_committed,
                time_committed,
                stages_felony,
                offense,
                case_status,
                longitude,
                latitude,
                validated,
                id
            ];

            db.query(sql, credentials, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/personOfConcern/put: ${err}`);
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
            const sql = "DELETE FROM crime_reported WHERE id = ?";
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
router.get("/countCases", (req, res) => {
    try {
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        sql = `WITH OffenseCounts AS (
            SELECT 
                barangay, 
                offense,
                COUNT(*) as count_per_barangay
            FROM crime_reported 
            GROUP BY barangay, offense
        )
        SELECT 
            oc.barangay, 
            oc.offense,
            oc.count_per_barangay,
            SUM(oc.count_per_barangay) OVER (PARTITION BY oc.barangay) as total_cases
        FROM OffenseCounts oc
        ORDER BY total_cases DESC, oc.barangay, oc.offense`


        db.query(sql, (err, rows) => {
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
router.get("/countPerYear", (req, res) => {
    try {
        sql = "SELECT YEAR(date_committed) AS extracted_year, count(*) AS total_cases FROM crime_reported WHERE YEAR(date_committed) is not null AND validated = 1 GROUP BY extracted_year ORDER BY extracted_year DESC";


        db.query(sql, (err, rows) => {
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
        console.log(`Server error controller/crime/countPerYear/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})
router.get("/caseStatus", (req, res) => {
    try {
        sql = "SELECT case_status, COUNT(*) as total FROM crime_reported WHERE case_status IN ('Solved', 'Cleared', 'Under Investigation') AND validated = 1 GROUP BY case_status;";


        db.query(sql, (err, rows) => {
            if (err) {
                console.log(`Server error controller/crime/caseStatus/get: ${err}`);
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
        console.log(`Server error controller/crime/caseStatus/get/: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})
router.get("/caseStatusPerYear", (req, res) => {
    try {
        sql = "SELECT validated, YEAR(date_committed) as year, SUM(CASE WHEN case_status = 'Solved' THEN 1 ELSE 0 END) AS solved, SUM(CASE WHEN case_status = 'Cleared' THEN 1 ELSE 0 END) AS cleared, SUM(CASE WHEN case_status = 'Under Investigation' THEN 1 ELSE 0 END) AS under_investigation FROM crime_reported WHERE YEAR(date_committed) is not null AND validated = true GROUP BY year";


        db.query(sql, (err, rows) => {
            if (err) {
                console.log(`Server error controller/crime/caseStatus/get: ${err}`);
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
        console.log(`Server error controller/crime/caseStatus/get/: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get("/reportedCrime", (req, res) => {
    const validated = req.query.validated;
    const q = req.query.q || "";
    const credentials = [
        validated,
        `%${q}%`,
        validated,
        `%${q}%`,
    ]
    try {
        let sql = "";
        if (!q) {
            sql = "SELECT crime_reported.*, user.first_name, user.last_name FROM crime_reported INNER JOIN user ON user.id = crime_reported.officer_id WHERE validated = ? ORDER BY crime_reported.created_at desc";

        } else {
            sql = "SELECT crime_reported.*, user.first_name, user.last_name FROM crime_reported INNER JOIN user ON user.id = crime_reported.officer_id WHERE validated = ? AND offense LIKE ? OR  validated = ? AND barangay LIKE ?  ORDER BY crime_reported.created_at desc";

        }
        db.query(sql, credentials, (err, rows) => {
            if (err) {
                console.log(`Server error controller/reportedCrime/get: ${err}`);
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
        console.log(`Server error controller/reportedCrime/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get("/countCasesPerBrgy", (req, res) => {
    try {
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        sql = `SELECT barangay, COUNT(*) as total_cases
        FROM crime_reported 
        GROUP BY barangay
        ORDER BY total_cases DESC, barangay`


        db.query(sql, (err, rows) => {
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

router.get("/all", (req, res) => {

    const page = parseInt(req.query.page) || 1; // default page is 1
    const limit = parseInt(req.query.limit) || 10; // default limit is 10
    const q = req.query.q || null;
    const offense = req.query.offense || 'CLEAR';
    const barangay = req.query.barangay || 'CLEAR';
    const year = req.query.year || 'CLEAR';

    try {
        const offset = (page - 1) * limit;
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        let sql = `SELECT COUNT(*) as totalCount FROM crime_reported WHERE validated = 1`
        const params1 = [];
        
        if (offense !== 'CLEAR') {
            sql += ' AND offense = ?'
            params1.push(offense)
        }
        if (barangay !== 'CLEAR') {
            sql += ' AND barangay = ?'
            params1.push(barangay)
        }
        if (year !== 'CLEAR') {
            sql += ' AND YEAR(date_committed) = ?'
            params1.push(year)
        }
        

        db.query(sql, params1, (err, countResult) => {
            if (err) {
                console.log(`Server error controller/crime/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            const totalCount = countResult[0].totalCount

            const params2 = [];

            sql = `SELECT * FROM crime_reported WHERE validated = 1`
            
            if (offense !== 'CLEAR') {
                sql += ' AND offense = ?'
                params2.push(offense)
            }
            if (barangay !== 'CLEAR') {
                sql += ' AND barangay = ?'
                params2.push(barangay)
            }
            if (year !== 'CLEAR') {
                sql += ' AND YEAR(date_committed) = ?'
                params2.push(year)
            }

            sql += " ORDER BY id DESC LIMIT ? OFFSET ?"
            params2.push(limit, offset);

            db.query(sql, params2, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/farm/list/get data: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                    totalCount: totalCount // Include total count in the response
                });
            })


        });
    } catch (error) {
        console.log(`Server error controller/crime/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

router.get("/index", (req, res) => {

    const page = parseInt(req.query.page) || 1; // default page is 1
    const limit = parseInt(req.query.limit) || 10; // default limit is 10
    const isIndex = req.query.isIndex;
    const q = req.query.q || null;
    const offense = req.query.offense || 'CLEAR';
    const barangay = req.query.barangay || 'CLEAR';
    const year = req.query.year || 'CLEAR';

    try {
        const offset = (page - 1) * limit;
        // sql = "SELECT barangay, COUNT(*) as total_cases FROM crime_reported WHERE validated = 1 GROUP BY barangay ORDER BY total_cases DESC";
        let sql = ""
        
        if(isIndex == 'true'){
            sql = `SELECT COUNT(*) as totalCount
            FROM crime_reported
            WHERE validated = 1
              AND (offense LIKE '%Murder%' 
               OR offense LIKE '%Homicide%' 
               OR offense LIKE '%Physical Injury%' 
               OR offense LIKE '%Rape%' 
               OR offense LIKE '%Robbery%' 
               OR offense LIKE '%Theft%' 
               OR offense LIKE '%Carnapping%')`
        }else{
            sql = `SELECT COUNT(*) as totalCount
            FROM crime_reported
            WHERE validated = 1
              AND (offense NOT LIKE '%Murder%' 
               AND offense NOT LIKE '%Homicide%' 
               AND offense NOT LIKE '%Physical Injury%' 
               AND offense NOT LIKE '%Rape%' 
               AND offense NOT LIKE '%Robbery%' 
               AND offense NOT LIKE '%Theft%' 
               AND offense NOT LIKE '%Carnapping%')`
        }

        const params1 = [];
        

        db.query(sql, params1, (err, countResult) => {
            if (err) {
                console.log(`Server error controller/crime/get: ${err}`);
                return res.status(500).json({
                    status: 500,
                    message: `Internal Server Error, ${err}`,
                });
            }

            const totalCount = countResult[0].totalCount

            const params2 = [];

            if(isIndex == 'true'){
                sql = `SELECT *
                FROM crime_reported
                WHERE validated = 1
                  AND (offense LIKE '%Murder%' 
                   OR offense LIKE '%Homicide%' 
                   OR offense LIKE '%Physical Injury%' 
                   OR offense LIKE '%Rape%' 
                   OR offense LIKE '%Robbery%' 
                   OR offense LIKE '%Theft%' 
                   OR offense LIKE '%Carnapping%')`
            }else{
                sql = `SELECT *
                FROM crime_reported
                WHERE validated = 1
                  AND (offense NOT LIKE '%Murder%' 
                   AND offense NOT LIKE '%Homicide%' 
                   AND offense NOT LIKE '%Physical Injury%' 
                   AND offense NOT LIKE '%Rape%' 
                   AND offense NOT LIKE '%Robbery%' 
                   AND offense NOT LIKE '%Theft%' 
                   AND offense NOT LIKE '%Carnapping%')`
            }

            sql += " ORDER BY id DESC LIMIT ? OFFSET ?"
            params2.push(limit, offset);

            db.query(sql, params2, (err, rows) => {
                if (err) {
                    console.log(`Server error controller/farm/list/get data: ${err}`);
                    return res.status(500).json({
                        status: 500,
                        message: `Internal Server Error, ${err}`,
                    });
                }

                // return res.status(200).json({
                //     status: 200,
                //     message: `Successfully retrieved ${rows.length} record/s`,
                //     data: rows,
                //     totalCount: totalCount // Include total count in the response
                // });
                return res.status(200).json({
                    status: 200,
                    message: `Successfully retrieved ${rows.length} record/s`,
                    data: rows,
                    totalCount: totalCount
                });
            })


        });
    } catch (error) {
        console.log(`Server error controller/crime/get: ${error}`);
        res.status(500).json({
            status: 500,
            message: `Internal Server Error, ${error}`,
        });
    }
})

module.exports = router;