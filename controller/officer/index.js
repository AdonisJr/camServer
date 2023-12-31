const express = require("express");
const router = express.Router();
const crypto = require("node:crypto");
const db = require("../../utils/database");
const bcrypt = require("bcrypt");
const JWT  = require("../../middleware/JWT");

// GET ALL AND INSERT OFFICER

router
  .route("/")
  .get( JWT.verifyAccessToken, (req, res) => {
    const id = req.query.id || "";
    try {
      let sql = "";
      if (id) {
        sql = "SELECT * FROM officer WHERE id = ?";
      } else {
        sql = "SELECT * FROM officer";
      }

      db.query(sql, id, (err, rows) => {
        if (err) {
          console.log(`Server error controller/personOfConcern/get: ${err}`);
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

        return res.status(200).json({
          status: 200,
          message: `Successfully retrieved ${rows.length} record/s`,
          data: result,
        });
      });
    } catch (error) {
      console.log(`Server error controller/personOfConcern/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  })
  .post( JWT.verifyAccessToken, async(req, res) => {
    const { first_name, last_name, email, password, rank, phone_number, role } =
      req.body;
    const id = crypto.randomUUID().split("-")[4];
    const hashedPassword = await bcrypt.hash(password, 13);

    const credentials = [
      id,
      first_name,
      last_name,
      email,
      hashedPassword,
      rank,
      phone_number,
      role,
    ];

    const sql = `INSERT INTO officer (id, first_name, last_name, email, password, ranks, phone_number) 
    values (?, ?, ?, ?, ?, ?, ?)`;
    try {
      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/officer/post: ${err}`);
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
      console.log(`Server error controller/officer/post: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  });

  // UPDATE AND DELETE API

router
  .route("/:id")
  .put( JWT.verifyAccessToken, async (req, res) => {
    const { first_name, last_name, ranks, phone_number, role, password } = req.body;
    const id = req.params.id;
    try {
      const sql = `UPDATE officer SET first_name = ?, last_name = ?, ranks = ?, phone_number = ?, role = ?, password = ?
       WHERE id = ?
      `;
      const hashedPassword = await bcrypt.hash(password, 13);

      const credentials = [
        first_name,
        last_name,
        ranks,
        phone_number,
        role,
        hashedPassword,
        id,
      ];

      db.query(sql, credentials, (err, rows) => {
        if (err) {
          console.log(`Server error controller/officer/put: ${err}`);
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
      console.log(`Server error controller/officer/put: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  })
  .delete( JWT.verifyAccessToken, (req, res) => {
    const id = req.params.id;
    try {
      const sql = 'DELETE FROM officer WHERE id = ?';
      db.query(sql, id, ( err, rows ) => {
        if(err){
          console.log(`Server error controller/officer/delete: ${err}`);
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
      console.log(`Server error controller/officer/delete: ${error}`);
      res.status(500).json({
        status: 500,
        message: `Internal Server Error, ${error}`,
      });
    }
  });

module.exports = router;
