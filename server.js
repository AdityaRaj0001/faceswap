const express = require("express");
const axios = require("axios");
const cors = require("cors");
const multer = require("multer");
const port = 3000;
require('dotenv').config();
const app = express();


const storage = multer.memoryStorage(); // Store files in memory as buffers
const upload = multer({ storage: storage });

app.use(cors());
app.use(express.json());


app.post(
  "/faceswapkro",
  upload.fields([
    { name: "input_face_image", maxCount: 1 },
    { name: "target_face_image", maxCount: 1 },
  ]),
  async (req, res) => {
    try {
      const data = {
        input_face_image:
          req.files.input_face_image[0].buffer.toString("base64"),
        target_face_image:
          req.files.target_face_image[0].buffer.toString("base64"),
        file_type: req.files.input_face_image[0].mimetype.split("/")[1],
      };

      const segmindApiKey = process.env.Segmind_API_key;
      const picwishApiKey = process.env.Picwish_API_key;


      const response = await axios.post(
        "https://api.segmind.com/v1/sd2.1-faceswapper",
        data,
        {
          headers: {
            "x-api-key": segmindApiKey,
            "Content-Type":"application/json",
          },
          responseType:'arraybuffer'  
        }
      );


      const blobResponse = new Blob([response.data], { type: 'application/octet-stream' });
      const formData=new FormData();
      formData.append('image_file',blobResponse)
      formData.append('sync','1')
      formData.append('type','face')
      formData.append('scale_factor','4')
      formData.append('fix_face_only','1')

      const response2=await axios.post('https://techhk.aoscdn.com/api/tasks/visual/scale',formData,{
        headers:{
            'x-api-key':picwishApiKey,
            'Content-type':'multipart/form-data',
        },
      })

      res.send(response2.data.data)
    } catch (error) {
      console.error("Proxy error:", error.message);
      res.status(500).json({ error: "An error occurred" });
    }
  }
);

app.listen(port, () => {
  console.log("Proxy server up and running");
});
