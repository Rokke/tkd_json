var express=require('express')
const fs=require('fs')

var app=express()

app.get('/fights',function (req,res) {
  let cont=fs.readFileSync('/var/opt/tkd_json/30964327.json')
  if(cont){
    let cjson=JSON.parse(cont)
    console.log(req.originalUrl,cjson.fights,cjson.date)
    res.json(cjson)
  }else res.sendStatus(500)
})
app.get('/tournaments',function (req,res) {
  let cont=fs.readFileSync('/var/opt/tkd_json/tournaments.json')
  if(cont){
    let cjson=JSON.parse(cont)
    console.log(req.originalUrl,cjson.tournaments,cjson.date)
    res.json(cjson)
  }else res.sendStatus(500)
})

app.listen(process.env.PORT || 3000,function(){
  console.log('Lytter til port 3000!')
})