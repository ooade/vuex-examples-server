const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
const cors = require('cors')
const app = express()
const multer = require('multer')
const cloudinary = require('./cloudinary')

const MONGO_URI =
	process.env.NODE_ENV === 'development'
		? 'mongodb://localhost:27017/rest'
		: 'mongodb://heroku_n79hjktw:gcqfmli458nv5cbbvaseev8kfb@ds149124.mlab.com:49124/heroku_n79hjktw'

mongoose.Promise = global.Promise

mongoose.connect(MONGO_URI, {
	useMongoClient: true
})

app.use(cors())

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }))

// parse application/json
app.use(bodyParser.json())

const Gallery = require('./models/gallery')

// let multer handle mutipart/form-data
const upload = multer({ storage: multer.diskStorage({}) })

app.post('/api/images', upload.single('file'), (req, res) => {
	cloudinary.v2.uploader.upload(req.file.path, (err, result) => {
		if (!err) {
			// no error? add image to gallery
			const gallery = new Gallery({
				image_url: result.secure_url,
				cloudinary_id: result.public_id
			})

			gallery.save()
			res.json(gallery)
		}
	})
})

app.get('/api/images', (req, res) =>
	// give us the list in descending order
	Gallery.find()
		.sort({ _id: -1 })
		.then(images => res.json(images))
)

app.post('/api/delete/images', (req, res) => {
	Gallery.findById(req.body._id).then(image => {
		cloudinary.v2.uploader.destroy(req.body.cloudinary_id, (err, result) => {
			if (!err) {
				Gallery.remove(image, () => res.json(image))
			}
		})
	})
})

const PORT = process.env.PORT || 3000

app.listen(PORT, () => console.log(`Server Listening on PORT ${PORT}`))
