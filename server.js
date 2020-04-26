const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const jsonParser = bodyParser.json();
const morgan = require('morgan');
const uuid = require('uuid');


const APIKEY = "2abbf7c3-245b-404f-9473-ade729ed4653";

app.use( morgan( 'dev' ));

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



let bookmarks = [ 
    {
        id: uuid.v4(),
        title: "Reddit",
        description: "A social network",
        url: "http://www.reddit.com",
        rating: 5
    },
    {
        id: uuid.v4(),
        title: "Facebook",
        description: "A social network",
        url: "http://www.facebook.com",
        rating: 5
    },
    {
        id: uuid.v4(),
        title: "Github",
        description: "A code repository",
        url: "http://www.github.com",
        rating: 5
    },
    {
        id: uuid.v4(),
        title: "Speed Test",
        description: "A webpage to do network speed test",
        url: "http://www.speedtest.net",
        rating: 5
    },
    {
        id: uuid.v4(),
        title: "What is my ip",
        description: "Shows the ip of the user",
        url: "https://www.whatismyip.com/",
        rating: 5
    },
    {
        id: uuid.v4(),
        title: "Wikipedia",
        description: "A knowleadge webpage",
        url: "https://www.wikipedia.org",
        rating: 5
    }
]

app.get( '/bookmarks', (req,res)=>{
    return res.status(200).json(bookmarks);
});

app.get('/bookmark', (req,res)=>{
    let title = req.query.title;
    if (!title){
        res.statusMessage = "A title was not received";
        res.status(406).end();
    }else{

    let found = bookmarks.filter(found => {
        found.title == title;
    });

    if(found.length == []){
        res.statusMessage = "Unvalid Title";
        res.status(404).end();
        
    }else{
        res.status(200).json(found);
    }
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
    bookmarks.push(addBookmark);
    return res.status(201).json(addBookmark);
});


app.delete( '/bookmark/:id', (req, res)=>{
    let id = req.params.id;
    if (!id){
        res.statusMessage = "Id parameter is missing";
        return res.status(406).end();
    }

    let idx = bookmarks.findIndex((element)=>{
       if( element.id == id)
           return true;
    });
    
    if(idx == -1){
       res.statusMessage = "ID not found";
       return res.status(404).end();
    }

    bookmarks.splice(idx,1);
    return res.status(200).end();
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

    if(id != req.params.id){
        res.statusMessage = "Id's are not the same";
        return res.status(409).end();
    }

    let bookmark = bookmarks.find((element)=>{
        return element.id == id;
    });

    if(!bookmark){
        res.statusMessage = "The bookmark was not found";
        return res.status(404).end();
    }

    if(title){
        bookmark.title = title;
    }
    if(description){
        bookmark.description = description;
    }
    if(url){
        bookmark.url = url;
    }
    if(rating){
        bookmark.rating = rating;
    }
    return res.status(202).json(bookmark);
});

app.listen(8080, ()=>{
    console.log("Server running on http port");
});
