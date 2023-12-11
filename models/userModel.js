const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = mongoose.Schema({
    name: {
        type:String,    
        require: [true, 'musst have the "name" filed']
    },
    email: {
        type: String,
        require: [true, 'must have the "email" filed'],
        unique: true,
        lowercase: true,
        validate: [function (val) {
            if(val.includes('@') && val.includes('.')) {
                return val.indexOf('@') < val.lastIndexOf('.') 
                        && val.lastIndexOf('.') < (val.length - 2)
                        && val.indexOf('@') > 1;
            }
            return false;
        }, 'Email is not in the correct format']
    },
    photo: {
        type: String,
        default: 'default.jpg'
    },
    role: {
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        require:[true, 'must have the "password" field'],
        minLength: 8,
        select: false // k tự động được hiển thị khi có get request
    },
    passwordConfirm: {
        type: String,
        require: [true, 'must have the "passwordwordConfirm" field'],
        validate: [function(val) {
            return val === this.password; // "this"chỉ có tác dụng khi create hoặc save method
        }, 'Passwords are not the same']
    },
    changePasswordAt: {
        type: Date,
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

// hash password khi create hoặc update password
userSchema.pre('save',async function(next) {
    // Nếu người dùng không update password -> next()
    if(!this.isModified('password')) next();

    this.password = await bcrypt.hash(this.password, 10) // tham số "10" thể hiện mức độ sử dụng CPU => càng lớn càng tốn time
    this.passwordConfirm = undefined; // trường này tạo ra trong Schema chỉ để buộc người dùng confirm mật khẩu chứ không lưu vào database

    next();
});

// update filed changePasswordAt
userSchema.pre('save', function(next) {
    if(!this.isModified('password') || this.isNew) next();
    this.changePasswordAt = Date.now() - 1000; // -1000 vì có 1 số TH token sẽ được tạo trước khi change pass
    next();
});

// khi find user, chỉ select user có "active: true" (chưa xóa)
userSchema.pre(/^find/, function (next) {
    this.find({ active: {$ne: false} });
    next();
});

// Tạo method kiểm tra password trên tất cả document được tạo bởi userSchema
userSchema.methods.checkPassword = async (passwordInput, passwordHash) => {
    return await bcrypt.compare(passwordInput, passwordHash);
};

// check đã thay đổi password sau khi login
userSchema.methods.changePasswordAfter = function (timeCreateToken) {
    if(!this.changePasswordAt) return false;
    return timeCreateToken < Math.floor(this.changePasswordAt.getTime() / 1000);
}

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.passwordResetExpires = Date.now() + 20*60*1000;
    return resetToken;
}

const UserModel = new mongoose.model("User", userSchema);

module.exports = UserModel;