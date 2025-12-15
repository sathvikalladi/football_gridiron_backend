import express from "express";
import db from "./db.js";

const router = express.Router();
const todays_date = formatDateISO(new Date());

router.get("/kittle", async (req, res) => {
    const result = await db.query(
        "SELECT name FROM player_list"
    );
    return res.json(result);
});

router.post("/kittle", async (req, res) => {
    const userGuess = req.body["userGuess"];
    let attempts = req.body["attempts"];
    const name = req.body["name"];

    const response = {};
    if(attempts === 5) {
        response["gameStatus"] = "failed";
        try {
            await db.query(
                "INSERT INTO user_kittle_history (name, date, attempts, success) VALUES ($1, $2, NULL, false)",
                [name, todays_date]
            );
            return res.send(response);
        } catch(error) {
            console.log(error);
        }
    }

    let guessedPlayer = {};
    try {
        guessedPlayer = await db.query(
          "SELECT * FROM player_list WHERE LOWER(name) = $1",
          [userGuess.toLowerCase()]
        );
        //fix error handling:
    } catch (error) {
        console.error("Database error while fetching player:", error);
        return res.status(404).json({ error: "Player searched for doesn't exist" });
    }

    const currentDate = formatDateISO(new Date());
    const todaysPlayerPID = await db.query(
        "SELECT pid FROM todays_player WHERE date = $1",
        [currentDate]
    );
    const todaysPlayer = await db.query(
        "SELECT * FROM player_list WHERE pid = $1",
        [todaysPlayerPID.rows[0].pid]
    ); 

    const comparisionTypes = await db.query(
        "SELECT * FROM comparisions"
    );

    if(guessedPlayer.rows[0]?.pid === todaysPlayer.rows[0]?.pid) {
        for(const comp of comparisionTypes.rows) {
            const compName = comp.attribute_name;
            response[compName] = "correct";
        }
        attempts += 1;
        response["attempts"] = attempts;
        response["gameStatus"] = "successful";
        try {
            await db.query(
                "INSERT INTO user_kittle_history (name, date, attempts, success) VALUES ($1, $2, $3, true)",
                [name,formatDateISO(new Date()), attempts]
            );
            return res.json(response);
        } catch(error) {
            console.log(error);
        }
    }

    for(const comp of comparisionTypes.rows) {
        const compName = comp.attribute_name;
        const compType = comp.comparision_type;
        const value = guessedPlayer.rows[0][compName];
        const todaysValue = todaysPlayer.rows[0][compName];

        if (value === undefined || todaysValue === undefined) {
            response[compName] = "N/A";
            continue;
        }

        if(compType === 'boolean') {
            if(value === todaysValue) {
                response[compName] = "correct";
            }
            else {
                response[compName] = "incorrect";
            }

        } else if(compType === 'number') {
            if(value === todaysValue) {
                response[compName] = "correct";
            }
            else if(Math.abs(value - todaysValue) <= 2) {
                response[compName] = "close";
            }
            else {
                response[compName] = "incorrect";
            }
        }
    }

    attempts += 1;
    response["attempts"] = attempts;
    response["gameStatus"] = "continue";
    return res.json(response);
});

const formatDateISO = (date) => {
    return date.toISOString().split('T')[0]; 
};


export default router;