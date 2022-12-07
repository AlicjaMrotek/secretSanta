//jshint esversion:8
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const mongoose = require("mongoose");
// const ejsLint = require("ejs-lint");

// const _ = require("lodash")

const app = express();

app.use(express.static("public"));

app.use(bodyParser.urlencoded({
  extended: true
}));

app.set('view engine', 'ejs');

//Połączenie z MongoDB
const dbName = "secretSantaDB";
const uri = "mongodb+srv://alicja-admin:secretSanta2062@secretsanta.ap1abcw.mongodb.net/" + dbName;
// const uri = "mongodb://localhost:27017/" + dbName;


mongoose.connect(uri);

// Schematy i modele dla przedmiotu i osoby

const itemSchema = new mongoose.Schema({
  item: {
    type: String,
    required: true
  },
  link: String
});

const Item = mongoose.model("Item", itemSchema);

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  gifts: [itemSchema]
});

const Person = mongoose.model("Person", personSchema);

//Defaultowa osoba z przedmiotami

// const item1 = new Item({
//   item: "Wałek jedwabny do włosów",
//   link: "https://mexmo.pl/pl/strona-glowna/226-zestaw-dlugi-cienki-walek-jedwabny-do-wlosow-dlugich-z-gumkami.html"
// });

// const item2 = new Item({
//   item: "Waza do zupy Flisty",
//   link: "https://porcelanownia.pl/pl/p/Flisty-1086-Waza-3-litry-Bogucice/10190"
// });

// const person1 = new Person({
//   name: "Alicja",
//   gifts: [item1, item2]
// });

// // item1.save();
// // item2.save();
// // person1.save();

// Aplikacja

app.route("/")
  .get(function (req, res) {
    Person.find(function (err, foundPeople) {
      if (!err) {
        if (foundPeople) {
          // console.log(foundPeople);
          res.render("home", {
            people: foundPeople
          });
        } else {
          res.render("home");
        }
      } else {
        console.log(err);
      }
    });

  });

app.route("/:customPersonName")
  .get(function (req, res) {
    const personName = req.params.customPersonName;

    Person.findOne({
      name: personName
    }, function (err, foundPerson) {
      if (err) {
        res.send(err);
      } else {
        // console.log(foundPerson);
        if (foundPerson) {
          // console.log(foundPerson.gifts);
          res.render("person", {
            person: foundPerson.name,
            items: foundPerson.gifts
          });
        }
        //Tworzenie nowych osob wyłączone        
        // else {
        //   const newPerson = new Person({
        //     name: personName,
        //     gifts: []
        //   });
        //   newPerson.save();
        //   res.redirect(`/${personName}`);
        // }
      }
    });
  })

  .post(function (req, res) {
    const personName = req.params.customPersonName;
    const newGift = new Item({
      item: req.body.newItem,
      link: req.body.newItemLink
    });
    Person.findOneAndUpdate({
        name: personName
      }, {
        $push: {
          gifts: newGift
        }
      },
      function (err) {
        if (err) {
          console.log(err);
        } else {
          console.log("Successfully added new item.");
          res.redirect(`/${personName}`);
        }
      });
  });


//Work in progress...
// app.post("/:customPersonName/edit", function (req, res) {
//   console.log(req.body.editBut);
// });

app.post("/:customPersonName/delete", function (req, res) {
  const deletedItemId = req.body.deleteBut;
  const personName = req.params.customPersonName;

  Person.findOneAndUpdate({
      name: personName
    }, {
      $pull: {
        gifts: {
          _id: deletedItemId
        }
      }
    },
    function (err) {
      if (err) {
        console.log(err);
      } else {
        console.log("Successfully deleted item.");
        res.redirect(`/${personName}`);
      }
    });
});


let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function () {
  console.log(`Server started on port ${port}`);
});