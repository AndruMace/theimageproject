const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const app = express();

mongoose.connect("mongodb://localhost/imageproject", {useNewUrlParser: true});
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"))
app.use(bodyParser.urlencoded({extended:true}));

const commentSchema = new mongoose.Schema({
    text: String,
    published: { type: Date, default: Date.now }
});
const Comment = mongoose.model("Comment", commentSchema);

const imageSchema = new mongoose.Schema({
    image: String,
    created:{type: Date, default: Date.now},
    comments: [commentSchema]
});
const Image = mongoose.model("Image", imageSchema);


app.get("/", function(req, res){
    res.render("landing");
});

app.get("/test", function(req, res){
    res.render("test");
})

app.get("/submit", function(req, res){
    res.render("submit")
});

app.post("/submit", function(req, res){
    const newImage = {image: req.body.imageURL};
    Image.create(newImage, function(err, campground){
        if(err){
            console.log(err);
        } else {
            console.log(newImage.image);
            res.redirect("/")
        }
    });
});

app.get("/show", function (req, res) {
    Image.count().exec(function(err, count){
        var random = Math.floor(Math.random() * count)

        Image.findOne().skip(random).exec(
            function(err, ranImage) {
                if(err){
                    console.log(err)
                } else {
                    res.render("show", {image : ranImage})
                }
            }
        )
    })
});


app.post("/comment/:id", function(req, res){
    Image.findById(req.params.id, function(err, image){
        if(err){
            console.log(err)
        } else {
            const newComment = {text: req.body.comment}
            // console.log(req.body.comment)
            Comment.create(newComment, function (err, comment){
                if(err){
                    console.log(err)
                } else {
                    comment.save();
                    image.comments.push(comment)
                    image.save();
                    res.redirect("/show/" + image._id);
                }
            });
        }
    })
});

app.get("/show/:id", function(req, res){
    Image.findById(req.params.id, function(err, image){
        if(err){
            console.log(err)
        } else {
            res.render("show",{image: image})
        }
    })
});

app.get("/")

app.listen(8008, function(){
    console.log("8008 : Server is running : 8008");
});