import express from 'express'
import Post from '../models/post.js'
const router = express.Router()

// if(!sortBy) {
// 	const post = await Post.findById(id).sort({ createdAt: -1 })
// 	res.status(200).json(post)
// }
// else if(sortBy === 'createdAt:desc') {
// 	const post = await Post.findById(id).sort({ createdAt: -1 })
// 	res.status(200).json(post)
// }
// else if(sortBy === 'createdAt:asc') {
// 	const post = await Post.findById(id).sort({ createdAt: 1 })
// 	res.status(200).json(post)
// }
// else if(sortBy === 'price:desc') {
// 	const post = await Post.findById(id).sort({ price: -1 })
// 	res.status(200).json(post)
// }
// else if(sortBy === 'price:asc') {
// 	const post = await Post.findById(id).sort({ price: 1 })
// 	res.status(200).json(post)
// }


export const getPosts = async (req, res) => {
	//sorting variables are passed in query string as ?sortBy=createdAt:desc
	//if no query string is passed, default is createdAt:desc
	// filter by type (Auction, Price) and by tags (Art, Collectibles, etc) example: ?filterBy=type:Auction,tags:Art
	const { page, sortBy, filterBy } = req.query
	
	try {
		const LIMIT = 9
		const startIndex = (Number(page) - 1) * LIMIT
		const total = await Post.countDocuments({})

		//parseing sortBy query string
        const sortParams = sortBy ? { [sortBy.split(':')[0]]: sortBy.split(':')[1] === 'desc' ? -1 : 1 } : { createdAt: -1 };
		//parsing filterBy query string
		const filterParams = filterBy ? Object.fromEntries(filterBy.split(',').map(item => item.split(':'))) : {};


		const posts = await Post.find(filterParams).sort(sortParams).limit(LIMIT).skip(startIndex)
		res.status(200).json({
			data: posts,
			currentPage: Number(page),
			numberOfPages: Math.ceil(total / LIMIT),
		})
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
}

export const getPost = async (req, res) => {
	const { id } = req.params
	

	try {		
		const post = await Post.findById(id)
		res.status(200).json(post)
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
}

export const getPostsBySearch = async (req, res) => {
	const { searchQuery } = req.query

	try {
		const title = new RegExp(searchQuery, 'i')
		const posts = await Post.find({ title })
		res.json({ data: posts })
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
}

export const getPostsByUser = async (req, res) => {
	const { userID } = req.params

	if(!userID) return res.status(400).json({ message: 'No user ID provided' })

	try {
		const posts = await Post.find({ creator: userID })
		res.status(200).json(posts)
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
}

//request recieved to get posts by multiple tags
export const getPostsByCategory = async (req, res) => {
	const { tags } = req.params
	const tagsArray = tags.split(',')

	if(!tagsArray) return res.status(400).json({ message: 'No tags provided' })
	else if(tagsArray.length === 0) return res.status(400).json({ message: 'No tags provided' })


	try {
		const posts = await Post.find({ tags: { $in: tagsArray } })
		res.status(200).json(posts)
	} catch (error) {
		res.status(404).json({ message: error.message })
	}
}

export default router
