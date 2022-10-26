const db=require('../config/connection')
const collection=require('../config/collections')
const bcrypt=require('bcrypt')
const { UserBindingContext } = require('twilio/lib/rest/chat/v2/service/user/userBinding')
const session = require('express-session')
const dotenv=require('dotenv').config()
const  client=require('twilio')(process.env.accountSid,process.env.authToken)
const objectId=require('mongodb').ObjectId

module.exports={
    doSignup:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            userData.userBlock=false
            userData.Password= await bcrypt.hash(userData.Password,10)
            client
            .verify
            .services(process.env.serviceID)
            .verifications
            .create({
                to: `+91${userData.Mobilenumber}`,
                channel: 'sms'
            })
            .then((data) => {
                Name1 =userData.Name,
                    Mobilenumber1 = userData.Mobilenumber,
                    Password1 = hashPassword,
                    Email1 = userData.Email
                res.redirect('/otpSignupVerify')
            })
            db.get().collection(collection.USER_COLLECTION).insertOne(userData).then((data)=>{
                //console.log(data)
                resolve(data.insertedId)
                console.log(data)

            })
            
        })
        
    },
    doLogin:(userData)=>{
        return new Promise(async(resolve,reject)=>{
            let loginStatus=false
            let response={}
            let user= await db.get().collection(collection.USER_COLLECTION).findOne({Email:userData.Email})
            if(user && !user.userBlocked){
             bcrypt.compare(userData.Password,user.Password).then((status)=>{
                if(status){
                    console.log("login success")
                    response.user=user
                    response.status=true
                    resolve(response)
                }
                else{
                   console.log("login failed") 
                   resolve({status:false})
                }
             })
            }
            else{
                console.log("login failed")
                resolve({status:false})

            }
        })
        
    },
  otpSignupVerifyPost:(req,res)=>{
if((req.body.otp).length === 6){
client
.verify
.services(process.env.serviceID)
.verificationChecks
.create({
    to:`+91${Mobilenumber1}`,
    code:req.body.otp
})
.then((data)=>{
    if(data.status==="approved"){
        const user=new User({
            Name:Name1,
            Mobilenumber:Mobilenumber1,
            Email:Email1,
            Password:Password1

        })
        user.save()
        .then((result)=>{
            console.log("otp signup successful")
        })
        .catch((err)=>{
            console.log(err)
        })
        res.redirect('/')
    }else{
        session=req.session;
        session.invalidOTP=true
        res.redirect('/otpLoginVerify')
    }
})
}else{
    session=req.session;
    session.invalidOTP=true
    res.redirect('/otpLoginVerify')

}
},
getAllUsers:()=>{
            return new Promise(async(resolve,reject)=>{
                let users=await db.get().collection(collection.USER_COLLECTION).find().toArray()
                resolve(users)
            })
        },

blockUser: (userId) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(userId)}, {
            $set: {
                userBlocked: true
            }
        }).then((response) => {
            console.log(userId);
        resolve(response)
        })
    })
},
unblockUser:(user) => {
    return new Promise((resolve, reject) => {
        db.get().collection(collection.USER_COLLECTION)
        .updateOne({_id:objectId(user)}, {
            $set: {
                userBlocked: false
            }
        }).then((response) => {
        })
    })
}
}