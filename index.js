var express=require('express')
const fs=require('fs')
const logger =require('./winston.js') 
const CACHE_PATH='/var/opt/tkd_json/'
var app=express()

app.use(function(req, res, next) {
  logger.info("%s,%j,%j,%j",req.originalUrl,req.socket._peername,req.params,req.headers)
  next()
})
app.get('/fights/:key/:date',function (req,res) {
	logger.info("[%s] fights: %j, %j",req.originalUrl,req.params,req.body)
	let filename=`${CACHE_PATH}fights/${req.params.key}'_'${req.params.date}.json`
	if(fs.existsSync(filename))
  var cont=fs.readFileSync(filename)
  if(cont){
    let cjson=JSON.parse(cont)
    logger.info(req.originalUrl,cjson.fights.length,cjson.date)
    res.json(cjson)
	}else{
		logger.error("[%s] invalid fight request %j",req.originalUrl,req.params)
		res.sendStatus(500)
	}
})
app.get('/competitors/:key',function (req,res) {
	logger.info("[%s] competitors: %j, %j",req.originalUrl,req.params,req.body)
	let filename=`${CACHE_PATH}competitors/${req.params.key}.json`
	if(fs.existsSync(filename))
  var cont=fs.readFileSync(filename)
  if(cont){
    let cjson=JSON.parse(cont)
    logger.info(req.originalUrl,cjson.competitors.length,cjson.date)
    res.json(cjson)
	}else{
		logger.error("[%s] invalid competitors request %j",req.originalUrl,req.params)
		res.sendStatus(500)
	}
})
app.get('/state',function (req,res) {
	let filename=`${CACHE_PATH}tournaments.json`
	logger.info("[%s] state: %j",req.originalUrl,req.params,filename)
	let stat=fs.statSync(filename)
	logger.info("[%s] modified: %d",stat.mtimeMs)
	res.json(stat.mtimeMs)
})
app.get('/tournaments',function (req,res) {
	let filename=`${CACHE_PATH}tournaments.json`
	logger.info("[%s] TPSS fights: %j",req.originalUrl,req.params,filename)
	if(fs.existsSync(filename)){
		let cont=fs.readFileSync(filename)
		if(cont){
			let cjson=JSON.parse(cont)
			logger.info(req.originalUrl,cjson.tournaments,cjson.date)
			res.json(cjson)
		}else res.sendStatus(500)
	}else{
		logger.error("Error no tournament file")
	}
})
app.get('/',function (req,res) {
	logger.error("[%s] unknown params: %j, body: %j",req.originalUrl,req.params,req.body)
	res.sendStatus(500)
})
app.listen(process.env.PORT || 3000,function(){
	logger.info('Lytter til port 3000!', CACHE_PATH)
})