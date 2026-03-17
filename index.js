import express from 'express'
import path from 'path'
import session from 'express-session';
import bcrypt from "bcrypt";
import { MongoClient } from 'mongodb';


const url="mongodb+srv://KushProject:Kush%401234%247@cluster0.i0u2bam.mongodb.net/?appName=Cluster0"
const database="Workweb"
const collections="User"
const companyCollections ="Company"
const workerCollections="Worker"
const CommonUser="CommonUser"
const client=new MongoClient(url);

  
let db;

async function startServer() {
    await client.connect();
    console.log("MongoDB Connected");

    db = client.db(database);

    app.listen(3200, () => {
        console.log("Server running on port 3200");
    });
}



const app = express();
const publicpath = path.resolve('public')

app.use(express.static(publicpath));
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(express.urlencoded({extended:false}));
app.use(session({
    secret: "mysecretkey",
    resave: false,
    saveUninitialized:false
}));

startServer();

let result1

app.post("/signup",async (req,resp)=>{

    const { email, password, role } = req.body;
    
    const hashpassword = await bcrypt.hash(password, 10);
    const collection = db.collection(CommonUser);
     result1= await collection.insertOne({
        role,email,password: hashpassword 
    });

 if(role === "user"){
     resp.redirect("/userpro");
 }

 else if(role === "worker"){
     resp.redirect("/workerpro");
 }

 else if(role === "company"){
     resp.redirect("/companypro");
 }
})

app.post("/login", async (req, resp) => {

    const { email, password } = req.body;

    let usename =null;

    const user = await db.collection("CommonUser").findOne({ email });
    if (user){
         usename= await db.collection("User").findOne({accountId : user._id});
    }
    

    if(!user){
        return resp.send("User not found");
    }

    const match = await bcrypt.compare(password, user.password);
    

    if(!match){
        return resp.send("Wrong password");
    }

    // create session
    req.session.user = {
        email: user.email,
        id: user._id,
        username:usename.name
    };
     if(user.role === "user"){
     resp.redirect("/");
     console.log("User logged in:", req.session.user);
 }

 else if(user.role === "worker"){
     resp.redirect("/homeWorker");
 }

 else if(user.role === "company"){
     resp.redirect("/homeCompany");
 }
    

});

app.post("/userpro", async (req, resp) => {

    const { email, password , name, role,ContectNum, adress } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const collectionUser = db.collection(collections);
    const collectioncomonuser = db.collection(CommonUser);

    const result = await collectioncomonuser.insertOne({email: email,
        password: hashedPassword,role :role});
    const result2 = await collectionUser.insertOne({name: name,
        ContectNum: ContectNum, 
               adress: adress,accountId : result.insertedId});

    console.log("Inserted:", result);

    resp.redirect("/");
});

import upload from "./public/js/multer.js";


app.post("/postjob", upload.array("images", 5), async (req, res) => {

  try {

    const { profession, description, location, budget, status } = req.body;

    const userName = req.session.user.username;
    // get image urls from cloudinary
    const imageUrls = req.files.map(file => file.path);

    const jobCollection = db.collection("postjob");

    const result = await jobCollection.insertOne({
      profession,
      description,
      location,
      budget,
      status,
      images: imageUrls,
      createdAt: new Date(),
       userId: req.session.userId,
       userName

    });

    res.redirect("/");

  } catch (error) {
    console.log(error);
    res.send("Job post failed");
  }

});

app.post("/companypro", async (req, resp) => {

    const collection = db.collection(companyCollections);

    const result = await collection.insertOne({...req.body, accountId : result1.insertedId});

    console.log("Inserted:", result);

    resp.redirect("/homeCompany");
});

app.post("/workerpro", async (req, resp) => {

    const collection = db.collection(workerCollections);

    const result = await collection.insertOne({...req.body, accountId : result1.insertedId});

    console.log("Inserted:", result);

    resp.redirect("/homeWorker");
});

app.get("/", async (req, resp) => {

    // if(!req.session.user){
    //     return resp.redirect("/login");
    // }

     const posts = await db.collection("posts")
    .find({})
    .sort({ createdAt: -1 })
    .limit(5)
    .toArray();

  resp.render("dashboard", { posts });
});

app.get("/load-more-posts", async (req, res) => {

  const skip = parseInt(req.query.skip) || 0;
  const limit = 5;

  const posts = await db.collection("posts")
    .find({})
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .toArray();

  res.json(posts);

});

app.get("/login",(req,resp)=>{
resp.render("regi")
});

app.get("/singup",(req,resp)=>{
resp.render("singup")
});

app.get("/userpro",(req,resp)=>{
resp.render("userpro")
});

app.get("/workerpro", async (req, resp) => {

    const professionsCollection = db.collection("professions");

    const professions = await professionsCollection.find({}).toArray();

    resp.render("workerpro", { professions });

});


app.get("/companypro",(req,resp)=>{
resp.render("companypro")
});

// app.get("/homeWorker",(req,resp)=>{
// resp.render("homeWorker")
// });

app.get("/homeWorker", async (req, res) => {
  try {
    let { page = 1, limit = 8, category, location, minBudget, maxBudget } = req.query;

    page = parseInt(page);
    limit = parseInt(limit);

    let filter = {};

    if (category) filter.profession = category;
    if (location) filter.location = location;

    if (minBudget || maxBudget) {
      filter.$expr = {
        $and: [
          minBudget ? { $gte: [{ $toDouble: "$budget" }, Number(minBudget)] } : true,
          maxBudget ? { $lte: [{ $toDouble: "$budget" }, Number(maxBudget)] } : true
        ]
      };
    }

    const jobCollection = db.collection("postjob");

    const total = await jobCollection.countDocuments(filter);

    const jobs = await jobCollection.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    res.render("homeWorker", {
      jobs,
      currentPage: page,
      totalPages: Math.ceil(total / limit) || 1
    });

  } catch (err) {
    console.log("ERROR:", err);
  }
});


app.get("/homeCompany",(req,resp)=>{
resp.render("homeCopany")
});

app.get("/postjob",async (req,resp)=>{
    if(!req.session.user){
        return resp.redirect("/login");
    }
const professionsCollection = db.collection("professions");

    const professions = await professionsCollection.find({}).toArray();

    resp.render("postjob", { professions });
});