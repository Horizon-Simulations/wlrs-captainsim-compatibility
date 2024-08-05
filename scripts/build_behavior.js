/*
Copyright (c) 2021 FlyByWire Simulations

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

'use strict';

const fs = require('fs');
const fse = require('fs-extra');
const path = require('path');

function* readdir(d) {
    for (const dirent of fs.readdirSync(d, { withFileTypes: true })) {
        if (['layout.json', 'manifest.json'].includes(dirent.name)) {
            continue;
        }
        const resolved = path.join(d, dirent.name);
        if (dirent.isDirectory()) {
            yield* readdir(resolved);
        } else {
            yield resolved;
        }
    }
}

const MS_FILETIME_EPOCH = 116444736000000000n;
const behavior = path.resolve(__dirname, '..', 'horizonsim-captainsim-boeing-behavior');
const behavior_dest = path.resolve(__dirname, '..', 'build' ,'horizonsim-captainsim-boeing-behavior');

const contentEntries = [];
let totalPackageSize = 0;

// Generate behavior package
for (const filename of readdir(behavior)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(behavior, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(behavior, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(behavior, 'manifest.json'), JSON.stringify({
    ...require('../manifest-behavior.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(behavior_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${behavior_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(behavior, behavior_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Behavior file Copy completed!')
    });
});