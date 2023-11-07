var express=require("express");
var app=express();
var mysql=require("mysql");
var cors=require("cors");
var bodyParser=require("body-parser");
const bcrypt = require('bcrypt');

// const { Pool } = require('pg');

// const pool = new Pool({
//   user: 'yourdbuser',
//   host: 'localhost',
//   database: 'yourdb',
//   password: 'yourdbpassword',
//   port: 5432,
// });




var jsonParser=bodyParser.json();
var urlrncodedParser=bodyParser.urlencoded({extended:false});
app.use(cors());
app.use(express.json());
var con=mysql.createConnection({
 host: "localhost",
 user: "root",
 password: "",
 database: "customers_db"
});

con.connect((err)=>{
    if(err) throw err;
    console.log("Connected to database")
})
//registration
app.post ("/signup",jsonParser,function(req,res){
    
    let username=req.body.username;
    let full_name=req.body.full_name;
    let email=req.body.email;
    let phone=req.body.phone;
    let password=req.body.password;

    con.query("select username from user where username = ? OR email = ?", [username, email], (err,result)=> {
        if (err) {
            res.status(500).json({ error: "Database query error" });
          } else {
            
            if (result.length > 0) {
             
              return res.status(409).json({ error: 'Username or Email already exists' });
            } else {
                
                    const saltRounds = 10; 

                    const plainPassword = password;
                    bcrypt.hash(plainPassword, saltRounds, (err, hash) => {
                    if (err) {
                        console.error('Error hashing password:', err);
                    } else {
                        
                        console.log('Hashed Password:', hash);

                        let qr=`insert into user(username,full_name,email,phone,password) values('${username}','${full_name}','${email}','${phone}','${hash}')`;
                        con.query(qr,(err,result)=>{
                            if(err){
                               res.send({error:"Failed"})
                            }
                            else{
                               res.send({success:"Success"});
                            }
                           })
                       
                    }
                    });

                
                

            }
          }
        
    })
    
}
)

app.post("/signin", jsonParser, function (req, res) {
    const username = req.body.username;
    const password = req.body.password;
  
    
    con.query("SELECT username, password FROM user WHERE username = ?", [username], (err, result) => {
      if (err) {
        res.status(500).json({ error: "Database query error" });
      } else {
        if (result.length == 0) {
          return res.status(401).json({ error: "User not found" });
        }
  
        const storedUsername = result[0].username;
        const storedHashedPassword = result[0].password;
    
        
        bcrypt.compare(password, storedHashedPassword, (bcryptErr, passwordMatch) => {
          if (bcryptErr) {
            res.status(500).json({ error: "Password comparison error" });
          } else {
            if (passwordMatch) {
              
              res.status(200).json({ success: "Sign-in successful", username: storedUsername });
            } else {
              
              res.status(401).json({ error: "Incorrect password" });
            }
          }
        });
      }
    });
  });
  

//get customers
app.get("/customers",function (req,res) {
  con.query("select * from customers",(err,result,filelds)=>{
   if(err) throw(err);
  res.send(result)
  })

 
})

//get single customer
app.get("/customers/:id",function (req,res) {
    let id=req.params.id;
   con.query("select * from customers where id="+id,(err,result,fields)=>{
    if(err) throw (err);
    res.send(result);
   }) 
})

//Add new customers
app.post("/customers",jsonParser,function (req,res) {
    let name=req.body.name
    let address=req.body.address
    let phone_number=req.body.phone_number
    let email=req.body.email
    let country=req.body.country

    let qr = `insert into customers(name,address,phone_number,email,country) values('${name}','${address}','${phone_number}','${email}','${country}')`;
    
    con.query(qr,(err,result)=>{
     if(err){
        res.send({error:"Failed"})
     }
     else{
        res.send({success:"Sucess"});
     }
    })
})

//Update customers
app.patch("/customers",jsonParser,function (req,res) {
    let name=req.body.name
    let address=req.body.address
    let phone_number=req.body.phone_number
    let email=req.body.email
    let country=req.body.country
    let id=req.body.id

    let qr=`update customers set name ='${name}', address= '${address}', phone_number='${phone_number}', email='${email}', country='${country}' where id=${id}`;
    con.query(qr,(err,result)=>{
        if(err){
           res.send({error:"Updation Failed"})
        }
        else{
           res.send({success:"Updation Sucessful"});
        }
       })
})

//Delete customers

app.delete("/customers/:id",function (req,res) {
    let id=req.params.id
    let qr=`delete from customers where  id=${id}`;
    con.query(qr,(err,result)=>{
        if(err){
           res.send({error:"deletion Failed"})
        }
        else{
           res.send({success:"Deleted Sucessful"});
        }
       })
})

app.get("/",function (req,res) {
    res.send("<h1>Welcome martin </h1>")
})

app.listen(9000,function () {
    console.log("server started")
})
