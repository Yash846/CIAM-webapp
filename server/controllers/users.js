import mongoose from 'mongoose'
import { jwtDecode } from "jwt-decode";

const Stats = mongoose.model("Stats");

const getStats = async (req, res) => {
  let index = req.rawHeaders.indexOf('access_token');
  
  let token = req.rawHeaders[index+1]
  let jsonRes = jwtDecode(token)


  if(jsonRes.app_id){
    Stats.find(
      function (err, data) {
          if (err) {
              console.log(err);
          }
          else {
            res.send(data);
          }
    });
  } else {
    res.status(401).send({
      errMessage: 'Unauthorized access'
    })
  }


}


export {
    getStats
}


