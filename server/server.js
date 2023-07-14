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


// Define the output directory path in the user's home directory
const outputDirPath = path.join(os.homedir(), 'output');

// Check if the directory exists
if (!fs.existsSync(outputDirPath)) {
    // If the directory doesn't exist, create it
    fs.mkdirSync(outputDirPath, { recursive: true, mode: 0o755 });
} else {
    // If the directory already exists, update its permissions to be read/write
    fs.chmodSync(outputDirPath, 0o755);
}

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

  const ffmpeg = require('@ffmpeg-installer/ffmpeg');
  //const { exec } = require('child_process');

  console.log(ffmpeg.path, ffmpeg.version);
}

//var apiPort = process.env.PORT || 4000;
var apiPort = 4000;

var express = require('express');
var playwright = require('playwright');

var app = express();
//app.use(express.static('public'));
//app.use('../public', express.static(path.join(__dirname, '../public')));

//app.get('/favicon.ico', (req, res) => res.status(204));

app.get('/list-all-files', (req, res) => {
  const directoryPath = path.join(__dirname, '../public');
  fs.readdir(directoryPath, function (err, files) {
    if (err) {
      return res.status(500).send('Unable to scan directory: ' + err);
    } 
    res.send(files);
  });
});

/*app.get('/uhhm-capturer.html', (req, res) => {
  const filePath = path.join(__dirname, 'public', 'uhhm-capturer.html');
  if (fs.existsSync(filePath)) {
      res.sendFile(filePath);
  } else {
      res.status(404).send('File not found');
  }
});*/

let browser = null;

app.get('/capture', async (req, res) => {
  const assetname = req.query.name;

  console.log(`app.get capture assetname: ${assetname}`);

  if (!assetname) {
    return res.status(400).send({ error: 'Missing name parameter' });
  }

  if (process.pkg)
    console.log(`I'm in the pkg WOOHOO: ${process.execPath}`);

  const html = 'uhhm-capturer.html';
  const filePath = path.join(__dirname, '../public', html);
  console.log(`path: ${filePath}`);
  
  
  //const url = "http://localhost:8080/launch-capturer";// + html + '?name=' + assetname;
  const url = "http://localhost:8080/uhhm-capturer.html";// + html + '?name=' + assetname;
  console.log(`url: ${url}`);

  //const file = path.join(__dirname, '../public', 'uhhm-capturer.html');
  //console.log(`path: ${file}`);
  //const capUrl = new url.URL('file://' + file);

  //capUrl.searchParams.append('name', assetname);
  //url.searchParams.append('lyrics', '');

  //path.join(__dirname, 'uhhm-capturer.html');
  //const url = `http://localhost:8080/uhhm-capturer.html?name=${assetname}`;


  let execPath;
  if (process.platform === 'win32') {
    // Windows
    execPath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';
  } else if (process.platform === 'linux') {
    // Linux
    execPath = '';
  } else if (process.platform === 'darwin') {
    // macOS
    execPath = '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge';
  }

  // Playwright junk
  try {
    //const browser = await puppeteer.launch({headless: false, executablePath: '/Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome',});
    //const page = await browser.newPage();
    browser = await playwright.chromium.launch( { 
      args: [
        "--ipc=host", 
        "--mute-audio"
      ], 
      //executablePath: "/Applications/Google Chrome Canary.app/Contents/MacOS/Google Chrome Canary",
      executablePath: execPath,
      video: 'on', 
      headless: false, 
      chromiumSandbox: false
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

    res.status(202).json({
      message: 'Playwright process launched successfully',
      assetname: assetname
    });

    res.send();

    // Assume the download URL will appear in an element with id 'downloadUrl'.
   /*try {
      await page.waitForSelector('#downloadUrl'); //, { timeout: 20000 }); // wait
      //await page.waitForFunction('document.querySelector("#progress").innerText.includes("100")', { timeout: 60000 });

    } catch (error) {
      // The 'download-link' element didn't appear in time
      await browser.close();
      return res.status(500).send({ error: 'The download link did not appear in time' });
    }*/

    /*const videoUrl = await page.evaluate(() => {
      // This function runs in the browser context.
      const linkElement = document.querySelector('#downloadUrl');
      return linkElement ? linkElement.href : null;
    });*/

    /*if (videoUrl) {
      res.send({ videoUrl: videoUrl });
    } else {
      res.status(404).send({ error: 'Download URL not found' });
    }*/

  } catch (error) {
    // An unexpected error occurred.
    console.error(error);
    res.status(500).send({ error: 'Playwright failed' });
    if (browser) {
      await browser.close();
      browser = null;
    }
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

  app.get('/kill-capture', (req, res) => {
    if (browser) {
      browser.close();
      browser = null;
    }
    res.status(200).send({ success: 'Playwright killed' });
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






