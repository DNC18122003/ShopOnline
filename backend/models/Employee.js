const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const addressSchema = new Schema(
    {
        street: String,
        ward: String,
        province: String,
        note: String,
    },
    { _id: false }
);

const employeeSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    password: {
        type: String,
        default: null
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true
    },
    userName: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    fullName: {
        type: String,
        trim: true
    },
    phone: {
        type: String,
        trim: true
    },
    avatar: String,
    role: {
        type: Schema.Types.ObjectId,
        ref: 'Department',
        required: true
    },
    address: addressSchema,

    regionManaged: {
        type: String,
        enum: ['north', 'central', 'south']
    },
    isActive: {
        type: String,
        enum: ['active', 'inactive', 'banned'],
        default: 'inactive'
    },
}, { timestamps: true });

const Employee = mongoose.model('Employee', employeeSchema);
module.exports = Employee;