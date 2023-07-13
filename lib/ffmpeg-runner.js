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
 * THEORY OF2 LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

const debug = require('debug')('ffmpeg-runner');
const { EventEmitter } = require('events');
const ffmpeg = require('ffmpeg-static');
const { spawn } = require('child_process');
const os = require('os');
const { exec } = require('child_process');

class FFMpegRunner {
  constructor(args) 
  {
    this.emitter = new EventEmitter();
    let cmd;
    if (os.type() == 'Linux')
      cmd = 'ffmpeg';
    else
      cmd = ffmpeg;

    exec(`${ffmpeg.path} -version`, (error, stdout, stderr) => {
      if (error) {
        console.error(`exec error: ${error}`);
        return;
      }
      console.log(`stdout: ${stdout}`);
      console.error(`stderr: ${stderr}`);
    });
    console.log(`${cmd} ${args.join(' ')}`);
    //debug(`${cmd} ${args.join(' ')}`);

    console.log(`SPAWN ffmpeg:: ${cmd}`);
    const proc = spawn(cmd, args);
    const stdout = [];
    const stderr = [];
    const frameNumRE = /frame= *(\d+) /;

    proc.stdout.on('data', (data) => {
      const str = data.toString();
      const lines = str.split(/(\r?\n)/g);
      stdout.push(...lines);
    });

    proc.stderr.on('data', (data) => {
      const str = data.toString();
      const fndx = str.lastIndexOf('frame=');
      if (fndx >= 0) {
        const m = frameNumRE.exec(str.substr(fndx));
        if (m) {
          this.emitter.emit('frame', parseInt(m[1]));
        }
      }
      const lines = str.split(/(\r?\n)/g);
      stderr.push(...lines);
    });

    proc.on('close', (code) => {
      console.log(`FFMpegRunner::close code: ${code}`);
      const result = {
        code: parseInt(code),
        stdout: stdout.join(''),
        stderr: stderr.join(''),
      };
      if (result.code !== 0) {
        this.emitter.emit('error', result);
        console.log('FFMpegRunner::emit error');
        console.log(result);
      } else {
        this.emitter.emit('done', result);
        console.log('FFMpegRunner::emit done');
        console.log(result);
      }
    });
  }

  on(event, listener) {
    this.emitter.on(event, listener);
  }
}

module.exports = FFMpegRunner;



