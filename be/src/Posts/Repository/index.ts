import { ObjectId } from "mongodb"
import { env } from "../../config"
const Post = require("../Models/index")
const Comment = require("../Models/comments")
const User = require("../../Users/Models/index")

export const uploadPost = async(id:ObjectId,content:string,file:any)=>{
    try{
        if(file===''){
            console.log("reached here")
            const newPost = await new Post({userId:id,content:content})
            const insertedPost = await newPost.save()
            const addedPost  = await Post.findById(insertedPost._id)
            .populate({
                path: "userId",
                select: "_id userName url fullName email"
            })
            .sort({
                _id: -1
                })
                console.log("reached here",addedPost)
            return addedPost
        }
        else{
            const imageURL = `http://localhost:${env.PORT}/uploaded/${file}`
            const newPost = await new Post({userId:id,content:content,photo:imageURL})
            const insertedPost = await newPost.save()
            const addedPost  = await Post.findById(insertedPost._id)
            .populate({
                path: "userId",
                select: "_id userName url fullName email"
            })
            .sort({
                _id: -1
                })
            return addedPost
        }
    }
    catch(error){
        console.log(error)
        throw error
    }
}

// CURRENT USER WHOSE ID SEND + USERS FRIENDS POST RETURNED
export const getPost = async(id:string)=>{
    try{
        console.log("get post repo")
        const userId = new ObjectId(id)
        const user = await User.findById(userId)
        const friends = user.friends.toString().split(",") ?? []
        friends.push(id)
        const posts = await Post.find({})
                    .populate({
                    path: "userId",
                    select: "_id userName url fullName email"
                    })
                    // .skip(1)
                    // .limit(2)
                    .sort({
                    _id: -1
                    })
        
        const friendposts = posts?.filter((post:any)=>{
            return friends.includes(post.userId._id.toString())
        })

        // console.log("all post list",friendposts.length)
        return friendposts
    }
    catch(error){
        console.log(error)
        throw error
    }
}

export const postComments = async(postId:string,userId:any,comment:string)=>{
    try{
        const postID = new ObjectId(postId)
        const userID = new ObjectId(userId)
        const newComment = await new Comment({userId:userID,postId:postID,comment:comment})
        const insertedComment = await newComment.save()
        const addedComment  = await Comment.findById(insertedComment._id)
        .populate({
            path: "userId",
            select: "_id userName url fullName email"
        })
        .sort({
            _id: -1
            })
        // console.log("reached here",addedComment)
        return addedComment
    }
    catch(error){
        console.log(error)
        throw error
    }
  }

export const getComments = async(postId:string)=>{
    try{
        console.log("get post repo")
        const userId = new ObjectId(postId)
    
        const comments = await Comment.find({postId:postId})
                    .populate({
                    path: "userId",
                    select: "_id userName url fullName email"
                    })
                    .sort({
                    _id: -1
                    })

        // const comments = ["hithere","always here"]
        return comments
    }
    catch(error){
        console.log(error)
        throw error
    }
}

export const deleteComments = async(commentId:string)=>{
    try{
        console.log("get post repo")
        console.log(commentId)
        const Id = new ObjectId(commentId)
    
        const comment = await Comment.findById(Id)
        if(comment){
            const deleteComment = await Comment.deleteOne({_id:Id})
            return deleteComment
        }
        else{
            return "No comment to delete"
        }        
    }
    catch(error){
        console.log(error)
        throw error
    }
}

export const likePost = async(postId:string,userId:any)=>{
    try{
        const postID = new ObjectId(postId)
        const userID = new ObjectId(userId)
        const checkPost = await Post.findById(postID)
        const checkUser = await User.findById(userID)
        // console.log("here here",postID,userID)
        if(checkUser && checkPost){
            const index = checkPost.likes.findIndex((id:any)=> id===userId)
            if(index ===-1){
                checkPost.likes.push(userId)
                console.log("here here",checkPost)
            }
            else{
                checkPost.likes = checkPost.likes.filter((id:any)=> id !==userId) 
            }
            const updatePost = await Post.findByIdAndUpdate(postID,checkPost,{new:true})
            return updatePost
        }
        else{
            throw Error("Post not found")
        }
    }
    catch(error){
        console.log(error)
        throw error
    }
  }