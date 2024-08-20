import Mongoose, { Schema } from "mongoose";


const TestSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: "User"
    },
    tests: [{
        testName: {
            type: String
        },
        price: { type: Number }
    }],
    description: {
        type: String,
    },
    totalprice: {
        type: Number,
        // required: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true })

TestSchema.pre('save', function (next) {
    // Calculate the total price based on the tests array
    this.totalprice = this.tests.reduce((sum, test) => sum + (test.price || 0), 0);
    next();
});

// Middleware to handle updates (e.g., adding or removing tests)
TestSchema.pre('findOneAndUpdate', function (next) {
    const update = this.getUpdate();

    if (update.$set && update.$set.tests) {
        // Calculate the new total price based on the updated tests array
        const totalPrice = update.$set.tests.reduce((sum, test) => sum + (test.price || 0), 0);
        update.$set.totalprice = totalPrice;
    }
    next();
});

export const Test = Mongoose.model("Test", TestSchema)