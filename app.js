
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
const mongoose= require("mongoose");
const _ =require("lodash");



app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));

app.use(express.static("public"));

// Database Connectivity through mongoose
mongoose.connect("mongodb+srv://admin-rahul:Check101@cluster0.gxbs2.mongodb.net/todolistdb",{useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemsSchema ={
  name: String
};

const Item= mongoose.model("Item",itemsSchema);

const item1 = new Item({
  name: "Welcome to your todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item."
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems =[item1,item2,item3];


const listSchema={
  name: String,
  items: [itemsSchema]
};

const List = mongoose.model("List",listSchema);


// closing connection



app.get("/", function (req,res) 
{

  Item.find({}, function (err, foundItems) {

   if (foundItems.length === 0) {
     Item.insertMany(defaultItems, function (err) {
      if (err) {
        console.log(err);
      }
      else{
        console.log("Sucessfully added default items to the database.");
      }
    });
     res.redirect("/");
   }
   else{ 
    res.render("list",{listtitle:"Today", newlistitems:foundItems});
  }
});

});


app.get("/:customListName", function(req,res){
 const customListName = _.capitalize(req.params.customListName);

 List.findOne({name:customListName}, function(err, foundlist){
  if (!err) {
    if (!foundlist) {
          //create a new list
          const list = new List({
           name: customListName,
           items: defaultItems
         });

          list.save();
          res.redirect("/"+customListName);
        }
        else{
        //show an existing list
        res.render("list",{listtitle:foundlist.name , newlistitems:foundlist.items});
      }
    }

  });


});


app.post("/",function(req,res) 
{
	const itemName=req.body.newitem;
  const listName = req.body.list;
  
  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function (err, foundlist) {
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/"+ listName);
    });
  }
});



app.post("/delete",function (req,res) {
  const checkedItemId= req.body.checkbox;
  const listName = req.body.listName;

if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, function(err){
   if (!err) {
     console.log("Sucessfully deleted checked items.");
     res.redirect("/");
    }
  });
}
else{
  List.findOneAndUpdate({name: listName},{$pull: {items: {_id: checkedItemId}}}, function(err, foundlist) {
    if (!err) {
      res.redirect("/"+ listName);
    }
  });
}

  
});





app.get("/about",function (req,res)
{
	res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}


app.listen(port, function ()
{
	console.log("Server has started sucessfully.");
});