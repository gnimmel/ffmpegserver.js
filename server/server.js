/*
 * Copyright 2015, Gregg Tavares.
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are
 * met:
 *
 *     * Redistributions of source code must retain the above copyright
 * notice, this list of conditions and the following disclaimer.
 *     * Redistributions in binary form must reproduce the above
 * copyright notice, this list of conditions and the following disclaimer
 * in the documentation and/or other materials provided with the
 * distribution.
 *     * Neither the name of Gregg Tavares. nor the names of its
 * contributors may be used to endorse or promote products derived from
 * this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS
 * "AS IS" AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT
 * LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT
 * OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL,
 * SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT
 * LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
 * DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
 * THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

'use strict';

var path = require('path');
const fs = require('fs');
const os = require('os');


// Video Server
function startServer() {
  app.listen(apiPort, () => {
    console.log(`API port: ${apiPort}`);
  });
}

// API Server
var apiPort = 4000;

var express = require('express');
var playwright = require('playwright');
const cors = require('cors')

const model = require('../public/model');

if (process.pkg)
  model.init(path.join(__dirname ,'..', 'public', 'videos'));
else
  model.init(path.join(process.cwd(), 'public', 'videos'));


var app = express();
app.use(cors())
app.use(express.json());
app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(express.static(path.join(__dirname, '..', 'public', 'videos')));


const ejs = require('ejs');

app.post('/add-asset-data', async (req, res) => {
  const { id, emotion, lyrics } = req.body;

  // Validate request body
  if (!id || !lyrics || !emotion) {
    return res.status(400).json({
      message: 'Request body should contain id, lyrics, emotion',
    });
  }

  console.log(`Received data - id: ${id}, emotion: ${emotion}, lyrics: ${lyrics}}`);
  model.setAssetData(id, emotion, lyrics);

  res.status(202).json({
    message: 'data seeded successfully',
    id: id
  });

  res.send();
});

app.get('/get-sketch-by-id', (req, res) => {
  var id = req.query.id;
  
  try {
    if (model.getAssetData(id)) {
      // Read the HTML file
      fs.readFile(process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data) {
        if (err) {
          console.log("Read file failed:", err);
          res.status(500).send({ error: 'Internal server error' });
          return;
        }

        // Render the HTML file as an EJS template, passing the id as a parameter
        var html = ejs.render(data, { id: id, serverIp: model.getHostIP() });

        // Send the rendered HTML
        res.send(html);
      });
    } else {
      res.status(404).send({ error: 'No data found for this id' });
    }
  } catch (error) {
    console.log("Fetch asset data failed:", error);
    res.status(500).send({ error: 'Internal server error' });
  }
});

// TODO: clean this up and seperate set data from the playwright junk
app.post('/get-sketch', async (req, res) => {
  const { id, emotion, lyrics } = req.body;

  // Validate request body
  if (!id || !lyrics || !emotion) {
    return res.status(400).json({
      message: 'Request body should contain id, lyrics, emotion',
    });
  }

  console.log(`Received data - id: ${id}, emotion: ${emotion}, lyrics: ${lyrics}}`);
  model.setAssetData(id, emotion, lyrics);

  
  // Read the HTML file
  fs.readFile(process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data) {
    if (err) {
      console.log("Read file failed:", err);
      res.status(500).send({ error: 'Internal server error' });
      return;
    }

    // Render the HTML file as an EJS template, passing the id as a parameter
    var html = ejs.render(data, { id: id });

    // Send the rendered HTML
    res.send(html);
  });

});

  app.get('/kill-capture', (req, res) => {
    res.status(200).send({ success: 'killing playwright browser' });

    if (browser) {
        setTimeout(async () => {
            try {
                await browser.close();
                browser = null;
            } catch (error) {
                console.error('Error closing browser: ', error);
            }
        }, 1000); // delay of 1000ms (1 second)
    }
  });

  app.get('/assetdata/:id', (req, res) => {
    const id = req.params.id;
    //console.log("app.get /assetdata/id:" + id);

    if (model.getAssetData(id)) {
        res.json(model.getAssetData(id));
    } else {
        res.status(404).send({ error: 'No data found for this id' });
    }
  });

  //process.pkg ? path.join(__dirname ,'..', 'public', 'shareable.html') : path.join(process.cwd(), 'public', 'shareable.html'), 'utf8', function(err, data)

  app.get('/videos/:filename', function(req, res) {
    try {
      var filename = req.params.filename;
      var videoPath = path.resolve(__dirname, 'videos', filename);
      
      console.log("videoPath from get request: " + videoPath);

      // Check if file exists before sending
      fs.access(videoPath, fs.constants.F_OK, (err) => {
        if (err) {
          console.log(`File ${videoPath} does not exist`);
          res.status(404).send({ error: 'File not found' });
        } else {
          console.log("sending video");
          res.sendFile(videoPath);
        }
      });
    } catch (error) {
      console.log("An error occurred:", error);
      res.status(500).send({ error: 'Internal server error' });
    }
  });

  startServer();





