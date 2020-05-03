const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const uuid = require('uuid');
const {Bookmarks} = require("./bookmarksModel.js");
const mongoose = require('mongoose');

const APIKEY = "2abbf7c3-245b-404f-9473-ade729ed4653";

app.use(morgan( 'dev' ));

function VerifyAPIKEY(req, res, next){
    let BearerKey = req.headers.authorization;
    let HeaderKey = req.headers['book-api-key'];
    let QueryKey = req.query.APIKEY;
    
    if(!BearerKey && !HeaderKey && !QueryKey || (BearerKey !== `Bearer ${APIKEY}` && HeaderKey !==APIKEY  && QueryKey !== APIKEY)){
        res.statusMessage = "Error on APIKEY, It might not be sent or is unvalid";
        return res.status(401).end();
    }

    next();
}

app.use( VerifyAPIKEY ); 

app.get( '/bookmarks', (req,res)=>{
    Bookmarks.getBookmarks()
    .then( result => {return res.status(200).json( result )
        })
    .catch( err => {res.statusMessage = "Database error";
    return res.status(500).end()
});
});

app.get('/bookmark', (req,res)=>{
    let title = req.query.title;
    if (!title){
        res.statusMessage = "A title was not received";
        res.status(406).end();
    }else{
    Bookmarks.getBookmarkTitle(title).then(result => {
        if(!result[0]){
            res.statusMessage = "Title not found";
            return res.status(404).end();
        }
        return res.status(200).json(result);
    }).catch( err => {res.statusMessage = "Database error"
    return res.status(500).end();});
}
return res;
});


app.post('/bookmarks', jsonParser, (req,res)=>{
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;

    if ( !title || !description || !url || !rating ){
        res.statusMessage = "At least one field is missing i.e: (title, description, url, rating)";
        return res.status(406).end();
    }

    let addBookmark = { id: uuid.v4(), title, description, url, rating};
    Bookmarks.addBookmark(addBookmark)
    .then(result => 
        {return res.status(201).json(result);
        })
    .catch(err => 
        {res.statusMessage = "Database error";
            return res.status(500).end();
        });
});

app.delete( '/bookmark/:id', (req, res)=>{
    let id = req.params.id;
    if (!id){
        res.statusMessage = "Id parameter is missing";
        return res.status(406).end();
    }

    Bookmarks.deleteBookmarkId(id)
    .then( result => {return res.status(200).json( result );})
    .catch( err => {res.statusMessage = "Database error"
    return res.status(500).end()
});

});

app.patch( '/bookmark/:id', jsonParser, (req, res)=>{
    let id = req.body.id;
    let title = req.body.title;
    let description = req.body.description;
    let url = req.body.url;
    let rating = req.body.rating;

    if (!id){
        res.statusMessage = "An id has not been received";
        return res.status(406).end();
    }

    let addBookmark = {title,description,url,rating};

    Bookmarks.getBookmarkId(id).then(selectedBookmark => {
        if(selectedBookmark.errmsg){
            res.statusMessage = "Id not found ";
            return res.status(404).end();
        }
        // Fills the data that is not received with the query
        if(!title)
            title = selectedBookmark[0].title
        if(!description)
            description = selectedBookmark[0].description
        if(!url)
            url = selectedBookmark[0].url
        if(!rating)
            rating = selectedBookmark[0].rating
        //Updates the values
        Bookmarks.patchBookmark(id,title,description,url,rating).then(
            patched => {
            if(patched.errmsg){
                res.statusMessage = "The data was not patched"
                return res.status(403).end() //When not patched
            } return res.status(202).json(patched) //When patched
        }).catch( err => {res.statusMessage = "Error when patching" //When error due to id
        return res.status(500).end()})
    }).catch( err => {res.statusMessage = "Id not found" //When error due to id
    return res.status(404).end()})
});

app.listen(8080, ()=>{
    console.log("Server running on http port");

new Promise( (resolve, reject)=>{
        mongoose.connect( "mongodb://localhost/bookmarksdb", 
        {useNewUrlParser : true, useUnifiedTopology: true}, (err)=>{
            if(err)
                reject(err);
            else{
                console.log("Database connected")
                return resolve();
            }
        });
    }).catch( err => {
        console.log("Could not connect to the database")
        mongoose.disconnect();
        console.log(err);
    })
});