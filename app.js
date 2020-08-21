const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");



const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static("public"));
// tell express to serve this public folder

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true
});


const itemsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "check your name!"]
  }
});

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "Wake up"
});

const item2 = new Item({
  name: "Brush my teeth"
});

const item3 = new Item({
  name: "Breakfast time"
});

const defaultItems = [item1, item2, item3];

const listSchema = new mongoose.Schema({
  name: String,
  items: [itemsSchema]
});

const List = mongoose.model("List", listSchema);

// Item.find(function(err, items){
//   if(err){
//     console.log(err);
//   }else{
//     mongoose.connection.close();
//     items.forEach(function(item){
//         console.log(item.name);
//     })
//   }
// });

app.get("/", function(req, res) {

  Item.find({}, function(err, foundItems) {
    if (foundItems.length === 0) {
      Item.insertMany(defaultItems, function(err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully saved all the items into itemsDB! ");
        }
      });
      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Today",
        NewListItems: foundItems
      });
    }

  });
});

app.get("/:customListName", function(req, res) {
  const customListName = _.capitalize(req.params.customListName);

  List.findOne({
    name: customListName
  }, function(err, foundList) {
    if (!err) {
      if (foundList) {
        res.render("list", {
          listTitle: customListName,
          NewListItems: foundList.items
        })
      } else {
        const list = new List({
          name: customListName,
          items: defaultItems
        });

        list.save();
        res.redirect("/" + customListName);

      }
    };
  })

});


app.post("/", function(req, res) {

  const itemName = req.body.newItem;
  const listName = req.body.list;
  const newItem = new Item({
    name: itemName
  });

  if (listName === "Today") {
    newItem.save();
    res.redirect("/");
  } else {
    List.findOne({
      name: listName
    }, function(err, foundList) {
      foundList.items.push(newItem);
      foundList.save();
      res.redirect("/" + listName);
    });
  };



});

app.post("/delete", function(req, res) {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.list;

  if (listName === "Today") {
    Item.deleteOne({
      _id: checkedItemId
    }, function(err) {
      if (!err) {
        console.log("Successfully deleted checked item.");
      }
    });
    res.redirect("/");
  } else {
    List.findOneAndUpdate({name:listName}, {$pull: {items: {_id: checkedItemId}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    })

  };

});



app.post("/work", function(req, res) {

  let item = req.body.newItem;

  workItems.push(item);

  res.redirect("/work");

});

app.get("/about", function(req, res) {
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000.")
});
