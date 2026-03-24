const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const departmentSchema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    code: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        default: ''
    }
}, { timestamps: true });

//const Department = mongoose.model('Department', departmentSchema);
const Department = mongoose.model('Department', departmentSchema);
// const createDefaultDepartments = async () => {
//     console.log('Creating default departments...');
//     const defaultDepartments = [
//         { name: 'admin', description: 'Quản lý hệ thống' },
//         { name: 'staff', description: 'Nhân viên bán hàng' },
//         { name: 'sale', description: 'Nhân viên kinh doanh' }
//     ];

//     try {
//         const createdDepartments = await Department.insertMany(defaultDepartments);
//         console.log('Default departments created:', createdDepartments);
//     } catch (error) {
//         console.error('Error creating default departments:', error);
//     }
// };

// createDefaultDepartments();




module.exports = Department;

