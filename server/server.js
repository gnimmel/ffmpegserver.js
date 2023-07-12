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

var optionSpec = {
  options: [
    { option: 'help', alias: 'h', type: 'Boolean',  description: 'displays help'},
    { option: 'port', alias: 'p', type: 'Int',      description: 'port',  default: '8080'},
    { option: 'base-dir',         type: 'String',   description: 'folder to serve', default: 'public'},
    { option: 'video-dir',        type: 'String',   description: 'folder to save video files to', default: 'output'},
    { option: 'frame-dir',        type: 'String',   description: 'folder to save frames to', default: 'output'},
    { option: 'keep-frames',      type: 'Boolean',  description: 'do not delete the frames after encoding'},
    { option: 'allow-arbitrary-ffmpeg-arguments',      type: 'Boolean',  description: 'allow arbitrary ffmpeg arguments passed from browser', default: "false"},
  ],
  helpStyle: {
    typeSeparator: '=',
    descriptionSeparator: ' : ',
    initialIndent: 4,
  },
};

var optionator = require('optionator')(optionSpec);

try {
  var args = optionator.parse(process.argv);
} catch (e) {
  console.error(e);
  process.exit(1);  // eslint-disable-line
}

var printHelp = function() {
  console.log(optionator.generateHelp());
  process.exit(0);  // eslint-disable-line
};

if (args.help) {
  printHelp();
}

function startServer() {
  var VideoServer = require('./video-server');
  args.videoDir = path.join(process.cwd(), args.videoDir);
  args.frameDir = path.join(process.cwd(), args.frameDir);
  var server = new VideoServer(args);

  /*app.use(function(req, res, next) {
    //res.setHeader("Content-Security-Policy", "default-src 'self' http://localhost:8080");
    res.setHeader("Content-Security-Policy", "default-src * 'unsafe-inline' 'unsafe-eval'");
    next();
  });*/
  
  //app.use('/output', express.static(path.join(__dirname, 'output')));
  //app.use('/videos', express.static(path.join(__dirname, '/videos')));
  //app.use(express.static('/videos'));

  app.listen(apiPort, () => {
    console.log(`API port: ${apiPort}`);
  });
}

//var apiPort = process.env.PORT || 4000;
var apiPort = 4000;

var path = require('path');
var express = require('express');
//var puppeteer = require('puppeteer');
var playwright = require('playwright');

var app = express();

//app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/capture', async (req, res) => {
  const assetname = req.query.name;

  console.log(`app.get capture assetname: ${assetname}`);

  if (!assetname) {
    return res.status(400).send({ error: 'Missing name parameter' });
  }

  //const url = `http://uhhm-ffmpegserver.azurewebsites.net/:${args.port}/${assetname}`;
  //const url = `http://uhhm-ffmpegserver.azurewebsites.net:8081/uhhm-p5-flow.html?name=${assetname}`;
  const url = `http://localhost:8080/uhhm-capturer.html?name=${assetname}`;


  // Playwright junk
  try {
    //const browser = await puppeteer.launch({headless: false, executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',});
    //const page = await browser.newPage();
    const browser = await playwright.firefox.launch( { 
      args: [
        "--ipc=host", 
        "--mute-audio"
      ], 
      //executablePath: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      //executablePath: "/usr/bin/chromium",
      video: 'on', 
      headless: true, 
      //chromiumSandbox: false
    } ); 

    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('pageerror', err => {
      console.error('Page error: ', err.toString());
    });
    
    page.on('console', msg => {
      if (msg.type() === 'log') {
        for (let i = 0; i < msg.args().length; ++i)
          console.log(`${i}: ${msg.args()[i]}`);
      }
      if (msg.type() === 'error') {
        console.error(msg.text());
      }
    });
    await page.goto(url);
    console.log(`url opened: ${url}`);
    
    // Start the video capture.
    // Moving this to video.oncanplaythrough handler
    /*
    try {
      await page.click('#startButton');
    } catch (error) {
      console.error('Failed to click the start button:', error);
    }
    */

    // Assume the download URL will appear in an element with id 'downloadUrl'.
    try {
      await page.waitForSelector('#downloadUrl', { timeout: 60000 }); // wait
    } catch (error) {
      // The 'download-link' element didn't appear in time
      await browser.close();
      return res.status(500).send({ error: 'The download link did not appear in time' });
    }

    const videoUrl = await page.evaluate(() => {
      // This function runs in the browser context.
      const linkElement = document.querySelector('#downloadUrl');
      return linkElement ? linkElement.href : null;
    });

    await browser.close();

    if (videoUrl) {
      res.send({ videoUrl: videoUrl });
    } else {
      res.status(404).send({ error: 'Download URL not found' });
    }
  } catch (error) {
    // An unexpected error occurred.
    console.error(error);
    res.status(500).send({ error: 'Failed to get video URL' });
  }

  /*try {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url);
    const screenshot = await page.screenshot({ encoding: 'base64' });
    await browser.close();

    res.send({ screenshot: screenshot });
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: 'Failed to take screenshot' });
  }*/

  });

  app.get('/download/:filename', (req, res) => {
    const filename = req.params.filename;
    const filePath = path.join(__dirname, '../output', filename);
  
    res.download(filePath, (err) => {
      if (err) {
        res.status(404).send(`File not found: ${filePath}`);
      }
    });
  });

startServer();






