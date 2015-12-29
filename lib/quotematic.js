'use strict';

const spawn = require('child_process').spawn;
const Stream = require('stream').Stream;
const toArray = require('stream-to-array');


class QuoteMatic {
    constructor(src) {
        this.command = 'convert';
        this._in = [];
        this._out = [];

        if(src instanceof Stream) {
            this.isStream = true;
            this.stream = src;
            this.src = '-';
        } else {
            this.src = src;
        }
    }

    text(text) {
        this._out.push(`caption:${text}`);
        return this;
    }

    background(color) {
        this._out.push('-background', color);
        return this;
    }

    fill(color) {
        this._out.push('-fill', color);
        return this;
    }

    font(font) {
        this._out.push('-font', font);
        return this;
    }

    fontSize(size) {
        this._out.push('-pointsize', size);
        return this;
    }

    geometry(geometry) {
        this._out.push('-geometry', geometry);
        return this;
    }

    composite(background) {
        this._in.push(background);
        this._out.push('-composite');
        return this;
    }

    resize(size) {
        this._out.push('-resize', size);
        return this;
    }

    size(size) {
        this._out.push('-size', size);
        return this;
    }

    stream(format) {
        this.name = '-';
        this.format = format || 'png';

        return this._execute(this._args(), false);
    }

    write(name) {
        if(!name) {
            throw new Error('Invalid output name');
        }

        this.name = name;
        this.format = this._guessFormat(name) || 'png';
        return this._execute(this._args(), true);
    }

    _execute(args, buffer) {
        return new Promise((resolve, reject) => {
            let imagickProcess;

            this._debug();

            try {
                imagickProcess = spawn(this.command, args);
            } catch(e) {
                reject(e);
            }

            if(this.isStream) {
                this._toBuffer(this.stream).then(buffer => {
                    imagickProcess.stdin.write(buffer);
                    imagickProcess.stdin.end();
                });
            }

            if(buffer) {
                let stdOut;
                let stdErr;

                imagickProcess.stdout.on('data', function (data) {
                    stdOut += data;
                });

                imagickProcess.stderr.on('data', function (data) {
                    stdErr += data;
                });

                imagickProcess.on('error', function (error) {
                    reject(error);
                });

                imagickProcess.on('close', function (code, signal) {
                    if(code !== 0) {
                        reject(new Error(stdErr));
                    }

                    if(buffer) {
                        resolve(stdOut);
                    } else {
                        resolve();
                    }
                });
            } else {
                resolve(imagickProcess.stdout);
            }

        });
    }

    _args() {
        let args = [].concat(this._in, this.src, this._out);

        if(this.name) {
            args.push(`${this.format}:${this.name}`);
        }

        return args.filter(Boolean);
    }

    _guessFormat(name) {
        return name.split('.').pop();
    }

    _debug() {
        process.stdout.write(`${this.command} ${this._args().join(' ')}\n`);
    }

    _toBuffer(stream) {
        return new Promise((resolve, reject) => {
            toArray(stream)
                .then(function (parts) {
                    let buffers = [];
                    for (var i = 0, l = parts.length; i < l ; ++i) {
                        const part = parts[i];
                        buffers.push((part instanceof Buffer) ? part : new Buffer(part));
                    }
                    resolve(Buffer.concat(buffers));
                });
        });
    }
}

module.exports = QuoteMatic;