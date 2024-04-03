import mongoose from 'mongoose'
import "./models/stats.model.js";


mongoose.connect("mongodb://localhost:27017/Users", { useNewUrlParser: true },
  err => {
    if (!err) {
      console.log("Connection succeeded");
    } else {
      console.log("Error in connection: " + err);
    }
  }

);


