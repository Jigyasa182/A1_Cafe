import mongoose from "mongoose";

const tableSchema = new mongoose.Schema({
	name: {
		type: String,
		required: [true, "Seat name is required"],
		unique: true
	},
	capacity: {
		type: Number,
		default: 4
	},
	status: {
		type: String,
		enum: ['available', 'occupied', 'reserved'],
		default: 'available'
	},
	qrCodeLink: {
		type: String,
		required: false
	}
}, {
	timestamps: true
});

const tableModel = mongoose.models.table || mongoose.model("table", tableSchema);

export default tableModel;