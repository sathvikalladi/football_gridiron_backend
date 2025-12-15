import db from "./db.js";

async function main() {
    db.connect();

    const todays_date = new Date();
    const todays_pid = await getTodaysDatePID();

    await db.query(
        "INSERT INTO todays_player (pid, date) VALUES ($1, $2)",
        [todays_pid, todays_date]
    );

    async function getTodaysDatePID() {
        let pid = -1;
        const previous_pids = await fetchPreviousPIDS(new Date());
        while(true) {
            pid = await generateRandomPID();
            if(validatePIDS(pid, previous_pids)) {
                break;
            } 
        }
        return pid;
    }

    async function generateRandomPID() {
        const numberOfPlayers = await db.query(
            "SELECT count(*) FROM player_list"
        );

        const random_pid = (Math.random() * numberOfPlayers) + 1;
        
        return random_pid;
    }

    async function fetchPreviousPIDS(todays_date) {
        const yesterdays_date = todays_date;
        yesterdays_date.setDate(todays_date.getDate() - 1);
        const day_before_yesterdays_date = todays_date;
        day_before_yesterdays_date.setDate(todays_date.getDate() - 2);

        const yesterdays_date_obj = formatDateISO(yesterdays_date);
        const day_before_yesterdays_date_obj = formatDateISO(day_before_yesterdays_date);

        const previous_pids = await db.query(
            "SELECT pid FROM todays_player WHERE date IN ($1, $2)",
            [yesterdays_date_obj, day_before_yesterdays_date_obj]
        );

        return res.rows.map(r => r.pid);
    }

    function validatePIDS(pid, previous_pids) {
        if(pid === previous_pids[0] || pid === previous_pids[1]) {
            return false;
        }
        else {
            return true;
        }
    }

    const formatDateISO = (date) => {
        return date.toISOString().split('T')[0]; 
    };

}


main();