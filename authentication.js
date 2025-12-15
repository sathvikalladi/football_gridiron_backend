import express from "express";
import bcrypt from "bcrypt";
import db from "./db.js";

const saltRounds = 10;
const router = express.Router();

router.get("/", (req, res) => {
    res.render("login-page.ejs");
});

router.get("/registration", (req, res) => {
    res.render("registration.ejs");
});

router.post("/home", async (req, res) => {
    const actionType = req.body["actionType"];
    const name = req.body["name"];
    const password = req.body["password"];
    const result = await db.query(
        "SELECT * FROM users WHERE name = $1",
        [name]
    );

    if(actionType === "login") {
        if(result.rows.length > 0) {
            const storedHashPassword = result.rows[0].password;
            bcrypt.compare(password, storedHashPassword, (err, checkResult) => {
                if(err) {
                    console.log(err);
                }
                else {
                    if(checkResult) {
                        res.render("home-page.ejs");
                    }
                    else {
                        res.send("Incorrect password.");
                    }
                }
            });
        }
        else {
            res.send("Name not found.");
        }
    }

    if(actionType === "register") {

        if(result.rows.length > 0) {
            res.send("Name already in use.");
        }
        else {
            bcrypt.hash(password, saltRounds, async (err, hash) => {
                if(err) {
                    console.log(err);
                }
                else {
                    const addPassword = await db.query(
                        "INSERT INTO users (name, password) VALUES ($1, $2)",
                        [name, hash]
                    );
                }
            });

            res.render("home-page.ejs");
        }
    }
});


export default router;