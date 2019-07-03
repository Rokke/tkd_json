var express=require('express')
const fs=require('fs')

var app=express()

app.get('/fights',function (req,res) {
  let cont=fs.readFileSync('/var/opt/tkd_json/30964327.json')
  if(cont){
    let cjson=JSON.parse(cont)
    console.log('file', cjson)
    res.json(cjson)
  }else res.sendStatus(500)
})

app.listen(process.env.PORT || 3000,function(){
  console.log('Lytter til port 3000!')
})