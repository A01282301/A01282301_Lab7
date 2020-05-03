const mongoose = require("mongoose");

//Schema for the data on the db

const bookmarksCollSch = mongoose.Schema({
    id : {
        type : String,
        required : true,
        unique : true
    },
    title : {
        type : String,
        required : true
    },
    description : {
        type : String,
        required : true
    },
    url : {
        type : String,
        required : true
    },
    rating : {
        type : Number,
        required : true
    }
});

const bookmarksCollection = mongoose.model("bookmarksModel", bookmarksCollSch);

//Function list for bookmarks
const Bookmarks = {
    addBookmark(newBookmark){ 
        return bookmarksCollection.create(newBookmark)
        .then( createdBookmark => {
            return createdBookmark
        })
        .catch(err=>{
            return err
        })
    },
    getBookmarks(){
        return bookmarksCollection.find()
        .then(allBookmarks => {
            return allBookmarks
        })
        .catch(err=>{
            return err
        })
    },
    getBookmarkTitle(title){
        return bookmarksCollection.find({title : title})
        .then(foundBookmarks => {
            return foundBookmarks
        })
        .catch(err=>{
            return err
        })
    },
    getBookmarkId(id){
        return bookmarksCollection
        .find({id : id})
        .then(foundBookmarks => {
            return foundBookmarks
        })
        .catch(err=>{
            return err
        })
    },
   
    patchBookmark(id,title,description,url,rating){
        return bookmarksCollection.updateOne({id : id},
        {$set: {title:title, description:description, url:url, rating:rating}}).
        then(editedBookmark => {
            return editedBookmark
        })
        .catch( err=>{
            return err
        })
    },
    deleteBookmarkId(id){
        return bookmarksCollection.deleteOne({id : id})
        .then(deletedBookmarks => {
            return deletedBookmarks
        })
        .catch(err=>{
            return err
        })
    }
};

module.exports = {Bookmarks};