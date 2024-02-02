const express = require('express')
const app = express()
app.use(express.json())
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')
let db = null
const dbpath = path.join(__dirname, 'cricketMatchDetails.db')
const makeconnection = async () => {
  try {
    db = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000)
  } catch (e) {
    console.log(e.message)
    process.exit(1)
  }
}
makeconnection()
const convertsnaketocamelp = dbobject => {
  return {
    playerId: dbobject.player_id,
    playerName: dbobject.player_name,
  }
}
const convertsnaketocamelm = dbobject => {
  return {
    matchId: dbobject.match_id,
    match: dbobject.match,
    year: dbobject.year,
  }
}
app.get('/players/', async (request, response) => {
  const dbquery = `select * from player_details order by player_id;`
  const dbresposne = await db.all(dbquery)
  response.send(dbresposne.map(eachplayer => convertsnaketocamelp(eachplayer)))
})
app.get('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const dbquery = `select * from player_details where player_id=${playerId};`
  const dbresposne = await db.get(dbquery)
  response.send(convertsnaketocamelp(dbresposne))
})
app.put('/players/:playerId/', async (request, response) => {
  const {playerId} = request.params
  const deets = request.body
  const {playerName} = deets
  const dbquery = `update player_details set player_name='${playerName}' where player_id=${playerId} ;`
  const dbresposne = await db.run(dbquery)
  response.send('Player Details Updated')
})
app.get('/matches/:matchId/', async (request, response) => {
  const {matchId} = request.params
  const dbquery = `select * from match_details where match_id=${matchId};`
  const dbresponse = await db.get(dbquery)
  response.send(convertsnaketocamelm(dbresponse))
})
app.get('/players/:playerId/matches', async (request, response) => {
  const {playerId} = request.params
  const dbquery = `select match_details.match_id,match_details.match,match_details.year from match_details inner join player_match_score on match_details.match_id=player_match_score.match_id where player_match_score.player_id=${playerId};`
  const dbresponse = await db.all(dbquery)
  response.send(dbresponse.map(eachmatchd => convertsnaketocamelm(eachmatchd)))
})
app.get('/matches/:matchId/players', async (request, response) => {
  const {matchId} = request.params
  const dbquery = `select player_details.player_id ,player_details.player_name from player_details inner join player_match_score on player_details.player_id=player_match_score.player_id where player_match_score.match_id=${matchId};`
  const dbresponse = await db.all(dbquery)
  response.send(dbresponse.map(eachmatch => convertsnaketocamelp(eachmatch)))
})
app.get('/players/:playerId/playerScores', async (request, resposne) => {
  const {playerId} = request.params
  const dbquery = ` SELECT
    player_details.player_id AS playerId,
    player_details.player_name AS playerName,
    SUM(player_match_score.score) AS totalScore,
    SUM(player_match_score.fours) AS totalFours,
    SUM(player_match_score.sixes) AS totalSixes FROM 
    player_details INNER JOIN player_match_score ON
    player_details.player_id = player_match_score.player_id
    WHERE player_details.player_id = ${playerId};`
  const dbresponse = await db.all(dbquery)
  resposne.send(dbresponse)
})
module.exports = app
