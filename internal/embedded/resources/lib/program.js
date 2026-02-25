var __webpack_modules__ = {
    9662(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const mkdirsSync = __webpack_require__(2924).mkdirsSync;
        const utimesMillisSync = __webpack_require__(721).utimesMillisSync;
        const stat = __webpack_require__(9276);
        function copySync(src, dest, opts) {
            if (typeof opts === "function") {
                opts = {
                    filter: opts
                };
            }
            opts = opts || {};
            opts.clobber = "clobber" in opts ? !!opts.clobber : true;
            opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
            if (opts.preserveTimestamps && process.arch === "ia32") {
                process.emitWarning("Using the preserveTimestamps option in 32-bit node is not recommended;\n\n" + "\tsee https://github.com/jprichardson/node-fs-extra/issues/269", "Warning", "fs-extra-WARN0002");
            }
            const {srcStat, destStat} = stat.checkPathsSync(src, dest, "copy", opts);
            stat.checkParentPathsSync(src, srcStat, dest, "copy");
            return handleFilterAndCopy(destStat, src, dest, opts);
        }
        function handleFilterAndCopy(destStat, src, dest, opts) {
            if (opts.filter && !opts.filter(src, dest)) return;
            const destParent = path.dirname(dest);
            if (!fs.existsSync(destParent)) mkdirsSync(destParent);
            return getStats(destStat, src, dest, opts);
        }
        function startCopy(destStat, src, dest, opts) {
            if (opts.filter && !opts.filter(src, dest)) return;
            return getStats(destStat, src, dest, opts);
        }
        function getStats(destStat, src, dest, opts) {
            const statSync = opts.dereference ? fs.statSync : fs.lstatSync;
            const srcStat = statSync(src);
            if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts); else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts); else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts); else if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`); else if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
            throw new Error(`Unknown file: ${src}`);
        }
        function onFile(srcStat, destStat, src, dest, opts) {
            if (!destStat) return copyFile(srcStat, src, dest, opts);
            return mayCopyFile(srcStat, src, dest, opts);
        }
        function mayCopyFile(srcStat, src, dest, opts) {
            if (opts.overwrite) {
                fs.unlinkSync(dest);
                return copyFile(srcStat, src, dest, opts);
            } else if (opts.errorOnExist) {
                throw new Error(`'${dest}' already exists`);
            }
        }
        function copyFile(srcStat, src, dest, opts) {
            fs.copyFileSync(src, dest);
            if (opts.preserveTimestamps) handleTimestamps(srcStat.mode, src, dest);
            return setDestMode(dest, srcStat.mode);
        }
        function handleTimestamps(srcMode, src, dest) {
            if (fileIsNotWritable(srcMode)) makeFileWritable(dest, srcMode);
            return setDestTimestamps(src, dest);
        }
        function fileIsNotWritable(srcMode) {
            return (srcMode & 128) === 0;
        }
        function makeFileWritable(dest, srcMode) {
            return setDestMode(dest, srcMode | 128);
        }
        function setDestMode(dest, srcMode) {
            return fs.chmodSync(dest, srcMode);
        }
        function setDestTimestamps(src, dest) {
            const updatedSrcStat = fs.statSync(src);
            return utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
        }
        function onDir(srcStat, destStat, src, dest, opts) {
            if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts);
            return copyDir(src, dest, opts);
        }
        function mkDirAndCopy(srcMode, src, dest, opts) {
            fs.mkdirSync(dest);
            copyDir(src, dest, opts);
            return setDestMode(dest, srcMode);
        }
        function copyDir(src, dest, opts) {
            fs.readdirSync(src).forEach(item => copyDirItem(item, src, dest, opts));
        }
        function copyDirItem(item, src, dest, opts) {
            const srcItem = path.join(src, item);
            const destItem = path.join(dest, item);
            const {destStat} = stat.checkPathsSync(srcItem, destItem, "copy", opts);
            return startCopy(destStat, srcItem, destItem, opts);
        }
        function onLink(destStat, src, dest, opts) {
            let resolvedSrc = fs.readlinkSync(src);
            if (opts.dereference) {
                resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
            }
            if (!destStat) {
                return fs.symlinkSync(resolvedSrc, dest);
            } else {
                let resolvedDest;
                try {
                    resolvedDest = fs.readlinkSync(dest);
                } catch (err) {
                    if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs.symlinkSync(resolvedSrc, dest);
                    throw err;
                }
                if (opts.dereference) {
                    resolvedDest = path.resolve(process.cwd(), resolvedDest);
                }
                if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
                    throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
                }
                if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
                    throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
                }
                return copyLink(resolvedSrc, dest);
            }
        }
        function copyLink(resolvedSrc, dest) {
            fs.unlinkSync(dest);
            return fs.symlinkSync(resolvedSrc, dest);
        }
        module.exports = copySync;
    },
    8572(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const mkdirs = __webpack_require__(2924).mkdirs;
        const pathExists = __webpack_require__(9270).pathExists;
        const utimesMillis = __webpack_require__(721).utimesMillis;
        const stat = __webpack_require__(9276);
        function copy(src, dest, opts, cb) {
            if (typeof opts === "function" && !cb) {
                cb = opts;
                opts = {};
            } else if (typeof opts === "function") {
                opts = {
                    filter: opts
                };
            }
            cb = cb || function() {};
            opts = opts || {};
            opts.clobber = "clobber" in opts ? !!opts.clobber : true;
            opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber;
            if (opts.preserveTimestamps && process.arch === "ia32") {
                process.emitWarning("Using the preserveTimestamps option in 32-bit node is not recommended;\n\n" + "\tsee https://github.com/jprichardson/node-fs-extra/issues/269", "Warning", "fs-extra-WARN0001");
            }
            stat.checkPaths(src, dest, "copy", opts, (err, stats) => {
                if (err) return cb(err);
                const {srcStat, destStat} = stats;
                stat.checkParentPaths(src, srcStat, dest, "copy", err => {
                    if (err) return cb(err);
                    if (opts.filter) return handleFilter(checkParentDir, destStat, src, dest, opts, cb);
                    return checkParentDir(destStat, src, dest, opts, cb);
                });
            });
        }
        function checkParentDir(destStat, src, dest, opts, cb) {
            const destParent = path.dirname(dest);
            pathExists(destParent, (err, dirExists) => {
                if (err) return cb(err);
                if (dirExists) return getStats(destStat, src, dest, opts, cb);
                mkdirs(destParent, err => {
                    if (err) return cb(err);
                    return getStats(destStat, src, dest, opts, cb);
                });
            });
        }
        function handleFilter(onInclude, destStat, src, dest, opts, cb) {
            Promise.resolve(opts.filter(src, dest)).then(include => {
                if (include) return onInclude(destStat, src, dest, opts, cb);
                return cb();
            }, error => cb(error));
        }
        function startCopy(destStat, src, dest, opts, cb) {
            if (opts.filter) return handleFilter(getStats, destStat, src, dest, opts, cb);
            return getStats(destStat, src, dest, opts, cb);
        }
        function getStats(destStat, src, dest, opts, cb) {
            const stat = opts.dereference ? fs.stat : fs.lstat;
            stat(src, (err, srcStat) => {
                if (err) return cb(err);
                if (srcStat.isDirectory()) return onDir(srcStat, destStat, src, dest, opts, cb); else if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return onFile(srcStat, destStat, src, dest, opts, cb); else if (srcStat.isSymbolicLink()) return onLink(destStat, src, dest, opts, cb); else if (srcStat.isSocket()) return cb(new Error(`Cannot copy a socket file: ${src}`)); else if (srcStat.isFIFO()) return cb(new Error(`Cannot copy a FIFO pipe: ${src}`));
                return cb(new Error(`Unknown file: ${src}`));
            });
        }
        function onFile(srcStat, destStat, src, dest, opts, cb) {
            if (!destStat) return copyFile(srcStat, src, dest, opts, cb);
            return mayCopyFile(srcStat, src, dest, opts, cb);
        }
        function mayCopyFile(srcStat, src, dest, opts, cb) {
            if (opts.overwrite) {
                fs.unlink(dest, err => {
                    if (err) return cb(err);
                    return copyFile(srcStat, src, dest, opts, cb);
                });
            } else if (opts.errorOnExist) {
                return cb(new Error(`'${dest}' already exists`));
            } else return cb();
        }
        function copyFile(srcStat, src, dest, opts, cb) {
            fs.copyFile(src, dest, err => {
                if (err) return cb(err);
                if (opts.preserveTimestamps) return handleTimestampsAndMode(srcStat.mode, src, dest, cb);
                return setDestMode(dest, srcStat.mode, cb);
            });
        }
        function handleTimestampsAndMode(srcMode, src, dest, cb) {
            if (fileIsNotWritable(srcMode)) {
                return makeFileWritable(dest, srcMode, err => {
                    if (err) return cb(err);
                    return setDestTimestampsAndMode(srcMode, src, dest, cb);
                });
            }
            return setDestTimestampsAndMode(srcMode, src, dest, cb);
        }
        function fileIsNotWritable(srcMode) {
            return (srcMode & 128) === 0;
        }
        function makeFileWritable(dest, srcMode, cb) {
            return setDestMode(dest, srcMode | 128, cb);
        }
        function setDestTimestampsAndMode(srcMode, src, dest, cb) {
            setDestTimestamps(src, dest, err => {
                if (err) return cb(err);
                return setDestMode(dest, srcMode, cb);
            });
        }
        function setDestMode(dest, srcMode, cb) {
            return fs.chmod(dest, srcMode, cb);
        }
        function setDestTimestamps(src, dest, cb) {
            fs.stat(src, (err, updatedSrcStat) => {
                if (err) return cb(err);
                return utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb);
            });
        }
        function onDir(srcStat, destStat, src, dest, opts, cb) {
            if (!destStat) return mkDirAndCopy(srcStat.mode, src, dest, opts, cb);
            return copyDir(src, dest, opts, cb);
        }
        function mkDirAndCopy(srcMode, src, dest, opts, cb) {
            fs.mkdir(dest, err => {
                if (err) return cb(err);
                copyDir(src, dest, opts, err => {
                    if (err) return cb(err);
                    return setDestMode(dest, srcMode, cb);
                });
            });
        }
        function copyDir(src, dest, opts, cb) {
            fs.readdir(src, (err, items) => {
                if (err) return cb(err);
                return copyDirItems(items, src, dest, opts, cb);
            });
        }
        function copyDirItems(items, src, dest, opts, cb) {
            const item = items.pop();
            if (!item) return cb();
            return copyDirItem(items, item, src, dest, opts, cb);
        }
        function copyDirItem(items, item, src, dest, opts, cb) {
            const srcItem = path.join(src, item);
            const destItem = path.join(dest, item);
            stat.checkPaths(srcItem, destItem, "copy", opts, (err, stats) => {
                if (err) return cb(err);
                const {destStat} = stats;
                startCopy(destStat, srcItem, destItem, opts, err => {
                    if (err) return cb(err);
                    return copyDirItems(items, src, dest, opts, cb);
                });
            });
        }
        function onLink(destStat, src, dest, opts, cb) {
            fs.readlink(src, (err, resolvedSrc) => {
                if (err) return cb(err);
                if (opts.dereference) {
                    resolvedSrc = path.resolve(process.cwd(), resolvedSrc);
                }
                if (!destStat) {
                    return fs.symlink(resolvedSrc, dest, cb);
                } else {
                    fs.readlink(dest, (err, resolvedDest) => {
                        if (err) {
                            if (err.code === "EINVAL" || err.code === "UNKNOWN") return fs.symlink(resolvedSrc, dest, cb);
                            return cb(err);
                        }
                        if (opts.dereference) {
                            resolvedDest = path.resolve(process.cwd(), resolvedDest);
                        }
                        if (stat.isSrcSubdir(resolvedSrc, resolvedDest)) {
                            return cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`));
                        }
                        if (destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) {
                            return cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`));
                        }
                        return copyLink(resolvedSrc, dest, cb);
                    });
                }
            });
        }
        function copyLink(resolvedSrc, dest, cb) {
            fs.unlink(dest, err => {
                if (err) return cb(err);
                return fs.symlink(resolvedSrc, dest, cb);
            });
        }
        module.exports = copy;
    },
    7033(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        module.exports = {
            copy: u(__webpack_require__(8572)),
            copySync: __webpack_require__(9662)
        };
    },
    9973(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromPromise;
        const fs = __webpack_require__(6203);
        const path = __webpack_require__(6928);
        const mkdir = __webpack_require__(2924);
        const remove = __webpack_require__(7948);
        const emptyDir = u(async function emptyDir(dir) {
            let items;
            try {
                items = await fs.readdir(dir);
            } catch {
                return mkdir.mkdirs(dir);
            }
            return Promise.all(items.map(item => remove.remove(path.join(dir, item))));
        });
        function emptyDirSync(dir) {
            let items;
            try {
                items = fs.readdirSync(dir);
            } catch {
                return mkdir.mkdirsSync(dir);
            }
            items.forEach(item => {
                item = path.join(dir, item);
                remove.removeSync(item);
            });
        }
        module.exports = {
            emptyDirSync,
            emptydirSync: emptyDirSync,
            emptyDir,
            emptydir: emptyDir
        };
    },
    8786(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        const path = __webpack_require__(6928);
        const fs = __webpack_require__(9333);
        const mkdir = __webpack_require__(2924);
        function createFile(file, callback) {
            function makeFile() {
                fs.writeFile(file, "", err => {
                    if (err) return callback(err);
                    callback();
                });
            }
            fs.stat(file, (err, stats) => {
                if (!err && stats.isFile()) return callback();
                const dir = path.dirname(file);
                fs.stat(dir, (err, stats) => {
                    if (err) {
                        if (err.code === "ENOENT") {
                            return mkdir.mkdirs(dir, err => {
                                if (err) return callback(err);
                                makeFile();
                            });
                        }
                        return callback(err);
                    }
                    if (stats.isDirectory()) makeFile(); else {
                        fs.readdir(dir, err => {
                            if (err) return callback(err);
                        });
                    }
                });
            });
        }
        function createFileSync(file) {
            let stats;
            try {
                stats = fs.statSync(file);
            } catch {}
            if (stats && stats.isFile()) return;
            const dir = path.dirname(file);
            try {
                if (!fs.statSync(dir).isDirectory()) {
                    fs.readdirSync(dir);
                }
            } catch (err) {
                if (err && err.code === "ENOENT") mkdir.mkdirsSync(dir); else throw err;
            }
            fs.writeFileSync(file, "");
        }
        module.exports = {
            createFile: u(createFile),
            createFileSync
        };
    },
    3046(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const {createFile, createFileSync} = __webpack_require__(8786);
        const {createLink, createLinkSync} = __webpack_require__(9272);
        const {createSymlink, createSymlinkSync} = __webpack_require__(3649);
        module.exports = {
            createFile,
            createFileSync,
            ensureFile: createFile,
            ensureFileSync: createFileSync,
            createLink,
            createLinkSync,
            ensureLink: createLink,
            ensureLinkSync: createLinkSync,
            createSymlink,
            createSymlinkSync,
            ensureSymlink: createSymlink,
            ensureSymlinkSync: createSymlinkSync
        };
    },
    9272(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        const path = __webpack_require__(6928);
        const fs = __webpack_require__(9333);
        const mkdir = __webpack_require__(2924);
        const pathExists = __webpack_require__(9270).pathExists;
        const {areIdentical} = __webpack_require__(9276);
        function createLink(srcpath, dstpath, callback) {
            function makeLink(srcpath, dstpath) {
                fs.link(srcpath, dstpath, err => {
                    if (err) return callback(err);
                    callback(null);
                });
            }
            fs.lstat(dstpath, (_, dstStat) => {
                fs.lstat(srcpath, (err, srcStat) => {
                    if (err) {
                        err.message = err.message.replace("lstat", "ensureLink");
                        return callback(err);
                    }
                    if (dstStat && areIdentical(srcStat, dstStat)) return callback(null);
                    const dir = path.dirname(dstpath);
                    pathExists(dir, (err, dirExists) => {
                        if (err) return callback(err);
                        if (dirExists) return makeLink(srcpath, dstpath);
                        mkdir.mkdirs(dir, err => {
                            if (err) return callback(err);
                            makeLink(srcpath, dstpath);
                        });
                    });
                });
            });
        }
        function createLinkSync(srcpath, dstpath) {
            let dstStat;
            try {
                dstStat = fs.lstatSync(dstpath);
            } catch {}
            try {
                const srcStat = fs.lstatSync(srcpath);
                if (dstStat && areIdentical(srcStat, dstStat)) return;
            } catch (err) {
                err.message = err.message.replace("lstat", "ensureLink");
                throw err;
            }
            const dir = path.dirname(dstpath);
            const dirExists = fs.existsSync(dir);
            if (dirExists) return fs.linkSync(srcpath, dstpath);
            mkdir.mkdirsSync(dir);
            return fs.linkSync(srcpath, dstpath);
        }
        module.exports = {
            createLink: u(createLink),
            createLinkSync
        };
    },
    768(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const path = __webpack_require__(6928);
        const fs = __webpack_require__(9333);
        const pathExists = __webpack_require__(9270).pathExists;
        function symlinkPaths(srcpath, dstpath, callback) {
            if (path.isAbsolute(srcpath)) {
                return fs.lstat(srcpath, err => {
                    if (err) {
                        err.message = err.message.replace("lstat", "ensureSymlink");
                        return callback(err);
                    }
                    return callback(null, {
                        toCwd: srcpath,
                        toDst: srcpath
                    });
                });
            } else {
                const dstdir = path.dirname(dstpath);
                const relativeToDst = path.join(dstdir, srcpath);
                return pathExists(relativeToDst, (err, exists) => {
                    if (err) return callback(err);
                    if (exists) {
                        return callback(null, {
                            toCwd: relativeToDst,
                            toDst: srcpath
                        });
                    } else {
                        return fs.lstat(srcpath, err => {
                            if (err) {
                                err.message = err.message.replace("lstat", "ensureSymlink");
                                return callback(err);
                            }
                            return callback(null, {
                                toCwd: srcpath,
                                toDst: path.relative(dstdir, srcpath)
                            });
                        });
                    }
                });
            }
        }
        function symlinkPathsSync(srcpath, dstpath) {
            let exists;
            if (path.isAbsolute(srcpath)) {
                exists = fs.existsSync(srcpath);
                if (!exists) throw new Error("absolute srcpath does not exist");
                return {
                    toCwd: srcpath,
                    toDst: srcpath
                };
            } else {
                const dstdir = path.dirname(dstpath);
                const relativeToDst = path.join(dstdir, srcpath);
                exists = fs.existsSync(relativeToDst);
                if (exists) {
                    return {
                        toCwd: relativeToDst,
                        toDst: srcpath
                    };
                } else {
                    exists = fs.existsSync(srcpath);
                    if (!exists) throw new Error("relative srcpath does not exist");
                    return {
                        toCwd: srcpath,
                        toDst: path.relative(dstdir, srcpath)
                    };
                }
            }
        }
        module.exports = {
            symlinkPaths,
            symlinkPathsSync
        };
    },
    514(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        function symlinkType(srcpath, type, callback) {
            callback = typeof type === "function" ? type : callback;
            type = typeof type === "function" ? false : type;
            if (type) return callback(null, type);
            fs.lstat(srcpath, (err, stats) => {
                if (err) return callback(null, "file");
                type = stats && stats.isDirectory() ? "dir" : "file";
                callback(null, type);
            });
        }
        function symlinkTypeSync(srcpath, type) {
            let stats;
            if (type) return type;
            try {
                stats = fs.lstatSync(srcpath);
            } catch {
                return "file";
            }
            return stats && stats.isDirectory() ? "dir" : "file";
        }
        module.exports = {
            symlinkType,
            symlinkTypeSync
        };
    },
    3649(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        const path = __webpack_require__(6928);
        const fs = __webpack_require__(6203);
        const _mkdirs = __webpack_require__(2924);
        const mkdirs = _mkdirs.mkdirs;
        const mkdirsSync = _mkdirs.mkdirsSync;
        const _symlinkPaths = __webpack_require__(768);
        const symlinkPaths = _symlinkPaths.symlinkPaths;
        const symlinkPathsSync = _symlinkPaths.symlinkPathsSync;
        const _symlinkType = __webpack_require__(514);
        const symlinkType = _symlinkType.symlinkType;
        const symlinkTypeSync = _symlinkType.symlinkTypeSync;
        const pathExists = __webpack_require__(9270).pathExists;
        const {areIdentical} = __webpack_require__(9276);
        function createSymlink(srcpath, dstpath, type, callback) {
            callback = typeof type === "function" ? type : callback;
            type = typeof type === "function" ? false : type;
            fs.lstat(dstpath, (err, stats) => {
                if (!err && stats.isSymbolicLink()) {
                    Promise.all([ fs.stat(srcpath), fs.stat(dstpath) ]).then(([srcStat, dstStat]) => {
                        if (areIdentical(srcStat, dstStat)) return callback(null);
                        _createSymlink(srcpath, dstpath, type, callback);
                    });
                } else _createSymlink(srcpath, dstpath, type, callback);
            });
        }
        function _createSymlink(srcpath, dstpath, type, callback) {
            symlinkPaths(srcpath, dstpath, (err, relative) => {
                if (err) return callback(err);
                srcpath = relative.toDst;
                symlinkType(relative.toCwd, type, (err, type) => {
                    if (err) return callback(err);
                    const dir = path.dirname(dstpath);
                    pathExists(dir, (err, dirExists) => {
                        if (err) return callback(err);
                        if (dirExists) return fs.symlink(srcpath, dstpath, type, callback);
                        mkdirs(dir, err => {
                            if (err) return callback(err);
                            fs.symlink(srcpath, dstpath, type, callback);
                        });
                    });
                });
            });
        }
        function createSymlinkSync(srcpath, dstpath, type) {
            let stats;
            try {
                stats = fs.lstatSync(dstpath);
            } catch {}
            if (stats && stats.isSymbolicLink()) {
                const srcStat = fs.statSync(srcpath);
                const dstStat = fs.statSync(dstpath);
                if (areIdentical(srcStat, dstStat)) return;
            }
            const relative = symlinkPathsSync(srcpath, dstpath);
            srcpath = relative.toDst;
            type = symlinkTypeSync(relative.toCwd, type);
            const dir = path.dirname(dstpath);
            const exists = fs.existsSync(dir);
            if (exists) return fs.symlinkSync(srcpath, dstpath, type);
            mkdirsSync(dir);
            return fs.symlinkSync(srcpath, dstpath, type);
        }
        module.exports = {
            createSymlink: u(createSymlink),
            createSymlinkSync
        };
    },
    6203(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        const fs = __webpack_require__(9333);
        const api = [ "access", "appendFile", "chmod", "chown", "close", "copyFile", "fchmod", "fchown", "fdatasync", "fstat", "fsync", "ftruncate", "futimes", "lchmod", "lchown", "link", "lstat", "mkdir", "mkdtemp", "open", "opendir", "readdir", "readFile", "readlink", "realpath", "rename", "rm", "rmdir", "stat", "symlink", "truncate", "unlink", "utimes", "writeFile" ].filter(key => typeof fs[key] === "function");
        Object.assign(exports, fs);
        api.forEach(method => {
            exports[method] = u(fs[method]);
        });
        exports.exists = function(filename, callback) {
            if (typeof callback === "function") {
                return fs.exists(filename, callback);
            }
            return new Promise(resolve => fs.exists(filename, resolve));
        };
        exports.read = function(fd, buffer, offset, length, position, callback) {
            if (typeof callback === "function") {
                return fs.read(fd, buffer, offset, length, position, callback);
            }
            return new Promise((resolve, reject) => {
                fs.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
                    if (err) return reject(err);
                    resolve({
                        bytesRead,
                        buffer
                    });
                });
            });
        };
        exports.write = function(fd, buffer, ...args) {
            if (typeof args[args.length - 1] === "function") {
                return fs.write(fd, buffer, ...args);
            }
            return new Promise((resolve, reject) => {
                fs.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
                    if (err) return reject(err);
                    resolve({
                        bytesWritten,
                        buffer
                    });
                });
            });
        };
        if (typeof fs.writev === "function") {
            exports.writev = function(fd, buffers, ...args) {
                if (typeof args[args.length - 1] === "function") {
                    return fs.writev(fd, buffers, ...args);
                }
                return new Promise((resolve, reject) => {
                    fs.writev(fd, buffers, ...args, (err, bytesWritten, buffers) => {
                        if (err) return reject(err);
                        resolve({
                            bytesWritten,
                            buffers
                        });
                    });
                });
            };
        }
        if (typeof fs.realpath.native === "function") {
            exports.realpath.native = u(fs.realpath.native);
        } else {
            process.emitWarning("fs.realpath.native is not a function. Is fs being monkey-patched?", "Warning", "fs-extra-WARN0003");
        }
    },
    8463(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        module.exports = {
            ...__webpack_require__(6203),
            ...__webpack_require__(7033),
            ...__webpack_require__(9973),
            ...__webpack_require__(3046),
            ...__webpack_require__(7050),
            ...__webpack_require__(2924),
            ...__webpack_require__(3801),
            ...__webpack_require__(4870),
            ...__webpack_require__(9270),
            ...__webpack_require__(7948)
        };
    },
    7050(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromPromise;
        const jsonFile = __webpack_require__(5652);
        jsonFile.outputJson = u(__webpack_require__(9508));
        jsonFile.outputJsonSync = __webpack_require__(4678);
        jsonFile.outputJSON = jsonFile.outputJson;
        jsonFile.outputJSONSync = jsonFile.outputJsonSync;
        jsonFile.writeJSON = jsonFile.writeJson;
        jsonFile.writeJSONSync = jsonFile.writeJsonSync;
        jsonFile.readJSON = jsonFile.readJson;
        jsonFile.readJSONSync = jsonFile.readJsonSync;
        module.exports = jsonFile;
    },
    5652(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const jsonFile = __webpack_require__(3023);
        module.exports = {
            readJson: jsonFile.readFile,
            readJsonSync: jsonFile.readFileSync,
            writeJson: jsonFile.writeFile,
            writeJsonSync: jsonFile.writeFileSync
        };
    },
    4678(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const {stringify} = __webpack_require__(7578);
        const {outputFileSync} = __webpack_require__(4870);
        function outputJsonSync(file, data, options) {
            const str = stringify(data, options);
            outputFileSync(file, str, options);
        }
        module.exports = outputJsonSync;
    },
    9508(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const {stringify} = __webpack_require__(7578);
        const {outputFile} = __webpack_require__(4870);
        async function outputJson(file, data, options = {}) {
            const str = stringify(data, options);
            await outputFile(file, str, options);
        }
        module.exports = outputJson;
    },
    2924(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromPromise;
        const {makeDir: _makeDir, makeDirSync} = __webpack_require__(6522);
        const makeDir = u(_makeDir);
        module.exports = {
            mkdirs: makeDir,
            mkdirsSync: makeDirSync,
            mkdirp: makeDir,
            mkdirpSync: makeDirSync,
            ensureDir: makeDir,
            ensureDirSync: makeDirSync
        };
    },
    6522(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(6203);
        const {checkPath} = __webpack_require__(4613);
        const getMode = options => {
            const defaults = {
                mode: 511
            };
            if (typeof options === "number") return options;
            return {
                ...defaults,
                ...options
            }.mode;
        };
        module.exports.makeDir = async (dir, options) => {
            checkPath(dir);
            return fs.mkdir(dir, {
                mode: getMode(options),
                recursive: true
            });
        };
        module.exports.makeDirSync = (dir, options) => {
            checkPath(dir);
            return fs.mkdirSync(dir, {
                mode: getMode(options),
                recursive: true
            });
        };
    },
    4613(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const path = __webpack_require__(6928);
        module.exports.checkPath = function checkPath(pth) {
            if (process.platform === "win32") {
                const pathHasInvalidWinCharacters = /[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ""));
                if (pathHasInvalidWinCharacters) {
                    const error = new Error(`Path contains invalid characters: ${pth}`);
                    error.code = "EINVAL";
                    throw error;
                }
            }
        };
    },
    3801(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        module.exports = {
            move: u(__webpack_require__(4180)),
            moveSync: __webpack_require__(7958)
        };
    },
    7958(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const copySync = __webpack_require__(7033).copySync;
        const removeSync = __webpack_require__(7948).removeSync;
        const mkdirpSync = __webpack_require__(2924).mkdirpSync;
        const stat = __webpack_require__(9276);
        function moveSync(src, dest, opts) {
            opts = opts || {};
            const overwrite = opts.overwrite || opts.clobber || false;
            const {srcStat, isChangingCase = false} = stat.checkPathsSync(src, dest, "move", opts);
            stat.checkParentPathsSync(src, srcStat, dest, "move");
            if (!isParentRoot(dest)) mkdirpSync(path.dirname(dest));
            return doRename(src, dest, overwrite, isChangingCase);
        }
        function isParentRoot(dest) {
            const parent = path.dirname(dest);
            const parsedPath = path.parse(parent);
            return parsedPath.root === parent;
        }
        function doRename(src, dest, overwrite, isChangingCase) {
            if (isChangingCase) return rename(src, dest, overwrite);
            if (overwrite) {
                removeSync(dest);
                return rename(src, dest, overwrite);
            }
            if (fs.existsSync(dest)) throw new Error("dest already exists.");
            return rename(src, dest, overwrite);
        }
        function rename(src, dest, overwrite) {
            try {
                fs.renameSync(src, dest);
            } catch (err) {
                if (err.code !== "EXDEV") throw err;
                return moveAcrossDevice(src, dest, overwrite);
            }
        }
        function moveAcrossDevice(src, dest, overwrite) {
            const opts = {
                overwrite,
                errorOnExist: true
            };
            copySync(src, dest, opts);
            return removeSync(src);
        }
        module.exports = moveSync;
    },
    4180(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const copy = __webpack_require__(7033).copy;
        const remove = __webpack_require__(7948).remove;
        const mkdirp = __webpack_require__(2924).mkdirp;
        const pathExists = __webpack_require__(9270).pathExists;
        const stat = __webpack_require__(9276);
        function move(src, dest, opts, cb) {
            if (typeof opts === "function") {
                cb = opts;
                opts = {};
            }
            opts = opts || {};
            const overwrite = opts.overwrite || opts.clobber || false;
            stat.checkPaths(src, dest, "move", opts, (err, stats) => {
                if (err) return cb(err);
                const {srcStat, isChangingCase = false} = stats;
                stat.checkParentPaths(src, srcStat, dest, "move", err => {
                    if (err) return cb(err);
                    if (isParentRoot(dest)) return doRename(src, dest, overwrite, isChangingCase, cb);
                    mkdirp(path.dirname(dest), err => {
                        if (err) return cb(err);
                        return doRename(src, dest, overwrite, isChangingCase, cb);
                    });
                });
            });
        }
        function isParentRoot(dest) {
            const parent = path.dirname(dest);
            const parsedPath = path.parse(parent);
            return parsedPath.root === parent;
        }
        function doRename(src, dest, overwrite, isChangingCase, cb) {
            if (isChangingCase) return rename(src, dest, overwrite, cb);
            if (overwrite) {
                return remove(dest, err => {
                    if (err) return cb(err);
                    return rename(src, dest, overwrite, cb);
                });
            }
            pathExists(dest, (err, destExists) => {
                if (err) return cb(err);
                if (destExists) return cb(new Error("dest already exists."));
                return rename(src, dest, overwrite, cb);
            });
        }
        function rename(src, dest, overwrite, cb) {
            fs.rename(src, dest, err => {
                if (!err) return cb();
                if (err.code !== "EXDEV") return cb(err);
                return moveAcrossDevice(src, dest, overwrite, cb);
            });
        }
        function moveAcrossDevice(src, dest, overwrite, cb) {
            const opts = {
                overwrite,
                errorOnExist: true
            };
            copy(src, dest, opts, err => {
                if (err) return cb(err);
                return remove(src, cb);
            });
        }
        module.exports = move;
    },
    4870(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromCallback;
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const mkdir = __webpack_require__(2924);
        const pathExists = __webpack_require__(9270).pathExists;
        function outputFile(file, data, encoding, callback) {
            if (typeof encoding === "function") {
                callback = encoding;
                encoding = "utf8";
            }
            const dir = path.dirname(file);
            pathExists(dir, (err, itDoes) => {
                if (err) return callback(err);
                if (itDoes) return fs.writeFile(file, data, encoding, callback);
                mkdir.mkdirs(dir, err => {
                    if (err) return callback(err);
                    fs.writeFile(file, data, encoding, callback);
                });
            });
        }
        function outputFileSync(file, ...args) {
            const dir = path.dirname(file);
            if (fs.existsSync(dir)) {
                return fs.writeFileSync(file, ...args);
            }
            mkdir.mkdirsSync(dir);
            fs.writeFileSync(file, ...args);
        }
        module.exports = {
            outputFile: u(outputFile),
            outputFileSync
        };
    },
    9270(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const u = __webpack_require__(9022).fromPromise;
        const fs = __webpack_require__(6203);
        function pathExists(path) {
            return fs.access(path).then(() => true).catch(() => false);
        }
        module.exports = {
            pathExists: u(pathExists),
            pathExistsSync: fs.existsSync
        };
    },
    7948(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const u = __webpack_require__(9022).fromCallback;
        const rimraf = __webpack_require__(3907);
        function remove(path, callback) {
            if (fs.rm) return fs.rm(path, {
                recursive: true,
                force: true
            }, callback);
            rimraf(path, callback);
        }
        function removeSync(path) {
            if (fs.rmSync) return fs.rmSync(path, {
                recursive: true,
                force: true
            });
            rimraf.sync(path);
        }
        module.exports = {
            remove: u(remove),
            removeSync
        };
    },
    3907(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        const path = __webpack_require__(6928);
        const assert = __webpack_require__(2613);
        const isWindows = process.platform === "win32";
        function defaults(options) {
            const methods = [ "unlink", "chmod", "stat", "lstat", "rmdir", "readdir" ];
            methods.forEach(m => {
                options[m] = options[m] || fs[m];
                m = m + "Sync";
                options[m] = options[m] || fs[m];
            });
            options.maxBusyTries = options.maxBusyTries || 3;
        }
        function rimraf(p, options, cb) {
            let busyTries = 0;
            if (typeof options === "function") {
                cb = options;
                options = {};
            }
            assert(p, "rimraf: missing path");
            assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
            assert.strictEqual(typeof cb, "function", "rimraf: callback function required");
            assert(options, "rimraf: invalid options argument provided");
            assert.strictEqual(typeof options, "object", "rimraf: options should be object");
            defaults(options);
            rimraf_(p, options, function CB(er) {
                if (er) {
                    if ((er.code === "EBUSY" || er.code === "ENOTEMPTY" || er.code === "EPERM") && busyTries < options.maxBusyTries) {
                        busyTries++;
                        const time = busyTries * 100;
                        return setTimeout(() => rimraf_(p, options, CB), time);
                    }
                    if (er.code === "ENOENT") er = null;
                }
                cb(er);
            });
        }
        function rimraf_(p, options, cb) {
            assert(p);
            assert(options);
            assert(typeof cb === "function");
            options.lstat(p, (er, st) => {
                if (er && er.code === "ENOENT") {
                    return cb(null);
                }
                if (er && er.code === "EPERM" && isWindows) {
                    return fixWinEPERM(p, options, er, cb);
                }
                if (st && st.isDirectory()) {
                    return rmdir(p, options, er, cb);
                }
                options.unlink(p, er => {
                    if (er) {
                        if (er.code === "ENOENT") {
                            return cb(null);
                        }
                        if (er.code === "EPERM") {
                            return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
                        }
                        if (er.code === "EISDIR") {
                            return rmdir(p, options, er, cb);
                        }
                    }
                    return cb(er);
                });
            });
        }
        function fixWinEPERM(p, options, er, cb) {
            assert(p);
            assert(options);
            assert(typeof cb === "function");
            options.chmod(p, 438, er2 => {
                if (er2) {
                    cb(er2.code === "ENOENT" ? null : er);
                } else {
                    options.stat(p, (er3, stats) => {
                        if (er3) {
                            cb(er3.code === "ENOENT" ? null : er);
                        } else if (stats.isDirectory()) {
                            rmdir(p, options, er, cb);
                        } else {
                            options.unlink(p, cb);
                        }
                    });
                }
            });
        }
        function fixWinEPERMSync(p, options, er) {
            let stats;
            assert(p);
            assert(options);
            try {
                options.chmodSync(p, 438);
            } catch (er2) {
                if (er2.code === "ENOENT") {
                    return;
                } else {
                    throw er;
                }
            }
            try {
                stats = options.statSync(p);
            } catch (er3) {
                if (er3.code === "ENOENT") {
                    return;
                } else {
                    throw er;
                }
            }
            if (stats.isDirectory()) {
                rmdirSync(p, options, er);
            } else {
                options.unlinkSync(p);
            }
        }
        function rmdir(p, options, originalEr, cb) {
            assert(p);
            assert(options);
            assert(typeof cb === "function");
            options.rmdir(p, er => {
                if (er && (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM")) {
                    rmkids(p, options, cb);
                } else if (er && er.code === "ENOTDIR") {
                    cb(originalEr);
                } else {
                    cb(er);
                }
            });
        }
        function rmkids(p, options, cb) {
            assert(p);
            assert(options);
            assert(typeof cb === "function");
            options.readdir(p, (er, files) => {
                if (er) return cb(er);
                let n = files.length;
                let errState;
                if (n === 0) return options.rmdir(p, cb);
                files.forEach(f => {
                    rimraf(path.join(p, f), options, er => {
                        if (errState) {
                            return;
                        }
                        if (er) return cb(errState = er);
                        if (--n === 0) {
                            options.rmdir(p, cb);
                        }
                    });
                });
            });
        }
        function rimrafSync(p, options) {
            let st;
            options = options || {};
            defaults(options);
            assert(p, "rimraf: missing path");
            assert.strictEqual(typeof p, "string", "rimraf: path should be a string");
            assert(options, "rimraf: missing options");
            assert.strictEqual(typeof options, "object", "rimraf: options should be object");
            try {
                st = options.lstatSync(p);
            } catch (er) {
                if (er.code === "ENOENT") {
                    return;
                }
                if (er.code === "EPERM" && isWindows) {
                    fixWinEPERMSync(p, options, er);
                }
            }
            try {
                if (st && st.isDirectory()) {
                    rmdirSync(p, options, null);
                } else {
                    options.unlinkSync(p);
                }
            } catch (er) {
                if (er.code === "ENOENT") {
                    return;
                } else if (er.code === "EPERM") {
                    return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
                } else if (er.code !== "EISDIR") {
                    throw er;
                }
                rmdirSync(p, options, er);
            }
        }
        function rmdirSync(p, options, originalEr) {
            assert(p);
            assert(options);
            try {
                options.rmdirSync(p);
            } catch (er) {
                if (er.code === "ENOTDIR") {
                    throw originalEr;
                } else if (er.code === "ENOTEMPTY" || er.code === "EEXIST" || er.code === "EPERM") {
                    rmkidsSync(p, options);
                } else if (er.code !== "ENOENT") {
                    throw er;
                }
            }
        }
        function rmkidsSync(p, options) {
            assert(p);
            assert(options);
            options.readdirSync(p).forEach(f => rimrafSync(path.join(p, f), options));
            if (isWindows) {
                const startTime = Date.now();
                do {
                    try {
                        const ret = options.rmdirSync(p, options);
                        return ret;
                    } catch {}
                } while (Date.now() - startTime < 500);
            } else {
                const ret = options.rmdirSync(p, options);
                return ret;
            }
        }
        module.exports = rimraf;
        rimraf.sync = rimrafSync;
    },
    9276(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(6203);
        const path = __webpack_require__(6928);
        const util = __webpack_require__(9023);
        function getStats(src, dest, opts) {
            const statFunc = opts.dereference ? file => fs.stat(file, {
                bigint: true
            }) : file => fs.lstat(file, {
                bigint: true
            });
            return Promise.all([ statFunc(src), statFunc(dest).catch(err => {
                if (err.code === "ENOENT") return null;
                throw err;
            }) ]).then(([srcStat, destStat]) => ({
                srcStat,
                destStat
            }));
        }
        function getStatsSync(src, dest, opts) {
            let destStat;
            const statFunc = opts.dereference ? file => fs.statSync(file, {
                bigint: true
            }) : file => fs.lstatSync(file, {
                bigint: true
            });
            const srcStat = statFunc(src);
            try {
                destStat = statFunc(dest);
            } catch (err) {
                if (err.code === "ENOENT") return {
                    srcStat,
                    destStat: null
                };
                throw err;
            }
            return {
                srcStat,
                destStat
            };
        }
        function checkPaths(src, dest, funcName, opts, cb) {
            util.callbackify(getStats)(src, dest, opts, (err, stats) => {
                if (err) return cb(err);
                const {srcStat, destStat} = stats;
                if (destStat) {
                    if (areIdentical(srcStat, destStat)) {
                        const srcBaseName = path.basename(src);
                        const destBaseName = path.basename(dest);
                        if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                            return cb(null, {
                                srcStat,
                                destStat,
                                isChangingCase: true
                            });
                        }
                        return cb(new Error("Source and destination must not be the same."));
                    }
                    if (srcStat.isDirectory() && !destStat.isDirectory()) {
                        return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
                    }
                    if (!srcStat.isDirectory() && destStat.isDirectory()) {
                        return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`));
                    }
                }
                if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
                    return cb(new Error(errMsg(src, dest, funcName)));
                }
                return cb(null, {
                    srcStat,
                    destStat
                });
            });
        }
        function checkPathsSync(src, dest, funcName, opts) {
            const {srcStat, destStat} = getStatsSync(src, dest, opts);
            if (destStat) {
                if (areIdentical(srcStat, destStat)) {
                    const srcBaseName = path.basename(src);
                    const destBaseName = path.basename(dest);
                    if (funcName === "move" && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) {
                        return {
                            srcStat,
                            destStat,
                            isChangingCase: true
                        };
                    }
                    throw new Error("Source and destination must not be the same.");
                }
                if (srcStat.isDirectory() && !destStat.isDirectory()) {
                    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
                }
                if (!srcStat.isDirectory() && destStat.isDirectory()) {
                    throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
                }
            }
            if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
                throw new Error(errMsg(src, dest, funcName));
            }
            return {
                srcStat,
                destStat
            };
        }
        function checkParentPaths(src, srcStat, dest, funcName, cb) {
            const srcParent = path.resolve(path.dirname(src));
            const destParent = path.resolve(path.dirname(dest));
            if (destParent === srcParent || destParent === path.parse(destParent).root) return cb();
            fs.stat(destParent, {
                bigint: true
            }, (err, destStat) => {
                if (err) {
                    if (err.code === "ENOENT") return cb();
                    return cb(err);
                }
                if (areIdentical(srcStat, destStat)) {
                    return cb(new Error(errMsg(src, dest, funcName)));
                }
                return checkParentPaths(src, srcStat, destParent, funcName, cb);
            });
        }
        function checkParentPathsSync(src, srcStat, dest, funcName) {
            const srcParent = path.resolve(path.dirname(src));
            const destParent = path.resolve(path.dirname(dest));
            if (destParent === srcParent || destParent === path.parse(destParent).root) return;
            let destStat;
            try {
                destStat = fs.statSync(destParent, {
                    bigint: true
                });
            } catch (err) {
                if (err.code === "ENOENT") return;
                throw err;
            }
            if (areIdentical(srcStat, destStat)) {
                throw new Error(errMsg(src, dest, funcName));
            }
            return checkParentPathsSync(src, srcStat, destParent, funcName);
        }
        function areIdentical(srcStat, destStat) {
            return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
        }
        function isSrcSubdir(src, dest) {
            const srcArr = path.resolve(src).split(path.sep).filter(i => i);
            const destArr = path.resolve(dest).split(path.sep).filter(i => i);
            return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true);
        }
        function errMsg(src, dest, funcName) {
            return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
        }
        module.exports = {
            checkPaths,
            checkPathsSync,
            checkParentPaths,
            checkParentPathsSync,
            isSrcSubdir,
            areIdentical
        };
    },
    721(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9333);
        function utimesMillis(path, atime, mtime, callback) {
            fs.open(path, "r+", (err, fd) => {
                if (err) return callback(err);
                fs.futimes(fd, atime, mtime, futimesErr => {
                    fs.close(fd, closeErr => {
                        if (callback) callback(futimesErr || closeErr);
                    });
                });
            });
        }
        function utimesMillisSync(path, atime, mtime) {
            const fd = fs.openSync(path, "r+");
            fs.futimesSync(fd, atime, mtime);
            return fs.closeSync(fd);
        }
        module.exports = {
            utimesMillis,
            utimesMillisSync
        };
    },
    4245(module) {
        "use strict";
        module.exports = clone;
        var getPrototypeOf = Object.getPrototypeOf || function(obj) {
            return obj.__proto__;
        };
        function clone(obj) {
            if (obj === null || typeof obj !== "object") return obj;
            if (obj instanceof Object) var copy = {
                __proto__: getPrototypeOf(obj)
            }; else var copy = Object.create(null);
            Object.getOwnPropertyNames(obj).forEach(function(key) {
                Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
            });
            return copy;
        }
    },
    9333(module, __unused_webpack_exports, __webpack_require__) {
        var fs = __webpack_require__(9896);
        var polyfills = __webpack_require__(4988);
        var legacy = __webpack_require__(1745);
        var clone = __webpack_require__(4245);
        var util = __webpack_require__(9023);
        var gracefulQueue;
        var previousSymbol;
        if (typeof Symbol === "function" && typeof Symbol.for === "function") {
            gracefulQueue = Symbol.for("graceful-fs.queue");
            previousSymbol = Symbol.for("graceful-fs.previous");
        } else {
            gracefulQueue = "___graceful-fs.queue";
            previousSymbol = "___graceful-fs.previous";
        }
        function noop() {}
        function publishQueue(context, queue) {
            Object.defineProperty(context, gracefulQueue, {
                get: function() {
                    return queue;
                }
            });
        }
        var debug = noop;
        if (util.debuglog) debug = util.debuglog("gfs4"); else if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) debug = function() {
            var m = util.format.apply(util, arguments);
            m = "GFS4: " + m.split(/\n/).join("\nGFS4: ");
            console.error(m);
        };
        if (!fs[gracefulQueue]) {
            var queue = global[gracefulQueue] || [];
            publishQueue(fs, queue);
            fs.close = function(fs$close) {
                function close(fd, cb) {
                    return fs$close.call(fs, fd, function(err) {
                        if (!err) {
                            resetQueue();
                        }
                        if (typeof cb === "function") cb.apply(this, arguments);
                    });
                }
                Object.defineProperty(close, previousSymbol, {
                    value: fs$close
                });
                return close;
            }(fs.close);
            fs.closeSync = function(fs$closeSync) {
                function closeSync(fd) {
                    fs$closeSync.apply(fs, arguments);
                    resetQueue();
                }
                Object.defineProperty(closeSync, previousSymbol, {
                    value: fs$closeSync
                });
                return closeSync;
            }(fs.closeSync);
            if (/\bgfs4\b/i.test(process.env.NODE_DEBUG || "")) {
                process.on("exit", function() {
                    debug(fs[gracefulQueue]);
                    __webpack_require__(2613).equal(fs[gracefulQueue].length, 0);
                });
            }
        }
        if (!global[gracefulQueue]) {
            publishQueue(global, fs[gracefulQueue]);
        }
        module.exports = patch(clone(fs));
        if (process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched) {
            module.exports = patch(fs);
            fs.__patched = true;
        }
        function patch(fs) {
            polyfills(fs);
            fs.gracefulify = patch;
            fs.createReadStream = createReadStream;
            fs.createWriteStream = createWriteStream;
            var fs$readFile = fs.readFile;
            fs.readFile = readFile;
            function readFile(path, options, cb) {
                if (typeof options === "function") cb = options, options = null;
                return go$readFile(path, options, cb);
                function go$readFile(path, options, cb, startTime) {
                    return fs$readFile(path, options, function(err) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$readFile, [ path, options, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (typeof cb === "function") cb.apply(this, arguments);
                        }
                    });
                }
            }
            var fs$writeFile = fs.writeFile;
            fs.writeFile = writeFile;
            function writeFile(path, data, options, cb) {
                if (typeof options === "function") cb = options, options = null;
                return go$writeFile(path, data, options, cb);
                function go$writeFile(path, data, options, cb, startTime) {
                    return fs$writeFile(path, data, options, function(err) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$writeFile, [ path, data, options, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (typeof cb === "function") cb.apply(this, arguments);
                        }
                    });
                }
            }
            var fs$appendFile = fs.appendFile;
            if (fs$appendFile) fs.appendFile = appendFile;
            function appendFile(path, data, options, cb) {
                if (typeof options === "function") cb = options, options = null;
                return go$appendFile(path, data, options, cb);
                function go$appendFile(path, data, options, cb, startTime) {
                    return fs$appendFile(path, data, options, function(err) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$appendFile, [ path, data, options, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (typeof cb === "function") cb.apply(this, arguments);
                        }
                    });
                }
            }
            var fs$copyFile = fs.copyFile;
            if (fs$copyFile) fs.copyFile = copyFile;
            function copyFile(src, dest, flags, cb) {
                if (typeof flags === "function") {
                    cb = flags;
                    flags = 0;
                }
                return go$copyFile(src, dest, flags, cb);
                function go$copyFile(src, dest, flags, cb, startTime) {
                    return fs$copyFile(src, dest, flags, function(err) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$copyFile, [ src, dest, flags, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (typeof cb === "function") cb.apply(this, arguments);
                        }
                    });
                }
            }
            var fs$readdir = fs.readdir;
            fs.readdir = readdir;
            var noReaddirOptionVersions = /^v[0-5]\./;
            function readdir(path, options, cb) {
                if (typeof options === "function") cb = options, options = null;
                var go$readdir = noReaddirOptionVersions.test(process.version) ? function go$readdir(path, options, cb, startTime) {
                    return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
                } : function go$readdir(path, options, cb, startTime) {
                    return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
                };
                return go$readdir(path, options, cb);
                function fs$readdirCallback(path, options, cb, startTime) {
                    return function(err, files) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$readdir, [ path, options, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (files && files.sort) files.sort();
                            if (typeof cb === "function") cb.call(this, err, files);
                        }
                    };
                }
            }
            if (process.version.substr(0, 4) === "v0.8") {
                var legStreams = legacy(fs);
                ReadStream = legStreams.ReadStream;
                WriteStream = legStreams.WriteStream;
            }
            var fs$ReadStream = fs.ReadStream;
            if (fs$ReadStream) {
                ReadStream.prototype = Object.create(fs$ReadStream.prototype);
                ReadStream.prototype.open = ReadStream$open;
            }
            var fs$WriteStream = fs.WriteStream;
            if (fs$WriteStream) {
                WriteStream.prototype = Object.create(fs$WriteStream.prototype);
                WriteStream.prototype.open = WriteStream$open;
            }
            Object.defineProperty(fs, "ReadStream", {
                get: function() {
                    return ReadStream;
                },
                set: function(val) {
                    ReadStream = val;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(fs, "WriteStream", {
                get: function() {
                    return WriteStream;
                },
                set: function(val) {
                    WriteStream = val;
                },
                enumerable: true,
                configurable: true
            });
            var FileReadStream = ReadStream;
            Object.defineProperty(fs, "FileReadStream", {
                get: function() {
                    return FileReadStream;
                },
                set: function(val) {
                    FileReadStream = val;
                },
                enumerable: true,
                configurable: true
            });
            var FileWriteStream = WriteStream;
            Object.defineProperty(fs, "FileWriteStream", {
                get: function() {
                    return FileWriteStream;
                },
                set: function(val) {
                    FileWriteStream = val;
                },
                enumerable: true,
                configurable: true
            });
            function ReadStream(path, options) {
                if (this instanceof ReadStream) return fs$ReadStream.apply(this, arguments), this; else return ReadStream.apply(Object.create(ReadStream.prototype), arguments);
            }
            function ReadStream$open() {
                var that = this;
                open(that.path, that.flags, that.mode, function(err, fd) {
                    if (err) {
                        if (that.autoClose) that.destroy();
                        that.emit("error", err);
                    } else {
                        that.fd = fd;
                        that.emit("open", fd);
                        that.read();
                    }
                });
            }
            function WriteStream(path, options) {
                if (this instanceof WriteStream) return fs$WriteStream.apply(this, arguments), this; else return WriteStream.apply(Object.create(WriteStream.prototype), arguments);
            }
            function WriteStream$open() {
                var that = this;
                open(that.path, that.flags, that.mode, function(err, fd) {
                    if (err) {
                        that.destroy();
                        that.emit("error", err);
                    } else {
                        that.fd = fd;
                        that.emit("open", fd);
                    }
                });
            }
            function createReadStream(path, options) {
                return new fs.ReadStream(path, options);
            }
            function createWriteStream(path, options) {
                return new fs.WriteStream(path, options);
            }
            var fs$open = fs.open;
            fs.open = open;
            function open(path, flags, mode, cb) {
                if (typeof mode === "function") cb = mode, mode = null;
                return go$open(path, flags, mode, cb);
                function go$open(path, flags, mode, cb, startTime) {
                    return fs$open(path, flags, mode, function(err, fd) {
                        if (err && (err.code === "EMFILE" || err.code === "ENFILE")) enqueue([ go$open, [ path, flags, mode, cb ], err, startTime || Date.now(), Date.now() ]); else {
                            if (typeof cb === "function") cb.apply(this, arguments);
                        }
                    });
                }
            }
            return fs;
        }
        function enqueue(elem) {
            debug("ENQUEUE", elem[0].name, elem[1]);
            fs[gracefulQueue].push(elem);
            retry();
        }
        var retryTimer;
        function resetQueue() {
            var now = Date.now();
            for (var i = 0; i < fs[gracefulQueue].length; ++i) {
                if (fs[gracefulQueue][i].length > 2) {
                    fs[gracefulQueue][i][3] = now;
                    fs[gracefulQueue][i][4] = now;
                }
            }
            retry();
        }
        function retry() {
            clearTimeout(retryTimer);
            retryTimer = undefined;
            if (fs[gracefulQueue].length === 0) return;
            var elem = fs[gracefulQueue].shift();
            var fn = elem[0];
            var args = elem[1];
            var err = elem[2];
            var startTime = elem[3];
            var lastTime = elem[4];
            if (startTime === undefined) {
                debug("RETRY", fn.name, args);
                fn.apply(null, args);
            } else if (Date.now() - startTime >= 6e4) {
                debug("TIMEOUT", fn.name, args);
                var cb = args.pop();
                if (typeof cb === "function") cb.call(null, err);
            } else {
                var sinceAttempt = Date.now() - lastTime;
                var sinceStart = Math.max(lastTime - startTime, 1);
                var desiredDelay = Math.min(sinceStart * 1.2, 100);
                if (sinceAttempt >= desiredDelay) {
                    debug("RETRY", fn.name, args);
                    fn.apply(null, args.concat([ startTime ]));
                } else {
                    fs[gracefulQueue].push(elem);
                }
            }
            if (retryTimer === undefined) {
                retryTimer = setTimeout(retry, 0);
            }
        }
    },
    1745(module, __unused_webpack_exports, __webpack_require__) {
        var Stream = __webpack_require__(2203).Stream;
        module.exports = legacy;
        function legacy(fs) {
            return {
                ReadStream,
                WriteStream
            };
            function ReadStream(path, options) {
                if (!(this instanceof ReadStream)) return new ReadStream(path, options);
                Stream.call(this);
                var self = this;
                this.path = path;
                this.fd = null;
                this.readable = true;
                this.paused = false;
                this.flags = "r";
                this.mode = 438;
                this.bufferSize = 64 * 1024;
                options = options || {};
                var keys = Object.keys(options);
                for (var index = 0, length = keys.length; index < length; index++) {
                    var key = keys[index];
                    this[key] = options[key];
                }
                if (this.encoding) this.setEncoding(this.encoding);
                if (this.start !== undefined) {
                    if ("number" !== typeof this.start) {
                        throw TypeError("start must be a Number");
                    }
                    if (this.end === undefined) {
                        this.end = Infinity;
                    } else if ("number" !== typeof this.end) {
                        throw TypeError("end must be a Number");
                    }
                    if (this.start > this.end) {
                        throw new Error("start must be <= end");
                    }
                    this.pos = this.start;
                }
                if (this.fd !== null) {
                    process.nextTick(function() {
                        self._read();
                    });
                    return;
                }
                fs.open(this.path, this.flags, this.mode, function(err, fd) {
                    if (err) {
                        self.emit("error", err);
                        self.readable = false;
                        return;
                    }
                    self.fd = fd;
                    self.emit("open", fd);
                    self._read();
                });
            }
            function WriteStream(path, options) {
                if (!(this instanceof WriteStream)) return new WriteStream(path, options);
                Stream.call(this);
                this.path = path;
                this.fd = null;
                this.writable = true;
                this.flags = "w";
                this.encoding = "binary";
                this.mode = 438;
                this.bytesWritten = 0;
                options = options || {};
                var keys = Object.keys(options);
                for (var index = 0, length = keys.length; index < length; index++) {
                    var key = keys[index];
                    this[key] = options[key];
                }
                if (this.start !== undefined) {
                    if ("number" !== typeof this.start) {
                        throw TypeError("start must be a Number");
                    }
                    if (this.start < 0) {
                        throw new Error("start must be >= zero");
                    }
                    this.pos = this.start;
                }
                this.busy = false;
                this._queue = [];
                if (this.fd === null) {
                    this._open = fs.open;
                    this._queue.push([ this._open, this.path, this.flags, this.mode, undefined ]);
                    this.flush();
                }
            }
        }
    },
    4988(module, __unused_webpack_exports, __webpack_require__) {
        var constants = __webpack_require__(9140);
        var origCwd = process.cwd;
        var cwd = null;
        var platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
        process.cwd = function() {
            if (!cwd) cwd = origCwd.call(process);
            return cwd;
        };
        try {
            process.cwd();
        } catch (er) {}
        if (typeof process.chdir === "function") {
            var chdir = process.chdir;
            process.chdir = function(d) {
                cwd = null;
                chdir.call(process, d);
            };
            if (Object.setPrototypeOf) Object.setPrototypeOf(process.chdir, chdir);
        }
        module.exports = patch;
        function patch(fs) {
            if (constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./)) {
                patchLchmod(fs);
            }
            if (!fs.lutimes) {
                patchLutimes(fs);
            }
            fs.chown = chownFix(fs.chown);
            fs.fchown = chownFix(fs.fchown);
            fs.lchown = chownFix(fs.lchown);
            fs.chmod = chmodFix(fs.chmod);
            fs.fchmod = chmodFix(fs.fchmod);
            fs.lchmod = chmodFix(fs.lchmod);
            fs.chownSync = chownFixSync(fs.chownSync);
            fs.fchownSync = chownFixSync(fs.fchownSync);
            fs.lchownSync = chownFixSync(fs.lchownSync);
            fs.chmodSync = chmodFixSync(fs.chmodSync);
            fs.fchmodSync = chmodFixSync(fs.fchmodSync);
            fs.lchmodSync = chmodFixSync(fs.lchmodSync);
            fs.stat = statFix(fs.stat);
            fs.fstat = statFix(fs.fstat);
            fs.lstat = statFix(fs.lstat);
            fs.statSync = statFixSync(fs.statSync);
            fs.fstatSync = statFixSync(fs.fstatSync);
            fs.lstatSync = statFixSync(fs.lstatSync);
            if (fs.chmod && !fs.lchmod) {
                fs.lchmod = function(path, mode, cb) {
                    if (cb) process.nextTick(cb);
                };
                fs.lchmodSync = function() {};
            }
            if (fs.chown && !fs.lchown) {
                fs.lchown = function(path, uid, gid, cb) {
                    if (cb) process.nextTick(cb);
                };
                fs.lchownSync = function() {};
            }
            if (platform === "win32") {
                fs.rename = typeof fs.rename !== "function" ? fs.rename : function(fs$rename) {
                    function rename(from, to, cb) {
                        var start = Date.now();
                        var backoff = 0;
                        fs$rename(from, to, function CB(er) {
                            if (er && (er.code === "EACCES" || er.code === "EPERM" || er.code === "EBUSY") && Date.now() - start < 6e4) {
                                setTimeout(function() {
                                    fs.stat(to, function(stater, st) {
                                        if (stater && stater.code === "ENOENT") fs$rename(from, to, CB); else cb(er);
                                    });
                                }, backoff);
                                if (backoff < 100) backoff += 10;
                                return;
                            }
                            if (cb) cb(er);
                        });
                    }
                    if (Object.setPrototypeOf) Object.setPrototypeOf(rename, fs$rename);
                    return rename;
                }(fs.rename);
            }
            fs.read = typeof fs.read !== "function" ? fs.read : function(fs$read) {
                function read(fd, buffer, offset, length, position, callback_) {
                    var callback;
                    if (callback_ && typeof callback_ === "function") {
                        var eagCounter = 0;
                        callback = function(er, _, __) {
                            if (er && er.code === "EAGAIN" && eagCounter < 10) {
                                eagCounter++;
                                return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                            }
                            callback_.apply(this, arguments);
                        };
                    }
                    return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                }
                if (Object.setPrototypeOf) Object.setPrototypeOf(read, fs$read);
                return read;
            }(fs.read);
            fs.readSync = typeof fs.readSync !== "function" ? fs.readSync : function(fs$readSync) {
                return function(fd, buffer, offset, length, position) {
                    var eagCounter = 0;
                    while (true) {
                        try {
                            return fs$readSync.call(fs, fd, buffer, offset, length, position);
                        } catch (er) {
                            if (er.code === "EAGAIN" && eagCounter < 10) {
                                eagCounter++;
                                continue;
                            }
                            throw er;
                        }
                    }
                };
            }(fs.readSync);
            function patchLchmod(fs) {
                fs.lchmod = function(path, mode, callback) {
                    fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, function(err, fd) {
                        if (err) {
                            if (callback) callback(err);
                            return;
                        }
                        fs.fchmod(fd, mode, function(err) {
                            fs.close(fd, function(err2) {
                                if (callback) callback(err || err2);
                            });
                        });
                    });
                };
                fs.lchmodSync = function(path, mode) {
                    var fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode);
                    var threw = true;
                    var ret;
                    try {
                        ret = fs.fchmodSync(fd, mode);
                        threw = false;
                    } finally {
                        if (threw) {
                            try {
                                fs.closeSync(fd);
                            } catch (er) {}
                        } else {
                            fs.closeSync(fd);
                        }
                    }
                    return ret;
                };
            }
            function patchLutimes(fs) {
                if (constants.hasOwnProperty("O_SYMLINK") && fs.futimes) {
                    fs.lutimes = function(path, at, mt, cb) {
                        fs.open(path, constants.O_SYMLINK, function(er, fd) {
                            if (er) {
                                if (cb) cb(er);
                                return;
                            }
                            fs.futimes(fd, at, mt, function(er) {
                                fs.close(fd, function(er2) {
                                    if (cb) cb(er || er2);
                                });
                            });
                        });
                    };
                    fs.lutimesSync = function(path, at, mt) {
                        var fd = fs.openSync(path, constants.O_SYMLINK);
                        var ret;
                        var threw = true;
                        try {
                            ret = fs.futimesSync(fd, at, mt);
                            threw = false;
                        } finally {
                            if (threw) {
                                try {
                                    fs.closeSync(fd);
                                } catch (er) {}
                            } else {
                                fs.closeSync(fd);
                            }
                        }
                        return ret;
                    };
                } else if (fs.futimes) {
                    fs.lutimes = function(_a, _b, _c, cb) {
                        if (cb) process.nextTick(cb);
                    };
                    fs.lutimesSync = function() {};
                }
            }
            function chmodFix(orig) {
                if (!orig) return orig;
                return function(target, mode, cb) {
                    return orig.call(fs, target, mode, function(er) {
                        if (chownErOk(er)) er = null;
                        if (cb) cb.apply(this, arguments);
                    });
                };
            }
            function chmodFixSync(orig) {
                if (!orig) return orig;
                return function(target, mode) {
                    try {
                        return orig.call(fs, target, mode);
                    } catch (er) {
                        if (!chownErOk(er)) throw er;
                    }
                };
            }
            function chownFix(orig) {
                if (!orig) return orig;
                return function(target, uid, gid, cb) {
                    return orig.call(fs, target, uid, gid, function(er) {
                        if (chownErOk(er)) er = null;
                        if (cb) cb.apply(this, arguments);
                    });
                };
            }
            function chownFixSync(orig) {
                if (!orig) return orig;
                return function(target, uid, gid) {
                    try {
                        return orig.call(fs, target, uid, gid);
                    } catch (er) {
                        if (!chownErOk(er)) throw er;
                    }
                };
            }
            function statFix(orig) {
                if (!orig) return orig;
                return function(target, options, cb) {
                    if (typeof options === "function") {
                        cb = options;
                        options = null;
                    }
                    function callback(er, stats) {
                        if (stats) {
                            if (stats.uid < 0) stats.uid += 4294967296;
                            if (stats.gid < 0) stats.gid += 4294967296;
                        }
                        if (cb) cb.apply(this, arguments);
                    }
                    return options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
                };
            }
            function statFixSync(orig) {
                if (!orig) return orig;
                return function(target, options) {
                    var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
                    if (stats) {
                        if (stats.uid < 0) stats.uid += 4294967296;
                        if (stats.gid < 0) stats.gid += 4294967296;
                    }
                    return stats;
                };
            }
            function chownErOk(er) {
                if (!er) return true;
                if (er.code === "ENOSYS") return true;
                var nonroot = !process.getuid || process.getuid() !== 0;
                if (nonroot) {
                    if (er.code === "EINVAL" || er.code === "EPERM") return true;
                }
                return false;
            }
        }
    },
    3023(module, __unused_webpack_exports, __webpack_require__) {
        let _fs;
        try {
            _fs = __webpack_require__(9333);
        } catch (_) {
            _fs = __webpack_require__(9896);
        }
        const universalify = __webpack_require__(9022);
        const {stringify, stripBom} = __webpack_require__(7578);
        async function _readFile(file, options = {}) {
            if (typeof options === "string") {
                options = {
                    encoding: options
                };
            }
            const fs = options.fs || _fs;
            const shouldThrow = "throws" in options ? options.throws : true;
            let data = await universalify.fromCallback(fs.readFile)(file, options);
            data = stripBom(data);
            let obj;
            try {
                obj = JSON.parse(data, options ? options.reviver : null);
            } catch (err) {
                if (shouldThrow) {
                    err.message = `${file}: ${err.message}`;
                    throw err;
                } else {
                    return null;
                }
            }
            return obj;
        }
        const readFile = universalify.fromPromise(_readFile);
        function readFileSync(file, options = {}) {
            if (typeof options === "string") {
                options = {
                    encoding: options
                };
            }
            const fs = options.fs || _fs;
            const shouldThrow = "throws" in options ? options.throws : true;
            try {
                let content = fs.readFileSync(file, options);
                content = stripBom(content);
                return JSON.parse(content, options.reviver);
            } catch (err) {
                if (shouldThrow) {
                    err.message = `${file}: ${err.message}`;
                    throw err;
                } else {
                    return null;
                }
            }
        }
        async function _writeFile(file, obj, options = {}) {
            const fs = options.fs || _fs;
            const str = stringify(obj, options);
            await universalify.fromCallback(fs.writeFile)(file, str, options);
        }
        const writeFile = universalify.fromPromise(_writeFile);
        function writeFileSync(file, obj, options = {}) {
            const fs = options.fs || _fs;
            const str = stringify(obj, options);
            return fs.writeFileSync(file, str, options);
        }
        module.exports = {
            readFile,
            readFileSync,
            writeFile,
            writeFileSync
        };
    },
    7578(module) {
        function stringify(obj, {EOL = "\n", finalEOL = true, replacer = null, spaces} = {}) {
            const EOF = finalEOL ? EOL : "";
            const str = JSON.stringify(obj, replacer, spaces);
            return str.replace(/\n/g, EOL) + EOF;
        }
        function stripBom(content) {
            if (Buffer.isBuffer(content)) content = content.toString("utf8");
            return content.replace(/^\uFEFF/, "");
        }
        module.exports = {
            stringify,
            stripBom
        };
    },
    4509(__unused_webpack_module, exports, __webpack_require__) {
        var fs = __webpack_require__(9896);
        var wx = "wx";
        if (process.version.match(/^v0\.[0-6]/)) {
            var c = __webpack_require__(9140);
            wx = c.O_TRUNC | c.O_CREAT | c.O_WRONLY | c.O_EXCL;
        }
        var os = __webpack_require__(857);
        exports.filetime = "ctime";
        if (os.platform() == "win32") {
            exports.filetime = "mtime";
        }
        var debug;
        var util = __webpack_require__(9023);
        if (util.debuglog) debug = util.debuglog("LOCKFILE"); else if (/\blockfile\b/i.test(process.env.NODE_DEBUG)) debug = function() {
            var msg = util.format.apply(util, arguments);
            console.error("LOCKFILE %d %s", process.pid, msg);
        }; else debug = function() {};
        var locks = {};
        function hasOwnProperty(obj, prop) {
            return Object.prototype.hasOwnProperty.call(obj, prop);
        }
        var onExit = __webpack_require__(2434);
        onExit(function() {
            debug("exit listener");
            Object.keys(locks).forEach(exports.unlockSync);
        });
        if (/^v0\.[0-8]\./.test(process.version)) {
            debug("uncaughtException, version = %s", process.version);
            process.on("uncaughtException", function H(er) {
                debug("uncaughtException");
                var l = process.listeners("uncaughtException").filter(function(h) {
                    return h !== H;
                });
                if (!l.length) {
                    try {
                        Object.keys(locks).forEach(exports.unlockSync);
                    } catch (e) {}
                    process.removeListener("uncaughtException", H);
                    throw er;
                }
            });
        }
        exports.unlock = function(path, cb) {
            debug("unlock", path);
            delete locks[path];
            fs.unlink(path, function(unlinkEr) {
                cb && cb();
            });
        };
        exports.unlockSync = function(path) {
            debug("unlockSync", path);
            try {
                fs.unlinkSync(path);
            } catch (er) {}
            delete locks[path];
        };
        exports.check = function(path, opts, cb) {
            if (typeof opts === "function") cb = opts, opts = {};
            debug("check", path, opts);
            fs.open(path, "r", function(er, fd) {
                if (er) {
                    if (er.code !== "ENOENT") return cb(er);
                    return cb(null, false);
                }
                if (!opts.stale) {
                    return fs.close(fd, function(er) {
                        return cb(er, true);
                    });
                }
                fs.fstat(fd, function(er, st) {
                    if (er) return fs.close(fd, function(er2) {
                        return cb(er);
                    });
                    fs.close(fd, function(er) {
                        var age = Date.now() - st[exports.filetime].getTime();
                        return cb(er, age <= opts.stale);
                    });
                });
            });
        };
        exports.checkSync = function(path, opts) {
            opts = opts || {};
            debug("checkSync", path, opts);
            if (opts.wait) {
                throw new Error("opts.wait not supported sync for obvious reasons");
            }
            try {
                var fd = fs.openSync(path, "r");
            } catch (er) {
                if (er.code !== "ENOENT") throw er;
                return false;
            }
            if (!opts.stale) {
                try {
                    fs.closeSync(fd);
                } catch (er) {}
                return true;
            }
            if (opts.stale) {
                try {
                    var st = fs.fstatSync(fd);
                } finally {
                    fs.closeSync(fd);
                }
                var age = Date.now() - st[exports.filetime].getTime();
                return age <= opts.stale;
            }
        };
        var req = 1;
        exports.lock = function(path, opts, cb) {
            if (typeof opts === "function") cb = opts, opts = {};
            opts.req = opts.req || req++;
            debug("lock", path, opts);
            opts.start = opts.start || Date.now();
            if (typeof opts.retries === "number" && opts.retries > 0) {
                debug("has retries", opts.retries);
                var retries = opts.retries;
                opts.retries = 0;
                cb = function(orig) {
                    return function cb(er, fd) {
                        debug("retry-mutated callback");
                        retries -= 1;
                        if (!er || retries < 0) return orig(er, fd);
                        debug("lock retry", path, opts);
                        if (opts.retryWait) setTimeout(retry, opts.retryWait); else retry();
                        function retry() {
                            opts.start = Date.now();
                            debug("retrying", opts.start);
                            exports.lock(path, opts, cb);
                        }
                    };
                }(cb);
            }
            fs.open(path, wx, function(er, fd) {
                if (!er) {
                    debug("locked", path, fd);
                    locks[path] = fd;
                    return fs.close(fd, function() {
                        return cb();
                    });
                }
                debug("failed to acquire lock", er);
                if (er.code !== "EEXIST") {
                    debug("not EEXIST error", er);
                    return cb(er);
                }
                if (!opts.stale) return notStale(er, path, opts, cb);
                return maybeStale(er, path, opts, false, cb);
            });
            debug("lock return");
        };
        function maybeStale(originalEr, path, opts, hasStaleLock, cb) {
            fs.stat(path, function(statEr, st) {
                if (statEr) {
                    if (statEr.code === "ENOENT") {
                        opts.stale = false;
                        debug("lock stale enoent retry", path, opts);
                        exports.lock(path, opts, cb);
                        return;
                    }
                    return cb(statEr);
                }
                var age = Date.now() - st[exports.filetime].getTime();
                if (age <= opts.stale) return notStale(originalEr, path, opts, cb);
                debug("lock stale", path, opts);
                if (hasStaleLock) {
                    exports.unlock(path, function(er) {
                        if (er) return cb(er);
                        debug("lock stale retry", path, opts);
                        fs.link(path + ".STALE", path, function(er) {
                            fs.unlink(path + ".STALE", function() {
                                cb(er);
                            });
                        });
                    });
                } else {
                    debug("acquire .STALE file lock", opts);
                    exports.lock(path + ".STALE", opts, function(er) {
                        if (er) return cb(er);
                        maybeStale(originalEr, path, opts, true, cb);
                    });
                }
            });
        }
        function notStale(er, path, opts, cb) {
            debug("notStale", path, opts);
            if (typeof opts.wait !== "number" || opts.wait <= 0) {
                debug("notStale, wait is not a number");
                return cb(er);
            }
            var now = Date.now();
            var start = opts.start || now;
            var end = start + opts.wait;
            if (end <= now) return cb(er);
            debug("now=%d, wait until %d (delta=%d)", start, end, end - start);
            var wait = Math.min(end - start, opts.pollPeriod || 100);
            var timer = setTimeout(poll, wait);
            function poll() {
                debug("notStale, polling", path, opts);
                exports.lock(path, opts, cb);
            }
        }
        exports.lockSync = function(path, opts) {
            opts = opts || {};
            opts.req = opts.req || req++;
            debug("lockSync", path, opts);
            if (opts.wait || opts.retryWait) {
                throw new Error("opts.wait not supported sync for obvious reasons");
            }
            try {
                var fd = fs.openSync(path, wx);
                locks[path] = fd;
                try {
                    fs.closeSync(fd);
                } catch (er) {}
                debug("locked sync!", path, fd);
                return;
            } catch (er) {
                if (er.code !== "EEXIST") return retryThrow(path, opts, er);
                if (opts.stale) {
                    var st = fs.statSync(path);
                    var ct = st[exports.filetime].getTime();
                    if (!(ct % 1e3) && opts.stale % 1e3) {
                        opts.stale = 1e3 * Math.ceil(opts.stale / 1e3);
                    }
                    var age = Date.now() - ct;
                    if (age > opts.stale) {
                        debug("lockSync stale", path, opts, age);
                        exports.unlockSync(path);
                        return exports.lockSync(path, opts);
                    }
                }
                debug("failed to lock", path, opts, er);
                return retryThrow(path, opts, er);
            }
        };
        function retryThrow(path, opts, er) {
            if (typeof opts.retries === "number" && opts.retries > 0) {
                var newRT = opts.retries - 1;
                debug("retryThrow", path, opts, newRT);
                opts.retries = newRT;
                return exports.lockSync(path, opts);
            }
            throw er;
        }
    },
    5710(module, __unused_webpack_exports, __webpack_require__) {
        const optsArg = __webpack_require__(4543);
        const pathArg = __webpack_require__(394);
        const {mkdirpNative, mkdirpNativeSync} = __webpack_require__(9153);
        const {mkdirpManual, mkdirpManualSync} = __webpack_require__(4524);
        const {useNative, useNativeSync} = __webpack_require__(3741);
        const mkdirp = (path, opts) => {
            path = pathArg(path);
            opts = optsArg(opts);
            return useNative(opts) ? mkdirpNative(path, opts) : mkdirpManual(path, opts);
        };
        const mkdirpSync = (path, opts) => {
            path = pathArg(path);
            opts = optsArg(opts);
            return useNativeSync(opts) ? mkdirpNativeSync(path, opts) : mkdirpManualSync(path, opts);
        };
        mkdirp.sync = mkdirpSync;
        mkdirp.native = (path, opts) => mkdirpNative(pathArg(path), optsArg(opts));
        mkdirp.manual = (path, opts) => mkdirpManual(pathArg(path), optsArg(opts));
        mkdirp.nativeSync = (path, opts) => mkdirpNativeSync(pathArg(path), optsArg(opts));
        mkdirp.manualSync = (path, opts) => mkdirpManualSync(pathArg(path), optsArg(opts));
        module.exports = mkdirp;
    },
    4061(module, __unused_webpack_exports, __webpack_require__) {
        const {dirname} = __webpack_require__(6928);
        const findMade = (opts, parent, path = undefined) => {
            if (path === parent) return Promise.resolve();
            return opts.statAsync(parent).then(st => st.isDirectory() ? path : undefined, er => er.code === "ENOENT" ? findMade(opts, dirname(parent), parent) : undefined);
        };
        const findMadeSync = (opts, parent, path = undefined) => {
            if (path === parent) return undefined;
            try {
                return opts.statSync(parent).isDirectory() ? path : undefined;
            } catch (er) {
                return er.code === "ENOENT" ? findMadeSync(opts, dirname(parent), parent) : undefined;
            }
        };
        module.exports = {
            findMade,
            findMadeSync
        };
    },
    4524(module, __unused_webpack_exports, __webpack_require__) {
        const {dirname} = __webpack_require__(6928);
        const mkdirpManual = (path, opts, made) => {
            opts.recursive = false;
            const parent = dirname(path);
            if (parent === path) {
                return opts.mkdirAsync(path, opts).catch(er => {
                    if (er.code !== "EISDIR") throw er;
                });
            }
            return opts.mkdirAsync(path, opts).then(() => made || path, er => {
                if (er.code === "ENOENT") return mkdirpManual(parent, opts).then(made => mkdirpManual(path, opts, made));
                if (er.code !== "EEXIST" && er.code !== "EROFS") throw er;
                return opts.statAsync(path).then(st => {
                    if (st.isDirectory()) return made; else throw er;
                }, () => {
                    throw er;
                });
            });
        };
        const mkdirpManualSync = (path, opts, made) => {
            const parent = dirname(path);
            opts.recursive = false;
            if (parent === path) {
                try {
                    return opts.mkdirSync(path, opts);
                } catch (er) {
                    if (er.code !== "EISDIR") throw er; else return;
                }
            }
            try {
                opts.mkdirSync(path, opts);
                return made || path;
            } catch (er) {
                if (er.code === "ENOENT") return mkdirpManualSync(path, opts, mkdirpManualSync(parent, opts, made));
                if (er.code !== "EEXIST" && er.code !== "EROFS") throw er;
                try {
                    if (!opts.statSync(path).isDirectory()) throw er;
                } catch (_) {
                    throw er;
                }
            }
        };
        module.exports = {
            mkdirpManual,
            mkdirpManualSync
        };
    },
    9153(module, __unused_webpack_exports, __webpack_require__) {
        const {dirname} = __webpack_require__(6928);
        const {findMade, findMadeSync} = __webpack_require__(4061);
        const {mkdirpManual, mkdirpManualSync} = __webpack_require__(4524);
        const mkdirpNative = (path, opts) => {
            opts.recursive = true;
            const parent = dirname(path);
            if (parent === path) return opts.mkdirAsync(path, opts);
            return findMade(opts, path).then(made => opts.mkdirAsync(path, opts).then(() => made).catch(er => {
                if (er.code === "ENOENT") return mkdirpManual(path, opts); else throw er;
            }));
        };
        const mkdirpNativeSync = (path, opts) => {
            opts.recursive = true;
            const parent = dirname(path);
            if (parent === path) return opts.mkdirSync(path, opts);
            const made = findMadeSync(opts, path);
            try {
                opts.mkdirSync(path, opts);
                return made;
            } catch (er) {
                if (er.code === "ENOENT") return mkdirpManualSync(path, opts); else throw er;
            }
        };
        module.exports = {
            mkdirpNative,
            mkdirpNativeSync
        };
    },
    4543(module, __unused_webpack_exports, __webpack_require__) {
        const {promisify} = __webpack_require__(9023);
        const fs = __webpack_require__(9896);
        const optsArg = opts => {
            if (!opts) opts = {
                mode: 511,
                fs
            }; else if (typeof opts === "object") opts = {
                mode: 511,
                fs,
                ...opts
            }; else if (typeof opts === "number") opts = {
                mode: opts,
                fs
            }; else if (typeof opts === "string") opts = {
                mode: parseInt(opts, 8),
                fs
            }; else throw new TypeError("invalid options argument");
            opts.mkdir = opts.mkdir || opts.fs.mkdir || fs.mkdir;
            opts.mkdirAsync = promisify(opts.mkdir);
            opts.stat = opts.stat || opts.fs.stat || fs.stat;
            opts.statAsync = promisify(opts.stat);
            opts.statSync = opts.statSync || opts.fs.statSync || fs.statSync;
            opts.mkdirSync = opts.mkdirSync || opts.fs.mkdirSync || fs.mkdirSync;
            return opts;
        };
        module.exports = optsArg;
    },
    394(module, __unused_webpack_exports, __webpack_require__) {
        const platform = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform;
        const {resolve, parse} = __webpack_require__(6928);
        const pathArg = path => {
            if (/\0/.test(path)) {
                throw Object.assign(new TypeError("path must be a string without null bytes"), {
                    path,
                    code: "ERR_INVALID_ARG_VALUE"
                });
            }
            path = resolve(path);
            if (platform === "win32") {
                const badWinChars = /[*|"<>?:]/;
                const {root} = parse(path);
                if (badWinChars.test(path.substr(root.length))) {
                    throw Object.assign(new Error("Illegal characters in path."), {
                        path,
                        code: "EINVAL"
                    });
                }
            }
            return path;
        };
        module.exports = pathArg;
    },
    3741(module, __unused_webpack_exports, __webpack_require__) {
        const fs = __webpack_require__(9896);
        const version = process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version;
        const versArr = version.replace(/^v/, "").split(".");
        const hasNative = +versArr[0] > 10 || +versArr[0] === 10 && +versArr[1] >= 12;
        const useNative = !hasNative ? () => false : opts => opts.mkdir === fs.mkdir;
        const useNativeSync = !hasNative ? () => false : opts => opts.mkdirSync === fs.mkdirSync;
        module.exports = {
            useNative,
            useNativeSync
        };
    },
    2434(module, __unused_webpack_exports, __webpack_require__) {
        var process = global.process;
        const processOk = function(process) {
            return process && typeof process === "object" && typeof process.removeListener === "function" && typeof process.emit === "function" && typeof process.reallyExit === "function" && typeof process.listeners === "function" && typeof process.kill === "function" && typeof process.pid === "number" && typeof process.on === "function";
        };
        if (!processOk(process)) {
            module.exports = function() {
                return function() {};
            };
        } else {
            var assert = __webpack_require__(2613);
            var signals = __webpack_require__(5935);
            var isWin = /^win/i.test(process.platform);
            var EE = __webpack_require__(4434);
            if (typeof EE !== "function") {
                EE = EE.EventEmitter;
            }
            var emitter;
            if (process.__signal_exit_emitter__) {
                emitter = process.__signal_exit_emitter__;
            } else {
                emitter = process.__signal_exit_emitter__ = new EE;
                emitter.count = 0;
                emitter.emitted = {};
            }
            if (!emitter.infinite) {
                emitter.setMaxListeners(Infinity);
                emitter.infinite = true;
            }
            module.exports = function(cb, opts) {
                if (!processOk(global.process)) {
                    return function() {};
                }
                assert.equal(typeof cb, "function", "a callback must be provided for exit handler");
                if (loaded === false) {
                    load();
                }
                var ev = "exit";
                if (opts && opts.alwaysLast) {
                    ev = "afterexit";
                }
                var remove = function() {
                    emitter.removeListener(ev, cb);
                    if (emitter.listeners("exit").length === 0 && emitter.listeners("afterexit").length === 0) {
                        unload();
                    }
                };
                emitter.on(ev, cb);
                return remove;
            };
            var unload = function unload() {
                if (!loaded || !processOk(global.process)) {
                    return;
                }
                loaded = false;
                signals.forEach(function(sig) {
                    try {
                        process.removeListener(sig, sigListeners[sig]);
                    } catch (er) {}
                });
                process.emit = originalProcessEmit;
                process.reallyExit = originalProcessReallyExit;
                emitter.count -= 1;
            };
            module.exports.unload = unload;
            var emit = function emit(event, code, signal) {
                if (emitter.emitted[event]) {
                    return;
                }
                emitter.emitted[event] = true;
                emitter.emit(event, code, signal);
            };
            var sigListeners = {};
            signals.forEach(function(sig) {
                sigListeners[sig] = function listener() {
                    if (!processOk(global.process)) {
                        return;
                    }
                    var listeners = process.listeners(sig);
                    if (listeners.length === emitter.count) {
                        unload();
                        emit("exit", null, sig);
                        emit("afterexit", null, sig);
                        if (isWin && sig === "SIGHUP") {
                            sig = "SIGINT";
                        }
                        process.kill(process.pid, sig);
                    }
                };
            });
            module.exports.signals = function() {
                return signals;
            };
            var loaded = false;
            var load = function load() {
                if (loaded || !processOk(global.process)) {
                    return;
                }
                loaded = true;
                emitter.count += 1;
                signals = signals.filter(function(sig) {
                    try {
                        process.on(sig, sigListeners[sig]);
                        return true;
                    } catch (er) {
                        return false;
                    }
                });
                process.emit = processEmit;
                process.reallyExit = processReallyExit;
            };
            module.exports.load = load;
            var originalProcessReallyExit = process.reallyExit;
            var processReallyExit = function processReallyExit(code) {
                if (!processOk(global.process)) {
                    return;
                }
                process.exitCode = code || 0;
                emit("exit", process.exitCode, null);
                emit("afterexit", process.exitCode, null);
                originalProcessReallyExit.call(process, process.exitCode);
            };
            var originalProcessEmit = process.emit;
            var processEmit = function processEmit(ev, arg) {
                if (ev === "exit" && processOk(global.process)) {
                    if (arg !== undefined) {
                        process.exitCode = arg;
                    }
                    var ret = originalProcessEmit.apply(this, arguments);
                    emit("exit", process.exitCode, null);
                    emit("afterexit", process.exitCode, null);
                    return ret;
                } else {
                    return originalProcessEmit.apply(this, arguments);
                }
            };
        }
    },
    5935(module) {
        module.exports = [ "SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM" ];
        if (process.platform !== "win32") {
            module.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT");
        }
        if (process.platform === "linux") {
            module.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
        }
    },
    9022(__unused_webpack_module, exports) {
        "use strict";
        exports.fromCallback = function(fn) {
            return Object.defineProperty(function(...args) {
                if (typeof args[args.length - 1] === "function") fn.apply(this, args); else {
                    return new Promise((resolve, reject) => {
                        args.push((err, res) => err != null ? reject(err) : resolve(res));
                        fn.apply(this, args);
                    });
                }
            }, "name", {
                value: fn.name
            });
        };
        exports.fromPromise = function(fn) {
            return Object.defineProperty(function(...args) {
                const cb = args[args.length - 1];
                if (typeof cb !== "function") return fn.apply(this, args); else {
                    args.pop();
                    fn.apply(this, args).then(r => cb(null, r), cb);
                }
            }, "name", {
                value: fn.name
            });
        };
    },
    6949(module) {
        "use strict";
        module.exports = function(Yallist) {
            Yallist.prototype[Symbol.iterator] = function*() {
                for (let walker = this.head; walker; walker = walker.next) {
                    yield walker.value;
                }
            };
        };
    },
    5773(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        module.exports = Yallist;
        Yallist.Node = Node;
        Yallist.create = Yallist;
        function Yallist(list) {
            var self = this;
            if (!(self instanceof Yallist)) {
                self = new Yallist;
            }
            self.tail = null;
            self.head = null;
            self.length = 0;
            if (list && typeof list.forEach === "function") {
                list.forEach(function(item) {
                    self.push(item);
                });
            } else if (arguments.length > 0) {
                for (var i = 0, l = arguments.length; i < l; i++) {
                    self.push(arguments[i]);
                }
            }
            return self;
        }
        Yallist.prototype.removeNode = function(node) {
            if (node.list !== this) {
                throw new Error("removing node which does not belong to this list");
            }
            var next = node.next;
            var prev = node.prev;
            if (next) {
                next.prev = prev;
            }
            if (prev) {
                prev.next = next;
            }
            if (node === this.head) {
                this.head = next;
            }
            if (node === this.tail) {
                this.tail = prev;
            }
            node.list.length--;
            node.next = null;
            node.prev = null;
            node.list = null;
            return next;
        };
        Yallist.prototype.unshiftNode = function(node) {
            if (node === this.head) {
                return;
            }
            if (node.list) {
                node.list.removeNode(node);
            }
            var head = this.head;
            node.list = this;
            node.next = head;
            if (head) {
                head.prev = node;
            }
            this.head = node;
            if (!this.tail) {
                this.tail = node;
            }
            this.length++;
        };
        Yallist.prototype.pushNode = function(node) {
            if (node === this.tail) {
                return;
            }
            if (node.list) {
                node.list.removeNode(node);
            }
            var tail = this.tail;
            node.list = this;
            node.prev = tail;
            if (tail) {
                tail.next = node;
            }
            this.tail = node;
            if (!this.head) {
                this.head = node;
            }
            this.length++;
        };
        Yallist.prototype.push = function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                push(this, arguments[i]);
            }
            return this.length;
        };
        Yallist.prototype.unshift = function() {
            for (var i = 0, l = arguments.length; i < l; i++) {
                unshift(this, arguments[i]);
            }
            return this.length;
        };
        Yallist.prototype.pop = function() {
            if (!this.tail) {
                return undefined;
            }
            var res = this.tail.value;
            this.tail = this.tail.prev;
            if (this.tail) {
                this.tail.next = null;
            } else {
                this.head = null;
            }
            this.length--;
            return res;
        };
        Yallist.prototype.shift = function() {
            if (!this.head) {
                return undefined;
            }
            var res = this.head.value;
            this.head = this.head.next;
            if (this.head) {
                this.head.prev = null;
            } else {
                this.tail = null;
            }
            this.length--;
            return res;
        };
        Yallist.prototype.forEach = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.head, i = 0; walker !== null; i++) {
                fn.call(thisp, walker.value, i, this);
                walker = walker.next;
            }
        };
        Yallist.prototype.forEachReverse = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
                fn.call(thisp, walker.value, i, this);
                walker = walker.prev;
            }
        };
        Yallist.prototype.get = function(n) {
            for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
                walker = walker.next;
            }
            if (i === n && walker !== null) {
                return walker.value;
            }
        };
        Yallist.prototype.getReverse = function(n) {
            for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
                walker = walker.prev;
            }
            if (i === n && walker !== null) {
                return walker.value;
            }
        };
        Yallist.prototype.map = function(fn, thisp) {
            thisp = thisp || this;
            var res = new Yallist;
            for (var walker = this.head; walker !== null; ) {
                res.push(fn.call(thisp, walker.value, this));
                walker = walker.next;
            }
            return res;
        };
        Yallist.prototype.mapReverse = function(fn, thisp) {
            thisp = thisp || this;
            var res = new Yallist;
            for (var walker = this.tail; walker !== null; ) {
                res.push(fn.call(thisp, walker.value, this));
                walker = walker.prev;
            }
            return res;
        };
        Yallist.prototype.reduce = function(fn, initial) {
            var acc;
            var walker = this.head;
            if (arguments.length > 1) {
                acc = initial;
            } else if (this.head) {
                walker = this.head.next;
                acc = this.head.value;
            } else {
                throw new TypeError("Reduce of empty list with no initial value");
            }
            for (var i = 0; walker !== null; i++) {
                acc = fn(acc, walker.value, i);
                walker = walker.next;
            }
            return acc;
        };
        Yallist.prototype.reduceReverse = function(fn, initial) {
            var acc;
            var walker = this.tail;
            if (arguments.length > 1) {
                acc = initial;
            } else if (this.tail) {
                walker = this.tail.prev;
                acc = this.tail.value;
            } else {
                throw new TypeError("Reduce of empty list with no initial value");
            }
            for (var i = this.length - 1; walker !== null; i--) {
                acc = fn(acc, walker.value, i);
                walker = walker.prev;
            }
            return acc;
        };
        Yallist.prototype.toArray = function() {
            var arr = new Array(this.length);
            for (var i = 0, walker = this.head; walker !== null; i++) {
                arr[i] = walker.value;
                walker = walker.next;
            }
            return arr;
        };
        Yallist.prototype.toArrayReverse = function() {
            var arr = new Array(this.length);
            for (var i = 0, walker = this.tail; walker !== null; i++) {
                arr[i] = walker.value;
                walker = walker.prev;
            }
            return arr;
        };
        Yallist.prototype.slice = function(from, to) {
            to = to || this.length;
            if (to < 0) {
                to += this.length;
            }
            from = from || 0;
            if (from < 0) {
                from += this.length;
            }
            var ret = new Yallist;
            if (to < from || to < 0) {
                return ret;
            }
            if (from < 0) {
                from = 0;
            }
            if (to > this.length) {
                to = this.length;
            }
            for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
                walker = walker.next;
            }
            for (;walker !== null && i < to; i++, walker = walker.next) {
                ret.push(walker.value);
            }
            return ret;
        };
        Yallist.prototype.sliceReverse = function(from, to) {
            to = to || this.length;
            if (to < 0) {
                to += this.length;
            }
            from = from || 0;
            if (from < 0) {
                from += this.length;
            }
            var ret = new Yallist;
            if (to < from || to < 0) {
                return ret;
            }
            if (from < 0) {
                from = 0;
            }
            if (to > this.length) {
                to = this.length;
            }
            for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
                walker = walker.prev;
            }
            for (;walker !== null && i > from; i--, walker = walker.prev) {
                ret.push(walker.value);
            }
            return ret;
        };
        Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
            if (start > this.length) {
                start = this.length - 1;
            }
            if (start < 0) {
                start = this.length + start;
            }
            for (var i = 0, walker = this.head; walker !== null && i < start; i++) {
                walker = walker.next;
            }
            var ret = [];
            for (var i = 0; walker && i < deleteCount; i++) {
                ret.push(walker.value);
                walker = this.removeNode(walker);
            }
            if (walker === null) {
                walker = this.tail;
            }
            if (walker !== this.head && walker !== this.tail) {
                walker = walker.prev;
            }
            for (var i = 0; i < nodes.length; i++) {
                walker = insert(this, walker, nodes[i]);
            }
            return ret;
        };
        Yallist.prototype.reverse = function() {
            var head = this.head;
            var tail = this.tail;
            for (var walker = head; walker !== null; walker = walker.prev) {
                var p = walker.prev;
                walker.prev = walker.next;
                walker.next = p;
            }
            this.head = tail;
            this.tail = head;
            return this;
        };
        function insert(self, node, value) {
            var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
            if (inserted.next === null) {
                self.tail = inserted;
            }
            if (inserted.prev === null) {
                self.head = inserted;
            }
            self.length++;
            return inserted;
        }
        function push(self, item) {
            self.tail = new Node(item, self.tail, null, self);
            if (!self.head) {
                self.head = self.tail;
            }
            self.length++;
        }
        function unshift(self, item) {
            self.head = new Node(item, null, self.head, self);
            if (!self.tail) {
                self.tail = self.head;
            }
            self.length++;
        }
        function Node(value, prev, next, list) {
            if (!(this instanceof Node)) {
                return new Node(value, prev, next, list);
            }
            this.list = list;
            this.value = value;
            if (prev) {
                prev.next = this;
                this.prev = prev;
            } else {
                this.prev = null;
            }
            if (next) {
                next.prev = this;
                this.next = next;
            } else {
                this.next = null;
            }
        }
        try {
            __webpack_require__(6949)(Yallist);
        } catch (er) {}
    },
    3403(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.TOKEN_STRUCT = exports.TOKEN_MAP = exports.TOKEN_ENUM = exports.TOKEN_DATE = exports.TOKEN_INTERFACES = exports.TOKEN_REF = void 0;
        exports.isObjRef = isObjRef;
        exports.isWireDate = isWireDate;
        exports.isWireEnum = isWireEnum;
        exports.isWireMap = isWireMap;
        exports.isWireStruct = isWireStruct;
        exports.isMethodOverride = isMethodOverride;
        exports.isPropertyOverride = isPropertyOverride;
        exports.TOKEN_REF = "$jsii.byref";
        exports.TOKEN_INTERFACES = "$jsii.interfaces";
        exports.TOKEN_DATE = "$jsii.date";
        exports.TOKEN_ENUM = "$jsii.enum";
        exports.TOKEN_MAP = "$jsii.map";
        exports.TOKEN_STRUCT = "$jsii.struct";
        function isObjRef(value) {
            return typeof value === "object" && value !== null && exports.TOKEN_REF in value;
        }
        function isWireDate(value) {
            return typeof value === "object" && value !== null && exports.TOKEN_DATE in value;
        }
        function isWireEnum(value) {
            return typeof value === "object" && value !== null && exports.TOKEN_ENUM in value;
        }
        function isWireMap(value) {
            return typeof value === "object" && value !== null && exports.TOKEN_MAP in value;
        }
        function isWireStruct(value) {
            return typeof value === "object" && value !== null && exports.TOKEN_STRUCT in value;
        }
        function isMethodOverride(value) {
            return value.method != null;
        }
        function isPropertyOverride(value) {
            return value.property != null;
        }
    },
    9099(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.digestFile = digestFile;
        const crypto_1 = __webpack_require__(6982);
        const fs_1 = __webpack_require__(9896);
        const ALGORITHM = "sha256";
        function digestFile(path, ...comments) {
            const hash = (0, crypto_1.createHash)(ALGORITHM);
            const buffer = Buffer.alloc(16384);
            const fd = (0, fs_1.openSync)(path, "r");
            try {
                let bytesRead = 0;
                while ((bytesRead = (0, fs_1.readSync)(fd, buffer)) > 0) {
                    hash.update(buffer.slice(0, bytesRead));
                }
                for (const comment of comments) {
                    hash.update("\0");
                    hash.update(comment);
                }
                return hash.digest();
            } finally {
                (0, fs_1.closeSync)(fd);
            }
        }
    },
    6318(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, state, kind, f) {
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
            return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
        };
        var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
            if (kind === "m") throw new TypeError("Private method is not writable");
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
            return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
            value;
        };
        var _DiskCache_instances, _a, _DiskCache_CACHE, _DiskCache_root, _DiskCache_entries, _Entry_instances, _Entry_lockFile_get, _Entry_markerFile_get, _Entry_touchMarkerFile;
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.Entry = exports.DiskCache = void 0;
        const fs_1 = __webpack_require__(9896);
        const lockfile_1 = __webpack_require__(4509);
        const path_1 = __webpack_require__(6928);
        const digest_file_1 = __webpack_require__(9099);
        const MARKER_FILE_NAME = ".jsii-runtime-package-cache";
        const ONE_DAY_IN_MS = 864e5;
        const PRUNE_AFTER_MILLISECONDS = process.env.JSII_RUNTIME_PACKAGE_CACHE_TTL ? parseInt(process.env.JSII_RUNTIME_PACKAGE_CACHE_TTL, 10) * ONE_DAY_IN_MS : 30 * ONE_DAY_IN_MS;
        class DiskCache {
            static inDirectory(path) {
                const didCreate = (0, fs_1.mkdirSync)(path, {
                    recursive: true
                }) != null;
                if (didCreate && process.platform === "darwin") {
                    (0, fs_1.writeFileSync)((0, path_1.join)(path, ".nobackup"), "");
                    (0, fs_1.writeFileSync)((0, path_1.join)(path, ".noindex"), "");
                    (0, fs_1.writeFileSync)((0, path_1.join)(path, ".nosync"), "");
                }
                path = (0, fs_1.realpathSync)(path);
                if (!__classPrivateFieldGet(this, _a, "f", _DiskCache_CACHE).has(path)) {
                    __classPrivateFieldGet(this, _a, "f", _DiskCache_CACHE).set(path, new _a(path));
                }
                return __classPrivateFieldGet(this, _a, "f", _DiskCache_CACHE).get(path);
            }
            constructor(root) {
                _DiskCache_instances.add(this);
                _DiskCache_root.set(this, void 0);
                __classPrivateFieldSet(this, _DiskCache_root, root, "f");
                process.once("beforeExit", () => this.pruneExpiredEntries());
            }
            entry(...key) {
                if (key.length === 0) {
                    throw new Error(`Cache entry key must contain at least 1 element!`);
                }
                return new Entry((0, path_1.join)(__classPrivateFieldGet(this, _DiskCache_root, "f"), ...key.flatMap(s => s.replace(/[^@a-z0-9_.\\/-]+/g, "_").split(/[\\/]+/).map(ss => {
                    if (ss === "..") {
                        throw new Error(`A cache entry key cannot contain a '..' path segment! (${s})`);
                    }
                    return ss;
                }))));
            }
            entryFor(path, ...comments) {
                const rawDigest = (0, digest_file_1.digestFile)(path, ...comments);
                return this.entry(...comments, rawDigest.toString("hex"));
            }
            pruneExpiredEntries() {
                const cutOff = new Date(Date.now() - PRUNE_AFTER_MILLISECONDS);
                for (const entry of __classPrivateFieldGet(this, _DiskCache_instances, "m", _DiskCache_entries).call(this)) {
                    if (entry.atime < cutOff) {
                        entry.lock(lockedEntry => {
                            if (entry.atime > cutOff) {
                                return;
                            }
                            lockedEntry.delete();
                        });
                    }
                }
                for (const dir of directoriesUnder(__classPrivateFieldGet(this, _DiskCache_root, "f"), true)) {
                    if (process.platform === "darwin") {
                        try {
                            (0, fs_1.rmSync)((0, path_1.join)(dir, ".DS_Store"), {
                                force: true
                            });
                        } catch {}
                    }
                    if ((0, fs_1.readdirSync)(dir).length === 0) {
                        try {
                            (0, fs_1.rmdirSync)(dir);
                        } catch {}
                    }
                }
            }
        }
        exports.DiskCache = DiskCache;
        _a = DiskCache, _DiskCache_root = new WeakMap, _DiskCache_instances = new WeakSet, 
        _DiskCache_entries = function* _DiskCache_entries() {
            yield* inDirectory(__classPrivateFieldGet(this, _DiskCache_root, "f"));
            function* inDirectory(dir) {
                if ((0, fs_1.existsSync)((0, path_1.join)(dir, MARKER_FILE_NAME))) {
                    return yield new Entry(dir);
                }
                for (const file of directoriesUnder(dir)) {
                    yield* inDirectory(file);
                }
            }
        };
        _DiskCache_CACHE = {
            value: new Map
        };
        class Entry {
            constructor(path) {
                _Entry_instances.add(this);
                this.path = path;
            }
            get atime() {
                try {
                    const stat = (0, fs_1.statSync)(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_markerFile_get));
                    return stat.atime;
                } catch (err) {
                    if (err.code !== "ENOENT") {
                        throw err;
                    }
                    return new Date(0);
                }
            }
            get pathExists() {
                return (0, fs_1.existsSync)(this.path);
            }
            get isComplete() {
                return (0, fs_1.existsSync)(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_markerFile_get));
            }
            retrieve(cb) {
                if (this.isComplete) {
                    __classPrivateFieldGet(this, _Entry_instances, "m", _Entry_touchMarkerFile).call(this);
                    return {
                        path: this.path,
                        cache: "hit"
                    };
                }
                let cache = "miss";
                this.lock(lock => {
                    if (this.isComplete) {
                        cache = "hit";
                        return;
                    }
                    (0, fs_1.mkdirSync)(this.path, {
                        recursive: true
                    });
                    try {
                        cb(this.path);
                    } catch (error) {
                        (0, fs_1.rmSync)(this.path, {
                            force: true,
                            recursive: true
                        });
                        throw error;
                    }
                    lock.markComplete();
                });
                return {
                    path: this.path,
                    cache
                };
            }
            lock(cb) {
                (0, fs_1.mkdirSync)((0, path_1.dirname)(this.path), {
                    recursive: true
                });
                lockSyncWithWait(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_lockFile_get), {
                    retries: 12,
                    stale: 1e4
                });
                let disposed = false;
                try {
                    return cb({
                        delete: () => {
                            if (disposed) {
                                throw new Error(`Cannot delete ${this.path} once the lock block was returned!`);
                            }
                            (0, fs_1.rmSync)(this.path, {
                                force: true,
                                recursive: true
                            });
                        },
                        write: (name, content) => {
                            if (disposed) {
                                throw new Error(`Cannot write ${(0, path_1.join)(this.path, name)} once the lock block was returned!`);
                            }
                            (0, fs_1.mkdirSync)((0, path_1.dirname)((0, path_1.join)(this.path, name)), {
                                recursive: true
                            });
                            (0, fs_1.writeFileSync)((0, path_1.join)(this.path, name), content);
                        },
                        markComplete: () => {
                            if (disposed) {
                                throw new Error(`Cannot touch ${this.path} once the lock block was returned!`);
                            }
                            __classPrivateFieldGet(this, _Entry_instances, "m", _Entry_touchMarkerFile).call(this);
                        }
                    });
                } finally {
                    disposed = true;
                    (0, lockfile_1.unlockSync)(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_lockFile_get));
                }
            }
            read(file) {
                try {
                    return (0, fs_1.readFileSync)((0, path_1.join)(this.path, file));
                } catch (error) {
                    if (error.code === "ENOENT") {
                        return undefined;
                    }
                    throw error;
                }
            }
        }
        exports.Entry = Entry;
        _Entry_instances = new WeakSet, _Entry_lockFile_get = function _Entry_lockFile_get() {
            return `${this.path}.lock`;
        }, _Entry_markerFile_get = function _Entry_markerFile_get() {
            return (0, path_1.join)(this.path, MARKER_FILE_NAME);
        }, _Entry_touchMarkerFile = function _Entry_touchMarkerFile() {
            if (this.pathExists) {
                try {
                    const now = new Date;
                    (0, fs_1.utimesSync)(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_markerFile_get), now, now);
                } catch (e) {
                    if (e.code !== "ENOENT") {
                        throw e;
                    }
                    (0, fs_1.writeFileSync)(__classPrivateFieldGet(this, _Entry_instances, "a", _Entry_markerFile_get), "");
                }
            }
        };
        function* directoriesUnder(root, recursive = false, ignoreErrors = true) {
            for (const file of (0, fs_1.readdirSync)(root)) {
                const path = (0, path_1.join)(root, file);
                try {
                    const stat = (0, fs_1.statSync)(path);
                    if (stat.isDirectory()) {
                        if (recursive) {
                            yield* directoriesUnder(path, recursive, ignoreErrors);
                        }
                        yield path;
                    }
                } catch (error) {
                    if (!ignoreErrors) {
                        throw error;
                    }
                }
            }
        }
        function lockSyncWithWait(path, options) {
            var _b;
            let retries = (_b = options.retries) !== null && _b !== void 0 ? _b : 0;
            let sleep = 100;
            while (true) {
                try {
                    (0, lockfile_1.lockSync)(path, {
                        retries: 0,
                        stale: options.stale
                    });
                    return;
                } catch (e) {
                    if (retries === 0) {
                        throw e;
                    }
                    retries--;
                    if (e.code === "EEXIST") {
                        sleepSync(Math.floor(Math.random() * sleep));
                        sleep *= 1.5;
                    } else {
                        sleepSync(5);
                    }
                }
            }
        }
        function sleepSync(ms) {
            Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
        }
    },
    4018(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = {
                    enumerable: true,
                    get: function() {
                        return m[k];
                    }
                };
            }
            Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
        });
        var __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        __exportStar(__webpack_require__(6318), exports);
    },
    7583(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = {
                    enumerable: true,
                    get: function() {
                        return m[k];
                    }
                };
            }
            Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
        });
        var __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.api = void 0;
        __exportStar(__webpack_require__(162), exports);
        const api = __webpack_require__(3403);
        exports.api = api;
    },
    162(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, state, kind, f) {
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
            return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
        };
        var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
            if (kind === "m") throw new TypeError("Private method is not writable");
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
            return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
            value;
        };
        var _Kernel_instances, _Kernel_assemblies, _Kernel_objects, _Kernel_cbs, _Kernel_waiting, _Kernel_promises, _Kernel_serializerHost, _Kernel_nextid, _Kernel_syncInProgress, _Kernel_installDir, _Kernel_require, _Kernel_load, _Kernel_addAssembly, _Kernel_findCtor, _Kernel_getPackageDir, _Kernel_create, _Kernel_getSuperPropertyName, _Kernel_applyPropertyOverride, _Kernel_defineOverridenProperty, _Kernel_applyMethodOverride, _Kernel_defineOverridenMethod, _Kernel_findInvokeTarget, _Kernel_validateMethodArguments, _Kernel_assemblyFor, _Kernel_findSymbol, _Kernel_typeInfoForFqn, _Kernel_isVisibleType, _Kernel_typeInfoForMethod, _Kernel_tryTypeInfoForMethod, _Kernel_tryTypeInfoForProperty, _Kernel_typeInfoForProperty, _Kernel_toSandbox, _Kernel_fromSandbox, _Kernel_toSandboxValues, _Kernel_fromSandboxValues, _Kernel_boxUnboxParameters, _Kernel_debug, _Kernel_debugTime, _Kernel_ensureSync, _Kernel_findPropertyTarget, _Kernel_getBinScriptCommand, _Kernel_makecbid, _Kernel_makeprid;
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.Kernel = exports.RuntimeError = exports.JsiiFault = exports.ASSEMBLY_SUPPORTED_FEATURES = void 0;
        const spec = __webpack_require__(9501);
        const cp = __webpack_require__(5317);
        const fs = __webpack_require__(8463);
        const module_1 = __webpack_require__(3339);
        const os = __webpack_require__(857);
        const path = __webpack_require__(6928);
        const api = __webpack_require__(3403);
        const api_1 = __webpack_require__(3403);
        const objects_1 = __webpack_require__(2063);
        const onExit = __webpack_require__(9743);
        const wire = __webpack_require__(1663);
        const tar = __webpack_require__(7344);
        exports.ASSEMBLY_SUPPORTED_FEATURES = [ "intersection-types", "class-covariant-overrides" ];
        class JsiiFault extends Error {
            constructor(message) {
                super(message);
                this.name = "@jsii/kernel.Fault";
            }
        }
        exports.JsiiFault = JsiiFault;
        class RuntimeError extends Error {
            constructor(message) {
                super(message);
                this.name = "@jsii/kernel.RuntimeError";
            }
        }
        exports.RuntimeError = RuntimeError;
        class Kernel {
            constructor(callbackHandler) {
                _Kernel_instances.add(this);
                this.callbackHandler = callbackHandler;
                this.traceEnabled = false;
                this.debugTimingEnabled = false;
                this.validateAssemblies = false;
                _Kernel_assemblies.set(this, new Map);
                _Kernel_objects.set(this, new objects_1.ObjectTable(__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).bind(this)));
                _Kernel_cbs.set(this, new Map);
                _Kernel_waiting.set(this, new Map);
                _Kernel_promises.set(this, new Map);
                _Kernel_serializerHost.set(this, void 0);
                _Kernel_nextid.set(this, 2e4);
                _Kernel_syncInProgress.set(this, void 0);
                _Kernel_installDir.set(this, void 0);
                _Kernel_require.set(this, void 0);
                __classPrivateFieldSet(this, _Kernel_serializerHost, {
                    objects: __classPrivateFieldGet(this, _Kernel_objects, "f"),
                    debug: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).bind(this),
                    isVisibleType: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_isVisibleType).bind(this),
                    findSymbol: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).bind(this),
                    lookupType: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).bind(this)
                }, "f");
            }
            load(req) {
                return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debugTime).call(this, () => __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_load).call(this, req), `load(${JSON.stringify(req, null, 2)})`);
            }
            getBinScriptCommand(req) {
                return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getBinScriptCommand).call(this, req);
            }
            invokeBinScript(req) {
                const {command, args, env} = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getBinScriptCommand).call(this, req);
                const result = cp.spawnSync(command, args, {
                    encoding: "utf-8",
                    env,
                    shell: true
                });
                return {
                    stdout: result.stdout,
                    stderr: result.stderr,
                    status: result.status,
                    signal: result.signal
                };
            }
            create(req) {
                return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_create).call(this, req);
            }
            del(req) {
                const {objref} = req;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "del", objref);
                __classPrivateFieldGet(this, _Kernel_objects, "f").deleteObject(objref);
                return {};
            }
            sget(req) {
                const {fqn, property} = req;
                const symbol = `${fqn}.${property}`;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "sget", symbol);
                const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForProperty).call(this, property, fqn);
                if (!ti.static) {
                    throw new JsiiFault(`property ${symbol} is not static`);
                }
                const prototype = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).call(this, fqn);
                const value = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `property ${property}`, () => prototype[property]);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "value:", value);
                const ret = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, value, ti, `of static property ${symbol}`);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "ret", ret);
                return {
                    value: ret
                };
            }
            sset(req) {
                const {fqn, property, value} = req;
                const symbol = `${fqn}.${property}`;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "sset", symbol);
                const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForProperty).call(this, property, fqn);
                if (!ti.static) {
                    throw new JsiiFault(`property ${symbol} is not static`);
                }
                if (ti.immutable) {
                    throw new JsiiFault(`static property ${symbol} is readonly`);
                }
                const prototype = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).call(this, fqn);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `property ${property}`, () => prototype[property] = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).call(this, value, ti, `assigned to static property ${symbol}`));
                return {};
            }
            get(req) {
                const {objref, property} = req;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "get", objref, property);
                const {instance, fqn, interfaces} = __classPrivateFieldGet(this, _Kernel_objects, "f").findObject(objref);
                const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForProperty).call(this, property, fqn, interfaces);
                const propertyToGet = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findPropertyTarget).call(this, instance, property);
                const value = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `property '${objref[api_1.TOKEN_REF]}.${propertyToGet}'`, () => instance[propertyToGet]);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "value:", value);
                const ret = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, value, ti, `of property ${fqn}.${property}`);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "ret:", ret);
                return {
                    value: ret
                };
            }
            set(req) {
                const {objref, property, value} = req;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "set", objref, property, value);
                const {instance, fqn, interfaces} = __classPrivateFieldGet(this, _Kernel_objects, "f").findObject(objref);
                const propInfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForProperty).call(this, req.property, fqn, interfaces);
                if (propInfo.immutable) {
                    throw new JsiiFault(`Cannot set value of immutable property ${req.property} to ${req.value}`);
                }
                const propertyToSet = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findPropertyTarget).call(this, instance, property);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `property '${objref[api_1.TOKEN_REF]}.${propertyToSet}'`, () => instance[propertyToSet] = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).call(this, value, propInfo, `assigned to property ${fqn}.${property}`));
                return {};
            }
            invoke(req) {
                var _a, _b;
                const {objref, method} = req;
                const args = (_a = req.args) !== null && _a !== void 0 ? _a : [];
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "invoke", objref, method, args);
                const {ti, obj, fn} = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findInvokeTarget).call(this, objref, method, args);
                if (ti.async) {
                    throw new JsiiFault(`${method} is an async method, use "begin" instead`);
                }
                const fqn = (0, objects_1.jsiiTypeFqn)(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_isVisibleType).bind(this));
                const ret = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `method '${objref[api_1.TOKEN_REF]}.${method}'`, () => fn.apply(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandboxValues).call(this, args, `method ${fqn ? `${fqn}#` : ""}${method}`, ti.parameters)));
                const result = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, ret, (_b = ti.returns) !== null && _b !== void 0 ? _b : "void", `returned by method ${fqn ? `${fqn}#` : ""}${method}`);
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "invoke result", result);
                return {
                    result
                };
            }
            sinvoke(req) {
                var _a, _b;
                const {fqn, method} = req;
                const args = (_a = req.args) !== null && _a !== void 0 ? _a : [];
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "sinvoke", fqn, method, args);
                const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForMethod).call(this, method, fqn);
                if (!ti.static) {
                    throw new JsiiFault(`${fqn}.${method} is not a static method`);
                }
                if (ti.async) {
                    throw new JsiiFault(`${method} is an async method, use "begin" instead`);
                }
                const prototype = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).call(this, fqn);
                const fn = prototype[method];
                const ret = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_ensureSync).call(this, `method '${fqn}.${method}'`, () => fn.apply(prototype, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandboxValues).call(this, args, `static method ${fqn}.${method}`, ti.parameters)));
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "method returned:", ret);
                return {
                    result: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, ret, (_b = ti.returns) !== null && _b !== void 0 ? _b : "void", `returned by static method ${fqn}.${method}`)
                };
            }
            begin(req) {
                var _a;
                const {objref, method} = req;
                const args = (_a = req.args) !== null && _a !== void 0 ? _a : [];
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "begin", objref, method, args);
                if (__classPrivateFieldGet(this, _Kernel_syncInProgress, "f")) {
                    throw new JsiiFault(`Cannot invoke async method '${req.objref[api_1.TOKEN_REF]}.${req.method}' while sync ${__classPrivateFieldGet(this, _Kernel_syncInProgress, "f")} is being processed`);
                }
                const {ti, obj, fn} = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findInvokeTarget).call(this, objref, method, args);
                if (!ti.async) {
                    throw new JsiiFault(`Method ${method} is expected to be an async method`);
                }
                const fqn = (0, objects_1.jsiiTypeFqn)(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_isVisibleType).bind(this));
                const promise = fn.apply(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandboxValues).call(this, args, `async method ${fqn ? `${fqn}#` : ""}${method}`, ti.parameters));
                promise.catch(_ => undefined);
                const prid = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_makeprid).call(this);
                __classPrivateFieldGet(this, _Kernel_promises, "f").set(prid, {
                    promise,
                    method: ti
                });
                return {
                    promiseid: prid
                };
            }
            async end(req) {
                var _a;
                const {promiseid} = req;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "end", promiseid);
                const storedPromise = __classPrivateFieldGet(this, _Kernel_promises, "f").get(promiseid);
                if (storedPromise == null) {
                    throw new JsiiFault(`Cannot find promise with ID: ${promiseid}`);
                }
                const {promise, method} = storedPromise;
                let result;
                try {
                    result = await promise;
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "promise result:", result);
                } catch (e) {
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "promise error:", e);
                    if (e.name === "@jsii/kernel.Fault") {
                        if (e instanceof JsiiFault) {
                            throw e;
                        }
                        throw new JsiiFault(e.message);
                    }
                    if (e instanceof RuntimeError) {
                        throw e;
                    }
                    throw new RuntimeError(e);
                }
                return {
                    result: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, result, (_a = method.returns) !== null && _a !== void 0 ? _a : "void", `returned by async method ${method.name}`)
                };
            }
            callbacks(_req) {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "callbacks");
                const ret = Array.from(__classPrivateFieldGet(this, _Kernel_cbs, "f").entries()).map(([cbid, cb]) => {
                    __classPrivateFieldGet(this, _Kernel_waiting, "f").set(cbid, cb);
                    __classPrivateFieldGet(this, _Kernel_cbs, "f").delete(cbid);
                    const callback = {
                        cbid,
                        cookie: cb.override.cookie,
                        invoke: {
                            objref: cb.objref,
                            method: cb.override.method,
                            args: cb.args
                        }
                    };
                    return callback;
                });
                return {
                    callbacks: ret
                };
            }
            complete(req) {
                var _a;
                const {cbid, err, result, name} = req;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "complete", cbid, err, result);
                const cb = __classPrivateFieldGet(this, _Kernel_waiting, "f").get(cbid);
                if (!cb) {
                    throw new JsiiFault(`Callback ${cbid} not found`);
                }
                if (err) {
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "completed with error:", err);
                    cb.fail(name === "@jsii/kernel.Fault" ? new JsiiFault(err) : new RuntimeError(err));
                } else {
                    const sandoxResult = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).call(this, result, (_a = cb.expectedReturnType) !== null && _a !== void 0 ? _a : "void", `returned by callback ${cb.toString()}`);
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "completed with result:", sandoxResult);
                    cb.succeed(sandoxResult);
                }
                __classPrivateFieldGet(this, _Kernel_waiting, "f").delete(cbid);
                return {
                    cbid
                };
            }
            naming(req) {
                const assemblyName = req.assembly;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "naming", assemblyName);
                const assembly = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_assemblyFor).call(this, assemblyName);
                const targets = assembly.metadata.targets;
                if (!targets) {
                    throw new JsiiFault(`Unexpected - "targets" for ${assemblyName} is missing!`);
                }
                return {
                    naming: targets
                };
            }
            stats(_req) {
                return {
                    objectCount: __classPrivateFieldGet(this, _Kernel_objects, "f").count
                };
            }
        }
        exports.Kernel = Kernel;
        _Kernel_assemblies = new WeakMap, _Kernel_objects = new WeakMap, _Kernel_cbs = new WeakMap, 
        _Kernel_waiting = new WeakMap, _Kernel_promises = new WeakMap, _Kernel_serializerHost = new WeakMap, 
        _Kernel_nextid = new WeakMap, _Kernel_syncInProgress = new WeakMap, _Kernel_installDir = new WeakMap, 
        _Kernel_require = new WeakMap, _Kernel_instances = new WeakSet, _Kernel_load = function _Kernel_load(req) {
            var _a, _b, _c;
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "load", req);
            if ("assembly" in req) {
                throw new JsiiFault('`assembly` field is deprecated for "load", use `name`, `version` and `tarball` instead');
            }
            const pkgname = req.name;
            const pkgver = req.version;
            const packageDir = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getPackageDir).call(this, pkgname);
            if (fs.pathExistsSync(packageDir)) {
                const epkg = fs.readJsonSync(path.join(packageDir, "package.json"));
                if (epkg.version !== pkgver) {
                    throw new JsiiFault(`Multiple versions ${pkgver} and ${epkg.version} of the ` + `package '${pkgname}' cannot be loaded together since this is unsupported by ` + "some runtime environments");
                }
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "look up already-loaded assembly", pkgname);
                const assm = __classPrivateFieldGet(this, _Kernel_assemblies, "f").get(pkgname);
                return {
                    assembly: assm.metadata.name,
                    types: Object.keys((_a = assm.metadata.types) !== null && _a !== void 0 ? _a : {}).length
                };
            }
            const originalUmask = process.umask(18);
            try {
                const {cache} = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debugTime).call(this, () => tar.extract(req.tarball, packageDir, {
                    strict: true,
                    strip: 1,
                    unlink: true
                }, req.name, req.version), `tar.extract(${req.tarball}) => ${packageDir}`);
                if (cache != null) {
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, `Package cache enabled, extraction resulted in a cache ${cache}`);
                }
            } finally {
                process.umask(originalUmask);
            }
            let assmSpec;
            try {
                assmSpec = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debugTime).call(this, () => spec.loadAssemblyFromPath(packageDir, this.validateAssemblies, exports.ASSEMBLY_SUPPORTED_FEATURES), `loadAssemblyFromPath(${packageDir})`);
            } catch (e) {
                throw new JsiiFault(`Error for package tarball ${req.tarball}: ${e.message}`);
            }
            const entryPoint = __classPrivateFieldGet(this, _Kernel_require, "f").resolve(assmSpec.name, {
                paths: [ __classPrivateFieldGet(this, _Kernel_installDir, "f") ]
            });
            const closure = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debugTime).call(this, () => __classPrivateFieldGet(this, _Kernel_require, "f")(entryPoint), `require(${entryPoint})`);
            const assm = new Assembly(assmSpec, closure);
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debugTime).call(this, () => __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_addAssembly).call(this, assm), `registerAssembly({ name: ${assm.metadata.name}, types: ${Object.keys((_b = assm.metadata.types) !== null && _b !== void 0 ? _b : {}).length} })`);
            return {
                assembly: assmSpec.name,
                types: Object.keys((_c = assmSpec.types) !== null && _c !== void 0 ? _c : {}).length
            };
        }, _Kernel_addAssembly = function _Kernel_addAssembly(assm) {
            var _a;
            __classPrivateFieldGet(this, _Kernel_assemblies, "f").set(assm.metadata.name, assm);
            const jsiiVersion = assm.metadata.jsiiVersion.split(" ", 1)[0];
            const [jsiiMajor, jsiiMinor, _jsiiPatch, ..._rest] = jsiiVersion.split(".").map(str => parseInt(str, 10));
            if (jsiiVersion === "0.0.0" || jsiiMajor > 1 || jsiiMajor === 1 && jsiiMinor >= 19) {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "Using compiler-woven runtime type information!");
                return;
            }
            for (const fqn of Object.keys((_a = assm.metadata.types) !== null && _a !== void 0 ? _a : {})) {
                const typedef = assm.metadata.types[fqn];
                switch (typedef.kind) {
                  case spec.TypeKind.Interface:
                    continue;

                  case spec.TypeKind.Class:
                  case spec.TypeKind.Enum:
                    const constructor = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).call(this, fqn);
                    (0, objects_1.tagJsiiConstructor)(constructor, fqn);
                }
            }
        }, _Kernel_findCtor = function _Kernel_findCtor(fqn, args) {
            if (fqn === wire.EMPTY_OBJECT_FQN) {
                return {
                    ctor: Object
                };
            }
            const typeinfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).call(this, fqn);
            switch (typeinfo.kind) {
              case spec.TypeKind.Class:
                const classType = typeinfo;
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_validateMethodArguments).call(this, classType.initializer, args);
                return {
                    ctor: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findSymbol).call(this, fqn),
                    parameters: classType.initializer && classType.initializer.parameters
                };

              case spec.TypeKind.Interface:
                throw new JsiiFault(`Cannot create an object with an FQN of an interface: ${fqn}`);

              case spec.TypeKind.Enum:
              default:
                throw new JsiiFault(`Unexpected FQN kind: ${fqn}`);
            }
        }, _Kernel_getPackageDir = function _Kernel_getPackageDir(pkgname) {
            if (!__classPrivateFieldGet(this, _Kernel_installDir, "f")) {
                __classPrivateFieldSet(this, _Kernel_installDir, fs.mkdtempSync(path.join(os.tmpdir(), "jsii-kernel-")), "f");
                __classPrivateFieldSet(this, _Kernel_require, (0, module_1.createRequire)(__classPrivateFieldGet(this, _Kernel_installDir, "f")), "f");
                fs.mkdirpSync(path.join(__classPrivateFieldGet(this, _Kernel_installDir, "f"), "node_modules"));
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "creating jsii-kernel modules workdir:", __classPrivateFieldGet(this, _Kernel_installDir, "f"));
                onExit.removeSync(__classPrivateFieldGet(this, _Kernel_installDir, "f"));
            }
            return path.join(__classPrivateFieldGet(this, _Kernel_installDir, "f"), "node_modules", pkgname);
        }, _Kernel_create = function _Kernel_create(req) {
            var _a, _b;
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "create", req);
            const {fqn, interfaces, overrides} = req;
            const requestArgs = (_a = req.args) !== null && _a !== void 0 ? _a : [];
            const ctorResult = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_findCtor).call(this, fqn, requestArgs);
            const ctor = ctorResult.ctor;
            const obj = new ctor(...__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandboxValues).call(this, requestArgs, `new ${fqn}`, ctorResult.parameters));
            const objref = __classPrivateFieldGet(this, _Kernel_objects, "f").registerObject(obj, fqn, (_b = req.interfaces) !== null && _b !== void 0 ? _b : []);
            if (overrides) {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "overrides", overrides);
                const overrideTypeErrorMessage = 'Override can either be "method" or "property"';
                const methods = new Set;
                const properties = new Set;
                for (const override of overrides) {
                    if (api.isMethodOverride(override)) {
                        if (api.isPropertyOverride(override)) {
                            throw new JsiiFault(overrideTypeErrorMessage);
                        }
                        if (methods.has(override.method)) {
                            throw new JsiiFault(`Duplicate override for method '${override.method}'`);
                        }
                        methods.add(override.method);
                        __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_applyMethodOverride).call(this, obj, objref, fqn, interfaces, override);
                    } else if (api.isPropertyOverride(override)) {
                        if (api.isMethodOverride(override)) {
                            throw new JsiiFault(overrideTypeErrorMessage);
                        }
                        if (properties.has(override.property)) {
                            throw new JsiiFault(`Duplicate override for property '${override.property}'`);
                        }
                        properties.add(override.property);
                        __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_applyPropertyOverride).call(this, obj, objref, fqn, interfaces, override);
                    } else {
                        throw new JsiiFault(overrideTypeErrorMessage);
                    }
                }
            }
            return objref;
        }, _Kernel_getSuperPropertyName = function _Kernel_getSuperPropertyName(name) {
            return `$jsii$super$${name}$`;
        }, _Kernel_applyPropertyOverride = function _Kernel_applyPropertyOverride(obj, objref, typeFqn, interfaces, override) {
            if (__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForMethod).call(this, override.property, typeFqn, interfaces)) {
                throw new JsiiFault(`Trying to override method '${override.property}' as a property`);
            }
            let propInfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForProperty).call(this, override.property, typeFqn, interfaces);
            if (!propInfo && override.property in obj) {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, `Skipping override of private property ${override.property}`);
                return;
            }
            propInfo !== null && propInfo !== void 0 ? propInfo : propInfo = {
                name: override.property,
                type: spec.CANONICAL_ANY
            };
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_defineOverridenProperty).call(this, obj, objref, override, propInfo);
        }, _Kernel_defineOverridenProperty = function _Kernel_defineOverridenProperty(obj, objref, override, propInfo) {
            var _a;
            const propertyName = override.property;
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "apply override", propertyName);
            const prev = (_a = getPropertyDescriptor(obj, propertyName)) !== null && _a !== void 0 ? _a : {
                value: obj[propertyName],
                writable: true,
                enumerable: true,
                configurable: true
            };
            const prevEnumerable = prev.enumerable;
            prev.enumerable = false;
            Object.defineProperty(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getSuperPropertyName).call(this, propertyName), prev);
            Object.defineProperty(obj, propertyName, {
                enumerable: prevEnumerable,
                configurable: prev.configurable,
                get: () => {
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "virtual get", objref, propertyName, {
                        cookie: override.cookie
                    });
                    const result = this.callbackHandler({
                        cookie: override.cookie,
                        cbid: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_makecbid).call(this),
                        get: {
                            objref,
                            property: propertyName
                        }
                    });
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "callback returned", result);
                    return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).call(this, result, propInfo, `returned by callback property ${propertyName}`);
                },
                set: value => {
                    __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "virtual set", objref, propertyName, {
                        cookie: override.cookie
                    });
                    this.callbackHandler({
                        cookie: override.cookie,
                        cbid: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_makecbid).call(this),
                        set: {
                            objref,
                            property: propertyName,
                            value: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).call(this, value, propInfo, `assigned to callback property ${propertyName}`)
                        }
                    });
                }
            });
            function getPropertyDescriptor(obj, propertyName) {
                const direct = Object.getOwnPropertyDescriptor(obj, propertyName);
                if (direct != null) {
                    return direct;
                }
                const proto = Object.getPrototypeOf(obj);
                if (proto == null && proto !== Object.prototype) {
                    return undefined;
                }
                return getPropertyDescriptor(proto, propertyName);
            }
        }, _Kernel_applyMethodOverride = function _Kernel_applyMethodOverride(obj, objref, typeFqn, interfaces, override) {
            if (__classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForProperty).call(this, override.method, typeFqn, interfaces)) {
                throw new JsiiFault(`Trying to override property '${override.method}' as a method`);
            }
            let methodInfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForMethod).call(this, override.method, typeFqn, interfaces);
            if (!methodInfo && obj[override.method]) {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, `Skipping override of private method ${override.method}`);
                return;
            }
            methodInfo !== null && methodInfo !== void 0 ? methodInfo : methodInfo = {
                name: override.method,
                returns: {
                    type: spec.CANONICAL_ANY
                },
                parameters: [ {
                    name: "args",
                    type: spec.CANONICAL_ANY,
                    variadic: true
                } ],
                variadic: true
            };
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_defineOverridenMethod).call(this, obj, objref, override, methodInfo);
        }, _Kernel_defineOverridenMethod = function _Kernel_defineOverridenMethod(obj, objref, override, methodInfo) {
            const methodName = override.method;
            const fqn = (0, objects_1.jsiiTypeFqn)(obj, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_isVisibleType).bind(this));
            const methodContext = `${methodInfo.async ? "async " : ""}method${fqn ? `${fqn}#` : methodName}`;
            if (methodInfo.async) {
                Object.defineProperty(obj, methodName, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: (...methodArgs) => {
                        __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "invoke async method override", override);
                        const args = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandboxValues).call(this, methodArgs, methodContext, methodInfo.parameters);
                        return new Promise((succeed, fail) => {
                            var _a;
                            const cbid = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_makecbid).call(this);
                            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "adding callback to queue", cbid);
                            __classPrivateFieldGet(this, _Kernel_cbs, "f").set(cbid, {
                                objref,
                                override,
                                args,
                                expectedReturnType: (_a = methodInfo.returns) !== null && _a !== void 0 ? _a : "void",
                                succeed,
                                fail
                            });
                        });
                    }
                });
            } else {
                Object.defineProperty(obj, methodName, {
                    enumerable: false,
                    configurable: false,
                    writable: false,
                    value: (...methodArgs) => {
                        var _a;
                        __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "invoke sync method override", override, "args", methodArgs);
                        const result = this.callbackHandler({
                            cookie: override.cookie,
                            cbid: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_makecbid).call(this),
                            invoke: {
                                objref,
                                method: methodName,
                                args: __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandboxValues).call(this, methodArgs, methodContext, methodInfo.parameters)
                            }
                        });
                        __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_debug).call(this, "Result", result);
                        return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).call(this, result, (_a = methodInfo.returns) !== null && _a !== void 0 ? _a : "void", `returned by callback method ${methodName}`);
                    }
                });
            }
        }, _Kernel_findInvokeTarget = function _Kernel_findInvokeTarget(objref, methodName, args) {
            const {instance, fqn, interfaces} = __classPrivateFieldGet(this, _Kernel_objects, "f").findObject(objref);
            const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForMethod).call(this, methodName, fqn, interfaces);
            __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_validateMethodArguments).call(this, ti, args);
            let fn;
            if (methodName !== "toString") {
                fn = instance.constructor.prototype[methodName];
            }
            fn !== null && fn !== void 0 ? fn : fn = instance[methodName];
            if (!fn) {
                throw new JsiiFault(`Cannot find ${methodName} on object`);
            }
            return {
                ti,
                obj: instance,
                fn
            };
        }, _Kernel_validateMethodArguments = function _Kernel_validateMethodArguments(method, args) {
            var _a;
            const params = (_a = method === null || method === void 0 ? void 0 : method.parameters) !== null && _a !== void 0 ? _a : [];
            if (args.length > params.length && !(method && method.variadic)) {
                throw new JsiiFault(`Too many arguments (method accepts ${params.length} parameters, got ${args.length} arguments)`);
            }
            for (let i = 0; i < params.length; ++i) {
                const param = params[i];
                const arg = args[i];
                if (param.variadic) {
                    if (params.length <= i) {
                        return;
                    }
                    for (let j = i; j < params.length; j++) {
                        if (!param.optional && params[j] === undefined) {
                            throw new JsiiFault(`Unexpected 'undefined' value at index ${j - i} of variadic argument '${param.name}' of type '${spec.describeTypeReference(param.type)}'`);
                        }
                    }
                } else if (!param.optional && arg === undefined) {
                    throw new JsiiFault(`Not enough arguments. Missing argument for the required parameter '${param.name}' of type '${spec.describeTypeReference(param.type)}'`);
                }
            }
        }, _Kernel_assemblyFor = function _Kernel_assemblyFor(assemblyName) {
            const assembly = __classPrivateFieldGet(this, _Kernel_assemblies, "f").get(assemblyName);
            if (!assembly) {
                throw new JsiiFault(`Could not find assembly: ${assemblyName}`);
            }
            return assembly;
        }, _Kernel_findSymbol = function _Kernel_findSymbol(fqn) {
            const [assemblyName, ...parts] = fqn.split(".");
            const assembly = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_assemblyFor).call(this, assemblyName);
            let curr = assembly.closure;
            while (parts.length > 0) {
                const name = parts.shift();
                if (!name) {
                    break;
                }
                curr = curr[name];
            }
            if (!curr) {
                throw new JsiiFault(`Could not find symbol ${fqn}`);
            }
            return curr;
        }, _Kernel_typeInfoForFqn = function _Kernel_typeInfoForFqn(fqn) {
            var _a;
            const components = fqn.split(".");
            const moduleName = components[0];
            const assembly = __classPrivateFieldGet(this, _Kernel_assemblies, "f").get(moduleName);
            if (!assembly) {
                throw new JsiiFault(`Module '${moduleName}' not found`);
            }
            const types = (_a = assembly.metadata.types) !== null && _a !== void 0 ? _a : {};
            const fqnInfo = types[fqn];
            if (!fqnInfo) {
                throw new JsiiFault(`Type '${fqn}' not found`);
            }
            return fqnInfo;
        }, _Kernel_isVisibleType = function _Kernel_isVisibleType(fqn) {
            try {
                __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).call(this, fqn);
                return true;
            } catch (e) {
                if (e instanceof JsiiFault) {
                    return false;
                }
                throw e;
            }
        }, _Kernel_typeInfoForMethod = function _Kernel_typeInfoForMethod(methodName, fqn, interfaces) {
            const ti = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForMethod).call(this, methodName, fqn, interfaces);
            if (!ti) {
                const addendum = interfaces && interfaces.length > 0 ? ` or interface(s) ${interfaces.join(", ")}` : "";
                throw new JsiiFault(`Class ${fqn}${addendum} doesn't have a method '${methodName}'`);
            }
            return ti;
        }, _Kernel_tryTypeInfoForMethod = function _Kernel_tryTypeInfoForMethod(methodName, classFqn, interfaces = []) {
            var _a, _b;
            for (const fqn of [ classFqn, ...interfaces ]) {
                if (fqn === wire.EMPTY_OBJECT_FQN) {
                    continue;
                }
                const typeinfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).call(this, fqn);
                const methods = (_a = typeinfo.methods) !== null && _a !== void 0 ? _a : [];
                for (const m of methods) {
                    if (m.name === methodName) {
                        return m;
                    }
                }
                const bases = [ typeinfo.base, ...(_b = typeinfo.interfaces) !== null && _b !== void 0 ? _b : [] ];
                for (const base of bases) {
                    if (!base) {
                        continue;
                    }
                    const found = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForMethod).call(this, methodName, base);
                    if (found) {
                        return found;
                    }
                }
            }
            return undefined;
        }, _Kernel_tryTypeInfoForProperty = function _Kernel_tryTypeInfoForProperty(property, classFqn, interfaces = []) {
            var _a;
            for (const fqn of [ classFqn, ...interfaces ]) {
                if (fqn === wire.EMPTY_OBJECT_FQN) {
                    continue;
                }
                const typeInfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_typeInfoForFqn).call(this, fqn);
                let properties;
                let bases;
                if (spec.isClassType(typeInfo)) {
                    const classTypeInfo = typeInfo;
                    properties = classTypeInfo.properties;
                    bases = classTypeInfo.base ? [ classTypeInfo.base ] : [];
                } else if (spec.isInterfaceType(typeInfo)) {
                    const interfaceTypeInfo = typeInfo;
                    properties = interfaceTypeInfo.properties;
                    bases = (_a = interfaceTypeInfo.interfaces) !== null && _a !== void 0 ? _a : [];
                } else {
                    throw new JsiiFault(`Type of kind ${typeInfo.kind} does not have properties`);
                }
                for (const p of properties !== null && properties !== void 0 ? properties : []) {
                    if (p.name === property) {
                        return p;
                    }
                }
                for (const baseFqn of bases) {
                    const ret = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForProperty).call(this, property, baseFqn);
                    if (ret) {
                        return ret;
                    }
                }
            }
            return undefined;
        }, _Kernel_typeInfoForProperty = function _Kernel_typeInfoForProperty(property, fqn, interfaces) {
            const typeInfo = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_tryTypeInfoForProperty).call(this, property, fqn, interfaces);
            if (!typeInfo) {
                const addendum = interfaces && interfaces.length > 0 ? ` or interface(s) ${interfaces.join(", ")}` : "";
                throw new JsiiFault(`Type ${fqn}${addendum} doesn't have a property '${property}'`);
            }
            return typeInfo;
        }, _Kernel_toSandbox = function _Kernel_toSandbox(v, expectedType, context) {
            return wire.process(__classPrivateFieldGet(this, _Kernel_serializerHost, "f"), "deserialize", v, expectedType, context);
        }, _Kernel_fromSandbox = function _Kernel_fromSandbox(v, targetType, context) {
            return wire.process(__classPrivateFieldGet(this, _Kernel_serializerHost, "f"), "serialize", v, targetType, context);
        }, _Kernel_toSandboxValues = function _Kernel_toSandboxValues(xs, methodContext, parameters) {
            return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_boxUnboxParameters).call(this, xs, methodContext, parameters, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_toSandbox).bind(this));
        }, _Kernel_fromSandboxValues = function _Kernel_fromSandboxValues(xs, methodContext, parameters) {
            return __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_boxUnboxParameters).call(this, xs, methodContext, parameters, __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_fromSandbox).bind(this));
        }, _Kernel_boxUnboxParameters = function _Kernel_boxUnboxParameters(xs, methodContext, parameters = [], boxUnbox) {
            const parametersCopy = [ ...parameters ];
            const variadic = parametersCopy.length > 0 && !!parametersCopy[parametersCopy.length - 1].variadic;
            while (variadic && parametersCopy.length < xs.length) {
                parametersCopy.push(parametersCopy[parametersCopy.length - 1]);
            }
            if (xs.length > parametersCopy.length) {
                throw new JsiiFault(`Argument list (${JSON.stringify(xs)}) not same size as expected argument list (length ${parametersCopy.length})`);
            }
            return xs.map((x, i) => boxUnbox(x, parametersCopy[i], `passed to parameter ${parametersCopy[i].name} of ${methodContext}`));
        }, _Kernel_debug = function _Kernel_debug(...args) {
            if (this.traceEnabled) {
                console.error("[@jsii/kernel]", ...args);
            }
        }, _Kernel_debugTime = function _Kernel_debugTime(cb, label) {
            const fullLabel = `[@jsii/kernel:timing] ${label}`;
            if (this.debugTimingEnabled) {
                console.time(fullLabel);
            }
            try {
                return cb();
            } finally {
                if (this.debugTimingEnabled) {
                    console.timeEnd(fullLabel);
                }
            }
        }, _Kernel_ensureSync = function _Kernel_ensureSync(desc, fn) {
            __classPrivateFieldSet(this, _Kernel_syncInProgress, desc, "f");
            try {
                return fn();
            } catch (e) {
                if (e.name === "@jsii/kernel.Fault") {
                    if (e instanceof JsiiFault) {
                        throw e;
                    }
                    throw new JsiiFault(e);
                }
                if (e instanceof RuntimeError) {
                    throw e;
                }
                throw new RuntimeError(e);
            } finally {
                __classPrivateFieldSet(this, _Kernel_syncInProgress, undefined, "f");
            }
        }, _Kernel_findPropertyTarget = function _Kernel_findPropertyTarget(obj, property) {
            const superProp = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getSuperPropertyName).call(this, property);
            if (superProp in obj) {
                return superProp;
            }
            return property;
        }, _Kernel_getBinScriptCommand = function _Kernel_getBinScriptCommand(req) {
            var _a, _b;
            const packageDir = __classPrivateFieldGet(this, _Kernel_instances, "m", _Kernel_getPackageDir).call(this, req.assembly);
            if (fs.pathExistsSync(packageDir)) {
                const epkg = fs.readJsonSync(path.join(packageDir, "package.json"));
                const scriptPath = (_a = epkg.bin) === null || _a === void 0 ? void 0 : _a[req.script];
                if (!epkg.bin) {
                    throw new JsiiFault(`Script with name ${req.script} was not defined.`);
                }
                const nodeOptions = [ ...process.execArgv ];
                return {
                    command: path.join(packageDir, scriptPath),
                    args: (_b = req.args) !== null && _b !== void 0 ? _b : [],
                    env: {
                        ...process.env,
                        NODE_OPTIONS: nodeOptions.join(" "),
                        PATH: `${path.dirname(process.execPath)}:${process.env.PATH}`
                    }
                };
            }
            throw new JsiiFault(`Package with name ${req.assembly} was not loaded.`);
        }, _Kernel_makecbid = function _Kernel_makecbid() {
            var _a, _b;
            return `jsii::callback::${__classPrivateFieldSet(this, _Kernel_nextid, (_b = __classPrivateFieldGet(this, _Kernel_nextid, "f"), 
            _a = _b++, _b), "f"), _a}`;
        }, _Kernel_makeprid = function _Kernel_makeprid() {
            var _a, _b;
            return `jsii::promise::${__classPrivateFieldSet(this, _Kernel_nextid, (_b = __classPrivateFieldGet(this, _Kernel_nextid, "f"), 
            _a = _b++, _b), "f"), _a}`;
        };
        class Assembly {
            constructor(metadata, closure) {
                this.metadata = metadata;
                this.closure = closure;
            }
        }
    },
    8171(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.link = link;
        const fs_1 = __webpack_require__(9896);
        const os = __webpack_require__(857);
        const path_1 = __webpack_require__(6928);
        const PRESERVE_SYMLINKS = process.execArgv.includes("--preserve-symlinks");
        function link(existingRoot, destinationRoot) {
            (0, fs_1.mkdirSync)((0, path_1.dirname)(destinationRoot), {
                recursive: true
            });
            if (PRESERVE_SYMLINKS) {
                try {
                    (0, fs_1.symlinkSync)(existingRoot, destinationRoot);
                    return;
                } catch (e) {
                    const winNoSymlink = e.code === "EPERM" && os.platform() === "win32";
                    if (!winNoSymlink) {
                        throw e;
                    }
                }
            }
            recurse(existingRoot, destinationRoot);
            function recurse(existing, destination) {
                const stat = (0, fs_1.statSync)(existing);
                if (!stat.isDirectory()) {
                    try {
                        (0, fs_1.linkSync)(existing, destination);
                    } catch {
                        (0, fs_1.copyFileSync)(existing, destination);
                    }
                    return;
                }
                (0, fs_1.mkdirSync)(destination, {
                    recursive: true
                });
                for (const file of (0, fs_1.readdirSync)(existing)) {
                    recurse((0, path_1.join)(existing, file), (0, path_1.join)(destination, file));
                }
            }
        }
    },
    2063(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
            if (kind === "m") throw new TypeError("Private method is not writable");
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a setter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
            return kind === "a" ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
            value;
        };
        var __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, state, kind, f) {
            if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
            if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
            return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
        };
        var _ObjectTable_instances, _ObjectTable_resolveType, _ObjectTable_objects, _ObjectTable_nextid, _ObjectTable_makeId, _ObjectTable_removeRedundant, _InterfaceCollection_resolveType, _InterfaceCollection_interfaces;
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.ObjectTable = void 0;
        exports.jsiiTypeFqn = jsiiTypeFqn;
        exports.objectReference = objectReference;
        exports.tagJsiiConstructor = tagJsiiConstructor;
        const spec = __webpack_require__(9501);
        const assert = __webpack_require__(2613);
        const api = __webpack_require__(3403);
        const kernel_1 = __webpack_require__(162);
        const serialization_1 = __webpack_require__(1663);
        const OBJID_SYMBOL = Symbol.for("$__jsii__objid__$");
        const IFACES_SYMBOL = Symbol.for("$__jsii__interfaces__$");
        const JSII_RTTI_SYMBOL = Symbol.for("jsii.rtti");
        const RESOLVED_TYPE_FQN = new WeakMap;
        function jsiiTypeFqn(obj, isVisibleType) {
            var _a;
            const ctor = obj.constructor;
            if (RESOLVED_TYPE_FQN.has(ctor)) {
                return RESOLVED_TYPE_FQN.get(ctor);
            }
            let curr = ctor;
            while ((_a = curr[JSII_RTTI_SYMBOL]) === null || _a === void 0 ? void 0 : _a.fqn) {
                if (isVisibleType(curr[JSII_RTTI_SYMBOL].fqn)) {
                    const fqn = curr[JSII_RTTI_SYMBOL].fqn;
                    tagJsiiConstructor(curr, fqn);
                    tagJsiiConstructor(ctor, fqn);
                    return fqn;
                }
                curr = Object.getPrototypeOf(curr);
            }
            return undefined;
        }
        function objectReference(obj) {
            if (obj[OBJID_SYMBOL]) {
                return {
                    [api.TOKEN_REF]: obj[OBJID_SYMBOL],
                    [api.TOKEN_INTERFACES]: obj[IFACES_SYMBOL]
                };
            }
            return undefined;
        }
        function tagObject(obj, objid, interfaces) {
            const privateField = {
                enumerable: false,
                configurable: true,
                writable: true
            };
            if (Object.prototype.hasOwnProperty.call(obj, OBJID_SYMBOL)) {
                console.error(`[jsii/kernel] WARNING: object ${JSON.stringify(obj)} was already tagged as ${obj[OBJID_SYMBOL]}!`);
            }
            Object.defineProperty(obj, OBJID_SYMBOL, {
                ...privateField,
                value: objid
            });
            Object.defineProperty(obj, IFACES_SYMBOL, {
                ...privateField,
                value: interfaces
            });
        }
        function tagJsiiConstructor(constructor, fqn) {
            const existing = RESOLVED_TYPE_FQN.get(constructor);
            if (existing != null) {
                return assert.strictEqual(existing, fqn, `Unable to register ${constructor.name} as ${fqn}: it is already registerd with FQN ${existing}`);
            }
            RESOLVED_TYPE_FQN.set(constructor, fqn);
        }
        class ObjectTable {
            constructor(resolveType) {
                _ObjectTable_instances.add(this);
                _ObjectTable_resolveType.set(this, void 0);
                _ObjectTable_objects.set(this, new Map);
                _ObjectTable_nextid.set(this, 1e4);
                __classPrivateFieldSet(this, _ObjectTable_resolveType, resolveType, "f");
            }
            registerObject(obj, fqn, interfaces) {
                var _a;
                if (fqn === undefined) {
                    throw new kernel_1.JsiiFault("FQN cannot be undefined");
                }
                const existingRef = objectReference(obj);
                if (existingRef) {
                    if (interfaces) {
                        const allIfaces = new Set(interfaces);
                        for (const iface of (_a = existingRef[api.TOKEN_INTERFACES]) !== null && _a !== void 0 ? _a : []) {
                            allIfaces.add(iface);
                        }
                        if (!Object.prototype.hasOwnProperty.call(obj, IFACES_SYMBOL)) {
                            console.error(`[jsii/kernel] WARNING: referenced object ${existingRef[api.TOKEN_REF]} does not have the ${String(IFACES_SYMBOL)} property!`);
                        }
                        __classPrivateFieldGet(this, _ObjectTable_objects, "f").get(existingRef[api.TOKEN_REF]).interfaces = obj[IFACES_SYMBOL] = existingRef[api.TOKEN_INTERFACES] = interfaces = __classPrivateFieldGet(this, _ObjectTable_instances, "m", _ObjectTable_removeRedundant).call(this, Array.from(allIfaces), fqn);
                    }
                    return existingRef;
                }
                interfaces = __classPrivateFieldGet(this, _ObjectTable_instances, "m", _ObjectTable_removeRedundant).call(this, interfaces, fqn);
                const objid = __classPrivateFieldGet(this, _ObjectTable_instances, "m", _ObjectTable_makeId).call(this, fqn);
                __classPrivateFieldGet(this, _ObjectTable_objects, "f").set(objid, {
                    instance: obj,
                    fqn,
                    interfaces
                });
                tagObject(obj, objid, interfaces);
                return {
                    [api.TOKEN_REF]: objid,
                    [api.TOKEN_INTERFACES]: interfaces
                };
            }
            findObject(objref) {
                var _a;
                if (typeof objref !== "object" || !(api.TOKEN_REF in objref)) {
                    throw new kernel_1.JsiiFault(`Malformed object reference: ${JSON.stringify(objref)}`);
                }
                const objid = objref[api.TOKEN_REF];
                const obj = __classPrivateFieldGet(this, _ObjectTable_objects, "f").get(objid);
                if (!obj) {
                    throw new kernel_1.JsiiFault(`Object ${objid} not found`);
                }
                const additionalInterfaces = objref[api.TOKEN_INTERFACES];
                if (additionalInterfaces != null && additionalInterfaces.length > 0) {
                    return {
                        ...obj,
                        interfaces: [ ...(_a = obj.interfaces) !== null && _a !== void 0 ? _a : [], ...additionalInterfaces ]
                    };
                }
                return obj;
            }
            deleteObject({[api.TOKEN_REF]: objid}) {
                if (!__classPrivateFieldGet(this, _ObjectTable_objects, "f").delete(objid)) {
                    throw new kernel_1.JsiiFault(`Object ${objid} not found`);
                }
            }
            get count() {
                return __classPrivateFieldGet(this, _ObjectTable_objects, "f").size;
            }
        }
        exports.ObjectTable = ObjectTable;
        _ObjectTable_resolveType = new WeakMap, _ObjectTable_objects = new WeakMap, _ObjectTable_nextid = new WeakMap, 
        _ObjectTable_instances = new WeakSet, _ObjectTable_makeId = function _ObjectTable_makeId(fqn) {
            var _a, _b;
            return `${fqn}@${__classPrivateFieldSet(this, _ObjectTable_nextid, (_b = __classPrivateFieldGet(this, _ObjectTable_nextid, "f"), 
            _a = _b++, _b), "f"), _a}`;
        }, _ObjectTable_removeRedundant = function _ObjectTable_removeRedundant(interfaces, fqn) {
            if (!interfaces || interfaces.length === 0) {
                return undefined;
            }
            const result = new Set(interfaces);
            const builtIn = new InterfaceCollection(__classPrivateFieldGet(this, _ObjectTable_resolveType, "f"));
            if (fqn !== serialization_1.EMPTY_OBJECT_FQN) {
                builtIn.addFromClass(fqn);
            }
            interfaces.forEach(builtIn.addFromInterface.bind(builtIn));
            for (const iface of builtIn) {
                result.delete(iface);
            }
            return result.size > 0 ? Array.from(result).sort() : undefined;
        };
        class InterfaceCollection {
            constructor(resolveType) {
                _InterfaceCollection_resolveType.set(this, void 0);
                _InterfaceCollection_interfaces.set(this, new Set);
                __classPrivateFieldSet(this, _InterfaceCollection_resolveType, resolveType, "f");
            }
            addFromClass(fqn) {
                const ti = __classPrivateFieldGet(this, _InterfaceCollection_resolveType, "f").call(this, fqn);
                if (!spec.isClassType(ti)) {
                    throw new kernel_1.JsiiFault(`Expected a class, but received ${spec.describeTypeReference(ti)}`);
                }
                if (ti.base) {
                    this.addFromClass(ti.base);
                }
                if (ti.interfaces) {
                    for (const iface of ti.interfaces) {
                        if (__classPrivateFieldGet(this, _InterfaceCollection_interfaces, "f").has(iface)) {
                            continue;
                        }
                        __classPrivateFieldGet(this, _InterfaceCollection_interfaces, "f").add(iface);
                        this.addFromInterface(iface);
                    }
                }
            }
            addFromInterface(fqn) {
                const ti = __classPrivateFieldGet(this, _InterfaceCollection_resolveType, "f").call(this, fqn);
                if (!spec.isInterfaceType(ti)) {
                    throw new kernel_1.JsiiFault(`Expected an interface, but received ${spec.describeTypeReference(ti)}`);
                }
                if (!ti.interfaces) {
                    return;
                }
                for (const iface of ti.interfaces) {
                    if (__classPrivateFieldGet(this, _InterfaceCollection_interfaces, "f").has(iface)) {
                        continue;
                    }
                    __classPrivateFieldGet(this, _InterfaceCollection_interfaces, "f").add(iface);
                    this.addFromInterface(iface);
                }
            }
            [(_InterfaceCollection_resolveType = new WeakMap, _InterfaceCollection_interfaces = new WeakMap, 
            Symbol.iterator)]() {
                return __classPrivateFieldGet(this, _InterfaceCollection_interfaces, "f")[Symbol.iterator]();
            }
        }
    },
    9743(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.removeSync = removeSync;
        const fs = __webpack_require__(8463);
        const process = __webpack_require__(932);
        const removeSyncPaths = new Array;
        function removeSync(path) {
            registerIfNeeded();
            removeSyncPaths.push(path);
        }
        let registered = false;
        function registerIfNeeded() {
            if (registered) {
                return;
            }
            process.once("exit", onExitHandler);
            registered = true;
            function onExitHandler() {
                if (removeSyncPaths.length > 0) {
                    for (const path of removeSyncPaths) {
                        fs.removeSync(path);
                    }
                }
            }
        }
    },
    1663(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.SerializationError = exports.SERIALIZERS = exports.SYMBOL_WIRE_TYPE = exports.EMPTY_OBJECT_FQN = void 0;
        exports.serializationType = serializationType;
        exports.process = process;
        const spec = __webpack_require__(9501);
        const assert = __webpack_require__(2613);
        const util_1 = __webpack_require__(9023);
        const api_1 = __webpack_require__(3403);
        const objects_1 = __webpack_require__(2063);
        const _1 = __webpack_require__(7583);
        const VOID = "void";
        exports.EMPTY_OBJECT_FQN = "Object";
        exports.SYMBOL_WIRE_TYPE = Symbol.for("$jsii$wireType$");
        exports.SERIALIZERS = {
            ["Void"]: {
                serialize(value, _type, host) {
                    if (value != null) {
                        host.debug("Expected void, got", value);
                    }
                    return undefined;
                },
                deserialize(value, _type, host) {
                    if (value != null) {
                        host.debug("Expected void, got", value);
                    }
                    return undefined;
                }
            },
            ["Date"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (!isDate(value)) {
                        throw new SerializationError(`Value is not an instance of Date`, value, host);
                    }
                    return serializeDate(value);
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    if (!(0, api_1.isWireDate)(value)) {
                        throw new SerializationError(`Value does not have the "${api_1.TOKEN_DATE}" key`, value, host);
                    }
                    return deserializeDate(value);
                }
            },
            ["Scalar"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const primitiveType = optionalValue.type;
                    if (!isScalar(value)) {
                        throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value, host);
                    }
                    if (typeof value !== primitiveType.primitive) {
                        throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value, host);
                    }
                    return value;
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const primitiveType = optionalValue.type;
                    if (!isScalar(value)) {
                        throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value, host);
                    }
                    if (typeof value !== primitiveType.primitive) {
                        throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value, host);
                    }
                    return value;
                }
            },
            ["Json"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    return value;
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    if ((0, api_1.isWireMap)(value)) {
                        return exports.SERIALIZERS["Map"].deserialize(value, {
                            type: {
                                collection: {
                                    kind: spec.CollectionKind.Map,
                                    elementtype: {
                                        primitive: spec.PrimitiveType.Json
                                    }
                                }
                            }
                        }, host, {
                            allowNullishMapValue: true
                        });
                    }
                    if (typeof value !== "object") {
                        return value;
                    }
                    if (Array.isArray(value)) {
                        return value.map(mapJsonValue);
                    }
                    return mapValues(value, mapJsonValue, host);
                    function mapJsonValue(toMap, key) {
                        if (toMap == null) {
                            return toMap;
                        }
                        return process(host, "deserialize", toMap, {
                            type: {
                                primitive: spec.PrimitiveType.Json
                            }
                        }, typeof key === "string" ? `key ${(0, util_1.inspect)(key)}` : `index ${key}`);
                    }
                }
            },
            ["Enum"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (typeof value !== "string" && typeof value !== "number") {
                        throw new SerializationError(`Value is not a string or number`, value, host);
                    }
                    host.debug("Serializing enum");
                    const enumType = optionalValue.type;
                    const enumMap = host.findSymbol(enumType.fqn);
                    const enumEntry = Object.entries(enumMap).find(([, v]) => v === value);
                    if (!enumEntry) {
                        throw new SerializationError(`Value is not present in enum ${spec.describeTypeReference(enumType)}`, value, host);
                    }
                    return {
                        [api_1.TOKEN_ENUM]: `${enumType.fqn}/${enumEntry[0]}`
                    };
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    if (!(0, api_1.isWireEnum)(value)) {
                        throw new SerializationError(`Value does not have the "${api_1.TOKEN_ENUM}" key`, value, host);
                    }
                    return deserializeEnum(value, host);
                }
            },
            ["Array"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (!Array.isArray(value)) {
                        throw new SerializationError(`Value is not an array`, value, host);
                    }
                    const arrayType = optionalValue.type;
                    return value.map((x, idx) => process(host, "serialize", x, {
                        type: arrayType.collection.elementtype
                    }, `index ${(0, util_1.inspect)(idx)}`));
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (!Array.isArray(value)) {
                        throw new SerializationError(`Value is not an array`, value, host);
                    }
                    const arrayType = optionalValue.type;
                    return value.map((x, idx) => process(host, "deserialize", x, {
                        type: arrayType.collection.elementtype
                    }, `index ${(0, util_1.inspect)(idx)}`));
                }
            },
            ["Map"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const mapType = optionalValue.type;
                    return {
                        [api_1.TOKEN_MAP]: mapValues(value, (v, key) => process(host, "serialize", v, {
                            type: mapType.collection.elementtype
                        }, `key ${(0, util_1.inspect)(key)}`), host)
                    };
                },
                deserialize(value, optionalValue, host, {allowNullishMapValue = false} = {}) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const mapType = optionalValue.type;
                    if (!(0, api_1.isWireMap)(value)) {
                        return mapValues(value, (v, key) => process(host, "deserialize", v, {
                            optional: allowNullishMapValue,
                            type: mapType.collection.elementtype
                        }, `key ${(0, util_1.inspect)(key)}`), host);
                    }
                    const result = mapValues(value[api_1.TOKEN_MAP], (v, key) => process(host, "deserialize", v, {
                        optional: allowNullishMapValue,
                        type: mapType.collection.elementtype
                    }, `key ${(0, util_1.inspect)(key)}`), host);
                    Object.defineProperty(result, exports.SYMBOL_WIRE_TYPE, {
                        configurable: false,
                        enumerable: false,
                        value: api_1.TOKEN_MAP,
                        writable: false
                    });
                    return result;
                }
            },
            ["Struct"]: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (typeof value !== "object" || value == null || value instanceof Date) {
                        throw new SerializationError(`Value is not an object`, value, host);
                    }
                    if (Array.isArray(value)) {
                        throw new SerializationError(`Value is an array`, value, host);
                    }
                    host.debug("Returning value type by reference");
                    return host.objects.registerObject(value, exports.EMPTY_OBJECT_FQN, [ optionalValue.type.fqn ]);
                },
                deserialize(value, optionalValue, host) {
                    if (typeof value === "object" && Object.keys(value !== null && value !== void 0 ? value : {}).length === 0) {
                        value = undefined;
                    }
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (typeof value !== "object" || value == null) {
                        throw new SerializationError(`Value is not an object`, value, host);
                    }
                    const namedType = host.lookupType(optionalValue.type.fqn);
                    const props = propertiesOf(namedType, host.lookupType);
                    if (Array.isArray(value)) {
                        throw new SerializationError("Value is an array (varargs may have been incorrectly supplied)", value, host);
                    }
                    if ((0, api_1.isObjRef)(value)) {
                        host.debug("Expected value type but got reference type, accepting for now (awslabs/jsii#400)");
                        return validateRequiredProps(host.objects.findObject(value).instance, namedType.fqn, props, host);
                    }
                    if (_1.api.isWireStruct(value)) {
                        const {fqn, data} = value[_1.api.TOKEN_STRUCT];
                        if (!isAssignable(fqn, namedType, host.lookupType)) {
                            throw new SerializationError(`Wired struct has type '${fqn}', which does not match expected type`, value, host);
                        }
                        value = data;
                    }
                    if (_1.api.isWireMap(value)) {
                        value = value[_1.api.TOKEN_MAP];
                    }
                    value = validateRequiredProps(value, namedType.fqn, props, host);
                    return mapValues(value, (v, key) => {
                        if (!props[key]) {
                            return undefined;
                        }
                        return process(host, "deserialize", v, props[key], `key ${(0, util_1.inspect)(key)}`);
                    }, host);
                }
            },
            ["RefType"]: {
                serialize(value, optionalValue, host) {
                    var _a;
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (typeof value !== "object" || value == null || Array.isArray(value)) {
                        throw new SerializationError(`Value is not an object`, value, host);
                    }
                    if (value instanceof Date) {
                        throw new SerializationError(`Value is a Date`, value, host);
                    }
                    const expectedType = host.lookupType(optionalValue.type.fqn);
                    const interfaces = spec.isInterfaceType(expectedType) ? [ expectedType.fqn ] : undefined;
                    const jsiiType = (_a = (0, objects_1.jsiiTypeFqn)(value, host.isVisibleType)) !== null && _a !== void 0 ? _a : spec.isClassType(expectedType) ? expectedType.fqn : exports.EMPTY_OBJECT_FQN;
                    return host.objects.registerObject(value, jsiiType, interfaces);
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue, host)) {
                        return undefined;
                    }
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    if (!(0, api_1.isObjRef)(value)) {
                        throw new SerializationError(`Value does not have the "${api_1.TOKEN_REF}" key`, value, host);
                    }
                    const {instance, fqn} = host.objects.findObject(value);
                    const namedTypeRef = optionalValue.type;
                    if (namedTypeRef.fqn !== exports.EMPTY_OBJECT_FQN) {
                        const namedType = host.lookupType(namedTypeRef.fqn);
                        const declaredType = optionalValue.type;
                        if (spec.isClassType(namedType) && !isAssignable(fqn, declaredType, host.lookupType)) {
                            throw new SerializationError(`Object of type '${fqn}' is not convertible to ${spec.describeTypeReference(declaredType)}`, value, host);
                        }
                    }
                    return instance;
                }
            },
            ["Any"]: {
                serialize(value, _type, host) {
                    var _a;
                    if (value == null) {
                        return undefined;
                    }
                    if (isDate(value)) {
                        return serializeDate(value);
                    }
                    if (isScalar(value)) {
                        return value;
                    }
                    if (Array.isArray(value)) {
                        return value.map((e, idx) => process(host, "serialize", e, {
                            type: spec.CANONICAL_ANY
                        }, `index ${(0, util_1.inspect)(idx)}`));
                    }
                    if (typeof value === "function") {
                        throw new SerializationError("Functions cannot be passed across language boundaries", value, host);
                    }
                    if (typeof value !== "object" || value == null) {
                        throw new SerializationError(`A jsii kernel assumption was violated: value is not an object`, value, host);
                    }
                    if (exports.SYMBOL_WIRE_TYPE in value && value[exports.SYMBOL_WIRE_TYPE] === api_1.TOKEN_MAP) {
                        return exports.SERIALIZERS["Map"].serialize(value, {
                            type: {
                                collection: {
                                    kind: spec.CollectionKind.Map,
                                    elementtype: spec.CANONICAL_ANY
                                }
                            }
                        }, host);
                    }
                    if (value instanceof Set || value instanceof Map) {
                        throw new SerializationError("Set and Map instances cannot be sent across the language boundary", value, host);
                    }
                    const prevRef = (0, objects_1.objectReference)(value);
                    if (prevRef) {
                        return prevRef;
                    }
                    const jsiiType = (_a = (0, objects_1.jsiiTypeFqn)(value, host.isVisibleType)) !== null && _a !== void 0 ? _a : isByReferenceOnly(value) ? exports.EMPTY_OBJECT_FQN : undefined;
                    if (jsiiType) {
                        return host.objects.registerObject(value, jsiiType);
                    }
                    return mapValues(value, (v, key) => process(host, "serialize", v, {
                        type: spec.CANONICAL_ANY
                    }, `key ${(0, util_1.inspect)(key)}`), host);
                },
                deserialize(value, _type, host) {
                    if (value == null) {
                        return undefined;
                    }
                    if ((0, api_1.isWireDate)(value)) {
                        host.debug("ANY is a Date");
                        return deserializeDate(value);
                    }
                    if (isScalar(value)) {
                        host.debug("ANY is a Scalar");
                        return value;
                    }
                    if (Array.isArray(value)) {
                        host.debug("ANY is an Array");
                        return value.map((e, idx) => process(host, "deserialize", e, {
                            type: spec.CANONICAL_ANY
                        }, `index ${(0, util_1.inspect)(idx)}`));
                    }
                    if ((0, api_1.isWireEnum)(value)) {
                        host.debug("ANY is an Enum");
                        return deserializeEnum(value, host);
                    }
                    if ((0, api_1.isWireMap)(value)) {
                        host.debug("ANY is a Map");
                        const mapOfAny = {
                            collection: {
                                kind: spec.CollectionKind.Map,
                                elementtype: spec.CANONICAL_ANY
                            }
                        };
                        return exports.SERIALIZERS["Map"].deserialize(value, {
                            type: mapOfAny
                        }, host);
                    }
                    if ((0, api_1.isObjRef)(value)) {
                        host.debug("ANY is a Ref");
                        return host.objects.findObject(value).instance;
                    }
                    if ((0, api_1.isWireStruct)(value)) {
                        const {fqn, data} = value[api_1.TOKEN_STRUCT];
                        host.debug(`ANY is a struct of type ${fqn}`);
                        return exports.SERIALIZERS["Struct"].deserialize(data, {
                            type: {
                                fqn
                            }
                        }, host);
                    }
                    host.debug("ANY is a Map");
                    return mapValues(value, (v, key) => process(host, "deserialize", v, {
                        type: spec.CANONICAL_ANY
                    }, `key ${(0, util_1.inspect)(key)}`), host);
                }
            }
        };
        function serializeDate(value) {
            return {
                [api_1.TOKEN_DATE]: value.toISOString()
            };
        }
        function deserializeDate(value) {
            return new Date(value[api_1.TOKEN_DATE]);
        }
        function deserializeEnum(value, host) {
            const enumLocator = value[api_1.TOKEN_ENUM];
            const sep = enumLocator.lastIndexOf("/");
            if (sep === -1) {
                throw new SerializationError(`Invalid enum token value ${(0, util_1.inspect)(enumLocator)}`, value, host);
            }
            const typeName = enumLocator.slice(0, sep);
            const valueName = enumLocator.slice(sep + 1);
            const enumValue = host.findSymbol(typeName)[valueName];
            if (enumValue === undefined) {
                throw new SerializationError(`No such enum member: ${(0, util_1.inspect)(valueName)}`, value, host);
            }
            return enumValue;
        }
        function serializationType(typeRef, lookup) {
            assert(typeRef != null, `Kernel error: expected type information, got ${(0, util_1.inspect)(typeRef)}`);
            if (typeRef === "void") {
                return [ {
                    serializationClass: "Void",
                    typeRef
                } ];
            }
            if (spec.isPrimitiveTypeReference(typeRef.type)) {
                switch (typeRef.type.primitive) {
                  case spec.PrimitiveType.Any:
                    return [ {
                        serializationClass: "Any",
                        typeRef
                    } ];

                  case spec.PrimitiveType.Date:
                    return [ {
                        serializationClass: "Date",
                        typeRef
                    } ];

                  case spec.PrimitiveType.Json:
                    return [ {
                        serializationClass: "Json",
                        typeRef
                    } ];

                  case spec.PrimitiveType.Boolean:
                  case spec.PrimitiveType.Number:
                  case spec.PrimitiveType.String:
                    return [ {
                        serializationClass: "Scalar",
                        typeRef
                    } ];
                }
                assert(false, `Unknown primitive type: ${(0, util_1.inspect)(typeRef.type)}`);
            }
            if (spec.isCollectionTypeReference(typeRef.type)) {
                return [ {
                    serializationClass: typeRef.type.collection.kind === spec.CollectionKind.Array ? "Array" : "Map",
                    typeRef
                } ];
            }
            if (spec.isUnionTypeReference(typeRef.type)) {
                const compoundTypes = flatMap(typeRef.type.union.types, t => serializationType({
                    type: t
                }, lookup));
                for (const t of compoundTypes) {
                    if (t.typeRef !== "void") {
                        t.typeRef.optional = typeRef.optional;
                    }
                }
                return compoundTypes.sort((l, r) => compareSerializationClasses(l.serializationClass, r.serializationClass));
            }
            if (spec.isIntersectionTypeReference(typeRef.type)) {
                return serializationType({
                    optional: typeRef.optional,
                    type: typeRef.type.intersection.types[0]
                }, lookup);
            }
            const type = lookup(typeRef.type.fqn);
            if (spec.isEnumType(type)) {
                return [ {
                    serializationClass: "Enum",
                    typeRef
                } ];
            }
            if (spec.isInterfaceType(type) && type.datatype) {
                return [ {
                    serializationClass: "Struct",
                    typeRef
                } ];
            }
            return [ {
                serializationClass: "RefType",
                typeRef
            } ];
        }
        function nullAndOk(x, type, host) {
            if (x != null) {
                return false;
            }
            if (type !== "void" && !type.optional) {
                throw new SerializationError(`A value is required (type is non-optional)`, x, host);
            }
            return true;
        }
        function isDate(x) {
            return typeof x === "object" && Object.prototype.toString.call(x) === "[object Date]";
        }
        function isScalar(x) {
            return typeof x === "string" || typeof x === "number" || typeof x === "boolean";
        }
        function flatMap(xs, fn) {
            const ret = new Array;
            for (const x of xs) {
                ret.push(...fn(x));
            }
            return ret;
        }
        function mapValues(value, fn, host) {
            if (typeof value !== "object" || value == null) {
                throw new SerializationError(`Value is not an object`, value, host);
            }
            if (Array.isArray(value)) {
                throw new SerializationError(`Value is an array`, value, host);
            }
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                const wireValue = fn(v, k);
                if (wireValue === undefined) {
                    continue;
                }
                out[k] = wireValue;
            }
            return out;
        }
        function propertiesOf(t, lookup) {
            var _a;
            if (!spec.isClassOrInterfaceType(t)) {
                return {};
            }
            let ret = {};
            if (t.interfaces) {
                for (const iface of t.interfaces) {
                    ret = {
                        ...ret,
                        ...propertiesOf(lookup(iface), lookup)
                    };
                }
            }
            if (spec.isClassType(t) && t.base) {
                ret = {
                    ...ret,
                    ...propertiesOf(lookup(t.base), lookup)
                };
            }
            for (const prop of (_a = t.properties) !== null && _a !== void 0 ? _a : []) {
                ret[prop.name] = prop;
            }
            return ret;
        }
        function isAssignable(actualTypeFqn, requiredType, lookup) {
            if (actualTypeFqn === exports.EMPTY_OBJECT_FQN) {
                return true;
            }
            if (requiredType.fqn === actualTypeFqn) {
                return true;
            }
            const actualType = lookup(actualTypeFqn);
            if (spec.isClassType(actualType)) {
                if (actualType.base && isAssignable(actualType.base, requiredType, lookup)) {
                    return true;
                }
            }
            if (spec.isClassOrInterfaceType(actualType) && actualType.interfaces) {
                return actualType.interfaces.find(iface => isAssignable(iface, requiredType, lookup)) != null;
            }
            return false;
        }
        function validateRequiredProps(actualProps, typeName, specProps, host) {
            const missingRequiredProps = Object.keys(specProps).filter(name => !specProps[name].optional).filter(name => !(name in actualProps));
            if (missingRequiredProps.length > 0) {
                throw new SerializationError(`Missing required properties for ${typeName}: ${missingRequiredProps.map(p => (0, 
                util_1.inspect)(p)).join(", ")}`, actualProps, host);
            }
            return actualProps;
        }
        function compareSerializationClasses(l, r) {
            const order = [ "Void", "Date", "Scalar", "Json", "Enum", "Array", "Map", "Struct", "RefType", "Any" ];
            return order.indexOf(l) - order.indexOf(r);
        }
        function isByReferenceOnly(obj) {
            if (Array.isArray(obj)) {
                return false;
            }
            let curr = obj;
            do {
                for (const prop of Object.getOwnPropertyNames(curr)) {
                    const descr = Object.getOwnPropertyDescriptor(curr, prop);
                    if ((descr === null || descr === void 0 ? void 0 : descr.get) != null || (descr === null || descr === void 0 ? void 0 : descr.set) != null || typeof (descr === null || descr === void 0 ? void 0 : descr.value) === "function") {
                        return true;
                    }
                }
            } while (Object.getPrototypeOf(curr = Object.getPrototypeOf(curr)) != null);
            return false;
        }
        function process(host, serde, value, type, context) {
            const wireTypes = serializationType(type, host.lookupType);
            host.debug(serde, value, ...wireTypes);
            const errors = new Array;
            for (const {serializationClass, typeRef} of wireTypes) {
                try {
                    return exports.SERIALIZERS[serializationClass][serde](value, typeRef, host);
                } catch (error) {
                    error.context = `as ${typeRef === VOID ? VOID : spec.describeTypeReference(typeRef.type)}`;
                    errors.push(error);
                }
            }
            const typeDescr = type === VOID ? type : spec.describeTypeReference(type.type);
            const optionalTypeDescr = type !== VOID && type.optional ? `${typeDescr} | undefined` : typeDescr;
            throw new SerializationError(`${titleize(context)}: Unable to ${serde} value as ${optionalTypeDescr}`, value, host, errors, {
                renderValue: true
            });
            function titleize(text) {
                text = text.trim();
                if (text === "") {
                    return text;
                }
                const [first, ...rest] = text;
                return [ first.toUpperCase(), ...rest ].join("");
            }
        }
        class SerializationError extends Error {
            constructor(message, value, {isVisibleType}, causes = [], {renderValue = false} = {}) {
                super([ message, ...renderValue ? [ `${causes.length > 0 ? "├" : "╰"}── 🛑 Failing value is ${describeTypeOf(value, isVisibleType)}`, ...value == null ? [] : (0, 
                util_1.inspect)(value, false, 0).split("\n").map(l => `${causes.length > 0 ? "│" : " "}      ${l}`) ] : [], ...causes.length > 0 ? [ "╰── 🔍 Failure reason(s):", ...causes.map((cause, idx) => {
                    var _a;
                    return `    ${idx < causes.length - 1 ? "├" : "╰"}─${causes.length > 1 ? ` [${(_a = cause.context) !== null && _a !== void 0 ? _a : (0, 
                    util_1.inspect)(idx)}]` : ""} ${cause.message.split("\n").join("\n        ")}`;
                }) ] : [] ].join("\n"));
                this.value = value;
                this.causes = causes;
                this.name = "@jsii/kernel.SerializationError";
            }
        }
        exports.SerializationError = SerializationError;
        function describeTypeOf(value, isVisibleType) {
            const type = typeof value;
            switch (type) {
              case "object":
                if (value == null) {
                    return JSON.stringify(value);
                }
                if (Array.isArray(value)) {
                    return "an array";
                }
                const fqn = (0, objects_1.jsiiTypeFqn)(value, isVisibleType);
                if (fqn != null && fqn !== exports.EMPTY_OBJECT_FQN) {
                    return `an instance of ${fqn}`;
                }
                const ctorName = value.constructor.name;
                if (ctorName != null && ctorName !== Object.name) {
                    return `an instance of ${ctorName}`;
                }
                return `an object`;

              case "undefined":
                return type;

              case "boolean":
              case "function":
              case "number":
              case "string":
              case "bigint":
              case "symbol":
              default:
                return `a ${type}`;
            }
        }
    },
    8819(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.defaultCacheRoot = defaultCacheRoot;
        const os_1 = __webpack_require__(857);
        const path_1 = __webpack_require__(6928);
        function defaultCacheRoot() {
            switch (process.platform) {
              case "darwin":
                if (process.env.HOME) return (0, path_1.join)(process.env.HOME, "Library", "Caches", "com.amazonaws.jsii", "package-cache");
                break;

              case "linux":
                if (process.env.HOME) return (0, path_1.join)(process.env.HOME, ".cache", "aws", "jsii", "package-cache");
                break;

              case "win32":
                if (process.env.LOCALAPPDATA) return (0, path_1.join)(process.env.LOCALAPPDATA, "AWS", "jsii", "package-cache");
                break;

              default:
            }
            return (0, path_1.join)((0, os_1.tmpdir)(), "aws-jsii-package-cache");
        }
    },
    7344(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var _a, _b;
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.extract = extract;
        exports.getPackageCacheEnabled = getPackageCacheEnabled;
        exports.setPackageCacheEnabled = setPackageCacheEnabled;
        const fs_1 = __webpack_require__(9896);
        const tar = __webpack_require__(4410);
        const disk_cache_1 = __webpack_require__(4018);
        const link_1 = __webpack_require__(8171);
        const default_cache_root_1 = __webpack_require__(8819);
        let packageCacheEnabled = ((_b = (_a = process.env.JSII_RUNTIME_PACKAGE_CACHE) === null || _a === void 0 ? void 0 : _a.toLocaleLowerCase()) !== null && _b !== void 0 ? _b : "enabled") === "enabled";
        function extract(file, outDir, options, ...comments) {
            try {
                return (packageCacheEnabled ? extractViaCache : extractToOutDir)(file, outDir, options, ...comments);
            } catch (err) {
                (0, fs_1.rmSync)(outDir, {
                    force: true,
                    recursive: true
                });
                throw err;
            }
        }
        function extractViaCache(file, outDir, options = {}, ...comments) {
            var _a;
            const cacheRoot = (_a = process.env.JSII_RUNTIME_PACKAGE_CACHE_ROOT) !== null && _a !== void 0 ? _a : (0, 
            default_cache_root_1.defaultCacheRoot)();
            const dirCache = disk_cache_1.DiskCache.inDirectory(cacheRoot);
            const entry = dirCache.entryFor(file, ...comments);
            const {path, cache} = entry.retrieve(path => {
                untarInto({
                    ...options,
                    cwd: path,
                    file
                });
            });
            (0, link_1.link)(path, outDir);
            return {
                cache
            };
        }
        function extractToOutDir(file, cwd, options = {}) {
            (0, fs_1.mkdirSync)(cwd, {
                recursive: true
            });
            untarInto({
                ...options,
                cwd,
                file
            });
            return {};
        }
        function untarInto(options) {
            try {
                tar.extract({
                    ...options,
                    sync: true
                });
            } catch (error) {
                (0, fs_1.rmSync)(options.cwd, {
                    force: true,
                    recursive: true
                });
                throw error;
            }
        }
        function getPackageCacheEnabled() {
            return packageCacheEnabled;
        }
        function setPackageCacheEnabled(value) {
            packageCacheEnabled = value;
        }
    },
    8413(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const fs = __webpack_require__(9896);
        const path = __webpack_require__(6928);
        const LCHOWN = fs.lchown ? "lchown" : "chown";
        const LCHOWNSYNC = fs.lchownSync ? "lchownSync" : "chownSync";
        const needEISDIRHandled = fs.lchown && !process.version.match(/v1[1-9]+\./) && !process.version.match(/v10\.[6-9]/);
        const lchownSync = (path, uid, gid) => {
            try {
                return fs[LCHOWNSYNC](path, uid, gid);
            } catch (er) {
                if (er.code !== "ENOENT") throw er;
            }
        };
        const chownSync = (path, uid, gid) => {
            try {
                return fs.chownSync(path, uid, gid);
            } catch (er) {
                if (er.code !== "ENOENT") throw er;
            }
        };
        const handleEISDIR = needEISDIRHandled ? (path, uid, gid, cb) => er => {
            if (!er || er.code !== "EISDIR") cb(er); else fs.chown(path, uid, gid, cb);
        } : (_, __, ___, cb) => cb;
        const handleEISDirSync = needEISDIRHandled ? (path, uid, gid) => {
            try {
                return lchownSync(path, uid, gid);
            } catch (er) {
                if (er.code !== "EISDIR") throw er;
                chownSync(path, uid, gid);
            }
        } : (path, uid, gid) => lchownSync(path, uid, gid);
        const nodeVersion = process.version;
        let readdir = (path, options, cb) => fs.readdir(path, options, cb);
        let readdirSync = (path, options) => fs.readdirSync(path, options);
        if (/^v4\./.test(nodeVersion)) readdir = (path, options, cb) => fs.readdir(path, cb);
        const chown = (cpath, uid, gid, cb) => {
            fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, er => {
                cb(er && er.code !== "ENOENT" ? er : null);
            }));
        };
        const chownrKid = (p, child, uid, gid, cb) => {
            if (typeof child === "string") return fs.lstat(path.resolve(p, child), (er, stats) => {
                if (er) return cb(er.code !== "ENOENT" ? er : null);
                stats.name = child;
                chownrKid(p, stats, uid, gid, cb);
            });
            if (child.isDirectory()) {
                chownr(path.resolve(p, child.name), uid, gid, er => {
                    if (er) return cb(er);
                    const cpath = path.resolve(p, child.name);
                    chown(cpath, uid, gid, cb);
                });
            } else {
                const cpath = path.resolve(p, child.name);
                chown(cpath, uid, gid, cb);
            }
        };
        const chownr = (p, uid, gid, cb) => {
            readdir(p, {
                withFileTypes: true
            }, (er, children) => {
                if (er) {
                    if (er.code === "ENOENT") return cb(); else if (er.code !== "ENOTDIR" && er.code !== "ENOTSUP") return cb(er);
                }
                if (er || !children.length) return chown(p, uid, gid, cb);
                let len = children.length;
                let errState = null;
                const then = er => {
                    if (errState) return;
                    if (er) return cb(errState = er);
                    if (--len === 0) return chown(p, uid, gid, cb);
                };
                children.forEach(child => chownrKid(p, child, uid, gid, then));
            });
        };
        const chownrKidSync = (p, child, uid, gid) => {
            if (typeof child === "string") {
                try {
                    const stats = fs.lstatSync(path.resolve(p, child));
                    stats.name = child;
                    child = stats;
                } catch (er) {
                    if (er.code === "ENOENT") return; else throw er;
                }
            }
            if (child.isDirectory()) chownrSync(path.resolve(p, child.name), uid, gid);
            handleEISDirSync(path.resolve(p, child.name), uid, gid);
        };
        const chownrSync = (p, uid, gid) => {
            let children;
            try {
                children = readdirSync(p, {
                    withFileTypes: true
                });
            } catch (er) {
                if (er.code === "ENOENT") return; else if (er.code === "ENOTDIR" || er.code === "ENOTSUP") return handleEISDirSync(p, uid, gid); else throw er;
            }
            if (children && children.length) children.forEach(child => chownrKidSync(p, child, uid, gid));
            return handleEISDirSync(p, uid, gid);
        };
        module.exports = chownr;
        chownr.sync = chownrSync;
    },
    4857(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        const MiniPass = __webpack_require__(5131);
        const EE = __webpack_require__(4434).EventEmitter;
        const fs = __webpack_require__(9896);
        let writev = fs.writev;
        if (!writev) {
            const binding = process.binding("fs");
            const FSReqWrap = binding.FSReqWrap || binding.FSReqCallback;
            writev = (fd, iovec, pos, cb) => {
                const done = (er, bw) => cb(er, bw, iovec);
                const req = new FSReqWrap;
                req.oncomplete = done;
                binding.writeBuffers(fd, iovec, pos, req);
            };
        }
        const _autoClose = Symbol("_autoClose");
        const _close = Symbol("_close");
        const _ended = Symbol("_ended");
        const _fd = Symbol("_fd");
        const _finished = Symbol("_finished");
        const _flags = Symbol("_flags");
        const _flush = Symbol("_flush");
        const _handleChunk = Symbol("_handleChunk");
        const _makeBuf = Symbol("_makeBuf");
        const _mode = Symbol("_mode");
        const _needDrain = Symbol("_needDrain");
        const _onerror = Symbol("_onerror");
        const _onopen = Symbol("_onopen");
        const _onread = Symbol("_onread");
        const _onwrite = Symbol("_onwrite");
        const _open = Symbol("_open");
        const _path = Symbol("_path");
        const _pos = Symbol("_pos");
        const _queue = Symbol("_queue");
        const _read = Symbol("_read");
        const _readSize = Symbol("_readSize");
        const _reading = Symbol("_reading");
        const _remain = Symbol("_remain");
        const _size = Symbol("_size");
        const _write = Symbol("_write");
        const _writing = Symbol("_writing");
        const _defaultFlag = Symbol("_defaultFlag");
        const _errored = Symbol("_errored");
        class ReadStream extends MiniPass {
            constructor(path, opt) {
                opt = opt || {};
                super(opt);
                this.readable = true;
                this.writable = false;
                if (typeof path !== "string") throw new TypeError("path must be a string");
                this[_errored] = false;
                this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
                this[_path] = path;
                this[_readSize] = opt.readSize || 16 * 1024 * 1024;
                this[_reading] = false;
                this[_size] = typeof opt.size === "number" ? opt.size : Infinity;
                this[_remain] = this[_size];
                this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
                if (typeof this[_fd] === "number") this[_read](); else this[_open]();
            }
            get fd() {
                return this[_fd];
            }
            get path() {
                return this[_path];
            }
            write() {
                throw new TypeError("this is a readable stream");
            }
            end() {
                throw new TypeError("this is a readable stream");
            }
            [_open]() {
                fs.open(this[_path], "r", (er, fd) => this[_onopen](er, fd));
            }
            [_onopen](er, fd) {
                if (er) this[_onerror](er); else {
                    this[_fd] = fd;
                    this.emit("open", fd);
                    this[_read]();
                }
            }
            [_makeBuf]() {
                return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]));
            }
            [_read]() {
                if (!this[_reading]) {
                    this[_reading] = true;
                    const buf = this[_makeBuf]();
                    if (buf.length === 0) return process.nextTick(() => this[_onread](null, 0, buf));
                    fs.read(this[_fd], buf, 0, buf.length, null, (er, br, buf) => this[_onread](er, br, buf));
                }
            }
            [_onread](er, br, buf) {
                this[_reading] = false;
                if (er) this[_onerror](er); else if (this[_handleChunk](br, buf)) this[_read]();
            }
            [_close]() {
                if (this[_autoClose] && typeof this[_fd] === "number") {
                    const fd = this[_fd];
                    this[_fd] = null;
                    fs.close(fd, er => er ? this.emit("error", er) : this.emit("close"));
                }
            }
            [_onerror](er) {
                this[_reading] = true;
                this[_close]();
                this.emit("error", er);
            }
            [_handleChunk](br, buf) {
                let ret = false;
                this[_remain] -= br;
                if (br > 0) ret = super.write(br < buf.length ? buf.slice(0, br) : buf);
                if (br === 0 || this[_remain] <= 0) {
                    ret = false;
                    this[_close]();
                    super.end();
                }
                return ret;
            }
            emit(ev, data) {
                switch (ev) {
                  case "prefinish":
                  case "finish":
                    break;

                  case "drain":
                    if (typeof this[_fd] === "number") this[_read]();
                    break;

                  case "error":
                    if (this[_errored]) return;
                    this[_errored] = true;
                    return super.emit(ev, data);

                  default:
                    return super.emit(ev, data);
                }
            }
        }
        class ReadStreamSync extends ReadStream {
            [_open]() {
                let threw = true;
                try {
                    this[_onopen](null, fs.openSync(this[_path], "r"));
                    threw = false;
                } finally {
                    if (threw) this[_close]();
                }
            }
            [_read]() {
                let threw = true;
                try {
                    if (!this[_reading]) {
                        this[_reading] = true;
                        do {
                            const buf = this[_makeBuf]();
                            const br = buf.length === 0 ? 0 : fs.readSync(this[_fd], buf, 0, buf.length, null);
                            if (!this[_handleChunk](br, buf)) break;
                        } while (true);
                        this[_reading] = false;
                    }
                    threw = false;
                } finally {
                    if (threw) this[_close]();
                }
            }
            [_close]() {
                if (this[_autoClose] && typeof this[_fd] === "number") {
                    const fd = this[_fd];
                    this[_fd] = null;
                    fs.closeSync(fd);
                    this.emit("close");
                }
            }
        }
        class WriteStream extends EE {
            constructor(path, opt) {
                opt = opt || {};
                super(opt);
                this.readable = false;
                this.writable = true;
                this[_errored] = false;
                this[_writing] = false;
                this[_ended] = false;
                this[_needDrain] = false;
                this[_queue] = [];
                this[_path] = path;
                this[_fd] = typeof opt.fd === "number" ? opt.fd : null;
                this[_mode] = opt.mode === undefined ? 438 : opt.mode;
                this[_pos] = typeof opt.start === "number" ? opt.start : null;
                this[_autoClose] = typeof opt.autoClose === "boolean" ? opt.autoClose : true;
                const defaultFlag = this[_pos] !== null ? "r+" : "w";
                this[_defaultFlag] = opt.flags === undefined;
                this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags;
                if (this[_fd] === null) this[_open]();
            }
            emit(ev, data) {
                if (ev === "error") {
                    if (this[_errored]) return;
                    this[_errored] = true;
                }
                return super.emit(ev, data);
            }
            get fd() {
                return this[_fd];
            }
            get path() {
                return this[_path];
            }
            [_onerror](er) {
                this[_close]();
                this[_writing] = true;
                this.emit("error", er);
            }
            [_open]() {
                fs.open(this[_path], this[_flags], this[_mode], (er, fd) => this[_onopen](er, fd));
            }
            [_onopen](er, fd) {
                if (this[_defaultFlag] && this[_flags] === "r+" && er && er.code === "ENOENT") {
                    this[_flags] = "w";
                    this[_open]();
                } else if (er) this[_onerror](er); else {
                    this[_fd] = fd;
                    this.emit("open", fd);
                    this[_flush]();
                }
            }
            end(buf, enc) {
                if (buf) this.write(buf, enc);
                this[_ended] = true;
                if (!this[_writing] && !this[_queue].length && typeof this[_fd] === "number") this[_onwrite](null, 0);
                return this;
            }
            write(buf, enc) {
                if (typeof buf === "string") buf = Buffer.from(buf, enc);
                if (this[_ended]) {
                    this.emit("error", new Error("write() after end()"));
                    return false;
                }
                if (this[_fd] === null || this[_writing] || this[_queue].length) {
                    this[_queue].push(buf);
                    this[_needDrain] = true;
                    return false;
                }
                this[_writing] = true;
                this[_write](buf);
                return true;
            }
            [_write](buf) {
                fs.write(this[_fd], buf, 0, buf.length, this[_pos], (er, bw) => this[_onwrite](er, bw));
            }
            [_onwrite](er, bw) {
                if (er) this[_onerror](er); else {
                    if (this[_pos] !== null) this[_pos] += bw;
                    if (this[_queue].length) this[_flush](); else {
                        this[_writing] = false;
                        if (this[_ended] && !this[_finished]) {
                            this[_finished] = true;
                            this[_close]();
                            this.emit("finish");
                        } else if (this[_needDrain]) {
                            this[_needDrain] = false;
                            this.emit("drain");
                        }
                    }
                }
            }
            [_flush]() {
                if (this[_queue].length === 0) {
                    if (this[_ended]) this[_onwrite](null, 0);
                } else if (this[_queue].length === 1) this[_write](this[_queue].pop()); else {
                    const iovec = this[_queue];
                    this[_queue] = [];
                    writev(this[_fd], iovec, this[_pos], (er, bw) => this[_onwrite](er, bw));
                }
            }
            [_close]() {
                if (this[_autoClose] && typeof this[_fd] === "number") {
                    const fd = this[_fd];
                    this[_fd] = null;
                    fs.close(fd, er => er ? this.emit("error", er) : this.emit("close"));
                }
            }
        }
        class WriteStreamSync extends WriteStream {
            [_open]() {
                let fd;
                if (this[_defaultFlag] && this[_flags] === "r+") {
                    try {
                        fd = fs.openSync(this[_path], this[_flags], this[_mode]);
                    } catch (er) {
                        if (er.code === "ENOENT") {
                            this[_flags] = "w";
                            return this[_open]();
                        } else throw er;
                    }
                } else fd = fs.openSync(this[_path], this[_flags], this[_mode]);
                this[_onopen](null, fd);
            }
            [_close]() {
                if (this[_autoClose] && typeof this[_fd] === "number") {
                    const fd = this[_fd];
                    this[_fd] = null;
                    fs.closeSync(fd);
                    this.emit("close");
                }
            }
            [_write](buf) {
                let threw = true;
                try {
                    this[_onwrite](null, fs.writeSync(this[_fd], buf, 0, buf.length, this[_pos]));
                    threw = false;
                } finally {
                    if (threw) try {
                        this[_close]();
                    } catch (_) {}
                }
            }
        }
        exports.ReadStream = ReadStream;
        exports.ReadStreamSync = ReadStreamSync;
        exports.WriteStream = WriteStream;
        exports.WriteStreamSync = WriteStreamSync;
    },
    5131(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const proc = typeof process === "object" && process ? process : {
            stdout: null,
            stderr: null
        };
        const EE = __webpack_require__(4434);
        const Stream = __webpack_require__(2203);
        const SD = __webpack_require__(3193).StringDecoder;
        const EOF = Symbol("EOF");
        const MAYBE_EMIT_END = Symbol("maybeEmitEnd");
        const EMITTED_END = Symbol("emittedEnd");
        const EMITTING_END = Symbol("emittingEnd");
        const EMITTED_ERROR = Symbol("emittedError");
        const CLOSED = Symbol("closed");
        const READ = Symbol("read");
        const FLUSH = Symbol("flush");
        const FLUSHCHUNK = Symbol("flushChunk");
        const ENCODING = Symbol("encoding");
        const DECODER = Symbol("decoder");
        const FLOWING = Symbol("flowing");
        const PAUSED = Symbol("paused");
        const RESUME = Symbol("resume");
        const BUFFERLENGTH = Symbol("bufferLength");
        const BUFFERPUSH = Symbol("bufferPush");
        const BUFFERSHIFT = Symbol("bufferShift");
        const OBJECTMODE = Symbol("objectMode");
        const DESTROYED = Symbol("destroyed");
        const EMITDATA = Symbol("emitData");
        const EMITEND = Symbol("emitEnd");
        const EMITEND2 = Symbol("emitEnd2");
        const ASYNC = Symbol("async");
        const defer = fn => Promise.resolve().then(fn);
        const doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
        const ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
        const ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
        const isEndish = ev => ev === "end" || ev === "finish" || ev === "prefinish";
        const isArrayBuffer = b => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
        const isArrayBufferView = b => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
        class Pipe {
            constructor(src, dest, opts) {
                this.src = src;
                this.dest = dest;
                this.opts = opts;
                this.ondrain = () => src[RESUME]();
                dest.on("drain", this.ondrain);
            }
            unpipe() {
                this.dest.removeListener("drain", this.ondrain);
            }
            proxyErrors() {}
            end() {
                this.unpipe();
                if (this.opts.end) this.dest.end();
            }
        }
        class PipeProxyErrors extends Pipe {
            unpipe() {
                this.src.removeListener("error", this.proxyErrors);
                super.unpipe();
            }
            constructor(src, dest, opts) {
                super(src, dest, opts);
                this.proxyErrors = er => dest.emit("error", er);
                src.on("error", this.proxyErrors);
            }
        }
        module.exports = class Minipass extends Stream {
            constructor(options) {
                super();
                this[FLOWING] = false;
                this[PAUSED] = false;
                this.pipes = [];
                this.buffer = [];
                this[OBJECTMODE] = options && options.objectMode || false;
                if (this[OBJECTMODE]) this[ENCODING] = null; else this[ENCODING] = options && options.encoding || null;
                if (this[ENCODING] === "buffer") this[ENCODING] = null;
                this[ASYNC] = options && !!options.async || false;
                this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
                this[EOF] = false;
                this[EMITTED_END] = false;
                this[EMITTING_END] = false;
                this[CLOSED] = false;
                this[EMITTED_ERROR] = null;
                this.writable = true;
                this.readable = true;
                this[BUFFERLENGTH] = 0;
                this[DESTROYED] = false;
            }
            get bufferLength() {
                return this[BUFFERLENGTH];
            }
            get encoding() {
                return this[ENCODING];
            }
            set encoding(enc) {
                if (this[OBJECTMODE]) throw new Error("cannot set encoding in objectMode");
                if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH])) throw new Error("cannot change encoding");
                if (this[ENCODING] !== enc) {
                    this[DECODER] = enc ? new SD(enc) : null;
                    if (this.buffer.length) this.buffer = this.buffer.map(chunk => this[DECODER].write(chunk));
                }
                this[ENCODING] = enc;
            }
            setEncoding(enc) {
                this.encoding = enc;
            }
            get objectMode() {
                return this[OBJECTMODE];
            }
            set objectMode(om) {
                this[OBJECTMODE] = this[OBJECTMODE] || !!om;
            }
            get ["async"]() {
                return this[ASYNC];
            }
            set ["async"](a) {
                this[ASYNC] = this[ASYNC] || !!a;
            }
            write(chunk, encoding, cb) {
                if (this[EOF]) throw new Error("write after end");
                if (this[DESTROYED]) {
                    this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), {
                        code: "ERR_STREAM_DESTROYED"
                    }));
                    return true;
                }
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (!encoding) encoding = "utf8";
                const fn = this[ASYNC] ? defer : f => f();
                if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
                    if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength); else if (isArrayBuffer(chunk)) chunk = Buffer.from(chunk); else if (typeof chunk !== "string") this.objectMode = true;
                }
                if (this[OBJECTMODE]) {
                    if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                    if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (!chunk.length) {
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
                    chunk = Buffer.from(chunk, encoding);
                }
                if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);
                if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                if (cb) fn(cb);
                return this.flowing;
            }
            read(n) {
                if (this[DESTROYED]) return null;
                if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
                    this[MAYBE_EMIT_END]();
                    return null;
                }
                if (this[OBJECTMODE]) n = null;
                if (this.buffer.length > 1 && !this[OBJECTMODE]) {
                    if (this.encoding) this.buffer = [ this.buffer.join("") ]; else this.buffer = [ Buffer.concat(this.buffer, this[BUFFERLENGTH]) ];
                }
                const ret = this[READ](n || null, this.buffer[0]);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [READ](n, chunk) {
                if (n === chunk.length || n === null) this[BUFFERSHIFT](); else {
                    this.buffer[0] = chunk.slice(n);
                    chunk = chunk.slice(0, n);
                    this[BUFFERLENGTH] -= n;
                }
                this.emit("data", chunk);
                if (!this.buffer.length && !this[EOF]) this.emit("drain");
                return chunk;
            }
            end(chunk, encoding, cb) {
                if (typeof chunk === "function") cb = chunk, chunk = null;
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (chunk) this.write(chunk, encoding);
                if (cb) this.once("end", cb);
                this[EOF] = true;
                this.writable = false;
                if (this.flowing || !this[PAUSED]) this[MAYBE_EMIT_END]();
                return this;
            }
            [RESUME]() {
                if (this[DESTROYED]) return;
                this[PAUSED] = false;
                this[FLOWING] = true;
                this.emit("resume");
                if (this.buffer.length) this[FLUSH](); else if (this[EOF]) this[MAYBE_EMIT_END](); else this.emit("drain");
            }
            resume() {
                return this[RESUME]();
            }
            pause() {
                this[FLOWING] = false;
                this[PAUSED] = true;
            }
            get destroyed() {
                return this[DESTROYED];
            }
            get flowing() {
                return this[FLOWING];
            }
            get paused() {
                return this[PAUSED];
            }
            [BUFFERPUSH](chunk) {
                if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1; else this[BUFFERLENGTH] += chunk.length;
                this.buffer.push(chunk);
            }
            [BUFFERSHIFT]() {
                if (this.buffer.length) {
                    if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1; else this[BUFFERLENGTH] -= this.buffer[0].length;
                }
                return this.buffer.shift();
            }
            [FLUSH](noDrain) {
                do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
                if (!noDrain && !this.buffer.length && !this[EOF]) this.emit("drain");
            }
            [FLUSHCHUNK](chunk) {
                return chunk ? (this.emit("data", chunk), this.flowing) : false;
            }
            pipe(dest, opts) {
                if (this[DESTROYED]) return;
                const ended = this[EMITTED_END];
                opts = opts || {};
                if (dest === proc.stdout || dest === proc.stderr) opts.end = false; else opts.end = opts.end !== false;
                opts.proxyErrors = !!opts.proxyErrors;
                if (ended) {
                    if (opts.end) dest.end();
                } else {
                    this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
                    if (this[ASYNC]) defer(() => this[RESUME]()); else this[RESUME]();
                }
                return dest;
            }
            unpipe(dest) {
                const p = this.pipes.find(p => p.dest === dest);
                if (p) {
                    this.pipes.splice(this.pipes.indexOf(p), 1);
                    p.unpipe();
                }
            }
            addListener(ev, fn) {
                return this.on(ev, fn);
            }
            on(ev, fn) {
                const ret = super.on(ev, fn);
                if (ev === "data" && !this.pipes.length && !this.flowing) this[RESUME](); else if (ev === "readable" && this[BUFFERLENGTH] !== 0) super.emit("readable"); else if (isEndish(ev) && this[EMITTED_END]) {
                    super.emit(ev);
                    this.removeAllListeners(ev);
                } else if (ev === "error" && this[EMITTED_ERROR]) {
                    if (this[ASYNC]) defer(() => fn.call(this, this[EMITTED_ERROR])); else fn.call(this, this[EMITTED_ERROR]);
                }
                return ret;
            }
            get emittedEnd() {
                return this[EMITTED_END];
            }
            [MAYBE_EMIT_END]() {
                if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
                    this[EMITTING_END] = true;
                    this.emit("end");
                    this.emit("prefinish");
                    this.emit("finish");
                    if (this[CLOSED]) this.emit("close");
                    this[EMITTING_END] = false;
                }
            }
            emit(ev, data, ...extra) {
                if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) return; else if (ev === "data") {
                    return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
                } else if (ev === "end") {
                    return this[EMITEND]();
                } else if (ev === "close") {
                    this[CLOSED] = true;
                    if (!this[EMITTED_END] && !this[DESTROYED]) return;
                    const ret = super.emit("close");
                    this.removeAllListeners("close");
                    return ret;
                } else if (ev === "error") {
                    this[EMITTED_ERROR] = data;
                    const ret = super.emit("error", data);
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "resume") {
                    const ret = super.emit("resume");
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "finish" || ev === "prefinish") {
                    const ret = super.emit(ev);
                    this.removeAllListeners(ev);
                    return ret;
                }
                const ret = super.emit(ev, data, ...extra);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITDATA](data) {
                for (const p of this.pipes) {
                    if (p.dest.write(data) === false) this.pause();
                }
                const ret = super.emit("data", data);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITEND]() {
                if (this[EMITTED_END]) return;
                this[EMITTED_END] = true;
                this.readable = false;
                if (this[ASYNC]) defer(() => this[EMITEND2]()); else this[EMITEND2]();
            }
            [EMITEND2]() {
                if (this[DECODER]) {
                    const data = this[DECODER].end();
                    if (data) {
                        for (const p of this.pipes) {
                            p.dest.write(data);
                        }
                        super.emit("data", data);
                    }
                }
                for (const p of this.pipes) {
                    p.end();
                }
                const ret = super.emit("end");
                this.removeAllListeners("end");
                return ret;
            }
            collect() {
                const buf = [];
                if (!this[OBJECTMODE]) buf.dataLength = 0;
                const p = this.promise();
                this.on("data", c => {
                    buf.push(c);
                    if (!this[OBJECTMODE]) buf.dataLength += c.length;
                });
                return p.then(() => buf);
            }
            concat() {
                return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then(buf => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
            }
            promise() {
                return new Promise((resolve, reject) => {
                    this.on(DESTROYED, () => reject(new Error("stream destroyed")));
                    this.on("error", er => reject(er));
                    this.on("end", () => resolve());
                });
            }
            [ASYNCITERATOR]() {
                const next = () => {
                    const res = this.read();
                    if (res !== null) return Promise.resolve({
                        done: false,
                        value: res
                    });
                    if (this[EOF]) return Promise.resolve({
                        done: true
                    });
                    let resolve = null;
                    let reject = null;
                    const onerr = er => {
                        this.removeListener("data", ondata);
                        this.removeListener("end", onend);
                        reject(er);
                    };
                    const ondata = value => {
                        this.removeListener("error", onerr);
                        this.removeListener("end", onend);
                        this.pause();
                        resolve({
                            value,
                            done: !!this[EOF]
                        });
                    };
                    const onend = () => {
                        this.removeListener("error", onerr);
                        this.removeListener("data", ondata);
                        resolve({
                            done: true
                        });
                    };
                    const ondestroy = () => onerr(new Error("stream destroyed"));
                    return new Promise((res, rej) => {
                        reject = rej;
                        resolve = res;
                        this.once(DESTROYED, ondestroy);
                        this.once("error", onerr);
                        this.once("end", onend);
                        this.once("data", ondata);
                    });
                };
                return {
                    next
                };
            }
            [ITERATOR]() {
                const next = () => {
                    const value = this.read();
                    const done = value === null;
                    return {
                        value,
                        done
                    };
                };
                return {
                    next
                };
            }
            destroy(er) {
                if (this[DESTROYED]) {
                    if (er) this.emit("error", er); else this.emit(DESTROYED);
                    return this;
                }
                this[DESTROYED] = true;
                this.buffer.length = 0;
                this[BUFFERLENGTH] = 0;
                if (typeof this.close === "function" && !this[CLOSED]) this.close();
                if (er) this.emit("error", er); else this.emit(DESTROYED);
                return this;
            }
            static isStream(s) {
                return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
            }
        };
    },
    8769(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        const proc = typeof process === "object" && process ? process : {
            stdout: null,
            stderr: null
        };
        const EE = __webpack_require__(4434);
        const Stream = __webpack_require__(2203);
        const stringdecoder = __webpack_require__(3193);
        const SD = stringdecoder.StringDecoder;
        const EOF = Symbol("EOF");
        const MAYBE_EMIT_END = Symbol("maybeEmitEnd");
        const EMITTED_END = Symbol("emittedEnd");
        const EMITTING_END = Symbol("emittingEnd");
        const EMITTED_ERROR = Symbol("emittedError");
        const CLOSED = Symbol("closed");
        const READ = Symbol("read");
        const FLUSH = Symbol("flush");
        const FLUSHCHUNK = Symbol("flushChunk");
        const ENCODING = Symbol("encoding");
        const DECODER = Symbol("decoder");
        const FLOWING = Symbol("flowing");
        const PAUSED = Symbol("paused");
        const RESUME = Symbol("resume");
        const BUFFER = Symbol("buffer");
        const PIPES = Symbol("pipes");
        const BUFFERLENGTH = Symbol("bufferLength");
        const BUFFERPUSH = Symbol("bufferPush");
        const BUFFERSHIFT = Symbol("bufferShift");
        const OBJECTMODE = Symbol("objectMode");
        const DESTROYED = Symbol("destroyed");
        const ERROR = Symbol("error");
        const EMITDATA = Symbol("emitData");
        const EMITEND = Symbol("emitEnd");
        const EMITEND2 = Symbol("emitEnd2");
        const ASYNC = Symbol("async");
        const ABORT = Symbol("abort");
        const ABORTED = Symbol("aborted");
        const SIGNAL = Symbol("signal");
        const defer = fn => Promise.resolve().then(fn);
        const doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
        const ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
        const ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
        const isEndish = ev => ev === "end" || ev === "finish" || ev === "prefinish";
        const isArrayBuffer = b => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
        const isArrayBufferView = b => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
        class Pipe {
            constructor(src, dest, opts) {
                this.src = src;
                this.dest = dest;
                this.opts = opts;
                this.ondrain = () => src[RESUME]();
                dest.on("drain", this.ondrain);
            }
            unpipe() {
                this.dest.removeListener("drain", this.ondrain);
            }
            proxyErrors() {}
            end() {
                this.unpipe();
                if (this.opts.end) this.dest.end();
            }
        }
        class PipeProxyErrors extends Pipe {
            unpipe() {
                this.src.removeListener("error", this.proxyErrors);
                super.unpipe();
            }
            constructor(src, dest, opts) {
                super(src, dest, opts);
                this.proxyErrors = er => dest.emit("error", er);
                src.on("error", this.proxyErrors);
            }
        }
        class Minipass extends Stream {
            constructor(options) {
                super();
                this[FLOWING] = false;
                this[PAUSED] = false;
                this[PIPES] = [];
                this[BUFFER] = [];
                this[OBJECTMODE] = options && options.objectMode || false;
                if (this[OBJECTMODE]) this[ENCODING] = null; else this[ENCODING] = options && options.encoding || null;
                if (this[ENCODING] === "buffer") this[ENCODING] = null;
                this[ASYNC] = options && !!options.async || false;
                this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
                this[EOF] = false;
                this[EMITTED_END] = false;
                this[EMITTING_END] = false;
                this[CLOSED] = false;
                this[EMITTED_ERROR] = null;
                this.writable = true;
                this.readable = true;
                this[BUFFERLENGTH] = 0;
                this[DESTROYED] = false;
                if (options && options.debugExposeBuffer === true) {
                    Object.defineProperty(this, "buffer", {
                        get: () => this[BUFFER]
                    });
                }
                if (options && options.debugExposePipes === true) {
                    Object.defineProperty(this, "pipes", {
                        get: () => this[PIPES]
                    });
                }
                this[SIGNAL] = options && options.signal;
                this[ABORTED] = false;
                if (this[SIGNAL]) {
                    this[SIGNAL].addEventListener("abort", () => this[ABORT]());
                    if (this[SIGNAL].aborted) {
                        this[ABORT]();
                    }
                }
            }
            get bufferLength() {
                return this[BUFFERLENGTH];
            }
            get encoding() {
                return this[ENCODING];
            }
            set encoding(enc) {
                if (this[OBJECTMODE]) throw new Error("cannot set encoding in objectMode");
                if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH])) throw new Error("cannot change encoding");
                if (this[ENCODING] !== enc) {
                    this[DECODER] = enc ? new SD(enc) : null;
                    if (this[BUFFER].length) this[BUFFER] = this[BUFFER].map(chunk => this[DECODER].write(chunk));
                }
                this[ENCODING] = enc;
            }
            setEncoding(enc) {
                this.encoding = enc;
            }
            get objectMode() {
                return this[OBJECTMODE];
            }
            set objectMode(om) {
                this[OBJECTMODE] = this[OBJECTMODE] || !!om;
            }
            get ["async"]() {
                return this[ASYNC];
            }
            set ["async"](a) {
                this[ASYNC] = this[ASYNC] || !!a;
            }
            [ABORT]() {
                this[ABORTED] = true;
                this.emit("abort", this[SIGNAL].reason);
                this.destroy(this[SIGNAL].reason);
            }
            get aborted() {
                return this[ABORTED];
            }
            set aborted(_) {}
            write(chunk, encoding, cb) {
                if (this[ABORTED]) return false;
                if (this[EOF]) throw new Error("write after end");
                if (this[DESTROYED]) {
                    this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), {
                        code: "ERR_STREAM_DESTROYED"
                    }));
                    return true;
                }
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (!encoding) encoding = "utf8";
                const fn = this[ASYNC] ? defer : f => f();
                if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
                    if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength); else if (isArrayBuffer(chunk)) chunk = Buffer.from(chunk); else if (typeof chunk !== "string") this.objectMode = true;
                }
                if (this[OBJECTMODE]) {
                    if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                    if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (!chunk.length) {
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
                    chunk = Buffer.from(chunk, encoding);
                }
                if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);
                if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                if (cb) fn(cb);
                return this.flowing;
            }
            read(n) {
                if (this[DESTROYED]) return null;
                if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
                    this[MAYBE_EMIT_END]();
                    return null;
                }
                if (this[OBJECTMODE]) n = null;
                if (this[BUFFER].length > 1 && !this[OBJECTMODE]) {
                    if (this.encoding) this[BUFFER] = [ this[BUFFER].join("") ]; else this[BUFFER] = [ Buffer.concat(this[BUFFER], this[BUFFERLENGTH]) ];
                }
                const ret = this[READ](n || null, this[BUFFER][0]);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [READ](n, chunk) {
                if (n === chunk.length || n === null) this[BUFFERSHIFT](); else {
                    this[BUFFER][0] = chunk.slice(n);
                    chunk = chunk.slice(0, n);
                    this[BUFFERLENGTH] -= n;
                }
                this.emit("data", chunk);
                if (!this[BUFFER].length && !this[EOF]) this.emit("drain");
                return chunk;
            }
            end(chunk, encoding, cb) {
                if (typeof chunk === "function") cb = chunk, chunk = null;
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (chunk) this.write(chunk, encoding);
                if (cb) this.once("end", cb);
                this[EOF] = true;
                this.writable = false;
                if (this.flowing || !this[PAUSED]) this[MAYBE_EMIT_END]();
                return this;
            }
            [RESUME]() {
                if (this[DESTROYED]) return;
                this[PAUSED] = false;
                this[FLOWING] = true;
                this.emit("resume");
                if (this[BUFFER].length) this[FLUSH](); else if (this[EOF]) this[MAYBE_EMIT_END](); else this.emit("drain");
            }
            resume() {
                return this[RESUME]();
            }
            pause() {
                this[FLOWING] = false;
                this[PAUSED] = true;
            }
            get destroyed() {
                return this[DESTROYED];
            }
            get flowing() {
                return this[FLOWING];
            }
            get paused() {
                return this[PAUSED];
            }
            [BUFFERPUSH](chunk) {
                if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1; else this[BUFFERLENGTH] += chunk.length;
                this[BUFFER].push(chunk);
            }
            [BUFFERSHIFT]() {
                if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1; else this[BUFFERLENGTH] -= this[BUFFER][0].length;
                return this[BUFFER].shift();
            }
            [FLUSH](noDrain) {
                do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()) && this[BUFFER].length);
                if (!noDrain && !this[BUFFER].length && !this[EOF]) this.emit("drain");
            }
            [FLUSHCHUNK](chunk) {
                this.emit("data", chunk);
                return this.flowing;
            }
            pipe(dest, opts) {
                if (this[DESTROYED]) return;
                const ended = this[EMITTED_END];
                opts = opts || {};
                if (dest === proc.stdout || dest === proc.stderr) opts.end = false; else opts.end = opts.end !== false;
                opts.proxyErrors = !!opts.proxyErrors;
                if (ended) {
                    if (opts.end) dest.end();
                } else {
                    this[PIPES].push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
                    if (this[ASYNC]) defer(() => this[RESUME]()); else this[RESUME]();
                }
                return dest;
            }
            unpipe(dest) {
                const p = this[PIPES].find(p => p.dest === dest);
                if (p) {
                    this[PIPES].splice(this[PIPES].indexOf(p), 1);
                    p.unpipe();
                }
            }
            addListener(ev, fn) {
                return this.on(ev, fn);
            }
            on(ev, fn) {
                const ret = super.on(ev, fn);
                if (ev === "data" && !this[PIPES].length && !this.flowing) this[RESUME](); else if (ev === "readable" && this[BUFFERLENGTH] !== 0) super.emit("readable"); else if (isEndish(ev) && this[EMITTED_END]) {
                    super.emit(ev);
                    this.removeAllListeners(ev);
                } else if (ev === "error" && this[EMITTED_ERROR]) {
                    if (this[ASYNC]) defer(() => fn.call(this, this[EMITTED_ERROR])); else fn.call(this, this[EMITTED_ERROR]);
                }
                return ret;
            }
            get emittedEnd() {
                return this[EMITTED_END];
            }
            [MAYBE_EMIT_END]() {
                if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this[BUFFER].length === 0 && this[EOF]) {
                    this[EMITTING_END] = true;
                    this.emit("end");
                    this.emit("prefinish");
                    this.emit("finish");
                    if (this[CLOSED]) this.emit("close");
                    this[EMITTING_END] = false;
                }
            }
            emit(ev, data, ...extra) {
                if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) return; else if (ev === "data") {
                    return !this[OBJECTMODE] && !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
                } else if (ev === "end") {
                    return this[EMITEND]();
                } else if (ev === "close") {
                    this[CLOSED] = true;
                    if (!this[EMITTED_END] && !this[DESTROYED]) return;
                    const ret = super.emit("close");
                    this.removeAllListeners("close");
                    return ret;
                } else if (ev === "error") {
                    this[EMITTED_ERROR] = data;
                    super.emit(ERROR, data);
                    const ret = !this[SIGNAL] || this.listeners("error").length ? super.emit("error", data) : false;
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "resume") {
                    const ret = super.emit("resume");
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "finish" || ev === "prefinish") {
                    const ret = super.emit(ev);
                    this.removeAllListeners(ev);
                    return ret;
                }
                const ret = super.emit(ev, data, ...extra);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITDATA](data) {
                for (const p of this[PIPES]) {
                    if (p.dest.write(data) === false) this.pause();
                }
                const ret = super.emit("data", data);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITEND]() {
                if (this[EMITTED_END]) return;
                this[EMITTED_END] = true;
                this.readable = false;
                if (this[ASYNC]) defer(() => this[EMITEND2]()); else this[EMITEND2]();
            }
            [EMITEND2]() {
                if (this[DECODER]) {
                    const data = this[DECODER].end();
                    if (data) {
                        for (const p of this[PIPES]) {
                            p.dest.write(data);
                        }
                        super.emit("data", data);
                    }
                }
                for (const p of this[PIPES]) {
                    p.end();
                }
                const ret = super.emit("end");
                this.removeAllListeners("end");
                return ret;
            }
            collect() {
                const buf = [];
                if (!this[OBJECTMODE]) buf.dataLength = 0;
                const p = this.promise();
                this.on("data", c => {
                    buf.push(c);
                    if (!this[OBJECTMODE]) buf.dataLength += c.length;
                });
                return p.then(() => buf);
            }
            concat() {
                return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then(buf => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
            }
            promise() {
                return new Promise((resolve, reject) => {
                    this.on(DESTROYED, () => reject(new Error("stream destroyed")));
                    this.on("error", er => reject(er));
                    this.on("end", () => resolve());
                });
            }
            [ASYNCITERATOR]() {
                let stopped = false;
                const stop = () => {
                    this.pause();
                    stopped = true;
                    return Promise.resolve({
                        done: true
                    });
                };
                const next = () => {
                    if (stopped) return stop();
                    const res = this.read();
                    if (res !== null) return Promise.resolve({
                        done: false,
                        value: res
                    });
                    if (this[EOF]) return stop();
                    let resolve = null;
                    let reject = null;
                    const onerr = er => {
                        this.removeListener("data", ondata);
                        this.removeListener("end", onend);
                        this.removeListener(DESTROYED, ondestroy);
                        stop();
                        reject(er);
                    };
                    const ondata = value => {
                        this.removeListener("error", onerr);
                        this.removeListener("end", onend);
                        this.removeListener(DESTROYED, ondestroy);
                        this.pause();
                        resolve({
                            value,
                            done: !!this[EOF]
                        });
                    };
                    const onend = () => {
                        this.removeListener("error", onerr);
                        this.removeListener("data", ondata);
                        this.removeListener(DESTROYED, ondestroy);
                        stop();
                        resolve({
                            done: true
                        });
                    };
                    const ondestroy = () => onerr(new Error("stream destroyed"));
                    return new Promise((res, rej) => {
                        reject = rej;
                        resolve = res;
                        this.once(DESTROYED, ondestroy);
                        this.once("error", onerr);
                        this.once("end", onend);
                        this.once("data", ondata);
                    });
                };
                return {
                    next,
                    throw: stop,
                    return: stop,
                    [ASYNCITERATOR]() {
                        return this;
                    }
                };
            }
            [ITERATOR]() {
                let stopped = false;
                const stop = () => {
                    this.pause();
                    this.removeListener(ERROR, stop);
                    this.removeListener(DESTROYED, stop);
                    this.removeListener("end", stop);
                    stopped = true;
                    return {
                        done: true
                    };
                };
                const next = () => {
                    if (stopped) return stop();
                    const value = this.read();
                    return value === null ? stop() : {
                        value
                    };
                };
                this.once("end", stop);
                this.once(ERROR, stop);
                this.once(DESTROYED, stop);
                return {
                    next,
                    throw: stop,
                    return: stop,
                    [ITERATOR]() {
                        return this;
                    }
                };
            }
            destroy(er) {
                if (this[DESTROYED]) {
                    if (er) this.emit("error", er); else this.emit(DESTROYED);
                    return this;
                }
                this[DESTROYED] = true;
                this[BUFFER].length = 0;
                this[BUFFERLENGTH] = 0;
                if (typeof this.close === "function" && !this[CLOSED]) this.close();
                if (er) this.emit("error", er); else this.emit(DESTROYED);
                return this;
            }
            static isStream(s) {
                return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
            }
        }
        exports.Minipass = Minipass;
    },
    5932(module, __unused_webpack_exports, __webpack_require__) {
        const realZlibConstants = __webpack_require__(3106).constants || {
            ZLIB_VERNUM: 4736
        };
        module.exports = Object.freeze(Object.assign(Object.create(null), {
            Z_NO_FLUSH: 0,
            Z_PARTIAL_FLUSH: 1,
            Z_SYNC_FLUSH: 2,
            Z_FULL_FLUSH: 3,
            Z_FINISH: 4,
            Z_BLOCK: 5,
            Z_OK: 0,
            Z_STREAM_END: 1,
            Z_NEED_DICT: 2,
            Z_ERRNO: -1,
            Z_STREAM_ERROR: -2,
            Z_DATA_ERROR: -3,
            Z_MEM_ERROR: -4,
            Z_BUF_ERROR: -5,
            Z_VERSION_ERROR: -6,
            Z_NO_COMPRESSION: 0,
            Z_BEST_SPEED: 1,
            Z_BEST_COMPRESSION: 9,
            Z_DEFAULT_COMPRESSION: -1,
            Z_FILTERED: 1,
            Z_HUFFMAN_ONLY: 2,
            Z_RLE: 3,
            Z_FIXED: 4,
            Z_DEFAULT_STRATEGY: 0,
            DEFLATE: 1,
            INFLATE: 2,
            GZIP: 3,
            GUNZIP: 4,
            DEFLATERAW: 5,
            INFLATERAW: 6,
            UNZIP: 7,
            BROTLI_DECODE: 8,
            BROTLI_ENCODE: 9,
            Z_MIN_WINDOWBITS: 8,
            Z_MAX_WINDOWBITS: 15,
            Z_DEFAULT_WINDOWBITS: 15,
            Z_MIN_CHUNK: 64,
            Z_MAX_CHUNK: Infinity,
            Z_DEFAULT_CHUNK: 16384,
            Z_MIN_MEMLEVEL: 1,
            Z_MAX_MEMLEVEL: 9,
            Z_DEFAULT_MEMLEVEL: 8,
            Z_MIN_LEVEL: -1,
            Z_MAX_LEVEL: 9,
            Z_DEFAULT_LEVEL: -1,
            BROTLI_OPERATION_PROCESS: 0,
            BROTLI_OPERATION_FLUSH: 1,
            BROTLI_OPERATION_FINISH: 2,
            BROTLI_OPERATION_EMIT_METADATA: 3,
            BROTLI_MODE_GENERIC: 0,
            BROTLI_MODE_TEXT: 1,
            BROTLI_MODE_FONT: 2,
            BROTLI_DEFAULT_MODE: 0,
            BROTLI_MIN_QUALITY: 0,
            BROTLI_MAX_QUALITY: 11,
            BROTLI_DEFAULT_QUALITY: 11,
            BROTLI_MIN_WINDOW_BITS: 10,
            BROTLI_MAX_WINDOW_BITS: 24,
            BROTLI_LARGE_MAX_WINDOW_BITS: 30,
            BROTLI_DEFAULT_WINDOW: 22,
            BROTLI_MIN_INPUT_BLOCK_BITS: 16,
            BROTLI_MAX_INPUT_BLOCK_BITS: 24,
            BROTLI_PARAM_MODE: 0,
            BROTLI_PARAM_QUALITY: 1,
            BROTLI_PARAM_LGWIN: 2,
            BROTLI_PARAM_LGBLOCK: 3,
            BROTLI_PARAM_DISABLE_LITERAL_CONTEXT_MODELING: 4,
            BROTLI_PARAM_SIZE_HINT: 5,
            BROTLI_PARAM_LARGE_WINDOW: 6,
            BROTLI_PARAM_NPOSTFIX: 7,
            BROTLI_PARAM_NDIRECT: 8,
            BROTLI_DECODER_RESULT_ERROR: 0,
            BROTLI_DECODER_RESULT_SUCCESS: 1,
            BROTLI_DECODER_RESULT_NEEDS_MORE_INPUT: 2,
            BROTLI_DECODER_RESULT_NEEDS_MORE_OUTPUT: 3,
            BROTLI_DECODER_PARAM_DISABLE_RING_BUFFER_REALLOCATION: 0,
            BROTLI_DECODER_PARAM_LARGE_WINDOW: 1,
            BROTLI_DECODER_NO_ERROR: 0,
            BROTLI_DECODER_SUCCESS: 1,
            BROTLI_DECODER_NEEDS_MORE_INPUT: 2,
            BROTLI_DECODER_NEEDS_MORE_OUTPUT: 3,
            BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_NIBBLE: -1,
            BROTLI_DECODER_ERROR_FORMAT_RESERVED: -2,
            BROTLI_DECODER_ERROR_FORMAT_EXUBERANT_META_NIBBLE: -3,
            BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_ALPHABET: -4,
            BROTLI_DECODER_ERROR_FORMAT_SIMPLE_HUFFMAN_SAME: -5,
            BROTLI_DECODER_ERROR_FORMAT_CL_SPACE: -6,
            BROTLI_DECODER_ERROR_FORMAT_HUFFMAN_SPACE: -7,
            BROTLI_DECODER_ERROR_FORMAT_CONTEXT_MAP_REPEAT: -8,
            BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_1: -9,
            BROTLI_DECODER_ERROR_FORMAT_BLOCK_LENGTH_2: -10,
            BROTLI_DECODER_ERROR_FORMAT_TRANSFORM: -11,
            BROTLI_DECODER_ERROR_FORMAT_DICTIONARY: -12,
            BROTLI_DECODER_ERROR_FORMAT_WINDOW_BITS: -13,
            BROTLI_DECODER_ERROR_FORMAT_PADDING_1: -14,
            BROTLI_DECODER_ERROR_FORMAT_PADDING_2: -15,
            BROTLI_DECODER_ERROR_FORMAT_DISTANCE: -16,
            BROTLI_DECODER_ERROR_DICTIONARY_NOT_SET: -19,
            BROTLI_DECODER_ERROR_INVALID_ARGUMENTS: -20,
            BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MODES: -21,
            BROTLI_DECODER_ERROR_ALLOC_TREE_GROUPS: -22,
            BROTLI_DECODER_ERROR_ALLOC_CONTEXT_MAP: -25,
            BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_1: -26,
            BROTLI_DECODER_ERROR_ALLOC_RING_BUFFER_2: -27,
            BROTLI_DECODER_ERROR_ALLOC_BLOCK_TYPE_TREES: -30,
            BROTLI_DECODER_ERROR_UNREACHABLE: -31
        }, realZlibConstants));
    },
    853(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        const assert = __webpack_require__(2613);
        const Buffer = __webpack_require__(181).Buffer;
        const realZlib = __webpack_require__(3106);
        const constants = exports.constants = __webpack_require__(5932);
        const Minipass = __webpack_require__(7087);
        const OriginalBufferConcat = Buffer.concat;
        const _superWrite = Symbol("_superWrite");
        class ZlibError extends Error {
            constructor(err) {
                super("zlib: " + err.message);
                this.code = err.code;
                this.errno = err.errno;
                if (!this.code) this.code = "ZLIB_ERROR";
                this.message = "zlib: " + err.message;
                Error.captureStackTrace(this, this.constructor);
            }
            get name() {
                return "ZlibError";
            }
        }
        const _opts = Symbol("opts");
        const _flushFlag = Symbol("flushFlag");
        const _finishFlushFlag = Symbol("finishFlushFlag");
        const _fullFlushFlag = Symbol("fullFlushFlag");
        const _handle = Symbol("handle");
        const _onError = Symbol("onError");
        const _sawError = Symbol("sawError");
        const _level = Symbol("level");
        const _strategy = Symbol("strategy");
        const _ended = Symbol("ended");
        const _defaultFullFlush = Symbol("_defaultFullFlush");
        class ZlibBase extends Minipass {
            constructor(opts, mode) {
                if (!opts || typeof opts !== "object") throw new TypeError("invalid options for ZlibBase constructor");
                super(opts);
                this[_sawError] = false;
                this[_ended] = false;
                this[_opts] = opts;
                this[_flushFlag] = opts.flush;
                this[_finishFlushFlag] = opts.finishFlush;
                try {
                    this[_handle] = new realZlib[mode](opts);
                } catch (er) {
                    throw new ZlibError(er);
                }
                this[_onError] = err => {
                    if (this[_sawError]) return;
                    this[_sawError] = true;
                    this.close();
                    this.emit("error", err);
                };
                this[_handle].on("error", er => this[_onError](new ZlibError(er)));
                this.once("end", () => this.close);
            }
            close() {
                if (this[_handle]) {
                    this[_handle].close();
                    this[_handle] = null;
                    this.emit("close");
                }
            }
            reset() {
                if (!this[_sawError]) {
                    assert(this[_handle], "zlib binding closed");
                    return this[_handle].reset();
                }
            }
            flush(flushFlag) {
                if (this.ended) return;
                if (typeof flushFlag !== "number") flushFlag = this[_fullFlushFlag];
                this.write(Object.assign(Buffer.alloc(0), {
                    [_flushFlag]: flushFlag
                }));
            }
            end(chunk, encoding, cb) {
                if (chunk) this.write(chunk, encoding);
                this.flush(this[_finishFlushFlag]);
                this[_ended] = true;
                return super.end(null, null, cb);
            }
            get ended() {
                return this[_ended];
            }
            write(chunk, encoding, cb) {
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (typeof chunk === "string") chunk = Buffer.from(chunk, encoding);
                if (this[_sawError]) return;
                assert(this[_handle], "zlib binding closed");
                const nativeHandle = this[_handle]._handle;
                const originalNativeClose = nativeHandle.close;
                nativeHandle.close = () => {};
                const originalClose = this[_handle].close;
                this[_handle].close = () => {};
                Buffer.concat = args => args;
                let result;
                try {
                    const flushFlag = typeof chunk[_flushFlag] === "number" ? chunk[_flushFlag] : this[_flushFlag];
                    result = this[_handle]._processChunk(chunk, flushFlag);
                    Buffer.concat = OriginalBufferConcat;
                } catch (err) {
                    Buffer.concat = OriginalBufferConcat;
                    this[_onError](new ZlibError(err));
                } finally {
                    if (this[_handle]) {
                        this[_handle]._handle = nativeHandle;
                        nativeHandle.close = originalNativeClose;
                        this[_handle].close = originalClose;
                        this[_handle].removeAllListeners("error");
                    }
                }
                if (this[_handle]) this[_handle].on("error", er => this[_onError](new ZlibError(er)));
                let writeReturn;
                if (result) {
                    if (Array.isArray(result) && result.length > 0) {
                        writeReturn = this[_superWrite](Buffer.from(result[0]));
                        for (let i = 1; i < result.length; i++) {
                            writeReturn = this[_superWrite](result[i]);
                        }
                    } else {
                        writeReturn = this[_superWrite](Buffer.from(result));
                    }
                }
                if (cb) cb();
                return writeReturn;
            }
            [_superWrite](data) {
                return super.write(data);
            }
        }
        class Zlib extends ZlibBase {
            constructor(opts, mode) {
                opts = opts || {};
                opts.flush = opts.flush || constants.Z_NO_FLUSH;
                opts.finishFlush = opts.finishFlush || constants.Z_FINISH;
                super(opts, mode);
                this[_fullFlushFlag] = constants.Z_FULL_FLUSH;
                this[_level] = opts.level;
                this[_strategy] = opts.strategy;
            }
            params(level, strategy) {
                if (this[_sawError]) return;
                if (!this[_handle]) throw new Error("cannot switch params when binding is closed");
                if (!this[_handle].params) throw new Error("not supported in this implementation");
                if (this[_level] !== level || this[_strategy] !== strategy) {
                    this.flush(constants.Z_SYNC_FLUSH);
                    assert(this[_handle], "zlib binding closed");
                    const origFlush = this[_handle].flush;
                    this[_handle].flush = (flushFlag, cb) => {
                        this.flush(flushFlag);
                        cb();
                    };
                    try {
                        this[_handle].params(level, strategy);
                    } finally {
                        this[_handle].flush = origFlush;
                    }
                    if (this[_handle]) {
                        this[_level] = level;
                        this[_strategy] = strategy;
                    }
                }
            }
        }
        class Deflate extends Zlib {
            constructor(opts) {
                super(opts, "Deflate");
            }
        }
        class Inflate extends Zlib {
            constructor(opts) {
                super(opts, "Inflate");
            }
        }
        const _portable = Symbol("_portable");
        class Gzip extends Zlib {
            constructor(opts) {
                super(opts, "Gzip");
                this[_portable] = opts && !!opts.portable;
            }
            [_superWrite](data) {
                if (!this[_portable]) return super[_superWrite](data);
                this[_portable] = false;
                data[9] = 255;
                return super[_superWrite](data);
            }
        }
        class Gunzip extends Zlib {
            constructor(opts) {
                super(opts, "Gunzip");
            }
        }
        class DeflateRaw extends Zlib {
            constructor(opts) {
                super(opts, "DeflateRaw");
            }
        }
        class InflateRaw extends Zlib {
            constructor(opts) {
                super(opts, "InflateRaw");
            }
        }
        class Unzip extends Zlib {
            constructor(opts) {
                super(opts, "Unzip");
            }
        }
        class Brotli extends ZlibBase {
            constructor(opts, mode) {
                opts = opts || {};
                opts.flush = opts.flush || constants.BROTLI_OPERATION_PROCESS;
                opts.finishFlush = opts.finishFlush || constants.BROTLI_OPERATION_FINISH;
                super(opts, mode);
                this[_fullFlushFlag] = constants.BROTLI_OPERATION_FLUSH;
            }
        }
        class BrotliCompress extends Brotli {
            constructor(opts) {
                super(opts, "BrotliCompress");
            }
        }
        class BrotliDecompress extends Brotli {
            constructor(opts) {
                super(opts, "BrotliDecompress");
            }
        }
        exports.Deflate = Deflate;
        exports.Inflate = Inflate;
        exports.Gzip = Gzip;
        exports.Gunzip = Gunzip;
        exports.DeflateRaw = DeflateRaw;
        exports.InflateRaw = InflateRaw;
        exports.Unzip = Unzip;
        if (typeof realZlib.BrotliCompress === "function") {
            exports.BrotliCompress = BrotliCompress;
            exports.BrotliDecompress = BrotliDecompress;
        } else {
            exports.BrotliCompress = exports.BrotliDecompress = class {
                constructor() {
                    throw new Error("Brotli is not supported in this version of Node.js");
                }
            };
        }
    },
    7087(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const proc = typeof process === "object" && process ? process : {
            stdout: null,
            stderr: null
        };
        const EE = __webpack_require__(4434);
        const Stream = __webpack_require__(2203);
        const SD = __webpack_require__(3193).StringDecoder;
        const EOF = Symbol("EOF");
        const MAYBE_EMIT_END = Symbol("maybeEmitEnd");
        const EMITTED_END = Symbol("emittedEnd");
        const EMITTING_END = Symbol("emittingEnd");
        const EMITTED_ERROR = Symbol("emittedError");
        const CLOSED = Symbol("closed");
        const READ = Symbol("read");
        const FLUSH = Symbol("flush");
        const FLUSHCHUNK = Symbol("flushChunk");
        const ENCODING = Symbol("encoding");
        const DECODER = Symbol("decoder");
        const FLOWING = Symbol("flowing");
        const PAUSED = Symbol("paused");
        const RESUME = Symbol("resume");
        const BUFFERLENGTH = Symbol("bufferLength");
        const BUFFERPUSH = Symbol("bufferPush");
        const BUFFERSHIFT = Symbol("bufferShift");
        const OBJECTMODE = Symbol("objectMode");
        const DESTROYED = Symbol("destroyed");
        const EMITDATA = Symbol("emitData");
        const EMITEND = Symbol("emitEnd");
        const EMITEND2 = Symbol("emitEnd2");
        const ASYNC = Symbol("async");
        const defer = fn => Promise.resolve().then(fn);
        const doIter = global._MP_NO_ITERATOR_SYMBOLS_ !== "1";
        const ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented");
        const ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
        const isEndish = ev => ev === "end" || ev === "finish" || ev === "prefinish";
        const isArrayBuffer = b => b instanceof ArrayBuffer || typeof b === "object" && b.constructor && b.constructor.name === "ArrayBuffer" && b.byteLength >= 0;
        const isArrayBufferView = b => !Buffer.isBuffer(b) && ArrayBuffer.isView(b);
        class Pipe {
            constructor(src, dest, opts) {
                this.src = src;
                this.dest = dest;
                this.opts = opts;
                this.ondrain = () => src[RESUME]();
                dest.on("drain", this.ondrain);
            }
            unpipe() {
                this.dest.removeListener("drain", this.ondrain);
            }
            proxyErrors() {}
            end() {
                this.unpipe();
                if (this.opts.end) this.dest.end();
            }
        }
        class PipeProxyErrors extends Pipe {
            unpipe() {
                this.src.removeListener("error", this.proxyErrors);
                super.unpipe();
            }
            constructor(src, dest, opts) {
                super(src, dest, opts);
                this.proxyErrors = er => dest.emit("error", er);
                src.on("error", this.proxyErrors);
            }
        }
        module.exports = class Minipass extends Stream {
            constructor(options) {
                super();
                this[FLOWING] = false;
                this[PAUSED] = false;
                this.pipes = [];
                this.buffer = [];
                this[OBJECTMODE] = options && options.objectMode || false;
                if (this[OBJECTMODE]) this[ENCODING] = null; else this[ENCODING] = options && options.encoding || null;
                if (this[ENCODING] === "buffer") this[ENCODING] = null;
                this[ASYNC] = options && !!options.async || false;
                this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null;
                this[EOF] = false;
                this[EMITTED_END] = false;
                this[EMITTING_END] = false;
                this[CLOSED] = false;
                this[EMITTED_ERROR] = null;
                this.writable = true;
                this.readable = true;
                this[BUFFERLENGTH] = 0;
                this[DESTROYED] = false;
            }
            get bufferLength() {
                return this[BUFFERLENGTH];
            }
            get encoding() {
                return this[ENCODING];
            }
            set encoding(enc) {
                if (this[OBJECTMODE]) throw new Error("cannot set encoding in objectMode");
                if (this[ENCODING] && enc !== this[ENCODING] && (this[DECODER] && this[DECODER].lastNeed || this[BUFFERLENGTH])) throw new Error("cannot change encoding");
                if (this[ENCODING] !== enc) {
                    this[DECODER] = enc ? new SD(enc) : null;
                    if (this.buffer.length) this.buffer = this.buffer.map(chunk => this[DECODER].write(chunk));
                }
                this[ENCODING] = enc;
            }
            setEncoding(enc) {
                this.encoding = enc;
            }
            get objectMode() {
                return this[OBJECTMODE];
            }
            set objectMode(om) {
                this[OBJECTMODE] = this[OBJECTMODE] || !!om;
            }
            get ["async"]() {
                return this[ASYNC];
            }
            set ["async"](a) {
                this[ASYNC] = this[ASYNC] || !!a;
            }
            write(chunk, encoding, cb) {
                if (this[EOF]) throw new Error("write after end");
                if (this[DESTROYED]) {
                    this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), {
                        code: "ERR_STREAM_DESTROYED"
                    }));
                    return true;
                }
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (!encoding) encoding = "utf8";
                const fn = this[ASYNC] ? defer : f => f();
                if (!this[OBJECTMODE] && !Buffer.isBuffer(chunk)) {
                    if (isArrayBufferView(chunk)) chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength); else if (isArrayBuffer(chunk)) chunk = Buffer.from(chunk); else if (typeof chunk !== "string") this.objectMode = true;
                }
                if (this[OBJECTMODE]) {
                    if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                    if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (!chunk.length) {
                    if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                    if (cb) fn(cb);
                    return this.flowing;
                }
                if (typeof chunk === "string" && !(encoding === this[ENCODING] && !this[DECODER].lastNeed)) {
                    chunk = Buffer.from(chunk, encoding);
                }
                if (Buffer.isBuffer(chunk) && this[ENCODING]) chunk = this[DECODER].write(chunk);
                if (this.flowing && this[BUFFERLENGTH] !== 0) this[FLUSH](true);
                if (this.flowing) this.emit("data", chunk); else this[BUFFERPUSH](chunk);
                if (this[BUFFERLENGTH] !== 0) this.emit("readable");
                if (cb) fn(cb);
                return this.flowing;
            }
            read(n) {
                if (this[DESTROYED]) return null;
                if (this[BUFFERLENGTH] === 0 || n === 0 || n > this[BUFFERLENGTH]) {
                    this[MAYBE_EMIT_END]();
                    return null;
                }
                if (this[OBJECTMODE]) n = null;
                if (this.buffer.length > 1 && !this[OBJECTMODE]) {
                    if (this.encoding) this.buffer = [ this.buffer.join("") ]; else this.buffer = [ Buffer.concat(this.buffer, this[BUFFERLENGTH]) ];
                }
                const ret = this[READ](n || null, this.buffer[0]);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [READ](n, chunk) {
                if (n === chunk.length || n === null) this[BUFFERSHIFT](); else {
                    this.buffer[0] = chunk.slice(n);
                    chunk = chunk.slice(0, n);
                    this[BUFFERLENGTH] -= n;
                }
                this.emit("data", chunk);
                if (!this.buffer.length && !this[EOF]) this.emit("drain");
                return chunk;
            }
            end(chunk, encoding, cb) {
                if (typeof chunk === "function") cb = chunk, chunk = null;
                if (typeof encoding === "function") cb = encoding, encoding = "utf8";
                if (chunk) this.write(chunk, encoding);
                if (cb) this.once("end", cb);
                this[EOF] = true;
                this.writable = false;
                if (this.flowing || !this[PAUSED]) this[MAYBE_EMIT_END]();
                return this;
            }
            [RESUME]() {
                if (this[DESTROYED]) return;
                this[PAUSED] = false;
                this[FLOWING] = true;
                this.emit("resume");
                if (this.buffer.length) this[FLUSH](); else if (this[EOF]) this[MAYBE_EMIT_END](); else this.emit("drain");
            }
            resume() {
                return this[RESUME]();
            }
            pause() {
                this[FLOWING] = false;
                this[PAUSED] = true;
            }
            get destroyed() {
                return this[DESTROYED];
            }
            get flowing() {
                return this[FLOWING];
            }
            get paused() {
                return this[PAUSED];
            }
            [BUFFERPUSH](chunk) {
                if (this[OBJECTMODE]) this[BUFFERLENGTH] += 1; else this[BUFFERLENGTH] += chunk.length;
                this.buffer.push(chunk);
            }
            [BUFFERSHIFT]() {
                if (this.buffer.length) {
                    if (this[OBJECTMODE]) this[BUFFERLENGTH] -= 1; else this[BUFFERLENGTH] -= this.buffer[0].length;
                }
                return this.buffer.shift();
            }
            [FLUSH](noDrain) {
                do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
                if (!noDrain && !this.buffer.length && !this[EOF]) this.emit("drain");
            }
            [FLUSHCHUNK](chunk) {
                return chunk ? (this.emit("data", chunk), this.flowing) : false;
            }
            pipe(dest, opts) {
                if (this[DESTROYED]) return;
                const ended = this[EMITTED_END];
                opts = opts || {};
                if (dest === proc.stdout || dest === proc.stderr) opts.end = false; else opts.end = opts.end !== false;
                opts.proxyErrors = !!opts.proxyErrors;
                if (ended) {
                    if (opts.end) dest.end();
                } else {
                    this.pipes.push(!opts.proxyErrors ? new Pipe(this, dest, opts) : new PipeProxyErrors(this, dest, opts));
                    if (this[ASYNC]) defer(() => this[RESUME]()); else this[RESUME]();
                }
                return dest;
            }
            unpipe(dest) {
                const p = this.pipes.find(p => p.dest === dest);
                if (p) {
                    this.pipes.splice(this.pipes.indexOf(p), 1);
                    p.unpipe();
                }
            }
            addListener(ev, fn) {
                return this.on(ev, fn);
            }
            on(ev, fn) {
                const ret = super.on(ev, fn);
                if (ev === "data" && !this.pipes.length && !this.flowing) this[RESUME](); else if (ev === "readable" && this[BUFFERLENGTH] !== 0) super.emit("readable"); else if (isEndish(ev) && this[EMITTED_END]) {
                    super.emit(ev);
                    this.removeAllListeners(ev);
                } else if (ev === "error" && this[EMITTED_ERROR]) {
                    if (this[ASYNC]) defer(() => fn.call(this, this[EMITTED_ERROR])); else fn.call(this, this[EMITTED_ERROR]);
                }
                return ret;
            }
            get emittedEnd() {
                return this[EMITTED_END];
            }
            [MAYBE_EMIT_END]() {
                if (!this[EMITTING_END] && !this[EMITTED_END] && !this[DESTROYED] && this.buffer.length === 0 && this[EOF]) {
                    this[EMITTING_END] = true;
                    this.emit("end");
                    this.emit("prefinish");
                    this.emit("finish");
                    if (this[CLOSED]) this.emit("close");
                    this[EMITTING_END] = false;
                }
            }
            emit(ev, data, ...extra) {
                if (ev !== "error" && ev !== "close" && ev !== DESTROYED && this[DESTROYED]) return; else if (ev === "data") {
                    return !data ? false : this[ASYNC] ? defer(() => this[EMITDATA](data)) : this[EMITDATA](data);
                } else if (ev === "end") {
                    return this[EMITEND]();
                } else if (ev === "close") {
                    this[CLOSED] = true;
                    if (!this[EMITTED_END] && !this[DESTROYED]) return;
                    const ret = super.emit("close");
                    this.removeAllListeners("close");
                    return ret;
                } else if (ev === "error") {
                    this[EMITTED_ERROR] = data;
                    const ret = super.emit("error", data);
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "resume") {
                    const ret = super.emit("resume");
                    this[MAYBE_EMIT_END]();
                    return ret;
                } else if (ev === "finish" || ev === "prefinish") {
                    const ret = super.emit(ev);
                    this.removeAllListeners(ev);
                    return ret;
                }
                const ret = super.emit(ev, data, ...extra);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITDATA](data) {
                for (const p of this.pipes) {
                    if (p.dest.write(data) === false) this.pause();
                }
                const ret = super.emit("data", data);
                this[MAYBE_EMIT_END]();
                return ret;
            }
            [EMITEND]() {
                if (this[EMITTED_END]) return;
                this[EMITTED_END] = true;
                this.readable = false;
                if (this[ASYNC]) defer(() => this[EMITEND2]()); else this[EMITEND2]();
            }
            [EMITEND2]() {
                if (this[DECODER]) {
                    const data = this[DECODER].end();
                    if (data) {
                        for (const p of this.pipes) {
                            p.dest.write(data);
                        }
                        super.emit("data", data);
                    }
                }
                for (const p of this.pipes) {
                    p.end();
                }
                const ret = super.emit("end");
                this.removeAllListeners("end");
                return ret;
            }
            collect() {
                const buf = [];
                if (!this[OBJECTMODE]) buf.dataLength = 0;
                const p = this.promise();
                this.on("data", c => {
                    buf.push(c);
                    if (!this[OBJECTMODE]) buf.dataLength += c.length;
                });
                return p.then(() => buf);
            }
            concat() {
                return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then(buf => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength));
            }
            promise() {
                return new Promise((resolve, reject) => {
                    this.on(DESTROYED, () => reject(new Error("stream destroyed")));
                    this.on("error", er => reject(er));
                    this.on("end", () => resolve());
                });
            }
            [ASYNCITERATOR]() {
                const next = () => {
                    const res = this.read();
                    if (res !== null) return Promise.resolve({
                        done: false,
                        value: res
                    });
                    if (this[EOF]) return Promise.resolve({
                        done: true
                    });
                    let resolve = null;
                    let reject = null;
                    const onerr = er => {
                        this.removeListener("data", ondata);
                        this.removeListener("end", onend);
                        reject(er);
                    };
                    const ondata = value => {
                        this.removeListener("error", onerr);
                        this.removeListener("end", onend);
                        this.pause();
                        resolve({
                            value,
                            done: !!this[EOF]
                        });
                    };
                    const onend = () => {
                        this.removeListener("error", onerr);
                        this.removeListener("data", ondata);
                        resolve({
                            done: true
                        });
                    };
                    const ondestroy = () => onerr(new Error("stream destroyed"));
                    return new Promise((res, rej) => {
                        reject = rej;
                        resolve = res;
                        this.once(DESTROYED, ondestroy);
                        this.once("error", onerr);
                        this.once("end", onend);
                        this.once("data", ondata);
                    });
                };
                return {
                    next
                };
            }
            [ITERATOR]() {
                const next = () => {
                    const value = this.read();
                    const done = value === null;
                    return {
                        value,
                        done
                    };
                };
                return {
                    next
                };
            }
            destroy(er) {
                if (this[DESTROYED]) {
                    if (er) this.emit("error", er); else this.emit(DESTROYED);
                    return this;
                }
                this[DESTROYED] = true;
                this.buffer.length = 0;
                this[BUFFERLENGTH] = 0;
                if (typeof this.close === "function" && !this[CLOSED]) this.close();
                if (er) this.emit("error", er); else this.emit(DESTROYED);
                return this;
            }
            static isStream(s) {
                return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && (typeof s.pipe === "function" || typeof s.write === "function" && typeof s.end === "function"));
            }
        };
    },
    4410(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        exports.c = exports.create = __webpack_require__(2212);
        exports.r = exports.replace = __webpack_require__(3498);
        exports.t = exports.list = __webpack_require__(6492);
        exports.u = exports.update = __webpack_require__(6753);
        exports.x = exports.extract = __webpack_require__(5867);
        exports.Pack = __webpack_require__(453);
        exports.Unpack = __webpack_require__(3394);
        exports.Parse = __webpack_require__(6237);
        exports.ReadEntry = __webpack_require__(6989);
        exports.WriteEntry = __webpack_require__(8264);
        exports.Header = __webpack_require__(8657);
        exports.Pax = __webpack_require__(8107);
        exports.types = __webpack_require__(4755);
    },
    2212(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const hlo = __webpack_require__(5659);
        const Pack = __webpack_require__(453);
        const fsm = __webpack_require__(4857);
        const t = __webpack_require__(6492);
        const path = __webpack_require__(6928);
        module.exports = (opt_, files, cb) => {
            if (typeof files === "function") {
                cb = files;
            }
            if (Array.isArray(opt_)) {
                files = opt_, opt_ = {};
            }
            if (!files || !Array.isArray(files) || !files.length) {
                throw new TypeError("no files or directories specified");
            }
            files = Array.from(files);
            const opt = hlo(opt_);
            if (opt.sync && typeof cb === "function") {
                throw new TypeError("callback not supported for sync tar functions");
            }
            if (!opt.file && typeof cb === "function") {
                throw new TypeError("callback only supported with file option");
            }
            return opt.file && opt.sync ? createFileSync(opt, files) : opt.file ? createFile(opt, files, cb) : opt.sync ? createSync(opt, files) : create(opt, files);
        };
        const createFileSync = (opt, files) => {
            const p = new Pack.Sync(opt);
            const stream = new fsm.WriteStreamSync(opt.file, {
                mode: opt.mode || 438
            });
            p.pipe(stream);
            addFilesSync(p, files);
        };
        const createFile = (opt, files, cb) => {
            const p = new Pack(opt);
            const stream = new fsm.WriteStream(opt.file, {
                mode: opt.mode || 438
            });
            p.pipe(stream);
            const promise = new Promise((res, rej) => {
                stream.on("error", rej);
                stream.on("close", res);
                p.on("error", rej);
            });
            addFilesAsync(p, files);
            return cb ? promise.then(cb, cb) : promise;
        };
        const addFilesSync = (p, files) => {
            files.forEach(file => {
                if (file.charAt(0) === "@") {
                    t({
                        file: path.resolve(p.cwd, file.slice(1)),
                        sync: true,
                        noResume: true,
                        onentry: entry => p.add(entry)
                    });
                } else {
                    p.add(file);
                }
            });
            p.end();
        };
        const addFilesAsync = (p, files) => {
            while (files.length) {
                const file = files.shift();
                if (file.charAt(0) === "@") {
                    return t({
                        file: path.resolve(p.cwd, file.slice(1)),
                        noResume: true,
                        onentry: entry => p.add(entry)
                    }).then(_ => addFilesAsync(p, files));
                } else {
                    p.add(file);
                }
            }
            p.end();
        };
        const createSync = (opt, files) => {
            const p = new Pack.Sync(opt);
            addFilesSync(p, files);
            return p;
        };
        const create = (opt, files) => {
            const p = new Pack(opt);
            addFilesAsync(p, files);
            return p;
        };
    },
    5867(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const hlo = __webpack_require__(5659);
        const Unpack = __webpack_require__(3394);
        const fs = __webpack_require__(9896);
        const fsm = __webpack_require__(4857);
        const path = __webpack_require__(6928);
        const stripSlash = __webpack_require__(3238);
        module.exports = (opt_, files, cb) => {
            if (typeof opt_ === "function") {
                cb = opt_, files = null, opt_ = {};
            } else if (Array.isArray(opt_)) {
                files = opt_, opt_ = {};
            }
            if (typeof files === "function") {
                cb = files, files = null;
            }
            if (!files) {
                files = [];
            } else {
                files = Array.from(files);
            }
            const opt = hlo(opt_);
            if (opt.sync && typeof cb === "function") {
                throw new TypeError("callback not supported for sync tar functions");
            }
            if (!opt.file && typeof cb === "function") {
                throw new TypeError("callback only supported with file option");
            }
            if (files.length) {
                filesFilter(opt, files);
            }
            return opt.file && opt.sync ? extractFileSync(opt) : opt.file ? extractFile(opt, cb) : opt.sync ? extractSync(opt) : extract(opt);
        };
        const filesFilter = (opt, files) => {
            const map = new Map(files.map(f => [ stripSlash(f), true ]));
            const filter = opt.filter;
            const mapHas = (file, r) => {
                const root = r || path.parse(file).root || ".";
                const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path.dirname(file), root);
                map.set(file, ret);
                return ret;
            };
            opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : file => mapHas(stripSlash(file));
        };
        const extractFileSync = opt => {
            const u = new Unpack.Sync(opt);
            const file = opt.file;
            const stat = fs.statSync(file);
            const readSize = opt.maxReadSize || 16 * 1024 * 1024;
            const stream = new fsm.ReadStreamSync(file, {
                readSize,
                size: stat.size
            });
            stream.pipe(u);
        };
        const extractFile = (opt, cb) => {
            const u = new Unpack(opt);
            const readSize = opt.maxReadSize || 16 * 1024 * 1024;
            const file = opt.file;
            const p = new Promise((resolve, reject) => {
                u.on("error", reject);
                u.on("close", resolve);
                fs.stat(file, (er, stat) => {
                    if (er) {
                        reject(er);
                    } else {
                        const stream = new fsm.ReadStream(file, {
                            readSize,
                            size: stat.size
                        });
                        stream.on("error", reject);
                        stream.pipe(u);
                    }
                });
            });
            return cb ? p.then(cb, cb) : p;
        };
        const extractSync = opt => new Unpack.Sync(opt);
        const extract = opt => new Unpack(opt);
    },
    6435(module, __unused_webpack_exports, __webpack_require__) {
        const platform = process.env.__FAKE_PLATFORM__ || process.platform;
        const isWindows = platform === "win32";
        const fs = global.__FAKE_TESTING_FS__ || __webpack_require__(9896);
        const {O_CREAT, O_TRUNC, O_WRONLY, UV_FS_O_FILEMAP = 0} = fs.constants;
        const fMapEnabled = isWindows && !!UV_FS_O_FILEMAP;
        const fMapLimit = 512 * 1024;
        const fMapFlag = UV_FS_O_FILEMAP | O_TRUNC | O_CREAT | O_WRONLY;
        module.exports = !fMapEnabled ? () => "w" : size => size < fMapLimit ? fMapFlag : "w";
    },
    8657(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const types = __webpack_require__(4755);
        const pathModule = __webpack_require__(6928).posix;
        const large = __webpack_require__(8322);
        const SLURP = Symbol("slurp");
        const TYPE = Symbol("type");
        class Header {
            constructor(data, off, ex, gex) {
                this.cksumValid = false;
                this.needPax = false;
                this.nullBlock = false;
                this.block = null;
                this.path = null;
                this.mode = null;
                this.uid = null;
                this.gid = null;
                this.size = null;
                this.mtime = null;
                this.cksum = null;
                this[TYPE] = "0";
                this.linkpath = null;
                this.uname = null;
                this.gname = null;
                this.devmaj = 0;
                this.devmin = 0;
                this.atime = null;
                this.ctime = null;
                if (Buffer.isBuffer(data)) {
                    this.decode(data, off || 0, ex, gex);
                } else if (data) {
                    this.set(data);
                }
            }
            decode(buf, off, ex, gex) {
                if (!off) {
                    off = 0;
                }
                if (!buf || !(buf.length >= off + 512)) {
                    throw new Error("need 512 bytes for header");
                }
                this.path = decString(buf, off, 100);
                this.mode = decNumber(buf, off + 100, 8);
                this.uid = decNumber(buf, off + 108, 8);
                this.gid = decNumber(buf, off + 116, 8);
                this.size = decNumber(buf, off + 124, 12);
                this.mtime = decDate(buf, off + 136, 12);
                this.cksum = decNumber(buf, off + 148, 12);
                this[SLURP](ex);
                this[SLURP](gex, true);
                this[TYPE] = decString(buf, off + 156, 1);
                if (this[TYPE] === "") {
                    this[TYPE] = "0";
                }
                if (this[TYPE] === "0" && this.path.slice(-1) === "/") {
                    this[TYPE] = "5";
                }
                if (this[TYPE] === "5") {
                    this.size = 0;
                }
                this.linkpath = decString(buf, off + 157, 100);
                if (buf.slice(off + 257, off + 265).toString() === "ustar\x0000") {
                    this.uname = decString(buf, off + 265, 32);
                    this.gname = decString(buf, off + 297, 32);
                    this.devmaj = decNumber(buf, off + 329, 8);
                    this.devmin = decNumber(buf, off + 337, 8);
                    if (buf[off + 475] !== 0) {
                        const prefix = decString(buf, off + 345, 155);
                        this.path = prefix + "/" + this.path;
                    } else {
                        const prefix = decString(buf, off + 345, 130);
                        if (prefix) {
                            this.path = prefix + "/" + this.path;
                        }
                        this.atime = decDate(buf, off + 476, 12);
                        this.ctime = decDate(buf, off + 488, 12);
                    }
                }
                let sum = 8 * 32;
                for (let i = off; i < off + 148; i++) {
                    sum += buf[i];
                }
                for (let i = off + 156; i < off + 512; i++) {
                    sum += buf[i];
                }
                this.cksumValid = sum === this.cksum;
                if (this.cksum === null && sum === 8 * 32) {
                    this.nullBlock = true;
                }
            }
            [SLURP](ex, global) {
                for (const k in ex) {
                    if (ex[k] !== null && ex[k] !== undefined && !(global && k === "path")) {
                        this[k] = ex[k];
                    }
                }
            }
            encode(buf, off) {
                if (!buf) {
                    buf = this.block = Buffer.alloc(512);
                    off = 0;
                }
                if (!off) {
                    off = 0;
                }
                if (!(buf.length >= off + 512)) {
                    throw new Error("need 512 bytes for header");
                }
                const prefixSize = this.ctime || this.atime ? 130 : 155;
                const split = splitPrefix(this.path || "", prefixSize);
                const path = split[0];
                const prefix = split[1];
                this.needPax = split[2];
                this.needPax = encString(buf, off, 100, path) || this.needPax;
                this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax;
                this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax;
                this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax;
                this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax;
                this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax;
                buf[off + 156] = this[TYPE].charCodeAt(0);
                this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax;
                buf.write("ustar\x0000", off + 257, 8);
                this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax;
                this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax;
                this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax;
                this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax;
                this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax;
                if (buf[off + 475] !== 0) {
                    this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax;
                } else {
                    this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax;
                    this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax;
                    this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax;
                }
                let sum = 8 * 32;
                for (let i = off; i < off + 148; i++) {
                    sum += buf[i];
                }
                for (let i = off + 156; i < off + 512; i++) {
                    sum += buf[i];
                }
                this.cksum = sum;
                encNumber(buf, off + 148, 8, this.cksum);
                this.cksumValid = true;
                return this.needPax;
            }
            set(data) {
                for (const i in data) {
                    if (data[i] !== null && data[i] !== undefined) {
                        this[i] = data[i];
                    }
                }
            }
            get type() {
                return types.name.get(this[TYPE]) || this[TYPE];
            }
            get typeKey() {
                return this[TYPE];
            }
            set type(type) {
                if (types.code.has(type)) {
                    this[TYPE] = types.code.get(type);
                } else {
                    this[TYPE] = type;
                }
            }
        }
        const splitPrefix = (p, prefixSize) => {
            const pathSize = 100;
            let pp = p;
            let prefix = "";
            let ret;
            const root = pathModule.parse(p).root || ".";
            if (Buffer.byteLength(pp) < pathSize) {
                ret = [ pp, prefix, false ];
            } else {
                prefix = pathModule.dirname(pp);
                pp = pathModule.basename(pp);
                do {
                    if (Buffer.byteLength(pp) <= pathSize && Buffer.byteLength(prefix) <= prefixSize) {
                        ret = [ pp, prefix, false ];
                    } else if (Buffer.byteLength(pp) > pathSize && Buffer.byteLength(prefix) <= prefixSize) {
                        ret = [ pp.slice(0, pathSize - 1), prefix, true ];
                    } else {
                        pp = pathModule.join(pathModule.basename(prefix), pp);
                        prefix = pathModule.dirname(prefix);
                    }
                } while (prefix !== root && !ret);
                if (!ret) {
                    ret = [ p.slice(0, pathSize - 1), "", true ];
                }
            }
            return ret;
        };
        const decString = (buf, off, size) => buf.slice(off, off + size).toString("utf8").replace(/\0.*/, "");
        const decDate = (buf, off, size) => numToDate(decNumber(buf, off, size));
        const numToDate = num => num === null ? null : new Date(num * 1e3);
        const decNumber = (buf, off, size) => buf[off] & 128 ? large.parse(buf.slice(off, off + size)) : decSmallNumber(buf, off, size);
        const nanNull = value => isNaN(value) ? null : value;
        const decSmallNumber = (buf, off, size) => nanNull(parseInt(buf.slice(off, off + size).toString("utf8").replace(/\0.*$/, "").trim(), 8));
        const MAXNUM = {
            12: 8589934591,
            8: 2097151
        };
        const encNumber = (buf, off, size, number) => number === null ? false : number > MAXNUM[size] || number < 0 ? (large.encode(number, buf.slice(off, off + size)), 
        true) : (encSmallNumber(buf, off, size, number), false);
        const encSmallNumber = (buf, off, size, number) => buf.write(octalString(number, size), off, size, "ascii");
        const octalString = (number, size) => padOctal(Math.floor(number).toString(8), size);
        const padOctal = (string, size) => (string.length === size - 1 ? string : new Array(size - string.length - 1).join("0") + string + " ") + "\0";
        const encDate = (buf, off, size, date) => date === null ? false : encNumber(buf, off, size, date.getTime() / 1e3);
        const NULLS = new Array(156).join("\0");
        const encString = (buf, off, size, string) => string === null ? false : (buf.write(string + NULLS, off, size, "utf8"), 
        string.length !== Buffer.byteLength(string) || string.length > size);
        module.exports = Header;
    },
    5659(module) {
        "use strict";
        const argmap = new Map([ [ "C", "cwd" ], [ "f", "file" ], [ "z", "gzip" ], [ "P", "preservePaths" ], [ "U", "unlink" ], [ "strip-components", "strip" ], [ "stripComponents", "strip" ], [ "keep-newer", "newer" ], [ "keepNewer", "newer" ], [ "keep-newer-files", "newer" ], [ "keepNewerFiles", "newer" ], [ "k", "keep" ], [ "keep-existing", "keep" ], [ "keepExisting", "keep" ], [ "m", "noMtime" ], [ "no-mtime", "noMtime" ], [ "p", "preserveOwner" ], [ "L", "follow" ], [ "h", "follow" ] ]);
        module.exports = opt => opt ? Object.keys(opt).map(k => [ argmap.has(k) ? argmap.get(k) : k, opt[k] ]).reduce((set, kv) => (set[kv[0]] = kv[1], 
        set), Object.create(null)) : {};
    },
    8322(module) {
        "use strict";
        const encode = (num, buf) => {
            if (!Number.isSafeInteger(num)) {
                throw Error("cannot encode number outside of javascript safe integer range");
            } else if (num < 0) {
                encodeNegative(num, buf);
            } else {
                encodePositive(num, buf);
            }
            return buf;
        };
        const encodePositive = (num, buf) => {
            buf[0] = 128;
            for (var i = buf.length; i > 1; i--) {
                buf[i - 1] = num & 255;
                num = Math.floor(num / 256);
            }
        };
        const encodeNegative = (num, buf) => {
            buf[0] = 255;
            var flipped = false;
            num = num * -1;
            for (var i = buf.length; i > 1; i--) {
                var byte = num & 255;
                num = Math.floor(num / 256);
                if (flipped) {
                    buf[i - 1] = onesComp(byte);
                } else if (byte === 0) {
                    buf[i - 1] = 0;
                } else {
                    flipped = true;
                    buf[i - 1] = twosComp(byte);
                }
            }
        };
        const parse = buf => {
            const pre = buf[0];
            const value = pre === 128 ? pos(buf.slice(1, buf.length)) : pre === 255 ? twos(buf) : null;
            if (value === null) {
                throw Error("invalid base256 encoding");
            }
            if (!Number.isSafeInteger(value)) {
                throw Error("parsed number outside of javascript safe integer range");
            }
            return value;
        };
        const twos = buf => {
            var len = buf.length;
            var sum = 0;
            var flipped = false;
            for (var i = len - 1; i > -1; i--) {
                var byte = buf[i];
                var f;
                if (flipped) {
                    f = onesComp(byte);
                } else if (byte === 0) {
                    f = byte;
                } else {
                    flipped = true;
                    f = twosComp(byte);
                }
                if (f !== 0) {
                    sum -= f * Math.pow(256, len - i - 1);
                }
            }
            return sum;
        };
        const pos = buf => {
            var len = buf.length;
            var sum = 0;
            for (var i = len - 1; i > -1; i--) {
                var byte = buf[i];
                if (byte !== 0) {
                    sum += byte * Math.pow(256, len - i - 1);
                }
            }
            return sum;
        };
        const onesComp = byte => (255 ^ byte) & 255;
        const twosComp = byte => (255 ^ byte) + 1 & 255;
        module.exports = {
            encode,
            parse
        };
    },
    6492(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const hlo = __webpack_require__(5659);
        const Parser = __webpack_require__(6237);
        const fs = __webpack_require__(9896);
        const fsm = __webpack_require__(4857);
        const path = __webpack_require__(6928);
        const stripSlash = __webpack_require__(3238);
        module.exports = (opt_, files, cb) => {
            if (typeof opt_ === "function") {
                cb = opt_, files = null, opt_ = {};
            } else if (Array.isArray(opt_)) {
                files = opt_, opt_ = {};
            }
            if (typeof files === "function") {
                cb = files, files = null;
            }
            if (!files) {
                files = [];
            } else {
                files = Array.from(files);
            }
            const opt = hlo(opt_);
            if (opt.sync && typeof cb === "function") {
                throw new TypeError("callback not supported for sync tar functions");
            }
            if (!opt.file && typeof cb === "function") {
                throw new TypeError("callback only supported with file option");
            }
            if (files.length) {
                filesFilter(opt, files);
            }
            if (!opt.noResume) {
                onentryFunction(opt);
            }
            return opt.file && opt.sync ? listFileSync(opt) : opt.file ? listFile(opt, cb) : list(opt);
        };
        const onentryFunction = opt => {
            const onentry = opt.onentry;
            opt.onentry = onentry ? e => {
                onentry(e);
                e.resume();
            } : e => e.resume();
        };
        const filesFilter = (opt, files) => {
            const map = new Map(files.map(f => [ stripSlash(f), true ]));
            const filter = opt.filter;
            const mapHas = (file, r) => {
                const root = r || path.parse(file).root || ".";
                const ret = file === root ? false : map.has(file) ? map.get(file) : mapHas(path.dirname(file), root);
                map.set(file, ret);
                return ret;
            };
            opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : file => mapHas(stripSlash(file));
        };
        const listFileSync = opt => {
            const p = list(opt);
            const file = opt.file;
            let threw = true;
            let fd;
            try {
                const stat = fs.statSync(file);
                const readSize = opt.maxReadSize || 16 * 1024 * 1024;
                if (stat.size < readSize) {
                    p.end(fs.readFileSync(file));
                } else {
                    let pos = 0;
                    const buf = Buffer.allocUnsafe(readSize);
                    fd = fs.openSync(file, "r");
                    while (pos < stat.size) {
                        const bytesRead = fs.readSync(fd, buf, 0, readSize, pos);
                        pos += bytesRead;
                        p.write(buf.slice(0, bytesRead));
                    }
                    p.end();
                }
                threw = false;
            } finally {
                if (threw && fd) {
                    try {
                        fs.closeSync(fd);
                    } catch (er) {}
                }
            }
        };
        const listFile = (opt, cb) => {
            const parse = new Parser(opt);
            const readSize = opt.maxReadSize || 16 * 1024 * 1024;
            const file = opt.file;
            const p = new Promise((resolve, reject) => {
                parse.on("error", reject);
                parse.on("end", resolve);
                fs.stat(file, (er, stat) => {
                    if (er) {
                        reject(er);
                    } else {
                        const stream = new fsm.ReadStream(file, {
                            readSize,
                            size: stat.size
                        });
                        stream.on("error", reject);
                        stream.pipe(parse);
                    }
                });
            });
            return cb ? p.then(cb, cb) : p;
        };
        const list = opt => new Parser(opt);
    },
    6097(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const mkdirp = __webpack_require__(5710);
        const fs = __webpack_require__(9896);
        const path = __webpack_require__(6928);
        const chownr = __webpack_require__(8413);
        const normPath = __webpack_require__(1793);
        class SymlinkError extends Error {
            constructor(symlink, path) {
                super("Cannot extract through symbolic link");
                this.path = path;
                this.symlink = symlink;
            }
            get name() {
                return "SylinkError";
            }
        }
        class CwdError extends Error {
            constructor(path, code) {
                super(code + ": Cannot cd into '" + path + "'");
                this.path = path;
                this.code = code;
            }
            get name() {
                return "CwdError";
            }
        }
        const cGet = (cache, key) => cache.get(normPath(key));
        const cSet = (cache, key, val) => cache.set(normPath(key), val);
        const checkCwd = (dir, cb) => {
            fs.stat(dir, (er, st) => {
                if (er || !st.isDirectory()) {
                    er = new CwdError(dir, er && er.code || "ENOTDIR");
                }
                cb(er);
            });
        };
        module.exports = (dir, opt, cb) => {
            dir = normPath(dir);
            const umask = opt.umask;
            const mode = opt.mode | 448;
            const needChmod = (mode & umask) !== 0;
            const uid = opt.uid;
            const gid = opt.gid;
            const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
            const preserve = opt.preserve;
            const unlink = opt.unlink;
            const cache = opt.cache;
            const cwd = normPath(opt.cwd);
            const done = (er, created) => {
                if (er) {
                    cb(er);
                } else {
                    cSet(cache, dir, true);
                    if (created && doChown) {
                        chownr(created, uid, gid, er => done(er));
                    } else if (needChmod) {
                        fs.chmod(dir, mode, cb);
                    } else {
                        cb();
                    }
                }
            };
            if (cache && cGet(cache, dir) === true) {
                return done();
            }
            if (dir === cwd) {
                return checkCwd(dir, done);
            }
            if (preserve) {
                return mkdirp(dir, {
                    mode
                }).then(made => done(null, made), done);
            }
            const sub = normPath(path.relative(cwd, dir));
            const parts = sub.split("/");
            mkdir_(cwd, parts, mode, cache, unlink, cwd, null, done);
        };
        const mkdir_ = (base, parts, mode, cache, unlink, cwd, created, cb) => {
            if (!parts.length) {
                return cb(null, created);
            }
            const p = parts.shift();
            const part = normPath(path.resolve(base + "/" + p));
            if (cGet(cache, part)) {
                return mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
            }
            fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
        };
        const onmkdir = (part, parts, mode, cache, unlink, cwd, created, cb) => er => {
            if (er) {
                fs.lstat(part, (statEr, st) => {
                    if (statEr) {
                        statEr.path = statEr.path && normPath(statEr.path);
                        cb(statEr);
                    } else if (st.isDirectory()) {
                        mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
                    } else if (unlink) {
                        fs.unlink(part, er => {
                            if (er) {
                                return cb(er);
                            }
                            fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
                        });
                    } else if (st.isSymbolicLink()) {
                        return cb(new SymlinkError(part, part + "/" + parts.join("/")));
                    } else {
                        cb(er);
                    }
                });
            } else {
                created = created || part;
                mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
            }
        };
        const checkCwdSync = dir => {
            let ok = false;
            let code = "ENOTDIR";
            try {
                ok = fs.statSync(dir).isDirectory();
            } catch (er) {
                code = er.code;
            } finally {
                if (!ok) {
                    throw new CwdError(dir, code);
                }
            }
        };
        module.exports.sync = (dir, opt) => {
            dir = normPath(dir);
            const umask = opt.umask;
            const mode = opt.mode | 448;
            const needChmod = (mode & umask) !== 0;
            const uid = opt.uid;
            const gid = opt.gid;
            const doChown = typeof uid === "number" && typeof gid === "number" && (uid !== opt.processUid || gid !== opt.processGid);
            const preserve = opt.preserve;
            const unlink = opt.unlink;
            const cache = opt.cache;
            const cwd = normPath(opt.cwd);
            const done = created => {
                cSet(cache, dir, true);
                if (created && doChown) {
                    chownr.sync(created, uid, gid);
                }
                if (needChmod) {
                    fs.chmodSync(dir, mode);
                }
            };
            if (cache && cGet(cache, dir) === true) {
                return done();
            }
            if (dir === cwd) {
                checkCwdSync(cwd);
                return done();
            }
            if (preserve) {
                return done(mkdirp.sync(dir, mode));
            }
            const sub = normPath(path.relative(cwd, dir));
            const parts = sub.split("/");
            let created = null;
            for (let p = parts.shift(), part = cwd; p && (part += "/" + p); p = parts.shift()) {
                part = normPath(path.resolve(part));
                if (cGet(cache, part)) {
                    continue;
                }
                try {
                    fs.mkdirSync(part, mode);
                    created = created || part;
                    cSet(cache, part, true);
                } catch (er) {
                    const st = fs.lstatSync(part);
                    if (st.isDirectory()) {
                        cSet(cache, part, true);
                        continue;
                    } else if (unlink) {
                        fs.unlinkSync(part);
                        fs.mkdirSync(part, mode);
                        created = created || part;
                        cSet(cache, part, true);
                        continue;
                    } else if (st.isSymbolicLink()) {
                        return new SymlinkError(part, part + "/" + parts.join("/"));
                    }
                }
            }
            return done(created);
        };
    },
    5541(module) {
        "use strict";
        module.exports = (mode, isDir, portable) => {
            mode &= 4095;
            if (portable) {
                mode = (mode | 384) & ~18;
            }
            if (isDir) {
                if (mode & 256) {
                    mode |= 64;
                }
                if (mode & 32) {
                    mode |= 8;
                }
                if (mode & 4) {
                    mode |= 1;
                }
            }
            return mode;
        };
    },
    1591(module) {
        const normalizeCache = Object.create(null);
        const {hasOwnProperty} = Object.prototype;
        module.exports = s => {
            if (!hasOwnProperty.call(normalizeCache, s)) {
                normalizeCache[s] = s.normalize("NFD");
            }
            return normalizeCache[s];
        };
    },
    1793(module) {
        const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
        module.exports = platform !== "win32" ? p => p : p => p && p.replace(/\\/g, "/");
    },
    453(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        class PackJob {
            constructor(path, absolute) {
                this.path = path || "./";
                this.absolute = absolute;
                this.entry = null;
                this.stat = null;
                this.readdir = null;
                this.pending = false;
                this.ignore = false;
                this.piped = false;
            }
        }
        const {Minipass} = __webpack_require__(8769);
        const zlib = __webpack_require__(853);
        const ReadEntry = __webpack_require__(6989);
        const WriteEntry = __webpack_require__(8264);
        const WriteEntrySync = WriteEntry.Sync;
        const WriteEntryTar = WriteEntry.Tar;
        const Yallist = __webpack_require__(5773);
        const EOF = Buffer.alloc(1024);
        const ONSTAT = Symbol("onStat");
        const ENDED = Symbol("ended");
        const QUEUE = Symbol("queue");
        const CURRENT = Symbol("current");
        const PROCESS = Symbol("process");
        const PROCESSING = Symbol("processing");
        const PROCESSJOB = Symbol("processJob");
        const JOBS = Symbol("jobs");
        const JOBDONE = Symbol("jobDone");
        const ADDFSENTRY = Symbol("addFSEntry");
        const ADDTARENTRY = Symbol("addTarEntry");
        const STAT = Symbol("stat");
        const READDIR = Symbol("readdir");
        const ONREADDIR = Symbol("onreaddir");
        const PIPE = Symbol("pipe");
        const ENTRY = Symbol("entry");
        const ENTRYOPT = Symbol("entryOpt");
        const WRITEENTRYCLASS = Symbol("writeEntryClass");
        const WRITE = Symbol("write");
        const ONDRAIN = Symbol("ondrain");
        const fs = __webpack_require__(9896);
        const path = __webpack_require__(6928);
        const warner = __webpack_require__(1036);
        const normPath = __webpack_require__(1793);
        const Pack = warner(class Pack extends Minipass {
            constructor(opt) {
                super(opt);
                opt = opt || Object.create(null);
                this.opt = opt;
                this.file = opt.file || "";
                this.cwd = opt.cwd || process.cwd();
                this.maxReadSize = opt.maxReadSize;
                this.preservePaths = !!opt.preservePaths;
                this.strict = !!opt.strict;
                this.noPax = !!opt.noPax;
                this.prefix = normPath(opt.prefix || "");
                this.linkCache = opt.linkCache || new Map;
                this.statCache = opt.statCache || new Map;
                this.readdirCache = opt.readdirCache || new Map;
                this[WRITEENTRYCLASS] = WriteEntry;
                if (typeof opt.onwarn === "function") {
                    this.on("warn", opt.onwarn);
                }
                this.portable = !!opt.portable;
                this.zip = null;
                if (opt.gzip || opt.brotli) {
                    if (opt.gzip && opt.brotli) {
                        throw new TypeError("gzip and brotli are mutually exclusive");
                    }
                    if (opt.gzip) {
                        if (typeof opt.gzip !== "object") {
                            opt.gzip = {};
                        }
                        if (this.portable) {
                            opt.gzip.portable = true;
                        }
                        this.zip = new zlib.Gzip(opt.gzip);
                    }
                    if (opt.brotli) {
                        if (typeof opt.brotli !== "object") {
                            opt.brotli = {};
                        }
                        this.zip = new zlib.BrotliCompress(opt.brotli);
                    }
                    this.zip.on("data", chunk => super.write(chunk));
                    this.zip.on("end", _ => super.end());
                    this.zip.on("drain", _ => this[ONDRAIN]());
                    this.on("resume", _ => this.zip.resume());
                } else {
                    this.on("drain", this[ONDRAIN]);
                }
                this.noDirRecurse = !!opt.noDirRecurse;
                this.follow = !!opt.follow;
                this.noMtime = !!opt.noMtime;
                this.mtime = opt.mtime || null;
                this.filter = typeof opt.filter === "function" ? opt.filter : _ => true;
                this[QUEUE] = new Yallist;
                this[JOBS] = 0;
                this.jobs = +opt.jobs || 4;
                this[PROCESSING] = false;
                this[ENDED] = false;
            }
            [WRITE](chunk) {
                return super.write(chunk);
            }
            add(path) {
                this.write(path);
                return this;
            }
            end(path) {
                if (path) {
                    this.write(path);
                }
                this[ENDED] = true;
                this[PROCESS]();
                return this;
            }
            write(path) {
                if (this[ENDED]) {
                    throw new Error("write after end");
                }
                if (path instanceof ReadEntry) {
                    this[ADDTARENTRY](path);
                } else {
                    this[ADDFSENTRY](path);
                }
                return this.flowing;
            }
            [ADDTARENTRY](p) {
                const absolute = normPath(path.resolve(this.cwd, p.path));
                if (!this.filter(p.path, p)) {
                    p.resume();
                } else {
                    const job = new PackJob(p.path, absolute, false);
                    job.entry = new WriteEntryTar(p, this[ENTRYOPT](job));
                    job.entry.on("end", _ => this[JOBDONE](job));
                    this[JOBS] += 1;
                    this[QUEUE].push(job);
                }
                this[PROCESS]();
            }
            [ADDFSENTRY](p) {
                const absolute = normPath(path.resolve(this.cwd, p));
                this[QUEUE].push(new PackJob(p, absolute));
                this[PROCESS]();
            }
            [STAT](job) {
                job.pending = true;
                this[JOBS] += 1;
                const stat = this.follow ? "stat" : "lstat";
                fs[stat](job.absolute, (er, stat) => {
                    job.pending = false;
                    this[JOBS] -= 1;
                    if (er) {
                        this.emit("error", er);
                    } else {
                        this[ONSTAT](job, stat);
                    }
                });
            }
            [ONSTAT](job, stat) {
                this.statCache.set(job.absolute, stat);
                job.stat = stat;
                if (!this.filter(job.path, stat)) {
                    job.ignore = true;
                }
                this[PROCESS]();
            }
            [READDIR](job) {
                job.pending = true;
                this[JOBS] += 1;
                fs.readdir(job.absolute, (er, entries) => {
                    job.pending = false;
                    this[JOBS] -= 1;
                    if (er) {
                        return this.emit("error", er);
                    }
                    this[ONREADDIR](job, entries);
                });
            }
            [ONREADDIR](job, entries) {
                this.readdirCache.set(job.absolute, entries);
                job.readdir = entries;
                this[PROCESS]();
            }
            [PROCESS]() {
                if (this[PROCESSING]) {
                    return;
                }
                this[PROCESSING] = true;
                for (let w = this[QUEUE].head; w !== null && this[JOBS] < this.jobs; w = w.next) {
                    this[PROCESSJOB](w.value);
                    if (w.value.ignore) {
                        const p = w.next;
                        this[QUEUE].removeNode(w);
                        w.next = p;
                    }
                }
                this[PROCESSING] = false;
                if (this[ENDED] && !this[QUEUE].length && this[JOBS] === 0) {
                    if (this.zip) {
                        this.zip.end(EOF);
                    } else {
                        super.write(EOF);
                        super.end();
                    }
                }
            }
            get [CURRENT]() {
                return this[QUEUE] && this[QUEUE].head && this[QUEUE].head.value;
            }
            [JOBDONE](job) {
                this[QUEUE].shift();
                this[JOBS] -= 1;
                this[PROCESS]();
            }
            [PROCESSJOB](job) {
                if (job.pending) {
                    return;
                }
                if (job.entry) {
                    if (job === this[CURRENT] && !job.piped) {
                        this[PIPE](job);
                    }
                    return;
                }
                if (!job.stat) {
                    if (this.statCache.has(job.absolute)) {
                        this[ONSTAT](job, this.statCache.get(job.absolute));
                    } else {
                        this[STAT](job);
                    }
                }
                if (!job.stat) {
                    return;
                }
                if (job.ignore) {
                    return;
                }
                if (!this.noDirRecurse && job.stat.isDirectory() && !job.readdir) {
                    if (this.readdirCache.has(job.absolute)) {
                        this[ONREADDIR](job, this.readdirCache.get(job.absolute));
                    } else {
                        this[READDIR](job);
                    }
                    if (!job.readdir) {
                        return;
                    }
                }
                job.entry = this[ENTRY](job);
                if (!job.entry) {
                    job.ignore = true;
                    return;
                }
                if (job === this[CURRENT] && !job.piped) {
                    this[PIPE](job);
                }
            }
            [ENTRYOPT](job) {
                return {
                    onwarn: (code, msg, data) => this.warn(code, msg, data),
                    noPax: this.noPax,
                    cwd: this.cwd,
                    absolute: job.absolute,
                    preservePaths: this.preservePaths,
                    maxReadSize: this.maxReadSize,
                    strict: this.strict,
                    portable: this.portable,
                    linkCache: this.linkCache,
                    statCache: this.statCache,
                    noMtime: this.noMtime,
                    mtime: this.mtime,
                    prefix: this.prefix
                };
            }
            [ENTRY](job) {
                this[JOBS] += 1;
                try {
                    return new this[WRITEENTRYCLASS](job.path, this[ENTRYOPT](job)).on("end", () => this[JOBDONE](job)).on("error", er => this.emit("error", er));
                } catch (er) {
                    this.emit("error", er);
                }
            }
            [ONDRAIN]() {
                if (this[CURRENT] && this[CURRENT].entry) {
                    this[CURRENT].entry.resume();
                }
            }
            [PIPE](job) {
                job.piped = true;
                if (job.readdir) {
                    job.readdir.forEach(entry => {
                        const p = job.path;
                        const base = p === "./" ? "" : p.replace(/\/*$/, "/");
                        this[ADDFSENTRY](base + entry);
                    });
                }
                const source = job.entry;
                const zip = this.zip;
                if (zip) {
                    source.on("data", chunk => {
                        if (!zip.write(chunk)) {
                            source.pause();
                        }
                    });
                } else {
                    source.on("data", chunk => {
                        if (!super.write(chunk)) {
                            source.pause();
                        }
                    });
                }
            }
            pause() {
                if (this.zip) {
                    this.zip.pause();
                }
                return super.pause();
            }
        });
        class PackSync extends Pack {
            constructor(opt) {
                super(opt);
                this[WRITEENTRYCLASS] = WriteEntrySync;
            }
            pause() {}
            resume() {}
            [STAT](job) {
                const stat = this.follow ? "statSync" : "lstatSync";
                this[ONSTAT](job, fs[stat](job.absolute));
            }
            [READDIR](job, stat) {
                this[ONREADDIR](job, fs.readdirSync(job.absolute));
            }
            [PIPE](job) {
                const source = job.entry;
                const zip = this.zip;
                if (job.readdir) {
                    job.readdir.forEach(entry => {
                        const p = job.path;
                        const base = p === "./" ? "" : p.replace(/\/*$/, "/");
                        this[ADDFSENTRY](base + entry);
                    });
                }
                if (zip) {
                    source.on("data", chunk => {
                        zip.write(chunk);
                    });
                } else {
                    source.on("data", chunk => {
                        super[WRITE](chunk);
                    });
                }
            }
        }
        Pack.Sync = PackSync;
        module.exports = Pack;
    },
    6237(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const warner = __webpack_require__(1036);
        const Header = __webpack_require__(8657);
        const EE = __webpack_require__(4434);
        const Yallist = __webpack_require__(5773);
        const maxMetaEntrySize = 1024 * 1024;
        const Entry = __webpack_require__(6989);
        const Pax = __webpack_require__(8107);
        const zlib = __webpack_require__(853);
        const {nextTick} = __webpack_require__(932);
        const gzipHeader = Buffer.from([ 31, 139 ]);
        const STATE = Symbol("state");
        const WRITEENTRY = Symbol("writeEntry");
        const READENTRY = Symbol("readEntry");
        const NEXTENTRY = Symbol("nextEntry");
        const PROCESSENTRY = Symbol("processEntry");
        const EX = Symbol("extendedHeader");
        const GEX = Symbol("globalExtendedHeader");
        const META = Symbol("meta");
        const EMITMETA = Symbol("emitMeta");
        const BUFFER = Symbol("buffer");
        const QUEUE = Symbol("queue");
        const ENDED = Symbol("ended");
        const EMITTEDEND = Symbol("emittedEnd");
        const EMIT = Symbol("emit");
        const UNZIP = Symbol("unzip");
        const CONSUMECHUNK = Symbol("consumeChunk");
        const CONSUMECHUNKSUB = Symbol("consumeChunkSub");
        const CONSUMEBODY = Symbol("consumeBody");
        const CONSUMEMETA = Symbol("consumeMeta");
        const CONSUMEHEADER = Symbol("consumeHeader");
        const CONSUMING = Symbol("consuming");
        const BUFFERCONCAT = Symbol("bufferConcat");
        const MAYBEEND = Symbol("maybeEnd");
        const WRITING = Symbol("writing");
        const ABORTED = Symbol("aborted");
        const DONE = Symbol("onDone");
        const SAW_VALID_ENTRY = Symbol("sawValidEntry");
        const SAW_NULL_BLOCK = Symbol("sawNullBlock");
        const SAW_EOF = Symbol("sawEOF");
        const CLOSESTREAM = Symbol("closeStream");
        const noop = _ => true;
        module.exports = warner(class Parser extends EE {
            constructor(opt) {
                opt = opt || {};
                super(opt);
                this.file = opt.file || "";
                this[SAW_VALID_ENTRY] = null;
                this.on(DONE, _ => {
                    if (this[STATE] === "begin" || this[SAW_VALID_ENTRY] === false) {
                        this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
                    }
                });
                if (opt.ondone) {
                    this.on(DONE, opt.ondone);
                } else {
                    this.on(DONE, _ => {
                        this.emit("prefinish");
                        this.emit("finish");
                        this.emit("end");
                    });
                }
                this.strict = !!opt.strict;
                this.maxMetaEntrySize = opt.maxMetaEntrySize || maxMetaEntrySize;
                this.filter = typeof opt.filter === "function" ? opt.filter : noop;
                const isTBR = opt.file && (opt.file.endsWith(".tar.br") || opt.file.endsWith(".tbr"));
                this.brotli = !opt.gzip && opt.brotli !== undefined ? opt.brotli : isTBR ? undefined : false;
                this.writable = true;
                this.readable = false;
                this[QUEUE] = new Yallist;
                this[BUFFER] = null;
                this[READENTRY] = null;
                this[WRITEENTRY] = null;
                this[STATE] = "begin";
                this[META] = "";
                this[EX] = null;
                this[GEX] = null;
                this[ENDED] = false;
                this[UNZIP] = null;
                this[ABORTED] = false;
                this[SAW_NULL_BLOCK] = false;
                this[SAW_EOF] = false;
                this.on("end", () => this[CLOSESTREAM]());
                if (typeof opt.onwarn === "function") {
                    this.on("warn", opt.onwarn);
                }
                if (typeof opt.onentry === "function") {
                    this.on("entry", opt.onentry);
                }
            }
            [CONSUMEHEADER](chunk, position) {
                if (this[SAW_VALID_ENTRY] === null) {
                    this[SAW_VALID_ENTRY] = false;
                }
                let header;
                try {
                    header = new Header(chunk, position, this[EX], this[GEX]);
                } catch (er) {
                    return this.warn("TAR_ENTRY_INVALID", er);
                }
                if (header.nullBlock) {
                    if (this[SAW_NULL_BLOCK]) {
                        this[SAW_EOF] = true;
                        if (this[STATE] === "begin") {
                            this[STATE] = "header";
                        }
                        this[EMIT]("eof");
                    } else {
                        this[SAW_NULL_BLOCK] = true;
                        this[EMIT]("nullBlock");
                    }
                } else {
                    this[SAW_NULL_BLOCK] = false;
                    if (!header.cksumValid) {
                        this.warn("TAR_ENTRY_INVALID", "checksum failure", {
                            header
                        });
                    } else if (!header.path) {
                        this.warn("TAR_ENTRY_INVALID", "path is required", {
                            header
                        });
                    } else {
                        const type = header.type;
                        if (/^(Symbolic)?Link$/.test(type) && !header.linkpath) {
                            this.warn("TAR_ENTRY_INVALID", "linkpath required", {
                                header
                            });
                        } else if (!/^(Symbolic)?Link$/.test(type) && header.linkpath) {
                            this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", {
                                header
                            });
                        } else {
                            const entry = this[WRITEENTRY] = new Entry(header, this[EX], this[GEX]);
                            if (!this[SAW_VALID_ENTRY]) {
                                if (entry.remain) {
                                    const onend = () => {
                                        if (!entry.invalid) {
                                            this[SAW_VALID_ENTRY] = true;
                                        }
                                    };
                                    entry.on("end", onend);
                                } else {
                                    this[SAW_VALID_ENTRY] = true;
                                }
                            }
                            if (entry.meta) {
                                if (entry.size > this.maxMetaEntrySize) {
                                    entry.ignore = true;
                                    this[EMIT]("ignoredEntry", entry);
                                    this[STATE] = "ignore";
                                    entry.resume();
                                } else if (entry.size > 0) {
                                    this[META] = "";
                                    entry.on("data", c => this[META] += c);
                                    this[STATE] = "meta";
                                }
                            } else {
                                this[EX] = null;
                                entry.ignore = entry.ignore || !this.filter(entry.path, entry);
                                if (entry.ignore) {
                                    this[EMIT]("ignoredEntry", entry);
                                    this[STATE] = entry.remain ? "ignore" : "header";
                                    entry.resume();
                                } else {
                                    if (entry.remain) {
                                        this[STATE] = "body";
                                    } else {
                                        this[STATE] = "header";
                                        entry.end();
                                    }
                                    if (!this[READENTRY]) {
                                        this[QUEUE].push(entry);
                                        this[NEXTENTRY]();
                                    } else {
                                        this[QUEUE].push(entry);
                                    }
                                }
                            }
                        }
                    }
                }
            }
            [CLOSESTREAM]() {
                nextTick(() => this.emit("close"));
            }
            [PROCESSENTRY](entry) {
                let go = true;
                if (!entry) {
                    this[READENTRY] = null;
                    go = false;
                } else if (Array.isArray(entry)) {
                    this.emit.apply(this, entry);
                } else {
                    this[READENTRY] = entry;
                    this.emit("entry", entry);
                    if (!entry.emittedEnd) {
                        entry.on("end", _ => this[NEXTENTRY]());
                        go = false;
                    }
                }
                return go;
            }
            [NEXTENTRY]() {
                do {} while (this[PROCESSENTRY](this[QUEUE].shift()));
                if (!this[QUEUE].length) {
                    const re = this[READENTRY];
                    const drainNow = !re || re.flowing || re.size === re.remain;
                    if (drainNow) {
                        if (!this[WRITING]) {
                            this.emit("drain");
                        }
                    } else {
                        re.once("drain", _ => this.emit("drain"));
                    }
                }
            }
            [CONSUMEBODY](chunk, position) {
                const entry = this[WRITEENTRY];
                const br = entry.blockRemain;
                const c = br >= chunk.length && position === 0 ? chunk : chunk.slice(position, position + br);
                entry.write(c);
                if (!entry.blockRemain) {
                    this[STATE] = "header";
                    this[WRITEENTRY] = null;
                    entry.end();
                }
                return c.length;
            }
            [CONSUMEMETA](chunk, position) {
                const entry = this[WRITEENTRY];
                const ret = this[CONSUMEBODY](chunk, position);
                if (!this[WRITEENTRY]) {
                    this[EMITMETA](entry);
                }
                return ret;
            }
            [EMIT](ev, data, extra) {
                if (!this[QUEUE].length && !this[READENTRY]) {
                    this.emit(ev, data, extra);
                } else {
                    this[QUEUE].push([ ev, data, extra ]);
                }
            }
            [EMITMETA](entry) {
                this[EMIT]("meta", this[META]);
                switch (entry.type) {
                  case "ExtendedHeader":
                  case "OldExtendedHeader":
                    this[EX] = Pax.parse(this[META], this[EX], false);
                    break;

                  case "GlobalExtendedHeader":
                    this[GEX] = Pax.parse(this[META], this[GEX], true);
                    break;

                  case "NextFileHasLongPath":
                  case "OldGnuLongPath":
                    this[EX] = this[EX] || Object.create(null);
                    this[EX].path = this[META].replace(/\0.*/, "");
                    break;

                  case "NextFileHasLongLinkpath":
                    this[EX] = this[EX] || Object.create(null);
                    this[EX].linkpath = this[META].replace(/\0.*/, "");
                    break;

                  default:
                    throw new Error("unknown meta: " + entry.type);
                }
            }
            abort(error) {
                this[ABORTED] = true;
                this.emit("abort", error);
                this.warn("TAR_ABORT", error, {
                    recoverable: false
                });
            }
            write(chunk) {
                if (this[ABORTED]) {
                    return;
                }
                const needSniff = this[UNZIP] === null || this.brotli === undefined && this[UNZIP] === false;
                if (needSniff && chunk) {
                    if (this[BUFFER]) {
                        chunk = Buffer.concat([ this[BUFFER], chunk ]);
                        this[BUFFER] = null;
                    }
                    if (chunk.length < gzipHeader.length) {
                        this[BUFFER] = chunk;
                        return true;
                    }
                    for (let i = 0; this[UNZIP] === null && i < gzipHeader.length; i++) {
                        if (chunk[i] !== gzipHeader[i]) {
                            this[UNZIP] = false;
                        }
                    }
                    const maybeBrotli = this.brotli === undefined;
                    if (this[UNZIP] === false && maybeBrotli) {
                        if (chunk.length < 512) {
                            if (this[ENDED]) {
                                this.brotli = true;
                            } else {
                                this[BUFFER] = chunk;
                                return true;
                            }
                        } else {
                            try {
                                new Header(chunk.slice(0, 512));
                                this.brotli = false;
                            } catch (_) {
                                this.brotli = true;
                            }
                        }
                    }
                    if (this[UNZIP] === null || this[UNZIP] === false && this.brotli) {
                        const ended = this[ENDED];
                        this[ENDED] = false;
                        this[UNZIP] = this[UNZIP] === null ? new zlib.Unzip : new zlib.BrotliDecompress;
                        this[UNZIP].on("data", chunk => this[CONSUMECHUNK](chunk));
                        this[UNZIP].on("error", er => this.abort(er));
                        this[UNZIP].on("end", _ => {
                            this[ENDED] = true;
                            this[CONSUMECHUNK]();
                        });
                        this[WRITING] = true;
                        const ret = this[UNZIP][ended ? "end" : "write"](chunk);
                        this[WRITING] = false;
                        return ret;
                    }
                }
                this[WRITING] = true;
                if (this[UNZIP]) {
                    this[UNZIP].write(chunk);
                } else {
                    this[CONSUMECHUNK](chunk);
                }
                this[WRITING] = false;
                const ret = this[QUEUE].length ? false : this[READENTRY] ? this[READENTRY].flowing : true;
                if (!ret && !this[QUEUE].length) {
                    this[READENTRY].once("drain", _ => this.emit("drain"));
                }
                return ret;
            }
            [BUFFERCONCAT](c) {
                if (c && !this[ABORTED]) {
                    this[BUFFER] = this[BUFFER] ? Buffer.concat([ this[BUFFER], c ]) : c;
                }
            }
            [MAYBEEND]() {
                if (this[ENDED] && !this[EMITTEDEND] && !this[ABORTED] && !this[CONSUMING]) {
                    this[EMITTEDEND] = true;
                    const entry = this[WRITEENTRY];
                    if (entry && entry.blockRemain) {
                        const have = this[BUFFER] ? this[BUFFER].length : 0;
                        this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${entry.blockRemain} more bytes, only ${have} available)`, {
                            entry
                        });
                        if (this[BUFFER]) {
                            entry.write(this[BUFFER]);
                        }
                        entry.end();
                    }
                    this[EMIT](DONE);
                }
            }
            [CONSUMECHUNK](chunk) {
                if (this[CONSUMING]) {
                    this[BUFFERCONCAT](chunk);
                } else if (!chunk && !this[BUFFER]) {
                    this[MAYBEEND]();
                } else {
                    this[CONSUMING] = true;
                    if (this[BUFFER]) {
                        this[BUFFERCONCAT](chunk);
                        const c = this[BUFFER];
                        this[BUFFER] = null;
                        this[CONSUMECHUNKSUB](c);
                    } else {
                        this[CONSUMECHUNKSUB](chunk);
                    }
                    while (this[BUFFER] && this[BUFFER].length >= 512 && !this[ABORTED] && !this[SAW_EOF]) {
                        const c = this[BUFFER];
                        this[BUFFER] = null;
                        this[CONSUMECHUNKSUB](c);
                    }
                    this[CONSUMING] = false;
                }
                if (!this[BUFFER] || this[ENDED]) {
                    this[MAYBEEND]();
                }
            }
            [CONSUMECHUNKSUB](chunk) {
                let position = 0;
                const length = chunk.length;
                while (position + 512 <= length && !this[ABORTED] && !this[SAW_EOF]) {
                    switch (this[STATE]) {
                      case "begin":
                      case "header":
                        this[CONSUMEHEADER](chunk, position);
                        position += 512;
                        break;

                      case "ignore":
                      case "body":
                        position += this[CONSUMEBODY](chunk, position);
                        break;

                      case "meta":
                        position += this[CONSUMEMETA](chunk, position);
                        break;

                      default:
                        throw new Error("invalid state: " + this[STATE]);
                    }
                }
                if (position < length) {
                    if (this[BUFFER]) {
                        this[BUFFER] = Buffer.concat([ chunk.slice(position), this[BUFFER] ]);
                    } else {
                        this[BUFFER] = chunk.slice(position);
                    }
                }
            }
            end(chunk) {
                if (!this[ABORTED]) {
                    if (this[UNZIP]) {
                        this[UNZIP].end(chunk);
                    } else {
                        this[ENDED] = true;
                        if (this.brotli === undefined) chunk = chunk || Buffer.alloc(0);
                        this.write(chunk);
                    }
                }
            }
        });
    },
    2083(module, __unused_webpack_exports, __webpack_require__) {
        const assert = __webpack_require__(2613);
        const normalize = __webpack_require__(1591);
        const stripSlashes = __webpack_require__(3238);
        const {join} = __webpack_require__(6928);
        const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
        const isWindows = platform === "win32";
        module.exports = () => {
            const queues = new Map;
            const reservations = new Map;
            const getDirs = path => {
                const dirs = path.split("/").slice(0, -1).reduce((set, path) => {
                    if (set.length) {
                        path = join(set[set.length - 1], path);
                    }
                    set.push(path || "/");
                    return set;
                }, []);
                return dirs;
            };
            const running = new Set;
            const getQueues = fn => {
                const res = reservations.get(fn);
                if (!res) {
                    throw new Error("function does not have any path reservations");
                }
                return {
                    paths: res.paths.map(path => queues.get(path)),
                    dirs: [ ...res.dirs ].map(path => queues.get(path))
                };
            };
            const check = fn => {
                const {paths, dirs} = getQueues(fn);
                return paths.every(q => q[0] === fn) && dirs.every(q => q[0] instanceof Set && q[0].has(fn));
            };
            const run = fn => {
                if (running.has(fn) || !check(fn)) {
                    return false;
                }
                running.add(fn);
                fn(() => clear(fn));
                return true;
            };
            const clear = fn => {
                if (!running.has(fn)) {
                    return false;
                }
                const {paths, dirs} = reservations.get(fn);
                const next = new Set;
                paths.forEach(path => {
                    const q = queues.get(path);
                    assert.equal(q[0], fn);
                    if (q.length === 1) {
                        queues.delete(path);
                    } else {
                        q.shift();
                        if (typeof q[0] === "function") {
                            next.add(q[0]);
                        } else {
                            q[0].forEach(fn => next.add(fn));
                        }
                    }
                });
                dirs.forEach(dir => {
                    const q = queues.get(dir);
                    assert(q[0] instanceof Set);
                    if (q[0].size === 1 && q.length === 1) {
                        queues.delete(dir);
                    } else if (q[0].size === 1) {
                        q.shift();
                        next.add(q[0]);
                    } else {
                        q[0].delete(fn);
                    }
                });
                running.delete(fn);
                next.forEach(fn => run(fn));
                return true;
            };
            const reserve = (paths, fn) => {
                paths = isWindows ? [ "win32 parallelization disabled" ] : paths.map(p => stripSlashes(join(normalize(p))).toLowerCase());
                const dirs = new Set(paths.map(path => getDirs(path)).reduce((a, b) => a.concat(b)));
                reservations.set(fn, {
                    dirs,
                    paths
                });
                paths.forEach(path => {
                    const q = queues.get(path);
                    if (!q) {
                        queues.set(path, [ fn ]);
                    } else {
                        q.push(fn);
                    }
                });
                dirs.forEach(dir => {
                    const q = queues.get(dir);
                    if (!q) {
                        queues.set(dir, [ new Set([ fn ]) ]);
                    } else if (q[q.length - 1] instanceof Set) {
                        q[q.length - 1].add(fn);
                    } else {
                        q.push(new Set([ fn ]));
                    }
                });
                return run(fn);
            };
            return {
                check,
                reserve
            };
        };
    },
    8107(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const Header = __webpack_require__(8657);
        const path = __webpack_require__(6928);
        class Pax {
            constructor(obj, global) {
                this.atime = obj.atime || null;
                this.charset = obj.charset || null;
                this.comment = obj.comment || null;
                this.ctime = obj.ctime || null;
                this.gid = obj.gid || null;
                this.gname = obj.gname || null;
                this.linkpath = obj.linkpath || null;
                this.mtime = obj.mtime || null;
                this.path = obj.path || null;
                this.size = obj.size || null;
                this.uid = obj.uid || null;
                this.uname = obj.uname || null;
                this.dev = obj.dev || null;
                this.ino = obj.ino || null;
                this.nlink = obj.nlink || null;
                this.global = global || false;
            }
            encode() {
                const body = this.encodeBody();
                if (body === "") {
                    return null;
                }
                const bodyLen = Buffer.byteLength(body);
                const bufLen = 512 * Math.ceil(1 + bodyLen / 512);
                const buf = Buffer.allocUnsafe(bufLen);
                for (let i = 0; i < 512; i++) {
                    buf[i] = 0;
                }
                new Header({
                    path: ("PaxHeader/" + path.basename(this.path)).slice(0, 99),
                    mode: this.mode || 420,
                    uid: this.uid || null,
                    gid: this.gid || null,
                    size: bodyLen,
                    mtime: this.mtime || null,
                    type: this.global ? "GlobalExtendedHeader" : "ExtendedHeader",
                    linkpath: "",
                    uname: this.uname || "",
                    gname: this.gname || "",
                    devmaj: 0,
                    devmin: 0,
                    atime: this.atime || null,
                    ctime: this.ctime || null
                }).encode(buf);
                buf.write(body, 512, bodyLen, "utf8");
                for (let i = bodyLen + 512; i < buf.length; i++) {
                    buf[i] = 0;
                }
                return buf;
            }
            encodeBody() {
                return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
            }
            encodeField(field) {
                if (this[field] === null || this[field] === undefined) {
                    return "";
                }
                const v = this[field] instanceof Date ? this[field].getTime() / 1e3 : this[field];
                const s = " " + (field === "dev" || field === "ino" || field === "nlink" ? "SCHILY." : "") + field + "=" + v + "\n";
                const byteLen = Buffer.byteLength(s);
                let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1;
                if (byteLen + digits >= Math.pow(10, digits)) {
                    digits += 1;
                }
                const len = digits + byteLen;
                return len + s;
            }
        }
        Pax.parse = (string, ex, g) => new Pax(merge(parseKV(string), ex), g);
        const merge = (a, b) => b ? Object.keys(a).reduce((s, k) => (s[k] = a[k], s), b) : a;
        const parseKV = string => string.replace(/\n$/, "").split("\n").reduce(parseKVLine, Object.create(null));
        const parseKVLine = (set, line) => {
            const n = parseInt(line, 10);
            if (n !== Buffer.byteLength(line) + 1) {
                return set;
            }
            line = line.slice((n + " ").length);
            const kv = line.split("=");
            const k = kv.shift().replace(/^SCHILY\.(dev|ino|nlink)/, "$1");
            if (!k) {
                return set;
            }
            const v = kv.join("=");
            set[k] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(k) ? new Date(v * 1e3) : /^[0-9]+$/.test(v) ? +v : v;
            return set;
        };
        module.exports = Pax;
    },
    6989(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const {Minipass} = __webpack_require__(8769);
        const normPath = __webpack_require__(1793);
        const SLURP = Symbol("slurp");
        module.exports = class ReadEntry extends Minipass {
            constructor(header, ex, gex) {
                super();
                this.pause();
                this.extended = ex;
                this.globalExtended = gex;
                this.header = header;
                this.startBlockSize = 512 * Math.ceil(header.size / 512);
                this.blockRemain = this.startBlockSize;
                this.remain = header.size;
                this.type = header.type;
                this.meta = false;
                this.ignore = false;
                switch (this.type) {
                  case "File":
                  case "OldFile":
                  case "Link":
                  case "SymbolicLink":
                  case "CharacterDevice":
                  case "BlockDevice":
                  case "Directory":
                  case "FIFO":
                  case "ContiguousFile":
                  case "GNUDumpDir":
                    break;

                  case "NextFileHasLongLinkpath":
                  case "NextFileHasLongPath":
                  case "OldGnuLongPath":
                  case "GlobalExtendedHeader":
                  case "ExtendedHeader":
                  case "OldExtendedHeader":
                    this.meta = true;
                    break;

                  default:
                    this.ignore = true;
                }
                this.path = normPath(header.path);
                this.mode = header.mode;
                if (this.mode) {
                    this.mode = this.mode & 4095;
                }
                this.uid = header.uid;
                this.gid = header.gid;
                this.uname = header.uname;
                this.gname = header.gname;
                this.size = header.size;
                this.mtime = header.mtime;
                this.atime = header.atime;
                this.ctime = header.ctime;
                this.linkpath = normPath(header.linkpath);
                this.uname = header.uname;
                this.gname = header.gname;
                if (ex) {
                    this[SLURP](ex);
                }
                if (gex) {
                    this[SLURP](gex, true);
                }
            }
            write(data) {
                const writeLen = data.length;
                if (writeLen > this.blockRemain) {
                    throw new Error("writing more to entry than is appropriate");
                }
                const r = this.remain;
                const br = this.blockRemain;
                this.remain = Math.max(0, r - writeLen);
                this.blockRemain = Math.max(0, br - writeLen);
                if (this.ignore) {
                    return true;
                }
                if (r >= writeLen) {
                    return super.write(data);
                }
                return super.write(data.slice(0, r));
            }
            [SLURP](ex, global) {
                for (const k in ex) {
                    if (ex[k] !== null && ex[k] !== undefined && !(global && k === "path")) {
                        this[k] = k === "path" || k === "linkpath" ? normPath(ex[k]) : ex[k];
                    }
                }
            }
        };
    },
    3498(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const hlo = __webpack_require__(5659);
        const Pack = __webpack_require__(453);
        const fs = __webpack_require__(9896);
        const fsm = __webpack_require__(4857);
        const t = __webpack_require__(6492);
        const path = __webpack_require__(6928);
        const Header = __webpack_require__(8657);
        module.exports = (opt_, files, cb) => {
            const opt = hlo(opt_);
            if (!opt.file) {
                throw new TypeError("file is required");
            }
            if (opt.gzip || opt.brotli || opt.file.endsWith(".br") || opt.file.endsWith(".tbr")) {
                throw new TypeError("cannot append to compressed archives");
            }
            if (!files || !Array.isArray(files) || !files.length) {
                throw new TypeError("no files or directories specified");
            }
            files = Array.from(files);
            return opt.sync ? replaceSync(opt, files) : replace(opt, files, cb);
        };
        const replaceSync = (opt, files) => {
            const p = new Pack.Sync(opt);
            let threw = true;
            let fd;
            let position;
            try {
                try {
                    fd = fs.openSync(opt.file, "r+");
                } catch (er) {
                    if (er.code === "ENOENT") {
                        fd = fs.openSync(opt.file, "w+");
                    } else {
                        throw er;
                    }
                }
                const st = fs.fstatSync(fd);
                const headBuf = Buffer.alloc(512);
                POSITION: for (position = 0; position < st.size; position += 512) {
                    for (let bufPos = 0, bytes = 0; bufPos < 512; bufPos += bytes) {
                        bytes = fs.readSync(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos);
                        if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
                            throw new Error("cannot append to compressed archives");
                        }
                        if (!bytes) {
                            break POSITION;
                        }
                    }
                    const h = new Header(headBuf);
                    if (!h.cksumValid) {
                        break;
                    }
                    const entryBlockSize = 512 * Math.ceil(h.size / 512);
                    if (position + entryBlockSize + 512 > st.size) {
                        break;
                    }
                    position += entryBlockSize;
                    if (opt.mtimeCache) {
                        opt.mtimeCache.set(h.path, h.mtime);
                    }
                }
                threw = false;
                streamSync(opt, p, position, fd, files);
            } finally {
                if (threw) {
                    try {
                        fs.closeSync(fd);
                    } catch (er) {}
                }
            }
        };
        const streamSync = (opt, p, position, fd, files) => {
            const stream = new fsm.WriteStreamSync(opt.file, {
                fd,
                start: position
            });
            p.pipe(stream);
            addFilesSync(p, files);
        };
        const replace = (opt, files, cb) => {
            files = Array.from(files);
            const p = new Pack(opt);
            const getPos = (fd, size, cb_) => {
                const cb = (er, pos) => {
                    if (er) {
                        fs.close(fd, _ => cb_(er));
                    } else {
                        cb_(null, pos);
                    }
                };
                let position = 0;
                if (size === 0) {
                    return cb(null, 0);
                }
                let bufPos = 0;
                const headBuf = Buffer.alloc(512);
                const onread = (er, bytes) => {
                    if (er) {
                        return cb(er);
                    }
                    bufPos += bytes;
                    if (bufPos < 512 && bytes) {
                        return fs.read(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos, onread);
                    }
                    if (position === 0 && headBuf[0] === 31 && headBuf[1] === 139) {
                        return cb(new Error("cannot append to compressed archives"));
                    }
                    if (bufPos < 512) {
                        return cb(null, position);
                    }
                    const h = new Header(headBuf);
                    if (!h.cksumValid) {
                        return cb(null, position);
                    }
                    const entryBlockSize = 512 * Math.ceil(h.size / 512);
                    if (position + entryBlockSize + 512 > size) {
                        return cb(null, position);
                    }
                    position += entryBlockSize + 512;
                    if (position >= size) {
                        return cb(null, position);
                    }
                    if (opt.mtimeCache) {
                        opt.mtimeCache.set(h.path, h.mtime);
                    }
                    bufPos = 0;
                    fs.read(fd, headBuf, 0, 512, position, onread);
                };
                fs.read(fd, headBuf, 0, 512, position, onread);
            };
            const promise = new Promise((resolve, reject) => {
                p.on("error", reject);
                let flag = "r+";
                const onopen = (er, fd) => {
                    if (er && er.code === "ENOENT" && flag === "r+") {
                        flag = "w+";
                        return fs.open(opt.file, flag, onopen);
                    }
                    if (er) {
                        return reject(er);
                    }
                    fs.fstat(fd, (er, st) => {
                        if (er) {
                            return fs.close(fd, () => reject(er));
                        }
                        getPos(fd, st.size, (er, position) => {
                            if (er) {
                                return reject(er);
                            }
                            const stream = new fsm.WriteStream(opt.file, {
                                fd,
                                start: position
                            });
                            p.pipe(stream);
                            stream.on("error", reject);
                            stream.on("close", resolve);
                            addFilesAsync(p, files);
                        });
                    });
                };
                fs.open(opt.file, flag, onopen);
            });
            return cb ? promise.then(cb, cb) : promise;
        };
        const addFilesSync = (p, files) => {
            files.forEach(file => {
                if (file.charAt(0) === "@") {
                    t({
                        file: path.resolve(p.cwd, file.slice(1)),
                        sync: true,
                        noResume: true,
                        onentry: entry => p.add(entry)
                    });
                } else {
                    p.add(file);
                }
            });
            p.end();
        };
        const addFilesAsync = (p, files) => {
            while (files.length) {
                const file = files.shift();
                if (file.charAt(0) === "@") {
                    return t({
                        file: path.resolve(p.cwd, file.slice(1)),
                        noResume: true,
                        onentry: entry => p.add(entry)
                    }).then(_ => addFilesAsync(p, files));
                } else {
                    p.add(file);
                }
            }
            p.end();
        };
    },
    5446(module, __unused_webpack_exports, __webpack_require__) {
        const {isAbsolute, parse} = __webpack_require__(6928).win32;
        module.exports = path => {
            let r = "";
            let parsed = parse(path);
            while (isAbsolute(path) || parsed.root) {
                const root = path.charAt(0) === "/" && path.slice(0, 4) !== "//?/" ? "/" : parsed.root;
                path = path.slice(root.length);
                r += root;
                parsed = parse(path);
            }
            return [ r, path ];
        };
    },
    3238(module) {
        module.exports = str => {
            let i = str.length - 1;
            let slashesStart = -1;
            while (i > -1 && str.charAt(i) === "/") {
                slashesStart = i;
                i--;
            }
            return slashesStart === -1 ? str : str.slice(0, slashesStart);
        };
    },
    4755(__unused_webpack_module, exports) {
        "use strict";
        exports.name = new Map([ [ "0", "File" ], [ "", "OldFile" ], [ "1", "Link" ], [ "2", "SymbolicLink" ], [ "3", "CharacterDevice" ], [ "4", "BlockDevice" ], [ "5", "Directory" ], [ "6", "FIFO" ], [ "7", "ContiguousFile" ], [ "g", "GlobalExtendedHeader" ], [ "x", "ExtendedHeader" ], [ "A", "SolarisACL" ], [ "D", "GNUDumpDir" ], [ "I", "Inode" ], [ "K", "NextFileHasLongLinkpath" ], [ "L", "NextFileHasLongPath" ], [ "M", "ContinuationFile" ], [ "N", "OldGnuLongPath" ], [ "S", "SparseFile" ], [ "V", "TapeVolumeHeader" ], [ "X", "OldExtendedHeader" ] ]);
        exports.code = new Map(Array.from(exports.name).map(kv => [ kv[1], kv[0] ]));
    },
    3394(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const assert = __webpack_require__(2613);
        const Parser = __webpack_require__(6237);
        const fs = __webpack_require__(9896);
        const fsm = __webpack_require__(4857);
        const path = __webpack_require__(6928);
        const mkdir = __webpack_require__(6097);
        const wc = __webpack_require__(451);
        const pathReservations = __webpack_require__(2083);
        const stripAbsolutePath = __webpack_require__(5446);
        const normPath = __webpack_require__(1793);
        const stripSlash = __webpack_require__(3238);
        const normalize = __webpack_require__(1591);
        const ONENTRY = Symbol("onEntry");
        const CHECKFS = Symbol("checkFs");
        const CHECKFS2 = Symbol("checkFs2");
        const PRUNECACHE = Symbol("pruneCache");
        const ISREUSABLE = Symbol("isReusable");
        const MAKEFS = Symbol("makeFs");
        const FILE = Symbol("file");
        const DIRECTORY = Symbol("directory");
        const LINK = Symbol("link");
        const SYMLINK = Symbol("symlink");
        const HARDLINK = Symbol("hardlink");
        const UNSUPPORTED = Symbol("unsupported");
        const CHECKPATH = Symbol("checkPath");
        const MKDIR = Symbol("mkdir");
        const ONERROR = Symbol("onError");
        const PENDING = Symbol("pending");
        const PEND = Symbol("pend");
        const UNPEND = Symbol("unpend");
        const ENDED = Symbol("ended");
        const MAYBECLOSE = Symbol("maybeClose");
        const SKIP = Symbol("skip");
        const DOCHOWN = Symbol("doChown");
        const UID = Symbol("uid");
        const GID = Symbol("gid");
        const CHECKED_CWD = Symbol("checkedCwd");
        const crypto = __webpack_require__(6982);
        const getFlag = __webpack_require__(6435);
        const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
        const isWindows = platform === "win32";
        const DEFAULT_MAX_DEPTH = 1024;
        const unlinkFile = (path, cb) => {
            if (!isWindows) {
                return fs.unlink(path, cb);
            }
            const name = path + ".DELETE." + crypto.randomBytes(16).toString("hex");
            fs.rename(path, name, er => {
                if (er) {
                    return cb(er);
                }
                fs.unlink(name, cb);
            });
        };
        const unlinkFileSync = path => {
            if (!isWindows) {
                return fs.unlinkSync(path);
            }
            const name = path + ".DELETE." + crypto.randomBytes(16).toString("hex");
            fs.renameSync(path, name);
            fs.unlinkSync(name);
        };
        const uint32 = (a, b, c) => a === a >>> 0 ? a : b === b >>> 0 ? b : c;
        const cacheKeyNormalize = path => stripSlash(normPath(normalize(path))).toLowerCase();
        const pruneCache = (cache, abs) => {
            abs = cacheKeyNormalize(abs);
            for (const path of cache.keys()) {
                const pnorm = cacheKeyNormalize(path);
                if (pnorm === abs || pnorm.indexOf(abs + "/") === 0) {
                    cache.delete(path);
                }
            }
        };
        const dropCache = cache => {
            for (const key of cache.keys()) {
                cache.delete(key);
            }
        };
        class Unpack extends Parser {
            constructor(opt) {
                if (!opt) {
                    opt = {};
                }
                opt.ondone = _ => {
                    this[ENDED] = true;
                    this[MAYBECLOSE]();
                };
                super(opt);
                this[CHECKED_CWD] = false;
                this.reservations = pathReservations();
                this.transform = typeof opt.transform === "function" ? opt.transform : null;
                this.writable = true;
                this.readable = false;
                this[PENDING] = 0;
                this[ENDED] = false;
                this.dirCache = opt.dirCache || new Map;
                if (typeof opt.uid === "number" || typeof opt.gid === "number") {
                    if (typeof opt.uid !== "number" || typeof opt.gid !== "number") {
                        throw new TypeError("cannot set owner without number uid and gid");
                    }
                    if (opt.preserveOwner) {
                        throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
                    }
                    this.uid = opt.uid;
                    this.gid = opt.gid;
                    this.setOwner = true;
                } else {
                    this.uid = null;
                    this.gid = null;
                    this.setOwner = false;
                }
                if (opt.preserveOwner === undefined && typeof opt.uid !== "number") {
                    this.preserveOwner = process.getuid && process.getuid() === 0;
                } else {
                    this.preserveOwner = !!opt.preserveOwner;
                }
                this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : null;
                this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : null;
                this.maxDepth = typeof opt.maxDepth === "number" ? opt.maxDepth : DEFAULT_MAX_DEPTH;
                this.forceChown = opt.forceChown === true;
                this.win32 = !!opt.win32 || isWindows;
                this.newer = !!opt.newer;
                this.keep = !!opt.keep;
                this.noMtime = !!opt.noMtime;
                this.preservePaths = !!opt.preservePaths;
                this.unlink = !!opt.unlink;
                this.cwd = normPath(path.resolve(opt.cwd || process.cwd()));
                this.strip = +opt.strip || 0;
                this.processUmask = opt.noChmod ? 0 : process.umask();
                this.umask = typeof opt.umask === "number" ? opt.umask : this.processUmask;
                this.dmode = opt.dmode || 511 & ~this.umask;
                this.fmode = opt.fmode || 438 & ~this.umask;
                this.on("entry", entry => this[ONENTRY](entry));
            }
            warn(code, msg, data = {}) {
                if (code === "TAR_BAD_ARCHIVE" || code === "TAR_ABORT") {
                    data.recoverable = false;
                }
                return super.warn(code, msg, data);
            }
            [MAYBECLOSE]() {
                if (this[ENDED] && this[PENDING] === 0) {
                    this.emit("prefinish");
                    this.emit("finish");
                    this.emit("end");
                }
            }
            [CHECKPATH](entry) {
                const p = normPath(entry.path);
                const parts = p.split("/");
                if (this.strip) {
                    if (parts.length < this.strip) {
                        return false;
                    }
                    if (entry.type === "Link") {
                        const linkparts = normPath(entry.linkpath).split("/");
                        if (linkparts.length >= this.strip) {
                            entry.linkpath = linkparts.slice(this.strip).join("/");
                        } else {
                            return false;
                        }
                    }
                    parts.splice(0, this.strip);
                    entry.path = parts.join("/");
                }
                if (isFinite(this.maxDepth) && parts.length > this.maxDepth) {
                    this.warn("TAR_ENTRY_ERROR", "path excessively deep", {
                        entry,
                        path: p,
                        depth: parts.length,
                        maxDepth: this.maxDepth
                    });
                    return false;
                }
                if (!this.preservePaths) {
                    if (parts.includes("..") || isWindows && /^[a-z]:\.\.$/i.test(parts[0])) {
                        this.warn("TAR_ENTRY_ERROR", `path contains '..'`, {
                            entry,
                            path: p
                        });
                        return false;
                    }
                    const [root, stripped] = stripAbsolutePath(p);
                    if (root) {
                        entry.path = stripped;
                        this.warn("TAR_ENTRY_INFO", `stripping ${root} from absolute path`, {
                            entry,
                            path: p
                        });
                    }
                }
                if (path.isAbsolute(entry.path)) {
                    entry.absolute = normPath(path.resolve(entry.path));
                } else {
                    entry.absolute = normPath(path.resolve(this.cwd, entry.path));
                }
                if (!this.preservePaths && entry.absolute.indexOf(this.cwd + "/") !== 0 && entry.absolute !== this.cwd) {
                    this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", {
                        entry,
                        path: normPath(entry.path),
                        resolvedPath: entry.absolute,
                        cwd: this.cwd
                    });
                    return false;
                }
                if (entry.absolute === this.cwd && entry.type !== "Directory" && entry.type !== "GNUDumpDir") {
                    return false;
                }
                if (this.win32) {
                    const {root: aRoot} = path.win32.parse(entry.absolute);
                    entry.absolute = aRoot + wc.encode(entry.absolute.slice(aRoot.length));
                    const {root: pRoot} = path.win32.parse(entry.path);
                    entry.path = pRoot + wc.encode(entry.path.slice(pRoot.length));
                }
                return true;
            }
            [ONENTRY](entry) {
                if (!this[CHECKPATH](entry)) {
                    return entry.resume();
                }
                assert.equal(typeof entry.absolute, "string");
                switch (entry.type) {
                  case "Directory":
                  case "GNUDumpDir":
                    if (entry.mode) {
                        entry.mode = entry.mode | 448;
                    }

                  case "File":
                  case "OldFile":
                  case "ContiguousFile":
                  case "Link":
                  case "SymbolicLink":
                    return this[CHECKFS](entry);

                  case "CharacterDevice":
                  case "BlockDevice":
                  case "FIFO":
                  default:
                    return this[UNSUPPORTED](entry);
                }
            }
            [ONERROR](er, entry) {
                if (er.name === "CwdError") {
                    this.emit("error", er);
                } else {
                    this.warn("TAR_ENTRY_ERROR", er, {
                        entry
                    });
                    this[UNPEND]();
                    entry.resume();
                }
            }
            [MKDIR](dir, mode, cb) {
                mkdir(normPath(dir), {
                    uid: this.uid,
                    gid: this.gid,
                    processUid: this.processUid,
                    processGid: this.processGid,
                    umask: this.processUmask,
                    preserve: this.preservePaths,
                    unlink: this.unlink,
                    cache: this.dirCache,
                    cwd: this.cwd,
                    mode,
                    noChmod: this.noChmod
                }, cb);
            }
            [DOCHOWN](entry) {
                return this.forceChown || this.preserveOwner && (typeof entry.uid === "number" && entry.uid !== this.processUid || typeof entry.gid === "number" && entry.gid !== this.processGid) || (typeof this.uid === "number" && this.uid !== this.processUid || typeof this.gid === "number" && this.gid !== this.processGid);
            }
            [UID](entry) {
                return uint32(this.uid, entry.uid, this.processUid);
            }
            [GID](entry) {
                return uint32(this.gid, entry.gid, this.processGid);
            }
            [FILE](entry, fullyDone) {
                const mode = entry.mode & 4095 || this.fmode;
                const stream = new fsm.WriteStream(entry.absolute, {
                    flags: getFlag(entry.size),
                    mode,
                    autoClose: false
                });
                stream.on("error", er => {
                    if (stream.fd) {
                        fs.close(stream.fd, () => {});
                    }
                    stream.write = () => true;
                    this[ONERROR](er, entry);
                    fullyDone();
                });
                let actions = 1;
                const done = er => {
                    if (er) {
                        if (stream.fd) {
                            fs.close(stream.fd, () => {});
                        }
                        this[ONERROR](er, entry);
                        fullyDone();
                        return;
                    }
                    if (--actions === 0) {
                        fs.close(stream.fd, er => {
                            if (er) {
                                this[ONERROR](er, entry);
                            } else {
                                this[UNPEND]();
                            }
                            fullyDone();
                        });
                    }
                };
                stream.on("finish", _ => {
                    const abs = entry.absolute;
                    const fd = stream.fd;
                    if (entry.mtime && !this.noMtime) {
                        actions++;
                        const atime = entry.atime || new Date;
                        const mtime = entry.mtime;
                        fs.futimes(fd, atime, mtime, er => er ? fs.utimes(abs, atime, mtime, er2 => done(er2 && er)) : done());
                    }
                    if (this[DOCHOWN](entry)) {
                        actions++;
                        const uid = this[UID](entry);
                        const gid = this[GID](entry);
                        fs.fchown(fd, uid, gid, er => er ? fs.chown(abs, uid, gid, er2 => done(er2 && er)) : done());
                    }
                    done();
                });
                const tx = this.transform ? this.transform(entry) || entry : entry;
                if (tx !== entry) {
                    tx.on("error", er => {
                        this[ONERROR](er, entry);
                        fullyDone();
                    });
                    entry.pipe(tx);
                }
                tx.pipe(stream);
            }
            [DIRECTORY](entry, fullyDone) {
                const mode = entry.mode & 4095 || this.dmode;
                this[MKDIR](entry.absolute, mode, er => {
                    if (er) {
                        this[ONERROR](er, entry);
                        fullyDone();
                        return;
                    }
                    let actions = 1;
                    const done = _ => {
                        if (--actions === 0) {
                            fullyDone();
                            this[UNPEND]();
                            entry.resume();
                        }
                    };
                    if (entry.mtime && !this.noMtime) {
                        actions++;
                        fs.utimes(entry.absolute, entry.atime || new Date, entry.mtime, done);
                    }
                    if (this[DOCHOWN](entry)) {
                        actions++;
                        fs.chown(entry.absolute, this[UID](entry), this[GID](entry), done);
                    }
                    done();
                });
            }
            [UNSUPPORTED](entry) {
                entry.unsupported = true;
                this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${entry.type}`, {
                    entry
                });
                entry.resume();
            }
            [SYMLINK](entry, done) {
                this[LINK](entry, entry.linkpath, "symlink", done);
            }
            [HARDLINK](entry, done) {
                const linkpath = normPath(path.resolve(this.cwd, entry.linkpath));
                this[LINK](entry, linkpath, "link", done);
            }
            [PEND]() {
                this[PENDING]++;
            }
            [UNPEND]() {
                this[PENDING]--;
                this[MAYBECLOSE]();
            }
            [SKIP](entry) {
                this[UNPEND]();
                entry.resume();
            }
            [ISREUSABLE](entry, st) {
                return entry.type === "File" && !this.unlink && st.isFile() && st.nlink <= 1 && !isWindows;
            }
            [CHECKFS](entry) {
                this[PEND]();
                const paths = [ entry.path ];
                if (entry.linkpath) {
                    paths.push(entry.linkpath);
                }
                this.reservations.reserve(paths, done => this[CHECKFS2](entry, done));
            }
            [PRUNECACHE](entry) {
                if (entry.type === "SymbolicLink") {
                    dropCache(this.dirCache);
                } else if (entry.type !== "Directory") {
                    pruneCache(this.dirCache, entry.absolute);
                }
            }
            [CHECKFS2](entry, fullyDone) {
                this[PRUNECACHE](entry);
                const done = er => {
                    this[PRUNECACHE](entry);
                    fullyDone(er);
                };
                const checkCwd = () => {
                    this[MKDIR](this.cwd, this.dmode, er => {
                        if (er) {
                            this[ONERROR](er, entry);
                            done();
                            return;
                        }
                        this[CHECKED_CWD] = true;
                        start();
                    });
                };
                const start = () => {
                    if (entry.absolute !== this.cwd) {
                        const parent = normPath(path.dirname(entry.absolute));
                        if (parent !== this.cwd) {
                            return this[MKDIR](parent, this.dmode, er => {
                                if (er) {
                                    this[ONERROR](er, entry);
                                    done();
                                    return;
                                }
                                afterMakeParent();
                            });
                        }
                    }
                    afterMakeParent();
                };
                const afterMakeParent = () => {
                    fs.lstat(entry.absolute, (lstatEr, st) => {
                        if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
                            this[SKIP](entry);
                            done();
                            return;
                        }
                        if (lstatEr || this[ISREUSABLE](entry, st)) {
                            return this[MAKEFS](null, entry, done);
                        }
                        if (st.isDirectory()) {
                            if (entry.type === "Directory") {
                                const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
                                const afterChmod = er => this[MAKEFS](er, entry, done);
                                if (!needChmod) {
                                    return afterChmod();
                                }
                                return fs.chmod(entry.absolute, entry.mode, afterChmod);
                            }
                            if (entry.absolute !== this.cwd) {
                                return fs.rmdir(entry.absolute, er => this[MAKEFS](er, entry, done));
                            }
                        }
                        if (entry.absolute === this.cwd) {
                            return this[MAKEFS](null, entry, done);
                        }
                        unlinkFile(entry.absolute, er => this[MAKEFS](er, entry, done));
                    });
                };
                if (this[CHECKED_CWD]) {
                    start();
                } else {
                    checkCwd();
                }
            }
            [MAKEFS](er, entry, done) {
                if (er) {
                    this[ONERROR](er, entry);
                    done();
                    return;
                }
                switch (entry.type) {
                  case "File":
                  case "OldFile":
                  case "ContiguousFile":
                    return this[FILE](entry, done);

                  case "Link":
                    return this[HARDLINK](entry, done);

                  case "SymbolicLink":
                    return this[SYMLINK](entry, done);

                  case "Directory":
                  case "GNUDumpDir":
                    return this[DIRECTORY](entry, done);
                }
            }
            [LINK](entry, linkpath, link, done) {
                fs[link](linkpath, entry.absolute, er => {
                    if (er) {
                        this[ONERROR](er, entry);
                    } else {
                        this[UNPEND]();
                        entry.resume();
                    }
                    done();
                });
            }
        }
        const callSync = fn => {
            try {
                return [ null, fn() ];
            } catch (er) {
                return [ er, null ];
            }
        };
        class UnpackSync extends Unpack {
            [MAKEFS](er, entry) {
                return super[MAKEFS](er, entry, () => {});
            }
            [CHECKFS](entry) {
                this[PRUNECACHE](entry);
                if (!this[CHECKED_CWD]) {
                    const er = this[MKDIR](this.cwd, this.dmode);
                    if (er) {
                        return this[ONERROR](er, entry);
                    }
                    this[CHECKED_CWD] = true;
                }
                if (entry.absolute !== this.cwd) {
                    const parent = normPath(path.dirname(entry.absolute));
                    if (parent !== this.cwd) {
                        const mkParent = this[MKDIR](parent, this.dmode);
                        if (mkParent) {
                            return this[ONERROR](mkParent, entry);
                        }
                    }
                }
                const [lstatEr, st] = callSync(() => fs.lstatSync(entry.absolute));
                if (st && (this.keep || this.newer && st.mtime > entry.mtime)) {
                    return this[SKIP](entry);
                }
                if (lstatEr || this[ISREUSABLE](entry, st)) {
                    return this[MAKEFS](null, entry);
                }
                if (st.isDirectory()) {
                    if (entry.type === "Directory") {
                        const needChmod = !this.noChmod && entry.mode && (st.mode & 4095) !== entry.mode;
                        const [er] = needChmod ? callSync(() => {
                            fs.chmodSync(entry.absolute, entry.mode);
                        }) : [];
                        return this[MAKEFS](er, entry);
                    }
                    const [er] = callSync(() => fs.rmdirSync(entry.absolute));
                    this[MAKEFS](er, entry);
                }
                const [er] = entry.absolute === this.cwd ? [] : callSync(() => unlinkFileSync(entry.absolute));
                this[MAKEFS](er, entry);
            }
            [FILE](entry, done) {
                const mode = entry.mode & 4095 || this.fmode;
                const oner = er => {
                    let closeError;
                    try {
                        fs.closeSync(fd);
                    } catch (e) {
                        closeError = e;
                    }
                    if (er || closeError) {
                        this[ONERROR](er || closeError, entry);
                    }
                    done();
                };
                let fd;
                try {
                    fd = fs.openSync(entry.absolute, getFlag(entry.size), mode);
                } catch (er) {
                    return oner(er);
                }
                const tx = this.transform ? this.transform(entry) || entry : entry;
                if (tx !== entry) {
                    tx.on("error", er => this[ONERROR](er, entry));
                    entry.pipe(tx);
                }
                tx.on("data", chunk => {
                    try {
                        fs.writeSync(fd, chunk, 0, chunk.length);
                    } catch (er) {
                        oner(er);
                    }
                });
                tx.on("end", _ => {
                    let er = null;
                    if (entry.mtime && !this.noMtime) {
                        const atime = entry.atime || new Date;
                        const mtime = entry.mtime;
                        try {
                            fs.futimesSync(fd, atime, mtime);
                        } catch (futimeser) {
                            try {
                                fs.utimesSync(entry.absolute, atime, mtime);
                            } catch (utimeser) {
                                er = futimeser;
                            }
                        }
                    }
                    if (this[DOCHOWN](entry)) {
                        const uid = this[UID](entry);
                        const gid = this[GID](entry);
                        try {
                            fs.fchownSync(fd, uid, gid);
                        } catch (fchowner) {
                            try {
                                fs.chownSync(entry.absolute, uid, gid);
                            } catch (chowner) {
                                er = er || fchowner;
                            }
                        }
                    }
                    oner(er);
                });
            }
            [DIRECTORY](entry, done) {
                const mode = entry.mode & 4095 || this.dmode;
                const er = this[MKDIR](entry.absolute, mode);
                if (er) {
                    this[ONERROR](er, entry);
                    done();
                    return;
                }
                if (entry.mtime && !this.noMtime) {
                    try {
                        fs.utimesSync(entry.absolute, entry.atime || new Date, entry.mtime);
                    } catch (er) {}
                }
                if (this[DOCHOWN](entry)) {
                    try {
                        fs.chownSync(entry.absolute, this[UID](entry), this[GID](entry));
                    } catch (er) {}
                }
                done();
                entry.resume();
            }
            [MKDIR](dir, mode) {
                try {
                    return mkdir.sync(normPath(dir), {
                        uid: this.uid,
                        gid: this.gid,
                        processUid: this.processUid,
                        processGid: this.processGid,
                        umask: this.processUmask,
                        preserve: this.preservePaths,
                        unlink: this.unlink,
                        cache: this.dirCache,
                        cwd: this.cwd,
                        mode
                    });
                } catch (er) {
                    return er;
                }
            }
            [LINK](entry, linkpath, link, done) {
                try {
                    fs[link + "Sync"](linkpath, entry.absolute);
                    done();
                    entry.resume();
                } catch (er) {
                    return this[ONERROR](er, entry);
                }
            }
        }
        Unpack.Sync = UnpackSync;
        module.exports = Unpack;
    },
    6753(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const hlo = __webpack_require__(5659);
        const r = __webpack_require__(3498);
        module.exports = (opt_, files, cb) => {
            const opt = hlo(opt_);
            if (!opt.file) {
                throw new TypeError("file is required");
            }
            if (opt.gzip || opt.brotli || opt.file.endsWith(".br") || opt.file.endsWith(".tbr")) {
                throw new TypeError("cannot append to compressed archives");
            }
            if (!files || !Array.isArray(files) || !files.length) {
                throw new TypeError("no files or directories specified");
            }
            files = Array.from(files);
            mtimeFilter(opt);
            return r(opt, files, cb);
        };
        const mtimeFilter = opt => {
            const filter = opt.filter;
            if (!opt.mtimeCache) {
                opt.mtimeCache = new Map;
            }
            opt.filter = filter ? (path, stat) => filter(path, stat) && !(opt.mtimeCache.get(path) > stat.mtime) : (path, stat) => !(opt.mtimeCache.get(path) > stat.mtime);
        };
    },
    1036(module) {
        "use strict";
        module.exports = Base => class extends Base {
            warn(code, message, data = {}) {
                if (this.file) {
                    data.file = this.file;
                }
                if (this.cwd) {
                    data.cwd = this.cwd;
                }
                data.code = message instanceof Error && message.code || code;
                data.tarCode = code;
                if (!this.strict && data.recoverable !== false) {
                    if (message instanceof Error) {
                        data = Object.assign(message, data);
                        message = message.message;
                    }
                    this.emit("warn", data.tarCode, message, data);
                } else if (message instanceof Error) {
                    this.emit("error", Object.assign(message, data));
                } else {
                    this.emit("error", Object.assign(new Error(`${code}: ${message}`), data));
                }
            }
        };
    },
    451(module) {
        "use strict";
        const raw = [ "|", "<", ">", "?", ":" ];
        const win = raw.map(char => String.fromCharCode(61440 + char.charCodeAt(0)));
        const toWin = new Map(raw.map((char, i) => [ char, win[i] ]));
        const toRaw = new Map(win.map((char, i) => [ char, raw[i] ]));
        module.exports = {
            encode: s => raw.reduce((s, c) => s.split(c).join(toWin.get(c)), s),
            decode: s => win.reduce((s, c) => s.split(c).join(toRaw.get(c)), s)
        };
    },
    8264(module, __unused_webpack_exports, __webpack_require__) {
        "use strict";
        const {Minipass} = __webpack_require__(8769);
        const Pax = __webpack_require__(8107);
        const Header = __webpack_require__(8657);
        const fs = __webpack_require__(9896);
        const path = __webpack_require__(6928);
        const normPath = __webpack_require__(1793);
        const stripSlash = __webpack_require__(3238);
        const prefixPath = (path, prefix) => {
            if (!prefix) {
                return normPath(path);
            }
            path = normPath(path).replace(/^\.(\/|$)/, "");
            return stripSlash(prefix) + "/" + path;
        };
        const maxReadSize = 16 * 1024 * 1024;
        const PROCESS = Symbol("process");
        const FILE = Symbol("file");
        const DIRECTORY = Symbol("directory");
        const SYMLINK = Symbol("symlink");
        const HARDLINK = Symbol("hardlink");
        const HEADER = Symbol("header");
        const READ = Symbol("read");
        const LSTAT = Symbol("lstat");
        const ONLSTAT = Symbol("onlstat");
        const ONREAD = Symbol("onread");
        const ONREADLINK = Symbol("onreadlink");
        const OPENFILE = Symbol("openfile");
        const ONOPENFILE = Symbol("onopenfile");
        const CLOSE = Symbol("close");
        const MODE = Symbol("mode");
        const AWAITDRAIN = Symbol("awaitDrain");
        const ONDRAIN = Symbol("ondrain");
        const PREFIX = Symbol("prefix");
        const HAD_ERROR = Symbol("hadError");
        const warner = __webpack_require__(1036);
        const winchars = __webpack_require__(451);
        const stripAbsolutePath = __webpack_require__(5446);
        const modeFix = __webpack_require__(5541);
        const WriteEntry = warner(class WriteEntry extends Minipass {
            constructor(p, opt) {
                opt = opt || {};
                super(opt);
                if (typeof p !== "string") {
                    throw new TypeError("path is required");
                }
                this.path = normPath(p);
                this.portable = !!opt.portable;
                this.myuid = process.getuid && process.getuid() || 0;
                this.myuser = process.env.USER || "";
                this.maxReadSize = opt.maxReadSize || maxReadSize;
                this.linkCache = opt.linkCache || new Map;
                this.statCache = opt.statCache || new Map;
                this.preservePaths = !!opt.preservePaths;
                this.cwd = normPath(opt.cwd || process.cwd());
                this.strict = !!opt.strict;
                this.noPax = !!opt.noPax;
                this.noMtime = !!opt.noMtime;
                this.mtime = opt.mtime || null;
                this.prefix = opt.prefix ? normPath(opt.prefix) : null;
                this.fd = null;
                this.blockLen = null;
                this.blockRemain = null;
                this.buf = null;
                this.offset = null;
                this.length = null;
                this.pos = null;
                this.remain = null;
                if (typeof opt.onwarn === "function") {
                    this.on("warn", opt.onwarn);
                }
                let pathWarn = false;
                if (!this.preservePaths) {
                    const [root, stripped] = stripAbsolutePath(this.path);
                    if (root) {
                        this.path = stripped;
                        pathWarn = root;
                    }
                }
                this.win32 = !!opt.win32 || process.platform === "win32";
                if (this.win32) {
                    this.path = winchars.decode(this.path.replace(/\\/g, "/"));
                    p = p.replace(/\\/g, "/");
                }
                this.absolute = normPath(opt.absolute || path.resolve(this.cwd, p));
                if (this.path === "") {
                    this.path = "./";
                }
                if (pathWarn) {
                    this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
                        entry: this,
                        path: pathWarn + this.path
                    });
                }
                if (this.statCache.has(this.absolute)) {
                    this[ONLSTAT](this.statCache.get(this.absolute));
                } else {
                    this[LSTAT]();
                }
            }
            emit(ev, ...data) {
                if (ev === "error") {
                    this[HAD_ERROR] = true;
                }
                return super.emit(ev, ...data);
            }
            [LSTAT]() {
                fs.lstat(this.absolute, (er, stat) => {
                    if (er) {
                        return this.emit("error", er);
                    }
                    this[ONLSTAT](stat);
                });
            }
            [ONLSTAT](stat) {
                this.statCache.set(this.absolute, stat);
                this.stat = stat;
                if (!stat.isFile()) {
                    stat.size = 0;
                }
                this.type = getType(stat);
                this.emit("stat", stat);
                this[PROCESS]();
            }
            [PROCESS]() {
                switch (this.type) {
                  case "File":
                    return this[FILE]();

                  case "Directory":
                    return this[DIRECTORY]();

                  case "SymbolicLink":
                    return this[SYMLINK]();

                  default:
                    return this.end();
                }
            }
            [MODE](mode) {
                return modeFix(mode, this.type === "Directory", this.portable);
            }
            [PREFIX](path) {
                return prefixPath(path, this.prefix);
            }
            [HEADER]() {
                if (this.type === "Directory" && this.portable) {
                    this.noMtime = true;
                }
                this.header = new Header({
                    path: this[PREFIX](this.path),
                    linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
                    mode: this[MODE](this.stat.mode),
                    uid: this.portable ? null : this.stat.uid,
                    gid: this.portable ? null : this.stat.gid,
                    size: this.stat.size,
                    mtime: this.noMtime ? null : this.mtime || this.stat.mtime,
                    type: this.type,
                    uname: this.portable ? null : this.stat.uid === this.myuid ? this.myuser : "",
                    atime: this.portable ? null : this.stat.atime,
                    ctime: this.portable ? null : this.stat.ctime
                });
                if (this.header.encode() && !this.noPax) {
                    super.write(new Pax({
                        atime: this.portable ? null : this.header.atime,
                        ctime: this.portable ? null : this.header.ctime,
                        gid: this.portable ? null : this.header.gid,
                        mtime: this.noMtime ? null : this.mtime || this.header.mtime,
                        path: this[PREFIX](this.path),
                        linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
                        size: this.header.size,
                        uid: this.portable ? null : this.header.uid,
                        uname: this.portable ? null : this.header.uname,
                        dev: this.portable ? null : this.stat.dev,
                        ino: this.portable ? null : this.stat.ino,
                        nlink: this.portable ? null : this.stat.nlink
                    }).encode());
                }
                super.write(this.header.block);
            }
            [DIRECTORY]() {
                if (this.path.slice(-1) !== "/") {
                    this.path += "/";
                }
                this.stat.size = 0;
                this[HEADER]();
                this.end();
            }
            [SYMLINK]() {
                fs.readlink(this.absolute, (er, linkpath) => {
                    if (er) {
                        return this.emit("error", er);
                    }
                    this[ONREADLINK](linkpath);
                });
            }
            [ONREADLINK](linkpath) {
                this.linkpath = normPath(linkpath);
                this[HEADER]();
                this.end();
            }
            [HARDLINK](linkpath) {
                this.type = "Link";
                this.linkpath = normPath(path.relative(this.cwd, linkpath));
                this.stat.size = 0;
                this[HEADER]();
                this.end();
            }
            [FILE]() {
                if (this.stat.nlink > 1) {
                    const linkKey = this.stat.dev + ":" + this.stat.ino;
                    if (this.linkCache.has(linkKey)) {
                        const linkpath = this.linkCache.get(linkKey);
                        if (linkpath.indexOf(this.cwd) === 0) {
                            return this[HARDLINK](linkpath);
                        }
                    }
                    this.linkCache.set(linkKey, this.absolute);
                }
                this[HEADER]();
                if (this.stat.size === 0) {
                    return this.end();
                }
                this[OPENFILE]();
            }
            [OPENFILE]() {
                fs.open(this.absolute, "r", (er, fd) => {
                    if (er) {
                        return this.emit("error", er);
                    }
                    this[ONOPENFILE](fd);
                });
            }
            [ONOPENFILE](fd) {
                this.fd = fd;
                if (this[HAD_ERROR]) {
                    return this[CLOSE]();
                }
                this.blockLen = 512 * Math.ceil(this.stat.size / 512);
                this.blockRemain = this.blockLen;
                const bufLen = Math.min(this.blockLen, this.maxReadSize);
                this.buf = Buffer.allocUnsafe(bufLen);
                this.offset = 0;
                this.pos = 0;
                this.remain = this.stat.size;
                this.length = this.buf.length;
                this[READ]();
            }
            [READ]() {
                const {fd, buf, offset, length, pos} = this;
                fs.read(fd, buf, offset, length, pos, (er, bytesRead) => {
                    if (er) {
                        return this[CLOSE](() => this.emit("error", er));
                    }
                    this[ONREAD](bytesRead);
                });
            }
            [CLOSE](cb) {
                fs.close(this.fd, cb);
            }
            [ONREAD](bytesRead) {
                if (bytesRead <= 0 && this.remain > 0) {
                    const er = new Error("encountered unexpected EOF");
                    er.path = this.absolute;
                    er.syscall = "read";
                    er.code = "EOF";
                    return this[CLOSE](() => this.emit("error", er));
                }
                if (bytesRead > this.remain) {
                    const er = new Error("did not encounter expected EOF");
                    er.path = this.absolute;
                    er.syscall = "read";
                    er.code = "EOF";
                    return this[CLOSE](() => this.emit("error", er));
                }
                if (bytesRead === this.remain) {
                    for (let i = bytesRead; i < this.length && bytesRead < this.blockRemain; i++) {
                        this.buf[i + this.offset] = 0;
                        bytesRead++;
                        this.remain++;
                    }
                }
                const writeBuf = this.offset === 0 && bytesRead === this.buf.length ? this.buf : this.buf.slice(this.offset, this.offset + bytesRead);
                const flushed = this.write(writeBuf);
                if (!flushed) {
                    this[AWAITDRAIN](() => this[ONDRAIN]());
                } else {
                    this[ONDRAIN]();
                }
            }
            [AWAITDRAIN](cb) {
                this.once("drain", cb);
            }
            write(writeBuf) {
                if (this.blockRemain < writeBuf.length) {
                    const er = new Error("writing more data than expected");
                    er.path = this.absolute;
                    return this.emit("error", er);
                }
                this.remain -= writeBuf.length;
                this.blockRemain -= writeBuf.length;
                this.pos += writeBuf.length;
                this.offset += writeBuf.length;
                return super.write(writeBuf);
            }
            [ONDRAIN]() {
                if (!this.remain) {
                    if (this.blockRemain) {
                        super.write(Buffer.alloc(this.blockRemain));
                    }
                    return this[CLOSE](er => er ? this.emit("error", er) : this.end());
                }
                if (this.offset >= this.length) {
                    this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length));
                    this.offset = 0;
                }
                this.length = this.buf.length - this.offset;
                this[READ]();
            }
        });
        class WriteEntrySync extends WriteEntry {
            [LSTAT]() {
                this[ONLSTAT](fs.lstatSync(this.absolute));
            }
            [SYMLINK]() {
                this[ONREADLINK](fs.readlinkSync(this.absolute));
            }
            [OPENFILE]() {
                this[ONOPENFILE](fs.openSync(this.absolute, "r"));
            }
            [READ]() {
                let threw = true;
                try {
                    const {fd, buf, offset, length, pos} = this;
                    const bytesRead = fs.readSync(fd, buf, offset, length, pos);
                    this[ONREAD](bytesRead);
                    threw = false;
                } finally {
                    if (threw) {
                        try {
                            this[CLOSE](() => {});
                        } catch (er) {}
                    }
                }
            }
            [AWAITDRAIN](cb) {
                cb();
            }
            [CLOSE](cb) {
                fs.closeSync(this.fd);
                cb();
            }
        }
        const WriteEntryTar = warner(class WriteEntryTar extends Minipass {
            constructor(readEntry, opt) {
                opt = opt || {};
                super(opt);
                this.preservePaths = !!opt.preservePaths;
                this.portable = !!opt.portable;
                this.strict = !!opt.strict;
                this.noPax = !!opt.noPax;
                this.noMtime = !!opt.noMtime;
                this.readEntry = readEntry;
                this.type = readEntry.type;
                if (this.type === "Directory" && this.portable) {
                    this.noMtime = true;
                }
                this.prefix = opt.prefix || null;
                this.path = normPath(readEntry.path);
                this.mode = this[MODE](readEntry.mode);
                this.uid = this.portable ? null : readEntry.uid;
                this.gid = this.portable ? null : readEntry.gid;
                this.uname = this.portable ? null : readEntry.uname;
                this.gname = this.portable ? null : readEntry.gname;
                this.size = readEntry.size;
                this.mtime = this.noMtime ? null : opt.mtime || readEntry.mtime;
                this.atime = this.portable ? null : readEntry.atime;
                this.ctime = this.portable ? null : readEntry.ctime;
                this.linkpath = normPath(readEntry.linkpath);
                if (typeof opt.onwarn === "function") {
                    this.on("warn", opt.onwarn);
                }
                let pathWarn = false;
                if (!this.preservePaths) {
                    const [root, stripped] = stripAbsolutePath(this.path);
                    if (root) {
                        this.path = stripped;
                        pathWarn = root;
                    }
                }
                this.remain = readEntry.size;
                this.blockRemain = readEntry.startBlockSize;
                this.header = new Header({
                    path: this[PREFIX](this.path),
                    linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
                    mode: this.mode,
                    uid: this.portable ? null : this.uid,
                    gid: this.portable ? null : this.gid,
                    size: this.size,
                    mtime: this.noMtime ? null : this.mtime,
                    type: this.type,
                    uname: this.portable ? null : this.uname,
                    atime: this.portable ? null : this.atime,
                    ctime: this.portable ? null : this.ctime
                });
                if (pathWarn) {
                    this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
                        entry: this,
                        path: pathWarn + this.path
                    });
                }
                if (this.header.encode() && !this.noPax) {
                    super.write(new Pax({
                        atime: this.portable ? null : this.atime,
                        ctime: this.portable ? null : this.ctime,
                        gid: this.portable ? null : this.gid,
                        mtime: this.noMtime ? null : this.mtime,
                        path: this[PREFIX](this.path),
                        linkpath: this.type === "Link" ? this[PREFIX](this.linkpath) : this.linkpath,
                        size: this.size,
                        uid: this.portable ? null : this.uid,
                        uname: this.portable ? null : this.uname,
                        dev: this.portable ? null : this.readEntry.dev,
                        ino: this.portable ? null : this.readEntry.ino,
                        nlink: this.portable ? null : this.readEntry.nlink
                    }).encode());
                }
                super.write(this.header.block);
                readEntry.pipe(this);
            }
            [PREFIX](path) {
                return prefixPath(path, this.prefix);
            }
            [MODE](mode) {
                return modeFix(mode, this.type === "Directory", this.portable);
            }
            write(data) {
                const writeLen = data.length;
                if (writeLen > this.blockRemain) {
                    throw new Error("writing more to entry than is appropriate");
                }
                this.blockRemain -= writeLen;
                return super.write(data);
            }
            end() {
                if (this.blockRemain) {
                    super.write(Buffer.alloc(this.blockRemain));
                }
                return super.end();
            }
        });
        WriteEntry.Sync = WriteEntrySync;
        WriteEntry.Tar = WriteEntryTar;
        const getType = stat => stat.isFile() ? "File" : stat.isDirectory() ? "Directory" : stat.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
        module.exports = WriteEntry;
    },
    5757(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.compressedAssemblyExists = compressedAssemblyExists;
        exports.findAssemblyFile = findAssemblyFile;
        exports.replaceAssembly = replaceAssembly;
        exports.writeAssembly = writeAssembly;
        exports.loadAssemblyFromBuffer = loadAssemblyFromBuffer;
        exports.loadAssemblyFromPath = loadAssemblyFromPath;
        exports.loadAssemblyFromFile = loadAssemblyFromFile;
        const fs = __webpack_require__(9896);
        const path = __webpack_require__(6928);
        const zlib = __webpack_require__(3106);
        const assembly_1 = __webpack_require__(3713);
        const redirect_1 = __webpack_require__(5517);
        const validate_assembly_1 = __webpack_require__(5496);
        function compressedAssemblyExists(directory) {
            return fs.existsSync(path.join(directory, assembly_1.SPEC_FILE_NAME_COMPRESSED));
        }
        function findAssemblyFile(directory) {
            const dotJsiiFile = path.join(directory, assembly_1.SPEC_FILE_NAME);
            if (!fs.existsSync(dotJsiiFile)) {
                throw new Error(`Expected to find ${assembly_1.SPEC_FILE_NAME} file in ${directory}, but no such file found`);
            }
            return dotJsiiFile;
        }
        function replaceAssembly(assembly, directory) {
            writeAssembly(directory, _fingerprint(assembly), {
                compress: compressedAssemblyExists(directory)
            });
        }
        function _fingerprint(assembly) {
            assembly.fingerprint = "*".repeat(10);
            return assembly;
        }
        function writeAssembly(directory, assembly, {compress = false} = {}) {
            if (compress) {
                fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME), JSON.stringify({
                    schema: "jsii/file-redirect",
                    compression: "gzip",
                    filename: assembly_1.SPEC_FILE_NAME_COMPRESSED
                }), "utf-8");
                fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME_COMPRESSED), zlib.gzipSync(JSON.stringify(assembly)));
            } else {
                fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME), JSON.stringify(assembly, null, 2), "utf-8");
            }
            return compress;
        }
        const failNoReadfileProvided = filename => {
            throw new Error(`Unable to load assembly support file ${JSON.stringify(filename)}: no readFile callback provided!`);
        };
        function loadAssemblyFromBuffer(assemblyBuffer, readFile = failNoReadfileProvided, validate = true, supportedFeatures = []) {
            let contents = JSON.parse(assemblyBuffer.toString("utf-8"));
            while ((0, redirect_1.isAssemblyRedirect)(contents)) {
                contents = followRedirect(contents, readFile);
            }
            const unsupported = (contents.usedFeatures ?? []).filter(feat => !supportedFeatures.includes(feat));
            if (unsupported.length > 0) {
                throw new Error(`This jsii tool cannot load the given assembly; using unsupported feature(s): ${unsupported.join(", ")} (supported features: ${supportedFeatures.join(", ")})`);
            }
            return validate ? (0, validate_assembly_1.validateAssembly)(contents) : contents;
        }
        function loadAssemblyFromPath(directory, validate = true, supportedFeatures) {
            const assemblyFile = findAssemblyFile(directory);
            return loadAssemblyFromFile(assemblyFile, validate, supportedFeatures);
        }
        function loadAssemblyFromFile(pathToFile, validate = true, supportedFeatures) {
            const data = fs.readFileSync(pathToFile);
            try {
                return loadAssemblyFromBuffer(data, filename => fs.readFileSync(path.resolve(pathToFile, "..", filename)), validate, supportedFeatures);
            } catch (e) {
                throw new Error(`Error loading assembly from file ${pathToFile}:\n${e}`);
            }
        }
        function followRedirect(assemblyRedirect, readFile) {
            (0, redirect_1.validateAssemblyRedirect)(assemblyRedirect);
            let data = readFile(assemblyRedirect.filename);
            switch (assemblyRedirect.compression) {
              case "gzip":
                data = zlib.gunzipSync(data);
                break;

              case undefined:
                break;

              default:
                throw new Error(`Unsupported compression algorithm: ${JSON.stringify(assemblyRedirect.compression)}`);
            }
            const json = data.toString("utf-8");
            return JSON.parse(json);
        }
    },
    3713(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.ALL_SPEC_FEATURES = exports.TypeKind = exports.CANONICAL_ANY = exports.PrimitiveType = exports.CollectionKind = exports.Stability = exports.SchemaVersion = exports.SPEC_FILE_NAME_COMPRESSED = exports.SPEC_FILE_NAME = void 0;
        exports.isNamedTypeReference = isNamedTypeReference;
        exports.isPrimitiveTypeReference = isPrimitiveTypeReference;
        exports.isCollectionTypeReference = isCollectionTypeReference;
        exports.isUnionTypeReference = isUnionTypeReference;
        exports.isIntersectionTypeReference = isIntersectionTypeReference;
        exports.isMethod = isMethod;
        exports.isProperty = isProperty;
        exports.isClassType = isClassType;
        exports.isInterfaceType = isInterfaceType;
        exports.isEnumType = isEnumType;
        exports.isClassOrInterfaceType = isClassOrInterfaceType;
        exports.describeTypeReference = describeTypeReference;
        exports.isDeprecated = isDeprecated;
        exports.SPEC_FILE_NAME = ".jsii";
        exports.SPEC_FILE_NAME_COMPRESSED = `${exports.SPEC_FILE_NAME}.gz`;
        var SchemaVersion;
        (function(SchemaVersion) {
            SchemaVersion["LATEST"] = "jsii/0.10.0";
        })(SchemaVersion || (exports.SchemaVersion = SchemaVersion = {}));
        var Stability;
        (function(Stability) {
            Stability["Deprecated"] = "deprecated";
            Stability["Experimental"] = "experimental";
            Stability["Stable"] = "stable";
            Stability["External"] = "external";
        })(Stability || (exports.Stability = Stability = {}));
        var CollectionKind;
        (function(CollectionKind) {
            CollectionKind["Array"] = "array";
            CollectionKind["Map"] = "map";
        })(CollectionKind || (exports.CollectionKind = CollectionKind = {}));
        var PrimitiveType;
        (function(PrimitiveType) {
            PrimitiveType["Date"] = "date";
            PrimitiveType["String"] = "string";
            PrimitiveType["Number"] = "number";
            PrimitiveType["Boolean"] = "boolean";
            PrimitiveType["Json"] = "json";
            PrimitiveType["Any"] = "any";
        })(PrimitiveType || (exports.PrimitiveType = PrimitiveType = {}));
        exports.CANONICAL_ANY = {
            primitive: PrimitiveType.Any
        };
        function isNamedTypeReference(ref) {
            return !!ref?.fqn;
        }
        function isPrimitiveTypeReference(ref) {
            return !!ref?.primitive;
        }
        function isCollectionTypeReference(ref) {
            return !!ref?.collection;
        }
        function isUnionTypeReference(ref) {
            return !!ref?.union;
        }
        function isIntersectionTypeReference(ref) {
            return !!ref?.intersection;
        }
        function isMethod(callable) {
            return !!callable.name;
        }
        function isProperty(member) {
            return !!member.name && !!member.type;
        }
        var TypeKind;
        (function(TypeKind) {
            TypeKind["Class"] = "class";
            TypeKind["Enum"] = "enum";
            TypeKind["Interface"] = "interface";
        })(TypeKind || (exports.TypeKind = TypeKind = {}));
        function isClassType(type) {
            return type?.kind === TypeKind.Class;
        }
        function isInterfaceType(type) {
            return type?.kind === TypeKind.Interface;
        }
        function isEnumType(type) {
            return type?.kind === TypeKind.Enum;
        }
        function isClassOrInterfaceType(type) {
            return isClassType(type) || isInterfaceType(type);
        }
        function describeTypeReference(type) {
            if (type === undefined) {
                return "void";
            }
            if (isNamedTypeReference(type)) {
                return type.fqn;
            }
            if (isPrimitiveTypeReference(type)) {
                return type.primitive;
            }
            if (isCollectionTypeReference(type)) {
                return `${type.collection.kind}<${describeTypeReference(type.collection.elementtype)}>`;
            }
            if (isUnionTypeReference(type)) {
                const unionType = type.union.types.map(describeTypeReference).join(" | ");
                return unionType;
            }
            throw new Error("Unrecognized type reference");
        }
        exports.ALL_SPEC_FEATURES = [ "intersection-types", "class-covariant-overrides" ];
        function isDeprecated(entity) {
            return entity?.docs?.stability === Stability.Deprecated;
        }
    },
    4699(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
    },
    372(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.formatErrors = formatErrors;
        function formatErrors(errors, dataVar) {
            if (!errors || errors.length === 0) {
                return "No errors";
            }
            return errors.map(e => `${dataVar}${e.instancePath} ${e.message}`).join("\n * ");
        }
    },
    9501(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            var desc = Object.getOwnPropertyDescriptor(m, k);
            if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
                desc = {
                    enumerable: true,
                    get: function() {
                        return m[k];
                    }
                };
            }
            Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            if (k2 === undefined) k2 = k;
            o[k2] = m[k];
        });
        var __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        __exportStar(__webpack_require__(3713), exports);
        __exportStar(__webpack_require__(5757), exports);
        __exportStar(__webpack_require__(4699), exports);
        __exportStar(__webpack_require__(447), exports);
        __exportStar(__webpack_require__(5517), exports);
        __exportStar(__webpack_require__(5496), exports);
    },
    447(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.NameTree = void 0;
        class NameTree {
            static of(assm) {
                const nameTree = new NameTree;
                for (const type of Object.values(assm.types ?? {})) {
                    nameTree.register(type.fqn);
                }
                return nameTree;
            }
            constructor() {
                this._children = {};
            }
            get children() {
                return this._children;
            }
            get fqn() {
                return this._fqn;
            }
            register(fqn, path = fqn.split(".")) {
                if (path.length === 0) {
                    this._fqn = fqn;
                } else {
                    const [head, ...rest] = path;
                    if (!this._children[head]) {
                        this._children[head] = new NameTree;
                    }
                    this._children[head].register(fqn, rest);
                }
                return this;
            }
        }
        exports.NameTree = NameTree;
    },
    5517(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.assemblyRedirectSchema = void 0;
        exports.isAssemblyRedirect = isAssemblyRedirect;
        exports.validateAssemblyRedirect = validateAssemblyRedirect;
        const format_errors_1 = __webpack_require__(372);
        exports.assemblyRedirectSchema = __webpack_require__(3346);
        const {validateRedirect: validateSchema} = __webpack_require__(4662);
        const SCHEMA = "jsii/file-redirect";
        function isAssemblyRedirect(obj) {
            if (typeof obj !== "object" || obj == null) {
                return false;
            }
            return obj.schema === SCHEMA;
        }
        function validateAssemblyRedirect(obj) {
            if (!validateSchema(obj)) {
                throw new Error(`Invalid assembly redirect:\n * ${(0, format_errors_1.formatErrors)(validateSchema.errors, "redirect")}`);
            }
            return obj;
        }
    },
    5496(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.schema = void 0;
        exports.validateAssembly = validateAssembly;
        const format_errors_1 = __webpack_require__(372);
        exports.schema = __webpack_require__(878);
        const {validateAssembly: validateSchema} = __webpack_require__(4662);
        function validateAssembly(obj) {
            if (!validateSchema(obj)) {
                let descr = "";
                if (typeof obj.name === "string" && obj.name !== "") {
                    descr = typeof obj.version === "string" ? ` ${obj.name}@${obj.version}` : ` ${obj.name}`;
                }
                throw new Error(`Invalid assembly${descr}:\n * ${(0, format_errors_1.formatErrors)(validateSchema.errors, "assembly")}`);
            }
            return obj;
        }
    },
    4662(__unused_webpack_module, exports) {
        "use strict";
        var _ = (n, r) => () => (r || n((r = {
            exports: {}
        }).exports, r), r.exports);
        var V = _(N => {
            "use strict";
            Object.defineProperty(N, "__esModule", {
                value: !0
            });
            function E(n) {
                let r = n.length, d = 0, m = 0, l;
                for (;m < r; ) d++, l = n.charCodeAt(m++), l >= 55296 && l <= 56319 && m < r && (l = n.charCodeAt(m), 
                (l & 64512) === 56320 && m++);
                return d;
            }
            N.default = E;
            E.code = 'require("ajv/dist/runtime/ucs2length").default';
        });
        exports.validateAssembly = U;
        var Q = {
            description: "A JSII assembly specification.",
            properties: {
                author: {
                    $ref: "#/definitions/Person",
                    description: "The main author of this package."
                },
                bin: {
                    additionalProperties: {
                        type: "string"
                    },
                    default: "none",
                    description: "List of bin-scripts",
                    type: "object"
                },
                bundled: {
                    additionalProperties: {
                        type: "string"
                    },
                    default: "none",
                    description: `List if bundled dependencies (these are not expected to be jsii\nassemblies).`,
                    type: "object"
                },
                contributors: {
                    default: "none",
                    description: "Additional contributors to this package.",
                    items: {
                        $ref: "#/definitions/Person"
                    },
                    type: "array"
                },
                dependencies: {
                    additionalProperties: {
                        type: "string"
                    },
                    default: "none",
                    description: `Direct dependencies on other assemblies (with semver), the key is the JSII\nassembly name, and the value is a SemVer expression.`,
                    type: "object"
                },
                dependencyClosure: {
                    additionalProperties: {
                        $ref: "#/definitions/DependencyConfiguration"
                    },
                    default: "none",
                    description: `Target configuration for all the assemblies that are direct or transitive\ndependencies of this assembly. This is needed to generate correct native\ntype names for any transitively inherited member, in certain languages.`,
                    type: "object"
                },
                description: {
                    description: `Description of the assembly, maps to "description" from package.json\nThis is required since some package managers (like Maven) require it.`,
                    type: "string"
                },
                docs: {
                    $ref: "#/definitions/Docs",
                    default: "none",
                    description: "Documentation for this entity."
                },
                fingerprint: {
                    description: `A fingerprint that can be used to determine if the specification has\nchanged.`,
                    minLength: 1,
                    type: "string"
                },
                homepage: {
                    description: 'The url to the project homepage. Maps to "homepage" from package.json.',
                    type: "string"
                },
                jsiiVersion: {
                    description: "The version of the jsii compiler that was used to produce this Assembly.",
                    minLength: 1,
                    type: "string"
                },
                keywords: {
                    description: `Keywords that help discover or identify this packages with respects to it's\nintended usage, audience, etc... Where possible, this will be rendered in\nthe corresponding metadata section of idiomatic package manifests, for\nexample NuGet package tags.`,
                    items: {
                        type: "string"
                    },
                    type: "array"
                },
                license: {
                    description: "The SPDX name of the license this assembly is distributed on.",
                    type: "string"
                },
                metadata: {
                    additionalProperties: {},
                    default: "none",
                    description: `Arbitrary key-value pairs of metadata, which the maintainer chose to\ndocument with the assembly. These entries do not carry normative\nsemantics and their interpretation is up to the assembly maintainer.`,
                    type: "object"
                },
                name: {
                    description: "The name of the assembly",
                    minLength: 1,
                    type: "string"
                },
                readme: {
                    $ref: "#/definitions/ReadMe",
                    default: "none",
                    description: "The readme document for this module (if any)."
                },
                repository: {
                    description: `The module repository, maps to "repository" from package.json\nThis is required since some package managers (like Maven) require it.`,
                    properties: {
                        directory: {
                            default: "the root of the repository",
                            description: `If the package is not in the root directory (for example, when part\nof a monorepo), you should specify the directory in which it lives.`,
                            type: "string"
                        },
                        type: {
                            description: "The type of the repository (``git``, ``svn``, ...)",
                            type: "string"
                        },
                        url: {
                            description: "The URL of the repository.",
                            type: "string"
                        }
                    },
                    required: [ "type", "url" ],
                    type: "object"
                },
                schema: {
                    const: "jsii/0.10.0",
                    description: `The version of the spec schema\n\nNOTE: we cannot ever change this value anymore! If we do, new instances of\nassmblies that would have been backwards compatible with the old schema\nstill cannot be loaded, because the schema versions don't match exactly (as\nvalidated by JSON Schema validators on loading).\n\nWe *must* always emit this value as 'jsii/0.10.0'.\n\nInstead, see \`usedFeatures\` for a dynamic way to do feature validation\nwithout relying on a fixed schema version.`,
                    type: "string"
                },
                submodules: {
                    additionalProperties: {
                        $ref: "#/definitions/Submodule"
                    },
                    default: "none",
                    description: "Submodules declared in this assembly.",
                    type: "object"
                },
                targets: {
                    $ref: "#/definitions/AssemblyTargets",
                    default: "none",
                    description: `A map of target name to configuration, which is used when generating\npackages for various languages.`
                },
                types: {
                    additionalProperties: {
                        $ref: "#/definitions/Type"
                    },
                    default: "none",
                    description: "All types in the assembly, keyed by their fully-qualified-name",
                    type: "object"
                },
                usedFeatures: {
                    default: "- Only original jsii features.",
                    description: `List of features used in this assembly\n\nIf a modern jsii feature is used in the assembly, a descriptive string\nshould be added here. This field will be used to selectively reject the\nloading of assemblies that requires features not currently supported by the\njsii kernel, or downstream jsii tools.`,
                    items: {
                        enum: [ "class-covariant-overrides", "intersection-types" ],
                        type: "string"
                    },
                    type: "array"
                },
                version: {
                    description: "The version of the assembly",
                    minLength: 1,
                    type: "string"
                }
            },
            required: [ "author", "description", "fingerprint", "homepage", "jsiiVersion", "license", "name", "repository", "schema", "version" ],
            type: "object"
        };
        var g = {
            description: `Key value pairs of documentation nodes.\nBased on TSDoc.`,
            properties: {
                custom: {
                    additionalProperties: {
                        type: "string"
                    },
                    default: "none",
                    description: "Custom tags that are not any of the default ones",
                    type: "object"
                },
                default: {
                    default: "none",
                    description: "Description of the default",
                    type: "string"
                },
                deprecated: {
                    default: "none",
                    description: `If present, this block indicates that an API item is no longer supported\nand may be removed in a future release.  The \`@deprecated\` tag must be\nfollowed by a sentence describing the recommended alternative.\nDeprecation recursively applies to members of a container. For example,\nif a class is deprecated, then so are all of its members.`,
                    type: "string"
                },
                example: {
                    default: "none",
                    description: `Example showing the usage of this API item\n\nStarts off in running text mode, may switch to code using fenced code\nblocks.`,
                    type: "string"
                },
                remarks: {
                    default: "none",
                    description: "Detailed information about an API item.\n\nEither the explicitly tagged `@remarks` section, otherwise everything\npast the first paragraph if there is no `@remarks` tag.",
                    type: "string"
                },
                returns: {
                    default: "none",
                    description: "The `@returns` block for this doc comment, or undefined if there is not\none.",
                    type: "string"
                },
                see: {
                    default: "none",
                    description: "A `@see` link with more information",
                    type: "string"
                },
                stability: {
                    description: "Whether the API item is beta/experimental quality",
                    enum: [ "deprecated", "experimental", "external", "stable" ],
                    type: "string"
                },
                subclassable: {
                    default: !1,
                    description: `Whether this class or interface was intended to be subclassed/implemented\nby library users.\n\nClasses intended for subclassing, and interfaces intended to be\nimplemented by consumers, are held to stricter standards of API\ncompatibility.`,
                    type: "boolean"
                },
                summary: {
                    default: "none",
                    description: "Summary documentation for an API item.\n\nThe first part of the documentation before hitting a `@remarks` tags, or\nthe first line of the doc comment block if there is no `@remarks` tag.",
                    type: "string"
                }
            },
            type: "object"
        };
        function w(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.targets !== void 0) {
                    let t = n.targets;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) {
                        let o = t[s];
                        if (!(o && typeof o == "object" && !Array.isArray(o))) {
                            let a = {
                                instancePath: r + "/targets/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/definitions/AssemblyTargets/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "object"
                                },
                                message: "must be object"
                            };
                            e === null ? e = [ a ] : e.push(a), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/targets",
                            schemaPath: "#/definitions/AssemblyTargets/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return w.errors = e, i === 0;
        }
        function v(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.submodules !== void 0) {
                    let t = n.submodules;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) w(t[s], {
                        instancePath: r + "/submodules/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                        parentData: t,
                        parentDataProperty: s,
                        rootData: l
                    }) || (e = e === null ? w.errors : e.concat(w.errors), i = e.length); else {
                        let s = {
                            instancePath: r + "/submodules",
                            schemaPath: "#/properties/submodules/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.targets !== void 0) {
                    let t = n.targets;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) {
                        let o = t[s];
                        if (!(o && typeof o == "object" && !Array.isArray(o))) {
                            let a = {
                                instancePath: r + "/targets/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/definitions/AssemblyTargets/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "object"
                                },
                                message: "must be object"
                            };
                            e === null ? e = [ a ] : e.push(a), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/targets",
                            schemaPath: "#/definitions/AssemblyTargets/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return v.errors = e, i === 0;
        }
        function j(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.readme !== void 0) {
                    let t = n.readme;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.markdown === void 0) {
                            let s = {
                                instancePath: r + "/readme",
                                schemaPath: "#/definitions/ReadMe/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "markdown"
                                },
                                message: "must have required property 'markdown'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.markdown !== void 0 && typeof t.markdown != "string") {
                            let s = {
                                instancePath: r + "/readme/markdown",
                                schemaPath: "#/definitions/ReadMe/properties/markdown/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/readme",
                            schemaPath: "#/definitions/ReadMe/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return j.errors = e, i === 0;
        }
        function A(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return A.errors = e, i === 0;
        }
        function T(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (j(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? j.errors : e.concat(j.errors), i = e.length), A(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? A.errors : e.concat(A.errors), i = e.length), w(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? w.errors : e.concat(w.errors), i = e.length), n && typeof n == "object" && !Array.isArray(n)) {
                if (n.symbolId !== void 0 && typeof n.symbolId != "string") {
                    let t = {
                        instancePath: r + "/symbolId",
                        schemaPath: "#/definitions/TypeScriptLocatable/properties/symbolId/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/definitions/TypeScriptLocatable/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return T.errors = e, i === 0;
        }
        var G = {
            description: "Kinds of types.",
            enum: [ "class", "enum", "interface" ],
            type: "string"
        }, f = V().default;
        function h(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.assembly === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "assembly"
                        },
                        message: "must have required property 'assembly'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.fqn === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fqn"
                        },
                        message: "must have required property 'fqn'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.kind === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "kind"
                        },
                        message: "must have required property 'kind'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.assembly !== void 0) {
                    let t = n.assembly;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/assembly",
                                schemaPath: "#/properties/assembly/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/assembly",
                            schemaPath: "#/properties/assembly/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.fqn !== void 0) {
                    let t = n.fqn;
                    if (typeof t == "string") {
                        if (f(t) < 3) {
                            let s = {
                                instancePath: r + "/fqn",
                                schemaPath: "#/properties/fqn/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 3
                                },
                                message: "must NOT have fewer than 3 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/fqn",
                            schemaPath: "#/properties/fqn/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.kind !== void 0) {
                    let t = n.kind;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/definitions/TypeKind/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (!(t === "class" || t === "enum" || t === "interface")) {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/definitions/TypeKind/enum",
                            keyword: "enum",
                            params: {
                                allowedValues: G.enum
                            },
                            message: "must be equal to one of the allowed values"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.namespace !== void 0 && typeof n.namespace != "string") {
                    let t = {
                        instancePath: r + "/namespace",
                        schemaPath: "#/properties/namespace/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.symbolId !== void 0 && typeof n.symbolId != "string") {
                    let t = {
                        instancePath: r + "/symbolId",
                        schemaPath: "#/properties/symbolId/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return h.errors = e, i === 0;
        }
        var H = {
            description: "Kinds of primitive types.",
            enum: [ "date", "string", "number", "boolean", "json", "any" ],
            type: "string"
        };
        function I(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.primitive === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "primitive"
                        },
                        message: "must have required property 'primitive'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.primitive !== void 0) {
                    let t = n.primitive;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/primitive",
                            schemaPath: "#/definitions/PrimitiveType/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (!(t === "date" || t === "string" || t === "number" || t === "boolean" || t === "json" || t === "any")) {
                        let s = {
                            instancePath: r + "/primitive",
                            schemaPath: "#/definitions/PrimitiveType/enum",
                            keyword: "enum",
                            params: {
                                allowedValues: H.enum
                            },
                            message: "must be equal to one of the allowed values"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return I.errors = e, i === 0;
        }
        var X = {
            description: "Kinds of collections.",
            enum: [ "array", "map" ],
            type: "string"
        }, b = {
            validate: u
        };
        function D(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.collection === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "collection"
                        },
                        message: "must have required property 'collection'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.collection !== void 0) {
                    let t = n.collection;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.elementtype === void 0) {
                            let s = {
                                instancePath: r + "/collection",
                                schemaPath: "#/properties/collection/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "elementtype"
                                },
                                message: "must have required property 'elementtype'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.kind === void 0) {
                            let s = {
                                instancePath: r + "/collection",
                                schemaPath: "#/properties/collection/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "kind"
                                },
                                message: "must have required property 'kind'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.elementtype !== void 0 && (b.validate(t.elementtype, {
                            instancePath: r + "/collection/elementtype",
                            parentData: t,
                            parentDataProperty: "elementtype",
                            rootData: l
                        }) || (e = e === null ? b.validate.errors : e.concat(b.validate.errors), i = e.length)), 
                        t.kind !== void 0) {
                            let s = t.kind;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/collection/kind",
                                    schemaPath: "#/definitions/CollectionKind/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "array" || s === "map")) {
                                let o = {
                                    instancePath: r + "/collection/kind",
                                    schemaPath: "#/definitions/CollectionKind/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: X.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/collection",
                            schemaPath: "#/properties/collection/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return D.errors = e, i === 0;
        }
        function L(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.union === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "union"
                        },
                        message: "must have required property 'union'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.union !== void 0) {
                    let t = n.union;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.types === void 0) {
                            let s = {
                                instancePath: r + "/union",
                                schemaPath: "#/properties/union/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "types"
                                },
                                message: "must have required property 'types'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.types !== void 0) {
                            let s = t.types;
                            if (Array.isArray(s)) {
                                if (s.length < 2) {
                                    let a = {
                                        instancePath: r + "/union/types",
                                        schemaPath: "#/properties/union/properties/types/minItems",
                                        keyword: "minItems",
                                        params: {
                                            limit: 2
                                        },
                                        message: "must NOT have fewer than 2 items"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                                let o = s.length;
                                for (let a = 0; a < o; a++) b.validate(s[a], {
                                    instancePath: r + "/union/types/" + a,
                                    parentData: s,
                                    parentDataProperty: a,
                                    rootData: l
                                }) || (e = e === null ? b.validate.errors : e.concat(b.validate.errors), i = e.length);
                            } else {
                                let o = {
                                    instancePath: r + "/union/types",
                                    schemaPath: "#/properties/union/properties/types/type",
                                    keyword: "type",
                                    params: {
                                        type: "array"
                                    },
                                    message: "must be array"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/union",
                            schemaPath: "#/properties/union/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return L.errors = e, i === 0;
        }
        function M(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.intersection === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "intersection"
                        },
                        message: "must have required property 'intersection'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.intersection !== void 0) {
                    let t = n.intersection;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.types === void 0) {
                            let s = {
                                instancePath: r + "/intersection",
                                schemaPath: "#/properties/intersection/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "types"
                                },
                                message: "must have required property 'types'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.types !== void 0) {
                            let s = t.types;
                            if (Array.isArray(s)) {
                                if (s.length < 2) {
                                    let a = {
                                        instancePath: r + "/intersection/types",
                                        schemaPath: "#/properties/intersection/properties/types/minItems",
                                        keyword: "minItems",
                                        params: {
                                            limit: 2
                                        },
                                        message: "must NOT have fewer than 2 items"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                                let o = s.length;
                                for (let a = 0; a < o; a++) b.validate(s[a], {
                                    instancePath: r + "/intersection/types/" + a,
                                    parentData: s,
                                    parentDataProperty: a,
                                    rootData: l
                                }) || (e = e === null ? b.validate.errors : e.concat(b.validate.errors), i = e.length);
                            } else {
                                let o = {
                                    instancePath: r + "/intersection/types",
                                    schemaPath: "#/properties/intersection/properties/types/type",
                                    keyword: "type",
                                    params: {
                                        type: "array"
                                    },
                                    message: "must be array"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/intersection",
                            schemaPath: "#/properties/intersection/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return M.errors = e, i === 0;
        }
        function u(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0, t = i, s = !1, o = i;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.fqn === void 0) {
                    let p = {
                        instancePath: r,
                        schemaPath: "#/definitions/NamedTypeReference/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fqn"
                        },
                        message: "must have required property 'fqn'"
                    };
                    e === null ? e = [ p ] : e.push(p), i++;
                }
                if (n.fqn !== void 0 && typeof n.fqn != "string") {
                    let p = {
                        instancePath: r + "/fqn",
                        schemaPath: "#/definitions/NamedTypeReference/properties/fqn/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ p ] : e.push(p), i++;
                }
            } else {
                let p = {
                    instancePath: r,
                    schemaPath: "#/definitions/NamedTypeReference/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ p ] : e.push(p), i++;
            }
            var a = o === i;
            if (s = s || a, !s) {
                let p = i;
                I(n, {
                    instancePath: r,
                    parentData: d,
                    parentDataProperty: m,
                    rootData: l
                }) || (e = e === null ? I.errors : e.concat(I.errors), i = e.length);
                var a = p === i;
                if (s = s || a, !s) {
                    let y = i;
                    D(n, {
                        instancePath: r,
                        parentData: d,
                        parentDataProperty: m,
                        rootData: l
                    }) || (e = e === null ? D.errors : e.concat(D.errors), i = e.length);
                    var a = y === i;
                    if (s = s || a, !s) {
                        let B = i;
                        L(n, {
                            instancePath: r,
                            parentData: d,
                            parentDataProperty: m,
                            rootData: l
                        }) || (e = e === null ? L.errors : e.concat(L.errors), i = e.length);
                        var a = B === i;
                        if (s = s || a, !s) {
                            let K = i;
                            M(n, {
                                instancePath: r,
                                parentData: d,
                                parentDataProperty: m,
                                rootData: l
                            }) || (e = e === null ? M.errors : e.concat(M.errors), i = e.length);
                            var a = K === i;
                            s = s || a;
                        }
                    }
                }
            }
            if (s) i = t, e !== null && (t ? e.length = t : e = null); else {
                let p = {
                    instancePath: r,
                    schemaPath: "#/anyOf",
                    keyword: "anyOf",
                    params: {},
                    message: "must match a schema in anyOf"
                };
                e === null ? e = [ p ] : e.push(p), i++;
            }
            return u.errors = e, i === 0;
        }
        function k(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.type === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "type"
                        },
                        message: "must have required property 'type'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.optional !== void 0 && typeof n.optional != "boolean") {
                    let t = {
                        instancePath: r + "/optional",
                        schemaPath: "#/properties/optional/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.type !== void 0 && (u(n.type, {
                    instancePath: r + "/type",
                    parentData: n,
                    parentDataProperty: "type",
                    rootData: l
                }) || (e = e === null ? u.errors : e.concat(u.errors), i = e.length)), n.variadic !== void 0 && typeof n.variadic != "boolean") {
                    let t = {
                        instancePath: r + "/variadic",
                        schemaPath: "#/properties/variadic/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return k.errors = e, i === 0;
        }
        function S(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.overrides !== void 0 && typeof n.overrides != "string") {
                    let t = {
                        instancePath: r + "/overrides",
                        schemaPath: "#/properties/overrides/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.parameters !== void 0) {
                    let t = n.parameters;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) k(t[o], {
                            instancePath: r + "/parameters/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? k.errors : e.concat(k.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/parameters",
                            schemaPath: "#/properties/parameters/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.protected !== void 0 && typeof n.protected != "boolean") {
                    let t = {
                        instancePath: r + "/protected",
                        schemaPath: "#/properties/protected/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.variadic !== void 0 && typeof n.variadic != "boolean") {
                    let t = {
                        instancePath: r + "/variadic",
                        schemaPath: "#/properties/variadic/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return S.errors = e, i === 0;
        }
        function $(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.type === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "type"
                        },
                        message: "must have required property 'type'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.optional !== void 0 && typeof n.optional != "boolean") {
                    let t = {
                        instancePath: r + "/optional",
                        schemaPath: "#/properties/optional/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                n.type !== void 0 && (u(n.type, {
                    instancePath: r + "/type",
                    parentData: n,
                    parentDataProperty: "type",
                    rootData: l
                }) || (e = e === null ? u.errors : e.concat(u.errors), i = e.length));
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return $.errors = e, i === 0;
        }
        function P(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.abstract !== void 0 && typeof n.abstract != "boolean") {
                    let t = {
                        instancePath: r + "/abstract",
                        schemaPath: "#/properties/abstract/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.async !== void 0 && typeof n.async != "boolean") {
                    let t = {
                        instancePath: r + "/async",
                        schemaPath: "#/properties/async/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0 && typeof n.name != "string") {
                    let t = {
                        instancePath: r + "/name",
                        schemaPath: "#/properties/name/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.overrides !== void 0 && typeof n.overrides != "string") {
                    let t = {
                        instancePath: r + "/overrides",
                        schemaPath: "#/properties/overrides/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.parameters !== void 0) {
                    let t = n.parameters;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) k(t[o], {
                            instancePath: r + "/parameters/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? k.errors : e.concat(k.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/parameters",
                            schemaPath: "#/properties/parameters/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.protected !== void 0 && typeof n.protected != "boolean") {
                    let t = {
                        instancePath: r + "/protected",
                        schemaPath: "#/properties/protected/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.returns !== void 0 && ($(n.returns, {
                    instancePath: r + "/returns",
                    parentData: n,
                    parentDataProperty: "returns",
                    rootData: l
                }) || (e = e === null ? $.errors : e.concat($.errors), i = e.length)), n.static !== void 0 && typeof n.static != "boolean") {
                    let t = {
                        instancePath: r + "/static",
                        schemaPath: "#/properties/static/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.variadic !== void 0 && typeof n.variadic != "boolean") {
                    let t = {
                        instancePath: r + "/variadic",
                        schemaPath: "#/properties/variadic/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return P.errors = e, i === 0;
        }
        function q(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.type === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "type"
                        },
                        message: "must have required property 'type'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.abstract !== void 0 && typeof n.abstract != "boolean") {
                    let t = {
                        instancePath: r + "/abstract",
                        schemaPath: "#/properties/abstract/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.const !== void 0 && typeof n.const != "boolean") {
                    let t = {
                        instancePath: r + "/const",
                        schemaPath: "#/properties/const/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.immutable !== void 0 && typeof n.immutable != "boolean") {
                    let t = {
                        instancePath: r + "/immutable",
                        schemaPath: "#/properties/immutable/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.optional !== void 0 && typeof n.optional != "boolean") {
                    let t = {
                        instancePath: r + "/optional",
                        schemaPath: "#/properties/optional/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.overrides !== void 0 && typeof n.overrides != "string") {
                    let t = {
                        instancePath: r + "/overrides",
                        schemaPath: "#/properties/overrides/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.protected !== void 0 && typeof n.protected != "boolean") {
                    let t = {
                        instancePath: r + "/protected",
                        schemaPath: "#/properties/protected/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.static !== void 0 && typeof n.static != "boolean") {
                    let t = {
                        instancePath: r + "/static",
                        schemaPath: "#/properties/static/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                n.type !== void 0 && (u(n.type, {
                    instancePath: r + "/type",
                    parentData: n,
                    parentDataProperty: "type",
                    rootData: l
                }) || (e = e === null ? u.errors : e.concat(u.errors), i = e.length));
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return q.errors = e, i === 0;
        }
        function x(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.assembly === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "assembly"
                        },
                        message: "must have required property 'assembly'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.fqn === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fqn"
                        },
                        message: "must have required property 'fqn'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.kind === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "kind"
                        },
                        message: "must have required property 'kind'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.abstract !== void 0 && typeof n.abstract != "boolean") {
                    let t = {
                        instancePath: r + "/abstract",
                        schemaPath: "#/properties/abstract/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.assembly !== void 0) {
                    let t = n.assembly;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/assembly",
                                schemaPath: "#/properties/assembly/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/assembly",
                            schemaPath: "#/properties/assembly/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.base !== void 0 && typeof n.base != "string") {
                    let t = {
                        instancePath: r + "/base",
                        schemaPath: "#/properties/base/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.fqn !== void 0) {
                    let t = n.fqn;
                    if (typeof t == "string") {
                        if (f(t) < 3) {
                            let s = {
                                instancePath: r + "/fqn",
                                schemaPath: "#/properties/fqn/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 3
                                },
                                message: "must NOT have fewer than 3 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/fqn",
                            schemaPath: "#/properties/fqn/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.initializer !== void 0 && (S(n.initializer, {
                    instancePath: r + "/initializer",
                    parentData: n,
                    parentDataProperty: "initializer",
                    rootData: l
                }) || (e = e === null ? S.errors : e.concat(S.errors), i = e.length)), n.interfaces !== void 0) {
                    let t = n.interfaces;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let p = 0; p < s; p++) if (typeof t[p] != "string") {
                            let c = {
                                instancePath: r + "/interfaces/" + p,
                                schemaPath: "#/properties/interfaces/items/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ c ] : e.push(c), i++;
                        }
                        let o = t.length, a;
                        if (o > 1) {
                            let p = {};
                            for (;o--; ) {
                                let c = t[o];
                                if (typeof c == "string") {
                                    if (typeof p[c] == "number") {
                                        a = p[c];
                                        let y = {
                                            instancePath: r + "/interfaces",
                                            schemaPath: "#/properties/interfaces/uniqueItems",
                                            keyword: "uniqueItems",
                                            params: {
                                                i: o,
                                                j: a
                                            },
                                            message: "must NOT have duplicate items (items ## " + a + " and " + o + " are identical)"
                                        };
                                        e === null ? e = [ y ] : e.push(y), i++;
                                        break;
                                    }
                                    p[c] = o;
                                }
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/interfaces",
                            schemaPath: "#/properties/interfaces/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.kind !== void 0) {
                    let t = n.kind;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "class") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/const",
                            keyword: "const",
                            params: {
                                allowedValue: "class"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.methods !== void 0) {
                    let t = n.methods;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) P(t[o], {
                            instancePath: r + "/methods/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? P.errors : e.concat(P.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/methods",
                            schemaPath: "#/properties/methods/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.namespace !== void 0 && typeof n.namespace != "string") {
                    let t = {
                        instancePath: r + "/namespace",
                        schemaPath: "#/properties/namespace/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.properties !== void 0) {
                    let t = n.properties;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) q(t[o], {
                            instancePath: r + "/properties/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? q.errors : e.concat(q.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/properties",
                            schemaPath: "#/properties/properties/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.symbolId !== void 0 && typeof n.symbolId != "string") {
                    let t = {
                        instancePath: r + "/symbolId",
                        schemaPath: "#/properties/symbolId/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return x.errors = e, i === 0;
        }
        function R(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0 && typeof n.name != "string") {
                    let t = {
                        instancePath: r + "/name",
                        schemaPath: "#/properties/name/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return R.errors = e, i === 0;
        }
        function z(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.assembly === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "assembly"
                        },
                        message: "must have required property 'assembly'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.fqn === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fqn"
                        },
                        message: "must have required property 'fqn'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.kind === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "kind"
                        },
                        message: "must have required property 'kind'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.members === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "members"
                        },
                        message: "must have required property 'members'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.assembly !== void 0) {
                    let t = n.assembly;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/assembly",
                                schemaPath: "#/properties/assembly/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/assembly",
                            schemaPath: "#/properties/assembly/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.fqn !== void 0) {
                    let t = n.fqn;
                    if (typeof t == "string") {
                        if (f(t) < 3) {
                            let s = {
                                instancePath: r + "/fqn",
                                schemaPath: "#/properties/fqn/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 3
                                },
                                message: "must NOT have fewer than 3 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/fqn",
                            schemaPath: "#/properties/fqn/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.kind !== void 0) {
                    let t = n.kind;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "enum") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/const",
                            keyword: "const",
                            params: {
                                allowedValue: "enum"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.members !== void 0) {
                    let t = n.members;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) R(t[o], {
                            instancePath: r + "/members/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? R.errors : e.concat(R.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/members",
                            schemaPath: "#/properties/members/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.namespace !== void 0 && typeof n.namespace != "string") {
                    let t = {
                        instancePath: r + "/namespace",
                        schemaPath: "#/properties/namespace/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.symbolId !== void 0 && typeof n.symbolId != "string") {
                    let t = {
                        instancePath: r + "/symbolId",
                        schemaPath: "#/properties/symbolId/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return z.errors = e, i === 0;
        }
        function W(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.assembly === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "assembly"
                        },
                        message: "must have required property 'assembly'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.fqn === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fqn"
                        },
                        message: "must have required property 'fqn'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.kind === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "kind"
                        },
                        message: "must have required property 'kind'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.assembly !== void 0) {
                    let t = n.assembly;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/assembly",
                                schemaPath: "#/properties/assembly/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/assembly",
                            schemaPath: "#/properties/assembly/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.datatype !== void 0 && typeof n.datatype != "boolean") {
                    let t = {
                        instancePath: r + "/datatype",
                        schemaPath: "#/properties/datatype/type",
                        keyword: "type",
                        params: {
                            type: "boolean"
                        },
                        message: "must be boolean"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.fqn !== void 0) {
                    let t = n.fqn;
                    if (typeof t == "string") {
                        if (f(t) < 3) {
                            let s = {
                                instancePath: r + "/fqn",
                                schemaPath: "#/properties/fqn/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 3
                                },
                                message: "must NOT have fewer than 3 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/fqn",
                            schemaPath: "#/properties/fqn/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.interfaces !== void 0) {
                    let t = n.interfaces;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let p = 0; p < s; p++) if (typeof t[p] != "string") {
                            let c = {
                                instancePath: r + "/interfaces/" + p,
                                schemaPath: "#/properties/interfaces/items/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ c ] : e.push(c), i++;
                        }
                        let o = t.length, a;
                        if (o > 1) {
                            let p = {};
                            for (;o--; ) {
                                let c = t[o];
                                if (typeof c == "string") {
                                    if (typeof p[c] == "number") {
                                        a = p[c];
                                        let y = {
                                            instancePath: r + "/interfaces",
                                            schemaPath: "#/properties/interfaces/uniqueItems",
                                            keyword: "uniqueItems",
                                            params: {
                                                i: o,
                                                j: a
                                            },
                                            message: "must NOT have duplicate items (items ## " + a + " and " + o + " are identical)"
                                        };
                                        e === null ? e = [ y ] : e.push(y), i++;
                                        break;
                                    }
                                    p[c] = o;
                                }
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/interfaces",
                            schemaPath: "#/properties/interfaces/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.kind !== void 0) {
                    let t = n.kind;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "interface") {
                        let s = {
                            instancePath: r + "/kind",
                            schemaPath: "#/properties/kind/const",
                            keyword: "const",
                            params: {
                                allowedValue: "interface"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.locationInModule !== void 0) {
                    let t = n.locationInModule;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.filename === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "filename"
                                },
                                message: "must have required property 'filename'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line === void 0) {
                            let s = {
                                instancePath: r + "/locationInModule",
                                schemaPath: "#/definitions/SourceLocation/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "line"
                                },
                                message: "must have required property 'line'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.filename !== void 0 && typeof t.filename != "string") {
                            let s = {
                                instancePath: r + "/locationInModule/filename",
                                schemaPath: "#/definitions/SourceLocation/properties/filename/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.line !== void 0) {
                            let s = t.line;
                            if (!(typeof s == "number" && isFinite(s))) {
                                let o = {
                                    instancePath: r + "/locationInModule/line",
                                    schemaPath: "#/definitions/SourceLocation/properties/line/type",
                                    keyword: "type",
                                    params: {
                                        type: "number"
                                    },
                                    message: "must be number"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/locationInModule",
                            schemaPath: "#/definitions/SourceLocation/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.methods !== void 0) {
                    let t = n.methods;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) P(t[o], {
                            instancePath: r + "/methods/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? P.errors : e.concat(P.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/methods",
                            schemaPath: "#/properties/methods/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.namespace !== void 0 && typeof n.namespace != "string") {
                    let t = {
                        instancePath: r + "/namespace",
                        schemaPath: "#/properties/namespace/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.properties !== void 0) {
                    let t = n.properties;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) q(t[o], {
                            instancePath: r + "/properties/" + o,
                            parentData: t,
                            parentDataProperty: o,
                            rootData: l
                        }) || (e = e === null ? q.errors : e.concat(q.errors), i = e.length);
                    } else {
                        let s = {
                            instancePath: r + "/properties",
                            schemaPath: "#/properties/properties/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.symbolId !== void 0 && typeof n.symbolId != "string") {
                    let t = {
                        instancePath: r + "/symbolId",
                        schemaPath: "#/properties/symbolId/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return W.errors = e, i === 0;
        }
        function O(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0, t = i, s = !1, o = i;
            h(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? h.errors : e.concat(h.errors), i = e.length), x(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? x.errors : e.concat(x.errors), i = e.length);
            var a = o === i;
            if (s = s || a, !s) {
                let p = i;
                h(n, {
                    instancePath: r,
                    parentData: d,
                    parentDataProperty: m,
                    rootData: l
                }) || (e = e === null ? h.errors : e.concat(h.errors), i = e.length), z(n, {
                    instancePath: r,
                    parentData: d,
                    parentDataProperty: m,
                    rootData: l
                }) || (e = e === null ? z.errors : e.concat(z.errors), i = e.length);
                var a = p === i;
                if (s = s || a, !s) {
                    let y = i;
                    h(n, {
                        instancePath: r,
                        parentData: d,
                        parentDataProperty: m,
                        rootData: l
                    }) || (e = e === null ? h.errors : e.concat(h.errors), i = e.length), W(n, {
                        instancePath: r,
                        parentData: d,
                        parentDataProperty: m,
                        rootData: l
                    }) || (e = e === null ? W.errors : e.concat(W.errors), i = e.length);
                    var a = y === i;
                    s = s || a;
                }
            }
            if (s) i = t, e !== null && (t ? e.length = t : e = null); else {
                let p = {
                    instancePath: r,
                    schemaPath: "#/anyOf",
                    keyword: "anyOf",
                    params: {},
                    message: "must match a schema in anyOf"
                };
                e === null ? e = [ p ] : e.push(p), i++;
            }
            return O.errors = e, i === 0;
        }
        function C(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.author === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "author"
                        },
                        message: "must have required property 'author'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.description === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "description"
                        },
                        message: "must have required property 'description'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.fingerprint === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "fingerprint"
                        },
                        message: "must have required property 'fingerprint'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.homepage === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "homepage"
                        },
                        message: "must have required property 'homepage'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.jsiiVersion === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "jsiiVersion"
                        },
                        message: "must have required property 'jsiiVersion'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.license === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "license"
                        },
                        message: "must have required property 'license'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.name === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "name"
                        },
                        message: "must have required property 'name'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.repository === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "repository"
                        },
                        message: "must have required property 'repository'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.schema === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "schema"
                        },
                        message: "must have required property 'schema'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.version === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/required",
                        keyword: "required",
                        params: {
                            missingProperty: "version"
                        },
                        message: "must have required property 'version'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.author !== void 0) {
                    let t = n.author;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.name === void 0) {
                            let s = {
                                instancePath: r + "/author",
                                schemaPath: "#/definitions/Person/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "name"
                                },
                                message: "must have required property 'name'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.roles === void 0) {
                            let s = {
                                instancePath: r + "/author",
                                schemaPath: "#/definitions/Person/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "roles"
                                },
                                message: "must have required property 'roles'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.email !== void 0 && typeof t.email != "string") {
                            let s = {
                                instancePath: r + "/author/email",
                                schemaPath: "#/definitions/Person/properties/email/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.name !== void 0 && typeof t.name != "string") {
                            let s = {
                                instancePath: r + "/author/name",
                                schemaPath: "#/definitions/Person/properties/name/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.organization !== void 0 && typeof t.organization != "boolean") {
                            let s = {
                                instancePath: r + "/author/organization",
                                schemaPath: "#/definitions/Person/properties/organization/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.roles !== void 0) {
                            let s = t.roles;
                            if (Array.isArray(s)) {
                                let o = s.length;
                                for (let a = 0; a < o; a++) if (typeof s[a] != "string") {
                                    let p = {
                                        instancePath: r + "/author/roles/" + a,
                                        schemaPath: "#/definitions/Person/properties/roles/items/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/author/roles",
                                    schemaPath: "#/definitions/Person/properties/roles/type",
                                    keyword: "type",
                                    params: {
                                        type: "array"
                                    },
                                    message: "must be array"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.url !== void 0 && typeof t.url != "string") {
                            let s = {
                                instancePath: r + "/author/url",
                                schemaPath: "#/definitions/Person/properties/url/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/author",
                            schemaPath: "#/definitions/Person/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.bin !== void 0) {
                    let t = n.bin;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        for (let s in t) if (typeof t[s] != "string") {
                            let o = {
                                instancePath: r + "/bin/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/properties/bin/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ o ] : e.push(o), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/bin",
                            schemaPath: "#/properties/bin/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.bundled !== void 0) {
                    let t = n.bundled;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        for (let s in t) if (typeof t[s] != "string") {
                            let o = {
                                instancePath: r + "/bundled/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/properties/bundled/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ o ] : e.push(o), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/bundled",
                            schemaPath: "#/properties/bundled/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.contributors !== void 0) {
                    let t = n.contributors;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) {
                            let a = t[o];
                            if (a && typeof a == "object" && !Array.isArray(a)) {
                                if (a.name === void 0) {
                                    let p = {
                                        instancePath: r + "/contributors/" + o,
                                        schemaPath: "#/definitions/Person/required",
                                        keyword: "required",
                                        params: {
                                            missingProperty: "name"
                                        },
                                        message: "must have required property 'name'"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                                if (a.roles === void 0) {
                                    let p = {
                                        instancePath: r + "/contributors/" + o,
                                        schemaPath: "#/definitions/Person/required",
                                        keyword: "required",
                                        params: {
                                            missingProperty: "roles"
                                        },
                                        message: "must have required property 'roles'"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                                if (a.email !== void 0 && typeof a.email != "string") {
                                    let p = {
                                        instancePath: r + "/contributors/" + o + "/email",
                                        schemaPath: "#/definitions/Person/properties/email/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                                if (a.name !== void 0 && typeof a.name != "string") {
                                    let p = {
                                        instancePath: r + "/contributors/" + o + "/name",
                                        schemaPath: "#/definitions/Person/properties/name/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                                if (a.organization !== void 0 && typeof a.organization != "boolean") {
                                    let p = {
                                        instancePath: r + "/contributors/" + o + "/organization",
                                        schemaPath: "#/definitions/Person/properties/organization/type",
                                        keyword: "type",
                                        params: {
                                            type: "boolean"
                                        },
                                        message: "must be boolean"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                                if (a.roles !== void 0) {
                                    let p = a.roles;
                                    if (Array.isArray(p)) {
                                        let c = p.length;
                                        for (let y = 0; y < c; y++) if (typeof p[y] != "string") {
                                            let F = {
                                                instancePath: r + "/contributors/" + o + "/roles/" + y,
                                                schemaPath: "#/definitions/Person/properties/roles/items/type",
                                                keyword: "type",
                                                params: {
                                                    type: "string"
                                                },
                                                message: "must be string"
                                            };
                                            e === null ? e = [ F ] : e.push(F), i++;
                                        }
                                    } else {
                                        let c = {
                                            instancePath: r + "/contributors/" + o + "/roles",
                                            schemaPath: "#/definitions/Person/properties/roles/type",
                                            keyword: "type",
                                            params: {
                                                type: "array"
                                            },
                                            message: "must be array"
                                        };
                                        e === null ? e = [ c ] : e.push(c), i++;
                                    }
                                }
                                if (a.url !== void 0 && typeof a.url != "string") {
                                    let p = {
                                        instancePath: r + "/contributors/" + o + "/url",
                                        schemaPath: "#/definitions/Person/properties/url/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ p ] : e.push(p), i++;
                                }
                            } else {
                                let p = {
                                    instancePath: r + "/contributors/" + o,
                                    schemaPath: "#/definitions/Person/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ p ] : e.push(p), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/contributors",
                            schemaPath: "#/properties/contributors/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.dependencies !== void 0) {
                    let t = n.dependencies;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        for (let s in t) if (typeof t[s] != "string") {
                            let o = {
                                instancePath: r + "/dependencies/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/properties/dependencies/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ o ] : e.push(o), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/dependencies",
                            schemaPath: "#/properties/dependencies/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.dependencyClosure !== void 0) {
                    let t = n.dependencyClosure;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) v(t[s], {
                        instancePath: r + "/dependencyClosure/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                        parentData: t,
                        parentDataProperty: s,
                        rootData: l
                    }) || (e = e === null ? v.errors : e.concat(v.errors), i = e.length); else {
                        let s = {
                            instancePath: r + "/dependencyClosure",
                            schemaPath: "#/properties/dependencyClosure/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.description !== void 0 && typeof n.description != "string") {
                    let t = {
                        instancePath: r + "/description",
                        schemaPath: "#/properties/description/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.docs !== void 0) {
                    let t = n.docs;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.custom !== void 0) {
                            let s = t.custom;
                            if (s && typeof s == "object" && !Array.isArray(s)) {
                                for (let o in s) if (typeof s[o] != "string") {
                                    let a = {
                                        instancePath: r + "/docs/custom/" + o.replace(/~/g, "~0").replace(/\//g, "~1"),
                                        schemaPath: "#/definitions/Docs/properties/custom/additionalProperties/type",
                                        keyword: "type",
                                        params: {
                                            type: "string"
                                        },
                                        message: "must be string"
                                    };
                                    e === null ? e = [ a ] : e.push(a), i++;
                                }
                            } else {
                                let o = {
                                    instancePath: r + "/docs/custom",
                                    schemaPath: "#/definitions/Docs/properties/custom/type",
                                    keyword: "type",
                                    params: {
                                        type: "object"
                                    },
                                    message: "must be object"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.default !== void 0 && typeof t.default != "string") {
                            let s = {
                                instancePath: r + "/docs/default",
                                schemaPath: "#/definitions/Docs/properties/default/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.deprecated !== void 0 && typeof t.deprecated != "string") {
                            let s = {
                                instancePath: r + "/docs/deprecated",
                                schemaPath: "#/definitions/Docs/properties/deprecated/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.example !== void 0 && typeof t.example != "string") {
                            let s = {
                                instancePath: r + "/docs/example",
                                schemaPath: "#/definitions/Docs/properties/example/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.remarks !== void 0 && typeof t.remarks != "string") {
                            let s = {
                                instancePath: r + "/docs/remarks",
                                schemaPath: "#/definitions/Docs/properties/remarks/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.returns !== void 0 && typeof t.returns != "string") {
                            let s = {
                                instancePath: r + "/docs/returns",
                                schemaPath: "#/definitions/Docs/properties/returns/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.see !== void 0 && typeof t.see != "string") {
                            let s = {
                                instancePath: r + "/docs/see",
                                schemaPath: "#/definitions/Docs/properties/see/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.stability !== void 0) {
                            let s = t.stability;
                            if (typeof s != "string") {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                            if (!(s === "deprecated" || s === "experimental" || s === "external" || s === "stable")) {
                                let o = {
                                    instancePath: r + "/docs/stability",
                                    schemaPath: "#/definitions/Docs/properties/stability/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: g.properties.stability.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ o ] : e.push(o), i++;
                            }
                        }
                        if (t.subclassable !== void 0 && typeof t.subclassable != "boolean") {
                            let s = {
                                instancePath: r + "/docs/subclassable",
                                schemaPath: "#/definitions/Docs/properties/subclassable/type",
                                keyword: "type",
                                params: {
                                    type: "boolean"
                                },
                                message: "must be boolean"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.summary !== void 0 && typeof t.summary != "string") {
                            let s = {
                                instancePath: r + "/docs/summary",
                                schemaPath: "#/definitions/Docs/properties/summary/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/docs",
                            schemaPath: "#/definitions/Docs/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.fingerprint !== void 0) {
                    let t = n.fingerprint;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/fingerprint",
                                schemaPath: "#/properties/fingerprint/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/fingerprint",
                            schemaPath: "#/properties/fingerprint/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.homepage !== void 0 && typeof n.homepage != "string") {
                    let t = {
                        instancePath: r + "/homepage",
                        schemaPath: "#/properties/homepage/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.jsiiVersion !== void 0) {
                    let t = n.jsiiVersion;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/jsiiVersion",
                                schemaPath: "#/properties/jsiiVersion/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/jsiiVersion",
                            schemaPath: "#/properties/jsiiVersion/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.keywords !== void 0) {
                    let t = n.keywords;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) if (typeof t[o] != "string") {
                            let a = {
                                instancePath: r + "/keywords/" + o,
                                schemaPath: "#/properties/keywords/items/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ a ] : e.push(a), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/keywords",
                            schemaPath: "#/properties/keywords/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.license !== void 0 && typeof n.license != "string") {
                    let t = {
                        instancePath: r + "/license",
                        schemaPath: "#/properties/license/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.metadata !== void 0) {
                    let t = n.metadata;
                    if (!(t && typeof t == "object" && !Array.isArray(t))) {
                        let s = {
                            instancePath: r + "/metadata",
                            schemaPath: "#/properties/metadata/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.name !== void 0) {
                    let t = n.name;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/name",
                                schemaPath: "#/properties/name/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/name",
                            schemaPath: "#/properties/name/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.readme !== void 0) {
                    let t = n.readme;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.markdown === void 0) {
                            let s = {
                                instancePath: r + "/readme",
                                schemaPath: "#/definitions/ReadMe/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "markdown"
                                },
                                message: "must have required property 'markdown'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.markdown !== void 0 && typeof t.markdown != "string") {
                            let s = {
                                instancePath: r + "/readme/markdown",
                                schemaPath: "#/definitions/ReadMe/properties/markdown/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/readme",
                            schemaPath: "#/definitions/ReadMe/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.repository !== void 0) {
                    let t = n.repository;
                    if (t && typeof t == "object" && !Array.isArray(t)) {
                        if (t.type === void 0) {
                            let s = {
                                instancePath: r + "/repository",
                                schemaPath: "#/properties/repository/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "type"
                                },
                                message: "must have required property 'type'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.url === void 0) {
                            let s = {
                                instancePath: r + "/repository",
                                schemaPath: "#/properties/repository/required",
                                keyword: "required",
                                params: {
                                    missingProperty: "url"
                                },
                                message: "must have required property 'url'"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.directory !== void 0 && typeof t.directory != "string") {
                            let s = {
                                instancePath: r + "/repository/directory",
                                schemaPath: "#/properties/repository/properties/directory/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.type !== void 0 && typeof t.type != "string") {
                            let s = {
                                instancePath: r + "/repository/type",
                                schemaPath: "#/properties/repository/properties/type/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                        if (t.url !== void 0 && typeof t.url != "string") {
                            let s = {
                                instancePath: r + "/repository/url",
                                schemaPath: "#/properties/repository/properties/url/type",
                                keyword: "type",
                                params: {
                                    type: "string"
                                },
                                message: "must be string"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/repository",
                            schemaPath: "#/properties/repository/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.schema !== void 0) {
                    let t = n.schema;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/schema",
                            schemaPath: "#/properties/schema/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "jsii/0.10.0") {
                        let s = {
                            instancePath: r + "/schema",
                            schemaPath: "#/properties/schema/const",
                            keyword: "const",
                            params: {
                                allowedValue: "jsii/0.10.0"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.submodules !== void 0) {
                    let t = n.submodules;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) T(t[s], {
                        instancePath: r + "/submodules/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                        parentData: t,
                        parentDataProperty: s,
                        rootData: l
                    }) || (e = e === null ? T.errors : e.concat(T.errors), i = e.length); else {
                        let s = {
                            instancePath: r + "/submodules",
                            schemaPath: "#/properties/submodules/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.targets !== void 0) {
                    let t = n.targets;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) {
                        let o = t[s];
                        if (!(o && typeof o == "object" && !Array.isArray(o))) {
                            let a = {
                                instancePath: r + "/targets/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                                schemaPath: "#/definitions/AssemblyTargets/additionalProperties/type",
                                keyword: "type",
                                params: {
                                    type: "object"
                                },
                                message: "must be object"
                            };
                            e === null ? e = [ a ] : e.push(a), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/targets",
                            schemaPath: "#/definitions/AssemblyTargets/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.types !== void 0) {
                    let t = n.types;
                    if (t && typeof t == "object" && !Array.isArray(t)) for (let s in t) O(t[s], {
                        instancePath: r + "/types/" + s.replace(/~/g, "~0").replace(/\//g, "~1"),
                        parentData: t,
                        parentDataProperty: s,
                        rootData: l
                    }) || (e = e === null ? O.errors : e.concat(O.errors), i = e.length); else {
                        let s = {
                            instancePath: r + "/types",
                            schemaPath: "#/properties/types/type",
                            keyword: "type",
                            params: {
                                type: "object"
                            },
                            message: "must be object"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.usedFeatures !== void 0) {
                    let t = n.usedFeatures;
                    if (Array.isArray(t)) {
                        let s = t.length;
                        for (let o = 0; o < s; o++) {
                            let a = t[o];
                            if (typeof a != "string") {
                                let p = {
                                    instancePath: r + "/usedFeatures/" + o,
                                    schemaPath: "#/properties/usedFeatures/items/type",
                                    keyword: "type",
                                    params: {
                                        type: "string"
                                    },
                                    message: "must be string"
                                };
                                e === null ? e = [ p ] : e.push(p), i++;
                            }
                            if (!(a === "class-covariant-overrides" || a === "intersection-types")) {
                                let p = {
                                    instancePath: r + "/usedFeatures/" + o,
                                    schemaPath: "#/properties/usedFeatures/items/enum",
                                    keyword: "enum",
                                    params: {
                                        allowedValues: Q.properties.usedFeatures.items.enum
                                    },
                                    message: "must be equal to one of the allowed values"
                                };
                                e === null ? e = [ p ] : e.push(p), i++;
                            }
                        }
                    } else {
                        let s = {
                            instancePath: r + "/usedFeatures",
                            schemaPath: "#/properties/usedFeatures/type",
                            keyword: "type",
                            params: {
                                type: "array"
                            },
                            message: "must be array"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.version !== void 0) {
                    let t = n.version;
                    if (typeof t == "string") {
                        if (f(t) < 1) {
                            let s = {
                                instancePath: r + "/version",
                                schemaPath: "#/properties/version/minLength",
                                keyword: "minLength",
                                params: {
                                    limit: 1
                                },
                                message: "must NOT have fewer than 1 characters"
                            };
                            e === null ? e = [ s ] : e.push(s), i++;
                        }
                    } else {
                        let s = {
                            instancePath: r + "/version",
                            schemaPath: "#/properties/version/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return C.errors = e, i === 0;
        }
        function U(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            return C(n, {
                instancePath: r,
                parentData: d,
                parentDataProperty: m,
                rootData: l
            }) || (e = e === null ? C.errors : e.concat(C.errors), i = e.length), U.errors = e, 
            i === 0;
        }
        exports.validateRedirect = J;
        function J(n, {instancePath: r = "", parentData: d, parentDataProperty: m, rootData: l = n} = {}) {
            let e = null, i = 0;
            if (n && typeof n == "object" && !Array.isArray(n)) {
                if (n.filename === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/definitions/AssemblyRedirect/required",
                        keyword: "required",
                        params: {
                            missingProperty: "filename"
                        },
                        message: "must have required property 'filename'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.schema === void 0) {
                    let t = {
                        instancePath: r,
                        schemaPath: "#/definitions/AssemblyRedirect/required",
                        keyword: "required",
                        params: {
                            missingProperty: "schema"
                        },
                        message: "must have required property 'schema'"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.compression !== void 0) {
                    let t = n.compression;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/compression",
                            schemaPath: "#/definitions/AssemblyRedirect/properties/compression/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "gzip") {
                        let s = {
                            instancePath: r + "/compression",
                            schemaPath: "#/definitions/AssemblyRedirect/properties/compression/const",
                            keyword: "const",
                            params: {
                                allowedValue: "gzip"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
                if (n.filename !== void 0 && typeof n.filename != "string") {
                    let t = {
                        instancePath: r + "/filename",
                        schemaPath: "#/definitions/AssemblyRedirect/properties/filename/type",
                        keyword: "type",
                        params: {
                            type: "string"
                        },
                        message: "must be string"
                    };
                    e === null ? e = [ t ] : e.push(t), i++;
                }
                if (n.schema !== void 0) {
                    let t = n.schema;
                    if (typeof t != "string") {
                        let s = {
                            instancePath: r + "/schema",
                            schemaPath: "#/definitions/AssemblyRedirect/properties/schema/type",
                            keyword: "type",
                            params: {
                                type: "string"
                            },
                            message: "must be string"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                    if (t !== "jsii/file-redirect") {
                        let s = {
                            instancePath: r + "/schema",
                            schemaPath: "#/definitions/AssemblyRedirect/properties/schema/const",
                            keyword: "const",
                            params: {
                                allowedValue: "jsii/file-redirect"
                            },
                            message: "must be equal to constant"
                        };
                        e === null ? e = [ s ] : e.push(s), i++;
                    }
                }
            } else {
                let t = {
                    instancePath: r,
                    schemaPath: "#/definitions/AssemblyRedirect/type",
                    keyword: "type",
                    params: {
                        type: "object"
                    },
                    message: "must be object"
                };
                e === null ? e = [ t ] : e.push(t), i++;
            }
            return J.errors = e, i === 0;
        }
    },
    8623(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.KernelHost = void 0;
        const kernel_1 = __webpack_require__(7583);
        const events_1 = __webpack_require__(4434);
        class KernelHost {
            constructor(inout, opts = {}) {
                var _a, _b, _c;
                this.inout = inout;
                this.opts = opts;
                this.kernel = new kernel_1.Kernel(this.callbackHandler.bind(this));
                this.eventEmitter = new events_1.EventEmitter;
                this.kernel.traceEnabled = (_a = opts.debug) !== null && _a !== void 0 ? _a : false;
                this.kernel.debugTimingEnabled = (_b = opts.debugTiming) !== null && _b !== void 0 ? _b : false;
                this.kernel.validateAssemblies = (_c = opts.validateAssemblies) !== null && _c !== void 0 ? _c : false;
            }
            run() {
                var _a;
                const req = this.inout.read();
                if (!req || "exit" in req) {
                    this.eventEmitter.emit("exit", (_a = req === null || req === void 0 ? void 0 : req.exit) !== null && _a !== void 0 ? _a : 0);
                    return;
                }
                this.processRequest(req, () => {
                    setImmediate(() => this.run());
                });
            }
            once(event, listener) {
                this.eventEmitter.once(event, listener);
            }
            callbackHandler(callback) {
                this.inout.write({
                    callback
                });
                return completeCallback.call(this);
                function completeCallback() {
                    const req = this.inout.read();
                    if (!req || "exit" in req) {
                        throw new kernel_1.JsiiFault("Interrupted before callback returned");
                    }
                    const completeReq = req;
                    if ("complete" in completeReq && completeReq.complete.cbid === callback.cbid) {
                        if (completeReq.complete.err) {
                            if (completeReq.complete.name === "@jsii/kernel.Fault") {
                                throw new kernel_1.JsiiFault(completeReq.complete.err);
                            }
                            throw new kernel_1.RuntimeError(completeReq.complete.err);
                        }
                        return completeReq.complete.result;
                    }
                    return this.processRequest(req, completeCallback.bind(this), true);
                }
            }
            processRequest(req, next, sync = false) {
                if ("callback" in req) {
                    throw new kernel_1.JsiiFault("Unexpected `callback` result. This request should have been processed by a callback handler");
                }
                if (!("api" in req)) {
                    throw new kernel_1.JsiiFault('Malformed request, "api" field is required');
                }
                const apiReq = req;
                const fn = this.findApi(apiReq.api);
                try {
                    const ret = fn.call(this.kernel, req);
                    if (apiReq.api === "begin" || apiReq.api === "complete") {
                        checkIfAsyncIsAllowed();
                        this.debug("processing pending promises before responding");
                        setImmediate(() => {
                            this.writeOkay(ret);
                            next();
                        });
                        return undefined;
                    }
                    if (this.isPromise(ret)) {
                        checkIfAsyncIsAllowed();
                        this.debug("waiting for promise to be fulfilled");
                        const promise = ret;
                        promise.then(val => {
                            this.debug("promise succeeded:", val);
                            this.writeOkay(val);
                            next();
                        }).catch(e => {
                            this.debug("promise failed:", e);
                            this.writeError(e);
                            next();
                        });
                        return undefined;
                    }
                    this.writeOkay(ret);
                } catch (e) {
                    this.writeError(e);
                }
                return next();
                function checkIfAsyncIsAllowed() {
                    if (sync) {
                        throw new kernel_1.JsiiFault("Cannot handle async operations while waiting for a sync callback to return");
                    }
                }
            }
            writeOkay(result) {
                const res = {
                    ok: result
                };
                this.inout.write(res);
            }
            writeError(error) {
                const res = {
                    error: error.message,
                    name: error.name,
                    stack: this.opts.noStack ? undefined : error.stack
                };
                this.inout.write(res);
            }
            isPromise(v) {
                return typeof (v === null || v === void 0 ? void 0 : v.then) === "function";
            }
            findApi(apiName) {
                const fn = this.kernel[apiName];
                if (typeof fn !== "function") {
                    throw new Error(`Invalid kernel api call: ${apiName}`);
                }
                return fn;
            }
            debug(...args) {
                if (!this.opts.debug) {
                    return;
                }
                console.error(...args);
            }
        }
        exports.KernelHost = KernelHost;
    },
    6663(__unused_webpack_module, exports) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.InputOutput = void 0;
        class InputOutput {
            constructor(stdio) {
                this.stdio = stdio;
                this.debug = false;
            }
            write(obj) {
                const output = JSON.stringify(obj);
                this.stdio.writeLine(output);
                if (this.debug) {
                    this.stdio.writeErrorLine(`< ${output}`);
                }
            }
            read() {
                let reqLine = this.stdio.readLine();
                if (!reqLine) {
                    return undefined;
                }
                if (reqLine.startsWith("< ")) {
                    return this.read();
                }
                if (reqLine.startsWith("> ")) {
                    reqLine = reqLine.slice(2);
                }
                const input = JSON.parse(reqLine);
                if (this.debug) {
                    this.stdio.writeErrorLine(`> ${JSON.stringify(input)}`);
                }
                return input;
            }
        }
        exports.InputOutput = InputOutput;
    },
    7614(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: true
        });
        exports.SyncStdio = void 0;
        const fs = __webpack_require__(9896);
        const INPUT_BUFFER_SIZE = 1048576;
        class SyncStdio {
            constructor({errorFD, readFD, writeFD}) {
                this.bufferedData = Buffer.alloc(0);
                this.readBuffer = Buffer.alloc(INPUT_BUFFER_SIZE);
                this.stderr = errorFD;
                this.stdin = readFD;
                this.stdout = writeFD;
            }
            writeErrorLine(line) {
                this.writeBuffer(Buffer.from(`${line}\n`), this.stderr);
            }
            writeLine(line) {
                this.writeBuffer(Buffer.from(`${line}\n`), this.stdout);
            }
            readLine() {
                while (!this.bufferedData.includes("\n", 0, "utf-8")) {
                    const read = fs.readSync(this.stdin, this.readBuffer, 0, this.readBuffer.length, null);
                    if (read === 0) {
                        return undefined;
                    }
                    const newData = this.readBuffer.slice(0, read);
                    this.bufferedData = Buffer.concat([ this.bufferedData, newData ]);
                }
                const newLinePos = this.bufferedData.indexOf("\n", 0, "utf-8");
                const next = this.bufferedData.slice(0, newLinePos).toString("utf-8");
                this.bufferedData = this.bufferedData.slice(newLinePos + 1);
                return next;
            }
            writeBuffer(buffer, fd) {
                let offset = 0;
                while (offset < buffer.length) {
                    try {
                        offset += fs.writeSync(fd, buffer, offset);
                    } catch (e) {
                        if (e.code !== "EAGAIN") {
                            throw e;
                        }
                    }
                }
            }
        }
        exports.SyncStdio = SyncStdio;
    },
    2613(module) {
        "use strict";
        module.exports = require("assert");
    },
    181(module) {
        "use strict";
        module.exports = require("buffer");
    },
    5317(module) {
        "use strict";
        module.exports = require("child_process");
    },
    9140(module) {
        "use strict";
        module.exports = require("constants");
    },
    6982(module) {
        "use strict";
        module.exports = require("crypto");
    },
    4434(module) {
        "use strict";
        module.exports = require("events");
    },
    9896(module) {
        "use strict";
        module.exports = require("fs");
    },
    3339(module) {
        "use strict";
        module.exports = require("module");
    },
    857(module) {
        "use strict";
        module.exports = require("os");
    },
    6928(module) {
        "use strict";
        module.exports = require("path");
    },
    932(module) {
        "use strict";
        module.exports = require("process");
    },
    2203(module) {
        "use strict";
        module.exports = require("stream");
    },
    3193(module) {
        "use strict";
        module.exports = require("string_decoder");
    },
    9023(module) {
        "use strict";
        module.exports = require("util");
    },
    3106(module) {
        "use strict";
        module.exports = require("zlib");
    },
    3346(module) {
        "use strict";
        module.exports = JSON.parse('{"$ref":"#/definitions/AssemblyRedirect","$schema":"http://json-schema.org/draft-07/schema#","definitions":{"AssemblyRedirect":{"properties":{"compression":{"const":"gzip","description":"The compression applied to the target file, if any.","type":"string"},"filename":{"description":"The name of the file the assembly is redirected to.","type":"string"},"schema":{"const":"jsii/file-redirect","type":"string"}},"required":["filename","schema"],"type":"object"}}}');
    },
    878(module) {
        "use strict";
        module.exports = JSON.parse('{"$ref":"#/definitions/Assembly","$schema":"http://json-schema.org/draft-07/schema#","definitions":{"Assembly":{"description":"A JSII assembly specification.","properties":{"author":{"$ref":"#/definitions/Person","description":"The main author of this package."},"bin":{"additionalProperties":{"type":"string"},"default":"none","description":"List of bin-scripts","type":"object"},"bundled":{"additionalProperties":{"type":"string"},"default":"none","description":"List if bundled dependencies (these are not expected to be jsii\\nassemblies).","type":"object"},"contributors":{"default":"none","description":"Additional contributors to this package.","items":{"$ref":"#/definitions/Person"},"type":"array"},"dependencies":{"additionalProperties":{"type":"string"},"default":"none","description":"Direct dependencies on other assemblies (with semver), the key is the JSII\\nassembly name, and the value is a SemVer expression.","type":"object"},"dependencyClosure":{"additionalProperties":{"$ref":"#/definitions/DependencyConfiguration"},"default":"none","description":"Target configuration for all the assemblies that are direct or transitive\\ndependencies of this assembly. This is needed to generate correct native\\ntype names for any transitively inherited member, in certain languages.","type":"object"},"description":{"description":"Description of the assembly, maps to \\"description\\" from package.json\\nThis is required since some package managers (like Maven) require it.","type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fingerprint":{"description":"A fingerprint that can be used to determine if the specification has\\nchanged.","minLength":1,"type":"string"},"homepage":{"description":"The url to the project homepage. Maps to \\"homepage\\" from package.json.","type":"string"},"jsiiVersion":{"description":"The version of the jsii compiler that was used to produce this Assembly.","minLength":1,"type":"string"},"keywords":{"description":"Keywords that help discover or identify this packages with respects to it\'s\\nintended usage, audience, etc... Where possible, this will be rendered in\\nthe corresponding metadata section of idiomatic package manifests, for\\nexample NuGet package tags.","items":{"type":"string"},"type":"array"},"license":{"description":"The SPDX name of the license this assembly is distributed on.","type":"string"},"metadata":{"additionalProperties":{},"default":"none","description":"Arbitrary key-value pairs of metadata, which the maintainer chose to\\ndocument with the assembly. These entries do not carry normative\\nsemantics and their interpretation is up to the assembly maintainer.","type":"object"},"name":{"description":"The name of the assembly","minLength":1,"type":"string"},"readme":{"$ref":"#/definitions/ReadMe","default":"none","description":"The readme document for this module (if any)."},"repository":{"description":"The module repository, maps to \\"repository\\" from package.json\\nThis is required since some package managers (like Maven) require it.","properties":{"directory":{"default":"the root of the repository","description":"If the package is not in the root directory (for example, when part\\nof a monorepo), you should specify the directory in which it lives.","type":"string"},"type":{"description":"The type of the repository (``git``, ``svn``, ...)","type":"string"},"url":{"description":"The URL of the repository.","type":"string"}},"required":["type","url"],"type":"object"},"schema":{"const":"jsii/0.10.0","description":"The version of the spec schema\\n\\nNOTE: we cannot ever change this value anymore! If we do, new instances of\\nassmblies that would have been backwards compatible with the old schema\\nstill cannot be loaded, because the schema versions don\'t match exactly (as\\nvalidated by JSON Schema validators on loading).\\n\\nWe *must* always emit this value as \'jsii/0.10.0\'.\\n\\nInstead, see `usedFeatures` for a dynamic way to do feature validation\\nwithout relying on a fixed schema version.","type":"string"},"submodules":{"additionalProperties":{"$ref":"#/definitions/Submodule"},"default":"none","description":"Submodules declared in this assembly.","type":"object"},"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."},"types":{"additionalProperties":{"$ref":"#/definitions/Type"},"default":"none","description":"All types in the assembly, keyed by their fully-qualified-name","type":"object"},"usedFeatures":{"default":"- Only original jsii features.","description":"List of features used in this assembly\\n\\nIf a modern jsii feature is used in the assembly, a descriptive string\\nshould be added here. This field will be used to selectively reject the\\nloading of assemblies that requires features not currently supported by the\\njsii kernel, or downstream jsii tools.","items":{"enum":["class-covariant-overrides","intersection-types"],"type":"string"},"type":"array"},"version":{"description":"The version of the assembly","minLength":1,"type":"string"}},"required":["author","description","fingerprint","homepage","jsiiVersion","license","name","repository","schema","version"],"type":"object"},"AssemblyTargets":{"additionalProperties":{"additionalProperties":{},"type":"object"},"description":"Configurable targets for an asembly.","type":"object"},"Callable":{"description":"An Initializer or a Method.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"parameters":{"default":"none","description":"The parameters of the Initializer or Method.","items":{"$ref":"#/definitions/Parameter"},"type":"array"},"protected":{"default":false,"description":"Indicates if this Initializer or Method is protected (otherwise it is\\npublic, since private members are not modeled).","type":"boolean"},"variadic":{"default":false,"description":"Indicates whether this Initializer or Method is variadic or not. When\\n``true``, the last element of ``#parameters`` will also be flagged\\n``#variadic``.","type":"boolean"}},"type":"object"},"ClassType":{"description":"Represents classes.","properties":{"abstract":{"default":false,"description":"Indicates if this class is an abstract class.","type":"boolean"},"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"base":{"default":"no base class","description":"The FQN of the base class of this class, if it has one.","type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"initializer":{"$ref":"#/definitions/Callable","default":"no initializer","description":"Initializer (constructor) method."},"interfaces":{"default":"none","description":"The FQNs of the interfaces this class implements, if any.","items":{"type":"string"},"type":"array","uniqueItems":true},"kind":{"const":"class","description":"The kind of the type.","type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"methods":{"default":"none","description":"List of methods.","items":{"$ref":"#/definitions/Method"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"properties":{"default":"none","description":"List of properties.","items":{"$ref":"#/definitions/Property"},"type":"array"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"CollectionKind":{"description":"Kinds of collections.","enum":["array","map"],"type":"string"},"CollectionTypeReference":{"description":"Reference to a collection type.","properties":{"collection":{"properties":{"elementtype":{"$ref":"#/definitions/TypeReference","description":"The type of an element (map keys are always strings)."},"kind":{"$ref":"#/definitions/CollectionKind","description":"The kind of collection."}},"required":["elementtype","kind"],"type":"object"}},"required":["collection"],"type":"object"},"DependencyConfiguration":{"properties":{"submodules":{"additionalProperties":{"$ref":"#/definitions/Targetable"},"type":"object"},"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."}},"type":"object"},"Docs":{"description":"Key value pairs of documentation nodes.\\nBased on TSDoc.","properties":{"custom":{"additionalProperties":{"type":"string"},"default":"none","description":"Custom tags that are not any of the default ones","type":"object"},"default":{"default":"none","description":"Description of the default","type":"string"},"deprecated":{"default":"none","description":"If present, this block indicates that an API item is no longer supported\\nand may be removed in a future release.  The `@deprecated` tag must be\\nfollowed by a sentence describing the recommended alternative.\\nDeprecation recursively applies to members of a container. For example,\\nif a class is deprecated, then so are all of its members.","type":"string"},"example":{"default":"none","description":"Example showing the usage of this API item\\n\\nStarts off in running text mode, may switch to code using fenced code\\nblocks.","type":"string"},"remarks":{"default":"none","description":"Detailed information about an API item.\\n\\nEither the explicitly tagged `@remarks` section, otherwise everything\\npast the first paragraph if there is no `@remarks` tag.","type":"string"},"returns":{"default":"none","description":"The `@returns` block for this doc comment, or undefined if there is not\\none.","type":"string"},"see":{"default":"none","description":"A `@see` link with more information","type":"string"},"stability":{"description":"Whether the API item is beta/experimental quality","enum":["deprecated","experimental","external","stable"],"type":"string"},"subclassable":{"default":false,"description":"Whether this class or interface was intended to be subclassed/implemented\\nby library users.\\n\\nClasses intended for subclassing, and interfaces intended to be\\nimplemented by consumers, are held to stricter standards of API\\ncompatibility.","type":"boolean"},"summary":{"default":"none","description":"Summary documentation for an API item.\\n\\nThe first part of the documentation before hitting a `@remarks` tags, or\\nthe first line of the doc comment block if there is no `@remarks` tag.","type":"string"}},"type":"object"},"EnumMember":{"description":"Represents a member of an enum.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"name":{"description":"The name/symbol of the member.","type":"string"}},"required":["name"],"type":"object"},"EnumType":{"description":"Represents an enum type.","properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"kind":{"const":"enum","description":"The kind of the type.","type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"members":{"description":"Members of the enum.","items":{"$ref":"#/definitions/EnumMember"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","members","name"],"type":"object"},"InterfaceType":{"properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"datatype":{"default":false,"description":"True if this interface only contains properties. Different backends might\\nhave idiomatic ways to allow defining concrete instances such interfaces.\\nFor example, in Java, the generator will produce a PoJo and a builder\\nwhich will allow users to create a concrete object with data which\\nadheres to this interface.","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"interfaces":{"default":"none","description":"The FQNs of the interfaces this interface extends, if any.","items":{"type":"string"},"type":"array","uniqueItems":true},"kind":{"const":"interface","description":"The kind of the type.","type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"methods":{"default":"none","description":"List of methods.","items":{"$ref":"#/definitions/Method"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"properties":{"default":"none","description":"List of properties.","items":{"$ref":"#/definitions/Property"},"type":"array"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"IntersectionTypeReference":{"description":"Reference to an intersection type.","properties":{"intersection":{"description":"Indicates that this is an intersection type, which means it must satisfy all of the given types.","properties":{"types":{"description":"All the possible types (including the primary type).","items":{"$ref":"#/definitions/TypeReference"},"minItems":2,"type":"array"}},"required":["types"],"type":"object"}},"required":["intersection"],"type":"object"},"Method":{"description":"A method with a name (i.e: not an initializer).","properties":{"abstract":{"default":false,"description":"Is this method an abstract method (this means the class will also be an abstract class)","type":"boolean"},"async":{"default":false,"description":"Indicates if this is an asynchronous method (it will return a promise).","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The name of the method. Undefined if this method is a initializer.","type":"string"},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"parameters":{"default":"none","description":"The parameters of the Initializer or Method.","items":{"$ref":"#/definitions/Parameter"},"type":"array"},"protected":{"default":false,"description":"Indicates if this Initializer or Method is protected (otherwise it is\\npublic, since private members are not modeled).","type":"boolean"},"returns":{"$ref":"#/definitions/OptionalValue","default":"void","description":"The return type of the method (`undefined` if `void`)"},"static":{"default":false,"description":"Indicates if this is a static method.","type":"boolean"},"variadic":{"default":false,"description":"Indicates whether this Initializer or Method is variadic or not. When\\n``true``, the last element of ``#parameters`` will also be flagged\\n``#variadic``.","type":"boolean"}},"required":["name"],"type":"object"},"NamedTypeReference":{"description":"Reference to a named type, defined by this assembly or one of its\\ndependencies.","properties":{"fqn":{"description":"The fully-qualified-name of the type (can be located in the\\n``spec.types[fqn]``` of the assembly that defines the type).","type":"string"}},"required":["fqn"],"type":"object"},"OptionalValue":{"description":"A value that can possibly be optional.","properties":{"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."}},"required":["type"],"type":"object"},"Parameter":{"description":"Represents a method parameter.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"name":{"description":"The name of the parameter.","minLength":1,"type":"string"},"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."},"variadic":{"default":false,"description":"Whether this is the last parameter of a variadic method. In such cases,\\nthe `#type` attribute is the type of each individual item of the variadic\\narguments list (as opposed to some array type, as for example TypeScript\\nwould model it).","type":"boolean"}},"required":["name","type"],"type":"object"},"Person":{"description":"Metadata about people or organizations associated with the project that\\nresulted in the Assembly. Some of this metadata is required in order to\\npublish to certain package repositories (for example, Maven Central), but is\\nnot normalized, and the meaning of fields (role, for example), is up to each\\nproject maintainer.","properties":{"email":{"default":"none","description":"The email of the person","type":"string"},"name":{"description":"The name of the person","type":"string"},"organization":{"default":false,"description":"If true, this person is, in fact, an organization","type":"boolean"},"roles":{"description":"A list of roles this person has in the project, for example `maintainer`,\\n`contributor`, `owner`, ...","items":{"type":"string"},"type":"array"},"url":{"default":"none","description":"The URL for the person","type":"string"}},"required":["name","roles"],"type":"object"},"PrimitiveType":{"description":"Kinds of primitive types.","enum":["date","string","number","boolean","json","any"],"type":"string"},"PrimitiveTypeReference":{"description":"Reference to a primitive type.","properties":{"primitive":{"$ref":"#/definitions/PrimitiveType","description":"If this is a reference to a primitive type, this will include the\\nprimitive type kind."}},"required":["primitive"],"type":"object"},"Property":{"description":"A class property.","properties":{"abstract":{"default":false,"description":"Indicates if this property is abstract","type":"boolean"},"const":{"default":false,"description":"A hint that indicates that this static, immutable property is initialized\\nduring startup. This allows emitting \\"const\\" idioms in different target\\nlanguages. Implies `static` and `immutable`.","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"immutable":{"default":false,"description":"Indicates if this property only has a getter (immutable).","type":"boolean"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The name of the property.","minLength":1,"type":"string"},"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"protected":{"default":false,"description":"Indicates if this property is protected (otherwise it is public)","type":"boolean"},"static":{"default":false,"description":"Indicates if this is a static property.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."}},"required":["name","type"],"type":"object"},"ReadMe":{"description":"README information","properties":{"markdown":{"type":"string"}},"required":["markdown"],"type":"object"},"ReadMeContainer":{"description":"Elements that can contain a `readme` property.","properties":{"readme":{"$ref":"#/definitions/ReadMe","default":"none","description":"The readme document for this module (if any)."}},"type":"object"},"SourceLocatable":{"description":"Indicates that an entity has a source location","properties":{"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."}},"type":"object"},"SourceLocation":{"description":"Where in the module source the definition for this API item was found","properties":{"filename":{"description":"Relative filename","type":"string"},"line":{"description":"1-based line number in the indicated file","type":"number"}},"required":["filename","line"],"type":"object"},"Submodule":{"allOf":[{"$ref":"#/definitions/ReadMeContainer"},{"$ref":"#/definitions/SourceLocatable"},{"$ref":"#/definitions/Targetable"},{"$ref":"#/definitions/TypeScriptLocatable"}],"description":"A submodule\\n\\nThe difference between a top-level module (the assembly) and a submodule is\\nthat the submodule is annotated with its location in the repository."},"Targetable":{"description":"A targetable module-like thing\\n\\nHas targets and a readme. Used for Assemblies and Submodules.","properties":{"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."}},"type":"object"},"Type":{"anyOf":[{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/ClassType"}]},{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/EnumType"}]},{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/InterfaceType"}]}],"description":"Represents a type definition (not a type reference)."},"TypeBase":{"description":"Common attributes of a type definition.","properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"kind":{"$ref":"#/definitions/TypeKind","description":"The kind of the type."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"TypeKind":{"description":"Kinds of types.","enum":["class","enum","interface"],"type":"string"},"TypeReference":{"anyOf":[{"$ref":"#/definitions/NamedTypeReference"},{"$ref":"#/definitions/PrimitiveTypeReference"},{"$ref":"#/definitions/CollectionTypeReference"},{"$ref":"#/definitions/UnionTypeReference"},{"$ref":"#/definitions/IntersectionTypeReference"}],"description":"A reference to a type (primitive, collection or fqn)."},"TypeScriptLocatable":{"description":"Indicates that a jsii entity\'s origin can be traced to TypeScript code\\n\\nThis is interface is not the same as `SourceLocatable`. SourceLocatable\\nidentifies lines in source files in a source repository (in a `.ts` file,\\nwith respect to a git root).\\n\\nOn the other hand, `TypeScriptLocatable` identifies a symbol name inside a\\npotentially distributed TypeScript file (in either a `.d.ts` or `.ts`\\nfile, with respect to the package root).","properties":{"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"type":"object"},"UnionTypeReference":{"description":"Reference to a union type.","properties":{"union":{"description":"Indicates that this is a union type, which means it can be one of a set\\nof types.","properties":{"types":{"description":"All the possible types (including the primary type).","items":{"$ref":"#/definitions/TypeReference"},"minItems":2,"type":"array"}},"required":["types"],"type":"object"}},"required":["union"],"type":"object"}}}');
    },
    8330(module) {
        "use strict";
        module.exports = JSON.parse('{"name":"@jsii/runtime","version":"1.127.0","description":"jsii runtime kernel process","license":"Apache-2.0","author":{"name":"Amazon Web Services","url":"https://aws.amazon.com"},"homepage":"https://github.com/aws/jsii","bugs":{"url":"https://github.com/aws/jsii/issues"},"repository":{"type":"git","url":"https://github.com/aws/jsii.git","directory":"packages/@jsii/runtime"},"engines":{"node":">= 14.17.0"},"main":"lib/index.js","types":"lib/index.d.ts","bin":{"jsii-runtime":"bin/jsii-runtime"},"scripts":{"build":"tsc --build && chmod +x bin/jsii-runtime && npx webpack-cli && yarn lint","watch":"tsc --build -w","lint":"ESLINT_USE_FLAT_CONFIG=false NODE_OPTIONS=\'--disable-warning=ESLintRCWarning\' eslint . --ext .js,.ts --ignore-path=.gitignore --ignore-pattern=webpack.config.js","lint:fix":"yarn lint --fix","test":"jest","test:update":"jest -u","package":"package-js"},"dependencies":{"@jsii/kernel":"^1.127.0","@jsii/check-node":"1.127.0","@jsii/spec":"1.127.0"},"devDependencies":{"@scope/jsii-calc-base":"^1.127.0","@scope/jsii-calc-lib":"^1.127.0","jsii-build-tools":"^1.127.0","jsii-calc":"^3.20.120","source-map-loader":"^5.0.0","webpack":"^5.105.2","webpack-cli":"^6.0.1"}}');
    }
};

var __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (cachedModule !== undefined) {
        return cachedModule.exports;
    }
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
    return module.exports;
}

var __webpack_exports__ = {};

(() => {
    "use strict";
    var exports = __webpack_exports__;
    var __webpack_unused_export__;
    var _a;
    __webpack_unused_export__ = {
        value: true
    };
    const packageInfo = __webpack_require__(8330);
    const host_1 = __webpack_require__(8623);
    const in_out_1 = __webpack_require__(6663);
    const sync_stdio_1 = __webpack_require__(7614);
    const program_name = packageInfo.name;
    const version = packageInfo.version;
    const noStack = !!process.env.JSII_NOSTACK;
    const debug = !!process.env.JSII_DEBUG;
    const debugTiming = !!process.env.JSII_DEBUG_TIMING;
    const validateAssemblies = !!process.env.JSII_VALIDATE_ASSEMBLIES;
    const stdio = new sync_stdio_1.SyncStdio({
        errorFD: (_a = process.stderr.fd) !== null && _a !== void 0 ? _a : 2,
        readFD: 3,
        writeFD: 3
    });
    const inout = new in_out_1.InputOutput(stdio);
    const host = new host_1.KernelHost(inout, {
        debug,
        noStack,
        debugTiming,
        validateAssemblies
    });
    host.once("exit", process.exit.bind(process));
    inout.write({
        hello: `${program_name}@${version}`
    });
    inout.debug = debug;
    host.run();
})();
//# sourceMappingURL=program.js.map