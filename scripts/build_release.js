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
const base = path.resolve(__dirname, '..', 'wlrs-captainsim-boeing-base');
const base_dest = path.resolve(__dirname, '..', 'build' ,'wlrs-captainsim-boeing-base');
const b77l = path.resolve(__dirname, '..', 'wlrs-captainsim-b77l');
const b77l_dest = path.resolve(__dirname, '..', 'build' ,'wlrs-captainsim-b77l');
const b77w = path.resolve(__dirname, '..', 'wlrs-captainsim-b77w');
const b77w_dest = path.resolve(__dirname, '..', 'build' ,'wlrs-captainsim-b77w');
const b772 = path.resolve(__dirname, '..', 'wlrs-captainsim-b772');
const b772_dest = path.resolve(__dirname, '..', 'build' ,'wlrs-captainsim-b772');
const b764 = path.resolve(__dirname, '..', 'wlrs-captainsim-b764');
const b764_dest = path.resolve(__dirname, '..', 'build' ,'wlrs-captainsim-b764');

const contentEntries = [];
let totalPackageSize = 0;

// Generate base package
for (const filename of readdir(base)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(base, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(base, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(base, 'manifest.json'), JSON.stringify({
    ...require('../manifest-base.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(base_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${base_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(base, base_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Copy completed!')
    });
});

// Generate b77l package
for (const filename of readdir(b77l)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(b77l, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(b77l, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(b77l, 'manifest.json'), JSON.stringify({
    ...require('../manifest-b77l.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(b77l_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${b77l_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(b77l, b77l_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Copy completed!')
    });
});

// Generate b77w package
for (const filename of readdir(b77w)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(b77w, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(b77w, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(b77w, 'manifest.json'), JSON.stringify({
    ...require('../manifest-b77w.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(b77w_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${b77w_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(b77w, b77w_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Copy completed!')
    });
});

// Generate b772 package
for (const filename of readdir(b772)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(b772, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(b772, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(b772, 'manifest.json'), JSON.stringify({
    ...require('../manifest-b772.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(b772_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${b772_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(b772, b772_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Copy completed!')
    });
});

// Generate b764 package
for (const filename of readdir(b764)) {
    const stat = fs.statSync(filename, { bigint: true });
    contentEntries.push({
        path: path.relative(b764, filename.replace(path.sep, '/')),
        size: Number(stat.size),
        date: Number((stat.mtimeNs / 100n) + MS_FILETIME_EPOCH),
    });
    totalPackageSize += Number(stat.size);
}

fs.writeFileSync(path.join(b764, 'layout.json'), JSON.stringify({
    content: contentEntries,
}, null, 2));

fs.writeFileSync(path.join(b764, 'manifest.json'), JSON.stringify({
    ...require('../manifest-b764.json'),
    package_version: require('../package.json').version,
    total_package_size: totalPackageSize.toString().padStart(20, '0'),
}, null, 2));

// delete directory recursively if it exists
fs.rm(b764_dest, { recursive: true }, (err) => {
    if (err && err.errno != -4058) {
        //throw err;
        console.error(err);
    }

    console.log(`${b764_dest} is deleted!`);

    // To copy a folder or file
    fse.copy(b764, b764_dest, function (err) {
        if (err){
            console.log('An error occurred while copying the folder.')
            return console.error(err)
        }
        console.log('Copy completed!')
    });
});
