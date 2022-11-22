const mongoClient=require('mongodb').MongoClient
const state={
    db:null
}

module.exports.connect=(done)=>{
    //const url='mongodb://localhost:27017'
    const url='mongodb+srv://rubeena:rubeenaanwar@cluster0.oegojvo.mongodb.net/shopping?retryWrites=true&w=majority'
    const dbname='shopping'


    mongoClient.connect(url,(err,data)=>{
        if(err) return done(err)
        state.db=data.db(dbname)
        done()
    })
}

module.exports.get=function(){
    return state.db
}