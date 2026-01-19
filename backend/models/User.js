const userSchema = new Schema({
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
    profileName: { 
        type: String, 
        trim: true 
    },
    phone: { 
        type: String, 
        trim: true 
    },
    avatar: String,
    role: { 
        type: String, 
        enum: ['guest', 'customer', 'staff', 'sale', 'admin'], 
        default: 'guest'
    },
    isActive: { 
        type: Boolean, 
        default: true 
    },
}, {timestamps: true});

export default mongoose.model('User', userSchema);