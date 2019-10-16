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
  Database.sql_executeAndClose("CALL searchForSimilarPersons(?,?)", [req.body.fullname, req.headers.userid]).then(result => {
		res.status(200).json(result[0])
	}).catch(err=>{
		logger.warn("DB sql_executeAndClose, Exception: %j", err)
		res.sendStatus(500)
	})
})
router.post("/tournament/search", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.body)
  Database.sql_executeAndClose("SELECT * FROM tournaments WHERE showtournament IN ('S','*') AND tournamentname LIKE ? ORDER BY tournamentname", '%' + req.body.tournamentname + '%').then(result => {
    res.status(200).json(result)
  }).catch(err => {
    logger.warn("[%s] DB sql_executeAndClose, Exception: %j", req.originalUrl, err)
    res.sendStatus(500)
  })
})
router.get("/tournament/:tournamentid/fetchclasses", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  Database.sql_executeAndClose("SELECT rc.tournament, rc.classid, c.simplycompete as sc_class, count(*) as rounds, MAX(rc.modified) as modified FROM round_classes rc INNER JOIN classes c ON c.id=rc.classid WHERE rc.tournament=? GROUP BY rc.tournament, rc.classid, sc_class order by rc.tournament, sc_class", req.params.tournamentid).then(result => {
    res.status(200).json(result)
  }).catch(err => {
    logger.warn("[%s] DB sql_executeAndClose, Exception: %j", req.originalUrl, err)
    res.sendStatus(500)
  })
})
/*router.get("/static/classes/:lastupdate", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  Database.sql_executeAndClose("SELECT * FROM classes WHERE modified>?", req.params.lastupdate).then(result => {
    res.status(200).json(result)
  }).catch(err => {
    logger.warn("[%s] DB sql_executeAndClose, Exception: %j", req.originalUrl, err)
    res.sendStatus(500)
  })
})*/
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
router.get("/usergroups", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  if (req.headers.username && req.headers.userid) {
    Database.sql_executeAndClose("SELECT ug.groupid FROM users_to_groups ug INNER JOIN users u ON u.id=ug.userid where u.email=? and u.id=?", [req.headers.username, req.headers.userid]).then(result => {
      logger.info("[%s] %j - %s, %d", req.originalUrl, result, req.headers.username, req.headers.userid)
      if (result && result.length > 0) res.status(200).json(result.map(m => m.groupid))
      else {
        logger.error("[%s] No group exist: %s", req.originalUrl, req.headers.username)
        res.sendStatus(202)
      }
    })
  } else {
    logger.error("[%s] Invalid user: %j", req.originalUrl, req.headers)
    res.sendStatus(500)
  }
})
router.get("/fetchuser", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  if(req.headers.username){
    Database.sql_executeAndClose("SELECT id FROM users where email=?", [req.headers.username]).then(result => {
      logger.info("[%s] %j - %s", req.originalUrl, result, req.headers.username)
      if (result[0] && result[0].id>0) res.status(200).json(result[0].id)
      else{
        logger.error("[%s] New user not added: %s", req.originalUrl, req.headers.username)
        res.status(202).json(0)
      }
    })
  } else{
    logger.error("[%s] Invalid user: %j", req.originalUrl, req.headers)
    res.status(500).json(0)
  }
})
router.get("/togglewatch/:personid/:on?", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.params)
  if (req.headers.userid>0) {
    if (req.params.on){
      Database.sql_executeAndClose("INSERT INTO user_watchlist(watchid,userid,watchtype)VALUES(?,?,1)", [req.params.personid, req.headers.userid]).then(data=>{
        logger.info("[%s] INSERT %j", req.originalUrl, data)
        res.status(200).json(data.insertId)
      })
    }else{
      Database.sql_executeAndClose("DELETE FROM user_watchlist WHERE watchtype=1 AND watchid=? AND userid=?", [req.params.personid, req.headers.userid]).then(data=>{
        logger.info("[%s] DELETE %j", req.originalUrl, data)
        res.sendStatus(200)
      })
    }
  } else res.sendStatus(500)
})
router.post("/links/update", function (req, res) {
  logger.info("[%s] %j", req.originalUrl, req.body)
  if (req.headers.userid>0) {
    if (req.body.id) {
      let sql = Database.sql_BuildUpdateArgs("fight_videos", req.body, ['blueperson', 'redperson', 'tournament', 'fight', 'comment', 'link'], "id=" + req.body.id)
      logger.info("[%s] SQL:%j", req.originalUrl, sql)
//      Database.sql_executeAndClose(sql.sql, sql.args).then(data=>{})
    } else Database.sql_executeAndClose("INSERT INTO fight_videos(blueperson,redperson,tournament,fight,comment,link)VALUES(?,?,?,?,?,?)", [req.body.blueperson, req.body.redperson, req.body.tournament, req.body.fight, req.body.comment, req.body.link]).then(data=>{
      res.status(200).json(data.insertId)
    })
  } else res.sendStatus(500)
})

module.exports = router