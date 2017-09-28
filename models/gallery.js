const mongoose = require('mongoose')
const Schema = mongoose.Schema

const gallerySchema = new Schema({
	image_url: String,
	cloudinary_id: String,
	date_created: {
		type: Date,
		default: Date.now()
	}
})

module.exports = mongoose.model('image', gallerySchema)
