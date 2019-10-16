var express=require('express')
var router=express.Router()
const formidable = require('formidable')
var bodyParser = require("body-parser") 
const fs=require('fs')
const logger =require('./winston.js')
const mysqlfunctions=require('./routes/mysqlfunctions.js')
const CACHE_PATH='/var/opt/tkd_json/'
var app=express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) 
app.use("/db", mysqlfunctions)
app.use(function(req, res, next) {
  logger.info("%s,%j,%j",req.originalUrl,req.params,req.headers)
  next()
})
app.get('/fights/:key/:date',function (req,res) {
	logger.info("[%s] fights: %j, %j",req.originalUrl,req.params,req.body)
	let filename=`${CACHE_PATH}fights/${req.params.key}_${req.params.date}.json`
	if(fs.existsSync(filename)){
		var cont=fs.readFileSync(filename)
		if(cont){
			let cjson=JSON.parse(cont)
			logger.info(req.originalUrl,cjson.fights.length,cjson.date)
			res.json(cjson)
		}
	}else{
		logger.error("[%s] invalid fight request %s",req.originalUrl,filename)
		res.sendStatus(500)
	}
})
app.get('/competitors/:key',function (req,res) {
	logger.info("[%s] competitors: %j, %j",req.originalUrl,req.params,req.body)
	let filename=`${CACHE_PATH}competitors/${req.params.key}.json`
	if(fs.existsSync(filename)){
		let cont=fs.readFileSync(filename)
		if(cont){
			let cjson=JSON.parse(cont)
			logger.info("[%s] divisions: %d",req.originalUrl,cjson.divisions.length)
			res.json(cjson)
		}
	}else{
		logger.error("[%s] invalid competitors request %j",req.originalUrl,req.params)
		res.sendStatus(500)
	}
})
app.get('/clientlogs/:file?',function (req,res) {
	logger.info("[%s] clientlogs: %j",req.originalUrl,req.params)
	let filepath=`${CACHE_PATH}clientlogs`
	logger.info("[%s] clientlogs: %s",req.originalUrl,filepath)
	if(req.params.file){
		res.sendFile(`${filepath}/${req.params.file}`)
	}else{
		let files=fs.readdirSync(filepath)
		let j=[]
		for(let i=0;i<files.length;i++){
			j.push({
			      'name': files[i],
			      'modified': fs.statSync(`${filepath}/${files[i]}`).mtime
			      })
		}
		logger.info("[%s] logs: %j",req.originalUrl,j)
		res.json(j)
	}
})
app.get('/state',function (req,res) {
  let filename=`${CACHE_PATH}tournaments.json`
  let heads = req.headers["user-agent"].split("/")
	logger.info("[%s] state(%s): %j",req.originalUrl,heads[heads.length-1],req.params)
	let stat=fs.statSync(filename)
	logger.info("[%s] modified: %d",req.originalUrl,stat.mtimeMs)
	res.json(stat.mtimeMs)
})
app.get('/currentMonitor',function (req,res) {
	logger.info("[%s] currentMonitor: %j",req.originalUrl,req.params)
	let filename=`${CACHE_PATH}monitor.json`
	if(fs.existsSync(filename)) res.json(JSON.parse(fs.readFileSync(filename)))
	else res.sendStatus(500)
})
app.post("/addnew", function(req,res){
	logger.info("[%s] %j %j",req.originalUrl,req.body,req.body.monitor)
	if(!req.body.name) req.body.name=`${req.headers["username"]}_${new Date().getTime()}`
	let filename=`${CACHE_PATH}add/${req.body.name}.json`
	fs.writeFileSync(filename, JSON.stringify(req.body))
	res.sendStatus(200)
})

app.get('/tournaments',function (req,res) {
	let filename=`${CACHE_PATH}tournaments.json`
	logger.info("[%s] tournaments: %j",req.originalUrl,req.params,filename)
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
app.post("/sendDeviceLog", function(req,res){
	logger.info("[%s]",req.originalUrl)
	new formidable.IncomingForm().parse(req, (err,fields,files)=>{
		if(err){
			logger.error('Error', err)
			res.sendStatus(500)
		}else res.sendStatus(200)
	}).on('fileBegin', (name, file) =>{
		logger.info('Created %s: %s', name, file.name)
		file.path = `${CACHE_PATH}clientlogs/${file.name}.gz`
	})
})
app.listen(process.env.PORT || 3000,function(){
	logger.info('Lytter til port 3000!', CACHE_PATH)
})