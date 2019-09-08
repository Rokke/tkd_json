var express=require('express')
var router=express.Router()
var Database=require('../utils/mysqldb.js')
const logger =require('../winston.js')

router.get("/searchtournaments/:personid", function(req, res){
	logger.info("[%s] %j",req.originalUrl,req.params)
  Database.sql_executeAndClose("CALL searchForPersonTournaments(?)",req.params.personid).then(result=>{
		res.status(200).json(result[0])
	}).catch(err=>{
		logger.warn("DB sql_executeAndClose, Exception: %j", err)
		res.sendStatus(500)
	})
})
router.post("/searchname", function(req, res) {
  logger.info("[%s] %j",req.originalUrl,req.body)
  Database.sql_executeAndClose("CALL searchForSimilarPersons(?,null)",[req.body.fullname]).then(result=>{
		res.status(200).json(result[0])
	}).catch(err=>{
		logger.warn("DB sql_executeAndClose, Exception: %j", err)
		res.sendStatus(500)
	})
})
router.get("/searchfights/:tournamentid/:personid", function(req, res) {
  logger.info("[%s] %j",req.originalUrl,req.params)
  Database.sql_executeAndClose("SELECT f.id, p1.id as blueid, p1.fullname as bluename, p2.id as redid, p2.fullname as redname,f.roundno,f.result,f.points,f.winner,r.roundname FROM fights f INNER JOIN round_classes r ON r.id=f.round_class INNER JOIN persons p1 ON p1.id=f.blueperson INNER JOIN persons p2 ON p2.id=f.redperson WHERE r.tournament=? AND (p1.id=? OR p2.id=?)",[req.params.tournamentid,req.params.personid,req.params.personid]).then(result=>{
		res.status(200).json(result)
	})
})/*router.post("/searchfight", function(req, res) {
  logger.info("[%s] %j",req.originalUrl,req.body.tournamentid)
  Database.sql_executeAndClose("SELECT f.id, p1.id as blueid, p1.fullname as bluename, p2.id as redid, p2.fullname as redname,f.roundno,f.result,f.points,f.winner,r.roundname FROM fights f INNER JOIN round_classes r ON r.id=f.round_class INNER JOIN persons p1 ON p1.id=f.blueperson INNER JOIN persons p2 ON p2.id=f.redperson WHERE r.tournament=?"+(req.body.roundno&&req.body.roundno.length>0?" AND f.roundno="+req.body.roundno:"")+(req.body.personid?" AND (p1.id="+req.body.personid+" OR p2.id="+req.body.personid+")":""),[req.body.tournamentid]).then(result=>{
		logger.info("[%s] %j",req.originalUrl,result)
		res.status(200).json(result)
	})
})*/
router.get("/fetchlinks/:personid", function(req, res){
  logger.info("[%s] %j",req.originalUrl,req.params)
  Database.sql_executeAndClose("SELECT l.tournament,t.tournamentname,l.id,l.blueperson,pb.fullname as bluefullname,l.redperson,pr.fullname as redfullname,l.link,l.tournament,l.fight,l.comment FROM fight_videos l LEFT JOIN tournaments t ON t.id=l.tournament LEFT JOIN persons pb ON pb.id=l.blueperson LEFT JOIN persons pr ON pr.id=l.redperson WHERE l.redperson=? OR l.blueperson=?",[req.params.personid,req.params.personid]).then(result=>{
		res.status(200).json(result)
	})
})
router.get("/:tournamentid/classes/:classid", function(req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  if (req.params.classid && req.params.tournamentid){
		Database.sql_executeAndClose("CALL searchClassFights(?,?,?)", [req.params.tournamentid, req.params.classid, req.headers.userid]).then(result => {
			res.status(200).json(result[0])
		})
  }else res.sendStatus(500)
})
router.get("/fetchuser", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  if(req.headers.username){
    Database.sql_executeAndClose("SELECT id FROM users where email=?", [req.headers.username]).then(result => {
      logger.info("[%s] %j %d - %s", req.originalUrl, result, req.headers.username)
      if (result[0] && result[0].id>0) res.status(200).json(result[0].id)
      else res.status(202).json(0)
    })
  } else res.status(500).json(0)
})
module.exports = router