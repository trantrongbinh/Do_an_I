var express = require('express')
var app = express()
app.set('view engine','ejs')
app.set('views','./views')
app.use(express.static('public'))
app.listen(3000, function(){
  console.log('connect thanh cong')
})
var request = require('request');
var cheerio = require('cheerio');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/truyen";

var mongoose = require('mongoose')
mongoose.connect('mongodb://localhost:27017/truyen')
var dbMongo = mongoose.connection;
dbMongo.on('error',console.error.bind(console,'connection error:'))
dbMongo.once('open',function(){
  console.log('MongoDb connect')
})


var Schema = new mongoose.Schema({
  type: String,
  noidung: [{
    name: String,
    mota: String
  }]
})
var product = mongoose.model('truyencuoi', Schema)

let getStories = (URL)=>{
  var mangStories = [];
  request(URL,function(error,response,body){
    if(error){
    console.log(error);
    }else {
      $ = cheerio.load(body);
      var ds = $(body).find("a.a-title");
      var type = $(body).find("strong").text();
      var n = ds.length;
      ds.each(function (i,e) {
       request(e["attribs"]["href"],function (error1,response1,body1) {
       if(error1){
          console.log(error1);
       }else {
          $ = cheerio.load(body1);
          var data= $(body1).find("div.padding-10-20").text();
          var ten = $(body1).find("h3.margin-bottom-0").text();
          var object = { mota: data, name: ten };
          mangStories.push(object);
          }
          if(mangStories.length == n){
          MongoClient.connect(url, function(err, db) {
          if (err) throw err;
          product = {type: type,noidung: mangStories};
          db.collection("truyencuoi").insertOne(product, function(err1, res1) {
          if (err1) throw err1;
          console.log("1 record inserted");
          db.close();
          });
          });
          }
        });
      });
    }
   });
};

var mangURL = ['http://www.zuize.vn/cat/truyen-cuoi-dan-gian.html','http://www.zuize.vn/cat/truyen-cuoi-tham-thuy.html',
              'http://www.zuize.vn/cat/truyen-cuoi-nuoc-ngoai.html','http://www.zuize.vn/cat/truyen-cuoi-ve-tinh-yeu.html',
              'http://www.zuize.vn/cat/truyen-cuoi-the-loai-khac.html'];
mangURL.forEach(function(URL){
  getStories(URL);
 })

 app.get('/product_types',function(req,res){
   res.render('choose')
 });

  var MongoClient = require('mongodb').MongoClient;
  var url = "mongodb://localhost:27017/truyen";

MongoClient.connect(url, function(err, db) {
  if (err) throw err;
  var mang = [];

  app.get('/truyencuoinuocngoai',function(req,res){

        db.collection("truyencuoi").find({type: 'Truyện cười nước ngoài'}).toArray(function(err, results) {
        if (err) throw err;
        console.log(results);
        mang = results[0].noidung;
        });
    res.render('type1',{mang})
    });

    app.get('/truyencuoithamthuy',function(req,res){

        db.collection("truyencuoi").find({type: 'Truyện cười thâm thúy'}).toArray(function(err, results) {
        if (err) throw err;
        console.log(results);
        mang = results[0].noidung;
       });
    res.render('type2',{mang})

    });

    app.get('/truyencuoitinhyeu',function(req,res){

        db.collection("truyencuoi").find({type: 'Truyện cười về tình yêu'}).toArray(function(err, results) {
        if (err) throw err;
        console.log(results);
        mang = results[0].noidung;
        });
    res.render('type3',{mang})

   });

   app.get('/truyencuoidangian',function(req,res){

       db.collection("truyencuoi").find({type: 'Truyện cười dân gian'}).toArray(function(err, results) {
       if (err) throw err;
       console.log(results);
       mang = results[0].noidung;
      });
   res.render('type4',{mang})

  });

  app.get('/theloaikhac',function(req,res){

      db.collection("truyencuoi").find({type: 'Thể loại khác'}).toArray(function(err, results) {
      if (err) throw err;
      console.log(results);
      mang = results[0].noidung;
      });
    res.render('type5',{mang})

  });

});
