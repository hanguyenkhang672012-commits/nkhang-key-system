const express = require("express");
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const app = express();
const PORT = process.env.PORT || 3000;
const ADMIN_TOKEN = process.env.ADMIN_TOKEN;

if (!ADMIN_TOKEN) {
  console.error("ERROR: Set ADMIN_TOKEN before starting the server.");
  process.exit(1);
}

const DB = path.join(__dirname, "keys.json");

app.use(express.json({limit:"32kb"}));
app.use(express.static(__dirname));

function readKeys() {
  if (!fs.existsSync(DB)) fs.writeFileSync(DB, "{}");
  return JSON.parse(fs.readFileSync(DB, "utf8"));
}
function writeKeys(data) {
  fs.writeFileSync(DB, JSON.stringify(data, null, 2));
}
function admin(req,res,next) {
  const token=req.get("x-admin-token");
  if (token!==ADMIN_TOKEN) return res.status(401).json({success:false,message:"Unauthorized"});
  next();
}
function expired(k) {
  return k.expires && Date.now() > new Date(k.expires+"T23:59:59").getTime();
}

app.post("/api/check-key",(req,res)=>{
  const key=String(req.body.key||"").trim();
  const all=readKeys(), item=all[key];
  if(!item) return res.json({success:false,message:"Key không tồn tại"});
  if(!item.active) return res.json({success:false,message:"Key đã bị khóa"});
  if(expired(item)) return res.json({success:false,message:"Key đã hết hạn"});
  item.lastUsedAt=new Date().toISOString();
  writeKeys(all);
  res.json({success:true,name:item.name,expires:item.expires||null});
});

app.get("/api/admin/keys",admin,(req,res)=>{
  const all=readKeys();
  res.json({success:true,keys:Object.entries(all).map(([key,v])=>({key,...v,expired:expired(v)}))});
});

app.post("/api/admin/keys",admin,(req,res)=>{
  const all=readKeys();
  let key=String(req.body.key||"").trim();
  if(!key) key="NKHANG-"+crypto.randomBytes(5).toString("hex").toUpperCase();
  if(all[key]) return res.status(409).json({success:false,message:"Key đã tồn tại"});
  all[key]={name:String(req.body.name||"USER"),active:true,expires:req.body.expires||null,createdAt:new Date().toISOString(),lastUsedAt:null};
  writeKeys(all);res.json({success:true,key,data:all[key]});
});

app.patch("/api/admin/keys/:key",admin,(req,res)=>{
  const key=decodeURIComponent(req.params.key),all=readKeys();
  if(!all[key]) return res.status(404).json({success:false,message:"Không tìm thấy key"});
  if(typeof req.body.active==="boolean") all[key].active=req.body.active;
  if(req.body.name!==undefined) all[key].name=String(req.body.name);
  if(req.body.expires!==undefined) all[key].expires=req.body.expires||null;
  writeKeys(all);res.json({success:true,data:all[key]});
});

app.delete("/api/admin/keys/:key",admin,(req,res)=>{
  const key=decodeURIComponent(req.params.key),all=readKeys();
  if(!all[key]) return res.status(404).json({success:false,message:"Không tìm thấy key"});
  delete all[key];writeKeys(all);res.json({success:true});
});

app.get("/admin",(req,res)=>res.sendFile(path.join(__dirname,"admin.html")));
app.get("/health",(req,res)=>res.json({ok:true}));

app.listen(PORT,()=>console.log("NKHANG Key Server listening on "+PORT));
