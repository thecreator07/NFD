import mongoose, { Schema } from 'mongoose';

const DoctorAppointmentSchema = new Schema({
    patient: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the User collection
        required: true
    },
    doctor: {
        type: Schema.Types.ObjectId,
        ref: 'User', // Reference to the Doctor collection
        required: true
    },
    appointmentDate: {
        type: Date,
        // required: true
    },
    appointmentTime: {
        type: String,
        // required: true // Use a string to handle time in HH:MM format
    },
    reasonForVisit: {
        type: String,
        // required: false
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Completed', 'Cancelled'],
        default: 'Scheduled'
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

export const DoctorAppointment = mongoose.model('DoctorAppointment', DoctorAppointmentSchema);
