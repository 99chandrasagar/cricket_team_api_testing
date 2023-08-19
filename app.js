const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const intitalizeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3002, () => {
      console.log("Server Running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`Database Error ${e.message}`);
    process.exit(1);
  }
};

intitalizeDBAndServer();

const convertDBobjectToResponseobject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

//get players list
app.get("/players/", async (request, response) => {
  const playerListQuery = `
    select
    *
    from 
    cricket_team; `;
  const list = await db.all(playerListQuery);
  response.send(
    list.map((eachplayer) => convertDBobjectToResponseobject(eachplayer))
  );
});

//create new player post
app.post("/players/", async (request, response) => {
  const player_details = request.body;

  console.log(player_details);
  const { playerName, jerseyNumber, role } = player_details;
  const addplayerQuery = `
    insert into
    cricket_team
    (player_name, jersey_number, role)
    values 
    (
        '${playerName}',
        ${jerseyNumber},
        '${role}'
    );`;
  const query = await db.run(addplayerQuery);
  response.send("Player Added to Team");
});

//get players by ID
app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getQuery = `
  select
  * 
  from 
  cricket_team
    where 
    player_id = ${playerId};`;

  const eachprofile = await db.get(getQuery);

  response.send(convertDBobjectToResponseobject(eachprofile));
});

//PUT Updates the details of a player
app.put("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updateQuery = `
    update cricket_team
    set 
        player_name = '${playerName}',
        jersey_number = ${jerseyNumber},
        role = '${role}'
    where player_id = ${playerId};`;
  await db.run(updateQuery);
  response.send("Player Details Updated");
});

//Deletes a player from the team
app.delete("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    delete from cricket_team 
    where
    player_id = ${playerId};`;

  await db.run(deleteQuery);

  response.send("Player Removed");
});

module.exports = app;
