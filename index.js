import express from "express";
import bodyParser from "body-parser";
import db from "./db.js";
import authenticationRoutes from "./authentication.js";
import kittleRoutes from "./kittle.js";

const app = express();
const port = 3000;
let DRAFT_POOL = [];
const USER_ROSTER = [];

db.connect();

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.use(express.static("public"));

//load draft pool:
async function loadDraftPool() {
    try {
        const result = await db.query('SELECT pid, name, position, team FROM player_list');
        DRAFT_POOL = result.rows.map(player => ({
            ...player,
            isDrafted: false
        }));
        console.log("Draft pool loaded:", DRAFT_POOL.length, "players");
    } catch (err) {
        console.error("Failed to load draft pool:", err);
    }
}
await loadDraftPool();
//

app.use("/", authenticationRoutes);

app.use("/", kittleRoutes);

app.get("/dashboard", (req, res) => {
    const noOfPlayers = USER_ROSTER.length;
    res.render("dashboard.ejs", {
        myRoster: USER_ROSTER,
        playerCount: noOfPlayers
    });
});

//filter players by position(convert to frontend process):
async function getFilteredDraftPool(query) {
    const filterPosition = query.position; 
    console.log(DRAFT_POOL);
    let filteredDraftPool = DRAFT_POOL;
    let currentFilter = "All positions";

    if (filterPosition && filterPosition !== "ALL") {
        filteredDraftPool = DRAFT_POOL.filter(player => player.position === filterPosition);
        currentFilter = filterPosition;
    }

    return { filteredDraftPool, currentFilter };
}

app.get("/draft", async(req, res) => {
    const { filteredDraftPool, currentFilter } = await getFilteredDraftPool(req.query);
    const noOfPlayers = USER_ROSTER.length;
    const percentComplete = USER_ROSTER.length * 10;

    res.render("draft-page.ejs", {
        draftPool: filteredDraftPool,
        myRoster: USER_ROSTER,
        currentFilter: currentFilter,
        barPercentComplete: percentComplete,
        playerCount: noOfPlayers
    });
});

app.post("/draft", async (req, res) => {

    const playerId = req.body.playerID;
    const actionType = req.body.actionType;

    try {
        if (actionType === "draft") {
            for (let i = 0; i < DRAFT_POOL.length; i++) {
                if (playerId === DRAFT_POOL[i].pid) {
                    const player = DRAFT_POOL[i];
    
                    if (!player.isDrafted) {
                        USER_ROSTER.push({
                            id: player.pid,
                            name: player.name,
                            position: player.position,
                            team: player.team
                        });
                        player.isDrafted = true;
                        console.log(USER_ROSTER);
                    }
                    break;
                }
            }
        } 
        else if (actionType === "undraft") {
            for (let i = 0; i < USER_ROSTER.length; i++) {
                if (playerId === USER_ROSTER[i].id) {
                    USER_ROSTER.splice(i, 1);
                    i--;
                }
            }
    
            for (let i = 0; i < DRAFT_POOL.length; i++) {
                if (playerId === DRAFT_POOL[i].pid) {
                    const player = DRAFT_POOL[i];
                    player.isDrafted = false;
                    break;
                }
            }
        }
    
        const noOfPlayers = USER_ROSTER.length;
        const percentComplete = noOfPlayers * 10;
    
        res.render("draft-page.ejs", {
            draftPool: DRAFT_POOL,
            myRoster: USER_ROSTER,
            barPercentComplete: percentComplete,
            playerCount: noOfPlayers
        });

    } catch(err) {
        console.error('Error:', err);
        res.status(500).send('Error loading players');
    }
});

app.get("/leaderboard", (req, res) => {
    res.render("leaderboard-page.ejs");
});

//kittle:
app.get("/kittle", (req, res) => {
    res.render("kittle.ejs", {
        draftPool: DRAFT_POOL
    });
});

app.listen(port, () => {
    console.log(`Currently listening on port ${port}.`);
});