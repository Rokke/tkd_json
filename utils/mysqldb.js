const logger = require('../winston.js')
const mysql = require("mysql")

class Database {
  constructor(){
    logger.debug("Creating connection!")
    this.connection = mysql.createConnection({host: "talgoe-stue.lan",user: "nodejs",password: process.env.DBPWD,database: "history_tkd","dateStrings": true})
	}
  query(sql,args,debug){
    logger.info("Database.query(%s,%j)-%d",sql,args,this.connection.threadId)
    return new Promise((resolve, reject)=>{
      logger.verbose('query promise: %s,%j',sql,sql.match(/(^UPDATE|DELETE).*WHERE/i))
      if(sql.match(/^(?=UPDATE|DELETE)(?!.*WHERE)/i)){
        logger.error('[%s] Invalid CHANGE query: %s',req.originalUrl,sql)
      }else if(!debug){
        this.connection.query(sql, args, (err, rows)=>{
          if(err) return reject(err)
          else resolve(rows)
        })
      }else{
        logger.warn("Running in DEBUG!")
        resolve({'insertId':1})
      }
    })
  }
  close(){
    return new Promise((resolve, reject)=>{
      this.connection.end(err =>{
        if(err) return reject(err)
        resolve()
      })
    })
  }
  static sql_BuildUpdateArgs(table,data,args,where){
    let sql=""
    let arg=[]
    if(!where||where.length<4) throw "Must have WHERE clause!"
    args.forEach(x=>{
      if(data[x]){
        if(sql) sql+=","+x+"=?"
        else sql="UPDATE "+table+" SET "+x+"=?"
        arg.push(data[x])
      }
    })
    logger.debug("sql_BuildUpdateArgs %j=%j",sql,arg)
    return {'sql':sql+" WHERE "+where,'args':arg}
  }
  static sql_executeSendJSONAndClose(res,querry,args,debug){
    logger.debug("sql_executeSendJSONAndClose: %s",querry)
    Database.sql_executeAndClose(querry,args,debug).then(result=>{
      res.status(200).json(result)
    }).catch(err=>{
      logger.warn("DB sql_executeSendJSONAndClose, Exception: %j", err)
      res.sendStatus(500)
    })
  }
  queryAndClose(querry,args){
    logger.info("queryAndClose")
    let self=this
    if(querry.match(/^(?=UPDATE|DELETE)(?!.*WHERE)/)){
      logger.error('[%s] UPDATE without WHERE %s',req.originalUrl,querry)
    }else{
      return new Promise((resolve,reject)=>{
        this.query(querry,args).then(function(result){
          if(result&&result.length>30) logger.debug("DB querry length: %d",result.length)
          else logger.debug("DB querry: %j-%s",result)
          resolve(result)
          logger.verbose('DB resolved')
          self.close().then(function(closeres){
            logger.info("DB closed: "+closeres)
          })
        },err=>{
          logger.error("DB queryAndClose, Err: %j", err)
          reject(err)
          return self.close()
        }).catch(err=>{
          logger.error("DB queryAndClose, Exception: %j", err)
          reject(err)
          self.close()
        })
      })
    }
  }
  static sql_executeAndClose(querry,args,debug){
    logger.info("sql_executeAndClose: %s(%s)%s", querry,args,(debug)?'-DEBUG':'')
    if(!debug){
      const db=new Database()
      logger.verbose("exit sql_executeAndClose")
      return db.queryAndClose(querry,args)
    }else{    // 2=Update
      return new Promise((resolve)=>{
        logger.warn("DebugPromise")
        let ret=[]
        if(debug===2) ret={"fieldCount":0,"affectedRows":1,"insertId":0,"serverStatus":2,"warningCount":0,"message":"(Rows matched: 1  Changed: 1  Warnings: 0","protocol41":true,"changedRows":1}
        else ret.push([{'identity':1}])
        console.dir(ret)
        resolve(ret)
      })
    }
  }
}
module.exports=Database