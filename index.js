var express=require('express')
const fs=require('fs')

var app=express()

app.get('/fights/:tpss/:date',function (req,res) {
	console.log("[%s] TPSS fights: %j, %j",req.originalUrl,req.params,req.body)
	let filename='/var/opt/tkd_json/'+req.params.tpss+'_'+req.params.date+'.json'
  let cont=fs.readFileSync(filename)
  if(cont){
    let cjson=JSON.parse(cont)
    console.log(req.originalUrl,cjson.fights.length,cjson.date)
    res.json(cjson)
  }else res.sendStatus(500)
})
app.put('/fights',function (req,res) {
	console.log("[%s] TPSS fights put: %j, %j",req.originalUrl,req.params,req.body)
	let filename='/var/opt/tkd_json/'+req.body.tpss+'_'+req.body.date+'.json'
  let cont=fs.readFileSync(filename)
  if(cont){
    let cjson=JSON.parse(cont)
    console.log(req.originalUrl,cjson.fights.length,cjson.date)
    res.json(cjson)
  }else res.sendStatus(500)
})
app.get('/tournaments',function (req,res) {
	console.log("[%s] TPSS fights: %j",req.originalUrl,req.params)
  let cont=fs.readFileSync('/var/opt/tkd_json/tournaments.json')
  if(cont){
    let cjson=JSON.parse(cont)
    console.log(req.originalUrl,cjson.tournaments,cjson.date)
    res.json(cjson)
  }else res.sendStatus(500)
})
app.get('/',function (req,res) {
	console.log("[%s] unknown params: %j, body: %j",req.originalUrl,req.params,req.body)
	res.sendStatus(500)
})

app.listen(process.env.PORT || 3000,function(){
  console.log('Lytter til port 3000!')
})