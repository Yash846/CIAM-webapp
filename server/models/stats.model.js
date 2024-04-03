import mongoose from 'mongoose'

var statsSchema = new mongoose.Schema({

    projectId: {
        type: String,
        required: 'This field is required'
    },
    projectName: {
        type: String
    },

    projectOwner: {
        type: String,
        required: 'This field is required'
    }
});

mongoose.model("Stats", statsSchema);

