const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const taskSchema = new Schema({
    taskText: {
        type: String,
        required: true,
    }
}, { timestamps: true });

const Task = mongoose.model('Task', taskSchema);

module.exports = Task;