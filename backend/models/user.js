
const userSchema = mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, unique: true, lowercase: true, trim: true, required: true },
    password:{type: String, required: true },
    createdAt : { type: Date, default: Date.now }

});

module.exports = mongoose.model('User', userSchema);