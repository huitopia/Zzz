const mongoose = require('mongoose');

const { Schema } = mongoose;
const autoIncrement = require('mongoose-auto-increment');
require('dotenv').config();
/// /var connection = mongoose.createConnection("mongodb://test:test@54.180.109.58:27017");
// autoIncrement.initialize(connection);

const asmrSchema = new Schema(
	{
		categoryIdx: { type: Number, required: true },
		categoryName: { type: String, required: true },
		title: { type: String, required: true },
		asmrUrl: { type: String, default: null },
		iconUrl: { type: String, default: null },

	},
	{ timestamps: true },
);

// asmrSchema.plugin(autoIncrement.plugin, {
// 	model: '_id',
// 	field: 'id',
// 	startAt: 0,
// 	increment: 1
// })

module.exports = mongoose.model('asmr', asmrSchema);
