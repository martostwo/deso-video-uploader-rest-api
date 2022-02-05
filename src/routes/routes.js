
const { Router } = require('express');
const router = Router();//creamos un enrutador
const tus = require("tus-js-client");
const axios = require('axios').default;
let endpt = 'https://node.deso.org/api/v0/upload-video';

//creamos rutas:
router.post('/upload-video-deso', async (req, res) => {
    const { URL } = req.body;

    try {

        var videoResponse = await uploadVideo(endpt, URL);
        res.json(videoResponse);
        
    } catch (error) {
        res.status(500).send(error);
    }
    

});

//exportamos ruta:
module.exports = router;

//Funciones utilizadas en las rutas:
const uploadVideo = async (endpt, url) => {

    const res = await axios.request({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        responseEncoding: 'binary'
    });

    let size = res.data.length;
    let file = res.data;

    let response = await axios.request({
        method: 'POST',
        url: endpt,
        headers: {
            'Upload-Length': size
        }
    });

    const URL = response.headers['location'];
    const ID = URL.substring(37, 69);

    // Create a new tus upload
    var upload = new tus.Upload(file, {
        endpoint: URL,
        retryDelays: [0, 3000, 5000, 10000, 20000],
        uploadSize: size,
        onError: function (error) {
            console.log("Failed because: " + error)
        },
        onProgress: function (bytesUploaded, bytesTotal) {
            var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
            console.log(bytesUploaded, bytesTotal, percentage + "%")
        },
        onSuccess: function () {
            console.log("Download video from %s", upload.url);
        }
    })

    // Check if there are any previous uploads to continue.
    await upload.findPreviousUploads().then(function (previousUploads) {
        // Found previous uploads so we select the first one. 
        if (previousUploads.length) {
            upload.resumeFromPreviousUpload(previousUploads[0])
        }

        // Start the upload
        upload.start();

    });

    return { 'ID': ID, 'URL': URL, 'iframeURL': `https://iframe.videodelivery.net/${ID}` }
}


