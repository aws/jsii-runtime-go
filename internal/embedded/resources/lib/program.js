var __webpack_modules__ = {
    2047: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(7147), path = __webpack_require__(4822), LCHOWN = fs.lchown ? "lchown" : "chown", LCHOWNSYNC = fs.lchownSync ? "lchownSync" : "chownSync", needEISDIRHandled = fs.lchown && !process.version.match(/v1[1-9]+\./) && !process.version.match(/v10\.[6-9]/), lchownSync = (path, uid, gid) => {
            try {
                return fs[LCHOWNSYNC](path, uid, gid);
            } catch (er) {
                if ("ENOENT" !== er.code) throw er;
            }
        }, handleEISDIR = needEISDIRHandled ? (path, uid, gid, cb) => er => {
            er && "EISDIR" === er.code ? fs.chown(path, uid, gid, cb) : cb(er);
        } : (_, __, ___, cb) => cb, handleEISDirSync = needEISDIRHandled ? (path, uid, gid) => {
            try {
                return lchownSync(path, uid, gid);
            } catch (er) {
                if ("EISDIR" !== er.code) throw er;
                ((path, uid, gid) => {
                    try {
                        fs.chownSync(path, uid, gid);
                    } catch (er) {
                        if ("ENOENT" !== er.code) throw er;
                    }
                })(path, uid, gid);
            }
        } : (path, uid, gid) => lchownSync(path, uid, gid), nodeVersion = process.version;
        let readdir = (path, options, cb) => fs.readdir(path, options, cb);
        /^v4\./.test(nodeVersion) && (readdir = (path, options, cb) => fs.readdir(path, cb));
        const chown = (cpath, uid, gid, cb) => {
            fs[LCHOWN](cpath, uid, gid, handleEISDIR(cpath, uid, gid, (er => {
                cb(er && "ENOENT" !== er.code ? er : null);
            })));
        }, chownrKid = (p, child, uid, gid, cb) => {
            if ("string" == typeof child) return fs.lstat(path.resolve(p, child), ((er, stats) => {
                if (er) return cb("ENOENT" !== er.code ? er : null);
                stats.name = child, chownrKid(p, stats, uid, gid, cb);
            }));
            if (child.isDirectory()) chownr(path.resolve(p, child.name), uid, gid, (er => {
                if (er) return cb(er);
                const cpath = path.resolve(p, child.name);
                chown(cpath, uid, gid, cb);
            })); else {
                const cpath = path.resolve(p, child.name);
                chown(cpath, uid, gid, cb);
            }
        }, chownr = (p, uid, gid, cb) => {
            readdir(p, {
                withFileTypes: !0
            }, ((er, children) => {
                if (er) {
                    if ("ENOENT" === er.code) return cb();
                    if ("ENOTDIR" !== er.code && "ENOTSUP" !== er.code) return cb(er);
                }
                if (er || !children.length) return chown(p, uid, gid, cb);
                let len = children.length, errState = null;
                const then = er => {
                    if (!errState) return er ? cb(errState = er) : 0 == --len ? chown(p, uid, gid, cb) : void 0;
                };
                children.forEach((child => chownrKid(p, child, uid, gid, then)));
            }));
        }, chownrSync = (p, uid, gid) => {
            let children;
            try {
                children = ((path, options) => fs.readdirSync(path, options))(p, {
                    withFileTypes: !0
                });
            } catch (er) {
                if ("ENOENT" === er.code) return;
                if ("ENOTDIR" === er.code || "ENOTSUP" === er.code) return handleEISDirSync(p, uid, gid);
                throw er;
            }
            return children && children.length && children.forEach((child => ((p, child, uid, gid) => {
                if ("string" == typeof child) try {
                    const stats = fs.lstatSync(path.resolve(p, child));
                    stats.name = child, child = stats;
                } catch (er) {
                    if ("ENOENT" === er.code) return;
                    throw er;
                }
                child.isDirectory() && chownrSync(path.resolve(p, child.name), uid, gid), handleEISDirSync(path.resolve(p, child.name), uid, gid);
            })(p, child, uid, gid))), handleEISDirSync(p, uid, gid);
        };
        module.exports = chownr, chownr.sync = chownrSync;
    },
    5686: module => {
        "use strict";
        module.exports = function equal(a, b) {
            if (a === b) return !0;
            if (a && b && "object" == typeof a && "object" == typeof b) {
                if (a.constructor !== b.constructor) return !1;
                var length, i, keys;
                if (Array.isArray(a)) {
                    if ((length = a.length) != b.length) return !1;
                    for (i = length; 0 != i--; ) if (!equal(a[i], b[i])) return !1;
                    return !0;
                }
                if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
                if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
                if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();
                if ((length = (keys = Object.keys(a)).length) !== Object.keys(b).length) return !1;
                for (i = length; 0 != i--; ) if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return !1;
                for (i = length; 0 != i--; ) {
                    var key = keys[i];
                    if (!equal(a[key], b[key])) return !1;
                }
                return !0;
            }
            return a != a && b != b;
        };
    },
    957: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), path = __webpack_require__(4822), mkdirsSync = __webpack_require__(7311).mkdirsSync, utimesMillisSync = __webpack_require__(5302).utimesMillisSync, stat = __webpack_require__(6637);
        function getStats(destStat, src, dest, opts) {
            const srcStat = (opts.dereference ? fs.statSync : fs.lstatSync)(src);
            if (srcStat.isDirectory()) return function(srcStat, destStat, src, dest, opts) {
                return destStat ? copyDir(src, dest, opts) : function(srcMode, src, dest, opts) {
                    return fs.mkdirSync(dest), copyDir(src, dest, opts), setDestMode(dest, srcMode);
                }(srcStat.mode, src, dest, opts);
            }(srcStat, destStat, src, dest, opts);
            if (srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice()) return function(srcStat, destStat, src, dest, opts) {
                return destStat ? function(srcStat, src, dest, opts) {
                    if (opts.overwrite) return fs.unlinkSync(dest), copyFile(srcStat, src, dest, opts);
                    if (opts.errorOnExist) throw new Error(`'${dest}' already exists`);
                }(srcStat, src, dest, opts) : copyFile(srcStat, src, dest, opts);
            }(srcStat, destStat, src, dest, opts);
            if (srcStat.isSymbolicLink()) return function(destStat, src, dest, opts) {
                let resolvedSrc = fs.readlinkSync(src);
                opts.dereference && (resolvedSrc = path.resolve(process.cwd(), resolvedSrc));
                if (destStat) {
                    let resolvedDest;
                    try {
                        resolvedDest = fs.readlinkSync(dest);
                    } catch (err) {
                        if ("EINVAL" === err.code || "UNKNOWN" === err.code) return fs.symlinkSync(resolvedSrc, dest);
                        throw err;
                    }
                    if (opts.dereference && (resolvedDest = path.resolve(process.cwd(), resolvedDest)), 
                    stat.isSrcSubdir(resolvedSrc, resolvedDest)) throw new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`);
                    if (fs.statSync(dest).isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc)) throw new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`);
                    return function(resolvedSrc, dest) {
                        return fs.unlinkSync(dest), fs.symlinkSync(resolvedSrc, dest);
                    }(resolvedSrc, dest);
                }
                return fs.symlinkSync(resolvedSrc, dest);
            }(destStat, src, dest, opts);
            if (srcStat.isSocket()) throw new Error(`Cannot copy a socket file: ${src}`);
            if (srcStat.isFIFO()) throw new Error(`Cannot copy a FIFO pipe: ${src}`);
            throw new Error(`Unknown file: ${src}`);
        }
        function copyFile(srcStat, src, dest, opts) {
            return fs.copyFileSync(src, dest), opts.preserveTimestamps && function(srcMode, src, dest) {
                (function(srcMode) {
                    return 0 == (128 & srcMode);
                })(srcMode) && function(dest, srcMode) {
                    setDestMode(dest, 128 | srcMode);
                }(dest, srcMode);
                (function(src, dest) {
                    const updatedSrcStat = fs.statSync(src);
                    utimesMillisSync(dest, updatedSrcStat.atime, updatedSrcStat.mtime);
                })(src, dest);
            }(srcStat.mode, src, dest), setDestMode(dest, srcStat.mode);
        }
        function setDestMode(dest, srcMode) {
            return fs.chmodSync(dest, srcMode);
        }
        function copyDir(src, dest, opts) {
            fs.readdirSync(src).forEach((item => function(item, src, dest, opts) {
                const srcItem = path.join(src, item), destItem = path.join(dest, item), {destStat} = stat.checkPathsSync(srcItem, destItem, "copy", opts);
                return function(destStat, src, dest, opts) {
                    if (!opts.filter || opts.filter(src, dest)) return getStats(destStat, src, dest, opts);
                }(destStat, srcItem, destItem, opts);
            }(item, src, dest, opts)));
        }
        module.exports = function(src, dest, opts) {
            "function" == typeof opts && (opts = {
                filter: opts
            }), (opts = opts || {}).clobber = !("clobber" in opts) || !!opts.clobber, opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber, 
            opts.preserveTimestamps && "ia32" === process.arch && process.emitWarning("Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269", "Warning", "fs-extra-WARN0002");
            const {srcStat, destStat} = stat.checkPathsSync(src, dest, "copy", opts);
            return stat.checkParentPathsSync(src, srcStat, dest, "copy"), function(destStat, src, dest, opts) {
                if (opts.filter && !opts.filter(src, dest)) return;
                const destParent = path.dirname(dest);
                fs.existsSync(destParent) || mkdirsSync(destParent);
                return getStats(destStat, src, dest, opts);
            }(destStat, src, dest, opts);
        };
    },
    465: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), path = __webpack_require__(4822), mkdirs = __webpack_require__(7311).mkdirs, pathExists = __webpack_require__(2569).pathExists, utimesMillis = __webpack_require__(5302).utimesMillis, stat = __webpack_require__(6637);
        function checkParentDir(destStat, src, dest, opts, cb) {
            const destParent = path.dirname(dest);
            pathExists(destParent, ((err, dirExists) => err ? cb(err) : dirExists ? getStats(destStat, src, dest, opts, cb) : void mkdirs(destParent, (err => err ? cb(err) : getStats(destStat, src, dest, opts, cb)))));
        }
        function handleFilter(onInclude, destStat, src, dest, opts, cb) {
            Promise.resolve(opts.filter(src, dest)).then((include => include ? onInclude(destStat, src, dest, opts, cb) : cb()), (error => cb(error)));
        }
        function getStats(destStat, src, dest, opts, cb) {
            (opts.dereference ? fs.stat : fs.lstat)(src, ((err, srcStat) => err ? cb(err) : srcStat.isDirectory() ? function(srcStat, destStat, src, dest, opts, cb) {
                return destStat ? copyDir(src, dest, opts, cb) : function(srcMode, src, dest, opts, cb) {
                    fs.mkdir(dest, (err => {
                        if (err) return cb(err);
                        copyDir(src, dest, opts, (err => err ? cb(err) : setDestMode(dest, srcMode, cb)));
                    }));
                }(srcStat.mode, src, dest, opts, cb);
            }(srcStat, destStat, src, dest, opts, cb) : srcStat.isFile() || srcStat.isCharacterDevice() || srcStat.isBlockDevice() ? function(srcStat, destStat, src, dest, opts, cb) {
                return destStat ? function(srcStat, src, dest, opts, cb) {
                    if (!opts.overwrite) return opts.errorOnExist ? cb(new Error(`'${dest}' already exists`)) : cb();
                    fs.unlink(dest, (err => err ? cb(err) : copyFile(srcStat, src, dest, opts, cb)));
                }(srcStat, src, dest, opts, cb) : copyFile(srcStat, src, dest, opts, cb);
            }(srcStat, destStat, src, dest, opts, cb) : srcStat.isSymbolicLink() ? onLink(destStat, src, dest, opts, cb) : srcStat.isSocket() ? cb(new Error(`Cannot copy a socket file: ${src}`)) : srcStat.isFIFO() ? cb(new Error(`Cannot copy a FIFO pipe: ${src}`)) : cb(new Error(`Unknown file: ${src}`))));
        }
        function copyFile(srcStat, src, dest, opts, cb) {
            fs.copyFile(src, dest, (err => err ? cb(err) : opts.preserveTimestamps ? function(srcMode, src, dest, cb) {
                if (function(srcMode) {
                    return 0 == (128 & srcMode);
                }(srcMode)) return function(dest, srcMode, cb) {
                    return setDestMode(dest, 128 | srcMode, cb);
                }(dest, srcMode, (err => err ? cb(err) : setDestTimestampsAndMode(srcMode, src, dest, cb)));
                return setDestTimestampsAndMode(srcMode, src, dest, cb);
            }(srcStat.mode, src, dest, cb) : setDestMode(dest, srcStat.mode, cb)));
        }
        function setDestTimestampsAndMode(srcMode, src, dest, cb) {
            !function(src, dest, cb) {
                fs.stat(src, ((err, updatedSrcStat) => err ? cb(err) : utimesMillis(dest, updatedSrcStat.atime, updatedSrcStat.mtime, cb)));
            }(src, dest, (err => err ? cb(err) : setDestMode(dest, srcMode, cb)));
        }
        function setDestMode(dest, srcMode, cb) {
            return fs.chmod(dest, srcMode, cb);
        }
        function copyDir(src, dest, opts, cb) {
            fs.readdir(src, ((err, items) => err ? cb(err) : copyDirItems(items, src, dest, opts, cb)));
        }
        function copyDirItems(items, src, dest, opts, cb) {
            const item = items.pop();
            return item ? function(items, item, src, dest, opts, cb) {
                const srcItem = path.join(src, item), destItem = path.join(dest, item);
                stat.checkPaths(srcItem, destItem, "copy", opts, ((err, stats) => {
                    if (err) return cb(err);
                    const {destStat} = stats;
                    !function(destStat, src, dest, opts, cb) {
                        opts.filter ? handleFilter(getStats, destStat, src, dest, opts, cb) : getStats(destStat, src, dest, opts, cb);
                    }(destStat, srcItem, destItem, opts, (err => err ? cb(err) : copyDirItems(items, src, dest, opts, cb)));
                }));
            }(items, item, src, dest, opts, cb) : cb();
        }
        function onLink(destStat, src, dest, opts, cb) {
            fs.readlink(src, ((err, resolvedSrc) => err ? cb(err) : (opts.dereference && (resolvedSrc = path.resolve(process.cwd(), resolvedSrc)), 
            destStat ? void fs.readlink(dest, ((err, resolvedDest) => err ? "EINVAL" === err.code || "UNKNOWN" === err.code ? fs.symlink(resolvedSrc, dest, cb) : cb(err) : (opts.dereference && (resolvedDest = path.resolve(process.cwd(), resolvedDest)), 
            stat.isSrcSubdir(resolvedSrc, resolvedDest) ? cb(new Error(`Cannot copy '${resolvedSrc}' to a subdirectory of itself, '${resolvedDest}'.`)) : destStat.isDirectory() && stat.isSrcSubdir(resolvedDest, resolvedSrc) ? cb(new Error(`Cannot overwrite '${resolvedDest}' with '${resolvedSrc}'.`)) : function(resolvedSrc, dest, cb) {
                fs.unlink(dest, (err => err ? cb(err) : fs.symlink(resolvedSrc, dest, cb)));
            }(resolvedSrc, dest, cb)))) : fs.symlink(resolvedSrc, dest, cb))));
        }
        module.exports = function(src, dest, opts, cb) {
            "function" != typeof opts || cb ? "function" == typeof opts && (opts = {
                filter: opts
            }) : (cb = opts, opts = {}), cb = cb || function() {}, (opts = opts || {}).clobber = !("clobber" in opts) || !!opts.clobber, 
            opts.overwrite = "overwrite" in opts ? !!opts.overwrite : opts.clobber, opts.preserveTimestamps && "ia32" === process.arch && process.emitWarning("Using the preserveTimestamps option in 32-bit node is not recommended;\n\n\tsee https://github.com/jprichardson/node-fs-extra/issues/269", "Warning", "fs-extra-WARN0001"), 
            stat.checkPaths(src, dest, "copy", opts, ((err, stats) => {
                if (err) return cb(err);
                const {srcStat, destStat} = stats;
                stat.checkParentPaths(src, srcStat, dest, "copy", (err => err ? cb(err) : opts.filter ? handleFilter(checkParentDir, destStat, src, dest, opts, cb) : checkParentDir(destStat, src, dest, opts, cb)));
            }));
        };
    },
    6430: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback;
        module.exports = {
            copy: u(__webpack_require__(465)),
            copySync: __webpack_require__(957)
        };
    },
    801: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromPromise, fs = __webpack_require__(5093), path = __webpack_require__(4822), mkdir = __webpack_require__(7311), remove = __webpack_require__(9117), emptyDir = u((async function(dir) {
            let items;
            try {
                items = await fs.readdir(dir);
            } catch {
                return mkdir.mkdirs(dir);
            }
            return Promise.all(items.map((item => remove.remove(path.join(dir, item)))));
        }));
        function emptyDirSync(dir) {
            let items;
            try {
                items = fs.readdirSync(dir);
            } catch {
                return mkdir.mkdirsSync(dir);
            }
            items.forEach((item => {
                item = path.join(dir, item), remove.removeSync(item);
            }));
        }
        module.exports = {
            emptyDirSync,
            emptydirSync: emptyDirSync,
            emptyDir,
            emptydir: emptyDir
        };
    },
    7392: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback, path = __webpack_require__(4822), fs = __webpack_require__(6851), mkdir = __webpack_require__(7311);
        module.exports = {
            createFile: u((function(file, callback) {
                function makeFile() {
                    fs.writeFile(file, "", (err => {
                        if (err) return callback(err);
                        callback();
                    }));
                }
                fs.stat(file, ((err, stats) => {
                    if (!err && stats.isFile()) return callback();
                    const dir = path.dirname(file);
                    fs.stat(dir, ((err, stats) => {
                        if (err) return "ENOENT" === err.code ? mkdir.mkdirs(dir, (err => {
                            if (err) return callback(err);
                            makeFile();
                        })) : callback(err);
                        stats.isDirectory() ? makeFile() : fs.readdir(dir, (err => {
                            if (err) return callback(err);
                        }));
                    }));
                }));
            })),
            createFileSync: function(file) {
                let stats;
                try {
                    stats = fs.statSync(file);
                } catch {}
                if (stats && stats.isFile()) return;
                const dir = path.dirname(file);
                try {
                    fs.statSync(dir).isDirectory() || fs.readdirSync(dir);
                } catch (err) {
                    if (!err || "ENOENT" !== err.code) throw err;
                    mkdir.mkdirsSync(dir);
                }
                fs.writeFileSync(file, "");
            }
        };
    },
    8985: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const {createFile, createFileSync} = __webpack_require__(7392), {createLink, createLinkSync} = __webpack_require__(8261), {createSymlink, createSymlinkSync} = __webpack_require__(7618);
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
    8261: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback, path = __webpack_require__(4822), fs = __webpack_require__(6851), mkdir = __webpack_require__(7311), pathExists = __webpack_require__(2569).pathExists, {areIdentical} = __webpack_require__(6637);
        module.exports = {
            createLink: u((function(srcpath, dstpath, callback) {
                function makeLink(srcpath, dstpath) {
                    fs.link(srcpath, dstpath, (err => {
                        if (err) return callback(err);
                        callback(null);
                    }));
                }
                fs.lstat(dstpath, ((_, dstStat) => {
                    fs.lstat(srcpath, ((err, srcStat) => {
                        if (err) return err.message = err.message.replace("lstat", "ensureLink"), callback(err);
                        if (dstStat && areIdentical(srcStat, dstStat)) return callback(null);
                        const dir = path.dirname(dstpath);
                        pathExists(dir, ((err, dirExists) => err ? callback(err) : dirExists ? makeLink(srcpath, dstpath) : void mkdir.mkdirs(dir, (err => {
                            if (err) return callback(err);
                            makeLink(srcpath, dstpath);
                        }))));
                    }));
                }));
            })),
            createLinkSync: function(srcpath, dstpath) {
                let dstStat;
                try {
                    dstStat = fs.lstatSync(dstpath);
                } catch {}
                try {
                    const srcStat = fs.lstatSync(srcpath);
                    if (dstStat && areIdentical(srcStat, dstStat)) return;
                } catch (err) {
                    throw err.message = err.message.replace("lstat", "ensureLink"), err;
                }
                const dir = path.dirname(dstpath);
                return fs.existsSync(dir) || mkdir.mkdirsSync(dir), fs.linkSync(srcpath, dstpath);
            }
        };
    },
    1249: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const path = __webpack_require__(4822), fs = __webpack_require__(6851), pathExists = __webpack_require__(2569).pathExists;
        module.exports = {
            symlinkPaths: function(srcpath, dstpath, callback) {
                if (path.isAbsolute(srcpath)) return fs.lstat(srcpath, (err => err ? (err.message = err.message.replace("lstat", "ensureSymlink"), 
                callback(err)) : callback(null, {
                    toCwd: srcpath,
                    toDst: srcpath
                })));
                {
                    const dstdir = path.dirname(dstpath), relativeToDst = path.join(dstdir, srcpath);
                    return pathExists(relativeToDst, ((err, exists) => err ? callback(err) : exists ? callback(null, {
                        toCwd: relativeToDst,
                        toDst: srcpath
                    }) : fs.lstat(srcpath, (err => err ? (err.message = err.message.replace("lstat", "ensureSymlink"), 
                    callback(err)) : callback(null, {
                        toCwd: srcpath,
                        toDst: path.relative(dstdir, srcpath)
                    })))));
                }
            },
            symlinkPathsSync: function(srcpath, dstpath) {
                let exists;
                if (path.isAbsolute(srcpath)) {
                    if (exists = fs.existsSync(srcpath), !exists) throw new Error("absolute srcpath does not exist");
                    return {
                        toCwd: srcpath,
                        toDst: srcpath
                    };
                }
                {
                    const dstdir = path.dirname(dstpath), relativeToDst = path.join(dstdir, srcpath);
                    if (exists = fs.existsSync(relativeToDst), exists) return {
                        toCwd: relativeToDst,
                        toDst: srcpath
                    };
                    if (exists = fs.existsSync(srcpath), !exists) throw new Error("relative srcpath does not exist");
                    return {
                        toCwd: srcpath,
                        toDst: path.relative(dstdir, srcpath)
                    };
                }
            }
        };
    },
    8065: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851);
        module.exports = {
            symlinkType: function(srcpath, type, callback) {
                if (callback = "function" == typeof type ? type : callback, type = "function" != typeof type && type) return callback(null, type);
                fs.lstat(srcpath, ((err, stats) => {
                    if (err) return callback(null, "file");
                    type = stats && stats.isDirectory() ? "dir" : "file", callback(null, type);
                }));
            },
            symlinkTypeSync: function(srcpath, type) {
                let stats;
                if (type) return type;
                try {
                    stats = fs.lstatSync(srcpath);
                } catch {
                    return "file";
                }
                return stats && stats.isDirectory() ? "dir" : "file";
            }
        };
    },
    7618: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback, path = __webpack_require__(4822), fs = __webpack_require__(5093), _mkdirs = __webpack_require__(7311), mkdirs = _mkdirs.mkdirs, mkdirsSync = _mkdirs.mkdirsSync, _symlinkPaths = __webpack_require__(1249), symlinkPaths = _symlinkPaths.symlinkPaths, symlinkPathsSync = _symlinkPaths.symlinkPathsSync, _symlinkType = __webpack_require__(8065), symlinkType = _symlinkType.symlinkType, symlinkTypeSync = _symlinkType.symlinkTypeSync, pathExists = __webpack_require__(2569).pathExists, {areIdentical} = __webpack_require__(6637);
        function _createSymlink(srcpath, dstpath, type, callback) {
            symlinkPaths(srcpath, dstpath, ((err, relative) => {
                if (err) return callback(err);
                srcpath = relative.toDst, symlinkType(relative.toCwd, type, ((err, type) => {
                    if (err) return callback(err);
                    const dir = path.dirname(dstpath);
                    pathExists(dir, ((err, dirExists) => err ? callback(err) : dirExists ? fs.symlink(srcpath, dstpath, type, callback) : void mkdirs(dir, (err => {
                        if (err) return callback(err);
                        fs.symlink(srcpath, dstpath, type, callback);
                    }))));
                }));
            }));
        }
        module.exports = {
            createSymlink: u((function(srcpath, dstpath, type, callback) {
                callback = "function" == typeof type ? type : callback, type = "function" != typeof type && type, 
                fs.lstat(dstpath, ((err, stats) => {
                    !err && stats.isSymbolicLink() ? Promise.all([ fs.stat(srcpath), fs.stat(dstpath) ]).then((([srcStat, dstStat]) => {
                        if (areIdentical(srcStat, dstStat)) return callback(null);
                        _createSymlink(srcpath, dstpath, type, callback);
                    })) : _createSymlink(srcpath, dstpath, type, callback);
                }));
            })),
            createSymlinkSync: function(srcpath, dstpath, type) {
                let stats;
                try {
                    stats = fs.lstatSync(dstpath);
                } catch {}
                if (stats && stats.isSymbolicLink()) {
                    const srcStat = fs.statSync(srcpath), dstStat = fs.statSync(dstpath);
                    if (areIdentical(srcStat, dstStat)) return;
                }
                const relative = symlinkPathsSync(srcpath, dstpath);
                srcpath = relative.toDst, type = symlinkTypeSync(relative.toCwd, type);
                const dir = path.dirname(dstpath);
                return fs.existsSync(dir) || mkdirsSync(dir), fs.symlinkSync(srcpath, dstpath, type);
            }
        };
    },
    5093: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback, fs = __webpack_require__(6851), api = [ "access", "appendFile", "chmod", "chown", "close", "copyFile", "fchmod", "fchown", "fdatasync", "fstat", "fsync", "ftruncate", "futimes", "lchmod", "lchown", "link", "lstat", "mkdir", "mkdtemp", "open", "opendir", "readdir", "readFile", "readlink", "realpath", "rename", "rm", "rmdir", "stat", "symlink", "truncate", "unlink", "utimes", "writeFile" ].filter((key => "function" == typeof fs[key]));
        Object.assign(exports, fs), api.forEach((method => {
            exports[method] = u(fs[method]);
        })), exports.exists = function(filename, callback) {
            return "function" == typeof callback ? fs.exists(filename, callback) : new Promise((resolve => fs.exists(filename, resolve)));
        }, exports.read = function(fd, buffer, offset, length, position, callback) {
            return "function" == typeof callback ? fs.read(fd, buffer, offset, length, position, callback) : new Promise(((resolve, reject) => {
                fs.read(fd, buffer, offset, length, position, ((err, bytesRead, buffer) => {
                    if (err) return reject(err);
                    resolve({
                        bytesRead,
                        buffer
                    });
                }));
            }));
        }, exports.write = function(fd, buffer, ...args) {
            return "function" == typeof args[args.length - 1] ? fs.write(fd, buffer, ...args) : new Promise(((resolve, reject) => {
                fs.write(fd, buffer, ...args, ((err, bytesWritten, buffer) => {
                    if (err) return reject(err);
                    resolve({
                        bytesWritten,
                        buffer
                    });
                }));
            }));
        }, "function" == typeof fs.writev && (exports.writev = function(fd, buffers, ...args) {
            return "function" == typeof args[args.length - 1] ? fs.writev(fd, buffers, ...args) : new Promise(((resolve, reject) => {
                fs.writev(fd, buffers, ...args, ((err, bytesWritten, buffers) => {
                    if (err) return reject(err);
                    resolve({
                        bytesWritten,
                        buffers
                    });
                }));
            }));
        }), "function" == typeof fs.realpath.native ? exports.realpath.native = u(fs.realpath.native) : process.emitWarning("fs.realpath.native is not a function. Is fs being monkey-patched?", "Warning", "fs-extra-WARN0003");
    },
    9728: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        module.exports = {
            ...__webpack_require__(5093),
            ...__webpack_require__(6430),
            ...__webpack_require__(801),
            ...__webpack_require__(8985),
            ...__webpack_require__(3779),
            ...__webpack_require__(7311),
            ...__webpack_require__(1034),
            ...__webpack_require__(1350),
            ...__webpack_require__(2569),
            ...__webpack_require__(9117)
        };
    },
    3779: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromPromise, jsonFile = __webpack_require__(2002);
        jsonFile.outputJson = u(__webpack_require__(209)), jsonFile.outputJsonSync = __webpack_require__(8757), 
        jsonFile.outputJSON = jsonFile.outputJson, jsonFile.outputJSONSync = jsonFile.outputJsonSync, 
        jsonFile.writeJSON = jsonFile.writeJson, jsonFile.writeJSONSync = jsonFile.writeJsonSync, 
        jsonFile.readJSON = jsonFile.readJson, jsonFile.readJSONSync = jsonFile.readJsonSync, 
        module.exports = jsonFile;
    },
    2002: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const jsonFile = __webpack_require__(3393);
        module.exports = {
            readJson: jsonFile.readFile,
            readJsonSync: jsonFile.readFileSync,
            writeJson: jsonFile.writeFile,
            writeJsonSync: jsonFile.writeFileSync
        };
    },
    8757: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const {stringify} = __webpack_require__(9293), {outputFileSync} = __webpack_require__(1350);
        module.exports = function(file, data, options) {
            const str = stringify(data, options);
            outputFileSync(file, str, options);
        };
    },
    209: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const {stringify} = __webpack_require__(9293), {outputFile} = __webpack_require__(1350);
        module.exports = async function(file, data, options = {}) {
            const str = stringify(data, options);
            await outputFile(file, str, options);
        };
    },
    7311: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromPromise, {makeDir: _makeDir, makeDirSync} = __webpack_require__(3057), makeDir = u(_makeDir);
        module.exports = {
            mkdirs: makeDir,
            mkdirsSync: makeDirSync,
            mkdirp: makeDir,
            mkdirpSync: makeDirSync,
            ensureDir: makeDir,
            ensureDirSync: makeDirSync
        };
    },
    3057: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(5093), {checkPath} = __webpack_require__(5683), getMode = options => "number" == typeof options ? options : {
            mode: 511,
            ...options
        }.mode;
        module.exports.makeDir = async (dir, options) => (checkPath(dir), fs.mkdir(dir, {
            mode: getMode(options),
            recursive: !0
        })), module.exports.makeDirSync = (dir, options) => (checkPath(dir), fs.mkdirSync(dir, {
            mode: getMode(options),
            recursive: !0
        }));
    },
    5683: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const path = __webpack_require__(4822);
        module.exports.checkPath = function(pth) {
            if ("win32" === process.platform) {
                if (/[<>:"|?*]/.test(pth.replace(path.parse(pth).root, ""))) {
                    const error = new Error(`Path contains invalid characters: ${pth}`);
                    throw error.code = "EINVAL", error;
                }
            }
        };
    },
    1034: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback;
        module.exports = {
            move: u(__webpack_require__(2521)),
            moveSync: __webpack_require__(3023)
        };
    },
    3023: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), path = __webpack_require__(4822), copySync = __webpack_require__(6430).copySync, removeSync = __webpack_require__(9117).removeSync, mkdirpSync = __webpack_require__(7311).mkdirpSync, stat = __webpack_require__(6637);
        function rename(src, dest, overwrite) {
            try {
                fs.renameSync(src, dest);
            } catch (err) {
                if ("EXDEV" !== err.code) throw err;
                return function(src, dest, overwrite) {
                    return copySync(src, dest, {
                        overwrite,
                        errorOnExist: true
                    }), removeSync(src);
                }(src, dest, overwrite);
            }
        }
        module.exports = function(src, dest, opts) {
            const overwrite = (opts = opts || {}).overwrite || opts.clobber || !1, {srcStat, isChangingCase = !1} = stat.checkPathsSync(src, dest, "move", opts);
            return stat.checkParentPathsSync(src, srcStat, dest, "move"), function(dest) {
                const parent = path.dirname(dest);
                return path.parse(parent).root === parent;
            }(dest) || mkdirpSync(path.dirname(dest)), function(src, dest, overwrite, isChangingCase) {
                if (isChangingCase) return rename(src, dest, overwrite);
                if (overwrite) return removeSync(dest), rename(src, dest, overwrite);
                if (fs.existsSync(dest)) throw new Error("dest already exists.");
                return rename(src, dest, overwrite);
            }(src, dest, overwrite, isChangingCase);
        };
    },
    2521: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), path = __webpack_require__(4822), copy = __webpack_require__(6430).copy, remove = __webpack_require__(9117).remove, mkdirp = __webpack_require__(7311).mkdirp, pathExists = __webpack_require__(2569).pathExists, stat = __webpack_require__(6637);
        function doRename(src, dest, overwrite, isChangingCase, cb) {
            return isChangingCase ? rename(src, dest, overwrite, cb) : overwrite ? remove(dest, (err => err ? cb(err) : rename(src, dest, overwrite, cb))) : void pathExists(dest, ((err, destExists) => err ? cb(err) : destExists ? cb(new Error("dest already exists.")) : rename(src, dest, overwrite, cb)));
        }
        function rename(src, dest, overwrite, cb) {
            fs.rename(src, dest, (err => err ? "EXDEV" !== err.code ? cb(err) : function(src, dest, overwrite, cb) {
                copy(src, dest, {
                    overwrite,
                    errorOnExist: !0
                }, (err => err ? cb(err) : remove(src, cb)));
            }(src, dest, overwrite, cb) : cb()));
        }
        module.exports = function(src, dest, opts, cb) {
            "function" == typeof opts && (cb = opts, opts = {});
            const overwrite = (opts = opts || {}).overwrite || opts.clobber || !1;
            stat.checkPaths(src, dest, "move", opts, ((err, stats) => {
                if (err) return cb(err);
                const {srcStat, isChangingCase = !1} = stats;
                stat.checkParentPaths(src, srcStat, dest, "move", (err => err ? cb(err) : function(dest) {
                    const parent = path.dirname(dest);
                    return path.parse(parent).root === parent;
                }(dest) ? doRename(src, dest, overwrite, isChangingCase, cb) : void mkdirp(path.dirname(dest), (err => err ? cb(err) : doRename(src, dest, overwrite, isChangingCase, cb)))));
            }));
        };
    },
    1350: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromCallback, fs = __webpack_require__(6851), path = __webpack_require__(4822), mkdir = __webpack_require__(7311), pathExists = __webpack_require__(2569).pathExists;
        module.exports = {
            outputFile: u((function(file, data, encoding, callback) {
                "function" == typeof encoding && (callback = encoding, encoding = "utf8");
                const dir = path.dirname(file);
                pathExists(dir, ((err, itDoes) => err ? callback(err) : itDoes ? fs.writeFile(file, data, encoding, callback) : void mkdir.mkdirs(dir, (err => {
                    if (err) return callback(err);
                    fs.writeFile(file, data, encoding, callback);
                }))));
            })),
            outputFileSync: function(file, ...args) {
                const dir = path.dirname(file);
                if (fs.existsSync(dir)) return fs.writeFileSync(file, ...args);
                mkdir.mkdirsSync(dir), fs.writeFileSync(file, ...args);
            }
        };
    },
    2569: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const u = __webpack_require__(3459).fromPromise, fs = __webpack_require__(5093);
        module.exports = {
            pathExists: u((function(path) {
                return fs.access(path).then((() => !0)).catch((() => !1));
            })),
            pathExistsSync: fs.existsSync
        };
    },
    9117: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), u = __webpack_require__(3459).fromCallback, rimraf = __webpack_require__(1683);
        module.exports = {
            remove: u((function(path, callback) {
                if (fs.rm) return fs.rm(path, {
                    recursive: !0,
                    force: !0
                }, callback);
                rimraf(path, callback);
            })),
            removeSync: function(path) {
                if (fs.rmSync) return fs.rmSync(path, {
                    recursive: !0,
                    force: !0
                });
                rimraf.sync(path);
            }
        };
    },
    1683: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851), path = __webpack_require__(4822), assert = __webpack_require__(9491), isWindows = "win32" === process.platform;
        function defaults(options) {
            [ "unlink", "chmod", "stat", "lstat", "rmdir", "readdir" ].forEach((m => {
                options[m] = options[m] || fs[m], options[m += "Sync"] = options[m] || fs[m];
            })), options.maxBusyTries = options.maxBusyTries || 3;
        }
        function rimraf(p, options, cb) {
            let busyTries = 0;
            "function" == typeof options && (cb = options, options = {}), assert(p, "rimraf: missing path"), 
            assert.strictEqual(typeof p, "string", "rimraf: path should be a string"), assert.strictEqual(typeof cb, "function", "rimraf: callback function required"), 
            assert(options, "rimraf: invalid options argument provided"), assert.strictEqual(typeof options, "object", "rimraf: options should be object"), 
            defaults(options), rimraf_(p, options, (function CB(er) {
                if (er) {
                    if (("EBUSY" === er.code || "ENOTEMPTY" === er.code || "EPERM" === er.code) && busyTries < options.maxBusyTries) {
                        busyTries++;
                        return setTimeout((() => rimraf_(p, options, CB)), 100 * busyTries);
                    }
                    "ENOENT" === er.code && (er = null);
                }
                cb(er);
            }));
        }
        function rimraf_(p, options, cb) {
            assert(p), assert(options), assert("function" == typeof cb), options.lstat(p, ((er, st) => er && "ENOENT" === er.code ? cb(null) : er && "EPERM" === er.code && isWindows ? fixWinEPERM(p, options, er, cb) : st && st.isDirectory() ? rmdir(p, options, er, cb) : void options.unlink(p, (er => {
                if (er) {
                    if ("ENOENT" === er.code) return cb(null);
                    if ("EPERM" === er.code) return isWindows ? fixWinEPERM(p, options, er, cb) : rmdir(p, options, er, cb);
                    if ("EISDIR" === er.code) return rmdir(p, options, er, cb);
                }
                return cb(er);
            }))));
        }
        function fixWinEPERM(p, options, er, cb) {
            assert(p), assert(options), assert("function" == typeof cb), options.chmod(p, 438, (er2 => {
                er2 ? cb("ENOENT" === er2.code ? null : er) : options.stat(p, ((er3, stats) => {
                    er3 ? cb("ENOENT" === er3.code ? null : er) : stats.isDirectory() ? rmdir(p, options, er, cb) : options.unlink(p, cb);
                }));
            }));
        }
        function fixWinEPERMSync(p, options, er) {
            let stats;
            assert(p), assert(options);
            try {
                options.chmodSync(p, 438);
            } catch (er2) {
                if ("ENOENT" === er2.code) return;
                throw er;
            }
            try {
                stats = options.statSync(p);
            } catch (er3) {
                if ("ENOENT" === er3.code) return;
                throw er;
            }
            stats.isDirectory() ? rmdirSync(p, options, er) : options.unlinkSync(p);
        }
        function rmdir(p, options, originalEr, cb) {
            assert(p), assert(options), assert("function" == typeof cb), options.rmdir(p, (er => {
                !er || "ENOTEMPTY" !== er.code && "EEXIST" !== er.code && "EPERM" !== er.code ? er && "ENOTDIR" === er.code ? cb(originalEr) : cb(er) : function(p, options, cb) {
                    assert(p), assert(options), assert("function" == typeof cb), options.readdir(p, ((er, files) => {
                        if (er) return cb(er);
                        let errState, n = files.length;
                        if (0 === n) return options.rmdir(p, cb);
                        files.forEach((f => {
                            rimraf(path.join(p, f), options, (er => {
                                if (!errState) return er ? cb(errState = er) : void (0 == --n && options.rmdir(p, cb));
                            }));
                        }));
                    }));
                }(p, options, cb);
            }));
        }
        function rimrafSync(p, options) {
            let st;
            defaults(options = options || {}), assert(p, "rimraf: missing path"), assert.strictEqual(typeof p, "string", "rimraf: path should be a string"), 
            assert(options, "rimraf: missing options"), assert.strictEqual(typeof options, "object", "rimraf: options should be object");
            try {
                st = options.lstatSync(p);
            } catch (er) {
                if ("ENOENT" === er.code) return;
                "EPERM" === er.code && isWindows && fixWinEPERMSync(p, options, er);
            }
            try {
                st && st.isDirectory() ? rmdirSync(p, options, null) : options.unlinkSync(p);
            } catch (er) {
                if ("ENOENT" === er.code) return;
                if ("EPERM" === er.code) return isWindows ? fixWinEPERMSync(p, options, er) : rmdirSync(p, options, er);
                if ("EISDIR" !== er.code) throw er;
                rmdirSync(p, options, er);
            }
        }
        function rmdirSync(p, options, originalEr) {
            assert(p), assert(options);
            try {
                options.rmdirSync(p);
            } catch (er) {
                if ("ENOTDIR" === er.code) throw originalEr;
                if ("ENOTEMPTY" === er.code || "EEXIST" === er.code || "EPERM" === er.code) !function(p, options) {
                    if (assert(p), assert(options), options.readdirSync(p).forEach((f => rimrafSync(path.join(p, f), options))), 
                    !isWindows) {
                        return options.rmdirSync(p, options);
                    }
                    {
                        const startTime = Date.now();
                        do {
                            try {
                                return options.rmdirSync(p, options);
                            } catch {}
                        } while (Date.now() - startTime < 500);
                    }
                }(p, options); else if ("ENOENT" !== er.code) throw er;
            }
        }
        module.exports = rimraf, rimraf.sync = rimrafSync;
    },
    6637: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(5093), path = __webpack_require__(4822), util = __webpack_require__(3837);
        function getStats(src, dest, opts) {
            const statFunc = opts.dereference ? file => fs.stat(file, {
                bigint: !0
            }) : file => fs.lstat(file, {
                bigint: !0
            });
            return Promise.all([ statFunc(src), statFunc(dest).catch((err => {
                if ("ENOENT" === err.code) return null;
                throw err;
            })) ]).then((([srcStat, destStat]) => ({
                srcStat,
                destStat
            })));
        }
        function areIdentical(srcStat, destStat) {
            return destStat.ino && destStat.dev && destStat.ino === srcStat.ino && destStat.dev === srcStat.dev;
        }
        function isSrcSubdir(src, dest) {
            const srcArr = path.resolve(src).split(path.sep).filter((i => i)), destArr = path.resolve(dest).split(path.sep).filter((i => i));
            return srcArr.reduce(((acc, cur, i) => acc && destArr[i] === cur), !0);
        }
        function errMsg(src, dest, funcName) {
            return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`;
        }
        module.exports = {
            checkPaths: function(src, dest, funcName, opts, cb) {
                util.callbackify(getStats)(src, dest, opts, ((err, stats) => {
                    if (err) return cb(err);
                    const {srcStat, destStat} = stats;
                    if (destStat) {
                        if (areIdentical(srcStat, destStat)) {
                            const srcBaseName = path.basename(src), destBaseName = path.basename(dest);
                            return "move" === funcName && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase() ? cb(null, {
                                srcStat,
                                destStat,
                                isChangingCase: !0
                            }) : cb(new Error("Source and destination must not be the same."));
                        }
                        if (srcStat.isDirectory() && !destStat.isDirectory()) return cb(new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`));
                        if (!srcStat.isDirectory() && destStat.isDirectory()) return cb(new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`));
                    }
                    return srcStat.isDirectory() && isSrcSubdir(src, dest) ? cb(new Error(errMsg(src, dest, funcName))) : cb(null, {
                        srcStat,
                        destStat
                    });
                }));
            },
            checkPathsSync: function(src, dest, funcName, opts) {
                const {srcStat, destStat} = function(src, dest, opts) {
                    let destStat;
                    const statFunc = opts.dereference ? file => fs.statSync(file, {
                        bigint: !0
                    }) : file => fs.lstatSync(file, {
                        bigint: !0
                    }), srcStat = statFunc(src);
                    try {
                        destStat = statFunc(dest);
                    } catch (err) {
                        if ("ENOENT" === err.code) return {
                            srcStat,
                            destStat: null
                        };
                        throw err;
                    }
                    return {
                        srcStat,
                        destStat
                    };
                }(src, dest, opts);
                if (destStat) {
                    if (areIdentical(srcStat, destStat)) {
                        const srcBaseName = path.basename(src), destBaseName = path.basename(dest);
                        if ("move" === funcName && srcBaseName !== destBaseName && srcBaseName.toLowerCase() === destBaseName.toLowerCase()) return {
                            srcStat,
                            destStat,
                            isChangingCase: !0
                        };
                        throw new Error("Source and destination must not be the same.");
                    }
                    if (srcStat.isDirectory() && !destStat.isDirectory()) throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`);
                    if (!srcStat.isDirectory() && destStat.isDirectory()) throw new Error(`Cannot overwrite directory '${dest}' with non-directory '${src}'.`);
                }
                if (srcStat.isDirectory() && isSrcSubdir(src, dest)) throw new Error(errMsg(src, dest, funcName));
                return {
                    srcStat,
                    destStat
                };
            },
            checkParentPaths: function checkParentPaths(src, srcStat, dest, funcName, cb) {
                const srcParent = path.resolve(path.dirname(src)), destParent = path.resolve(path.dirname(dest));
                if (destParent === srcParent || destParent === path.parse(destParent).root) return cb();
                fs.stat(destParent, {
                    bigint: !0
                }, ((err, destStat) => err ? "ENOENT" === err.code ? cb() : cb(err) : areIdentical(srcStat, destStat) ? cb(new Error(errMsg(src, dest, funcName))) : checkParentPaths(src, srcStat, destParent, funcName, cb)));
            },
            checkParentPathsSync: function checkParentPathsSync(src, srcStat, dest, funcName) {
                const srcParent = path.resolve(path.dirname(src)), destParent = path.resolve(path.dirname(dest));
                if (destParent === srcParent || destParent === path.parse(destParent).root) return;
                let destStat;
                try {
                    destStat = fs.statSync(destParent, {
                        bigint: !0
                    });
                } catch (err) {
                    if ("ENOENT" === err.code) return;
                    throw err;
                }
                if (areIdentical(srcStat, destStat)) throw new Error(errMsg(src, dest, funcName));
                return checkParentPathsSync(src, srcStat, destParent, funcName);
            },
            isSrcSubdir,
            areIdentical
        };
    },
    5302: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const fs = __webpack_require__(6851);
        module.exports = {
            utimesMillis: function(path, atime, mtime, callback) {
                fs.open(path, "r+", ((err, fd) => {
                    if (err) return callback(err);
                    fs.futimes(fd, atime, mtime, (futimesErr => {
                        fs.close(fd, (closeErr => {
                            callback && callback(futimesErr || closeErr);
                        }));
                    }));
                }));
            },
            utimesMillisSync: function(path, atime, mtime) {
                const fd = fs.openSync(path, "r+");
                return fs.futimesSync(fd, atime, mtime), fs.closeSync(fd);
            }
        };
    },
    8553: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        const MiniPass = __webpack_require__(2253), EE = __webpack_require__(2361).EventEmitter, fs = __webpack_require__(7147);
        let writev = fs.writev;
        if (!writev) {
            const binding = process.binding("fs"), FSReqWrap = binding.FSReqWrap || binding.FSReqCallback;
            writev = (fd, iovec, pos, cb) => {
                const req = new FSReqWrap;
                req.oncomplete = (er, bw) => cb(er, bw, iovec), binding.writeBuffers(fd, iovec, pos, req);
            };
        }
        const _autoClose = Symbol("_autoClose"), _close = Symbol("_close"), _ended = Symbol("_ended"), _fd = Symbol("_fd"), _finished = Symbol("_finished"), _flags = Symbol("_flags"), _flush = Symbol("_flush"), _handleChunk = Symbol("_handleChunk"), _makeBuf = Symbol("_makeBuf"), _mode = Symbol("_mode"), _needDrain = Symbol("_needDrain"), _onerror = Symbol("_onerror"), _onopen = Symbol("_onopen"), _onread = Symbol("_onread"), _onwrite = Symbol("_onwrite"), _open = Symbol("_open"), _path = Symbol("_path"), _pos = Symbol("_pos"), _queue = Symbol("_queue"), _read = Symbol("_read"), _readSize = Symbol("_readSize"), _reading = Symbol("_reading"), _remain = Symbol("_remain"), _size = Symbol("_size"), _write = Symbol("_write"), _writing = Symbol("_writing"), _defaultFlag = Symbol("_defaultFlag"), _errored = Symbol("_errored");
        class ReadStream extends MiniPass {
            constructor(path, opt) {
                if (super(opt = opt || {}), this.readable = !0, this.writable = !1, "string" != typeof path) throw new TypeError("path must be a string");
                this[_errored] = !1, this[_fd] = "number" == typeof opt.fd ? opt.fd : null, this[_path] = path, 
                this[_readSize] = opt.readSize || 16777216, this[_reading] = !1, this[_size] = "number" == typeof opt.size ? opt.size : 1 / 0, 
                this[_remain] = this[_size], this[_autoClose] = "boolean" != typeof opt.autoClose || opt.autoClose, 
                "number" == typeof this[_fd] ? this[_read]() : this[_open]();
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
                fs.open(this[_path], "r", ((er, fd) => this[_onopen](er, fd)));
            }
            [_onopen](er, fd) {
                er ? this[_onerror](er) : (this[_fd] = fd, this.emit("open", fd), this[_read]());
            }
            [_makeBuf]() {
                return Buffer.allocUnsafe(Math.min(this[_readSize], this[_remain]));
            }
            [_read]() {
                if (!this[_reading]) {
                    this[_reading] = !0;
                    const buf = this[_makeBuf]();
                    if (0 === buf.length) return process.nextTick((() => this[_onread](null, 0, buf)));
                    fs.read(this[_fd], buf, 0, buf.length, null, ((er, br, buf) => this[_onread](er, br, buf)));
                }
            }
            [_onread](er, br, buf) {
                this[_reading] = !1, er ? this[_onerror](er) : this[_handleChunk](br, buf) && this[_read]();
            }
            [_close]() {
                if (this[_autoClose] && "number" == typeof this[_fd]) {
                    const fd = this[_fd];
                    this[_fd] = null, fs.close(fd, (er => er ? this.emit("error", er) : this.emit("close")));
                }
            }
            [_onerror](er) {
                this[_reading] = !0, this[_close](), this.emit("error", er);
            }
            [_handleChunk](br, buf) {
                let ret = !1;
                return this[_remain] -= br, br > 0 && (ret = super.write(br < buf.length ? buf.slice(0, br) : buf)), 
                (0 === br || this[_remain] <= 0) && (ret = !1, this[_close](), super.end()), ret;
            }
            emit(ev, data) {
                switch (ev) {
                  case "prefinish":
                  case "finish":
                    break;

                  case "drain":
                    "number" == typeof this[_fd] && this[_read]();
                    break;

                  case "error":
                    if (this[_errored]) return;
                    return this[_errored] = !0, super.emit(ev, data);

                  default:
                    return super.emit(ev, data);
                }
            }
        }
        class WriteStream extends EE {
            constructor(path, opt) {
                super(opt = opt || {}), this.readable = !1, this.writable = !0, this[_errored] = !1, 
                this[_writing] = !1, this[_ended] = !1, this[_needDrain] = !1, this[_queue] = [], 
                this[_path] = path, this[_fd] = "number" == typeof opt.fd ? opt.fd : null, this[_mode] = void 0 === opt.mode ? 438 : opt.mode, 
                this[_pos] = "number" == typeof opt.start ? opt.start : null, this[_autoClose] = "boolean" != typeof opt.autoClose || opt.autoClose;
                const defaultFlag = null !== this[_pos] ? "r+" : "w";
                this[_defaultFlag] = void 0 === opt.flags, this[_flags] = this[_defaultFlag] ? defaultFlag : opt.flags, 
                null === this[_fd] && this[_open]();
            }
            emit(ev, data) {
                if ("error" === ev) {
                    if (this[_errored]) return;
                    this[_errored] = !0;
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
                this[_close](), this[_writing] = !0, this.emit("error", er);
            }
            [_open]() {
                fs.open(this[_path], this[_flags], this[_mode], ((er, fd) => this[_onopen](er, fd)));
            }
            [_onopen](er, fd) {
                this[_defaultFlag] && "r+" === this[_flags] && er && "ENOENT" === er.code ? (this[_flags] = "w", 
                this[_open]()) : er ? this[_onerror](er) : (this[_fd] = fd, this.emit("open", fd), 
                this[_flush]());
            }
            end(buf, enc) {
                return buf && this.write(buf, enc), this[_ended] = !0, this[_writing] || this[_queue].length || "number" != typeof this[_fd] || this[_onwrite](null, 0), 
                this;
            }
            write(buf, enc) {
                return "string" == typeof buf && (buf = Buffer.from(buf, enc)), this[_ended] ? (this.emit("error", new Error("write() after end()")), 
                !1) : null === this[_fd] || this[_writing] || this[_queue].length ? (this[_queue].push(buf), 
                this[_needDrain] = !0, !1) : (this[_writing] = !0, this[_write](buf), !0);
            }
            [_write](buf) {
                fs.write(this[_fd], buf, 0, buf.length, this[_pos], ((er, bw) => this[_onwrite](er, bw)));
            }
            [_onwrite](er, bw) {
                er ? this[_onerror](er) : (null !== this[_pos] && (this[_pos] += bw), this[_queue].length ? this[_flush]() : (this[_writing] = !1, 
                this[_ended] && !this[_finished] ? (this[_finished] = !0, this[_close](), this.emit("finish")) : this[_needDrain] && (this[_needDrain] = !1, 
                this.emit("drain"))));
            }
            [_flush]() {
                if (0 === this[_queue].length) this[_ended] && this[_onwrite](null, 0); else if (1 === this[_queue].length) this[_write](this[_queue].pop()); else {
                    const iovec = this[_queue];
                    this[_queue] = [], writev(this[_fd], iovec, this[_pos], ((er, bw) => this[_onwrite](er, bw)));
                }
            }
            [_close]() {
                if (this[_autoClose] && "number" == typeof this[_fd]) {
                    const fd = this[_fd];
                    this[_fd] = null, fs.close(fd, (er => er ? this.emit("error", er) : this.emit("close")));
                }
            }
        }
        exports.ReadStream = ReadStream, exports.ReadStreamSync = class extends ReadStream {
            [_open]() {
                let threw = !0;
                try {
                    this[_onopen](null, fs.openSync(this[_path], "r")), threw = !1;
                } finally {
                    threw && this[_close]();
                }
            }
            [_read]() {
                let threw = !0;
                try {
                    if (!this[_reading]) {
                        for (this[_reading] = !0; ;) {
                            const buf = this[_makeBuf](), br = 0 === buf.length ? 0 : fs.readSync(this[_fd], buf, 0, buf.length, null);
                            if (!this[_handleChunk](br, buf)) break;
                        }
                        this[_reading] = !1;
                    }
                    threw = !1;
                } finally {
                    threw && this[_close]();
                }
            }
            [_close]() {
                if (this[_autoClose] && "number" == typeof this[_fd]) {
                    const fd = this[_fd];
                    this[_fd] = null, fs.closeSync(fd), this.emit("close");
                }
            }
        }, exports.WriteStream = WriteStream, exports.WriteStreamSync = class extends WriteStream {
            [_open]() {
                let fd;
                if (this[_defaultFlag] && "r+" === this[_flags]) try {
                    fd = fs.openSync(this[_path], this[_flags], this[_mode]);
                } catch (er) {
                    if ("ENOENT" === er.code) return this[_flags] = "w", this[_open]();
                    throw er;
                } else fd = fs.openSync(this[_path], this[_flags], this[_mode]);
                this[_onopen](null, fd);
            }
            [_close]() {
                if (this[_autoClose] && "number" == typeof this[_fd]) {
                    const fd = this[_fd];
                    this[_fd] = null, fs.closeSync(fd), this.emit("close");
                }
            }
            [_write](buf) {
                let threw = !0;
                try {
                    this[_onwrite](null, fs.writeSync(this[_fd], buf, 0, buf.length, this[_pos])), threw = !1;
                } finally {
                    if (threw) try {
                        this[_close]();
                    } catch (_) {}
                }
            }
        };
    },
    9788: module => {
        "use strict";
        module.exports = function(obj) {
            if (null === obj || "object" != typeof obj) return obj;
            if (obj instanceof Object) var copy = {
                __proto__: getPrototypeOf(obj)
            }; else copy = Object.create(null);
            return Object.getOwnPropertyNames(obj).forEach((function(key) {
                Object.defineProperty(copy, key, Object.getOwnPropertyDescriptor(obj, key));
            })), copy;
        };
        var getPrototypeOf = Object.getPrototypeOf || function(obj) {
            return obj.__proto__;
        };
    },
    6851: (module, __unused_webpack_exports, __webpack_require__) => {
        var gracefulQueue, previousSymbol, fs = __webpack_require__(7147), polyfills = __webpack_require__(7994), legacy = __webpack_require__(7885), clone = __webpack_require__(9788), util = __webpack_require__(3837);
        function publishQueue(context, queue) {
            Object.defineProperty(context, gracefulQueue, {
                get: function() {
                    return queue;
                }
            });
        }
        "function" == typeof Symbol && "function" == typeof Symbol.for ? (gracefulQueue = Symbol.for("graceful-fs.queue"), 
        previousSymbol = Symbol.for("graceful-fs.previous")) : (gracefulQueue = "___graceful-fs.queue", 
        previousSymbol = "___graceful-fs.previous");
        var retryTimer, debug = function() {};
        if (util.debuglog ? debug = util.debuglog("gfs4") : /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && (debug = function() {
            var m = util.format.apply(util, arguments);
            m = "GFS4: " + m.split(/\n/).join("\nGFS4: "), console.error(m);
        }), !fs[gracefulQueue]) {
            var queue = global[gracefulQueue] || [];
            publishQueue(fs, queue), fs.close = function(fs$close) {
                function close(fd, cb) {
                    return fs$close.call(fs, fd, (function(err) {
                        err || resetQueue(), "function" == typeof cb && cb.apply(this, arguments);
                    }));
                }
                return Object.defineProperty(close, previousSymbol, {
                    value: fs$close
                }), close;
            }(fs.close), fs.closeSync = function(fs$closeSync) {
                function closeSync(fd) {
                    fs$closeSync.apply(fs, arguments), resetQueue();
                }
                return Object.defineProperty(closeSync, previousSymbol, {
                    value: fs$closeSync
                }), closeSync;
            }(fs.closeSync), /\bgfs4\b/i.test(process.env.NODE_DEBUG || "") && process.on("exit", (function() {
                debug(fs[gracefulQueue]), __webpack_require__(9491).equal(fs[gracefulQueue].length, 0);
            }));
        }
        function patch(fs) {
            polyfills(fs), fs.gracefulify = patch, fs.createReadStream = function(path, options) {
                return new fs.ReadStream(path, options);
            }, fs.createWriteStream = function(path, options) {
                return new fs.WriteStream(path, options);
            };
            var fs$readFile = fs.readFile;
            fs.readFile = function(path, options, cb) {
                "function" == typeof options && (cb = options, options = null);
                return function go$readFile(path, options, cb, startTime) {
                    return fs$readFile(path, options, (function(err) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? "function" == typeof cb && cb.apply(this, arguments) : enqueue([ go$readFile, [ path, options, cb ], err, startTime || Date.now(), Date.now() ]);
                    }));
                }(path, options, cb);
            };
            var fs$writeFile = fs.writeFile;
            fs.writeFile = function(path, data, options, cb) {
                "function" == typeof options && (cb = options, options = null);
                return function go$writeFile(path, data, options, cb, startTime) {
                    return fs$writeFile(path, data, options, (function(err) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? "function" == typeof cb && cb.apply(this, arguments) : enqueue([ go$writeFile, [ path, data, options, cb ], err, startTime || Date.now(), Date.now() ]);
                    }));
                }(path, data, options, cb);
            };
            var fs$appendFile = fs.appendFile;
            fs$appendFile && (fs.appendFile = function(path, data, options, cb) {
                "function" == typeof options && (cb = options, options = null);
                return function go$appendFile(path, data, options, cb, startTime) {
                    return fs$appendFile(path, data, options, (function(err) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? "function" == typeof cb && cb.apply(this, arguments) : enqueue([ go$appendFile, [ path, data, options, cb ], err, startTime || Date.now(), Date.now() ]);
                    }));
                }(path, data, options, cb);
            });
            var fs$copyFile = fs.copyFile;
            fs$copyFile && (fs.copyFile = function(src, dest, flags, cb) {
                "function" == typeof flags && (cb = flags, flags = 0);
                return function go$copyFile(src, dest, flags, cb, startTime) {
                    return fs$copyFile(src, dest, flags, (function(err) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? "function" == typeof cb && cb.apply(this, arguments) : enqueue([ go$copyFile, [ src, dest, flags, cb ], err, startTime || Date.now(), Date.now() ]);
                    }));
                }(src, dest, flags, cb);
            });
            var fs$readdir = fs.readdir;
            fs.readdir = function(path, options, cb) {
                "function" == typeof options && (cb = options, options = null);
                var go$readdir = noReaddirOptionVersions.test(process.version) ? function(path, options, cb, startTime) {
                    return fs$readdir(path, fs$readdirCallback(path, options, cb, startTime));
                } : function(path, options, cb, startTime) {
                    return fs$readdir(path, options, fs$readdirCallback(path, options, cb, startTime));
                };
                return go$readdir(path, options, cb);
                function fs$readdirCallback(path, options, cb, startTime) {
                    return function(err, files) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? (files && files.sort && files.sort(), 
                        "function" == typeof cb && cb.call(this, err, files)) : enqueue([ go$readdir, [ path, options, cb ], err, startTime || Date.now(), Date.now() ]);
                    };
                }
            };
            var noReaddirOptionVersions = /^v[0-5]\./;
            if ("v0.8" === process.version.substr(0, 4)) {
                var legStreams = legacy(fs);
                ReadStream = legStreams.ReadStream, WriteStream = legStreams.WriteStream;
            }
            var fs$ReadStream = fs.ReadStream;
            fs$ReadStream && (ReadStream.prototype = Object.create(fs$ReadStream.prototype), 
            ReadStream.prototype.open = function() {
                var that = this;
                open(that.path, that.flags, that.mode, (function(err, fd) {
                    err ? (that.autoClose && that.destroy(), that.emit("error", err)) : (that.fd = fd, 
                    that.emit("open", fd), that.read());
                }));
            });
            var fs$WriteStream = fs.WriteStream;
            fs$WriteStream && (WriteStream.prototype = Object.create(fs$WriteStream.prototype), 
            WriteStream.prototype.open = function() {
                var that = this;
                open(that.path, that.flags, that.mode, (function(err, fd) {
                    err ? (that.destroy(), that.emit("error", err)) : (that.fd = fd, that.emit("open", fd));
                }));
            }), Object.defineProperty(fs, "ReadStream", {
                get: function() {
                    return ReadStream;
                },
                set: function(val) {
                    ReadStream = val;
                },
                enumerable: !0,
                configurable: !0
            }), Object.defineProperty(fs, "WriteStream", {
                get: function() {
                    return WriteStream;
                },
                set: function(val) {
                    WriteStream = val;
                },
                enumerable: !0,
                configurable: !0
            });
            var FileReadStream = ReadStream;
            Object.defineProperty(fs, "FileReadStream", {
                get: function() {
                    return FileReadStream;
                },
                set: function(val) {
                    FileReadStream = val;
                },
                enumerable: !0,
                configurable: !0
            });
            var FileWriteStream = WriteStream;
            function ReadStream(path, options) {
                return this instanceof ReadStream ? (fs$ReadStream.apply(this, arguments), this) : ReadStream.apply(Object.create(ReadStream.prototype), arguments);
            }
            function WriteStream(path, options) {
                return this instanceof WriteStream ? (fs$WriteStream.apply(this, arguments), this) : WriteStream.apply(Object.create(WriteStream.prototype), arguments);
            }
            Object.defineProperty(fs, "FileWriteStream", {
                get: function() {
                    return FileWriteStream;
                },
                set: function(val) {
                    FileWriteStream = val;
                },
                enumerable: !0,
                configurable: !0
            });
            var fs$open = fs.open;
            function open(path, flags, mode, cb) {
                return "function" == typeof mode && (cb = mode, mode = null), function go$open(path, flags, mode, cb, startTime) {
                    return fs$open(path, flags, mode, (function(err, fd) {
                        !err || "EMFILE" !== err.code && "ENFILE" !== err.code ? "function" == typeof cb && cb.apply(this, arguments) : enqueue([ go$open, [ path, flags, mode, cb ], err, startTime || Date.now(), Date.now() ]);
                    }));
                }(path, flags, mode, cb);
            }
            return fs.open = open, fs;
        }
        function enqueue(elem) {
            debug("ENQUEUE", elem[0].name, elem[1]), fs[gracefulQueue].push(elem), retry();
        }
        function resetQueue() {
            for (var now = Date.now(), i = 0; i < fs[gracefulQueue].length; ++i) fs[gracefulQueue][i].length > 2 && (fs[gracefulQueue][i][3] = now, 
            fs[gracefulQueue][i][4] = now);
            retry();
        }
        function retry() {
            if (clearTimeout(retryTimer), retryTimer = void 0, 0 !== fs[gracefulQueue].length) {
                var elem = fs[gracefulQueue].shift(), fn = elem[0], args = elem[1], err = elem[2], startTime = elem[3], lastTime = elem[4];
                if (void 0 === startTime) debug("RETRY", fn.name, args), fn.apply(null, args); else if (Date.now() - startTime >= 6e4) {
                    debug("TIMEOUT", fn.name, args);
                    var cb = args.pop();
                    "function" == typeof cb && cb.call(null, err);
                } else {
                    var sinceAttempt = Date.now() - lastTime, sinceStart = Math.max(lastTime - startTime, 1);
                    sinceAttempt >= Math.min(1.2 * sinceStart, 100) ? (debug("RETRY", fn.name, args), 
                    fn.apply(null, args.concat([ startTime ]))) : fs[gracefulQueue].push(elem);
                }
                void 0 === retryTimer && (retryTimer = setTimeout(retry, 0));
            }
        }
        global[gracefulQueue] || publishQueue(global, fs[gracefulQueue]), module.exports = patch(clone(fs)), 
        process.env.TEST_GRACEFUL_FS_GLOBAL_PATCH && !fs.__patched && (module.exports = patch(fs), 
        fs.__patched = !0);
    },
    7885: (module, __unused_webpack_exports, __webpack_require__) => {
        var Stream = __webpack_require__(2781).Stream;
        module.exports = function(fs) {
            return {
                ReadStream: function ReadStream(path, options) {
                    if (!(this instanceof ReadStream)) return new ReadStream(path, options);
                    Stream.call(this);
                    var self = this;
                    this.path = path, this.fd = null, this.readable = !0, this.paused = !1, this.flags = "r", 
                    this.mode = 438, this.bufferSize = 65536, options = options || {};
                    for (var keys = Object.keys(options), index = 0, length = keys.length; index < length; index++) {
                        var key = keys[index];
                        this[key] = options[key];
                    }
                    this.encoding && this.setEncoding(this.encoding);
                    if (void 0 !== this.start) {
                        if ("number" != typeof this.start) throw TypeError("start must be a Number");
                        if (void 0 === this.end) this.end = 1 / 0; else if ("number" != typeof this.end) throw TypeError("end must be a Number");
                        if (this.start > this.end) throw new Error("start must be <= end");
                        this.pos = this.start;
                    }
                    if (null !== this.fd) return void process.nextTick((function() {
                        self._read();
                    }));
                    fs.open(this.path, this.flags, this.mode, (function(err, fd) {
                        if (err) return self.emit("error", err), void (self.readable = !1);
                        self.fd = fd, self.emit("open", fd), self._read();
                    }));
                },
                WriteStream: function WriteStream(path, options) {
                    if (!(this instanceof WriteStream)) return new WriteStream(path, options);
                    Stream.call(this), this.path = path, this.fd = null, this.writable = !0, this.flags = "w", 
                    this.encoding = "binary", this.mode = 438, this.bytesWritten = 0, options = options || {};
                    for (var keys = Object.keys(options), index = 0, length = keys.length; index < length; index++) {
                        var key = keys[index];
                        this[key] = options[key];
                    }
                    if (void 0 !== this.start) {
                        if ("number" != typeof this.start) throw TypeError("start must be a Number");
                        if (this.start < 0) throw new Error("start must be >= zero");
                        this.pos = this.start;
                    }
                    this.busy = !1, this._queue = [], null === this.fd && (this._open = fs.open, this._queue.push([ this._open, this.path, this.flags, this.mode, void 0 ]), 
                    this.flush());
                }
            };
        };
    },
    7994: (module, __unused_webpack_exports, __webpack_require__) => {
        var constants = __webpack_require__(2057), origCwd = process.cwd, cwd = null, platform = process.env.GRACEFUL_FS_PLATFORM || process.platform;
        process.cwd = function() {
            return cwd || (cwd = origCwd.call(process)), cwd;
        };
        try {
            process.cwd();
        } catch (er) {}
        if ("function" == typeof process.chdir) {
            var chdir = process.chdir;
            process.chdir = function(d) {
                cwd = null, chdir.call(process, d);
            }, Object.setPrototypeOf && Object.setPrototypeOf(process.chdir, chdir);
        }
        module.exports = function(fs) {
            constants.hasOwnProperty("O_SYMLINK") && process.version.match(/^v0\.6\.[0-2]|^v0\.5\./) && function(fs) {
                fs.lchmod = function(path, mode, callback) {
                    fs.open(path, constants.O_WRONLY | constants.O_SYMLINK, mode, (function(err, fd) {
                        err ? callback && callback(err) : fs.fchmod(fd, mode, (function(err) {
                            fs.close(fd, (function(err2) {
                                callback && callback(err || err2);
                            }));
                        }));
                    }));
                }, fs.lchmodSync = function(path, mode) {
                    var ret, fd = fs.openSync(path, constants.O_WRONLY | constants.O_SYMLINK, mode), threw = !0;
                    try {
                        ret = fs.fchmodSync(fd, mode), threw = !1;
                    } finally {
                        if (threw) try {
                            fs.closeSync(fd);
                        } catch (er) {} else fs.closeSync(fd);
                    }
                    return ret;
                };
            }(fs);
            fs.lutimes || function(fs) {
                constants.hasOwnProperty("O_SYMLINK") && fs.futimes ? (fs.lutimes = function(path, at, mt, cb) {
                    fs.open(path, constants.O_SYMLINK, (function(er, fd) {
                        er ? cb && cb(er) : fs.futimes(fd, at, mt, (function(er) {
                            fs.close(fd, (function(er2) {
                                cb && cb(er || er2);
                            }));
                        }));
                    }));
                }, fs.lutimesSync = function(path, at, mt) {
                    var ret, fd = fs.openSync(path, constants.O_SYMLINK), threw = !0;
                    try {
                        ret = fs.futimesSync(fd, at, mt), threw = !1;
                    } finally {
                        if (threw) try {
                            fs.closeSync(fd);
                        } catch (er) {} else fs.closeSync(fd);
                    }
                    return ret;
                }) : fs.futimes && (fs.lutimes = function(_a, _b, _c, cb) {
                    cb && process.nextTick(cb);
                }, fs.lutimesSync = function() {});
            }(fs);
            fs.chown = chownFix(fs.chown), fs.fchown = chownFix(fs.fchown), fs.lchown = chownFix(fs.lchown), 
            fs.chmod = chmodFix(fs.chmod), fs.fchmod = chmodFix(fs.fchmod), fs.lchmod = chmodFix(fs.lchmod), 
            fs.chownSync = chownFixSync(fs.chownSync), fs.fchownSync = chownFixSync(fs.fchownSync), 
            fs.lchownSync = chownFixSync(fs.lchownSync), fs.chmodSync = chmodFixSync(fs.chmodSync), 
            fs.fchmodSync = chmodFixSync(fs.fchmodSync), fs.lchmodSync = chmodFixSync(fs.lchmodSync), 
            fs.stat = statFix(fs.stat), fs.fstat = statFix(fs.fstat), fs.lstat = statFix(fs.lstat), 
            fs.statSync = statFixSync(fs.statSync), fs.fstatSync = statFixSync(fs.fstatSync), 
            fs.lstatSync = statFixSync(fs.lstatSync), fs.chmod && !fs.lchmod && (fs.lchmod = function(path, mode, cb) {
                cb && process.nextTick(cb);
            }, fs.lchmodSync = function() {});
            fs.chown && !fs.lchown && (fs.lchown = function(path, uid, gid, cb) {
                cb && process.nextTick(cb);
            }, fs.lchownSync = function() {});
            "win32" === platform && (fs.rename = "function" != typeof fs.rename ? fs.rename : function(fs$rename) {
                function rename(from, to, cb) {
                    var start = Date.now(), backoff = 0;
                    fs$rename(from, to, (function CB(er) {
                        if (er && ("EACCES" === er.code || "EPERM" === er.code) && Date.now() - start < 6e4) return setTimeout((function() {
                            fs.stat(to, (function(stater, st) {
                                stater && "ENOENT" === stater.code ? fs$rename(from, to, CB) : cb(er);
                            }));
                        }), backoff), void (backoff < 100 && (backoff += 10));
                        cb && cb(er);
                    }));
                }
                return Object.setPrototypeOf && Object.setPrototypeOf(rename, fs$rename), rename;
            }(fs.rename));
            function chmodFix(orig) {
                return orig ? function(target, mode, cb) {
                    return orig.call(fs, target, mode, (function(er) {
                        chownErOk(er) && (er = null), cb && cb.apply(this, arguments);
                    }));
                } : orig;
            }
            function chmodFixSync(orig) {
                return orig ? function(target, mode) {
                    try {
                        return orig.call(fs, target, mode);
                    } catch (er) {
                        if (!chownErOk(er)) throw er;
                    }
                } : orig;
            }
            function chownFix(orig) {
                return orig ? function(target, uid, gid, cb) {
                    return orig.call(fs, target, uid, gid, (function(er) {
                        chownErOk(er) && (er = null), cb && cb.apply(this, arguments);
                    }));
                } : orig;
            }
            function chownFixSync(orig) {
                return orig ? function(target, uid, gid) {
                    try {
                        return orig.call(fs, target, uid, gid);
                    } catch (er) {
                        if (!chownErOk(er)) throw er;
                    }
                } : orig;
            }
            function statFix(orig) {
                return orig ? function(target, options, cb) {
                    function callback(er, stats) {
                        stats && (stats.uid < 0 && (stats.uid += 4294967296), stats.gid < 0 && (stats.gid += 4294967296)), 
                        cb && cb.apply(this, arguments);
                    }
                    return "function" == typeof options && (cb = options, options = null), options ? orig.call(fs, target, options, callback) : orig.call(fs, target, callback);
                } : orig;
            }
            function statFixSync(orig) {
                return orig ? function(target, options) {
                    var stats = options ? orig.call(fs, target, options) : orig.call(fs, target);
                    return stats && (stats.uid < 0 && (stats.uid += 4294967296), stats.gid < 0 && (stats.gid += 4294967296)), 
                    stats;
                } : orig;
            }
            function chownErOk(er) {
                return !er || ("ENOSYS" === er.code || !(process.getuid && 0 === process.getuid() || "EINVAL" !== er.code && "EPERM" !== er.code));
            }
            fs.read = "function" != typeof fs.read ? fs.read : function(fs$read) {
                function read(fd, buffer, offset, length, position, callback_) {
                    var callback;
                    if (callback_ && "function" == typeof callback_) {
                        var eagCounter = 0;
                        callback = function(er, _, __) {
                            if (er && "EAGAIN" === er.code && eagCounter < 10) return eagCounter++, fs$read.call(fs, fd, buffer, offset, length, position, callback);
                            callback_.apply(this, arguments);
                        };
                    }
                    return fs$read.call(fs, fd, buffer, offset, length, position, callback);
                }
                return Object.setPrototypeOf && Object.setPrototypeOf(read, fs$read), read;
            }(fs.read), fs.readSync = "function" != typeof fs.readSync ? fs.readSync : (fs$readSync = fs.readSync, 
            function(fd, buffer, offset, length, position) {
                for (var eagCounter = 0; ;) try {
                    return fs$readSync.call(fs, fd, buffer, offset, length, position);
                } catch (er) {
                    if ("EAGAIN" === er.code && eagCounter < 10) {
                        eagCounter++;
                        continue;
                    }
                    throw er;
                }
            });
            var fs$readSync;
        };
    },
    3393: (module, __unused_webpack_exports, __webpack_require__) => {
        let _fs;
        try {
            _fs = __webpack_require__(6851);
        } catch (_) {
            _fs = __webpack_require__(7147);
        }
        const universalify = __webpack_require__(3459), {stringify, stripBom} = __webpack_require__(9293);
        const jsonfile = {
            readFile: universalify.fromPromise((async function(file, options = {}) {
                "string" == typeof options && (options = {
                    encoding: options
                });
                const fs = options.fs || _fs, shouldThrow = !("throws" in options) || options.throws;
                let obj, data = await universalify.fromCallback(fs.readFile)(file, options);
                data = stripBom(data);
                try {
                    obj = JSON.parse(data, options ? options.reviver : null);
                } catch (err) {
                    if (shouldThrow) throw err.message = `${file}: ${err.message}`, err;
                    return null;
                }
                return obj;
            })),
            readFileSync: function(file, options = {}) {
                "string" == typeof options && (options = {
                    encoding: options
                });
                const fs = options.fs || _fs, shouldThrow = !("throws" in options) || options.throws;
                try {
                    let content = fs.readFileSync(file, options);
                    return content = stripBom(content), JSON.parse(content, options.reviver);
                } catch (err) {
                    if (shouldThrow) throw err.message = `${file}: ${err.message}`, err;
                    return null;
                }
            },
            writeFile: universalify.fromPromise((async function(file, obj, options = {}) {
                const fs = options.fs || _fs, str = stringify(obj, options);
                await universalify.fromCallback(fs.writeFile)(file, str, options);
            })),
            writeFileSync: function(file, obj, options = {}) {
                const fs = options.fs || _fs, str = stringify(obj, options);
                return fs.writeFileSync(file, str, options);
            }
        };
        module.exports = jsonfile;
    },
    9293: module => {
        module.exports = {
            stringify: function(obj, {EOL = "\n", finalEOL = !0, replacer = null, spaces} = {}) {
                const EOF = finalEOL ? EOL : "";
                return JSON.stringify(obj, replacer, spaces).replace(/\n/g, EOL) + EOF;
            },
            stripBom: function(content) {
                return Buffer.isBuffer(content) && (content = content.toString("utf8")), content.replace(/^\uFEFF/, "");
            }
        };
    },
    2945: (__unused_webpack_module, exports, __webpack_require__) => {
        var fs = __webpack_require__(7147), wx = "wx";
        if (process.version.match(/^v0\.[0-6]/)) {
            var c = __webpack_require__(2057);
            wx = c.O_TRUNC | c.O_CREAT | c.O_WRONLY | c.O_EXCL;
        }
        var debug, os = __webpack_require__(2037);
        exports.filetime = "ctime", "win32" == os.platform() && (exports.filetime = "mtime");
        var util = __webpack_require__(3837);
        debug = util.debuglog ? util.debuglog("LOCKFILE") : /\blockfile\b/i.test(process.env.NODE_DEBUG) ? function() {
            var msg = util.format.apply(util, arguments);
            console.error("LOCKFILE %d %s", process.pid, msg);
        } : function() {};
        var locks = {};
        __webpack_require__(156)((function() {
            debug("exit listener"), Object.keys(locks).forEach(exports.unlockSync);
        })), /^v0\.[0-8]\./.test(process.version) && (debug("uncaughtException, version = %s", process.version), 
        process.on("uncaughtException", (function H(er) {
            if (debug("uncaughtException"), !process.listeners("uncaughtException").filter((function(h) {
                return h !== H;
            })).length) {
                try {
                    Object.keys(locks).forEach(exports.unlockSync);
                } catch (e) {}
                throw process.removeListener("uncaughtException", H), er;
            }
        }))), exports.unlock = function(path, cb) {
            debug("unlock", path), delete locks[path], fs.unlink(path, (function(unlinkEr) {
                cb && cb();
            }));
        }, exports.unlockSync = function(path) {
            debug("unlockSync", path);
            try {
                fs.unlinkSync(path);
            } catch (er) {}
            delete locks[path];
        }, exports.check = function(path, opts, cb) {
            "function" == typeof opts && (cb = opts, opts = {}), debug("check", path, opts), 
            fs.open(path, "r", (function(er, fd) {
                return er ? "ENOENT" !== er.code ? cb(er) : cb(null, !1) : opts.stale ? void fs.fstat(fd, (function(er, st) {
                    if (er) return fs.close(fd, (function(er2) {
                        return cb(er);
                    }));
                    fs.close(fd, (function(er) {
                        var age = Date.now() - st[exports.filetime].getTime();
                        return cb(er, age <= opts.stale);
                    }));
                })) : fs.close(fd, (function(er) {
                    return cb(er, !0);
                }));
            }));
        }, exports.checkSync = function(path, opts) {
            if (debug("checkSync", path, opts = opts || {}), opts.wait) throw new Error("opts.wait not supported sync for obvious reasons");
            try {
                var fd = fs.openSync(path, "r");
            } catch (er) {
                if ("ENOENT" !== er.code) throw er;
                return !1;
            }
            if (!opts.stale) {
                try {
                    fs.closeSync(fd);
                } catch (er) {}
                return !0;
            }
            if (opts.stale) {
                try {
                    var st = fs.fstatSync(fd);
                } finally {
                    fs.closeSync(fd);
                }
                return Date.now() - st[exports.filetime].getTime() <= opts.stale;
            }
        };
        var req = 1;
        function maybeStale(originalEr, path, opts, hasStaleLock, cb) {
            fs.stat(path, (function(statEr, st) {
                return statEr ? "ENOENT" === statEr.code ? (opts.stale = !1, debug("lock stale enoent retry", path, opts), 
                void exports.lock(path, opts, cb)) : cb(statEr) : Date.now() - st[exports.filetime].getTime() <= opts.stale ? notStale(originalEr, path, opts, cb) : (debug("lock stale", path, opts), 
                void (hasStaleLock ? exports.unlock(path, (function(er) {
                    if (er) return cb(er);
                    debug("lock stale retry", path, opts), fs.link(path + ".STALE", path, (function(er) {
                        fs.unlink(path + ".STALE", (function() {
                            cb(er);
                        }));
                    }));
                })) : (debug("acquire .STALE file lock", opts), exports.lock(path + ".STALE", opts, (function(er) {
                    if (er) return cb(er);
                    maybeStale(originalEr, path, opts, !0, cb);
                })))));
            }));
        }
        function notStale(er, path, opts, cb) {
            if (debug("notStale", path, opts), "number" != typeof opts.wait || opts.wait <= 0) return debug("notStale, wait is not a number"), 
            cb(er);
            var now = Date.now(), start = opts.start || now, end = start + opts.wait;
            if (end <= now) return cb(er);
            debug("now=%d, wait until %d (delta=%d)", start, end, end - start);
            var wait = Math.min(end - start, opts.pollPeriod || 100);
            setTimeout((function() {
                debug("notStale, polling", path, opts), exports.lock(path, opts, cb);
            }), wait);
        }
        function retryThrow(path, opts, er) {
            if ("number" == typeof opts.retries && opts.retries > 0) {
                var newRT = opts.retries - 1;
                return debug("retryThrow", path, opts, newRT), opts.retries = newRT, exports.lockSync(path, opts);
            }
            throw er;
        }
        exports.lock = function(path, opts, cb) {
            if ("function" == typeof opts && (cb = opts, opts = {}), opts.req = opts.req || req++, 
            debug("lock", path, opts), opts.start = opts.start || Date.now(), "number" == typeof opts.retries && opts.retries > 0) {
                debug("has retries", opts.retries);
                var retries = opts.retries;
                opts.retries = 0, orig = cb, cb = function cb(er, fd) {
                    if (debug("retry-mutated callback"), retries -= 1, !er || retries < 0) return orig(er, fd);
                    function retry() {
                        opts.start = Date.now(), debug("retrying", opts.start), exports.lock(path, opts, cb);
                    }
                    debug("lock retry", path, opts), opts.retryWait ? setTimeout(retry, opts.retryWait) : retry();
                };
            }
            var orig;
            fs.open(path, wx, (function(er, fd) {
                return er ? (debug("failed to acquire lock", er), "EEXIST" !== er.code ? (debug("not EEXIST error", er), 
                cb(er)) : opts.stale ? maybeStale(er, path, opts, !1, cb) : notStale(er, path, opts, cb)) : (debug("locked", path, fd), 
                locks[path] = fd, fs.close(fd, (function() {
                    return cb();
                })));
            })), debug("lock return");
        }, exports.lockSync = function(path, opts) {
            if ((opts = opts || {}).req = opts.req || req++, debug("lockSync", path, opts), 
            opts.wait || opts.retryWait) throw new Error("opts.wait not supported sync for obvious reasons");
            try {
                var fd = fs.openSync(path, wx);
                locks[path] = fd;
                try {
                    fs.closeSync(fd);
                } catch (er) {}
                return void debug("locked sync!", path, fd);
            } catch (er) {
                if ("EEXIST" !== er.code) return retryThrow(path, opts, er);
                if (opts.stale) {
                    var ct = fs.statSync(path)[exports.filetime].getTime();
                    !(ct % 1e3) && opts.stale % 1e3 && (opts.stale = 1e3 * Math.ceil(opts.stale / 1e3));
                    var age = Date.now() - ct;
                    if (age > opts.stale) return debug("lockSync stale", path, opts, age), exports.unlockSync(path), 
                    exports.lockSync(path, opts);
                }
                return debug("failed to lock", path, opts, er), retryThrow(path, opts, er);
            }
        };
    },
    2253: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const proc = "object" == typeof process && process ? process : {
            stdout: null,
            stderr: null
        }, EE = __webpack_require__(2361), Stream = __webpack_require__(2781), SD = __webpack_require__(1576).StringDecoder, EOF = Symbol("EOF"), MAYBE_EMIT_END = Symbol("maybeEmitEnd"), EMITTED_END = Symbol("emittedEnd"), EMITTING_END = Symbol("emittingEnd"), EMITTED_ERROR = Symbol("emittedError"), CLOSED = Symbol("closed"), READ = Symbol("read"), FLUSH = Symbol("flush"), FLUSHCHUNK = Symbol("flushChunk"), ENCODING = Symbol("encoding"), DECODER = Symbol("decoder"), FLOWING = Symbol("flowing"), PAUSED = Symbol("paused"), RESUME = Symbol("resume"), BUFFERLENGTH = Symbol("bufferLength"), BUFFERPUSH = Symbol("bufferPush"), BUFFERSHIFT = Symbol("bufferShift"), OBJECTMODE = Symbol("objectMode"), DESTROYED = Symbol("destroyed"), EMITDATA = Symbol("emitData"), EMITEND = Symbol("emitEnd"), EMITEND2 = Symbol("emitEnd2"), ASYNC = Symbol("async"), defer = fn => Promise.resolve().then(fn), doIter = "1" !== global._MP_NO_ITERATOR_SYMBOLS_, ASYNCITERATOR = doIter && Symbol.asyncIterator || Symbol("asyncIterator not implemented"), ITERATOR = doIter && Symbol.iterator || Symbol("iterator not implemented");
        class Pipe {
            constructor(src, dest, opts) {
                this.src = src, this.dest = dest, this.opts = opts, this.ondrain = () => src[RESUME](), 
                dest.on("drain", this.ondrain);
            }
            unpipe() {
                this.dest.removeListener("drain", this.ondrain);
            }
            proxyErrors() {}
            end() {
                this.unpipe(), this.opts.end && this.dest.end();
            }
        }
        class PipeProxyErrors extends Pipe {
            unpipe() {
                this.src.removeListener("error", this.proxyErrors), super.unpipe();
            }
            constructor(src, dest, opts) {
                super(src, dest, opts), this.proxyErrors = er => dest.emit("error", er), src.on("error", this.proxyErrors);
            }
        }
        module.exports = class Minipass extends Stream {
            constructor(options) {
                super(), this[FLOWING] = !1, this[PAUSED] = !1, this.pipes = [], this.buffer = [], 
                this[OBJECTMODE] = options && options.objectMode || !1, this[OBJECTMODE] ? this[ENCODING] = null : this[ENCODING] = options && options.encoding || null, 
                "buffer" === this[ENCODING] && (this[ENCODING] = null), this[ASYNC] = options && !!options.async || !1, 
                this[DECODER] = this[ENCODING] ? new SD(this[ENCODING]) : null, this[EOF] = !1, 
                this[EMITTED_END] = !1, this[EMITTING_END] = !1, this[CLOSED] = !1, this[EMITTED_ERROR] = null, 
                this.writable = !0, this.readable = !0, this[BUFFERLENGTH] = 0, this[DESTROYED] = !1;
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
                this[ENCODING] !== enc && (this[DECODER] = enc ? new SD(enc) : null, this.buffer.length && (this.buffer = this.buffer.map((chunk => this[DECODER].write(chunk))))), 
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
            get async() {
                return this[ASYNC];
            }
            set async(a) {
                this[ASYNC] = this[ASYNC] || !!a;
            }
            write(chunk, encoding, cb) {
                if (this[EOF]) throw new Error("write after end");
                if (this[DESTROYED]) return this.emit("error", Object.assign(new Error("Cannot call write after a stream was destroyed"), {
                    code: "ERR_STREAM_DESTROYED"
                })), !0;
                "function" == typeof encoding && (cb = encoding, encoding = "utf8"), encoding || (encoding = "utf8");
                const fn = this[ASYNC] ? defer : f => f();
                var b;
                return this[OBJECTMODE] || Buffer.isBuffer(chunk) || (b = chunk, !Buffer.isBuffer(b) && ArrayBuffer.isView(b) ? chunk = Buffer.from(chunk.buffer, chunk.byteOffset, chunk.byteLength) : (b => b instanceof ArrayBuffer || "object" == typeof b && b.constructor && "ArrayBuffer" === b.constructor.name && b.byteLength >= 0)(chunk) ? chunk = Buffer.from(chunk) : "string" != typeof chunk && (this.objectMode = !0)), 
                this[OBJECTMODE] ? (this.flowing && 0 !== this[BUFFERLENGTH] && this[FLUSH](!0), 
                this.flowing ? this.emit("data", chunk) : this[BUFFERPUSH](chunk), 0 !== this[BUFFERLENGTH] && this.emit("readable"), 
                cb && fn(cb), this.flowing) : chunk.length ? ("string" != typeof chunk || encoding === this[ENCODING] && !this[DECODER].lastNeed || (chunk = Buffer.from(chunk, encoding)), 
                Buffer.isBuffer(chunk) && this[ENCODING] && (chunk = this[DECODER].write(chunk)), 
                this.flowing && 0 !== this[BUFFERLENGTH] && this[FLUSH](!0), this.flowing ? this.emit("data", chunk) : this[BUFFERPUSH](chunk), 
                0 !== this[BUFFERLENGTH] && this.emit("readable"), cb && fn(cb), this.flowing) : (0 !== this[BUFFERLENGTH] && this.emit("readable"), 
                cb && fn(cb), this.flowing);
            }
            read(n) {
                if (this[DESTROYED]) return null;
                if (0 === this[BUFFERLENGTH] || 0 === n || n > this[BUFFERLENGTH]) return this[MAYBE_EMIT_END](), 
                null;
                this[OBJECTMODE] && (n = null), this.buffer.length > 1 && !this[OBJECTMODE] && (this.encoding ? this.buffer = [ this.buffer.join("") ] : this.buffer = [ Buffer.concat(this.buffer, this[BUFFERLENGTH]) ]);
                const ret = this[READ](n || null, this.buffer[0]);
                return this[MAYBE_EMIT_END](), ret;
            }
            [READ](n, chunk) {
                return n === chunk.length || null === n ? this[BUFFERSHIFT]() : (this.buffer[0] = chunk.slice(n), 
                chunk = chunk.slice(0, n), this[BUFFERLENGTH] -= n), this.emit("data", chunk), this.buffer.length || this[EOF] || this.emit("drain"), 
                chunk;
            }
            end(chunk, encoding, cb) {
                return "function" == typeof chunk && (cb = chunk, chunk = null), "function" == typeof encoding && (cb = encoding, 
                encoding = "utf8"), chunk && this.write(chunk, encoding), cb && this.once("end", cb), 
                this[EOF] = !0, this.writable = !1, !this.flowing && this[PAUSED] || this[MAYBE_EMIT_END](), 
                this;
            }
            [RESUME]() {
                this[DESTROYED] || (this[PAUSED] = !1, this[FLOWING] = !0, this.emit("resume"), 
                this.buffer.length ? this[FLUSH]() : this[EOF] ? this[MAYBE_EMIT_END]() : this.emit("drain"));
            }
            resume() {
                return this[RESUME]();
            }
            pause() {
                this[FLOWING] = !1, this[PAUSED] = !0;
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
                this[OBJECTMODE] ? this[BUFFERLENGTH] += 1 : this[BUFFERLENGTH] += chunk.length, 
                this.buffer.push(chunk);
            }
            [BUFFERSHIFT]() {
                return this.buffer.length && (this[OBJECTMODE] ? this[BUFFERLENGTH] -= 1 : this[BUFFERLENGTH] -= this.buffer[0].length), 
                this.buffer.shift();
            }
            [FLUSH](noDrain) {
                do {} while (this[FLUSHCHUNK](this[BUFFERSHIFT]()));
                noDrain || this.buffer.length || this[EOF] || this.emit("drain");
            }
            [FLUSHCHUNK](chunk) {
                return !!chunk && (this.emit("data", chunk), this.flowing);
            }
            pipe(dest, opts) {
                if (this[DESTROYED]) return;
                const ended = this[EMITTED_END];
                return opts = opts || {}, dest === proc.stdout || dest === proc.stderr ? opts.end = !1 : opts.end = !1 !== opts.end, 
                opts.proxyErrors = !!opts.proxyErrors, ended ? opts.end && dest.end() : (this.pipes.push(opts.proxyErrors ? new PipeProxyErrors(this, dest, opts) : new Pipe(this, dest, opts)), 
                this[ASYNC] ? defer((() => this[RESUME]())) : this[RESUME]()), dest;
            }
            unpipe(dest) {
                const p = this.pipes.find((p => p.dest === dest));
                p && (this.pipes.splice(this.pipes.indexOf(p), 1), p.unpipe());
            }
            addListener(ev, fn) {
                return this.on(ev, fn);
            }
            on(ev, fn) {
                const ret = super.on(ev, fn);
                return "data" !== ev || this.pipes.length || this.flowing ? "readable" === ev && 0 !== this[BUFFERLENGTH] ? super.emit("readable") : (ev => "end" === ev || "finish" === ev || "prefinish" === ev)(ev) && this[EMITTED_END] ? (super.emit(ev), 
                this.removeAllListeners(ev)) : "error" === ev && this[EMITTED_ERROR] && (this[ASYNC] ? defer((() => fn.call(this, this[EMITTED_ERROR]))) : fn.call(this, this[EMITTED_ERROR])) : this[RESUME](), 
                ret;
            }
            get emittedEnd() {
                return this[EMITTED_END];
            }
            [MAYBE_EMIT_END]() {
                this[EMITTING_END] || this[EMITTED_END] || this[DESTROYED] || 0 !== this.buffer.length || !this[EOF] || (this[EMITTING_END] = !0, 
                this.emit("end"), this.emit("prefinish"), this.emit("finish"), this[CLOSED] && this.emit("close"), 
                this[EMITTING_END] = !1);
            }
            emit(ev, data, ...extra) {
                if ("error" !== ev && "close" !== ev && ev !== DESTROYED && this[DESTROYED]) return;
                if ("data" === ev) return !!data && (this[ASYNC] ? defer((() => this[EMITDATA](data))) : this[EMITDATA](data));
                if ("end" === ev) return this[EMITEND]();
                if ("close" === ev) {
                    if (this[CLOSED] = !0, !this[EMITTED_END] && !this[DESTROYED]) return;
                    const ret = super.emit("close");
                    return this.removeAllListeners("close"), ret;
                }
                if ("error" === ev) {
                    this[EMITTED_ERROR] = data;
                    const ret = super.emit("error", data);
                    return this[MAYBE_EMIT_END](), ret;
                }
                if ("resume" === ev) {
                    const ret = super.emit("resume");
                    return this[MAYBE_EMIT_END](), ret;
                }
                if ("finish" === ev || "prefinish" === ev) {
                    const ret = super.emit(ev);
                    return this.removeAllListeners(ev), ret;
                }
                const ret = super.emit(ev, data, ...extra);
                return this[MAYBE_EMIT_END](), ret;
            }
            [EMITDATA](data) {
                for (const p of this.pipes) !1 === p.dest.write(data) && this.pause();
                const ret = super.emit("data", data);
                return this[MAYBE_EMIT_END](), ret;
            }
            [EMITEND]() {
                this[EMITTED_END] || (this[EMITTED_END] = !0, this.readable = !1, this[ASYNC] ? defer((() => this[EMITEND2]())) : this[EMITEND2]());
            }
            [EMITEND2]() {
                if (this[DECODER]) {
                    const data = this[DECODER].end();
                    if (data) {
                        for (const p of this.pipes) p.dest.write(data);
                        super.emit("data", data);
                    }
                }
                for (const p of this.pipes) p.end();
                const ret = super.emit("end");
                return this.removeAllListeners("end"), ret;
            }
            collect() {
                const buf = [];
                this[OBJECTMODE] || (buf.dataLength = 0);
                const p = this.promise();
                return this.on("data", (c => {
                    buf.push(c), this[OBJECTMODE] || (buf.dataLength += c.length);
                })), p.then((() => buf));
            }
            concat() {
                return this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this.collect().then((buf => this[OBJECTMODE] ? Promise.reject(new Error("cannot concat in objectMode")) : this[ENCODING] ? buf.join("") : Buffer.concat(buf, buf.dataLength)));
            }
            promise() {
                return new Promise(((resolve, reject) => {
                    this.on(DESTROYED, (() => reject(new Error("stream destroyed")))), this.on("error", (er => reject(er))), 
                    this.on("end", (() => resolve()));
                }));
            }
            [ASYNCITERATOR]() {
                return {
                    next: () => {
                        const res = this.read();
                        if (null !== res) return Promise.resolve({
                            done: !1,
                            value: res
                        });
                        if (this[EOF]) return Promise.resolve({
                            done: !0
                        });
                        let resolve = null, reject = null;
                        const onerr = er => {
                            this.removeListener("data", ondata), this.removeListener("end", onend), reject(er);
                        }, ondata = value => {
                            this.removeListener("error", onerr), this.removeListener("end", onend), this.pause(), 
                            resolve({
                                value,
                                done: !!this[EOF]
                            });
                        }, onend = () => {
                            this.removeListener("error", onerr), this.removeListener("data", ondata), resolve({
                                done: !0
                            });
                        }, ondestroy = () => onerr(new Error("stream destroyed"));
                        return new Promise(((res, rej) => {
                            reject = rej, resolve = res, this.once(DESTROYED, ondestroy), this.once("error", onerr), 
                            this.once("end", onend), this.once("data", ondata);
                        }));
                    }
                };
            }
            [ITERATOR]() {
                return {
                    next: () => {
                        const value = this.read();
                        return {
                            value,
                            done: null === value
                        };
                    }
                };
            }
            destroy(er) {
                return this[DESTROYED] ? (er ? this.emit("error", er) : this.emit(DESTROYED), this) : (this[DESTROYED] = !0, 
                this.buffer.length = 0, this[BUFFERLENGTH] = 0, "function" != typeof this.close || this[CLOSED] || this.close(), 
                er ? this.emit("error", er) : this.emit(DESTROYED), this);
            }
            static isStream(s) {
                return !!s && (s instanceof Minipass || s instanceof Stream || s instanceof EE && ("function" == typeof s.pipe || "function" == typeof s.write && "function" == typeof s.end));
            }
        };
    },
    8597: (module, __unused_webpack_exports, __webpack_require__) => {
        const realZlibConstants = __webpack_require__(9796).constants || {
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
            Z_MAX_CHUNK: 1 / 0,
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
    3704: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        const assert = __webpack_require__(9491), Buffer = __webpack_require__(4300).Buffer, realZlib = __webpack_require__(9796), constants = exports.constants = __webpack_require__(8597), Minipass = __webpack_require__(2253), OriginalBufferConcat = Buffer.concat, _superWrite = Symbol("_superWrite");
        class ZlibError extends Error {
            constructor(err) {
                super("zlib: " + err.message), this.code = err.code, this.errno = err.errno, this.code || (this.code = "ZLIB_ERROR"), 
                this.message = "zlib: " + err.message, Error.captureStackTrace(this, this.constructor);
            }
            get name() {
                return "ZlibError";
            }
        }
        const _opts = Symbol("opts"), _flushFlag = Symbol("flushFlag"), _finishFlushFlag = Symbol("finishFlushFlag"), _fullFlushFlag = Symbol("fullFlushFlag"), _handle = Symbol("handle"), _onError = Symbol("onError"), _sawError = Symbol("sawError"), _level = Symbol("level"), _strategy = Symbol("strategy"), _ended = Symbol("ended");
        Symbol("_defaultFullFlush");
        class ZlibBase extends Minipass {
            constructor(opts, mode) {
                if (!opts || "object" != typeof opts) throw new TypeError("invalid options for ZlibBase constructor");
                super(opts), this[_sawError] = !1, this[_ended] = !1, this[_opts] = opts, this[_flushFlag] = opts.flush, 
                this[_finishFlushFlag] = opts.finishFlush;
                try {
                    this[_handle] = new realZlib[mode](opts);
                } catch (er) {
                    throw new ZlibError(er);
                }
                this[_onError] = err => {
                    this[_sawError] || (this[_sawError] = !0, this.close(), this.emit("error", err));
                }, this[_handle].on("error", (er => this[_onError](new ZlibError(er)))), this.once("end", (() => this.close));
            }
            close() {
                this[_handle] && (this[_handle].close(), this[_handle] = null, this.emit("close"));
            }
            reset() {
                if (!this[_sawError]) return assert(this[_handle], "zlib binding closed"), this[_handle].reset();
            }
            flush(flushFlag) {
                this.ended || ("number" != typeof flushFlag && (flushFlag = this[_fullFlushFlag]), 
                this.write(Object.assign(Buffer.alloc(0), {
                    [_flushFlag]: flushFlag
                })));
            }
            end(chunk, encoding, cb) {
                return chunk && this.write(chunk, encoding), this.flush(this[_finishFlushFlag]), 
                this[_ended] = !0, super.end(null, null, cb);
            }
            get ended() {
                return this[_ended];
            }
            write(chunk, encoding, cb) {
                if ("function" == typeof encoding && (cb = encoding, encoding = "utf8"), "string" == typeof chunk && (chunk = Buffer.from(chunk, encoding)), 
                this[_sawError]) return;
                assert(this[_handle], "zlib binding closed");
                const nativeHandle = this[_handle]._handle, originalNativeClose = nativeHandle.close;
                nativeHandle.close = () => {};
                const originalClose = this[_handle].close;
                let result, writeReturn;
                this[_handle].close = () => {}, Buffer.concat = args => args;
                try {
                    const flushFlag = "number" == typeof chunk[_flushFlag] ? chunk[_flushFlag] : this[_flushFlag];
                    result = this[_handle]._processChunk(chunk, flushFlag), Buffer.concat = OriginalBufferConcat;
                } catch (err) {
                    Buffer.concat = OriginalBufferConcat, this[_onError](new ZlibError(err));
                } finally {
                    this[_handle] && (this[_handle]._handle = nativeHandle, nativeHandle.close = originalNativeClose, 
                    this[_handle].close = originalClose, this[_handle].removeAllListeners("error"));
                }
                if (this[_handle] && this[_handle].on("error", (er => this[_onError](new ZlibError(er)))), 
                result) if (Array.isArray(result) && result.length > 0) {
                    writeReturn = this[_superWrite](Buffer.from(result[0]));
                    for (let i = 1; i < result.length; i++) writeReturn = this[_superWrite](result[i]);
                } else writeReturn = this[_superWrite](Buffer.from(result));
                return cb && cb(), writeReturn;
            }
            [_superWrite](data) {
                return super.write(data);
            }
        }
        class Zlib extends ZlibBase {
            constructor(opts, mode) {
                (opts = opts || {}).flush = opts.flush || constants.Z_NO_FLUSH, opts.finishFlush = opts.finishFlush || constants.Z_FINISH, 
                super(opts, mode), this[_fullFlushFlag] = constants.Z_FULL_FLUSH, this[_level] = opts.level, 
                this[_strategy] = opts.strategy;
            }
            params(level, strategy) {
                if (!this[_sawError]) {
                    if (!this[_handle]) throw new Error("cannot switch params when binding is closed");
                    if (!this[_handle].params) throw new Error("not supported in this implementation");
                    if (this[_level] !== level || this[_strategy] !== strategy) {
                        this.flush(constants.Z_SYNC_FLUSH), assert(this[_handle], "zlib binding closed");
                        const origFlush = this[_handle].flush;
                        this[_handle].flush = (flushFlag, cb) => {
                            this.flush(flushFlag), cb();
                        };
                        try {
                            this[_handle].params(level, strategy);
                        } finally {
                            this[_handle].flush = origFlush;
                        }
                        this[_handle] && (this[_level] = level, this[_strategy] = strategy);
                    }
                }
            }
        }
        const _portable = Symbol("_portable");
        class Brotli extends ZlibBase {
            constructor(opts, mode) {
                (opts = opts || {}).flush = opts.flush || constants.BROTLI_OPERATION_PROCESS, opts.finishFlush = opts.finishFlush || constants.BROTLI_OPERATION_FINISH, 
                super(opts, mode), this[_fullFlushFlag] = constants.BROTLI_OPERATION_FLUSH;
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
        exports.Deflate = class extends Zlib {
            constructor(opts) {
                super(opts, "Deflate");
            }
        }, exports.Inflate = class extends Zlib {
            constructor(opts) {
                super(opts, "Inflate");
            }
        }, exports.Gzip = class extends Zlib {
            constructor(opts) {
                super(opts, "Gzip"), this[_portable] = opts && !!opts.portable;
            }
            [_superWrite](data) {
                return this[_portable] ? (this[_portable] = !1, data[9] = 255, super[_superWrite](data)) : super[_superWrite](data);
            }
        }, exports.Gunzip = class extends Zlib {
            constructor(opts) {
                super(opts, "Gunzip");
            }
        }, exports.DeflateRaw = class extends Zlib {
            constructor(opts) {
                super(opts, "DeflateRaw");
            }
        }, exports.InflateRaw = class extends Zlib {
            constructor(opts) {
                super(opts, "InflateRaw");
            }
        }, exports.Unzip = class extends Zlib {
            constructor(opts) {
                super(opts, "Unzip");
            }
        }, "function" == typeof realZlib.BrotliCompress ? (exports.BrotliCompress = BrotliCompress, 
        exports.BrotliDecompress = BrotliDecompress) : exports.BrotliCompress = exports.BrotliDecompress = class {
            constructor() {
                throw new Error("Brotli is not supported in this version of Node.js");
            }
        };
    },
    3179: (module, __unused_webpack_exports, __webpack_require__) => {
        const optsArg = __webpack_require__(2425), pathArg = __webpack_require__(7394), {mkdirpNative, mkdirpNativeSync} = __webpack_require__(5702), {mkdirpManual, mkdirpManualSync} = __webpack_require__(8116), {useNative, useNativeSync} = __webpack_require__(6631), mkdirp = (path, opts) => (path = pathArg(path), 
        opts = optsArg(opts), useNative(opts) ? mkdirpNative(path, opts) : mkdirpManual(path, opts));
        mkdirp.sync = (path, opts) => (path = pathArg(path), opts = optsArg(opts), useNativeSync(opts) ? mkdirpNativeSync(path, opts) : mkdirpManualSync(path, opts)), 
        mkdirp.native = (path, opts) => mkdirpNative(pathArg(path), optsArg(opts)), mkdirp.manual = (path, opts) => mkdirpManual(pathArg(path), optsArg(opts)), 
        mkdirp.nativeSync = (path, opts) => mkdirpNativeSync(pathArg(path), optsArg(opts)), 
        mkdirp.manualSync = (path, opts) => mkdirpManualSync(pathArg(path), optsArg(opts)), 
        module.exports = mkdirp;
    },
    1008: (module, __unused_webpack_exports, __webpack_require__) => {
        const {dirname} = __webpack_require__(4822), findMade = (opts, parent, path) => path === parent ? Promise.resolve() : opts.statAsync(parent).then((st => st.isDirectory() ? path : void 0), (er => "ENOENT" === er.code ? findMade(opts, dirname(parent), parent) : void 0)), findMadeSync = (opts, parent, path) => {
            if (path !== parent) try {
                return opts.statSync(parent).isDirectory() ? path : void 0;
            } catch (er) {
                return "ENOENT" === er.code ? findMadeSync(opts, dirname(parent), parent) : void 0;
            }
        };
        module.exports = {
            findMade,
            findMadeSync
        };
    },
    8116: (module, __unused_webpack_exports, __webpack_require__) => {
        const {dirname} = __webpack_require__(4822), mkdirpManual = (path, opts, made) => {
            opts.recursive = !1;
            const parent = dirname(path);
            return parent === path ? opts.mkdirAsync(path, opts).catch((er => {
                if ("EISDIR" !== er.code) throw er;
            })) : opts.mkdirAsync(path, opts).then((() => made || path), (er => {
                if ("ENOENT" === er.code) return mkdirpManual(parent, opts).then((made => mkdirpManual(path, opts, made)));
                if ("EEXIST" !== er.code && "EROFS" !== er.code) throw er;
                return opts.statAsync(path).then((st => {
                    if (st.isDirectory()) return made;
                    throw er;
                }), (() => {
                    throw er;
                }));
            }));
        }, mkdirpManualSync = (path, opts, made) => {
            const parent = dirname(path);
            if (opts.recursive = !1, parent === path) try {
                return opts.mkdirSync(path, opts);
            } catch (er) {
                if ("EISDIR" !== er.code) throw er;
                return;
            }
            try {
                return opts.mkdirSync(path, opts), made || path;
            } catch (er) {
                if ("ENOENT" === er.code) return mkdirpManualSync(path, opts, mkdirpManualSync(parent, opts, made));
                if ("EEXIST" !== er.code && "EROFS" !== er.code) throw er;
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
    5702: (module, __unused_webpack_exports, __webpack_require__) => {
        const {dirname} = __webpack_require__(4822), {findMade, findMadeSync} = __webpack_require__(1008), {mkdirpManual, mkdirpManualSync} = __webpack_require__(8116);
        module.exports = {
            mkdirpNative: (path, opts) => {
                opts.recursive = !0;
                return dirname(path) === path ? opts.mkdirAsync(path, opts) : findMade(opts, path).then((made => opts.mkdirAsync(path, opts).then((() => made)).catch((er => {
                    if ("ENOENT" === er.code) return mkdirpManual(path, opts);
                    throw er;
                }))));
            },
            mkdirpNativeSync: (path, opts) => {
                opts.recursive = !0;
                if (dirname(path) === path) return opts.mkdirSync(path, opts);
                const made = findMadeSync(opts, path);
                try {
                    return opts.mkdirSync(path, opts), made;
                } catch (er) {
                    if ("ENOENT" === er.code) return mkdirpManualSync(path, opts);
                    throw er;
                }
            }
        };
    },
    2425: (module, __unused_webpack_exports, __webpack_require__) => {
        const {promisify} = __webpack_require__(3837), fs = __webpack_require__(7147);
        module.exports = opts => {
            if (opts) if ("object" == typeof opts) opts = {
                mode: 511,
                fs,
                ...opts
            }; else if ("number" == typeof opts) opts = {
                mode: opts,
                fs
            }; else {
                if ("string" != typeof opts) throw new TypeError("invalid options argument");
                opts = {
                    mode: parseInt(opts, 8),
                    fs
                };
            } else opts = {
                mode: 511,
                fs
            };
            return opts.mkdir = opts.mkdir || opts.fs.mkdir || fs.mkdir, opts.mkdirAsync = promisify(opts.mkdir), 
            opts.stat = opts.stat || opts.fs.stat || fs.stat, opts.statAsync = promisify(opts.stat), 
            opts.statSync = opts.statSync || opts.fs.statSync || fs.statSync, opts.mkdirSync = opts.mkdirSync || opts.fs.mkdirSync || fs.mkdirSync, 
            opts;
        };
    },
    7394: (module, __unused_webpack_exports, __webpack_require__) => {
        const platform = process.env.__TESTING_MKDIRP_PLATFORM__ || process.platform, {resolve, parse} = __webpack_require__(4822);
        module.exports = path => {
            if (/\0/.test(path)) throw Object.assign(new TypeError("path must be a string without null bytes"), {
                path,
                code: "ERR_INVALID_ARG_VALUE"
            });
            if (path = resolve(path), "win32" === platform) {
                const badWinChars = /[*|"<>?:]/, {root} = parse(path);
                if (badWinChars.test(path.substr(root.length))) throw Object.assign(new Error("Illegal characters in path."), {
                    path,
                    code: "EINVAL"
                });
            }
            return path;
        };
    },
    6631: (module, __unused_webpack_exports, __webpack_require__) => {
        const fs = __webpack_require__(7147), versArr = (process.env.__TESTING_MKDIRP_NODE_VERSION__ || process.version).replace(/^v/, "").split("."), hasNative = +versArr[0] > 10 || 10 == +versArr[0] && +versArr[1] >= 12, useNative = hasNative ? opts => opts.mkdir === fs.mkdir : () => !1, useNativeSync = hasNative ? opts => opts.mkdirSync === fs.mkdirSync : () => !1;
        module.exports = {
            useNative,
            useNativeSync
        };
    },
    156: (module, __unused_webpack_exports, __webpack_require__) => {
        var process = global.process;
        const processOk = function(process) {
            return process && "object" == typeof process && "function" == typeof process.removeListener && "function" == typeof process.emit && "function" == typeof process.reallyExit && "function" == typeof process.listeners && "function" == typeof process.kill && "number" == typeof process.pid && "function" == typeof process.on;
        };
        if (processOk(process)) {
            var emitter, assert = __webpack_require__(9491), signals = __webpack_require__(6107), isWin = /^win/i.test(process.platform), EE = __webpack_require__(2361);
            "function" != typeof EE && (EE = EE.EventEmitter), process.__signal_exit_emitter__ ? emitter = process.__signal_exit_emitter__ : ((emitter = process.__signal_exit_emitter__ = new EE).count = 0, 
            emitter.emitted = {}), emitter.infinite || (emitter.setMaxListeners(1 / 0), emitter.infinite = !0), 
            module.exports = function(cb, opts) {
                if (!processOk(global.process)) return function() {};
                assert.equal(typeof cb, "function", "a callback must be provided for exit handler"), 
                !1 === loaded && load();
                var ev = "exit";
                opts && opts.alwaysLast && (ev = "afterexit");
                return emitter.on(ev, cb), function() {
                    emitter.removeListener(ev, cb), 0 === emitter.listeners("exit").length && 0 === emitter.listeners("afterexit").length && unload();
                };
            };
            var unload = function() {
                loaded && processOk(global.process) && (loaded = !1, signals.forEach((function(sig) {
                    try {
                        process.removeListener(sig, sigListeners[sig]);
                    } catch (er) {}
                })), process.emit = originalProcessEmit, process.reallyExit = originalProcessReallyExit, 
                emitter.count -= 1);
            };
            module.exports.unload = unload;
            var emit = function(event, code, signal) {
                emitter.emitted[event] || (emitter.emitted[event] = !0, emitter.emit(event, code, signal));
            }, sigListeners = {};
            signals.forEach((function(sig) {
                sigListeners[sig] = function() {
                    processOk(global.process) && (process.listeners(sig).length === emitter.count && (unload(), 
                    emit("exit", null, sig), emit("afterexit", null, sig), isWin && "SIGHUP" === sig && (sig = "SIGINT"), 
                    process.kill(process.pid, sig)));
                };
            })), module.exports.signals = function() {
                return signals;
            };
            var loaded = !1, load = function() {
                !loaded && processOk(global.process) && (loaded = !0, emitter.count += 1, signals = signals.filter((function(sig) {
                    try {
                        return process.on(sig, sigListeners[sig]), !0;
                    } catch (er) {
                        return !1;
                    }
                })), process.emit = processEmit, process.reallyExit = processReallyExit);
            };
            module.exports.load = load;
            var originalProcessReallyExit = process.reallyExit, processReallyExit = function(code) {
                processOk(global.process) && (process.exitCode = code || 0, emit("exit", process.exitCode, null), 
                emit("afterexit", process.exitCode, null), originalProcessReallyExit.call(process, process.exitCode));
            }, originalProcessEmit = process.emit, processEmit = function(ev, arg) {
                if ("exit" === ev && processOk(global.process)) {
                    void 0 !== arg && (process.exitCode = arg);
                    var ret = originalProcessEmit.apply(this, arguments);
                    return emit("exit", process.exitCode, null), emit("afterexit", process.exitCode, null), 
                    ret;
                }
                return originalProcessEmit.apply(this, arguments);
            };
        } else module.exports = function() {
            return function() {};
        };
    },
    6107: module => {
        module.exports = [ "SIGABRT", "SIGALRM", "SIGHUP", "SIGINT", "SIGTERM" ], "win32" !== process.platform && module.exports.push("SIGVTALRM", "SIGXCPU", "SIGXFSZ", "SIGUSR2", "SIGTRAP", "SIGSYS", "SIGQUIT", "SIGIOT"), 
        "linux" === process.platform && module.exports.push("SIGIO", "SIGPOLL", "SIGPWR", "SIGSTKFLT", "SIGUNUSED");
    },
    1189: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        exports.c = exports.create = __webpack_require__(9540), exports.r = exports.replace = __webpack_require__(3666), 
        exports.t = exports.list = __webpack_require__(1090), exports.u = exports.update = __webpack_require__(4229), 
        exports.x = exports.extract = __webpack_require__(1372), exports.Pack = __webpack_require__(5843), 
        exports.Unpack = __webpack_require__(2864), exports.Parse = __webpack_require__(6234), 
        exports.ReadEntry = __webpack_require__(7847), exports.WriteEntry = __webpack_require__(8418), 
        exports.Header = __webpack_require__(5017), exports.Pax = __webpack_require__(9154), 
        exports.types = __webpack_require__(9806);
    },
    9540: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const hlo = __webpack_require__(7461), Pack = __webpack_require__(5843), fsm = __webpack_require__(8553), t = __webpack_require__(1090), path = __webpack_require__(4822);
        module.exports = (opt_, files, cb) => {
            if ("function" == typeof files && (cb = files), Array.isArray(opt_) && (files = opt_, 
            opt_ = {}), !files || !Array.isArray(files) || !files.length) throw new TypeError("no files or directories specified");
            files = Array.from(files);
            const opt = hlo(opt_);
            if (opt.sync && "function" == typeof cb) throw new TypeError("callback not supported for sync tar functions");
            if (!opt.file && "function" == typeof cb) throw new TypeError("callback only supported with file option");
            return opt.file && opt.sync ? createFileSync(opt, files) : opt.file ? createFile(opt, files, cb) : opt.sync ? createSync(opt, files) : create(opt, files);
        };
        const createFileSync = (opt, files) => {
            const p = new Pack.Sync(opt), stream = new fsm.WriteStreamSync(opt.file, {
                mode: opt.mode || 438
            });
            p.pipe(stream), addFilesSync(p, files);
        }, createFile = (opt, files, cb) => {
            const p = new Pack(opt), stream = new fsm.WriteStream(opt.file, {
                mode: opt.mode || 438
            });
            p.pipe(stream);
            const promise = new Promise(((res, rej) => {
                stream.on("error", rej), stream.on("close", res), p.on("error", rej);
            }));
            return addFilesAsync(p, files), cb ? promise.then(cb, cb) : promise;
        }, addFilesSync = (p, files) => {
            files.forEach((file => {
                "@" === file.charAt(0) ? t({
                    file: path.resolve(p.cwd, file.substr(1)),
                    sync: !0,
                    noResume: !0,
                    onentry: entry => p.add(entry)
                }) : p.add(file);
            })), p.end();
        }, addFilesAsync = (p, files) => {
            for (;files.length; ) {
                const file = files.shift();
                if ("@" === file.charAt(0)) return t({
                    file: path.resolve(p.cwd, file.substr(1)),
                    noResume: !0,
                    onentry: entry => p.add(entry)
                }).then((_ => addFilesAsync(p, files)));
                p.add(file);
            }
            p.end();
        }, createSync = (opt, files) => {
            const p = new Pack.Sync(opt);
            return addFilesSync(p, files), p;
        }, create = (opt, files) => {
            const p = new Pack(opt);
            return addFilesAsync(p, files), p;
        };
    },
    1372: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const hlo = __webpack_require__(7461), Unpack = __webpack_require__(2864), fs = __webpack_require__(7147), fsm = __webpack_require__(8553), path = __webpack_require__(4822), stripSlash = __webpack_require__(6401);
        module.exports = (opt_, files, cb) => {
            "function" == typeof opt_ ? (cb = opt_, files = null, opt_ = {}) : Array.isArray(opt_) && (files = opt_, 
            opt_ = {}), "function" == typeof files && (cb = files, files = null), files = files ? Array.from(files) : [];
            const opt = hlo(opt_);
            if (opt.sync && "function" == typeof cb) throw new TypeError("callback not supported for sync tar functions");
            if (!opt.file && "function" == typeof cb) throw new TypeError("callback only supported with file option");
            return files.length && filesFilter(opt, files), opt.file && opt.sync ? extractFileSync(opt) : opt.file ? extractFile(opt, cb) : opt.sync ? extractSync(opt) : extract(opt);
        };
        const filesFilter = (opt, files) => {
            const map = new Map(files.map((f => [ stripSlash(f), !0 ]))), filter = opt.filter, mapHas = (file, r) => {
                const root = r || path.parse(file).root || ".", ret = file !== root && (map.has(file) ? map.get(file) : mapHas(path.dirname(file), root));
                return map.set(file, ret), ret;
            };
            opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : file => mapHas(stripSlash(file));
        }, extractFileSync = opt => {
            const u = new Unpack.Sync(opt), file = opt.file, stat = fs.statSync(file), readSize = opt.maxReadSize || 16777216;
            new fsm.ReadStreamSync(file, {
                readSize,
                size: stat.size
            }).pipe(u);
        }, extractFile = (opt, cb) => {
            const u = new Unpack(opt), readSize = opt.maxReadSize || 16777216, file = opt.file, p = new Promise(((resolve, reject) => {
                u.on("error", reject), u.on("close", resolve), fs.stat(file, ((er, stat) => {
                    if (er) reject(er); else {
                        const stream = new fsm.ReadStream(file, {
                            readSize,
                            size: stat.size
                        });
                        stream.on("error", reject), stream.pipe(u);
                    }
                }));
            }));
            return cb ? p.then(cb, cb) : p;
        }, extractSync = opt => new Unpack.Sync(opt), extract = opt => new Unpack(opt);
    },
    8512: (module, __unused_webpack_exports, __webpack_require__) => {
        const isWindows = "win32" === (process.env.__FAKE_PLATFORM__ || process.platform), fs = global.__FAKE_TESTING_FS__ || __webpack_require__(7147), {O_CREAT, O_TRUNC, O_WRONLY, UV_FS_O_FILEMAP = 0} = fs.constants, fMapEnabled = isWindows && !!UV_FS_O_FILEMAP, fMapFlag = UV_FS_O_FILEMAP | O_TRUNC | O_CREAT | O_WRONLY;
        module.exports = fMapEnabled ? size => size < 524288 ? fMapFlag : "w" : () => "w";
    },
    5017: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const types = __webpack_require__(9806), pathModule = __webpack_require__(4822).posix, large = __webpack_require__(2795), SLURP = Symbol("slurp"), TYPE = Symbol("type");
        const splitPrefix = (p, prefixSize) => {
            let ret, pp = p, prefix = "";
            const root = pathModule.parse(p).root || ".";
            if (Buffer.byteLength(pp) < 100) ret = [ pp, prefix, !1 ]; else {
                prefix = pathModule.dirname(pp), pp = pathModule.basename(pp);
                do {
                    Buffer.byteLength(pp) <= 100 && Buffer.byteLength(prefix) <= prefixSize ? ret = [ pp, prefix, !1 ] : Buffer.byteLength(pp) > 100 && Buffer.byteLength(prefix) <= prefixSize ? ret = [ pp.substr(0, 99), prefix, !0 ] : (pp = pathModule.join(pathModule.basename(prefix), pp), 
                    prefix = pathModule.dirname(prefix));
                } while (prefix !== root && !ret);
                ret || (ret = [ p.substr(0, 99), "", !0 ]);
            }
            return ret;
        }, decString = (buf, off, size) => buf.slice(off, off + size).toString("utf8").replace(/\0.*/, ""), decDate = (buf, off, size) => numToDate(decNumber(buf, off, size)), numToDate = num => null === num ? null : new Date(1e3 * num), decNumber = (buf, off, size) => 128 & buf[off] ? large.parse(buf.slice(off, off + size)) : decSmallNumber(buf, off, size), decSmallNumber = (buf, off, size) => {
            return value = parseInt(buf.slice(off, off + size).toString("utf8").replace(/\0.*$/, "").trim(), 8), 
            isNaN(value) ? null : value;
            var value;
        }, MAXNUM = {
            12: 8589934591,
            8: 2097151
        }, encNumber = (buf, off, size, number) => null !== number && (number > MAXNUM[size] || number < 0 ? (large.encode(number, buf.slice(off, off + size)), 
        !0) : (encSmallNumber(buf, off, size, number), !1)), encSmallNumber = (buf, off, size, number) => buf.write(octalString(number, size), off, size, "ascii"), octalString = (number, size) => padOctal(Math.floor(number).toString(8), size), padOctal = (string, size) => (string.length === size - 1 ? string : new Array(size - string.length - 1).join("0") + string + " ") + "\0", encDate = (buf, off, size, date) => null !== date && encNumber(buf, off, size, date.getTime() / 1e3), NULLS = new Array(156).join("\0"), encString = (buf, off, size, string) => null !== string && (buf.write(string + NULLS, off, size, "utf8"), 
        string.length !== Buffer.byteLength(string) || string.length > size);
        module.exports = class {
            constructor(data, off, ex, gex) {
                this.cksumValid = !1, this.needPax = !1, this.nullBlock = !1, this.block = null, 
                this.path = null, this.mode = null, this.uid = null, this.gid = null, this.size = null, 
                this.mtime = null, this.cksum = null, this[TYPE] = "0", this.linkpath = null, this.uname = null, 
                this.gname = null, this.devmaj = 0, this.devmin = 0, this.atime = null, this.ctime = null, 
                Buffer.isBuffer(data) ? this.decode(data, off || 0, ex, gex) : data && this.set(data);
            }
            decode(buf, off, ex, gex) {
                if (off || (off = 0), !(buf && buf.length >= off + 512)) throw new Error("need 512 bytes for header");
                if (this.path = decString(buf, off, 100), this.mode = decNumber(buf, off + 100, 8), 
                this.uid = decNumber(buf, off + 108, 8), this.gid = decNumber(buf, off + 116, 8), 
                this.size = decNumber(buf, off + 124, 12), this.mtime = decDate(buf, off + 136, 12), 
                this.cksum = decNumber(buf, off + 148, 12), this[SLURP](ex), this[SLURP](gex, !0), 
                this[TYPE] = decString(buf, off + 156, 1), "" === this[TYPE] && (this[TYPE] = "0"), 
                "0" === this[TYPE] && "/" === this.path.substr(-1) && (this[TYPE] = "5"), "5" === this[TYPE] && (this.size = 0), 
                this.linkpath = decString(buf, off + 157, 100), "ustar\x0000" === buf.slice(off + 257, off + 265).toString()) if (this.uname = decString(buf, off + 265, 32), 
                this.gname = decString(buf, off + 297, 32), this.devmaj = decNumber(buf, off + 329, 8), 
                this.devmin = decNumber(buf, off + 337, 8), 0 !== buf[off + 475]) {
                    const prefix = decString(buf, off + 345, 155);
                    this.path = prefix + "/" + this.path;
                } else {
                    const prefix = decString(buf, off + 345, 130);
                    prefix && (this.path = prefix + "/" + this.path), this.atime = decDate(buf, off + 476, 12), 
                    this.ctime = decDate(buf, off + 488, 12);
                }
                let sum = 256;
                for (let i = off; i < off + 148; i++) sum += buf[i];
                for (let i = off + 156; i < off + 512; i++) sum += buf[i];
                this.cksumValid = sum === this.cksum, null === this.cksum && 256 === sum && (this.nullBlock = !0);
            }
            [SLURP](ex, global) {
                for (const k in ex) null === ex[k] || void 0 === ex[k] || global && "path" === k || (this[k] = ex[k]);
            }
            encode(buf, off) {
                if (buf || (buf = this.block = Buffer.alloc(512), off = 0), off || (off = 0), !(buf.length >= off + 512)) throw new Error("need 512 bytes for header");
                const prefixSize = this.ctime || this.atime ? 130 : 155, split = splitPrefix(this.path || "", prefixSize), path = split[0], prefix = split[1];
                this.needPax = split[2], this.needPax = encString(buf, off, 100, path) || this.needPax, 
                this.needPax = encNumber(buf, off + 100, 8, this.mode) || this.needPax, this.needPax = encNumber(buf, off + 108, 8, this.uid) || this.needPax, 
                this.needPax = encNumber(buf, off + 116, 8, this.gid) || this.needPax, this.needPax = encNumber(buf, off + 124, 12, this.size) || this.needPax, 
                this.needPax = encDate(buf, off + 136, 12, this.mtime) || this.needPax, buf[off + 156] = this[TYPE].charCodeAt(0), 
                this.needPax = encString(buf, off + 157, 100, this.linkpath) || this.needPax, buf.write("ustar\x0000", off + 257, 8), 
                this.needPax = encString(buf, off + 265, 32, this.uname) || this.needPax, this.needPax = encString(buf, off + 297, 32, this.gname) || this.needPax, 
                this.needPax = encNumber(buf, off + 329, 8, this.devmaj) || this.needPax, this.needPax = encNumber(buf, off + 337, 8, this.devmin) || this.needPax, 
                this.needPax = encString(buf, off + 345, prefixSize, prefix) || this.needPax, 0 !== buf[off + 475] ? this.needPax = encString(buf, off + 345, 155, prefix) || this.needPax : (this.needPax = encString(buf, off + 345, 130, prefix) || this.needPax, 
                this.needPax = encDate(buf, off + 476, 12, this.atime) || this.needPax, this.needPax = encDate(buf, off + 488, 12, this.ctime) || this.needPax);
                let sum = 256;
                for (let i = off; i < off + 148; i++) sum += buf[i];
                for (let i = off + 156; i < off + 512; i++) sum += buf[i];
                return this.cksum = sum, encNumber(buf, off + 148, 8, this.cksum), this.cksumValid = !0, 
                this.needPax;
            }
            set(data) {
                for (const i in data) null !== data[i] && void 0 !== data[i] && (this[i] = data[i]);
            }
            get type() {
                return types.name.get(this[TYPE]) || this[TYPE];
            }
            get typeKey() {
                return this[TYPE];
            }
            set type(type) {
                types.code.has(type) ? this[TYPE] = types.code.get(type) : this[TYPE] = type;
            }
        };
    },
    7461: module => {
        "use strict";
        const argmap = new Map([ [ "C", "cwd" ], [ "f", "file" ], [ "z", "gzip" ], [ "P", "preservePaths" ], [ "U", "unlink" ], [ "strip-components", "strip" ], [ "stripComponents", "strip" ], [ "keep-newer", "newer" ], [ "keepNewer", "newer" ], [ "keep-newer-files", "newer" ], [ "keepNewerFiles", "newer" ], [ "k", "keep" ], [ "keep-existing", "keep" ], [ "keepExisting", "keep" ], [ "m", "noMtime" ], [ "no-mtime", "noMtime" ], [ "p", "preserveOwner" ], [ "L", "follow" ], [ "h", "follow" ] ]);
        module.exports = opt => opt ? Object.keys(opt).map((k => [ argmap.has(k) ? argmap.get(k) : k, opt[k] ])).reduce(((set, kv) => (set[kv[0]] = kv[1], 
        set)), Object.create(null)) : {};
    },
    2795: module => {
        "use strict";
        const encodePositive = (num, buf) => {
            buf[0] = 128;
            for (var i = buf.length; i > 1; i--) buf[i - 1] = 255 & num, num = Math.floor(num / 256);
        }, encodeNegative = (num, buf) => {
            buf[0] = 255;
            var flipped = !1;
            num *= -1;
            for (var i = buf.length; i > 1; i--) {
                var byte = 255 & num;
                num = Math.floor(num / 256), flipped ? buf[i - 1] = onesComp(byte) : 0 === byte ? buf[i - 1] = 0 : (flipped = !0, 
                buf[i - 1] = twosComp(byte));
            }
        }, twos = buf => {
            for (var len = buf.length, sum = 0, flipped = !1, i = len - 1; i > -1; i--) {
                var f, byte = buf[i];
                flipped ? f = onesComp(byte) : 0 === byte ? f = byte : (flipped = !0, f = twosComp(byte)), 
                0 !== f && (sum -= f * Math.pow(256, len - i - 1));
            }
            return sum;
        }, pos = buf => {
            for (var len = buf.length, sum = 0, i = len - 1; i > -1; i--) {
                var byte = buf[i];
                0 !== byte && (sum += byte * Math.pow(256, len - i - 1));
            }
            return sum;
        }, onesComp = byte => 255 & (255 ^ byte), twosComp = byte => 1 + (255 ^ byte) & 255;
        module.exports = {
            encode: (num, buf) => {
                if (!Number.isSafeInteger(num)) throw Error("cannot encode number outside of javascript safe integer range");
                return num < 0 ? encodeNegative(num, buf) : encodePositive(num, buf), buf;
            },
            parse: buf => {
                const pre = buf[0], value = 128 === pre ? pos(buf.slice(1, buf.length)) : 255 === pre ? twos(buf) : null;
                if (null === value) throw Error("invalid base256 encoding");
                if (!Number.isSafeInteger(value)) throw Error("parsed number outside of javascript safe integer range");
                return value;
            }
        };
    },
    1090: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const hlo = __webpack_require__(7461), Parser = __webpack_require__(6234), fs = __webpack_require__(7147), fsm = __webpack_require__(8553), path = __webpack_require__(4822), stripSlash = __webpack_require__(6401);
        module.exports = (opt_, files, cb) => {
            "function" == typeof opt_ ? (cb = opt_, files = null, opt_ = {}) : Array.isArray(opt_) && (files = opt_, 
            opt_ = {}), "function" == typeof files && (cb = files, files = null), files = files ? Array.from(files) : [];
            const opt = hlo(opt_);
            if (opt.sync && "function" == typeof cb) throw new TypeError("callback not supported for sync tar functions");
            if (!opt.file && "function" == typeof cb) throw new TypeError("callback only supported with file option");
            return files.length && filesFilter(opt, files), opt.noResume || onentryFunction(opt), 
            opt.file && opt.sync ? listFileSync(opt) : opt.file ? listFile(opt, cb) : list(opt);
        };
        const onentryFunction = opt => {
            const onentry = opt.onentry;
            opt.onentry = onentry ? e => {
                onentry(e), e.resume();
            } : e => e.resume();
        }, filesFilter = (opt, files) => {
            const map = new Map(files.map((f => [ stripSlash(f), !0 ]))), filter = opt.filter, mapHas = (file, r) => {
                const root = r || path.parse(file).root || ".", ret = file !== root && (map.has(file) ? map.get(file) : mapHas(path.dirname(file), root));
                return map.set(file, ret), ret;
            };
            opt.filter = filter ? (file, entry) => filter(file, entry) && mapHas(stripSlash(file)) : file => mapHas(stripSlash(file));
        }, listFileSync = opt => {
            const p = list(opt), file = opt.file;
            let fd, threw = !0;
            try {
                const stat = fs.statSync(file), readSize = opt.maxReadSize || 16777216;
                if (stat.size < readSize) p.end(fs.readFileSync(file)); else {
                    let pos = 0;
                    const buf = Buffer.allocUnsafe(readSize);
                    for (fd = fs.openSync(file, "r"); pos < stat.size; ) {
                        const bytesRead = fs.readSync(fd, buf, 0, readSize, pos);
                        pos += bytesRead, p.write(buf.slice(0, bytesRead));
                    }
                    p.end();
                }
                threw = !1;
            } finally {
                if (threw && fd) try {
                    fs.closeSync(fd);
                } catch (er) {}
            }
        }, listFile = (opt, cb) => {
            const parse = new Parser(opt), readSize = opt.maxReadSize || 16777216, file = opt.file, p = new Promise(((resolve, reject) => {
                parse.on("error", reject), parse.on("end", resolve), fs.stat(file, ((er, stat) => {
                    if (er) reject(er); else {
                        const stream = new fsm.ReadStream(file, {
                            readSize,
                            size: stat.size
                        });
                        stream.on("error", reject), stream.pipe(parse);
                    }
                }));
            }));
            return cb ? p.then(cb, cb) : p;
        }, list = opt => new Parser(opt);
    },
    3956: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const mkdirp = __webpack_require__(3179), fs = __webpack_require__(7147), path = __webpack_require__(4822), chownr = __webpack_require__(2047), normPath = __webpack_require__(4240);
        class SymlinkError extends Error {
            constructor(symlink, path) {
                super("Cannot extract through symbolic link"), this.path = path, this.symlink = symlink;
            }
            get name() {
                return "SylinkError";
            }
        }
        class CwdError extends Error {
            constructor(path, code) {
                super(code + ": Cannot cd into '" + path + "'"), this.path = path, this.code = code;
            }
            get name() {
                return "CwdError";
            }
        }
        const cGet = (cache, key) => cache.get(normPath(key)), cSet = (cache, key, val) => cache.set(normPath(key), val);
        module.exports = (dir, opt, cb) => {
            dir = normPath(dir);
            const umask = opt.umask, mode = 448 | opt.mode, needChmod = 0 != (mode & umask), uid = opt.uid, gid = opt.gid, doChown = "number" == typeof uid && "number" == typeof gid && (uid !== opt.processUid || gid !== opt.processGid), preserve = opt.preserve, unlink = opt.unlink, cache = opt.cache, cwd = normPath(opt.cwd), done = (er, created) => {
                er ? cb(er) : (cSet(cache, dir, !0), created && doChown ? chownr(created, uid, gid, (er => done(er))) : needChmod ? fs.chmod(dir, mode, cb) : cb());
            };
            if (cache && !0 === cGet(cache, dir)) return done();
            if (dir === cwd) return ((dir, cb) => {
                fs.stat(dir, ((er, st) => {
                    !er && st.isDirectory() || (er = new CwdError(dir, er && er.code || "ENOTDIR")), 
                    cb(er);
                }));
            })(dir, done);
            if (preserve) return mkdirp(dir, {
                mode
            }).then((made => done(null, made)), done);
            const parts = normPath(path.relative(cwd, dir)).split("/");
            mkdir_(cwd, parts, mode, cache, unlink, cwd, null, done);
        };
        const mkdir_ = (base, parts, mode, cache, unlink, cwd, created, cb) => {
            if (!parts.length) return cb(null, created);
            const p = parts.shift(), part = normPath(path.resolve(base + "/" + p));
            if (cGet(cache, part)) return mkdir_(part, parts, mode, cache, unlink, cwd, created, cb);
            fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
        }, onmkdir = (part, parts, mode, cache, unlink, cwd, created, cb) => er => {
            er ? fs.lstat(part, ((statEr, st) => {
                if (statEr) statEr.path = statEr.path && normPath(statEr.path), cb(statEr); else if (st.isDirectory()) mkdir_(part, parts, mode, cache, unlink, cwd, created, cb); else if (unlink) fs.unlink(part, (er => {
                    if (er) return cb(er);
                    fs.mkdir(part, mode, onmkdir(part, parts, mode, cache, unlink, cwd, created, cb));
                })); else {
                    if (st.isSymbolicLink()) return cb(new SymlinkError(part, part + "/" + parts.join("/")));
                    cb(er);
                }
            })) : mkdir_(part, parts, mode, cache, unlink, cwd, created = created || part, cb);
        };
        module.exports.sync = (dir, opt) => {
            dir = normPath(dir);
            const umask = opt.umask, mode = 448 | opt.mode, needChmod = 0 != (mode & umask), uid = opt.uid, gid = opt.gid, doChown = "number" == typeof uid && "number" == typeof gid && (uid !== opt.processUid || gid !== opt.processGid), preserve = opt.preserve, unlink = opt.unlink, cache = opt.cache, cwd = normPath(opt.cwd), done = created => {
                cSet(cache, dir, !0), created && doChown && chownr.sync(created, uid, gid), needChmod && fs.chmodSync(dir, mode);
            };
            if (cache && !0 === cGet(cache, dir)) return done();
            if (dir === cwd) return (dir => {
                let ok = !1, code = "ENOTDIR";
                try {
                    ok = fs.statSync(dir).isDirectory();
                } catch (er) {
                    code = er.code;
                } finally {
                    if (!ok) throw new CwdError(dir, code);
                }
            })(cwd), done();
            if (preserve) return done(mkdirp.sync(dir, mode));
            const parts = normPath(path.relative(cwd, dir)).split("/");
            let created = null;
            for (let p = parts.shift(), part = cwd; p && (part += "/" + p); p = parts.shift()) if (part = normPath(path.resolve(part)), 
            !cGet(cache, part)) try {
                fs.mkdirSync(part, mode), created = created || part, cSet(cache, part, !0);
            } catch (er) {
                const st = fs.lstatSync(part);
                if (st.isDirectory()) {
                    cSet(cache, part, !0);
                    continue;
                }
                if (unlink) {
                    fs.unlinkSync(part), fs.mkdirSync(part, mode), created = created || part, cSet(cache, part, !0);
                    continue;
                }
                if (st.isSymbolicLink()) return new SymlinkError(part, part + "/" + parts.join("/"));
            }
            return done(created);
        };
    },
    9574: module => {
        "use strict";
        module.exports = (mode, isDir, portable) => (mode &= 4095, portable && (mode = -19 & (384 | mode)), 
        isDir && (256 & mode && (mode |= 64), 32 & mode && (mode |= 8), 4 & mode && (mode |= 1)), 
        mode);
    },
    1645: module => {
        const normalizeCache = Object.create(null), {hasOwnProperty} = Object.prototype;
        module.exports = s => (hasOwnProperty.call(normalizeCache, s) || (normalizeCache[s] = s.normalize("NFKD")), 
        normalizeCache[s]);
    },
    4240: module => {
        const platform = process.env.TESTING_TAR_FAKE_PLATFORM || process.platform;
        module.exports = "win32" !== platform ? p => p : p => p && p.replace(/\\/g, "/");
    },
    5843: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        class PackJob {
            constructor(path, absolute) {
                this.path = path || "./", this.absolute = absolute, this.entry = null, this.stat = null, 
                this.readdir = null, this.pending = !1, this.ignore = !1, this.piped = !1;
            }
        }
        const MiniPass = __webpack_require__(2253), zlib = __webpack_require__(3704), ReadEntry = __webpack_require__(7847), WriteEntry = __webpack_require__(8418), WriteEntrySync = WriteEntry.Sync, WriteEntryTar = WriteEntry.Tar, Yallist = __webpack_require__(1455), EOF = Buffer.alloc(1024), ONSTAT = Symbol("onStat"), ENDED = Symbol("ended"), QUEUE = Symbol("queue"), CURRENT = Symbol("current"), PROCESS = Symbol("process"), PROCESSING = Symbol("processing"), PROCESSJOB = Symbol("processJob"), JOBS = Symbol("jobs"), JOBDONE = Symbol("jobDone"), ADDFSENTRY = Symbol("addFSEntry"), ADDTARENTRY = Symbol("addTarEntry"), STAT = Symbol("stat"), READDIR = Symbol("readdir"), ONREADDIR = Symbol("onreaddir"), PIPE = Symbol("pipe"), ENTRY = Symbol("entry"), ENTRYOPT = Symbol("entryOpt"), WRITEENTRYCLASS = Symbol("writeEntryClass"), WRITE = Symbol("write"), ONDRAIN = Symbol("ondrain"), fs = __webpack_require__(7147), path = __webpack_require__(4822), warner = __webpack_require__(8783), normPath = __webpack_require__(4240), Pack = warner(class extends MiniPass {
            constructor(opt) {
                super(opt), opt = opt || Object.create(null), this.opt = opt, this.file = opt.file || "", 
                this.cwd = opt.cwd || process.cwd(), this.maxReadSize = opt.maxReadSize, this.preservePaths = !!opt.preservePaths, 
                this.strict = !!opt.strict, this.noPax = !!opt.noPax, this.prefix = normPath(opt.prefix || ""), 
                this.linkCache = opt.linkCache || new Map, this.statCache = opt.statCache || new Map, 
                this.readdirCache = opt.readdirCache || new Map, this[WRITEENTRYCLASS] = WriteEntry, 
                "function" == typeof opt.onwarn && this.on("warn", opt.onwarn), this.portable = !!opt.portable, 
                this.zip = null, opt.gzip ? ("object" != typeof opt.gzip && (opt.gzip = {}), this.portable && (opt.gzip.portable = !0), 
                this.zip = new zlib.Gzip(opt.gzip), this.zip.on("data", (chunk => super.write(chunk))), 
                this.zip.on("end", (_ => super.end())), this.zip.on("drain", (_ => this[ONDRAIN]())), 
                this.on("resume", (_ => this.zip.resume()))) : this.on("drain", this[ONDRAIN]), 
                this.noDirRecurse = !!opt.noDirRecurse, this.follow = !!opt.follow, this.noMtime = !!opt.noMtime, 
                this.mtime = opt.mtime || null, this.filter = "function" == typeof opt.filter ? opt.filter : _ => !0, 
                this[QUEUE] = new Yallist, this[JOBS] = 0, this.jobs = +opt.jobs || 4, this[PROCESSING] = !1, 
                this[ENDED] = !1;
            }
            [WRITE](chunk) {
                return super.write(chunk);
            }
            add(path) {
                return this.write(path), this;
            }
            end(path) {
                return path && this.write(path), this[ENDED] = !0, this[PROCESS](), this;
            }
            write(path) {
                if (this[ENDED]) throw new Error("write after end");
                return path instanceof ReadEntry ? this[ADDTARENTRY](path) : this[ADDFSENTRY](path), 
                this.flowing;
            }
            [ADDTARENTRY](p) {
                const absolute = normPath(path.resolve(this.cwd, p.path));
                if (this.filter(p.path, p)) {
                    const job = new PackJob(p.path, absolute, !1);
                    job.entry = new WriteEntryTar(p, this[ENTRYOPT](job)), job.entry.on("end", (_ => this[JOBDONE](job))), 
                    this[JOBS] += 1, this[QUEUE].push(job);
                } else p.resume();
                this[PROCESS]();
            }
            [ADDFSENTRY](p) {
                const absolute = normPath(path.resolve(this.cwd, p));
                this[QUEUE].push(new PackJob(p, absolute)), this[PROCESS]();
            }
            [STAT](job) {
                job.pending = !0, this[JOBS] += 1;
                const stat = this.follow ? "stat" : "lstat";
                fs[stat](job.absolute, ((er, stat) => {
                    job.pending = !1, this[JOBS] -= 1, er ? this.emit("error", er) : this[ONSTAT](job, stat);
                }));
            }
            [ONSTAT](job, stat) {
                this.statCache.set(job.absolute, stat), job.stat = stat, this.filter(job.path, stat) || (job.ignore = !0), 
                this[PROCESS]();
            }
            [READDIR](job) {
                job.pending = !0, this[JOBS] += 1, fs.readdir(job.absolute, ((er, entries) => {
                    if (job.pending = !1, this[JOBS] -= 1, er) return this.emit("error", er);
                    this[ONREADDIR](job, entries);
                }));
            }
            [ONREADDIR](job, entries) {
                this.readdirCache.set(job.absolute, entries), job.readdir = entries, this[PROCESS]();
            }
            [PROCESS]() {
                if (!this[PROCESSING]) {
                    this[PROCESSING] = !0;
                    for (let w = this[QUEUE].head; null !== w && this[JOBS] < this.jobs; w = w.next) if (this[PROCESSJOB](w.value), 
                    w.value.ignore) {
                        const p = w.next;
                        this[QUEUE].removeNode(w), w.next = p;
                    }
                    this[PROCESSING] = !1, this[ENDED] && !this[QUEUE].length && 0 === this[JOBS] && (this.zip ? this.zip.end(EOF) : (super.write(EOF), 
                    super.end()));
                }
            }
            get [CURRENT]() {
                return this[QUEUE] && this[QUEUE].head && this[QUEUE].head.value;
            }
            [JOBDONE](job) {
                this[QUEUE].shift(), this[JOBS] -= 1, this[PROCESS]();
            }
            [PROCESSJOB](job) {
                job.pending || (job.entry ? job !== this[CURRENT] || job.piped || this[PIPE](job) : (job.stat || (this.statCache.has(job.absolute) ? this[ONSTAT](job, this.statCache.get(job.absolute)) : this[STAT](job)), 
                job.stat && (job.ignore || (this.noDirRecurse || !job.stat.isDirectory() || job.readdir || (this.readdirCache.has(job.absolute) ? this[ONREADDIR](job, this.readdirCache.get(job.absolute)) : this[READDIR](job), 
                job.readdir)) && (job.entry = this[ENTRY](job), job.entry ? job !== this[CURRENT] || job.piped || this[PIPE](job) : job.ignore = !0))));
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
                    return new this[WRITEENTRYCLASS](job.path, this[ENTRYOPT](job)).on("end", (() => this[JOBDONE](job))).on("error", (er => this.emit("error", er)));
                } catch (er) {
                    this.emit("error", er);
                }
            }
            [ONDRAIN]() {
                this[CURRENT] && this[CURRENT].entry && this[CURRENT].entry.resume();
            }
            [PIPE](job) {
                job.piped = !0, job.readdir && job.readdir.forEach((entry => {
                    const p = job.path, base = "./" === p ? "" : p.replace(/\/*$/, "/");
                    this[ADDFSENTRY](base + entry);
                }));
                const source = job.entry, zip = this.zip;
                zip ? source.on("data", (chunk => {
                    zip.write(chunk) || source.pause();
                })) : source.on("data", (chunk => {
                    super.write(chunk) || source.pause();
                }));
            }
            pause() {
                return this.zip && this.zip.pause(), super.pause();
            }
        });
        Pack.Sync = class extends Pack {
            constructor(opt) {
                super(opt), this[WRITEENTRYCLASS] = WriteEntrySync;
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
                const source = job.entry, zip = this.zip;
                job.readdir && job.readdir.forEach((entry => {
                    const p = job.path, base = "./" === p ? "" : p.replace(/\/*$/, "/");
                    this[ADDFSENTRY](base + entry);
                })), zip ? source.on("data", (chunk => {
                    zip.write(chunk);
                })) : source.on("data", (chunk => {
                    super[WRITE](chunk);
                }));
            }
        }, module.exports = Pack;
    },
    6234: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const warner = __webpack_require__(8783), Header = __webpack_require__(5017), EE = __webpack_require__(2361), Yallist = __webpack_require__(1455), Entry = __webpack_require__(7847), Pax = __webpack_require__(9154), zlib = __webpack_require__(3704), gzipHeader = Buffer.from([ 31, 139 ]), STATE = Symbol("state"), WRITEENTRY = Symbol("writeEntry"), READENTRY = Symbol("readEntry"), NEXTENTRY = Symbol("nextEntry"), PROCESSENTRY = Symbol("processEntry"), EX = Symbol("extendedHeader"), GEX = Symbol("globalExtendedHeader"), META = Symbol("meta"), EMITMETA = Symbol("emitMeta"), BUFFER = Symbol("buffer"), QUEUE = Symbol("queue"), ENDED = Symbol("ended"), EMITTEDEND = Symbol("emittedEnd"), EMIT = Symbol("emit"), UNZIP = Symbol("unzip"), CONSUMECHUNK = Symbol("consumeChunk"), CONSUMECHUNKSUB = Symbol("consumeChunkSub"), CONSUMEBODY = Symbol("consumeBody"), CONSUMEMETA = Symbol("consumeMeta"), CONSUMEHEADER = Symbol("consumeHeader"), CONSUMING = Symbol("consuming"), BUFFERCONCAT = Symbol("bufferConcat"), MAYBEEND = Symbol("maybeEnd"), WRITING = Symbol("writing"), ABORTED = Symbol("aborted"), DONE = Symbol("onDone"), SAW_VALID_ENTRY = Symbol("sawValidEntry"), SAW_NULL_BLOCK = Symbol("sawNullBlock"), SAW_EOF = Symbol("sawEOF"), noop = _ => !0;
        module.exports = warner(class extends EE {
            constructor(opt) {
                super(opt = opt || {}), this.file = opt.file || "", this[SAW_VALID_ENTRY] = null, 
                this.on(DONE, (_ => {
                    "begin" !== this[STATE] && !1 !== this[SAW_VALID_ENTRY] || this.warn("TAR_BAD_ARCHIVE", "Unrecognized archive format");
                })), opt.ondone ? this.on(DONE, opt.ondone) : this.on(DONE, (_ => {
                    this.emit("prefinish"), this.emit("finish"), this.emit("end"), this.emit("close");
                })), this.strict = !!opt.strict, this.maxMetaEntrySize = opt.maxMetaEntrySize || 1048576, 
                this.filter = "function" == typeof opt.filter ? opt.filter : noop, this.writable = !0, 
                this.readable = !1, this[QUEUE] = new Yallist, this[BUFFER] = null, this[READENTRY] = null, 
                this[WRITEENTRY] = null, this[STATE] = "begin", this[META] = "", this[EX] = null, 
                this[GEX] = null, this[ENDED] = !1, this[UNZIP] = null, this[ABORTED] = !1, this[SAW_NULL_BLOCK] = !1, 
                this[SAW_EOF] = !1, "function" == typeof opt.onwarn && this.on("warn", opt.onwarn), 
                "function" == typeof opt.onentry && this.on("entry", opt.onentry);
            }
            [CONSUMEHEADER](chunk, position) {
                let header;
                null === this[SAW_VALID_ENTRY] && (this[SAW_VALID_ENTRY] = !1);
                try {
                    header = new Header(chunk, position, this[EX], this[GEX]);
                } catch (er) {
                    return this.warn("TAR_ENTRY_INVALID", er);
                }
                if (header.nullBlock) this[SAW_NULL_BLOCK] ? (this[SAW_EOF] = !0, "begin" === this[STATE] && (this[STATE] = "header"), 
                this[EMIT]("eof")) : (this[SAW_NULL_BLOCK] = !0, this[EMIT]("nullBlock")); else if (this[SAW_NULL_BLOCK] = !1, 
                header.cksumValid) if (header.path) {
                    const type = header.type;
                    if (/^(Symbolic)?Link$/.test(type) && !header.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath required", {
                        header
                    }); else if (!/^(Symbolic)?Link$/.test(type) && header.linkpath) this.warn("TAR_ENTRY_INVALID", "linkpath forbidden", {
                        header
                    }); else {
                        const entry = this[WRITEENTRY] = new Entry(header, this[EX], this[GEX]);
                        if (!this[SAW_VALID_ENTRY]) if (entry.remain) {
                            const onend = () => {
                                entry.invalid || (this[SAW_VALID_ENTRY] = !0);
                            };
                            entry.on("end", onend);
                        } else this[SAW_VALID_ENTRY] = !0;
                        entry.meta ? entry.size > this.maxMetaEntrySize ? (entry.ignore = !0, this[EMIT]("ignoredEntry", entry), 
                        this[STATE] = "ignore", entry.resume()) : entry.size > 0 && (this[META] = "", entry.on("data", (c => this[META] += c)), 
                        this[STATE] = "meta") : (this[EX] = null, entry.ignore = entry.ignore || !this.filter(entry.path, entry), 
                        entry.ignore ? (this[EMIT]("ignoredEntry", entry), this[STATE] = entry.remain ? "ignore" : "header", 
                        entry.resume()) : (entry.remain ? this[STATE] = "body" : (this[STATE] = "header", 
                        entry.end()), this[READENTRY] ? this[QUEUE].push(entry) : (this[QUEUE].push(entry), 
                        this[NEXTENTRY]())));
                    }
                } else this.warn("TAR_ENTRY_INVALID", "path is required", {
                    header
                }); else this.warn("TAR_ENTRY_INVALID", "checksum failure", {
                    header
                });
            }
            [PROCESSENTRY](entry) {
                let go = !0;
                return entry ? Array.isArray(entry) ? this.emit.apply(this, entry) : (this[READENTRY] = entry, 
                this.emit("entry", entry), entry.emittedEnd || (entry.on("end", (_ => this[NEXTENTRY]())), 
                go = !1)) : (this[READENTRY] = null, go = !1), go;
            }
            [NEXTENTRY]() {
                do {} while (this[PROCESSENTRY](this[QUEUE].shift()));
                if (!this[QUEUE].length) {
                    const re = this[READENTRY];
                    !re || re.flowing || re.size === re.remain ? this[WRITING] || this.emit("drain") : re.once("drain", (_ => this.emit("drain")));
                }
            }
            [CONSUMEBODY](chunk, position) {
                const entry = this[WRITEENTRY], br = entry.blockRemain, c = br >= chunk.length && 0 === position ? chunk : chunk.slice(position, position + br);
                return entry.write(c), entry.blockRemain || (this[STATE] = "header", this[WRITEENTRY] = null, 
                entry.end()), c.length;
            }
            [CONSUMEMETA](chunk, position) {
                const entry = this[WRITEENTRY], ret = this[CONSUMEBODY](chunk, position);
                return this[WRITEENTRY] || this[EMITMETA](entry), ret;
            }
            [EMIT](ev, data, extra) {
                this[QUEUE].length || this[READENTRY] ? this[QUEUE].push([ ev, data, extra ]) : this.emit(ev, data, extra);
            }
            [EMITMETA](entry) {
                switch (this[EMIT]("meta", this[META]), entry.type) {
                  case "ExtendedHeader":
                  case "OldExtendedHeader":
                    this[EX] = Pax.parse(this[META], this[EX], !1);
                    break;

                  case "GlobalExtendedHeader":
                    this[GEX] = Pax.parse(this[META], this[GEX], !0);
                    break;

                  case "NextFileHasLongPath":
                  case "OldGnuLongPath":
                    this[EX] = this[EX] || Object.create(null), this[EX].path = this[META].replace(/\0.*/, "");
                    break;

                  case "NextFileHasLongLinkpath":
                    this[EX] = this[EX] || Object.create(null), this[EX].linkpath = this[META].replace(/\0.*/, "");
                    break;

                  default:
                    throw new Error("unknown meta: " + entry.type);
                }
            }
            abort(error) {
                this[ABORTED] = !0, this.emit("abort", error), this.warn("TAR_ABORT", error, {
                    recoverable: !1
                });
            }
            write(chunk) {
                if (this[ABORTED]) return;
                if (null === this[UNZIP] && chunk) {
                    if (this[BUFFER] && (chunk = Buffer.concat([ this[BUFFER], chunk ]), this[BUFFER] = null), 
                    chunk.length < gzipHeader.length) return this[BUFFER] = chunk, !0;
                    for (let i = 0; null === this[UNZIP] && i < gzipHeader.length; i++) chunk[i] !== gzipHeader[i] && (this[UNZIP] = !1);
                    if (null === this[UNZIP]) {
                        const ended = this[ENDED];
                        this[ENDED] = !1, this[UNZIP] = new zlib.Unzip, this[UNZIP].on("data", (chunk => this[CONSUMECHUNK](chunk))), 
                        this[UNZIP].on("error", (er => this.abort(er))), this[UNZIP].on("end", (_ => {
                            this[ENDED] = !0, this[CONSUMECHUNK]();
                        })), this[WRITING] = !0;
                        const ret = this[UNZIP][ended ? "end" : "write"](chunk);
                        return this[WRITING] = !1, ret;
                    }
                }
                this[WRITING] = !0, this[UNZIP] ? this[UNZIP].write(chunk) : this[CONSUMECHUNK](chunk), 
                this[WRITING] = !1;
                const ret = !this[QUEUE].length && (!this[READENTRY] || this[READENTRY].flowing);
                return ret || this[QUEUE].length || this[READENTRY].once("drain", (_ => this.emit("drain"))), 
                ret;
            }
            [BUFFERCONCAT](c) {
                c && !this[ABORTED] && (this[BUFFER] = this[BUFFER] ? Buffer.concat([ this[BUFFER], c ]) : c);
            }
            [MAYBEEND]() {
                if (this[ENDED] && !this[EMITTEDEND] && !this[ABORTED] && !this[CONSUMING]) {
                    this[EMITTEDEND] = !0;
                    const entry = this[WRITEENTRY];
                    if (entry && entry.blockRemain) {
                        const have = this[BUFFER] ? this[BUFFER].length : 0;
                        this.warn("TAR_BAD_ARCHIVE", `Truncated input (needed ${entry.blockRemain} more bytes, only ${have} available)`, {
                            entry
                        }), this[BUFFER] && entry.write(this[BUFFER]), entry.end();
                    }
                    this[EMIT](DONE);
                }
            }
            [CONSUMECHUNK](chunk) {
                if (this[CONSUMING]) this[BUFFERCONCAT](chunk); else if (chunk || this[BUFFER]) {
                    if (this[CONSUMING] = !0, this[BUFFER]) {
                        this[BUFFERCONCAT](chunk);
                        const c = this[BUFFER];
                        this[BUFFER] = null, this[CONSUMECHUNKSUB](c);
                    } else this[CONSUMECHUNKSUB](chunk);
                    for (;this[BUFFER] && this[BUFFER].length >= 512 && !this[ABORTED] && !this[SAW_EOF]; ) {
                        const c = this[BUFFER];
                        this[BUFFER] = null, this[CONSUMECHUNKSUB](c);
                    }
                    this[CONSUMING] = !1;
                } else this[MAYBEEND]();
                this[BUFFER] && !this[ENDED] || this[MAYBEEND]();
            }
            [CONSUMECHUNKSUB](chunk) {
                let position = 0;
                const length = chunk.length;
                for (;position + 512 <= length && !this[ABORTED] && !this[SAW_EOF]; ) switch (this[STATE]) {
                  case "begin":
                  case "header":
                    this[CONSUMEHEADER](chunk, position), position += 512;
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
                position < length && (this[BUFFER] ? this[BUFFER] = Buffer.concat([ chunk.slice(position), this[BUFFER] ]) : this[BUFFER] = chunk.slice(position));
            }
            end(chunk) {
                this[ABORTED] || (this[UNZIP] ? this[UNZIP].end(chunk) : (this[ENDED] = !0, this.write(chunk)));
            }
        });
    },
    7119: (module, __unused_webpack_exports, __webpack_require__) => {
        const assert = __webpack_require__(9491), normalize = __webpack_require__(1645), stripSlashes = __webpack_require__(6401), {join} = __webpack_require__(4822), isWindows = "win32" === (process.env.TESTING_TAR_FAKE_PLATFORM || process.platform);
        module.exports = () => {
            const queues = new Map, reservations = new Map, running = new Set, check = fn => {
                const {paths, dirs} = (fn => {
                    const res = reservations.get(fn);
                    if (!res) throw new Error("function does not have any path reservations");
                    return {
                        paths: res.paths.map((path => queues.get(path))),
                        dirs: [ ...res.dirs ].map((path => queues.get(path)))
                    };
                })(fn);
                return paths.every((q => q[0] === fn)) && dirs.every((q => q[0] instanceof Set && q[0].has(fn)));
            }, run = fn => !(running.has(fn) || !check(fn)) && (running.add(fn), fn((() => clear(fn))), 
            !0), clear = fn => {
                if (!running.has(fn)) return !1;
                const {paths, dirs} = reservations.get(fn), next = new Set;
                return paths.forEach((path => {
                    const q = queues.get(path);
                    assert.equal(q[0], fn), 1 === q.length ? queues.delete(path) : (q.shift(), "function" == typeof q[0] ? next.add(q[0]) : q[0].forEach((fn => next.add(fn))));
                })), dirs.forEach((dir => {
                    const q = queues.get(dir);
                    assert(q[0] instanceof Set), 1 === q[0].size && 1 === q.length ? queues.delete(dir) : 1 === q[0].size ? (q.shift(), 
                    next.add(q[0])) : q[0].delete(fn);
                })), running.delete(fn), next.forEach((fn => run(fn))), !0;
            };
            return {
                check,
                reserve: (paths, fn) => {
                    paths = isWindows ? [ "win32 parallelization disabled" ] : paths.map((p => normalize(stripSlashes(join(p))).toLowerCase()));
                    const dirs = new Set(paths.map((path => (path => {
                        const dirs = path.split("/").slice(0, -1).reduce(((set, path) => (set.length && (path = join(set[set.length - 1], path)), 
                        set.push(path || "/"), set)), []);
                        return dirs;
                    })(path))).reduce(((a, b) => a.concat(b))));
                    return reservations.set(fn, {
                        dirs,
                        paths
                    }), paths.forEach((path => {
                        const q = queues.get(path);
                        q ? q.push(fn) : queues.set(path, [ fn ]);
                    })), dirs.forEach((dir => {
                        const q = queues.get(dir);
                        q ? q[q.length - 1] instanceof Set ? q[q.length - 1].add(fn) : q.push(new Set([ fn ])) : queues.set(dir, [ new Set([ fn ]) ]);
                    })), run(fn);
                }
            };
        };
    },
    9154: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const Header = __webpack_require__(5017), path = __webpack_require__(4822);
        class Pax {
            constructor(obj, global) {
                this.atime = obj.atime || null, this.charset = obj.charset || null, this.comment = obj.comment || null, 
                this.ctime = obj.ctime || null, this.gid = obj.gid || null, this.gname = obj.gname || null, 
                this.linkpath = obj.linkpath || null, this.mtime = obj.mtime || null, this.path = obj.path || null, 
                this.size = obj.size || null, this.uid = obj.uid || null, this.uname = obj.uname || null, 
                this.dev = obj.dev || null, this.ino = obj.ino || null, this.nlink = obj.nlink || null, 
                this.global = global || !1;
            }
            encode() {
                const body = this.encodeBody();
                if ("" === body) return null;
                const bodyLen = Buffer.byteLength(body), bufLen = 512 * Math.ceil(1 + bodyLen / 512), buf = Buffer.allocUnsafe(bufLen);
                for (let i = 0; i < 512; i++) buf[i] = 0;
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
                }).encode(buf), buf.write(body, 512, bodyLen, "utf8");
                for (let i = bodyLen + 512; i < buf.length; i++) buf[i] = 0;
                return buf;
            }
            encodeBody() {
                return this.encodeField("path") + this.encodeField("ctime") + this.encodeField("atime") + this.encodeField("dev") + this.encodeField("ino") + this.encodeField("nlink") + this.encodeField("charset") + this.encodeField("comment") + this.encodeField("gid") + this.encodeField("gname") + this.encodeField("linkpath") + this.encodeField("mtime") + this.encodeField("size") + this.encodeField("uid") + this.encodeField("uname");
            }
            encodeField(field) {
                if (null === this[field] || void 0 === this[field]) return "";
                const s = " " + ("dev" === field || "ino" === field || "nlink" === field ? "SCHILY." : "") + field + "=" + (this[field] instanceof Date ? this[field].getTime() / 1e3 : this[field]) + "\n", byteLen = Buffer.byteLength(s);
                let digits = Math.floor(Math.log(byteLen) / Math.log(10)) + 1;
                byteLen + digits >= Math.pow(10, digits) && (digits += 1);
                return digits + byteLen + s;
            }
        }
        Pax.parse = (string, ex, g) => new Pax(merge(parseKV(string), ex), g);
        const merge = (a, b) => b ? Object.keys(a).reduce(((s, k) => (s[k] = a[k], s)), b) : a, parseKV = string => string.replace(/\n$/, "").split("\n").reduce(parseKVLine, Object.create(null)), parseKVLine = (set, line) => {
            const n = parseInt(line, 10);
            if (n !== Buffer.byteLength(line) + 1) return set;
            const kv = (line = line.substr((n + " ").length)).split("="), k = kv.shift().replace(/^SCHILY\.(dev|ino|nlink)/, "$1");
            if (!k) return set;
            const v = kv.join("=");
            return set[k] = /^([A-Z]+\.)?([mac]|birth|creation)time$/.test(k) ? new Date(1e3 * v) : /^[0-9]+$/.test(v) ? +v : v, 
            set;
        };
        module.exports = Pax;
    },
    7847: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const MiniPass = __webpack_require__(2253), normPath = __webpack_require__(4240), SLURP = Symbol("slurp");
        module.exports = class extends MiniPass {
            constructor(header, ex, gex) {
                switch (super(), this.pause(), this.extended = ex, this.globalExtended = gex, this.header = header, 
                this.startBlockSize = 512 * Math.ceil(header.size / 512), this.blockRemain = this.startBlockSize, 
                this.remain = header.size, this.type = header.type, this.meta = !1, this.ignore = !1, 
                this.type) {
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
                    this.meta = !0;
                    break;

                  default:
                    this.ignore = !0;
                }
                this.path = normPath(header.path), this.mode = header.mode, this.mode && (this.mode = 4095 & this.mode), 
                this.uid = header.uid, this.gid = header.gid, this.uname = header.uname, this.gname = header.gname, 
                this.size = header.size, this.mtime = header.mtime, this.atime = header.atime, this.ctime = header.ctime, 
                this.linkpath = normPath(header.linkpath), this.uname = header.uname, this.gname = header.gname, 
                ex && this[SLURP](ex), gex && this[SLURP](gex, !0);
            }
            write(data) {
                const writeLen = data.length;
                if (writeLen > this.blockRemain) throw new Error("writing more to entry than is appropriate");
                const r = this.remain, br = this.blockRemain;
                return this.remain = Math.max(0, r - writeLen), this.blockRemain = Math.max(0, br - writeLen), 
                !!this.ignore || (r >= writeLen ? super.write(data) : super.write(data.slice(0, r)));
            }
            [SLURP](ex, global) {
                for (const k in ex) null === ex[k] || void 0 === ex[k] || global && "path" === k || (this[k] = "path" === k || "linkpath" === k ? normPath(ex[k]) : ex[k]);
            }
        };
    },
    3666: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const hlo = __webpack_require__(7461), Pack = __webpack_require__(5843), fs = __webpack_require__(7147), fsm = __webpack_require__(8553), t = __webpack_require__(1090), path = __webpack_require__(4822), Header = __webpack_require__(5017);
        module.exports = (opt_, files, cb) => {
            const opt = hlo(opt_);
            if (!opt.file) throw new TypeError("file is required");
            if (opt.gzip) throw new TypeError("cannot append to compressed archives");
            if (!files || !Array.isArray(files) || !files.length) throw new TypeError("no files or directories specified");
            return files = Array.from(files), opt.sync ? replaceSync(opt, files) : replace(opt, files, cb);
        };
        const replaceSync = (opt, files) => {
            const p = new Pack.Sync(opt);
            let fd, position, threw = !0;
            try {
                try {
                    fd = fs.openSync(opt.file, "r+");
                } catch (er) {
                    if ("ENOENT" !== er.code) throw er;
                    fd = fs.openSync(opt.file, "w+");
                }
                const st = fs.fstatSync(fd), headBuf = Buffer.alloc(512);
                POSITION: for (position = 0; position < st.size; position += 512) {
                    for (let bufPos = 0, bytes = 0; bufPos < 512; bufPos += bytes) {
                        if (bytes = fs.readSync(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos), 
                        0 === position && 31 === headBuf[0] && 139 === headBuf[1]) throw new Error("cannot append to compressed archives");
                        if (!bytes) break POSITION;
                    }
                    const h = new Header(headBuf);
                    if (!h.cksumValid) break;
                    const entryBlockSize = 512 * Math.ceil(h.size / 512);
                    if (position + entryBlockSize + 512 > st.size) break;
                    position += entryBlockSize, opt.mtimeCache && opt.mtimeCache.set(h.path, h.mtime);
                }
                threw = !1, streamSync(opt, p, position, fd, files);
            } finally {
                if (threw) try {
                    fs.closeSync(fd);
                } catch (er) {}
            }
        }, streamSync = (opt, p, position, fd, files) => {
            const stream = new fsm.WriteStreamSync(opt.file, {
                fd,
                start: position
            });
            p.pipe(stream), addFilesSync(p, files);
        }, replace = (opt, files, cb) => {
            files = Array.from(files);
            const p = new Pack(opt), promise = new Promise(((resolve, reject) => {
                p.on("error", reject);
                let flag = "r+";
                const onopen = (er, fd) => er && "ENOENT" === er.code && "r+" === flag ? (flag = "w+", 
                fs.open(opt.file, flag, onopen)) : er ? reject(er) : void fs.fstat(fd, ((er, st) => {
                    if (er) return fs.close(fd, (() => reject(er)));
                    ((fd, size, cb_) => {
                        const cb = (er, pos) => {
                            er ? fs.close(fd, (_ => cb_(er))) : cb_(null, pos);
                        };
                        let position = 0;
                        if (0 === size) return cb(null, 0);
                        let bufPos = 0;
                        const headBuf = Buffer.alloc(512), onread = (er, bytes) => {
                            if (er) return cb(er);
                            if (bufPos += bytes, bufPos < 512 && bytes) return fs.read(fd, headBuf, bufPos, headBuf.length - bufPos, position + bufPos, onread);
                            if (0 === position && 31 === headBuf[0] && 139 === headBuf[1]) return cb(new Error("cannot append to compressed archives"));
                            if (bufPos < 512) return cb(null, position);
                            const h = new Header(headBuf);
                            if (!h.cksumValid) return cb(null, position);
                            const entryBlockSize = 512 * Math.ceil(h.size / 512);
                            return position + entryBlockSize + 512 > size ? cb(null, position) : (position += entryBlockSize + 512, 
                            position >= size ? cb(null, position) : (opt.mtimeCache && opt.mtimeCache.set(h.path, h.mtime), 
                            bufPos = 0, void fs.read(fd, headBuf, 0, 512, position, onread)));
                        };
                        fs.read(fd, headBuf, 0, 512, position, onread);
                    })(fd, st.size, ((er, position) => {
                        if (er) return reject(er);
                        const stream = new fsm.WriteStream(opt.file, {
                            fd,
                            start: position
                        });
                        p.pipe(stream), stream.on("error", reject), stream.on("close", resolve), addFilesAsync(p, files);
                    }));
                }));
                fs.open(opt.file, flag, onopen);
            }));
            return cb ? promise.then(cb, cb) : promise;
        }, addFilesSync = (p, files) => {
            files.forEach((file => {
                "@" === file.charAt(0) ? t({
                    file: path.resolve(p.cwd, file.substr(1)),
                    sync: !0,
                    noResume: !0,
                    onentry: entry => p.add(entry)
                }) : p.add(file);
            })), p.end();
        }, addFilesAsync = (p, files) => {
            for (;files.length; ) {
                const file = files.shift();
                if ("@" === file.charAt(0)) return t({
                    file: path.resolve(p.cwd, file.substr(1)),
                    noResume: !0,
                    onentry: entry => p.add(entry)
                }).then((_ => addFilesAsync(p, files)));
                p.add(file);
            }
            p.end();
        };
    },
    6014: (module, __unused_webpack_exports, __webpack_require__) => {
        const {isAbsolute, parse} = __webpack_require__(4822).win32;
        module.exports = path => {
            let r = "", parsed = parse(path);
            for (;isAbsolute(path) || parsed.root; ) {
                const root = "/" === path.charAt(0) && "//?/" !== path.slice(0, 4) ? "/" : parsed.root;
                path = path.substr(root.length), r += root, parsed = parse(path);
            }
            return [ r, path ];
        };
    },
    6401: module => {
        module.exports = str => {
            let i = str.length - 1, slashesStart = -1;
            for (;i > -1 && "/" === str.charAt(i); ) slashesStart = i, i--;
            return -1 === slashesStart ? str : str.slice(0, slashesStart);
        };
    },
    9806: (__unused_webpack_module, exports) => {
        "use strict";
        exports.name = new Map([ [ "0", "File" ], [ "", "OldFile" ], [ "1", "Link" ], [ "2", "SymbolicLink" ], [ "3", "CharacterDevice" ], [ "4", "BlockDevice" ], [ "5", "Directory" ], [ "6", "FIFO" ], [ "7", "ContiguousFile" ], [ "g", "GlobalExtendedHeader" ], [ "x", "ExtendedHeader" ], [ "A", "SolarisACL" ], [ "D", "GNUDumpDir" ], [ "I", "Inode" ], [ "K", "NextFileHasLongLinkpath" ], [ "L", "NextFileHasLongPath" ], [ "M", "ContinuationFile" ], [ "N", "OldGnuLongPath" ], [ "S", "SparseFile" ], [ "V", "TapeVolumeHeader" ], [ "X", "OldExtendedHeader" ] ]), 
        exports.code = new Map(Array.from(exports.name).map((kv => [ kv[1], kv[0] ])));
    },
    2864: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const assert = __webpack_require__(9491), Parser = __webpack_require__(6234), fs = __webpack_require__(7147), fsm = __webpack_require__(8553), path = __webpack_require__(4822), mkdir = __webpack_require__(3956), wc = __webpack_require__(6564), pathReservations = __webpack_require__(7119), stripAbsolutePath = __webpack_require__(6014), normPath = __webpack_require__(4240), stripSlash = __webpack_require__(6401), normalize = __webpack_require__(1645), ONENTRY = Symbol("onEntry"), CHECKFS = Symbol("checkFs"), CHECKFS2 = Symbol("checkFs2"), PRUNECACHE = Symbol("pruneCache"), ISREUSABLE = Symbol("isReusable"), MAKEFS = Symbol("makeFs"), FILE = Symbol("file"), DIRECTORY = Symbol("directory"), LINK = Symbol("link"), SYMLINK = Symbol("symlink"), HARDLINK = Symbol("hardlink"), UNSUPPORTED = Symbol("unsupported"), CHECKPATH = Symbol("checkPath"), MKDIR = Symbol("mkdir"), ONERROR = Symbol("onError"), PENDING = Symbol("pending"), PEND = Symbol("pend"), UNPEND = Symbol("unpend"), ENDED = Symbol("ended"), MAYBECLOSE = Symbol("maybeClose"), SKIP = Symbol("skip"), DOCHOWN = Symbol("doChown"), UID = Symbol("uid"), GID = Symbol("gid"), CHECKED_CWD = Symbol("checkedCwd"), crypto = __webpack_require__(6113), getFlag = __webpack_require__(8512), isWindows = "win32" === (process.env.TESTING_TAR_FAKE_PLATFORM || process.platform), uint32 = (a, b, c) => a === a >>> 0 ? a : b === b >>> 0 ? b : c, cacheKeyNormalize = path => normalize(stripSlash(normPath(path))).toLowerCase();
        class Unpack extends Parser {
            constructor(opt) {
                if (opt || (opt = {}), opt.ondone = _ => {
                    this[ENDED] = !0, this[MAYBECLOSE]();
                }, super(opt), this[CHECKED_CWD] = !1, this.reservations = pathReservations(), this.transform = "function" == typeof opt.transform ? opt.transform : null, 
                this.writable = !0, this.readable = !1, this[PENDING] = 0, this[ENDED] = !1, this.dirCache = opt.dirCache || new Map, 
                "number" == typeof opt.uid || "number" == typeof opt.gid) {
                    if ("number" != typeof opt.uid || "number" != typeof opt.gid) throw new TypeError("cannot set owner without number uid and gid");
                    if (opt.preserveOwner) throw new TypeError("cannot preserve owner in archive and also set owner explicitly");
                    this.uid = opt.uid, this.gid = opt.gid, this.setOwner = !0;
                } else this.uid = null, this.gid = null, this.setOwner = !1;
                void 0 === opt.preserveOwner && "number" != typeof opt.uid ? this.preserveOwner = process.getuid && 0 === process.getuid() : this.preserveOwner = !!opt.preserveOwner, 
                this.processUid = (this.preserveOwner || this.setOwner) && process.getuid ? process.getuid() : null, 
                this.processGid = (this.preserveOwner || this.setOwner) && process.getgid ? process.getgid() : null, 
                this.forceChown = !0 === opt.forceChown, this.win32 = !!opt.win32 || isWindows, 
                this.newer = !!opt.newer, this.keep = !!opt.keep, this.noMtime = !!opt.noMtime, 
                this.preservePaths = !!opt.preservePaths, this.unlink = !!opt.unlink, this.cwd = normPath(path.resolve(opt.cwd || process.cwd())), 
                this.strip = +opt.strip || 0, this.processUmask = opt.noChmod ? 0 : process.umask(), 
                this.umask = "number" == typeof opt.umask ? opt.umask : this.processUmask, this.dmode = opt.dmode || 511 & ~this.umask, 
                this.fmode = opt.fmode || 438 & ~this.umask, this.on("entry", (entry => this[ONENTRY](entry)));
            }
            warn(code, msg, data = {}) {
                return "TAR_BAD_ARCHIVE" !== code && "TAR_ABORT" !== code || (data.recoverable = !1), 
                super.warn(code, msg, data);
            }
            [MAYBECLOSE]() {
                this[ENDED] && 0 === this[PENDING] && (this.emit("prefinish"), this.emit("finish"), 
                this.emit("end"), this.emit("close"));
            }
            [CHECKPATH](entry) {
                if (this.strip) {
                    const parts = normPath(entry.path).split("/");
                    if (parts.length < this.strip) return !1;
                    if (entry.path = parts.slice(this.strip).join("/"), "Link" === entry.type) {
                        const linkparts = normPath(entry.linkpath).split("/");
                        if (!(linkparts.length >= this.strip)) return !1;
                        entry.linkpath = linkparts.slice(this.strip).join("/");
                    }
                }
                if (!this.preservePaths) {
                    const p = normPath(entry.path), parts = p.split("/");
                    if (parts.includes("..") || isWindows && /^[a-z]:\.\.$/i.test(parts[0])) return this.warn("TAR_ENTRY_ERROR", "path contains '..'", {
                        entry,
                        path: p
                    }), !1;
                    const [root, stripped] = stripAbsolutePath(p);
                    root && (entry.path = stripped, this.warn("TAR_ENTRY_INFO", `stripping ${root} from absolute path`, {
                        entry,
                        path: p
                    }));
                }
                if (path.isAbsolute(entry.path) ? entry.absolute = normPath(path.resolve(entry.path)) : entry.absolute = normPath(path.resolve(this.cwd, entry.path)), 
                !this.preservePaths && 0 !== entry.absolute.indexOf(this.cwd + "/") && entry.absolute !== this.cwd) return this.warn("TAR_ENTRY_ERROR", "path escaped extraction target", {
                    entry,
                    path: normPath(entry.path),
                    resolvedPath: entry.absolute,
                    cwd: this.cwd
                }), !1;
                if (entry.absolute === this.cwd && "Directory" !== entry.type && "GNUDumpDir" !== entry.type) return !1;
                if (this.win32) {
                    const {root: aRoot} = path.win32.parse(entry.absolute);
                    entry.absolute = aRoot + wc.encode(entry.absolute.substr(aRoot.length));
                    const {root: pRoot} = path.win32.parse(entry.path);
                    entry.path = pRoot + wc.encode(entry.path.substr(pRoot.length));
                }
                return !0;
            }
            [ONENTRY](entry) {
                if (!this[CHECKPATH](entry)) return entry.resume();
                switch (assert.equal(typeof entry.absolute, "string"), entry.type) {
                  case "Directory":
                  case "GNUDumpDir":
                    entry.mode && (entry.mode = 448 | entry.mode);

                  case "File":
                  case "OldFile":
                  case "ContiguousFile":
                  case "Link":
                  case "SymbolicLink":
                    return this[CHECKFS](entry);

                  default:
                    return this[UNSUPPORTED](entry);
                }
            }
            [ONERROR](er, entry) {
                "CwdError" === er.name ? this.emit("error", er) : (this.warn("TAR_ENTRY_ERROR", er, {
                    entry
                }), this[UNPEND](), entry.resume());
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
                return this.forceChown || this.preserveOwner && ("number" == typeof entry.uid && entry.uid !== this.processUid || "number" == typeof entry.gid && entry.gid !== this.processGid) || "number" == typeof this.uid && this.uid !== this.processUid || "number" == typeof this.gid && this.gid !== this.processGid;
            }
            [UID](entry) {
                return uint32(this.uid, entry.uid, this.processUid);
            }
            [GID](entry) {
                return uint32(this.gid, entry.gid, this.processGid);
            }
            [FILE](entry, fullyDone) {
                const mode = 4095 & entry.mode || this.fmode, stream = new fsm.WriteStream(entry.absolute, {
                    flags: getFlag(entry.size),
                    mode,
                    autoClose: !1
                });
                stream.on("error", (er => {
                    stream.fd && fs.close(stream.fd, (() => {})), stream.write = () => !0, this[ONERROR](er, entry), 
                    fullyDone();
                }));
                let actions = 1;
                const done = er => {
                    if (er) return stream.fd && fs.close(stream.fd, (() => {})), this[ONERROR](er, entry), 
                    void fullyDone();
                    0 == --actions && fs.close(stream.fd, (er => {
                        er ? this[ONERROR](er, entry) : this[UNPEND](), fullyDone();
                    }));
                };
                stream.on("finish", (_ => {
                    const abs = entry.absolute, fd = stream.fd;
                    if (entry.mtime && !this.noMtime) {
                        actions++;
                        const atime = entry.atime || new Date, mtime = entry.mtime;
                        fs.futimes(fd, atime, mtime, (er => er ? fs.utimes(abs, atime, mtime, (er2 => done(er2 && er))) : done()));
                    }
                    if (this[DOCHOWN](entry)) {
                        actions++;
                        const uid = this[UID](entry), gid = this[GID](entry);
                        fs.fchown(fd, uid, gid, (er => er ? fs.chown(abs, uid, gid, (er2 => done(er2 && er))) : done()));
                    }
                    done();
                }));
                const tx = this.transform && this.transform(entry) || entry;
                tx !== entry && (tx.on("error", (er => {
                    this[ONERROR](er, entry), fullyDone();
                })), entry.pipe(tx)), tx.pipe(stream);
            }
            [DIRECTORY](entry, fullyDone) {
                const mode = 4095 & entry.mode || this.dmode;
                this[MKDIR](entry.absolute, mode, (er => {
                    if (er) return this[ONERROR](er, entry), void fullyDone();
                    let actions = 1;
                    const done = _ => {
                        0 == --actions && (fullyDone(), this[UNPEND](), entry.resume());
                    };
                    entry.mtime && !this.noMtime && (actions++, fs.utimes(entry.absolute, entry.atime || new Date, entry.mtime, done)), 
                    this[DOCHOWN](entry) && (actions++, fs.chown(entry.absolute, this[UID](entry), this[GID](entry), done)), 
                    done();
                }));
            }
            [UNSUPPORTED](entry) {
                entry.unsupported = !0, this.warn("TAR_ENTRY_UNSUPPORTED", `unsupported entry type: ${entry.type}`, {
                    entry
                }), entry.resume();
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
                this[PENDING]--, this[MAYBECLOSE]();
            }
            [SKIP](entry) {
                this[UNPEND](), entry.resume();
            }
            [ISREUSABLE](entry, st) {
                return "File" === entry.type && !this.unlink && st.isFile() && st.nlink <= 1 && !isWindows;
            }
            [CHECKFS](entry) {
                this[PEND]();
                const paths = [ entry.path ];
                entry.linkpath && paths.push(entry.linkpath), this.reservations.reserve(paths, (done => this[CHECKFS2](entry, done)));
            }
            [PRUNECACHE](entry) {
                "SymbolicLink" === entry.type ? (cache => {
                    for (const key of cache.keys()) cache.delete(key);
                })(this.dirCache) : "Directory" !== entry.type && ((cache, abs) => {
                    abs = cacheKeyNormalize(abs);
                    for (const path of cache.keys()) {
                        const pnorm = cacheKeyNormalize(path);
                        pnorm !== abs && 0 !== pnorm.indexOf(abs + "/") || cache.delete(path);
                    }
                })(this.dirCache, entry.absolute);
            }
            [CHECKFS2](entry, fullyDone) {
                this[PRUNECACHE](entry);
                const done = er => {
                    this[PRUNECACHE](entry), fullyDone(er);
                }, start = () => {
                    if (entry.absolute !== this.cwd) {
                        const parent = normPath(path.dirname(entry.absolute));
                        if (parent !== this.cwd) return this[MKDIR](parent, this.dmode, (er => {
                            if (er) return this[ONERROR](er, entry), void done();
                            afterMakeParent();
                        }));
                    }
                    afterMakeParent();
                }, afterMakeParent = () => {
                    fs.lstat(entry.absolute, ((lstatEr, st) => {
                        if (st && (this.keep || this.newer && st.mtime > entry.mtime)) return this[SKIP](entry), 
                        void done();
                        if (lstatEr || this[ISREUSABLE](entry, st)) return this[MAKEFS](null, entry, done);
                        if (st.isDirectory()) {
                            if ("Directory" === entry.type) {
                                const afterChmod = er => this[MAKEFS](er, entry, done);
                                return !this.noChmod && entry.mode && (4095 & st.mode) !== entry.mode ? fs.chmod(entry.absolute, entry.mode, afterChmod) : afterChmod();
                            }
                            if (entry.absolute !== this.cwd) return fs.rmdir(entry.absolute, (er => this[MAKEFS](er, entry, done)));
                        }
                        if (entry.absolute === this.cwd) return this[MAKEFS](null, entry, done);
                        ((path, cb) => {
                            if (!isWindows) return fs.unlink(path, cb);
                            const name = path + ".DELETE." + crypto.randomBytes(16).toString("hex");
                            fs.rename(path, name, (er => {
                                if (er) return cb(er);
                                fs.unlink(name, cb);
                            }));
                        })(entry.absolute, (er => this[MAKEFS](er, entry, done)));
                    }));
                };
                this[CHECKED_CWD] ? start() : (() => {
                    this[MKDIR](this.cwd, this.dmode, (er => {
                        if (er) return this[ONERROR](er, entry), void done();
                        this[CHECKED_CWD] = !0, start();
                    }));
                })();
            }
            [MAKEFS](er, entry, done) {
                if (er) return this[ONERROR](er, entry), void done();
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
                fs[link](linkpath, entry.absolute, (er => {
                    er ? this[ONERROR](er, entry) : (this[UNPEND](), entry.resume()), done();
                }));
            }
        }
        const callSync = fn => {
            try {
                return [ null, fn() ];
            } catch (er) {
                return [ er, null ];
            }
        };
        Unpack.Sync = class extends Unpack {
            [MAKEFS](er, entry) {
                return super[MAKEFS](er, entry, (() => {}));
            }
            [CHECKFS](entry) {
                if (this[PRUNECACHE](entry), !this[CHECKED_CWD]) {
                    const er = this[MKDIR](this.cwd, this.dmode);
                    if (er) return this[ONERROR](er, entry);
                    this[CHECKED_CWD] = !0;
                }
                if (entry.absolute !== this.cwd) {
                    const parent = normPath(path.dirname(entry.absolute));
                    if (parent !== this.cwd) {
                        const mkParent = this[MKDIR](parent, this.dmode);
                        if (mkParent) return this[ONERROR](mkParent, entry);
                    }
                }
                const [lstatEr, st] = callSync((() => fs.lstatSync(entry.absolute)));
                if (st && (this.keep || this.newer && st.mtime > entry.mtime)) return this[SKIP](entry);
                if (lstatEr || this[ISREUSABLE](entry, st)) return this[MAKEFS](null, entry);
                if (st.isDirectory()) {
                    if ("Directory" === entry.type) {
                        const needChmod = !this.noChmod && entry.mode && (4095 & st.mode) !== entry.mode, [er] = needChmod ? callSync((() => {
                            fs.chmodSync(entry.absolute, entry.mode);
                        })) : [];
                        return this[MAKEFS](er, entry);
                    }
                    const [er] = callSync((() => fs.rmdirSync(entry.absolute)));
                    this[MAKEFS](er, entry);
                }
                const [er] = entry.absolute === this.cwd ? [] : callSync((() => (path => {
                    if (!isWindows) return fs.unlinkSync(path);
                    const name = path + ".DELETE." + crypto.randomBytes(16).toString("hex");
                    fs.renameSync(path, name), fs.unlinkSync(name);
                })(entry.absolute)));
                this[MAKEFS](er, entry);
            }
            [FILE](entry, done) {
                const mode = 4095 & entry.mode || this.fmode, oner = er => {
                    let closeError;
                    try {
                        fs.closeSync(fd);
                    } catch (e) {
                        closeError = e;
                    }
                    (er || closeError) && this[ONERROR](er || closeError, entry), done();
                };
                let fd;
                try {
                    fd = fs.openSync(entry.absolute, getFlag(entry.size), mode);
                } catch (er) {
                    return oner(er);
                }
                const tx = this.transform && this.transform(entry) || entry;
                tx !== entry && (tx.on("error", (er => this[ONERROR](er, entry))), entry.pipe(tx)), 
                tx.on("data", (chunk => {
                    try {
                        fs.writeSync(fd, chunk, 0, chunk.length);
                    } catch (er) {
                        oner(er);
                    }
                })), tx.on("end", (_ => {
                    let er = null;
                    if (entry.mtime && !this.noMtime) {
                        const atime = entry.atime || new Date, mtime = entry.mtime;
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
                        const uid = this[UID](entry), gid = this[GID](entry);
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
                }));
            }
            [DIRECTORY](entry, done) {
                const mode = 4095 & entry.mode || this.dmode, er = this[MKDIR](entry.absolute, mode);
                if (er) return this[ONERROR](er, entry), void done();
                if (entry.mtime && !this.noMtime) try {
                    fs.utimesSync(entry.absolute, entry.atime || new Date, entry.mtime);
                } catch (er) {}
                if (this[DOCHOWN](entry)) try {
                    fs.chownSync(entry.absolute, this[UID](entry), this[GID](entry));
                } catch (er) {}
                done(), entry.resume();
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
                    fs[link + "Sync"](linkpath, entry.absolute), done(), entry.resume();
                } catch (er) {
                    return this[ONERROR](er, entry);
                }
            }
        }, module.exports = Unpack;
    },
    4229: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const hlo = __webpack_require__(7461), r = __webpack_require__(3666);
        module.exports = (opt_, files, cb) => {
            const opt = hlo(opt_);
            if (!opt.file) throw new TypeError("file is required");
            if (opt.gzip) throw new TypeError("cannot append to compressed archives");
            if (!files || !Array.isArray(files) || !files.length) throw new TypeError("no files or directories specified");
            return files = Array.from(files), mtimeFilter(opt), r(opt, files, cb);
        };
        const mtimeFilter = opt => {
            const filter = opt.filter;
            opt.mtimeCache || (opt.mtimeCache = new Map), opt.filter = filter ? (path, stat) => filter(path, stat) && !(opt.mtimeCache.get(path) > stat.mtime) : (path, stat) => !(opt.mtimeCache.get(path) > stat.mtime);
        };
    },
    8783: module => {
        "use strict";
        module.exports = Base => class extends Base {
            warn(code, message, data = {}) {
                this.file && (data.file = this.file), this.cwd && (data.cwd = this.cwd), data.code = message instanceof Error && message.code || code, 
                data.tarCode = code, this.strict || !1 === data.recoverable ? message instanceof Error ? this.emit("error", Object.assign(message, data)) : this.emit("error", Object.assign(new Error(`${code}: ${message}`), data)) : (message instanceof Error && (data = Object.assign(message, data), 
                message = message.message), this.emit("warn", data.tarCode, message, data));
            }
        };
    },
    6564: module => {
        "use strict";
        const raw = [ "|", "<", ">", "?", ":" ], win = raw.map((char => String.fromCharCode(61440 + char.charCodeAt(0)))), toWin = new Map(raw.map(((char, i) => [ char, win[i] ]))), toRaw = new Map(win.map(((char, i) => [ char, raw[i] ])));
        module.exports = {
            encode: s => raw.reduce(((s, c) => s.split(c).join(toWin.get(c))), s),
            decode: s => win.reduce(((s, c) => s.split(c).join(toRaw.get(c))), s)
        };
    },
    8418: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        const MiniPass = __webpack_require__(2253), Pax = __webpack_require__(9154), Header = __webpack_require__(5017), fs = __webpack_require__(7147), path = __webpack_require__(4822), normPath = __webpack_require__(4240), stripSlash = __webpack_require__(6401), prefixPath = (path, prefix) => prefix ? (path = normPath(path).replace(/^\.(\/|$)/, ""), 
        stripSlash(prefix) + "/" + path) : normPath(path), PROCESS = Symbol("process"), FILE = Symbol("file"), DIRECTORY = Symbol("directory"), SYMLINK = Symbol("symlink"), HARDLINK = Symbol("hardlink"), HEADER = Symbol("header"), READ = Symbol("read"), LSTAT = Symbol("lstat"), ONLSTAT = Symbol("onlstat"), ONREAD = Symbol("onread"), ONREADLINK = Symbol("onreadlink"), OPENFILE = Symbol("openfile"), ONOPENFILE = Symbol("onopenfile"), CLOSE = Symbol("close"), MODE = Symbol("mode"), AWAITDRAIN = Symbol("awaitDrain"), ONDRAIN = Symbol("ondrain"), PREFIX = Symbol("prefix"), HAD_ERROR = Symbol("hadError"), warner = __webpack_require__(8783), winchars = __webpack_require__(6564), stripAbsolutePath = __webpack_require__(6014), modeFix = __webpack_require__(9574), WriteEntry = warner(class extends MiniPass {
            constructor(p, opt) {
                if (super(opt = opt || {}), "string" != typeof p) throw new TypeError("path is required");
                this.path = normPath(p), this.portable = !!opt.portable, this.myuid = process.getuid && process.getuid() || 0, 
                this.myuser = process.env.USER || "", this.maxReadSize = opt.maxReadSize || 16777216, 
                this.linkCache = opt.linkCache || new Map, this.statCache = opt.statCache || new Map, 
                this.preservePaths = !!opt.preservePaths, this.cwd = normPath(opt.cwd || process.cwd()), 
                this.strict = !!opt.strict, this.noPax = !!opt.noPax, this.noMtime = !!opt.noMtime, 
                this.mtime = opt.mtime || null, this.prefix = opt.prefix ? normPath(opt.prefix) : null, 
                this.fd = null, this.blockLen = null, this.blockRemain = null, this.buf = null, 
                this.offset = null, this.length = null, this.pos = null, this.remain = null, "function" == typeof opt.onwarn && this.on("warn", opt.onwarn);
                let pathWarn = !1;
                if (!this.preservePaths) {
                    const [root, stripped] = stripAbsolutePath(this.path);
                    root && (this.path = stripped, pathWarn = root);
                }
                this.win32 = !!opt.win32 || "win32" === process.platform, this.win32 && (this.path = winchars.decode(this.path.replace(/\\/g, "/")), 
                p = p.replace(/\\/g, "/")), this.absolute = normPath(opt.absolute || path.resolve(this.cwd, p)), 
                "" === this.path && (this.path = "./"), pathWarn && this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
                    entry: this,
                    path: pathWarn + this.path
                }), this.statCache.has(this.absolute) ? this[ONLSTAT](this.statCache.get(this.absolute)) : this[LSTAT]();
            }
            emit(ev, ...data) {
                return "error" === ev && (this[HAD_ERROR] = !0), super.emit(ev, ...data);
            }
            [LSTAT]() {
                fs.lstat(this.absolute, ((er, stat) => {
                    if (er) return this.emit("error", er);
                    this[ONLSTAT](stat);
                }));
            }
            [ONLSTAT](stat) {
                this.statCache.set(this.absolute, stat), this.stat = stat, stat.isFile() || (stat.size = 0), 
                this.type = getType(stat), this.emit("stat", stat), this[PROCESS]();
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
                return modeFix(mode, "Directory" === this.type, this.portable);
            }
            [PREFIX](path) {
                return prefixPath(path, this.prefix);
            }
            [HEADER]() {
                "Directory" === this.type && this.portable && (this.noMtime = !0), this.header = new Header({
                    path: this[PREFIX](this.path),
                    linkpath: "Link" === this.type ? this[PREFIX](this.linkpath) : this.linkpath,
                    mode: this[MODE](this.stat.mode),
                    uid: this.portable ? null : this.stat.uid,
                    gid: this.portable ? null : this.stat.gid,
                    size: this.stat.size,
                    mtime: this.noMtime ? null : this.mtime || this.stat.mtime,
                    type: this.type,
                    uname: this.portable ? null : this.stat.uid === this.myuid ? this.myuser : "",
                    atime: this.portable ? null : this.stat.atime,
                    ctime: this.portable ? null : this.stat.ctime
                }), this.header.encode() && !this.noPax && super.write(new Pax({
                    atime: this.portable ? null : this.header.atime,
                    ctime: this.portable ? null : this.header.ctime,
                    gid: this.portable ? null : this.header.gid,
                    mtime: this.noMtime ? null : this.mtime || this.header.mtime,
                    path: this[PREFIX](this.path),
                    linkpath: "Link" === this.type ? this[PREFIX](this.linkpath) : this.linkpath,
                    size: this.header.size,
                    uid: this.portable ? null : this.header.uid,
                    uname: this.portable ? null : this.header.uname,
                    dev: this.portable ? null : this.stat.dev,
                    ino: this.portable ? null : this.stat.ino,
                    nlink: this.portable ? null : this.stat.nlink
                }).encode()), super.write(this.header.block);
            }
            [DIRECTORY]() {
                "/" !== this.path.substr(-1) && (this.path += "/"), this.stat.size = 0, this[HEADER](), 
                this.end();
            }
            [SYMLINK]() {
                fs.readlink(this.absolute, ((er, linkpath) => {
                    if (er) return this.emit("error", er);
                    this[ONREADLINK](linkpath);
                }));
            }
            [ONREADLINK](linkpath) {
                this.linkpath = normPath(linkpath), this[HEADER](), this.end();
            }
            [HARDLINK](linkpath) {
                this.type = "Link", this.linkpath = normPath(path.relative(this.cwd, linkpath)), 
                this.stat.size = 0, this[HEADER](), this.end();
            }
            [FILE]() {
                if (this.stat.nlink > 1) {
                    const linkKey = this.stat.dev + ":" + this.stat.ino;
                    if (this.linkCache.has(linkKey)) {
                        const linkpath = this.linkCache.get(linkKey);
                        if (0 === linkpath.indexOf(this.cwd)) return this[HARDLINK](linkpath);
                    }
                    this.linkCache.set(linkKey, this.absolute);
                }
                if (this[HEADER](), 0 === this.stat.size) return this.end();
                this[OPENFILE]();
            }
            [OPENFILE]() {
                fs.open(this.absolute, "r", ((er, fd) => {
                    if (er) return this.emit("error", er);
                    this[ONOPENFILE](fd);
                }));
            }
            [ONOPENFILE](fd) {
                if (this.fd = fd, this[HAD_ERROR]) return this[CLOSE]();
                this.blockLen = 512 * Math.ceil(this.stat.size / 512), this.blockRemain = this.blockLen;
                const bufLen = Math.min(this.blockLen, this.maxReadSize);
                this.buf = Buffer.allocUnsafe(bufLen), this.offset = 0, this.pos = 0, this.remain = this.stat.size, 
                this.length = this.buf.length, this[READ]();
            }
            [READ]() {
                const {fd, buf, offset, length, pos} = this;
                fs.read(fd, buf, offset, length, pos, ((er, bytesRead) => {
                    if (er) return this[CLOSE]((() => this.emit("error", er)));
                    this[ONREAD](bytesRead);
                }));
            }
            [CLOSE](cb) {
                fs.close(this.fd, cb);
            }
            [ONREAD](bytesRead) {
                if (bytesRead <= 0 && this.remain > 0) {
                    const er = new Error("encountered unexpected EOF");
                    return er.path = this.absolute, er.syscall = "read", er.code = "EOF", this[CLOSE]((() => this.emit("error", er)));
                }
                if (bytesRead > this.remain) {
                    const er = new Error("did not encounter expected EOF");
                    return er.path = this.absolute, er.syscall = "read", er.code = "EOF", this[CLOSE]((() => this.emit("error", er)));
                }
                if (bytesRead === this.remain) for (let i = bytesRead; i < this.length && bytesRead < this.blockRemain; i++) this.buf[i + this.offset] = 0, 
                bytesRead++, this.remain++;
                const writeBuf = 0 === this.offset && bytesRead === this.buf.length ? this.buf : this.buf.slice(this.offset, this.offset + bytesRead);
                this.write(writeBuf) ? this[ONDRAIN]() : this[AWAITDRAIN]((() => this[ONDRAIN]()));
            }
            [AWAITDRAIN](cb) {
                this.once("drain", cb);
            }
            write(writeBuf) {
                if (this.blockRemain < writeBuf.length) {
                    const er = new Error("writing more data than expected");
                    return er.path = this.absolute, this.emit("error", er);
                }
                return this.remain -= writeBuf.length, this.blockRemain -= writeBuf.length, this.pos += writeBuf.length, 
                this.offset += writeBuf.length, super.write(writeBuf);
            }
            [ONDRAIN]() {
                if (!this.remain) return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), 
                this[CLOSE]((er => er ? this.emit("error", er) : this.end()));
                this.offset >= this.length && (this.buf = Buffer.allocUnsafe(Math.min(this.blockRemain, this.buf.length)), 
                this.offset = 0), this.length = this.buf.length - this.offset, this[READ]();
            }
        });
        const WriteEntryTar = warner(class extends MiniPass {
            constructor(readEntry, opt) {
                super(opt = opt || {}), this.preservePaths = !!opt.preservePaths, this.portable = !!opt.portable, 
                this.strict = !!opt.strict, this.noPax = !!opt.noPax, this.noMtime = !!opt.noMtime, 
                this.readEntry = readEntry, this.type = readEntry.type, "Directory" === this.type && this.portable && (this.noMtime = !0), 
                this.prefix = opt.prefix || null, this.path = normPath(readEntry.path), this.mode = this[MODE](readEntry.mode), 
                this.uid = this.portable ? null : readEntry.uid, this.gid = this.portable ? null : readEntry.gid, 
                this.uname = this.portable ? null : readEntry.uname, this.gname = this.portable ? null : readEntry.gname, 
                this.size = readEntry.size, this.mtime = this.noMtime ? null : opt.mtime || readEntry.mtime, 
                this.atime = this.portable ? null : readEntry.atime, this.ctime = this.portable ? null : readEntry.ctime, 
                this.linkpath = normPath(readEntry.linkpath), "function" == typeof opt.onwarn && this.on("warn", opt.onwarn);
                let pathWarn = !1;
                if (!this.preservePaths) {
                    const [root, stripped] = stripAbsolutePath(this.path);
                    root && (this.path = stripped, pathWarn = root);
                }
                this.remain = readEntry.size, this.blockRemain = readEntry.startBlockSize, this.header = new Header({
                    path: this[PREFIX](this.path),
                    linkpath: "Link" === this.type ? this[PREFIX](this.linkpath) : this.linkpath,
                    mode: this.mode,
                    uid: this.portable ? null : this.uid,
                    gid: this.portable ? null : this.gid,
                    size: this.size,
                    mtime: this.noMtime ? null : this.mtime,
                    type: this.type,
                    uname: this.portable ? null : this.uname,
                    atime: this.portable ? null : this.atime,
                    ctime: this.portable ? null : this.ctime
                }), pathWarn && this.warn("TAR_ENTRY_INFO", `stripping ${pathWarn} from absolute path`, {
                    entry: this,
                    path: pathWarn + this.path
                }), this.header.encode() && !this.noPax && super.write(new Pax({
                    atime: this.portable ? null : this.atime,
                    ctime: this.portable ? null : this.ctime,
                    gid: this.portable ? null : this.gid,
                    mtime: this.noMtime ? null : this.mtime,
                    path: this[PREFIX](this.path),
                    linkpath: "Link" === this.type ? this[PREFIX](this.linkpath) : this.linkpath,
                    size: this.size,
                    uid: this.portable ? null : this.uid,
                    uname: this.portable ? null : this.uname,
                    dev: this.portable ? null : this.readEntry.dev,
                    ino: this.portable ? null : this.readEntry.ino,
                    nlink: this.portable ? null : this.readEntry.nlink
                }).encode()), super.write(this.header.block), readEntry.pipe(this);
            }
            [PREFIX](path) {
                return prefixPath(path, this.prefix);
            }
            [MODE](mode) {
                return modeFix(mode, "Directory" === this.type, this.portable);
            }
            write(data) {
                const writeLen = data.length;
                if (writeLen > this.blockRemain) throw new Error("writing more to entry than is appropriate");
                return this.blockRemain -= writeLen, super.write(data);
            }
            end() {
                return this.blockRemain && super.write(Buffer.alloc(this.blockRemain)), super.end();
            }
        });
        WriteEntry.Sync = class extends WriteEntry {
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
                let threw = !0;
                try {
                    const {fd, buf, offset, length, pos} = this, bytesRead = fs.readSync(fd, buf, offset, length, pos);
                    this[ONREAD](bytesRead), threw = !1;
                } finally {
                    if (threw) try {
                        this[CLOSE]((() => {}));
                    } catch (er) {}
                }
            }
            [AWAITDRAIN](cb) {
                cb();
            }
            [CLOSE](cb) {
                fs.closeSync(this.fd), cb();
            }
        }, WriteEntry.Tar = WriteEntryTar;
        const getType = stat => stat.isFile() ? "File" : stat.isDirectory() ? "Directory" : stat.isSymbolicLink() ? "SymbolicLink" : "Unsupported";
        module.exports = WriteEntry;
    },
    3459: (__unused_webpack_module, exports) => {
        "use strict";
        exports.fromCallback = function(fn) {
            return Object.defineProperty((function(...args) {
                if ("function" != typeof args[args.length - 1]) return new Promise(((resolve, reject) => {
                    fn.call(this, ...args, ((err, res) => null != err ? reject(err) : resolve(res)));
                }));
                fn.apply(this, args);
            }), "name", {
                value: fn.name
            });
        }, exports.fromPromise = function(fn) {
            return Object.defineProperty((function(...args) {
                const cb = args[args.length - 1];
                if ("function" != typeof cb) return fn.apply(this, args);
                fn.apply(this, args.slice(0, -1)).then((r => cb(null, r)), cb);
            }), "name", {
                value: fn.name
            });
        };
    },
    9084: function(__unused_webpack_module, exports) {
        /** @license URI.js v4.4.1 (c) 2011 Gary Court. License: http://github.com/garycourt/uri-js */
        !function(exports) {
            "use strict";
            function merge() {
                for (var _len = arguments.length, sets = Array(_len), _key = 0; _key < _len; _key++) sets[_key] = arguments[_key];
                if (sets.length > 1) {
                    sets[0] = sets[0].slice(0, -1);
                    for (var xl = sets.length - 1, x = 1; x < xl; ++x) sets[x] = sets[x].slice(1, -1);
                    return sets[xl] = sets[xl].slice(1), sets.join("");
                }
                return sets[0];
            }
            function subexp(str) {
                return "(?:" + str + ")";
            }
            function typeOf(o) {
                return void 0 === o ? "undefined" : null === o ? "null" : Object.prototype.toString.call(o).split(" ").pop().split("]").shift().toLowerCase();
            }
            function toUpperCase(str) {
                return str.toUpperCase();
            }
            function toArray(obj) {
                return null != obj ? obj instanceof Array ? obj : "number" != typeof obj.length || obj.split || obj.setInterval || obj.call ? [ obj ] : Array.prototype.slice.call(obj) : [];
            }
            function assign(target, source) {
                var obj = target;
                if (source) for (var key in source) obj[key] = source[key];
                return obj;
            }
            function buildExps(isIRI) {
                var ALPHA$$ = "[A-Za-z]", DIGIT$$ = "[0-9]", HEXDIG$$ = merge(DIGIT$$, "[A-Fa-f]"), PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)), SUB_DELIMS$$ = "[\\!\\$\\&\\'\\(\\)\\*\\+\\,\\;\\=]", RESERVED$$ = merge("[\\:\\/\\?\\#\\[\\]\\@]", SUB_DELIMS$$), IPRIVATE$$ = isIRI ? "[\\uE000-\\uF8FF]" : "[]", UNRESERVED$$ = merge(ALPHA$$, DIGIT$$, "[\\-\\.\\_\\~]", isIRI ? "[\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]" : "[]"), SCHEME$ = subexp(ALPHA$$ + merge(ALPHA$$, DIGIT$$, "[\\+\\-\\.]") + "*"), USERINFO$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]")) + "*"), DEC_OCTET_RELAXED$ = (subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("[1-9]" + DIGIT$$) + "|" + DIGIT$$), 
                subexp(subexp("25[0-5]") + "|" + subexp("2[0-4]" + DIGIT$$) + "|" + subexp("1" + DIGIT$$ + DIGIT$$) + "|" + subexp("0?[1-9]" + DIGIT$$) + "|0?0?" + DIGIT$$)), IPV4ADDRESS$ = subexp(DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$ + "\\." + DEC_OCTET_RELAXED$), H16$ = subexp(HEXDIG$$ + "{1,4}"), LS32$ = subexp(subexp(H16$ + "\\:" + H16$) + "|" + IPV4ADDRESS$), IPV6ADDRESS1$ = subexp(subexp(H16$ + "\\:") + "{6}" + LS32$), IPV6ADDRESS2$ = subexp("\\:\\:" + subexp(H16$ + "\\:") + "{5}" + LS32$), IPV6ADDRESS3$ = subexp(subexp(H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{4}" + LS32$), IPV6ADDRESS4$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,1}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{3}" + LS32$), IPV6ADDRESS5$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,2}" + H16$) + "?\\:\\:" + subexp(H16$ + "\\:") + "{2}" + LS32$), IPV6ADDRESS6$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,3}" + H16$) + "?\\:\\:" + H16$ + "\\:" + LS32$), IPV6ADDRESS7$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,4}" + H16$) + "?\\:\\:" + LS32$), IPV6ADDRESS8$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,5}" + H16$) + "?\\:\\:" + H16$), IPV6ADDRESS9$ = subexp(subexp(subexp(H16$ + "\\:") + "{0,6}" + H16$) + "?\\:\\:"), IPV6ADDRESS$ = subexp([ IPV6ADDRESS1$, IPV6ADDRESS2$, IPV6ADDRESS3$, IPV6ADDRESS4$, IPV6ADDRESS5$, IPV6ADDRESS6$, IPV6ADDRESS7$, IPV6ADDRESS8$, IPV6ADDRESS9$ ].join("|")), ZONEID$ = subexp(subexp(UNRESERVED$$ + "|" + PCT_ENCODED$) + "+"), IPV6ADDRZ_RELAXED$ = (subexp(IPV6ADDRESS$ + "\\%25" + ZONEID$), 
                subexp(IPV6ADDRESS$ + subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + ZONEID$)), IPVFUTURE$ = subexp("[vV]" + HEXDIG$$ + "+\\." + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:]") + "+"), IP_LITERAL$ = subexp("\\[" + subexp(IPV6ADDRZ_RELAXED$ + "|" + IPV6ADDRESS$ + "|" + IPVFUTURE$) + "\\]"), REG_NAME$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$)) + "*"), HOST$ = subexp(IP_LITERAL$ + "|" + IPV4ADDRESS$ + "(?!" + REG_NAME$ + ")|" + REG_NAME$), PORT$ = subexp(DIGIT$$ + "*"), AUTHORITY$ = subexp(subexp(USERINFO$ + "@") + "?" + HOST$ + subexp("\\:" + PORT$) + "?"), PCHAR$ = subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@]")), SEGMENT$ = subexp(PCHAR$ + "*"), SEGMENT_NZ$ = subexp(PCHAR$ + "+"), SEGMENT_NZ_NC$ = subexp(subexp(PCT_ENCODED$ + "|" + merge(UNRESERVED$$, SUB_DELIMS$$, "[\\@]")) + "+"), PATH_ABEMPTY$ = subexp(subexp("\\/" + SEGMENT$) + "*"), PATH_ABSOLUTE$ = subexp("\\/" + subexp(SEGMENT_NZ$ + PATH_ABEMPTY$) + "?"), PATH_NOSCHEME$ = subexp(SEGMENT_NZ_NC$ + PATH_ABEMPTY$), PATH_ROOTLESS$ = subexp(SEGMENT_NZ$ + PATH_ABEMPTY$), PATH_EMPTY$ = "(?!" + PCHAR$ + ")", QUERY$ = (subexp(PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), 
                subexp(subexp(PCHAR$ + "|" + merge("[\\/\\?]", IPRIVATE$$)) + "*")), FRAGMENT$ = subexp(subexp(PCHAR$ + "|[\\/\\?]") + "*"), HIER_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$), URI$ = subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?"), RELATIVE_PART$ = subexp(subexp("\\/\\/" + AUTHORITY$ + PATH_ABEMPTY$) + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$), RELATIVE$ = subexp(RELATIVE_PART$ + subexp("\\?" + QUERY$) + "?" + subexp("\\#" + FRAGMENT$) + "?");
                return subexp(URI$ + "|" + RELATIVE$), subexp(SCHEME$ + "\\:" + HIER_PART$ + subexp("\\?" + QUERY$) + "?"), 
                subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")"), 
                subexp("\\?(" + QUERY$ + ")"), subexp("\\#(" + FRAGMENT$ + ")"), subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_NOSCHEME$ + "|" + PATH_EMPTY$ + ")"), 
                subexp("\\?(" + QUERY$ + ")"), subexp("\\#(" + FRAGMENT$ + ")"), subexp(subexp("\\/\\/(" + subexp("(" + USERINFO$ + ")@") + "?(" + HOST$ + ")" + subexp("\\:(" + PORT$ + ")") + "?)") + "?(" + PATH_ABEMPTY$ + "|" + PATH_ABSOLUTE$ + "|" + PATH_ROOTLESS$ + "|" + PATH_EMPTY$ + ")"), 
                subexp("\\?(" + QUERY$ + ")"), subexp("\\#(" + FRAGMENT$ + ")"), subexp("(" + USERINFO$ + ")@"), 
                subexp("\\:(" + PORT$ + ")"), {
                    NOT_SCHEME: new RegExp(merge("[^]", ALPHA$$, DIGIT$$, "[\\+\\-\\.]"), "g"),
                    NOT_USERINFO: new RegExp(merge("[^\\%\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
                    NOT_HOST: new RegExp(merge("[^\\%\\[\\]\\:]", UNRESERVED$$, SUB_DELIMS$$), "g"),
                    NOT_PATH: new RegExp(merge("[^\\%\\/\\:\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
                    NOT_PATH_NOSCHEME: new RegExp(merge("[^\\%\\/\\@]", UNRESERVED$$, SUB_DELIMS$$), "g"),
                    NOT_QUERY: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]", IPRIVATE$$), "g"),
                    NOT_FRAGMENT: new RegExp(merge("[^\\%]", UNRESERVED$$, SUB_DELIMS$$, "[\\:\\@\\/\\?]"), "g"),
                    ESCAPE: new RegExp(merge("[^]", UNRESERVED$$, SUB_DELIMS$$), "g"),
                    UNRESERVED: new RegExp(UNRESERVED$$, "g"),
                    OTHER_CHARS: new RegExp(merge("[^\\%]", UNRESERVED$$, RESERVED$$), "g"),
                    PCT_ENCODED: new RegExp(PCT_ENCODED$, "g"),
                    IPV4ADDRESS: new RegExp("^(" + IPV4ADDRESS$ + ")$"),
                    IPV6ADDRESS: new RegExp("^\\[?(" + IPV6ADDRESS$ + ")" + subexp(subexp("\\%25|\\%(?!" + HEXDIG$$ + "{2})") + "(" + ZONEID$ + ")") + "?\\]?$")
                };
            }
            var URI_PROTOCOL = buildExps(!1), IRI_PROTOCOL = buildExps(!0), slicedToArray = function() {
                function sliceIterator(arr, i) {
                    var _arr = [], _n = !0, _d = !1, _e = void 0;
                    try {
                        for (var _s, _i = arr[Symbol.iterator](); !(_n = (_s = _i.next()).done) && (_arr.push(_s.value), 
                        !i || _arr.length !== i); _n = !0) ;
                    } catch (err) {
                        _d = !0, _e = err;
                    } finally {
                        try {
                            !_n && _i.return && _i.return();
                        } finally {
                            if (_d) throw _e;
                        }
                    }
                    return _arr;
                }
                return function(arr, i) {
                    if (Array.isArray(arr)) return arr;
                    if (Symbol.iterator in Object(arr)) return sliceIterator(arr, i);
                    throw new TypeError("Invalid attempt to destructure non-iterable instance");
                };
            }(), toConsumableArray = function(arr) {
                if (Array.isArray(arr)) {
                    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];
                    return arr2;
                }
                return Array.from(arr);
            }, maxInt = 2147483647, base = 36, tMin = 1, tMax = 26, skew = 38, damp = 700, initialBias = 72, initialN = 128, delimiter = "-", regexPunycode = /^xn--/, regexNonASCII = /[^\0-\x7E]/, regexSeparators = /[\x2E\u3002\uFF0E\uFF61]/g, errors = {
                overflow: "Overflow: input needs wider integers to process",
                "not-basic": "Illegal input >= 0x80 (not a basic code point)",
                "invalid-input": "Invalid input"
            }, baseMinusTMin = base - tMin, floor = Math.floor, stringFromCharCode = String.fromCharCode;
            function error$1(type) {
                throw new RangeError(errors[type]);
            }
            function map(array, fn) {
                for (var result = [], length = array.length; length--; ) result[length] = fn(array[length]);
                return result;
            }
            function mapDomain(string, fn) {
                var parts = string.split("@"), result = "";
                return parts.length > 1 && (result = parts[0] + "@", string = parts[1]), result + map((string = string.replace(regexSeparators, ".")).split("."), fn).join(".");
            }
            function ucs2decode(string) {
                for (var output = [], counter = 0, length = string.length; counter < length; ) {
                    var value = string.charCodeAt(counter++);
                    if (value >= 55296 && value <= 56319 && counter < length) {
                        var extra = string.charCodeAt(counter++);
                        56320 == (64512 & extra) ? output.push(((1023 & value) << 10) + (1023 & extra) + 65536) : (output.push(value), 
                        counter--);
                    } else output.push(value);
                }
                return output;
            }
            var basicToDigit = function(codePoint) {
                return codePoint - 48 < 10 ? codePoint - 22 : codePoint - 65 < 26 ? codePoint - 65 : codePoint - 97 < 26 ? codePoint - 97 : base;
            }, digitToBasic = function(digit, flag) {
                return digit + 22 + 75 * (digit < 26) - ((0 != flag) << 5);
            }, adapt = function(delta, numPoints, firstTime) {
                var k = 0;
                for (delta = firstTime ? floor(delta / damp) : delta >> 1, delta += floor(delta / numPoints); delta > baseMinusTMin * tMax >> 1; k += base) delta = floor(delta / baseMinusTMin);
                return floor(k + (baseMinusTMin + 1) * delta / (delta + skew));
            }, decode = function(input) {
                var output = [], inputLength = input.length, i = 0, n = initialN, bias = initialBias, basic = input.lastIndexOf(delimiter);
                basic < 0 && (basic = 0);
                for (var j = 0; j < basic; ++j) input.charCodeAt(j) >= 128 && error$1("not-basic"), 
                output.push(input.charCodeAt(j));
                for (var index = basic > 0 ? basic + 1 : 0; index < inputLength; ) {
                    for (var oldi = i, w = 1, k = base; ;k += base) {
                        index >= inputLength && error$1("invalid-input");
                        var digit = basicToDigit(input.charCodeAt(index++));
                        (digit >= base || digit > floor((maxInt - i) / w)) && error$1("overflow"), i += digit * w;
                        var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                        if (digit < t) break;
                        var baseMinusT = base - t;
                        w > floor(maxInt / baseMinusT) && error$1("overflow"), w *= baseMinusT;
                    }
                    var out = output.length + 1;
                    bias = adapt(i - oldi, out, 0 == oldi), floor(i / out) > maxInt - n && error$1("overflow"), 
                    n += floor(i / out), i %= out, output.splice(i++, 0, n);
                }
                return String.fromCodePoint.apply(String, output);
            }, encode = function(input) {
                var output = [], inputLength = (input = ucs2decode(input)).length, n = initialN, delta = 0, bias = initialBias, _iteratorNormalCompletion = !0, _didIteratorError = !1, _iteratorError = void 0;
                try {
                    for (var _step, _iterator = input[Symbol.iterator](); !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = !0) {
                        var _currentValue2 = _step.value;
                        _currentValue2 < 128 && output.push(stringFromCharCode(_currentValue2));
                    }
                } catch (err) {
                    _didIteratorError = !0, _iteratorError = err;
                } finally {
                    try {
                        !_iteratorNormalCompletion && _iterator.return && _iterator.return();
                    } finally {
                        if (_didIteratorError) throw _iteratorError;
                    }
                }
                var basicLength = output.length, handledCPCount = basicLength;
                for (basicLength && output.push(delimiter); handledCPCount < inputLength; ) {
                    var m = maxInt, _iteratorNormalCompletion2 = !0, _didIteratorError2 = !1, _iteratorError2 = void 0;
                    try {
                        for (var _step2, _iterator2 = input[Symbol.iterator](); !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = !0) {
                            var currentValue = _step2.value;
                            currentValue >= n && currentValue < m && (m = currentValue);
                        }
                    } catch (err) {
                        _didIteratorError2 = !0, _iteratorError2 = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion2 && _iterator2.return && _iterator2.return();
                        } finally {
                            if (_didIteratorError2) throw _iteratorError2;
                        }
                    }
                    var handledCPCountPlusOne = handledCPCount + 1;
                    m - n > floor((maxInt - delta) / handledCPCountPlusOne) && error$1("overflow"), 
                    delta += (m - n) * handledCPCountPlusOne, n = m;
                    var _iteratorNormalCompletion3 = !0, _didIteratorError3 = !1, _iteratorError3 = void 0;
                    try {
                        for (var _step3, _iterator3 = input[Symbol.iterator](); !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = !0) {
                            var _currentValue = _step3.value;
                            if (_currentValue < n && ++delta > maxInt && error$1("overflow"), _currentValue == n) {
                                for (var q = delta, k = base; ;k += base) {
                                    var t = k <= bias ? tMin : k >= bias + tMax ? tMax : k - bias;
                                    if (q < t) break;
                                    var qMinusT = q - t, baseMinusT = base - t;
                                    output.push(stringFromCharCode(digitToBasic(t + qMinusT % baseMinusT, 0))), q = floor(qMinusT / baseMinusT);
                                }
                                output.push(stringFromCharCode(digitToBasic(q, 0))), bias = adapt(delta, handledCPCountPlusOne, handledCPCount == basicLength), 
                                delta = 0, ++handledCPCount;
                            }
                        }
                    } catch (err) {
                        _didIteratorError3 = !0, _iteratorError3 = err;
                    } finally {
                        try {
                            !_iteratorNormalCompletion3 && _iterator3.return && _iterator3.return();
                        } finally {
                            if (_didIteratorError3) throw _iteratorError3;
                        }
                    }
                    ++delta, ++n;
                }
                return output.join("");
            }, toUnicode = function(input) {
                return mapDomain(input, (function(string) {
                    return regexPunycode.test(string) ? decode(string.slice(4).toLowerCase()) : string;
                }));
            }, toASCII = function(input) {
                return mapDomain(input, (function(string) {
                    return regexNonASCII.test(string) ? "xn--" + encode(string) : string;
                }));
            }, punycode = {
                version: "2.1.0",
                ucs2: {
                    decode: ucs2decode,
                    encode: function(array) {
                        return String.fromCodePoint.apply(String, toConsumableArray(array));
                    }
                },
                decode,
                encode,
                toASCII,
                toUnicode
            }, SCHEMES = {};
            function pctEncChar(chr) {
                var c = chr.charCodeAt(0);
                return c < 16 ? "%0" + c.toString(16).toUpperCase() : c < 128 ? "%" + c.toString(16).toUpperCase() : c < 2048 ? "%" + (c >> 6 | 192).toString(16).toUpperCase() + "%" + (63 & c | 128).toString(16).toUpperCase() : "%" + (c >> 12 | 224).toString(16).toUpperCase() + "%" + (c >> 6 & 63 | 128).toString(16).toUpperCase() + "%" + (63 & c | 128).toString(16).toUpperCase();
            }
            function pctDecChars(str) {
                for (var newStr = "", i = 0, il = str.length; i < il; ) {
                    var c = parseInt(str.substr(i + 1, 2), 16);
                    if (c < 128) newStr += String.fromCharCode(c), i += 3; else if (c >= 194 && c < 224) {
                        if (il - i >= 6) {
                            var c2 = parseInt(str.substr(i + 4, 2), 16);
                            newStr += String.fromCharCode((31 & c) << 6 | 63 & c2);
                        } else newStr += str.substr(i, 6);
                        i += 6;
                    } else if (c >= 224) {
                        if (il - i >= 9) {
                            var _c = parseInt(str.substr(i + 4, 2), 16), c3 = parseInt(str.substr(i + 7, 2), 16);
                            newStr += String.fromCharCode((15 & c) << 12 | (63 & _c) << 6 | 63 & c3);
                        } else newStr += str.substr(i, 9);
                        i += 9;
                    } else newStr += str.substr(i, 3), i += 3;
                }
                return newStr;
            }
            function _normalizeComponentEncoding(components, protocol) {
                function decodeUnreserved(str) {
                    var decStr = pctDecChars(str);
                    return decStr.match(protocol.UNRESERVED) ? decStr : str;
                }
                return components.scheme && (components.scheme = String(components.scheme).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_SCHEME, "")), 
                void 0 !== components.userinfo && (components.userinfo = String(components.userinfo).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_USERINFO, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase)), 
                void 0 !== components.host && (components.host = String(components.host).replace(protocol.PCT_ENCODED, decodeUnreserved).toLowerCase().replace(protocol.NOT_HOST, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase)), 
                void 0 !== components.path && (components.path = String(components.path).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(components.scheme ? protocol.NOT_PATH : protocol.NOT_PATH_NOSCHEME, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase)), 
                void 0 !== components.query && (components.query = String(components.query).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_QUERY, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase)), 
                void 0 !== components.fragment && (components.fragment = String(components.fragment).replace(protocol.PCT_ENCODED, decodeUnreserved).replace(protocol.NOT_FRAGMENT, pctEncChar).replace(protocol.PCT_ENCODED, toUpperCase)), 
                components;
            }
            function _stripLeadingZeros(str) {
                return str.replace(/^0*(.*)/, "$1") || "0";
            }
            function _normalizeIPv4(host, protocol) {
                var matches = host.match(protocol.IPV4ADDRESS) || [], address = slicedToArray(matches, 2)[1];
                return address ? address.split(".").map(_stripLeadingZeros).join(".") : host;
            }
            function _normalizeIPv6(host, protocol) {
                var matches = host.match(protocol.IPV6ADDRESS) || [], _matches2 = slicedToArray(matches, 3), address = _matches2[1], zone = _matches2[2];
                if (address) {
                    for (var _address$toLowerCase$ = address.toLowerCase().split("::").reverse(), _address$toLowerCase$2 = slicedToArray(_address$toLowerCase$, 2), last = _address$toLowerCase$2[0], first = _address$toLowerCase$2[1], firstFields = first ? first.split(":").map(_stripLeadingZeros) : [], lastFields = last.split(":").map(_stripLeadingZeros), isLastFieldIPv4Address = protocol.IPV4ADDRESS.test(lastFields[lastFields.length - 1]), fieldCount = isLastFieldIPv4Address ? 7 : 8, lastFieldsStart = lastFields.length - fieldCount, fields = Array(fieldCount), x = 0; x < fieldCount; ++x) fields[x] = firstFields[x] || lastFields[lastFieldsStart + x] || "";
                    isLastFieldIPv4Address && (fields[fieldCount - 1] = _normalizeIPv4(fields[fieldCount - 1], protocol));
                    var longestZeroFields = fields.reduce((function(acc, field, index) {
                        if (!field || "0" === field) {
                            var lastLongest = acc[acc.length - 1];
                            lastLongest && lastLongest.index + lastLongest.length === index ? lastLongest.length++ : acc.push({
                                index,
                                length: 1
                            });
                        }
                        return acc;
                    }), []).sort((function(a, b) {
                        return b.length - a.length;
                    }))[0], newHost = void 0;
                    if (longestZeroFields && longestZeroFields.length > 1) {
                        var newFirst = fields.slice(0, longestZeroFields.index), newLast = fields.slice(longestZeroFields.index + longestZeroFields.length);
                        newHost = newFirst.join(":") + "::" + newLast.join(":");
                    } else newHost = fields.join(":");
                    return zone && (newHost += "%" + zone), newHost;
                }
                return host;
            }
            var URI_PARSE = /^(?:([^:\/?#]+):)?(?:\/\/((?:([^\/?#@]*)@)?(\[[^\/?#\]]+\]|[^\/?#:]*)(?:\:(\d*))?))?([^?#]*)(?:\?([^#]*))?(?:#((?:.|\n|\r)*))?/i, NO_MATCH_IS_UNDEFINED = void 0 === "".match(/(){0}/)[1];
            function parse(uriString) {
                var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, components = {}, protocol = !1 !== options.iri ? IRI_PROTOCOL : URI_PROTOCOL;
                "suffix" === options.reference && (uriString = (options.scheme ? options.scheme + ":" : "") + "//" + uriString);
                var matches = uriString.match(URI_PARSE);
                if (matches) {
                    NO_MATCH_IS_UNDEFINED ? (components.scheme = matches[1], components.userinfo = matches[3], 
                    components.host = matches[4], components.port = parseInt(matches[5], 10), components.path = matches[6] || "", 
                    components.query = matches[7], components.fragment = matches[8], isNaN(components.port) && (components.port = matches[5])) : (components.scheme = matches[1] || void 0, 
                    components.userinfo = -1 !== uriString.indexOf("@") ? matches[3] : void 0, components.host = -1 !== uriString.indexOf("//") ? matches[4] : void 0, 
                    components.port = parseInt(matches[5], 10), components.path = matches[6] || "", 
                    components.query = -1 !== uriString.indexOf("?") ? matches[7] : void 0, components.fragment = -1 !== uriString.indexOf("#") ? matches[8] : void 0, 
                    isNaN(components.port) && (components.port = uriString.match(/\/\/(?:.|\n)*\:(?:\/|\?|\#|$)/) ? matches[4] : void 0)), 
                    components.host && (components.host = _normalizeIPv6(_normalizeIPv4(components.host, protocol), protocol)), 
                    void 0 !== components.scheme || void 0 !== components.userinfo || void 0 !== components.host || void 0 !== components.port || components.path || void 0 !== components.query ? void 0 === components.scheme ? components.reference = "relative" : void 0 === components.fragment ? components.reference = "absolute" : components.reference = "uri" : components.reference = "same-document", 
                    options.reference && "suffix" !== options.reference && options.reference !== components.reference && (components.error = components.error || "URI is not a " + options.reference + " reference.");
                    var schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
                    if (options.unicodeSupport || schemeHandler && schemeHandler.unicodeSupport) _normalizeComponentEncoding(components, protocol); else {
                        if (components.host && (options.domainHost || schemeHandler && schemeHandler.domainHost)) try {
                            components.host = punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                        } catch (e) {
                            components.error = components.error || "Host's domain name can not be converted to ASCII via punycode: " + e;
                        }
                        _normalizeComponentEncoding(components, URI_PROTOCOL);
                    }
                    schemeHandler && schemeHandler.parse && schemeHandler.parse(components, options);
                } else components.error = components.error || "URI can not be parsed.";
                return components;
            }
            function _recomposeAuthority(components, options) {
                var protocol = !1 !== options.iri ? IRI_PROTOCOL : URI_PROTOCOL, uriTokens = [];
                return void 0 !== components.userinfo && (uriTokens.push(components.userinfo), uriTokens.push("@")), 
                void 0 !== components.host && uriTokens.push(_normalizeIPv6(_normalizeIPv4(String(components.host), protocol), protocol).replace(protocol.IPV6ADDRESS, (function(_, $1, $2) {
                    return "[" + $1 + ($2 ? "%25" + $2 : "") + "]";
                }))), "number" != typeof components.port && "string" != typeof components.port || (uriTokens.push(":"), 
                uriTokens.push(String(components.port))), uriTokens.length ? uriTokens.join("") : void 0;
            }
            var RDS1 = /^\.\.?\//, RDS2 = /^\/\.(\/|$)/, RDS3 = /^\/\.\.(\/|$)/, RDS5 = /^\/?(?:.|\n)*?(?=\/|$)/;
            function removeDotSegments(input) {
                for (var output = []; input.length; ) if (input.match(RDS1)) input = input.replace(RDS1, ""); else if (input.match(RDS2)) input = input.replace(RDS2, "/"); else if (input.match(RDS3)) input = input.replace(RDS3, "/"), 
                output.pop(); else if ("." === input || ".." === input) input = ""; else {
                    var im = input.match(RDS5);
                    if (!im) throw new Error("Unexpected dot segment condition");
                    var s = im[0];
                    input = input.slice(s.length), output.push(s);
                }
                return output.join("");
            }
            function serialize(components) {
                var options = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : {}, protocol = options.iri ? IRI_PROTOCOL : URI_PROTOCOL, uriTokens = [], schemeHandler = SCHEMES[(options.scheme || components.scheme || "").toLowerCase()];
                if (schemeHandler && schemeHandler.serialize && schemeHandler.serialize(components, options), 
                components.host) if (protocol.IPV6ADDRESS.test(components.host)) ; else if (options.domainHost || schemeHandler && schemeHandler.domainHost) try {
                    components.host = options.iri ? punycode.toUnicode(components.host) : punycode.toASCII(components.host.replace(protocol.PCT_ENCODED, pctDecChars).toLowerCase());
                } catch (e) {
                    components.error = components.error || "Host's domain name can not be converted to " + (options.iri ? "Unicode" : "ASCII") + " via punycode: " + e;
                }
                _normalizeComponentEncoding(components, protocol), "suffix" !== options.reference && components.scheme && (uriTokens.push(components.scheme), 
                uriTokens.push(":"));
                var authority = _recomposeAuthority(components, options);
                if (void 0 !== authority && ("suffix" !== options.reference && uriTokens.push("//"), 
                uriTokens.push(authority), components.path && "/" !== components.path.charAt(0) && uriTokens.push("/")), 
                void 0 !== components.path) {
                    var s = components.path;
                    options.absolutePath || schemeHandler && schemeHandler.absolutePath || (s = removeDotSegments(s)), 
                    void 0 === authority && (s = s.replace(/^\/\//, "/%2F")), uriTokens.push(s);
                }
                return void 0 !== components.query && (uriTokens.push("?"), uriTokens.push(components.query)), 
                void 0 !== components.fragment && (uriTokens.push("#"), uriTokens.push(components.fragment)), 
                uriTokens.join("");
            }
            function resolveComponents(base, relative) {
                var options = arguments.length > 2 && void 0 !== arguments[2] ? arguments[2] : {}, target = {};
                return arguments[3] || (base = parse(serialize(base, options), options), relative = parse(serialize(relative, options), options)), 
                !(options = options || {}).tolerant && relative.scheme ? (target.scheme = relative.scheme, 
                target.userinfo = relative.userinfo, target.host = relative.host, target.port = relative.port, 
                target.path = removeDotSegments(relative.path || ""), target.query = relative.query) : (void 0 !== relative.userinfo || void 0 !== relative.host || void 0 !== relative.port ? (target.userinfo = relative.userinfo, 
                target.host = relative.host, target.port = relative.port, target.path = removeDotSegments(relative.path || ""), 
                target.query = relative.query) : (relative.path ? ("/" === relative.path.charAt(0) ? target.path = removeDotSegments(relative.path) : (void 0 === base.userinfo && void 0 === base.host && void 0 === base.port || base.path ? base.path ? target.path = base.path.slice(0, base.path.lastIndexOf("/") + 1) + relative.path : target.path = relative.path : target.path = "/" + relative.path, 
                target.path = removeDotSegments(target.path)), target.query = relative.query) : (target.path = base.path, 
                void 0 !== relative.query ? target.query = relative.query : target.query = base.query), 
                target.userinfo = base.userinfo, target.host = base.host, target.port = base.port), 
                target.scheme = base.scheme), target.fragment = relative.fragment, target;
            }
            function resolve(baseURI, relativeURI, options) {
                var schemelessOptions = assign({
                    scheme: "null"
                }, options);
                return serialize(resolveComponents(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, !0), schemelessOptions);
            }
            function normalize(uri, options) {
                return "string" == typeof uri ? uri = serialize(parse(uri, options), options) : "object" === typeOf(uri) && (uri = parse(serialize(uri, options), options)), 
                uri;
            }
            function equal(uriA, uriB, options) {
                return "string" == typeof uriA ? uriA = serialize(parse(uriA, options), options) : "object" === typeOf(uriA) && (uriA = serialize(uriA, options)), 
                "string" == typeof uriB ? uriB = serialize(parse(uriB, options), options) : "object" === typeOf(uriB) && (uriB = serialize(uriB, options)), 
                uriA === uriB;
            }
            function escapeComponent(str, options) {
                return str && str.toString().replace(options && options.iri ? IRI_PROTOCOL.ESCAPE : URI_PROTOCOL.ESCAPE, pctEncChar);
            }
            function unescapeComponent(str, options) {
                return str && str.toString().replace(options && options.iri ? IRI_PROTOCOL.PCT_ENCODED : URI_PROTOCOL.PCT_ENCODED, pctDecChars);
            }
            var handler = {
                scheme: "http",
                domainHost: !0,
                parse: function(components, options) {
                    return components.host || (components.error = components.error || "HTTP URIs must have a host."), 
                    components;
                },
                serialize: function(components, options) {
                    var secure = "https" === String(components.scheme).toLowerCase();
                    return components.port !== (secure ? 443 : 80) && "" !== components.port || (components.port = void 0), 
                    components.path || (components.path = "/"), components;
                }
            }, handler$1 = {
                scheme: "https",
                domainHost: handler.domainHost,
                parse: handler.parse,
                serialize: handler.serialize
            };
            function isSecure(wsComponents) {
                return "boolean" == typeof wsComponents.secure ? wsComponents.secure : "wss" === String(wsComponents.scheme).toLowerCase();
            }
            var handler$2 = {
                scheme: "ws",
                domainHost: !0,
                parse: function(components, options) {
                    var wsComponents = components;
                    return wsComponents.secure = isSecure(wsComponents), wsComponents.resourceName = (wsComponents.path || "/") + (wsComponents.query ? "?" + wsComponents.query : ""), 
                    wsComponents.path = void 0, wsComponents.query = void 0, wsComponents;
                },
                serialize: function(wsComponents, options) {
                    if (wsComponents.port !== (isSecure(wsComponents) ? 443 : 80) && "" !== wsComponents.port || (wsComponents.port = void 0), 
                    "boolean" == typeof wsComponents.secure && (wsComponents.scheme = wsComponents.secure ? "wss" : "ws", 
                    wsComponents.secure = void 0), wsComponents.resourceName) {
                        var _wsComponents$resourc = wsComponents.resourceName.split("?"), _wsComponents$resourc2 = slicedToArray(_wsComponents$resourc, 2), path = _wsComponents$resourc2[0], query = _wsComponents$resourc2[1];
                        wsComponents.path = path && "/" !== path ? path : void 0, wsComponents.query = query, 
                        wsComponents.resourceName = void 0;
                    }
                    return wsComponents.fragment = void 0, wsComponents;
                }
            }, handler$3 = {
                scheme: "wss",
                domainHost: handler$2.domainHost,
                parse: handler$2.parse,
                serialize: handler$2.serialize
            }, O = {}, UNRESERVED$$ = "[A-Za-z0-9\\-\\.\\_\\~\\xA0-\\u200D\\u2010-\\u2029\\u202F-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFEF]", HEXDIG$$ = "[0-9A-Fa-f]", PCT_ENCODED$ = subexp(subexp("%[EFef]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%[89A-Fa-f]" + HEXDIG$$ + "%" + HEXDIG$$ + HEXDIG$$) + "|" + subexp("%" + HEXDIG$$ + HEXDIG$$)), ATEXT$$ = "[A-Za-z0-9\\!\\$\\%\\'\\*\\+\\-\\^\\_\\`\\{\\|\\}\\~]", VCHAR$$ = merge("[\\!\\$\\%\\'\\(\\)\\*\\+\\,\\-\\.0-9\\<\\>A-Z\\x5E-\\x7E]", '[\\"\\\\]'), SOME_DELIMS$$ = "[\\!\\$\\'\\(\\)\\*\\+\\,\\;\\:\\@]", UNRESERVED = new RegExp(UNRESERVED$$, "g"), PCT_ENCODED = new RegExp(PCT_ENCODED$, "g"), NOT_LOCAL_PART = new RegExp(merge("[^]", ATEXT$$, "[\\.]", '[\\"]', VCHAR$$), "g"), NOT_HFNAME = new RegExp(merge("[^]", UNRESERVED$$, SOME_DELIMS$$), "g"), NOT_HFVALUE = NOT_HFNAME;
            function decodeUnreserved(str) {
                var decStr = pctDecChars(str);
                return decStr.match(UNRESERVED) ? decStr : str;
            }
            var handler$4 = {
                scheme: "mailto",
                parse: function(components, options) {
                    var mailtoComponents = components, to = mailtoComponents.to = mailtoComponents.path ? mailtoComponents.path.split(",") : [];
                    if (mailtoComponents.path = void 0, mailtoComponents.query) {
                        for (var unknownHeaders = !1, headers = {}, hfields = mailtoComponents.query.split("&"), x = 0, xl = hfields.length; x < xl; ++x) {
                            var hfield = hfields[x].split("=");
                            switch (hfield[0]) {
                              case "to":
                                for (var toAddrs = hfield[1].split(","), _x = 0, _xl = toAddrs.length; _x < _xl; ++_x) to.push(toAddrs[_x]);
                                break;

                              case "subject":
                                mailtoComponents.subject = unescapeComponent(hfield[1], options);
                                break;

                              case "body":
                                mailtoComponents.body = unescapeComponent(hfield[1], options);
                                break;

                              default:
                                unknownHeaders = !0, headers[unescapeComponent(hfield[0], options)] = unescapeComponent(hfield[1], options);
                            }
                        }
                        unknownHeaders && (mailtoComponents.headers = headers);
                    }
                    mailtoComponents.query = void 0;
                    for (var _x2 = 0, _xl2 = to.length; _x2 < _xl2; ++_x2) {
                        var addr = to[_x2].split("@");
                        if (addr[0] = unescapeComponent(addr[0]), options.unicodeSupport) addr[1] = unescapeComponent(addr[1], options).toLowerCase(); else try {
                            addr[1] = punycode.toASCII(unescapeComponent(addr[1], options).toLowerCase());
                        } catch (e) {
                            mailtoComponents.error = mailtoComponents.error || "Email address's domain name can not be converted to ASCII via punycode: " + e;
                        }
                        to[_x2] = addr.join("@");
                    }
                    return mailtoComponents;
                },
                serialize: function(mailtoComponents, options) {
                    var components = mailtoComponents, to = toArray(mailtoComponents.to);
                    if (to) {
                        for (var x = 0, xl = to.length; x < xl; ++x) {
                            var toAddr = String(to[x]), atIdx = toAddr.lastIndexOf("@"), localPart = toAddr.slice(0, atIdx).replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_LOCAL_PART, pctEncChar), domain = toAddr.slice(atIdx + 1);
                            try {
                                domain = options.iri ? punycode.toUnicode(domain) : punycode.toASCII(unescapeComponent(domain, options).toLowerCase());
                            } catch (e) {
                                components.error = components.error || "Email address's domain name can not be converted to " + (options.iri ? "Unicode" : "ASCII") + " via punycode: " + e;
                            }
                            to[x] = localPart + "@" + domain;
                        }
                        components.path = to.join(",");
                    }
                    var headers = mailtoComponents.headers = mailtoComponents.headers || {};
                    mailtoComponents.subject && (headers.subject = mailtoComponents.subject), mailtoComponents.body && (headers.body = mailtoComponents.body);
                    var fields = [];
                    for (var name in headers) headers[name] !== O[name] && fields.push(name.replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFNAME, pctEncChar) + "=" + headers[name].replace(PCT_ENCODED, decodeUnreserved).replace(PCT_ENCODED, toUpperCase).replace(NOT_HFVALUE, pctEncChar));
                    return fields.length && (components.query = fields.join("&")), components;
                }
            }, URN_PARSE = /^([^\:]+)\:(.*)/, handler$5 = {
                scheme: "urn",
                parse: function(components, options) {
                    var matches = components.path && components.path.match(URN_PARSE), urnComponents = components;
                    if (matches) {
                        var scheme = options.scheme || urnComponents.scheme || "urn", nid = matches[1].toLowerCase(), nss = matches[2], urnScheme = scheme + ":" + (options.nid || nid), schemeHandler = SCHEMES[urnScheme];
                        urnComponents.nid = nid, urnComponents.nss = nss, urnComponents.path = void 0, schemeHandler && (urnComponents = schemeHandler.parse(urnComponents, options));
                    } else urnComponents.error = urnComponents.error || "URN can not be parsed.";
                    return urnComponents;
                },
                serialize: function(urnComponents, options) {
                    var scheme = options.scheme || urnComponents.scheme || "urn", nid = urnComponents.nid, urnScheme = scheme + ":" + (options.nid || nid), schemeHandler = SCHEMES[urnScheme];
                    schemeHandler && (urnComponents = schemeHandler.serialize(urnComponents, options));
                    var uriComponents = urnComponents, nss = urnComponents.nss;
                    return uriComponents.path = (nid || options.nid) + ":" + nss, uriComponents;
                }
            }, UUID = /^[0-9A-Fa-f]{8}(?:\-[0-9A-Fa-f]{4}){3}\-[0-9A-Fa-f]{12}$/, handler$6 = {
                scheme: "urn:uuid",
                parse: function(urnComponents, options) {
                    var uuidComponents = urnComponents;
                    return uuidComponents.uuid = uuidComponents.nss, uuidComponents.nss = void 0, options.tolerant || uuidComponents.uuid && uuidComponents.uuid.match(UUID) || (uuidComponents.error = uuidComponents.error || "UUID is not valid."), 
                    uuidComponents;
                },
                serialize: function(uuidComponents, options) {
                    var urnComponents = uuidComponents;
                    return urnComponents.nss = (uuidComponents.uuid || "").toLowerCase(), urnComponents;
                }
            };
            SCHEMES[handler.scheme] = handler, SCHEMES[handler$1.scheme] = handler$1, SCHEMES[handler$2.scheme] = handler$2, 
            SCHEMES[handler$3.scheme] = handler$3, SCHEMES[handler$4.scheme] = handler$4, SCHEMES[handler$5.scheme] = handler$5, 
            SCHEMES[handler$6.scheme] = handler$6, exports.SCHEMES = SCHEMES, exports.pctEncChar = pctEncChar, 
            exports.pctDecChars = pctDecChars, exports.parse = parse, exports.removeDotSegments = removeDotSegments, 
            exports.serialize = serialize, exports.resolveComponents = resolveComponents, exports.resolve = resolve, 
            exports.normalize = normalize, exports.equal = equal, exports.escapeComponent = escapeComponent, 
            exports.unescapeComponent = unescapeComponent, Object.defineProperty(exports, "__esModule", {
                value: !0
            });
        }(exports);
    },
    3278: module => {
        "use strict";
        module.exports = function(Yallist) {
            Yallist.prototype[Symbol.iterator] = function*() {
                for (let walker = this.head; walker; walker = walker.next) yield walker.value;
            };
        };
    },
    1455: (module, __unused_webpack_exports, __webpack_require__) => {
        "use strict";
        function Yallist(list) {
            var self = this;
            if (self instanceof Yallist || (self = new Yallist), self.tail = null, self.head = null, 
            self.length = 0, list && "function" == typeof list.forEach) list.forEach((function(item) {
                self.push(item);
            })); else if (arguments.length > 0) for (var i = 0, l = arguments.length; i < l; i++) self.push(arguments[i]);
            return self;
        }
        function insert(self, node, value) {
            var inserted = node === self.head ? new Node(value, null, node, self) : new Node(value, node, node.next, self);
            return null === inserted.next && (self.tail = inserted), null === inserted.prev && (self.head = inserted), 
            self.length++, inserted;
        }
        function push(self, item) {
            self.tail = new Node(item, self.tail, null, self), self.head || (self.head = self.tail), 
            self.length++;
        }
        function unshift(self, item) {
            self.head = new Node(item, null, self.head, self), self.tail || (self.tail = self.head), 
            self.length++;
        }
        function Node(value, prev, next, list) {
            if (!(this instanceof Node)) return new Node(value, prev, next, list);
            this.list = list, this.value = value, prev ? (prev.next = this, this.prev = prev) : this.prev = null, 
            next ? (next.prev = this, this.next = next) : this.next = null;
        }
        module.exports = Yallist, Yallist.Node = Node, Yallist.create = Yallist, Yallist.prototype.removeNode = function(node) {
            if (node.list !== this) throw new Error("removing node which does not belong to this list");
            var next = node.next, prev = node.prev;
            return next && (next.prev = prev), prev && (prev.next = next), node === this.head && (this.head = next), 
            node === this.tail && (this.tail = prev), node.list.length--, node.next = null, 
            node.prev = null, node.list = null, next;
        }, Yallist.prototype.unshiftNode = function(node) {
            if (node !== this.head) {
                node.list && node.list.removeNode(node);
                var head = this.head;
                node.list = this, node.next = head, head && (head.prev = node), this.head = node, 
                this.tail || (this.tail = node), this.length++;
            }
        }, Yallist.prototype.pushNode = function(node) {
            if (node !== this.tail) {
                node.list && node.list.removeNode(node);
                var tail = this.tail;
                node.list = this, node.prev = tail, tail && (tail.next = node), this.tail = node, 
                this.head || (this.head = node), this.length++;
            }
        }, Yallist.prototype.push = function() {
            for (var i = 0, l = arguments.length; i < l; i++) push(this, arguments[i]);
            return this.length;
        }, Yallist.prototype.unshift = function() {
            for (var i = 0, l = arguments.length; i < l; i++) unshift(this, arguments[i]);
            return this.length;
        }, Yallist.prototype.pop = function() {
            if (this.tail) {
                var res = this.tail.value;
                return this.tail = this.tail.prev, this.tail ? this.tail.next = null : this.head = null, 
                this.length--, res;
            }
        }, Yallist.prototype.shift = function() {
            if (this.head) {
                var res = this.head.value;
                return this.head = this.head.next, this.head ? this.head.prev = null : this.tail = null, 
                this.length--, res;
            }
        }, Yallist.prototype.forEach = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.head, i = 0; null !== walker; i++) fn.call(thisp, walker.value, i, this), 
            walker = walker.next;
        }, Yallist.prototype.forEachReverse = function(fn, thisp) {
            thisp = thisp || this;
            for (var walker = this.tail, i = this.length - 1; null !== walker; i--) fn.call(thisp, walker.value, i, this), 
            walker = walker.prev;
        }, Yallist.prototype.get = function(n) {
            for (var i = 0, walker = this.head; null !== walker && i < n; i++) walker = walker.next;
            if (i === n && null !== walker) return walker.value;
        }, Yallist.prototype.getReverse = function(n) {
            for (var i = 0, walker = this.tail; null !== walker && i < n; i++) walker = walker.prev;
            if (i === n && null !== walker) return walker.value;
        }, Yallist.prototype.map = function(fn, thisp) {
            thisp = thisp || this;
            for (var res = new Yallist, walker = this.head; null !== walker; ) res.push(fn.call(thisp, walker.value, this)), 
            walker = walker.next;
            return res;
        }, Yallist.prototype.mapReverse = function(fn, thisp) {
            thisp = thisp || this;
            for (var res = new Yallist, walker = this.tail; null !== walker; ) res.push(fn.call(thisp, walker.value, this)), 
            walker = walker.prev;
            return res;
        }, Yallist.prototype.reduce = function(fn, initial) {
            var acc, walker = this.head;
            if (arguments.length > 1) acc = initial; else {
                if (!this.head) throw new TypeError("Reduce of empty list with no initial value");
                walker = this.head.next, acc = this.head.value;
            }
            for (var i = 0; null !== walker; i++) acc = fn(acc, walker.value, i), walker = walker.next;
            return acc;
        }, Yallist.prototype.reduceReverse = function(fn, initial) {
            var acc, walker = this.tail;
            if (arguments.length > 1) acc = initial; else {
                if (!this.tail) throw new TypeError("Reduce of empty list with no initial value");
                walker = this.tail.prev, acc = this.tail.value;
            }
            for (var i = this.length - 1; null !== walker; i--) acc = fn(acc, walker.value, i), 
            walker = walker.prev;
            return acc;
        }, Yallist.prototype.toArray = function() {
            for (var arr = new Array(this.length), i = 0, walker = this.head; null !== walker; i++) arr[i] = walker.value, 
            walker = walker.next;
            return arr;
        }, Yallist.prototype.toArrayReverse = function() {
            for (var arr = new Array(this.length), i = 0, walker = this.tail; null !== walker; i++) arr[i] = walker.value, 
            walker = walker.prev;
            return arr;
        }, Yallist.prototype.slice = function(from, to) {
            (to = to || this.length) < 0 && (to += this.length), (from = from || 0) < 0 && (from += this.length);
            var ret = new Yallist;
            if (to < from || to < 0) return ret;
            from < 0 && (from = 0), to > this.length && (to = this.length);
            for (var i = 0, walker = this.head; null !== walker && i < from; i++) walker = walker.next;
            for (;null !== walker && i < to; i++, walker = walker.next) ret.push(walker.value);
            return ret;
        }, Yallist.prototype.sliceReverse = function(from, to) {
            (to = to || this.length) < 0 && (to += this.length), (from = from || 0) < 0 && (from += this.length);
            var ret = new Yallist;
            if (to < from || to < 0) return ret;
            from < 0 && (from = 0), to > this.length && (to = this.length);
            for (var i = this.length, walker = this.tail; null !== walker && i > to; i--) walker = walker.prev;
            for (;null !== walker && i > from; i--, walker = walker.prev) ret.push(walker.value);
            return ret;
        }, Yallist.prototype.splice = function(start, deleteCount, ...nodes) {
            start > this.length && (start = this.length - 1), start < 0 && (start = this.length + start);
            for (var i = 0, walker = this.head; null !== walker && i < start; i++) walker = walker.next;
            var ret = [];
            for (i = 0; walker && i < deleteCount; i++) ret.push(walker.value), walker = this.removeNode(walker);
            null === walker && (walker = this.tail), walker !== this.head && walker !== this.tail && (walker = walker.prev);
            for (i = 0; i < nodes.length; i++) walker = insert(this, walker, nodes[i]);
            return ret;
        }, Yallist.prototype.reverse = function() {
            for (var head = this.head, tail = this.tail, walker = head; null !== walker; walker = walker.prev) {
                var p = walker.prev;
                walker.prev = walker.next, walker.next = p;
            }
            return this.head = tail, this.tail = head, this;
        };
        try {
            __webpack_require__(3278)(Yallist);
        } catch (er) {}
    },
    2816: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.isPropertyOverride = exports.isMethodOverride = exports.isWireStruct = exports.isWireMap = exports.isWireEnum = exports.isWireDate = exports.isObjRef = exports.TOKEN_STRUCT = exports.TOKEN_MAP = exports.TOKEN_ENUM = exports.TOKEN_DATE = exports.TOKEN_INTERFACES = exports.TOKEN_REF = void 0, 
        exports.TOKEN_REF = "$jsii.byref", exports.TOKEN_INTERFACES = "$jsii.interfaces", 
        exports.TOKEN_DATE = "$jsii.date", exports.TOKEN_ENUM = "$jsii.enum", exports.TOKEN_MAP = "$jsii.map", 
        exports.TOKEN_STRUCT = "$jsii.struct", exports.isObjRef = function(value) {
            return "object" == typeof value && null !== value && exports.TOKEN_REF in value;
        }, exports.isWireDate = function(value) {
            return "object" == typeof value && null !== value && exports.TOKEN_DATE in value;
        }, exports.isWireEnum = function(value) {
            return "object" == typeof value && null !== value && exports.TOKEN_ENUM in value;
        }, exports.isWireMap = function(value) {
            return "object" == typeof value && null !== value && exports.TOKEN_MAP in value;
        }, exports.isWireStruct = function(value) {
            return "object" == typeof value && null !== value && exports.TOKEN_STRUCT in value;
        }, exports.isMethodOverride = function(value) {
            return null != value.method;
        }, exports.isPropertyOverride = function(value) {
            return null != value.property;
        };
    },
    3288: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.digestFile = void 0;
        const crypto_1 = __webpack_require__(6113), fs_1 = __webpack_require__(7147);
        exports.digestFile = function(path, ...comments) {
            const hash = (0, crypto_1.createHash)("sha256"), buffer = Buffer.alloc(16384), fd = (0, 
            fs_1.openSync)(path, "r");
            try {
                let bytesRead = 0;
                for (;(bytesRead = (0, fs_1.readSync)(fd, buffer)) > 0; ) hash.update(buffer.slice(0, bytesRead));
                for (const comment of comments) hash.update("\0"), hash.update(comment);
                return hash.digest();
            } finally {
                (0, fs_1.closeSync)(fd);
            }
        };
    },
    535: function(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var _DiskCache_root, __classPrivateFieldSet = this && this.__classPrivateFieldSet || function(receiver, state, value, kind, f) {
            if ("m" === kind) throw new TypeError("Private method is not writable");
            if ("a" === kind && !f) throw new TypeError("Private accessor was defined without a setter");
            if ("function" == typeof state ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot write private member to an object whose class did not declare it");
            return "a" === kind ? f.call(receiver, value) : f ? f.value = value : state.set(receiver, value), 
            value;
        }, __classPrivateFieldGet = this && this.__classPrivateFieldGet || function(receiver, state, kind, f) {
            if ("a" === kind && !f) throw new TypeError("Private accessor was defined without a getter");
            if ("function" == typeof state ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
            return "m" === kind ? f : "a" === kind ? f.call(receiver) : f ? f.value : state.get(receiver);
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.Entry = exports.DiskCache = void 0;
        const fs_1 = __webpack_require__(7147), lockfile_1 = __webpack_require__(2945), path_1 = __webpack_require__(4822), digest_file_1 = __webpack_require__(3288), PRUNE_AFTER_MILLISECONDS = process.env.JSII_RUNTIME_PACKAGE_CACHE_TTL ? 864e5 * parseInt(process.env.JSII_RUNTIME_PACKAGE_CACHE_TTL, 10) : 2592e6;
        class DiskCache {
            constructor(root) {
                _DiskCache_root.set(this, void 0), __classPrivateFieldSet(this, _DiskCache_root, root, "f"), 
                process.once("beforeExit", (() => this.pruneExpiredEntries()));
            }
            static inDirectory(path) {
                return null != (0, fs_1.mkdirSync)(path, {
                    recursive: !0
                }) && "darwin" === process.platform && ((0, fs_1.writeFileSync)((0, path_1.join)(path, ".nobackup"), ""), 
                (0, fs_1.writeFileSync)((0, path_1.join)(path, ".noindex"), ""), (0, fs_1.writeFileSync)((0, 
                path_1.join)(path, ".nosync"), "")), path = (0, fs_1.realpathSync)(path), this.CACHE.has(path) || this.CACHE.set(path, new DiskCache(path)), 
                this.CACHE.get(path);
            }
            entry(...key) {
                if (0 === key.length) throw new Error("Cache entry key must contain at least 1 element!");
                return new Entry((0, path_1.join)(__classPrivateFieldGet(this, _DiskCache_root, "f"), ...key.flatMap((s => s.replace(/[^@a-z0-9_.\\/-]+/g, "_").split(/[\\/]+/).map((ss => {
                    if (".." === ss) throw new Error(`A cache entry key cannot contain a '..' path segment! (${s})`);
                    return ss;
                }))))));
            }
            entryFor(path, ...comments) {
                const rawDigest = (0, digest_file_1.digestFile)(path, ...comments);
                return this.entry(...comments, rawDigest.toString("hex"));
            }
            pruneExpiredEntries() {
                const cutOff = new Date(Date.now() - PRUNE_AFTER_MILLISECONDS);
                for (const entry of this.entries()) entry.atime < cutOff && entry.lock((lockedEntry => {
                    entry.atime > cutOff || lockedEntry.delete();
                }));
                for (const dir of directoriesUnder(__classPrivateFieldGet(this, _DiskCache_root, "f"), !0)) {
                    if ("darwin" === process.platform) try {
                        (0, fs_1.rmSync)((0, path_1.join)(dir, ".DS_Store"), {
                            force: !0
                        });
                    } catch {}
                    if (0 === (0, fs_1.readdirSync)(dir).length) try {
                        (0, fs_1.rmdirSync)(dir);
                    } catch {}
                }
            }
            * entries() {
                yield* function* inDirectory(dir) {
                    if ((0, fs_1.existsSync)((0, path_1.join)(dir, ".jsii-runtime-package-cache"))) return yield new Entry(dir);
                    for (const file of directoriesUnder(dir)) yield* inDirectory(file);
                }(__classPrivateFieldGet(this, _DiskCache_root, "f"));
            }
        }
        exports.DiskCache = DiskCache, _DiskCache_root = new WeakMap, DiskCache.CACHE = new Map;
        class Entry {
            constructor(path) {
                this.path = path;
            }
            get atime() {
                try {
                    return (0, fs_1.statSync)(this.markerFile).atime;
                } catch (err) {
                    if ("ENOENT" !== err.code) throw err;
                    return new Date(0);
                }
            }
            get pathExists() {
                return (0, fs_1.existsSync)(this.path);
            }
            get lockFile() {
                return `${this.path}.lock`;
            }
            get markerFile() {
                return (0, path_1.join)(this.path, ".jsii-runtime-package-cache");
            }
            lock(cb) {
                (0, fs_1.mkdirSync)((0, path_1.dirname)(this.path), {
                    recursive: !0
                }), (0, lockfile_1.lockSync)(this.lockFile, {
                    retries: 12,
                    stale: 5e3
                });
                let disposed = !1;
                try {
                    return cb({
                        delete: () => {
                            if (disposed) throw new Error(`Cannot delete ${this.path} once the lock block was returned!`);
                            (0, fs_1.rmSync)(this.path, {
                                force: !0,
                                recursive: !0
                            });
                        },
                        write: (name, content) => {
                            if (disposed) throw new Error(`Cannot write ${(0, path_1.join)(this.path, name)} once the lock block was returned!`);
                            (0, fs_1.mkdirSync)((0, path_1.dirname)((0, path_1.join)(this.path, name)), {
                                recursive: !0
                            }), (0, fs_1.writeFileSync)((0, path_1.join)(this.path, name), content);
                        },
                        touch: () => {
                            if (disposed) throw new Error(`Cannot touch ${this.path} once the lock block was returned!`);
                            if (this.pathExists) if ((0, fs_1.existsSync)(this.markerFile)) {
                                const now = new Date;
                                (0, fs_1.utimesSync)(this.markerFile, now, now);
                            } else (0, fs_1.writeFileSync)(this.markerFile, "");
                        }
                    });
                } finally {
                    disposed = !0, (0, lockfile_1.unlockSync)(this.lockFile);
                }
            }
            read(file) {
                try {
                    return (0, fs_1.readFileSync)((0, path_1.join)(this.path, file));
                } catch (error) {
                    if ("ENOENT" === error.code) return;
                    throw error;
                }
            }
        }
        function* directoriesUnder(root, recursive = !1, ignoreErrors = !0) {
            for (const file of (0, fs_1.readdirSync)(root)) {
                const path = (0, path_1.join)(root, file);
                try {
                    (0, fs_1.statSync)(path).isDirectory() && (recursive && (yield* directoriesUnder(path, recursive, ignoreErrors)), 
                    yield path);
                } catch (error) {
                    if (!ignoreErrors) throw error;
                }
            }
        }
        exports.Entry = Entry;
    },
    7202: function(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            void 0 === k2 && (k2 = k);
            var desc = Object.getOwnPropertyDescriptor(m, k);
            desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
                enumerable: !0,
                get: function() {
                    return m[k];
                }
            }), Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            void 0 === k2 && (k2 = k), o[k2] = m[k];
        }), __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), __exportStar(__webpack_require__(535), exports);
    },
    8944: function(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            void 0 === k2 && (k2 = k);
            var desc = Object.getOwnPropertyDescriptor(m, k);
            desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
                enumerable: !0,
                get: function() {
                    return m[k];
                }
            }), Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            void 0 === k2 && (k2 = k), o[k2] = m[k];
        }), __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.api = void 0, __exportStar(__webpack_require__(2742), exports);
        const api = __webpack_require__(2816);
        exports.api = api;
    },
    2742: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.Kernel = void 0;
        const spec = __webpack_require__(1804), spec_1 = __webpack_require__(1804), cp = __webpack_require__(2081), fs_1 = __webpack_require__(7147), fs = __webpack_require__(9728), module_1 = __webpack_require__(8188), os = __webpack_require__(2037), path = __webpack_require__(4822), api = __webpack_require__(2816), api_1 = __webpack_require__(2816), link_1 = __webpack_require__(328), objects_1 = __webpack_require__(2309), onExit = __webpack_require__(6703), wire = __webpack_require__(8614), tar = __webpack_require__(4383);
        exports.Kernel = class {
            constructor(callbackHandler) {
                this.callbackHandler = callbackHandler, this.traceEnabled = !1, this.debugTimingEnabled = !1, 
                this.assemblies = new Map, this.objects = new objects_1.ObjectTable(this._typeInfoForFqn.bind(this)), 
                this.cbs = new Map, this.waiting = new Map, this.promises = new Map, this.nextid = 2e4;
            }
            load(req) {
                return this._debugTime((() => this._load(req)), `load(${JSON.stringify(req, null, 2)})`);
            }
            _load(req) {
                var _a, _b, _c;
                if (this._debug("load", req), "assembly" in req) throw new Error('`assembly` field is deprecated for "load", use `name`, `version` and `tarball` instead');
                const pkgname = req.name, pkgver = req.version, packageDir = this._getPackageDir(pkgname);
                if (fs.pathExistsSync(packageDir)) {
                    const epkg = fs.readJsonSync(path.join(packageDir, "package.json"));
                    if (epkg.version !== pkgver) throw new Error(`Multiple versions ${pkgver} and ${epkg.version} of the package '${pkgname}' cannot be loaded together since this is unsupported by some runtime environments`);
                    this._debug("look up already-loaded assembly", pkgname);
                    const assm = this.assemblies.get(pkgname);
                    return {
                        assembly: assm.metadata.name,
                        types: Object.keys(null !== (_a = assm.metadata.types) && void 0 !== _a ? _a : {}).length
                    };
                }
                const originalUmask = process.umask(18);
                try {
                    const {path: extractedTo, cache} = this._debugTime((() => tar.extract(req.tarball, {
                        strict: !0,
                        strip: 1,
                        unlink: !0
                    }, req.name, req.version)), `tar.extract(${req.tarball}) => ${packageDir}`);
                    fs.mkdirSync(path.dirname(packageDir), {
                        recursive: !0
                    }), null != cache ? (this._debug(`Package cache enabled, extraction resulted in a cache ${cache}`), 
                    this._debugTime((() => (0, link_1.link)(extractedTo, packageDir)), `link(${extractedTo}, ${packageDir})`)) : (0, 
                    fs_1.renameSync)(extractedTo, packageDir);
                } finally {
                    process.umask(originalUmask);
                }
                let assmSpec;
                try {
                    assmSpec = this._debugTime((() => (0, spec_1.loadAssemblyFromPath)(packageDir)), `loadAssemblyFromPath(${packageDir})`);
                } catch (e) {
                    throw new Error(`Error for package tarball ${req.tarball}: ${e.message}`);
                }
                const closure = this._debugTime((() => this.require(packageDir)), `require(${packageDir})`), assm = new Assembly(assmSpec, closure);
                return this._debugTime((() => this._addAssembly(assm)), `registerAssembly({ name: ${assm.metadata.name}, types: ${Object.keys(null !== (_b = assm.metadata.types) && void 0 !== _b ? _b : {}).length} })`), 
                {
                    assembly: assmSpec.name,
                    types: Object.keys(null !== (_c = assmSpec.types) && void 0 !== _c ? _c : {}).length
                };
            }
            invokeBinScript(req) {
                var _a;
                const packageDir = this._getPackageDir(req.assembly);
                if (fs.pathExistsSync(packageDir)) {
                    const epkg = fs.readJsonSync(path.join(packageDir, "package.json"));
                    if (!epkg.bin) throw new Error("There is no bin scripts defined for this package.");
                    const scriptPath = epkg.bin[req.script];
                    if (!epkg.bin) throw new Error(`Script with name ${req.script} was not defined.`);
                    const result = cp.spawnSync(path.join(packageDir, scriptPath), null !== (_a = req.args) && void 0 !== _a ? _a : [], {
                        encoding: "utf-8",
                        env: {
                            ...process.env,
                            NODE_OPTIONS: process.execArgv.join(" "),
                            PATH: `${path.dirname(process.execPath)}:${process.env.PATH}`
                        },
                        shell: !0
                    });
                    return {
                        stdout: result.stdout,
                        stderr: result.stderr,
                        status: result.status,
                        signal: result.signal
                    };
                }
                throw new Error(`Package with name ${req.assembly} was not loaded.`);
            }
            create(req) {
                return this._create(req);
            }
            del(req) {
                const {objref} = req;
                return this._debug("del", objref), this.objects.deleteObject(objref), {};
            }
            sget(req) {
                const {fqn, property} = req, symbol = `${fqn}.${property}`;
                this._debug("sget", symbol);
                const ti = this._typeInfoForProperty(property, fqn);
                if (!ti.static) throw new Error(`property ${symbol} is not static`);
                const prototype = this._findSymbol(fqn), value = this._ensureSync(`property ${property}`, (() => prototype[property]));
                this._debug("value:", value);
                const ret = this._fromSandbox(value, ti, `of static property ${symbol}`);
                return this._debug("ret", ret), {
                    value: ret
                };
            }
            sset(req) {
                const {fqn, property, value} = req, symbol = `${fqn}.${property}`;
                this._debug("sset", symbol);
                const ti = this._typeInfoForProperty(property, fqn);
                if (!ti.static) throw new Error(`property ${symbol} is not static`);
                if (ti.immutable) throw new Error(`static property ${symbol} is readonly`);
                const prototype = this._findSymbol(fqn);
                return this._ensureSync(`property ${property}`, (() => prototype[property] = this._toSandbox(value, ti, `assigned to static property ${symbol}`))), 
                {};
            }
            get(req) {
                const {objref, property} = req;
                this._debug("get", objref, property);
                const {instance, fqn, interfaces} = this.objects.findObject(objref), ti = this._typeInfoForProperty(property, fqn, interfaces), propertyToGet = this._findPropertyTarget(instance, property), value = this._ensureSync(`property '${objref[api_1.TOKEN_REF]}.${propertyToGet}'`, (() => instance[propertyToGet]));
                this._debug("value:", value);
                const ret = this._fromSandbox(value, ti, `of property ${fqn}.${property}`);
                return this._debug("ret:", ret), {
                    value: ret
                };
            }
            set(req) {
                const {objref, property, value} = req;
                this._debug("set", objref, property, value);
                const {instance, fqn, interfaces} = this.objects.findObject(objref), propInfo = this._typeInfoForProperty(req.property, fqn, interfaces);
                if (propInfo.immutable) throw new Error(`Cannot set value of immutable property ${req.property} to ${req.value}`);
                const propertyToSet = this._findPropertyTarget(instance, property);
                return this._ensureSync(`property '${objref[api_1.TOKEN_REF]}.${propertyToSet}'`, (() => instance[propertyToSet] = this._toSandbox(value, propInfo, `assigned to property ${fqn}.${property}`))), 
                {};
            }
            invoke(req) {
                var _a, _b;
                const {objref, method} = req, args = null !== (_a = req.args) && void 0 !== _a ? _a : [];
                this._debug("invoke", objref, method, args);
                const {ti, obj, fn} = this._findInvokeTarget(objref, method, args);
                if (ti.async) throw new Error(`${method} is an async method, use "begin" instead`);
                const fqn = (0, objects_1.jsiiTypeFqn)(obj), ret = this._ensureSync(`method '${objref[api_1.TOKEN_REF]}.${method}'`, (() => fn.apply(obj, this._toSandboxValues(args, `method ${fqn ? `${fqn}#` : ""}${method}`, ti.parameters)))), result = this._fromSandbox(ret, null !== (_b = ti.returns) && void 0 !== _b ? _b : "void", `returned by method ${fqn ? `${fqn}#` : ""}${method}`);
                return this._debug("invoke result", result), {
                    result
                };
            }
            sinvoke(req) {
                var _a, _b;
                const {fqn, method} = req, args = null !== (_a = req.args) && void 0 !== _a ? _a : [];
                this._debug("sinvoke", fqn, method, args);
                const ti = this._typeInfoForMethod(method, fqn);
                if (!ti.static) throw new Error(`${fqn}.${method} is not a static method`);
                if (ti.async) throw new Error(`${method} is an async method, use "begin" instead`);
                const prototype = this._findSymbol(fqn), fn = prototype[method], ret = this._ensureSync(`method '${fqn}.${method}'`, (() => fn.apply(prototype, this._toSandboxValues(args, `static method ${fqn}.${method}`, ti.parameters))));
                return this._debug("method returned:", ret), {
                    result: this._fromSandbox(ret, null !== (_b = ti.returns) && void 0 !== _b ? _b : "void", `returned by static method ${fqn}.${method}`)
                };
            }
            begin(req) {
                var _a;
                const {objref, method} = req, args = null !== (_a = req.args) && void 0 !== _a ? _a : [];
                if (this._debug("begin", objref, method, args), this.syncInProgress) throw new Error(`Cannot invoke async method '${req.objref[api_1.TOKEN_REF]}.${req.method}' while sync ${this.syncInProgress} is being processed`);
                const {ti, obj, fn} = this._findInvokeTarget(objref, method, args);
                if (!ti.async) throw new Error(`Method ${method} is expected to be an async method`);
                const fqn = (0, objects_1.jsiiTypeFqn)(obj), promise = fn.apply(obj, this._toSandboxValues(args, `async method ${fqn ? `${fqn}#` : ""}${method}`, ti.parameters));
                promise.catch((_ => {}));
                const prid = this._makeprid();
                return this.promises.set(prid, {
                    promise,
                    method: ti
                }), {
                    promiseid: prid
                };
            }
            async end(req) {
                var _a;
                const {promiseid} = req;
                this._debug("end", promiseid);
                const storedPromise = this.promises.get(promiseid);
                if (null == storedPromise) throw new Error(`Cannot find promise with ID: ${promiseid}`);
                const {promise, method} = storedPromise;
                let result;
                try {
                    result = await promise, this._debug("promise result:", result);
                } catch (e) {
                    throw this._debug("promise error:", e), e;
                }
                return {
                    result: this._fromSandbox(result, null !== (_a = method.returns) && void 0 !== _a ? _a : "void", `returned by async method ${method.name}`)
                };
            }
            callbacks(_req) {
                this._debug("callbacks");
                return {
                    callbacks: Array.from(this.cbs.entries()).map((([cbid, cb]) => {
                        this.waiting.set(cbid, cb), this.cbs.delete(cbid);
                        return {
                            cbid,
                            cookie: cb.override.cookie,
                            invoke: {
                                objref: cb.objref,
                                method: cb.override.method,
                                args: cb.args
                            }
                        };
                    }))
                };
            }
            complete(req) {
                var _a;
                const {cbid, err, result} = req;
                this._debug("complete", cbid, err, result);
                const cb = this.waiting.get(cbid);
                if (!cb) throw new Error(`Callback ${cbid} not found`);
                if (err) this._debug("completed with error:", err), cb.fail(new Error(err)); else {
                    const sandoxResult = this._toSandbox(result, null !== (_a = cb.expectedReturnType) && void 0 !== _a ? _a : "void", `returned by callback ${cb.toString()}`);
                    this._debug("completed with result:", sandoxResult), cb.succeed(sandoxResult);
                }
                return this.waiting.delete(cbid), {
                    cbid
                };
            }
            naming(req) {
                const assemblyName = req.assembly;
                this._debug("naming", assemblyName);
                const targets = this._assemblyFor(assemblyName).metadata.targets;
                if (!targets) throw new Error(`Unexpected - "targets" for ${assemblyName} is missing!`);
                return {
                    naming: targets
                };
            }
            stats(_req) {
                return {
                    objectCount: this.objects.count
                };
            }
            _addAssembly(assm) {
                var _a;
                this.assemblies.set(assm.metadata.name, assm);
                for (const fqn of Object.keys(null !== (_a = assm.metadata.types) && void 0 !== _a ? _a : {})) {
                    switch (assm.metadata.types[fqn].kind) {
                      case spec.TypeKind.Interface:
                        continue;

                      case spec.TypeKind.Class:
                      case spec.TypeKind.Enum:
                        const constructor = this._findSymbol(fqn);
                        (0, objects_1.tagJsiiConstructor)(constructor, fqn, assm.metadata.version);
                    }
                }
            }
            _findCtor(fqn, args) {
                if (fqn === wire.EMPTY_OBJECT_FQN) return {
                    ctor: Object
                };
                const typeinfo = this._typeInfoForFqn(fqn);
                switch (typeinfo.kind) {
                  case spec.TypeKind.Class:
                    const classType = typeinfo;
                    return this._validateMethodArguments(classType.initializer, args), {
                        ctor: this._findSymbol(fqn),
                        parameters: classType.initializer && classType.initializer.parameters
                    };

                  case spec.TypeKind.Interface:
                    throw new Error(`Cannot create an object with an FQN of an interface: ${fqn}`);

                  default:
                    throw new Error(`Unexpected FQN kind: ${fqn}`);
                }
            }
            _getPackageDir(pkgname) {
                return this.installDir || (this.installDir = fs.mkdtempSync(path.join(os.tmpdir(), "jsii-kernel-")), 
                this.require = (0, module_1.createRequire)(this.installDir), fs.mkdirpSync(path.join(this.installDir, "node_modules")), 
                this._debug("creating jsii-kernel modules workdir:", this.installDir), onExit.removeSync(this.installDir)), 
                path.join(this.installDir, "node_modules", pkgname);
            }
            _create(req) {
                var _a, _b;
                this._debug("create", req);
                const {fqn, interfaces, overrides} = req, requestArgs = null !== (_a = req.args) && void 0 !== _a ? _a : [], ctorResult = this._findCtor(fqn, requestArgs), obj = new (0, 
                ctorResult.ctor)(...this._toSandboxValues(requestArgs, `new ${fqn}`, ctorResult.parameters)), objref = this.objects.registerObject(obj, fqn, null !== (_b = req.interfaces) && void 0 !== _b ? _b : []);
                if (overrides) {
                    this._debug("overrides", overrides);
                    const overrideTypeErrorMessage = 'Override can either be "method" or "property"', methods = new Set, properties = new Set;
                    for (const override of overrides) if (api.isMethodOverride(override)) {
                        if (api.isPropertyOverride(override)) throw new Error(overrideTypeErrorMessage);
                        if (methods.has(override.method)) throw new Error(`Duplicate override for method '${override.method}'`);
                        methods.add(override.method), this._applyMethodOverride(obj, objref, fqn, interfaces, override);
                    } else {
                        if (!api.isPropertyOverride(override)) throw new Error(overrideTypeErrorMessage);
                        if (api.isMethodOverride(override)) throw new Error(overrideTypeErrorMessage);
                        if (properties.has(override.property)) throw Error(`Duplicate override for property '${override.property}'`);
                        properties.add(override.property), this._applyPropertyOverride(obj, objref, fqn, interfaces, override);
                    }
                }
                return objref;
            }
            _getSuperPropertyName(name) {
                return `$jsii$super$${name}$`;
            }
            _applyPropertyOverride(obj, objref, typeFqn, interfaces, override) {
                if (this._tryTypeInfoForMethod(override.property, typeFqn, interfaces)) throw new Error(`Trying to override method '${override.property}' as a property`);
                let propInfo = this._tryTypeInfoForProperty(override.property, typeFqn, interfaces);
                propInfo || !(override.property in obj) ? (propInfo || (propInfo = {
                    name: override.property,
                    type: spec.CANONICAL_ANY
                }), this._defineOverridenProperty(obj, objref, override, propInfo)) : this._debug(`Skipping override of private property ${override.property}`);
            }
            _defineOverridenProperty(obj, objref, override, propInfo) {
                var _a;
                const propertyName = override.property;
                this._debug("apply override", propertyName);
                const prev = null !== (_a = function getPropertyDescriptor(obj, propertyName) {
                    const direct = Object.getOwnPropertyDescriptor(obj, propertyName);
                    if (null != direct) return direct;
                    const proto = Object.getPrototypeOf(obj);
                    if (null == proto && proto !== Object.prototype) return;
                    return getPropertyDescriptor(proto, propertyName);
                }(obj, propertyName)) && void 0 !== _a ? _a : {
                    value: obj[propertyName],
                    writable: !0,
                    enumerable: !0,
                    configurable: !0
                }, prevEnumerable = prev.enumerable;
                prev.enumerable = !1, Object.defineProperty(obj, this._getSuperPropertyName(propertyName), prev), 
                Object.defineProperty(obj, propertyName, {
                    enumerable: prevEnumerable,
                    configurable: prev.configurable,
                    get: () => {
                        this._debug("virtual get", objref, propertyName, {
                            cookie: override.cookie
                        });
                        const result = this.callbackHandler({
                            cookie: override.cookie,
                            cbid: this._makecbid(),
                            get: {
                                objref,
                                property: propertyName
                            }
                        });
                        return this._debug("callback returned", result), this._toSandbox(result, propInfo, `returned by callback property ${propertyName}`);
                    },
                    set: value => {
                        this._debug("virtual set", objref, propertyName, {
                            cookie: override.cookie
                        }), this.callbackHandler({
                            cookie: override.cookie,
                            cbid: this._makecbid(),
                            set: {
                                objref,
                                property: propertyName,
                                value: this._fromSandbox(value, propInfo, `assigned to callback property ${propertyName}`)
                            }
                        });
                    }
                });
            }
            _applyMethodOverride(obj, objref, typeFqn, interfaces, override) {
                if (this._tryTypeInfoForProperty(override.method, typeFqn, interfaces)) throw new Error(`Trying to override property '${override.method}' as a method`);
                let methodInfo = this._tryTypeInfoForMethod(override.method, typeFqn, interfaces);
                methodInfo || !obj[override.method] ? (methodInfo || (methodInfo = {
                    name: override.method,
                    returns: {
                        type: spec.CANONICAL_ANY
                    },
                    parameters: [ {
                        name: "args",
                        type: spec.CANONICAL_ANY,
                        variadic: !0
                    } ],
                    variadic: !0
                }), this._defineOverridenMethod(obj, objref, override, methodInfo)) : this._debug(`Skipping override of private method ${override.method}`);
            }
            _defineOverridenMethod(obj, objref, override, methodInfo) {
                const methodName = override.method, fqn = (0, objects_1.jsiiTypeFqn)(obj), methodContext = `${methodInfo.async ? "async " : ""}method${fqn ? `${fqn}#` : methodName}`;
                methodInfo.async ? Object.defineProperty(obj, methodName, {
                    enumerable: !1,
                    configurable: !1,
                    writable: !1,
                    value: (...methodArgs) => {
                        this._debug("invoke async method override", override);
                        const args = this._toSandboxValues(methodArgs, methodContext, methodInfo.parameters);
                        return new Promise(((succeed, fail) => {
                            var _a;
                            const cbid = this._makecbid();
                            this._debug("adding callback to queue", cbid), this.cbs.set(cbid, {
                                objref,
                                override,
                                args,
                                expectedReturnType: null !== (_a = methodInfo.returns) && void 0 !== _a ? _a : "void",
                                succeed,
                                fail
                            });
                        }));
                    }
                }) : Object.defineProperty(obj, methodName, {
                    enumerable: !1,
                    configurable: !1,
                    writable: !1,
                    value: (...methodArgs) => {
                        var _a;
                        this._debug("invoke sync method override", override, "args", methodArgs);
                        const result = this.callbackHandler({
                            cookie: override.cookie,
                            cbid: this._makecbid(),
                            invoke: {
                                objref,
                                method: methodName,
                                args: this._fromSandboxValues(methodArgs, methodContext, methodInfo.parameters)
                            }
                        });
                        return this._debug("Result", result), this._toSandbox(result, null !== (_a = methodInfo.returns) && void 0 !== _a ? _a : "void", `returned by callback method ${methodName}`);
                    }
                });
            }
            _findInvokeTarget(objref, methodName, args) {
                const {instance, fqn, interfaces} = this.objects.findObject(objref), ti = this._typeInfoForMethod(methodName, fqn, interfaces);
                this._validateMethodArguments(ti, args);
                let fn = instance.constructor.prototype[methodName];
                if (!fn && (fn = instance[methodName], !fn)) throw new Error(`Cannot find ${methodName} on object`);
                return {
                    ti,
                    obj: instance,
                    fn
                };
            }
            _validateMethodArguments(method, args) {
                var _a;
                const params = null !== (_a = null == method ? void 0 : method.parameters) && void 0 !== _a ? _a : [];
                if (args.length > params.length && (!method || !method.variadic)) throw new Error(`Too many arguments (method accepts ${params.length} parameters, got ${args.length} arguments)`);
                for (let i = 0; i < params.length; ++i) {
                    const param = params[i], arg = args[i];
                    if (param.variadic) {
                        if (params.length <= i) return;
                        for (let j = i; j < params.length; j++) if (!param.optional && void 0 === params[j]) throw new Error(`Unexpected 'undefined' value at index ${j - i} of variadic argument '${param.name}' of type '${spec.describeTypeReference(param.type)}'`);
                    } else if (!param.optional && void 0 === arg) throw new Error(`Not enough arguments. Missing argument for the required parameter '${param.name}' of type '${spec.describeTypeReference(param.type)}'`);
                }
            }
            _assemblyFor(assemblyName) {
                const assembly = this.assemblies.get(assemblyName);
                if (!assembly) throw new Error(`Could not find assembly: ${assemblyName}`);
                return assembly;
            }
            _findSymbol(fqn) {
                const [assemblyName, ...parts] = fqn.split(".");
                let curr = this._assemblyFor(assemblyName).closure;
                for (;parts.length > 0; ) {
                    const name = parts.shift();
                    if (!name) break;
                    curr = curr[name];
                }
                if (!curr) throw new Error(`Could not find symbol ${fqn}`);
                return curr;
            }
            _typeInfoForFqn(fqn) {
                var _a;
                const moduleName = fqn.split(".")[0], assembly = this.assemblies.get(moduleName);
                if (!assembly) throw new Error(`Module '${moduleName}' not found`);
                const fqnInfo = (null !== (_a = assembly.metadata.types) && void 0 !== _a ? _a : {})[fqn];
                if (!fqnInfo) throw new Error(`Type '${fqn}' not found`);
                return fqnInfo;
            }
            _typeInfoForMethod(methodName, fqn, interfaces) {
                const ti = this._tryTypeInfoForMethod(methodName, fqn, interfaces);
                if (!ti) {
                    const addendum = interfaces && interfaces.length > 0 ? ` or interface(s) ${interfaces.join(", ")}` : "";
                    throw new Error(`Class ${fqn}${addendum} doesn't have a method '${methodName}'`);
                }
                return ti;
            }
            _tryTypeInfoForMethod(methodName, classFqn, interfaces = []) {
                var _a, _b;
                for (const fqn of [ classFqn, ...interfaces ]) {
                    if (fqn === wire.EMPTY_OBJECT_FQN) continue;
                    const typeinfo = this._typeInfoForFqn(fqn), methods = null !== (_a = typeinfo.methods) && void 0 !== _a ? _a : [];
                    for (const m of methods) if (m.name === methodName) return m;
                    const bases = [ typeinfo.base, ...null !== (_b = typeinfo.interfaces) && void 0 !== _b ? _b : [] ];
                    for (const base of bases) {
                        if (!base) continue;
                        const found = this._tryTypeInfoForMethod(methodName, base);
                        if (found) return found;
                    }
                }
            }
            _tryTypeInfoForProperty(property, classFqn, interfaces = []) {
                var _a;
                for (const fqn of [ classFqn, ...interfaces ]) {
                    if (fqn === wire.EMPTY_OBJECT_FQN) continue;
                    const typeInfo = this._typeInfoForFqn(fqn);
                    let properties, bases;
                    if (spec.isClassType(typeInfo)) {
                        const classTypeInfo = typeInfo;
                        properties = classTypeInfo.properties, bases = classTypeInfo.base ? [ classTypeInfo.base ] : [];
                    } else {
                        if (!spec.isInterfaceType(typeInfo)) throw new Error(`Type of kind ${typeInfo.kind} does not have properties`);
                        {
                            const interfaceTypeInfo = typeInfo;
                            properties = interfaceTypeInfo.properties, bases = null !== (_a = interfaceTypeInfo.interfaces) && void 0 !== _a ? _a : [];
                        }
                    }
                    for (const p of null != properties ? properties : []) if (p.name === property) return p;
                    for (const baseFqn of bases) {
                        const ret = this._tryTypeInfoForProperty(property, baseFqn);
                        if (ret) return ret;
                    }
                }
            }
            _typeInfoForProperty(property, fqn, interfaces) {
                const typeInfo = this._tryTypeInfoForProperty(property, fqn, interfaces);
                if (!typeInfo) {
                    const addendum = interfaces && interfaces.length > 0 ? ` or interface(s) ${interfaces.join(", ")}` : "";
                    throw new Error(`Type ${fqn}${addendum} doesn't have a property '${property}'`);
                }
                return typeInfo;
            }
            _toSandbox(v, expectedType, context) {
                return wire.process({
                    objects: this.objects,
                    debug: this._debug.bind(this),
                    findSymbol: this._findSymbol.bind(this),
                    lookupType: this._typeInfoForFqn.bind(this)
                }, "deserialize", v, expectedType, context);
            }
            _fromSandbox(v, targetType, context) {
                return wire.process({
                    objects: this.objects,
                    debug: this._debug.bind(this),
                    findSymbol: this._findSymbol.bind(this),
                    lookupType: this._typeInfoForFqn.bind(this)
                }, "serialize", v, targetType, context);
            }
            _toSandboxValues(xs, methodContext, parameters) {
                return this._boxUnboxParameters(xs, methodContext, parameters, this._toSandbox.bind(this));
            }
            _fromSandboxValues(xs, methodContext, parameters) {
                return this._boxUnboxParameters(xs, methodContext, parameters, this._fromSandbox.bind(this));
            }
            _boxUnboxParameters(xs, methodContext, parameters = [], boxUnbox) {
                const parametersCopy = [ ...parameters ], variadic = parametersCopy.length > 0 && !!parametersCopy[parametersCopy.length - 1].variadic;
                for (;variadic && parametersCopy.length < xs.length; ) parametersCopy.push(parametersCopy[parametersCopy.length - 1]);
                if (xs.length > parametersCopy.length) throw new Error(`Argument list (${JSON.stringify(xs)}) not same size as expected argument list (length ${parametersCopy.length})`);
                return xs.map(((x, i) => boxUnbox(x, parametersCopy[i], `passed to parameter ${parametersCopy[i].name} of ${methodContext}`)));
            }
            _debug(...args) {
                this.traceEnabled && console.error("[@jsii/kernel]", ...args);
            }
            _debugTime(cb, label) {
                const fullLabel = `[@jsii/kernel:timing] ${label}`;
                this.debugTimingEnabled && console.time(fullLabel);
                try {
                    return cb();
                } finally {
                    this.debugTimingEnabled && console.timeEnd(fullLabel);
                }
            }
            _ensureSync(desc, fn) {
                this.syncInProgress = desc;
                try {
                    return fn();
                } finally {
                    delete this.syncInProgress;
                }
            }
            _findPropertyTarget(obj, property) {
                const superProp = this._getSuperPropertyName(property);
                return superProp in obj ? superProp : property;
            }
            _makecbid() {
                return "jsii::callback::" + this.nextid++;
            }
            _makeprid() {
                return "jsii::promise::" + this.nextid++;
            }
        };
        class Assembly {
            constructor(metadata, closure) {
                this.metadata = metadata, this.closure = closure;
            }
        }
    },
    328: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.link = void 0;
        const fs_1 = __webpack_require__(7147), path_1 = __webpack_require__(4822);
        exports.link = function link(existing, destination) {
            if ((0, fs_1.statSync)(existing).isDirectory()) {
                (0, fs_1.mkdirSync)(destination, {
                    recursive: !0
                });
                for (const file of (0, fs_1.readdirSync)(existing)) link((0, path_1.join)(existing, file), (0, 
                path_1.join)(destination, file));
            } else try {
                (0, fs_1.linkSync)(existing, destination);
            } catch {
                (0, fs_1.copyFileSync)(existing, destination);
            }
        };
    },
    2309: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.ObjectTable = exports.tagJsiiConstructor = exports.objectReference = exports.jsiiTypeFqn = void 0;
        const spec = __webpack_require__(1804), api = __webpack_require__(2816), serialization_1 = __webpack_require__(8614), OBJID_SYMBOL = Symbol.for("$__jsii__objid__$"), IFACES_SYMBOL = Symbol.for("$__jsii__interfaces__$"), JSII_RTTI_SYMBOL = Symbol.for("jsii.rtti");
        function objectReference(obj) {
            if (obj[OBJID_SYMBOL]) return {
                [api.TOKEN_REF]: obj[OBJID_SYMBOL],
                [api.TOKEN_INTERFACES]: obj[IFACES_SYMBOL]
            };
        }
        exports.jsiiTypeFqn = function(obj) {
            var _a;
            return null === (_a = obj.constructor[JSII_RTTI_SYMBOL]) || void 0 === _a ? void 0 : _a.fqn;
        }, exports.objectReference = objectReference, exports.tagJsiiConstructor = function(constructor, fqn, version) {
            Object.prototype.hasOwnProperty.call(constructor, JSII_RTTI_SYMBOL) || Object.defineProperty(constructor, JSII_RTTI_SYMBOL, {
                configurable: !1,
                enumerable: !1,
                writable: !1,
                value: {
                    fqn,
                    version
                }
            });
        };
        exports.ObjectTable = class {
            constructor(resolveType) {
                this.resolveType = resolveType, this.objects = new Map, this.nextid = 1e4;
            }
            registerObject(obj, fqn, interfaces) {
                var _a;
                if (void 0 === fqn) throw new Error("FQN cannot be undefined");
                const existingRef = objectReference(obj);
                if (existingRef) {
                    if (interfaces) {
                        const allIfaces = new Set(interfaces);
                        for (const iface of null !== (_a = existingRef[api.TOKEN_INTERFACES]) && void 0 !== _a ? _a : []) allIfaces.add(iface);
                        Object.prototype.hasOwnProperty.call(obj, IFACES_SYMBOL) || console.error(`[jsii/kernel] WARNING: referenced object ${existingRef[api.TOKEN_REF]} does not have the ${String(IFACES_SYMBOL)} property!`), 
                        this.objects.get(existingRef[api.TOKEN_REF]).interfaces = obj[IFACES_SYMBOL] = existingRef[api.TOKEN_INTERFACES] = interfaces = this.removeRedundant(Array.from(allIfaces), fqn);
                    }
                    return existingRef;
                }
                interfaces = this.removeRedundant(interfaces, fqn);
                const objid = this.makeId(fqn);
                return this.objects.set(objid, {
                    instance: obj,
                    fqn,
                    interfaces
                }), function(obj, objid, interfaces) {
                    const privateField = {
                        enumerable: !1,
                        configurable: !0,
                        writable: !0
                    };
                    Object.prototype.hasOwnProperty.call(obj, OBJID_SYMBOL) && console.error(`[jsii/kernel] WARNING: object ${JSON.stringify(obj)} was already tagged as ${obj[OBJID_SYMBOL]}!`), 
                    Object.defineProperty(obj, OBJID_SYMBOL, {
                        ...privateField,
                        value: objid
                    }), Object.defineProperty(obj, IFACES_SYMBOL, {
                        ...privateField,
                        value: interfaces
                    });
                }(obj, objid, interfaces), {
                    [api.TOKEN_REF]: objid,
                    [api.TOKEN_INTERFACES]: interfaces
                };
            }
            findObject(objref) {
                var _a;
                if ("object" != typeof objref || !(api.TOKEN_REF in objref)) throw new Error(`Malformed object reference: ${JSON.stringify(objref)}`);
                const objid = objref[api.TOKEN_REF], obj = this.objects.get(objid);
                if (!obj) throw new Error(`Object ${objid} not found`);
                const additionalInterfaces = objref[api.TOKEN_INTERFACES];
                return null != additionalInterfaces && additionalInterfaces.length > 0 ? {
                    ...obj,
                    interfaces: [ ...null !== (_a = obj.interfaces) && void 0 !== _a ? _a : [], ...additionalInterfaces ]
                } : obj;
            }
            deleteObject({[api.TOKEN_REF]: objid}) {
                if (!this.objects.delete(objid)) throw new Error(`Object ${objid} not found`);
            }
            get count() {
                return this.objects.size;
            }
            makeId(fqn) {
                return `${fqn}@${this.nextid++}`;
            }
            removeRedundant(interfaces, fqn) {
                if (!interfaces || 0 === interfaces.length) return;
                const result = new Set(interfaces), builtIn = new InterfaceCollection(this.resolveType);
                fqn !== serialization_1.EMPTY_OBJECT_FQN && builtIn.addFromClass(fqn), interfaces.forEach(builtIn.addFromInterface.bind(builtIn));
                for (const iface of builtIn) result.delete(iface);
                return result.size > 0 ? Array.from(result).sort() : void 0;
            }
        };
        class InterfaceCollection {
            constructor(resolveType) {
                this.resolveType = resolveType, this.interfaces = new Set;
            }
            addFromClass(fqn) {
                const ti = this.resolveType(fqn);
                if (!spec.isClassType(ti)) throw new Error(`Expected a class, but received ${spec.describeTypeReference(ti)}`);
                if (ti.base && this.addFromClass(ti.base), ti.interfaces) for (const iface of ti.interfaces) this.interfaces.has(iface) || (this.interfaces.add(iface), 
                this.addFromInterface(iface));
            }
            addFromInterface(fqn) {
                const ti = this.resolveType(fqn);
                if (!spec.isInterfaceType(ti)) throw new Error(`Expected an interface, but received ${spec.describeTypeReference(ti)}`);
                if (ti.interfaces) for (const iface of ti.interfaces) this.interfaces.has(iface) || (this.interfaces.add(iface), 
                this.addFromInterface(iface));
            }
            [Symbol.iterator]() {
                return this.interfaces[Symbol.iterator]();
            }
        }
    },
    6703: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.removeSync = void 0;
        const fs = __webpack_require__(9728), process = __webpack_require__(7282), removeSyncPaths = new Array;
        exports.removeSync = function(path) {
            !function() {
                if (registered) return;
                function onExitHandler() {
                    if (removeSyncPaths.length > 0) for (const path of removeSyncPaths) fs.removeSync(path);
                }
                process.once("exit", onExitHandler), registered = !0;
            }(), removeSyncPaths.push(path);
        };
        let registered = !1;
    },
    8614: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.SerializationError = exports.process = exports.serializationType = exports.SERIALIZERS = exports.SYMBOL_WIRE_TYPE = exports.EMPTY_OBJECT_FQN = void 0;
        const spec = __webpack_require__(1804), assert = __webpack_require__(9491), util_1 = __webpack_require__(3837), api_1 = __webpack_require__(2816), objects_1 = __webpack_require__(2309), _1 = __webpack_require__(8944), VOID = "void";
        function serializeDate(value) {
            return {
                [api_1.TOKEN_DATE]: value.toISOString()
            };
        }
        function deserializeDate(value) {
            return new Date(value[api_1.TOKEN_DATE]);
        }
        function deserializeEnum(value, lookup) {
            const enumLocator = value[api_1.TOKEN_ENUM], sep = enumLocator.lastIndexOf("/");
            if (-1 === sep) throw new SerializationError(`Invalid enum token value ${(0, util_1.inspect)(enumLocator)}`, value);
            const typeName = enumLocator.slice(0, sep), valueName = enumLocator.slice(sep + 1), enumValue = lookup(typeName)[valueName];
            if (void 0 === enumValue) throw new SerializationError(`No such enum member: ${(0, 
            util_1.inspect)(valueName)}`, value);
            return enumValue;
        }
        function serializationType(typeRef, lookup) {
            if (assert(null != typeRef, `Kernel error: expected type information, got ${(0, 
            util_1.inspect)(typeRef)}`), "void" === typeRef) return [ {
                serializationClass: "Void",
                typeRef
            } ];
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
                assert(!1, `Unknown primitive type: ${(0, util_1.inspect)(typeRef.type)}`);
            }
            if (spec.isCollectionTypeReference(typeRef.type)) return [ {
                serializationClass: typeRef.type.collection.kind === spec.CollectionKind.Array ? "Array" : "Map",
                typeRef
            } ];
            if (spec.isUnionTypeReference(typeRef.type)) {
                const compoundTypes = function(xs, fn) {
                    const ret = new Array;
                    for (const x of xs) ret.push(...fn(x));
                    return ret;
                }(typeRef.type.union.types, (t => serializationType({
                    type: t
                }, lookup)));
                for (const t of compoundTypes) "void" !== t.typeRef && (t.typeRef.optional = typeRef.optional);
                return compoundTypes.sort(((l, r) => function(l, r) {
                    const order = [ "Void", "Date", "Scalar", "Json", "Enum", "Array", "Map", "Struct", "RefType", "Any" ];
                    return order.indexOf(l) - order.indexOf(r);
                }(l.serializationClass, r.serializationClass)));
            }
            const type = lookup(typeRef.type.fqn);
            return spec.isEnumType(type) ? [ {
                serializationClass: "Enum",
                typeRef
            } ] : spec.isInterfaceType(type) && type.datatype ? [ {
                serializationClass: "Struct",
                typeRef
            } ] : [ {
                serializationClass: "RefType",
                typeRef
            } ];
        }
        function nullAndOk(x, type) {
            if (null != x) return !1;
            if ("void" !== type && !type.optional) throw new SerializationError("A value is required (type is non-optional)", x);
            return !0;
        }
        function isDate(x) {
            return "object" == typeof x && "[object Date]" === Object.prototype.toString.call(x);
        }
        function isScalar(x) {
            return "string" == typeof x || "number" == typeof x || "boolean" == typeof x;
        }
        function mapValues(value, fn) {
            if ("object" != typeof value || null == value) throw new SerializationError("Value is not an object", value);
            if (Array.isArray(value)) throw new SerializationError("Value is an array", value);
            const out = {};
            for (const [k, v] of Object.entries(value)) {
                const wireValue = fn(v, k);
                void 0 !== wireValue && (out[k] = wireValue);
            }
            return out;
        }
        function propertiesOf(t, lookup) {
            var _a;
            if (!spec.isClassOrInterfaceType(t)) return {};
            let ret = {};
            if (t.interfaces) for (const iface of t.interfaces) ret = {
                ...ret,
                ...propertiesOf(lookup(iface), lookup)
            };
            spec.isClassType(t) && t.base && (ret = {
                ...ret,
                ...propertiesOf(lookup(t.base), lookup)
            });
            for (const prop of null !== (_a = t.properties) && void 0 !== _a ? _a : []) ret[prop.name] = prop;
            return ret;
        }
        function isAssignable(actualTypeFqn, requiredType, lookup) {
            if (actualTypeFqn === exports.EMPTY_OBJECT_FQN) return !0;
            if (requiredType.fqn === actualTypeFqn) return !0;
            const actualType = lookup(actualTypeFqn);
            return !!(spec.isClassType(actualType) && actualType.base && isAssignable(actualType.base, requiredType, lookup)) || !(!spec.isClassOrInterfaceType(actualType) || !actualType.interfaces) && null != actualType.interfaces.find((iface => isAssignable(iface, requiredType, lookup)));
        }
        function validateRequiredProps(actualProps, typeName, specProps) {
            const missingRequiredProps = Object.keys(specProps).filter((name => !specProps[name].optional)).filter((name => !(name in actualProps)));
            if (missingRequiredProps.length > 0) throw new SerializationError(`Missing required properties for ${typeName}: ${missingRequiredProps.map((p => (0, 
            util_1.inspect)(p))).join(", ")}`, actualProps);
            return actualProps;
        }
        function process(host, serde, value, type, context) {
            const wireTypes = serializationType(type, host.lookupType);
            host.debug(serde, value, wireTypes);
            const errors = new Array;
            for (const {serializationClass, typeRef} of wireTypes) try {
                return exports.SERIALIZERS[serializationClass][serde](value, typeRef, host);
            } catch (error) {
                error.context = `as ${typeRef === VOID ? VOID : spec.describeTypeReference(typeRef.type)}`, 
                errors.push(error);
            }
            const typeDescr = type === VOID ? type : spec.describeTypeReference(type.type), optionalTypeDescr = type !== VOID && type.optional ? `${typeDescr} | undefined` : typeDescr;
            throw new SerializationError(`${function(text) {
                if ("" === (text = text.trim())) return text;
                const [first, ...rest] = text;
                return [ first.toUpperCase(), ...rest ].join("");
            }(context)}: Unable to ${serde} value as ${optionalTypeDescr}`, value, errors, {
                renderValue: !0
            });
        }
        exports.EMPTY_OBJECT_FQN = "Object", exports.SYMBOL_WIRE_TYPE = Symbol.for("$jsii$wireType$"), 
        exports.SERIALIZERS = {
            Void: {
                serialize(value, _type, host) {
                    null != value && host.debug("Expected void, got", value);
                },
                deserialize(value, _type, host) {
                    null != value && host.debug("Expected void, got", value);
                }
            },
            Date: {
                serialize(value, optionalValue) {
                    if (!nullAndOk(value, optionalValue)) {
                        if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), !isDate(value)) throw new SerializationError("Value is not an instance of Date", value);
                        return serializeDate(value);
                    }
                },
                deserialize(value, optionalValue) {
                    if (!nullAndOk(value, optionalValue)) {
                        if (!(0, api_1.isWireDate)(value)) throw new SerializationError(`Value does not have the "${api_1.TOKEN_DATE}" key`, value);
                        return deserializeDate(value);
                    }
                }
            },
            Scalar: {
                serialize(value, optionalValue) {
                    if (nullAndOk(value, optionalValue)) return;
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const primitiveType = optionalValue.type;
                    if (!isScalar(value)) throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value);
                    if (typeof value !== primitiveType.primitive) throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value);
                    return value;
                },
                deserialize(value, optionalValue) {
                    if (nullAndOk(value, optionalValue)) return;
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const primitiveType = optionalValue.type;
                    if (!isScalar(value)) throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value);
                    if (typeof value !== primitiveType.primitive) throw new SerializationError(`Value is not a ${spec.describeTypeReference(optionalValue.type)}`, value);
                    return value;
                }
            },
            Json: {
                serialize(value, optionalValue) {
                    if (!nullAndOk(value, optionalValue)) return value;
                },
                deserialize(value, optionalValue, host) {
                    if (!nullAndOk(value, optionalValue)) return (0, api_1.isWireMap)(value) ? exports.SERIALIZERS.Map.deserialize(value, {
                        optional: !1,
                        type: {
                            collection: {
                                kind: spec.CollectionKind.Map,
                                elementtype: {
                                    primitive: spec.PrimitiveType.Json
                                }
                            }
                        }
                    }, host) : "object" != typeof value ? value : Array.isArray(value) ? value.map(mapJsonValue) : mapValues(value, mapJsonValue);
                    function mapJsonValue(toMap, key) {
                        return null == toMap ? toMap : process(host, "deserialize", toMap, {
                            type: {
                                primitive: spec.PrimitiveType.Json
                            }
                        }, "string" == typeof key ? `key ${(0, util_1.inspect)(key)}` : `index ${key}`);
                    }
                }
            },
            Enum: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), "string" != typeof value && "number" != typeof value) throw new SerializationError("Value is not a string or number", value);
                    host.debug("Serializing enum");
                    const enumType = optionalValue.type, enumMap = host.findSymbol(enumType.fqn), enumEntry = Object.entries(enumMap).find((([, v]) => v === value));
                    if (!enumEntry) throw new SerializationError(`Value is not present in enum ${spec.describeTypeReference(enumType)}`, value);
                    return {
                        [api_1.TOKEN_ENUM]: `${enumType.fqn}/${enumEntry[0]}`
                    };
                },
                deserialize(value, optionalValue, host) {
                    if (!nullAndOk(value, optionalValue)) {
                        if (!(0, api_1.isWireEnum)(value)) throw new SerializationError(`Value does not have the "${api_1.TOKEN_ENUM}" key`, value);
                        return deserializeEnum(value, host.findSymbol);
                    }
                }
            },
            Array: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), !Array.isArray(value)) throw new SerializationError("Value is not an array", value);
                    const arrayType = optionalValue.type;
                    return value.map(((x, idx) => process(host, "serialize", x, {
                        type: arrayType.collection.elementtype
                    }, `index ${(0, util_1.inspect)(idx)}`)));
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), !Array.isArray(value)) throw new SerializationError("Value is not an array", value);
                    const arrayType = optionalValue.type;
                    return value.map(((x, idx) => process(host, "deserialize", x, {
                        type: arrayType.collection.elementtype
                    }, `index ${(0, util_1.inspect)(idx)}`)));
                }
            },
            Map: {
                serialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const mapType = optionalValue.type;
                    return {
                        [api_1.TOKEN_MAP]: mapValues(value, ((v, key) => process(host, "serialize", v, {
                            type: mapType.collection.elementtype
                        }, `key ${(0, util_1.inspect)(key)}`)))
                    };
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    assert(optionalValue !== VOID, "Encountered unexpected void type!");
                    const mapType = optionalValue.type;
                    if (!(0, api_1.isWireMap)(value)) return mapValues(value, ((v, key) => process(host, "deserialize", v, {
                        type: mapType.collection.elementtype
                    }, `key ${(0, util_1.inspect)(key)}`)));
                    const result = mapValues(value[api_1.TOKEN_MAP], ((v, key) => process(host, "deserialize", v, {
                        type: mapType.collection.elementtype
                    }, `key ${(0, util_1.inspect)(key)}`)));
                    return Object.defineProperty(result, exports.SYMBOL_WIRE_TYPE, {
                        configurable: !1,
                        enumerable: !1,
                        value: api_1.TOKEN_MAP,
                        writable: !1
                    }), result;
                }
            },
            Struct: {
                serialize(value, optionalValue, host) {
                    if (!nullAndOk(value, optionalValue)) {
                        if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), "object" != typeof value || null == value || value instanceof Date) throw new SerializationError("Value is not an object", value);
                        if (Array.isArray(value)) throw new SerializationError("Value is an array", value);
                        return host.debug("Returning value type by reference"), host.objects.registerObject(value, exports.EMPTY_OBJECT_FQN, [ optionalValue.type.fqn ]);
                    }
                },
                deserialize(value, optionalValue, host) {
                    if ("object" == typeof value && 0 === Object.keys(null != value ? value : {}).length && (value = void 0), 
                    nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), "object" != typeof value || null == value) throw new SerializationError("Value is not an object", value);
                    const namedType = host.lookupType(optionalValue.type.fqn), props = propertiesOf(namedType, host.lookupType);
                    if (Array.isArray(value)) throw new SerializationError("Value is an array (varargs may have been incorrectly supplied)", value);
                    if ((0, api_1.isObjRef)(value)) return host.debug("Expected value type but got reference type, accepting for now (awslabs/jsii#400)"), 
                    validateRequiredProps(host.objects.findObject(value).instance, namedType.fqn, props);
                    if (_1.api.isWireStruct(value)) {
                        const {fqn, data} = value[_1.api.TOKEN_STRUCT];
                        if (!isAssignable(fqn, namedType, host.lookupType)) throw new SerializationError(`Wired struct has type '${fqn}', which does not match expected type`, value);
                        value = data;
                    }
                    return _1.api.isWireMap(value) && (value = value[_1.api.TOKEN_MAP]), mapValues(value = validateRequiredProps(value, namedType.fqn, props), ((v, key) => {
                        if (props[key]) return process(host, "deserialize", v, props[key], `key ${(0, util_1.inspect)(key)}`);
                    }));
                }
            },
            RefType: {
                serialize(value, optionalValue, host) {
                    var _a;
                    if (nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), "object" != typeof value || null == value || Array.isArray(value)) throw new SerializationError("Value is not an object", value);
                    if (value instanceof Date) throw new SerializationError("Value is a Date", value);
                    const expectedType = host.lookupType(optionalValue.type.fqn), interfaces = spec.isInterfaceType(expectedType) ? [ expectedType.fqn ] : void 0, jsiiType = null !== (_a = (0, 
                    objects_1.jsiiTypeFqn)(value)) && void 0 !== _a ? _a : spec.isClassType(expectedType) ? expectedType.fqn : exports.EMPTY_OBJECT_FQN;
                    return host.objects.registerObject(value, jsiiType, interfaces);
                },
                deserialize(value, optionalValue, host) {
                    if (nullAndOk(value, optionalValue)) return;
                    if (assert(optionalValue !== VOID, "Encountered unexpected void type!"), !(0, api_1.isObjRef)(value)) throw new SerializationError(`Value does not have the "${api_1.TOKEN_REF}" key`, value);
                    const {instance, fqn} = host.objects.findObject(value), namedTypeRef = optionalValue.type;
                    if (namedTypeRef.fqn !== exports.EMPTY_OBJECT_FQN) {
                        const namedType = host.lookupType(namedTypeRef.fqn), declaredType = optionalValue.type;
                        if (spec.isClassType(namedType) && !isAssignable(fqn, declaredType, host.lookupType)) throw new SerializationError(`Object of type '${fqn}' is not convertible to ${spec.describeTypeReference(declaredType)}`, value);
                    }
                    return instance;
                }
            },
            Any: {
                serialize(value, _type, host) {
                    var _a;
                    if (null == value) return;
                    if (isDate(value)) return serializeDate(value);
                    if (isScalar(value)) return value;
                    if (Array.isArray(value)) return value.map(((e, idx) => process(host, "serialize", e, {
                        type: spec.CANONICAL_ANY
                    }, `index ${(0, util_1.inspect)(idx)}`)));
                    if ("function" == typeof value) throw new SerializationError("Functions cannot be passed across language boundaries", value);
                    if ("object" != typeof value || null == value) throw new SerializationError("A jsii kernel assumption was violated: value is not an object", value);
                    if (exports.SYMBOL_WIRE_TYPE in value && value[exports.SYMBOL_WIRE_TYPE] === api_1.TOKEN_MAP) return exports.SERIALIZERS.Map.serialize(value, {
                        type: {
                            collection: {
                                kind: spec.CollectionKind.Map,
                                elementtype: spec.CANONICAL_ANY
                            }
                        }
                    }, host);
                    if (value instanceof Set || value instanceof Map) throw new SerializationError("Set and Map instances cannot be sent across the language boundary", value);
                    const prevRef = (0, objects_1.objectReference)(value);
                    if (prevRef) return prevRef;
                    const jsiiType = null !== (_a = (0, objects_1.jsiiTypeFqn)(value)) && void 0 !== _a ? _a : function(obj) {
                        if (Array.isArray(obj)) return !1;
                        let curr = obj;
                        do {
                            for (const prop of Object.getOwnPropertyNames(curr)) {
                                const descr = Object.getOwnPropertyDescriptor(curr, prop);
                                if (null != (null == descr ? void 0 : descr.get) || null != (null == descr ? void 0 : descr.set) || "function" == typeof (null == descr ? void 0 : descr.value)) return !0;
                            }
                        } while (null != Object.getPrototypeOf(curr = Object.getPrototypeOf(curr)));
                        return !1;
                    }(value) ? exports.EMPTY_OBJECT_FQN : void 0;
                    return jsiiType ? host.objects.registerObject(value, jsiiType) : mapValues(value, ((v, key) => process(host, "serialize", v, {
                        type: spec.CANONICAL_ANY
                    }, `key ${(0, util_1.inspect)(key)}`)));
                },
                deserialize(value, _type, host) {
                    if (null != value) {
                        if ((0, api_1.isWireDate)(value)) return host.debug("ANY is a Date"), deserializeDate(value);
                        if (isScalar(value)) return host.debug("ANY is a Scalar"), value;
                        if (Array.isArray(value)) return host.debug("ANY is an Array"), value.map(((e, idx) => process(host, "deserialize", e, {
                            type: spec.CANONICAL_ANY
                        }, `index ${(0, util_1.inspect)(idx)}`)));
                        if ((0, api_1.isWireEnum)(value)) return host.debug("ANY is an Enum"), deserializeEnum(value, host.findSymbol);
                        if ((0, api_1.isWireMap)(value)) {
                            host.debug("ANY is a Map");
                            const mapOfAny = {
                                collection: {
                                    kind: spec.CollectionKind.Map,
                                    elementtype: spec.CANONICAL_ANY
                                }
                            };
                            return exports.SERIALIZERS.Map.deserialize(value, {
                                type: mapOfAny
                            }, host);
                        }
                        if ((0, api_1.isObjRef)(value)) return host.debug("ANY is a Ref"), host.objects.findObject(value).instance;
                        if ((0, api_1.isWireStruct)(value)) {
                            const {fqn, data} = value[api_1.TOKEN_STRUCT];
                            return host.debug(`ANY is a struct of type ${fqn}`), exports.SERIALIZERS.Struct.deserialize(data, {
                                type: {
                                    fqn
                                }
                            }, host);
                        }
                        return host.debug("ANY is a Map"), mapValues(value, ((v, key) => process(host, "deserialize", v, {
                            type: spec.CANONICAL_ANY
                        }, `key ${(0, util_1.inspect)(key)}`)));
                    }
                }
            }
        }, exports.serializationType = serializationType, exports.process = process;
        class SerializationError extends Error {
            constructor(message, value, causes = [], {renderValue = !1} = {}) {
                super([ message, ...renderValue ? [ `${causes.length > 0 ? "├" : "╰"}── 🛑 Failing value is ${describeTypeOf(value)}`, ...null == value ? [] : (0, 
                util_1.inspect)(value, !1, 0).split("\n").map((l => `${causes.length > 0 ? "│" : " "}      ${l}`)) ] : [], ...causes.length > 0 ? [ "╰── 🔍 Failure reason(s):", ...causes.map(((cause, idx) => {
                    var _a;
                    return `    ${idx < causes.length - 1 ? "├" : "╰"}─${causes.length > 1 ? ` [${null !== (_a = cause.context) && void 0 !== _a ? _a : (0, 
                    util_1.inspect)(idx)}]` : ""} ${cause.message.split("\n").join("\n        ")}`;
                })) ] : [] ].join("\n")), this.value = value, this.causes = causes, this.name = "@jsii/kernel.SerializationError";
            }
        }
        function describeTypeOf(value) {
            const type = typeof value;
            switch (type) {
              case "object":
                if (null == value) return JSON.stringify(value);
                if (Array.isArray(value)) return "an array";
                const fqn = (0, objects_1.jsiiTypeFqn)(value);
                if (null != fqn && fqn !== exports.EMPTY_OBJECT_FQN) return `an instance of ${fqn}`;
                const ctorName = value.constructor.name;
                return null != ctorName && ctorName !== Object.name ? `an instance of ${ctorName}` : "an object";

              case "undefined":
                return type;

              default:
                return `a ${type}`;
            }
        }
        exports.SerializationError = SerializationError;
    },
    4964: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.defaultCacheRoot = void 0;
        const os_1 = __webpack_require__(2037), path_1 = __webpack_require__(4822);
        exports.defaultCacheRoot = function() {
            switch (process.platform) {
              case "darwin":
                if (process.env.HOME) return (0, path_1.join)(process.env.HOME, "Library", "Caches", "com.amazonaws.jsii", "package-cache");
                break;

              case "linux":
                if (process.env.HOME) return (0, path_1.join)(process.env.HOME, ".cache", "aws", "jsii", "package-cache");
                break;

              case "win32":
                if (process.env.LOCALAPPDATA) return (0, path_1.join)(process.env.LOCALAPPDATA, "AWS", "jsii", "package-cache");
            }
            return (0, path_1.join)((0, os_1.tmpdir)(), "aws-jsii-package-cache");
        };
    },
    4383: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        var _a;
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.setPackageCacheEnabled = exports.getPackageCacheEnabled = exports.extract = void 0;
        const fs_1 = __webpack_require__(7147), os_1 = __webpack_require__(2037), path_1 = __webpack_require__(4822), tar = __webpack_require__(1189), disk_cache_1 = __webpack_require__(7202), default_cache_root_1 = __webpack_require__(4964);
        let packageCacheEnabled = "enabled" === (null === (_a = process.env.JSII_RUNTIME_PACKAGE_CACHE) || void 0 === _a ? void 0 : _a.toLocaleUpperCase());
        function extractToCache(file, options = {}, ...comments) {
            var _a;
            const cacheRoot = null !== (_a = process.env.JSII_RUNTIME_PACKAGE_CACHE_ROOT) && void 0 !== _a ? _a : (0, 
            default_cache_root_1.defaultCacheRoot)(), entry = disk_cache_1.DiskCache.inDirectory(cacheRoot).entryFor(file, ...comments);
            return entry.lock((lock => {
                let cache = "hit";
                if (!entry.pathExists) {
                    const tmpPath = `${entry.path}.tmp`;
                    (0, fs_1.mkdirSync)(tmpPath, {
                        recursive: !0
                    });
                    try {
                        untarInto({
                            ...options,
                            cwd: tmpPath,
                            file
                        }), (0, fs_1.renameSync)(tmpPath, entry.path);
                    } catch (error) {
                        throw (0, fs_1.rmSync)(entry.path, {
                            force: !0,
                            recursive: !0
                        }), error;
                    }
                    cache = "miss";
                }
                return lock.touch(), {
                    path: entry.path,
                    cache
                };
            }));
        }
        function extractToTemporary(file, options = {}) {
            const path = (0, fs_1.mkdtempSync)((0, path_1.join)((0, os_1.tmpdir)(), "jsii-runtime-untar-"));
            return untarInto({
                ...options,
                cwd: path,
                file
            }), {
                path
            };
        }
        function untarInto(options) {
            try {
                tar.extract({
                    ...options,
                    sync: !0
                });
            } catch (error) {
                throw (0, fs_1.rmSync)(options.cwd, {
                    force: !0,
                    recursive: !0
                }), error;
            }
        }
        exports.extract = function(file, options, ...comments) {
            return (packageCacheEnabled ? extractToCache : extractToTemporary)(file, options, ...comments);
        }, exports.getPackageCacheEnabled = function() {
            return packageCacheEnabled;
        }, exports.setPackageCacheEnabled = function(value) {
            packageCacheEnabled = value;
        };
    },
    7905: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.KernelHost = void 0;
        const kernel_1 = __webpack_require__(8944), events_1 = __webpack_require__(2361);
        exports.KernelHost = class {
            constructor(inout, opts = {}) {
                var _a, _b;
                this.inout = inout, this.opts = opts, this.kernel = new kernel_1.Kernel(this.callbackHandler.bind(this)), 
                this.eventEmitter = new events_1.EventEmitter, this.kernel.traceEnabled = null !== (_a = opts.debug) && void 0 !== _a && _a, 
                this.kernel.debugTimingEnabled = null !== (_b = opts.debugTiming) && void 0 !== _b && _b;
            }
            run() {
                var _a;
                const req = this.inout.read();
                req && !("exit" in req) ? this.processRequest(req, (() => {
                    setImmediate((() => this.run()));
                })) : this.eventEmitter.emit("exit", null !== (_a = null == req ? void 0 : req.exit) && void 0 !== _a ? _a : 0);
            }
            once(event, listener) {
                this.eventEmitter.once(event, listener);
            }
            callbackHandler(callback) {
                return this.inout.write({
                    callback
                }), function completeCallback() {
                    const req = this.inout.read();
                    if (!req || "exit" in req) throw new Error("Interrupted before callback returned");
                    const completeReq = req;
                    if ("complete" in completeReq && completeReq.complete.cbid === callback.cbid) {
                        if (completeReq.complete.err) throw new Error(completeReq.complete.err);
                        return completeReq.complete.result;
                    }
                    return this.processRequest(req, completeCallback.bind(this), !0);
                }.call(this);
            }
            processRequest(req, next, sync = !1) {
                if ("callback" in req) throw new Error("Unexpected `callback` result. This request should have been processed by a callback handler");
                if (!("api" in req)) throw new Error('Malformed request, "api" field is required');
                const apiReq = req, fn = this.findApi(apiReq.api);
                try {
                    const ret = fn.call(this.kernel, req);
                    if ("begin" === apiReq.api || "complete" === apiReq.api) return checkIfAsyncIsAllowed(), 
                    this.debug("processing pending promises before responding"), void setImmediate((() => {
                        this.writeOkay(ret), next();
                    }));
                    if (this.isPromise(ret)) {
                        checkIfAsyncIsAllowed(), this.debug("waiting for promise to be fulfilled");
                        return void ret.then((val => {
                            this.debug("promise succeeded:", val), this.writeOkay(val), next();
                        })).catch((e => {
                            this.debug("promise failed:", e), this.writeError(e), next();
                        }));
                    }
                    this.writeOkay(ret);
                } catch (e) {
                    this.writeError(e);
                }
                return next();
                function checkIfAsyncIsAllowed() {
                    if (sync) throw new Error("Cannot handle async operations while waiting for a sync callback to return");
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
                    stack: void 0
                };
                this.opts.noStack || (res.stack = error.stack), this.inout.write(res);
            }
            isPromise(v) {
                return "function" == typeof (null == v ? void 0 : v.then);
            }
            findApi(apiName) {
                const fn = this.kernel[apiName];
                if ("function" != typeof fn) throw new Error(`Invalid kernel api call: ${apiName}`);
                return fn;
            }
            debug(...args) {
                this.opts.debug && console.error(...args);
            }
        };
    },
    6156: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.InputOutput = void 0;
        exports.InputOutput = class {
            constructor(stdio) {
                this.stdio = stdio, this.debug = !1;
            }
            write(obj) {
                const output = JSON.stringify(obj);
                this.stdio.writeLine(output), this.debug && this.stdio.writeErrorLine(`< ${output}`);
            }
            read() {
                let reqLine = this.stdio.readLine();
                if (!reqLine) return;
                if (reqLine.startsWith("< ")) return this.read();
                reqLine.startsWith("> ") && (reqLine = reqLine.slice(2));
                const input = JSON.parse(reqLine);
                return this.debug && this.stdio.writeErrorLine(`> ${JSON.stringify(input)}`), input;
            }
        };
    },
    1416: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.SyncStdio = void 0;
        const fs = __webpack_require__(7147);
        exports.SyncStdio = class {
            constructor({errorFD, readFD, writeFD}) {
                this.bufferedData = Buffer.alloc(0), this.readBuffer = Buffer.alloc(1048576), this.stderr = errorFD, 
                this.stdin = readFD, this.stdout = writeFD;
            }
            writeErrorLine(line) {
                this.writeBuffer(Buffer.from(`${line}\n`), this.stderr);
            }
            writeLine(line) {
                this.writeBuffer(Buffer.from(`${line}\n`), this.stdout);
            }
            readLine() {
                for (;!this.bufferedData.includes("\n", 0, "utf-8"); ) {
                    const read = fs.readSync(this.stdin, this.readBuffer, 0, this.readBuffer.length, null);
                    if (0 === read) return;
                    const newData = this.readBuffer.slice(0, read);
                    this.bufferedData = Buffer.concat([ this.bufferedData, newData ]);
                }
                const newLinePos = this.bufferedData.indexOf("\n", 0, "utf-8"), next = this.bufferedData.slice(0, newLinePos).toString("utf-8");
                return this.bufferedData = this.bufferedData.slice(newLinePos + 1), next;
            }
            writeBuffer(buffer, fd) {
                let offset = 0;
                for (;offset < buffer.length; ) try {
                    offset += fs.writeSync(fd, buffer, offset);
                } catch (e) {
                    if ("EAGAIN" !== e.code) throw e;
                }
            }
        };
    },
    1228: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.loadAssemblyFromFile = exports.loadAssemblyFromPath = exports.loadAssemblyFromBuffer = exports.writeAssembly = exports.replaceAssembly = exports.findAssemblyFile = exports.compressedAssemblyExists = void 0;
        const fs = __webpack_require__(7147), path = __webpack_require__(4822), zlib = __webpack_require__(9796), assembly_1 = __webpack_require__(2752), redirect_1 = __webpack_require__(9639), validate_assembly_1 = __webpack_require__(5907);
        function compressedAssemblyExists(directory) {
            return fs.existsSync(path.join(directory, assembly_1.SPEC_FILE_NAME_COMPRESSED));
        }
        function findAssemblyFile(directory) {
            const dotJsiiFile = path.join(directory, assembly_1.SPEC_FILE_NAME);
            if (!fs.existsSync(dotJsiiFile)) throw new Error(`Expected to find ${assembly_1.SPEC_FILE_NAME} file in ${directory}, but no such file found`);
            return dotJsiiFile;
        }
        function writeAssembly(directory, assembly, {compress = !1} = {}) {
            return compress ? (fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME), JSON.stringify({
                schema: "jsii/file-redirect",
                compression: "gzip",
                filename: assembly_1.SPEC_FILE_NAME_COMPRESSED
            }), "utf-8"), fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME_COMPRESSED), zlib.gzipSync(JSON.stringify(assembly)))) : fs.writeFileSync(path.join(directory, assembly_1.SPEC_FILE_NAME), JSON.stringify(assembly, null, 2), "utf-8"), 
            compress;
        }
        exports.compressedAssemblyExists = compressedAssemblyExists, exports.findAssemblyFile = findAssemblyFile, 
        exports.replaceAssembly = function(assembly, directory) {
            writeAssembly(directory, function(assembly) {
                return assembly.fingerprint = "*".repeat(10), assembly;
            }(assembly), {
                compress: compressedAssemblyExists(directory)
            });
        }, exports.writeAssembly = writeAssembly;
        const failNoReadfileProvided = filename => {
            throw new Error(`Unable to load assembly support file ${JSON.stringify(filename)}: no readFile callback provided!`);
        };
        function loadAssemblyFromBuffer(assemblyBuffer, readFile = failNoReadfileProvided, validate = !0) {
            let contents = JSON.parse(assemblyBuffer.toString("utf-8"));
            for (;(0, redirect_1.isAssemblyRedirect)(contents); ) contents = followRedirect(contents, readFile);
            return validate ? (0, validate_assembly_1.validateAssembly)(contents) : contents;
        }
        function loadAssemblyFromFile(pathToFile, validate = !0) {
            return loadAssemblyFromBuffer(fs.readFileSync(pathToFile), (filename => fs.readFileSync(path.resolve(pathToFile, "..", filename))), validate);
        }
        function followRedirect(assemblyRedirect, readFile) {
            (0, redirect_1.validateAssemblyRedirect)(assemblyRedirect);
            let data = readFile(assemblyRedirect.filename);
            switch (assemblyRedirect.compression) {
              case "gzip":
                data = zlib.gunzipSync(data);
                break;

              case void 0:
                break;

              default:
                throw new Error(`Unsupported compression algorithm: ${JSON.stringify(assemblyRedirect.compression)}`);
            }
            const json = data.toString("utf-8");
            return JSON.parse(json);
        }
        exports.loadAssemblyFromBuffer = loadAssemblyFromBuffer, exports.loadAssemblyFromPath = function(directory, validate = !0) {
            return loadAssemblyFromFile(findAssemblyFile(directory), validate);
        }, exports.loadAssemblyFromFile = loadAssemblyFromFile;
    },
    2752: (__unused_webpack_module, exports) => {
        "use strict";
        var Stability, PrimitiveType, TypeKind;
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
        function isClassType(type) {
            return type?.kind === TypeKind.Class;
        }
        function isInterfaceType(type) {
            return type?.kind === TypeKind.Interface;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.isDeprecated = exports.describeTypeReference = exports.isClassOrInterfaceType = exports.isEnumType = exports.isInterfaceType = exports.isClassType = exports.TypeKind = exports.isMethod = exports.isUnionTypeReference = exports.isCollectionTypeReference = exports.isPrimitiveTypeReference = exports.isNamedTypeReference = exports.CANONICAL_ANY = exports.PrimitiveType = exports.CollectionKind = exports.Stability = exports.SchemaVersion = exports.SPEC_FILE_NAME_COMPRESSED = exports.SPEC_FILE_NAME = void 0, 
        exports.SPEC_FILE_NAME = ".jsii", exports.SPEC_FILE_NAME_COMPRESSED = `${exports.SPEC_FILE_NAME}.gz`, 
        function(SchemaVersion) {
            SchemaVersion.LATEST = "jsii/0.10.0";
        }(exports.SchemaVersion || (exports.SchemaVersion = {})), function(Stability) {
            Stability.Deprecated = "deprecated", Stability.Experimental = "experimental", Stability.Stable = "stable", 
            Stability.External = "external";
        }(Stability = exports.Stability || (exports.Stability = {})), function(CollectionKind) {
            CollectionKind.Array = "array", CollectionKind.Map = "map";
        }(exports.CollectionKind || (exports.CollectionKind = {})), function(PrimitiveType) {
            PrimitiveType.Date = "date", PrimitiveType.String = "string", PrimitiveType.Number = "number", 
            PrimitiveType.Boolean = "boolean", PrimitiveType.Json = "json", PrimitiveType.Any = "any";
        }(PrimitiveType = exports.PrimitiveType || (exports.PrimitiveType = {})), exports.CANONICAL_ANY = {
            primitive: PrimitiveType.Any
        }, exports.isNamedTypeReference = isNamedTypeReference, exports.isPrimitiveTypeReference = isPrimitiveTypeReference, 
        exports.isCollectionTypeReference = isCollectionTypeReference, exports.isUnionTypeReference = isUnionTypeReference, 
        exports.isMethod = function(callable) {
            return !!callable.name;
        }, function(TypeKind) {
            TypeKind.Class = "class", TypeKind.Enum = "enum", TypeKind.Interface = "interface";
        }(TypeKind = exports.TypeKind || (exports.TypeKind = {})), exports.isClassType = isClassType, 
        exports.isInterfaceType = isInterfaceType, exports.isEnumType = function(type) {
            return type?.kind === TypeKind.Enum;
        }, exports.isClassOrInterfaceType = function(type) {
            return isClassType(type) || isInterfaceType(type);
        }, exports.describeTypeReference = function describeTypeReference(type) {
            if (void 0 === type) return "void";
            if (isNamedTypeReference(type)) return type.fqn;
            if (isPrimitiveTypeReference(type)) return type.primitive;
            if (isCollectionTypeReference(type)) return `${type.collection.kind}<${describeTypeReference(type.collection.elementtype)}>`;
            if (isUnionTypeReference(type)) {
                return type.union.types.map(describeTypeReference).join(" | ");
            }
            throw new Error("Unrecognized type reference");
        }, exports.isDeprecated = function(entity) {
            return entity?.docs?.stability === Stability.Deprecated;
        };
    },
    5585: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
    },
    1804: function(__unused_webpack_module, exports, __webpack_require__) {
        "use strict";
        var __createBinding = this && this.__createBinding || (Object.create ? function(o, m, k, k2) {
            void 0 === k2 && (k2 = k);
            var desc = Object.getOwnPropertyDescriptor(m, k);
            desc && !("get" in desc ? !m.__esModule : desc.writable || desc.configurable) || (desc = {
                enumerable: !0,
                get: function() {
                    return m[k];
                }
            }), Object.defineProperty(o, k2, desc);
        } : function(o, m, k, k2) {
            void 0 === k2 && (k2 = k), o[k2] = m[k];
        }), __exportStar = this && this.__exportStar || function(m, exports) {
            for (var p in m) "default" === p || Object.prototype.hasOwnProperty.call(exports, p) || __createBinding(exports, m, p);
        };
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), __exportStar(__webpack_require__(2752), exports), __exportStar(__webpack_require__(1228), exports), 
        __exportStar(__webpack_require__(5585), exports), __exportStar(__webpack_require__(1485), exports), 
        __exportStar(__webpack_require__(9639), exports), __exportStar(__webpack_require__(5907), exports);
    },
    1485: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.NameTree = void 0;
        class NameTree {
            constructor() {
                this._children = {};
            }
            static of(assm) {
                const nameTree = new NameTree;
                for (const type of Object.values(assm.types ?? {})) nameTree.register(type.fqn);
                return nameTree;
            }
            get children() {
                return this._children;
            }
            get fqn() {
                return this._fqn;
            }
            register(fqn, path = fqn.split(".")) {
                if (0 === path.length) this._fqn = fqn; else {
                    const [head, ...rest] = path;
                    this._children[head] || (this._children[head] = new NameTree), this._children[head].register(fqn, rest);
                }
                return this;
            }
        }
        exports.NameTree = NameTree;
    },
    9639: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateAssemblyRedirect = exports.isAssemblyRedirect = exports.assemblyRedirectSchema = void 0;
        const ajv_1 = __webpack_require__(2785);
        exports.assemblyRedirectSchema = __webpack_require__(6715);
        exports.isAssemblyRedirect = function(obj) {
            return "object" == typeof obj && null != obj && "jsii/file-redirect" === obj.schema;
        }, exports.validateAssemblyRedirect = function(obj) {
            const validate = (new ajv_1.default).compile(exports.assemblyRedirectSchema);
            if (validate(obj), validate.errors) throw new Error(`Invalid assembly redirect:\n${validate.errors.map((e => ` * ${e.message}`)).join("\n").toString()}`);
            return obj;
        };
    },
    5907: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateAssembly = exports.schema = void 0;
        const ajv_1 = __webpack_require__(2785);
        exports.schema = __webpack_require__(9402), exports.validateAssembly = function(obj) {
            const validate = (new ajv_1.default).compile(exports.schema);
            if (validate(obj), validate.errors) throw new Error(`Invalid assembly:\n${validate.errors.map((e => ` * ${e.message}`)).join("\n").toString()}`);
            return obj;
        };
    },
    2785: (module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
        const core_1 = __webpack_require__(8858), draft7_1 = __webpack_require__(5802), discriminator_1 = __webpack_require__(1966), draft7MetaSchema = __webpack_require__(7538), META_SUPPORT_DATA = [ "/properties" ], META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
        class Ajv extends core_1.default {
            _addVocabularies() {
                super._addVocabularies(), draft7_1.default.forEach((v => this.addVocabulary(v))), 
                this.opts.discriminator && this.addKeyword(discriminator_1.default);
            }
            _addDefaultMetaSchema() {
                if (super._addDefaultMetaSchema(), !this.opts.meta) return;
                const metaSchema = this.opts.$data ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA) : draft7MetaSchema;
                this.addMetaSchema(metaSchema, META_SCHEMA_ID, !1), this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
            }
            defaultMeta() {
                return this.opts.defaultMeta = super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : void 0);
            }
        }
        module.exports = exports = Ajv, Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.default = Ajv;
        var validate_1 = __webpack_require__(7316);
        Object.defineProperty(exports, "KeywordCxt", {
            enumerable: !0,
            get: function() {
                return validate_1.KeywordCxt;
            }
        });
        var codegen_1 = __webpack_require__(3947);
        Object.defineProperty(exports, "_", {
            enumerable: !0,
            get: function() {
                return codegen_1._;
            }
        }), Object.defineProperty(exports, "str", {
            enumerable: !0,
            get: function() {
                return codegen_1.str;
            }
        }), Object.defineProperty(exports, "stringify", {
            enumerable: !0,
            get: function() {
                return codegen_1.stringify;
            }
        }), Object.defineProperty(exports, "nil", {
            enumerable: !0,
            get: function() {
                return codegen_1.nil;
            }
        }), Object.defineProperty(exports, "Name", {
            enumerable: !0,
            get: function() {
                return codegen_1.Name;
            }
        }), Object.defineProperty(exports, "CodeGen", {
            enumerable: !0,
            get: function() {
                return codegen_1.CodeGen;
            }
        });
    },
    2948: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.regexpCode = exports.getEsmExportName = exports.getProperty = exports.safeStringify = exports.stringify = exports.strConcat = exports.addCodeArg = exports.str = exports._ = exports.nil = exports._Code = exports.Name = exports.IDENTIFIER = exports._CodeOrName = void 0;
        class _CodeOrName {}
        exports._CodeOrName = _CodeOrName, exports.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
        class Name extends _CodeOrName {
            constructor(s) {
                if (super(), !exports.IDENTIFIER.test(s)) throw new Error("CodeGen: name must be a valid identifier");
                this.str = s;
            }
            toString() {
                return this.str;
            }
            emptyStr() {
                return !1;
            }
            get names() {
                return {
                    [this.str]: 1
                };
            }
        }
        exports.Name = Name;
        class _Code extends _CodeOrName {
            constructor(code) {
                super(), this._items = "string" == typeof code ? [ code ] : code;
            }
            toString() {
                return this.str;
            }
            emptyStr() {
                if (this._items.length > 1) return !1;
                const item = this._items[0];
                return "" === item || '""' === item;
            }
            get str() {
                var _a;
                return null !== (_a = this._str) && void 0 !== _a ? _a : this._str = this._items.reduce(((s, c) => `${s}${c}`), "");
            }
            get names() {
                var _a;
                return null !== (_a = this._names) && void 0 !== _a ? _a : this._names = this._items.reduce(((names, c) => (c instanceof Name && (names[c.str] = (names[c.str] || 0) + 1), 
                names)), {});
            }
        }
        function _(strs, ...args) {
            const code = [ strs[0] ];
            let i = 0;
            for (;i < args.length; ) addCodeArg(code, args[i]), code.push(strs[++i]);
            return new _Code(code);
        }
        exports._Code = _Code, exports.nil = new _Code(""), exports._ = _;
        const plus = new _Code("+");
        function str(strs, ...args) {
            const expr = [ safeStringify(strs[0]) ];
            let i = 0;
            for (;i < args.length; ) expr.push(plus), addCodeArg(expr, args[i]), expr.push(plus, safeStringify(strs[++i]));
            return function(expr) {
                let i = 1;
                for (;i < expr.length - 1; ) {
                    if (expr[i] === plus) {
                        const res = mergeExprItems(expr[i - 1], expr[i + 1]);
                        if (void 0 !== res) {
                            expr.splice(i - 1, 3, res);
                            continue;
                        }
                        expr[i++] = "+";
                    }
                    i++;
                }
            }(expr), new _Code(expr);
        }
        function addCodeArg(code, arg) {
            var x;
            arg instanceof _Code ? code.push(...arg._items) : arg instanceof Name ? code.push(arg) : code.push("number" == typeof (x = arg) || "boolean" == typeof x || null === x ? x : safeStringify(Array.isArray(x) ? x.join(",") : x));
        }
        function mergeExprItems(a, b) {
            if ('""' === b) return a;
            if ('""' === a) return b;
            if ("string" == typeof a) {
                if (b instanceof Name || '"' !== a[a.length - 1]) return;
                return "string" != typeof b ? `${a.slice(0, -1)}${b}"` : '"' === b[0] ? a.slice(0, -1) + b.slice(1) : void 0;
            }
            return "string" != typeof b || '"' !== b[0] || a instanceof Name ? void 0 : `"${a}${b.slice(1)}`;
        }
        function safeStringify(x) {
            return JSON.stringify(x).replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029");
        }
        exports.str = str, exports.addCodeArg = addCodeArg, exports.strConcat = function(c1, c2) {
            return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str`${c1}${c2}`;
        }, exports.stringify = function(x) {
            return new _Code(safeStringify(x));
        }, exports.safeStringify = safeStringify, exports.getProperty = function(key) {
            return "string" == typeof key && exports.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _`[${key}]`;
        }, exports.getEsmExportName = function(key) {
            if ("string" == typeof key && exports.IDENTIFIER.test(key)) return new _Code(`${key}`);
            throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
        }, exports.regexpCode = function(rx) {
            return new _Code(rx.toString());
        };
    },
    3947: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.or = exports.and = exports.not = exports.CodeGen = exports.operators = exports.varKinds = exports.ValueScopeName = exports.ValueScope = exports.Scope = exports.Name = exports.regexpCode = exports.stringify = exports.getProperty = exports.nil = exports.strConcat = exports.str = exports._ = void 0;
        const code_1 = __webpack_require__(2948), scope_1 = __webpack_require__(9177);
        var code_2 = __webpack_require__(2948);
        Object.defineProperty(exports, "_", {
            enumerable: !0,
            get: function() {
                return code_2._;
            }
        }), Object.defineProperty(exports, "str", {
            enumerable: !0,
            get: function() {
                return code_2.str;
            }
        }), Object.defineProperty(exports, "strConcat", {
            enumerable: !0,
            get: function() {
                return code_2.strConcat;
            }
        }), Object.defineProperty(exports, "nil", {
            enumerable: !0,
            get: function() {
                return code_2.nil;
            }
        }), Object.defineProperty(exports, "getProperty", {
            enumerable: !0,
            get: function() {
                return code_2.getProperty;
            }
        }), Object.defineProperty(exports, "stringify", {
            enumerable: !0,
            get: function() {
                return code_2.stringify;
            }
        }), Object.defineProperty(exports, "regexpCode", {
            enumerable: !0,
            get: function() {
                return code_2.regexpCode;
            }
        }), Object.defineProperty(exports, "Name", {
            enumerable: !0,
            get: function() {
                return code_2.Name;
            }
        });
        var scope_2 = __webpack_require__(9177);
        Object.defineProperty(exports, "Scope", {
            enumerable: !0,
            get: function() {
                return scope_2.Scope;
            }
        }), Object.defineProperty(exports, "ValueScope", {
            enumerable: !0,
            get: function() {
                return scope_2.ValueScope;
            }
        }), Object.defineProperty(exports, "ValueScopeName", {
            enumerable: !0,
            get: function() {
                return scope_2.ValueScopeName;
            }
        }), Object.defineProperty(exports, "varKinds", {
            enumerable: !0,
            get: function() {
                return scope_2.varKinds;
            }
        }), exports.operators = {
            GT: new code_1._Code(">"),
            GTE: new code_1._Code(">="),
            LT: new code_1._Code("<"),
            LTE: new code_1._Code("<="),
            EQ: new code_1._Code("==="),
            NEQ: new code_1._Code("!=="),
            NOT: new code_1._Code("!"),
            OR: new code_1._Code("||"),
            AND: new code_1._Code("&&"),
            ADD: new code_1._Code("+")
        };
        class Node {
            optimizeNodes() {
                return this;
            }
            optimizeNames(_names, _constants) {
                return this;
            }
        }
        class Def extends Node {
            constructor(varKind, name, rhs) {
                super(), this.varKind = varKind, this.name = name, this.rhs = rhs;
            }
            render({es5, _n}) {
                const varKind = es5 ? scope_1.varKinds.var : this.varKind, rhs = void 0 === this.rhs ? "" : ` = ${this.rhs}`;
                return `${varKind} ${this.name}${rhs};` + _n;
            }
            optimizeNames(names, constants) {
                if (names[this.name.str]) return this.rhs && (this.rhs = optimizeExpr(this.rhs, names, constants)), 
                this;
            }
            get names() {
                return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
            }
        }
        class Assign extends Node {
            constructor(lhs, rhs, sideEffects) {
                super(), this.lhs = lhs, this.rhs = rhs, this.sideEffects = sideEffects;
            }
            render({_n}) {
                return `${this.lhs} = ${this.rhs};` + _n;
            }
            optimizeNames(names, constants) {
                if (!(this.lhs instanceof code_1.Name) || names[this.lhs.str] || this.sideEffects) return this.rhs = optimizeExpr(this.rhs, names, constants), 
                this;
            }
            get names() {
                return addExprNames(this.lhs instanceof code_1.Name ? {} : {
                    ...this.lhs.names
                }, this.rhs);
            }
        }
        class AssignOp extends Assign {
            constructor(lhs, op, rhs, sideEffects) {
                super(lhs, rhs, sideEffects), this.op = op;
            }
            render({_n}) {
                return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
            }
        }
        class Label extends Node {
            constructor(label) {
                super(), this.label = label, this.names = {};
            }
            render({_n}) {
                return `${this.label}:` + _n;
            }
        }
        class Break extends Node {
            constructor(label) {
                super(), this.label = label, this.names = {};
            }
            render({_n}) {
                return `break${this.label ? ` ${this.label}` : ""};` + _n;
            }
        }
        class Throw extends Node {
            constructor(error) {
                super(), this.error = error;
            }
            render({_n}) {
                return `throw ${this.error};` + _n;
            }
            get names() {
                return this.error.names;
            }
        }
        class AnyCode extends Node {
            constructor(code) {
                super(), this.code = code;
            }
            render({_n}) {
                return `${this.code};` + _n;
            }
            optimizeNodes() {
                return `${this.code}` ? this : void 0;
            }
            optimizeNames(names, constants) {
                return this.code = optimizeExpr(this.code, names, constants), this;
            }
            get names() {
                return this.code instanceof code_1._CodeOrName ? this.code.names : {};
            }
        }
        class ParentNode extends Node {
            constructor(nodes = []) {
                super(), this.nodes = nodes;
            }
            render(opts) {
                return this.nodes.reduce(((code, n) => code + n.render(opts)), "");
            }
            optimizeNodes() {
                const {nodes} = this;
                let i = nodes.length;
                for (;i--; ) {
                    const n = nodes[i].optimizeNodes();
                    Array.isArray(n) ? nodes.splice(i, 1, ...n) : n ? nodes[i] = n : nodes.splice(i, 1);
                }
                return nodes.length > 0 ? this : void 0;
            }
            optimizeNames(names, constants) {
                const {nodes} = this;
                let i = nodes.length;
                for (;i--; ) {
                    const n = nodes[i];
                    n.optimizeNames(names, constants) || (subtractNames(names, n.names), nodes.splice(i, 1));
                }
                return nodes.length > 0 ? this : void 0;
            }
            get names() {
                return this.nodes.reduce(((names, n) => addNames(names, n.names)), {});
            }
        }
        class BlockNode extends ParentNode {
            render(opts) {
                return "{" + opts._n + super.render(opts) + "}" + opts._n;
            }
        }
        class Root extends ParentNode {}
        class Else extends BlockNode {}
        Else.kind = "else";
        class If extends BlockNode {
            constructor(condition, nodes) {
                super(nodes), this.condition = condition;
            }
            render(opts) {
                let code = `if(${this.condition})` + super.render(opts);
                return this.else && (code += "else " + this.else.render(opts)), code;
            }
            optimizeNodes() {
                super.optimizeNodes();
                const cond = this.condition;
                if (!0 === cond) return this.nodes;
                let e = this.else;
                if (e) {
                    const ns = e.optimizeNodes();
                    e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
                }
                return e ? !1 === cond ? e instanceof If ? e : e.nodes : this.nodes.length ? this : new If(not(cond), e instanceof If ? [ e ] : e.nodes) : !1 !== cond && this.nodes.length ? this : void 0;
            }
            optimizeNames(names, constants) {
                var _a;
                if (this.else = null === (_a = this.else) || void 0 === _a ? void 0 : _a.optimizeNames(names, constants), 
                super.optimizeNames(names, constants) || this.else) return this.condition = optimizeExpr(this.condition, names, constants), 
                this;
            }
            get names() {
                const names = super.names;
                return addExprNames(names, this.condition), this.else && addNames(names, this.else.names), 
                names;
            }
        }
        If.kind = "if";
        class For extends BlockNode {}
        For.kind = "for";
        class ForLoop extends For {
            constructor(iteration) {
                super(), this.iteration = iteration;
            }
            render(opts) {
                return `for(${this.iteration})` + super.render(opts);
            }
            optimizeNames(names, constants) {
                if (super.optimizeNames(names, constants)) return this.iteration = optimizeExpr(this.iteration, names, constants), 
                this;
            }
            get names() {
                return addNames(super.names, this.iteration.names);
            }
        }
        class ForRange extends For {
            constructor(varKind, name, from, to) {
                super(), this.varKind = varKind, this.name = name, this.from = from, this.to = to;
            }
            render(opts) {
                const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind, {name, from, to} = this;
                return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
            }
            get names() {
                const names = addExprNames(super.names, this.from);
                return addExprNames(names, this.to);
            }
        }
        class ForIter extends For {
            constructor(loop, varKind, name, iterable) {
                super(), this.loop = loop, this.varKind = varKind, this.name = name, this.iterable = iterable;
            }
            render(opts) {
                return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
            }
            optimizeNames(names, constants) {
                if (super.optimizeNames(names, constants)) return this.iterable = optimizeExpr(this.iterable, names, constants), 
                this;
            }
            get names() {
                return addNames(super.names, this.iterable.names);
            }
        }
        class Func extends BlockNode {
            constructor(name, args, async) {
                super(), this.name = name, this.args = args, this.async = async;
            }
            render(opts) {
                return `${this.async ? "async " : ""}function ${this.name}(${this.args})` + super.render(opts);
            }
        }
        Func.kind = "func";
        class Return extends ParentNode {
            render(opts) {
                return "return " + super.render(opts);
            }
        }
        Return.kind = "return";
        class Try extends BlockNode {
            render(opts) {
                let code = "try" + super.render(opts);
                return this.catch && (code += this.catch.render(opts)), this.finally && (code += this.finally.render(opts)), 
                code;
            }
            optimizeNodes() {
                var _a, _b;
                return super.optimizeNodes(), null === (_a = this.catch) || void 0 === _a || _a.optimizeNodes(), 
                null === (_b = this.finally) || void 0 === _b || _b.optimizeNodes(), this;
            }
            optimizeNames(names, constants) {
                var _a, _b;
                return super.optimizeNames(names, constants), null === (_a = this.catch) || void 0 === _a || _a.optimizeNames(names, constants), 
                null === (_b = this.finally) || void 0 === _b || _b.optimizeNames(names, constants), 
                this;
            }
            get names() {
                const names = super.names;
                return this.catch && addNames(names, this.catch.names), this.finally && addNames(names, this.finally.names), 
                names;
            }
        }
        class Catch extends BlockNode {
            constructor(error) {
                super(), this.error = error;
            }
            render(opts) {
                return `catch(${this.error})` + super.render(opts);
            }
        }
        Catch.kind = "catch";
        class Finally extends BlockNode {
            render(opts) {
                return "finally" + super.render(opts);
            }
        }
        Finally.kind = "finally";
        function addNames(names, from) {
            for (const n in from) names[n] = (names[n] || 0) + (from[n] || 0);
            return names;
        }
        function addExprNames(names, from) {
            return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
        }
        function optimizeExpr(expr, names, constants) {
            return expr instanceof code_1.Name ? replaceName(expr) : (e = expr) instanceof code_1._Code && e._items.some((c => c instanceof code_1.Name && 1 === names[c.str] && void 0 !== constants[c.str])) ? new code_1._Code(expr._items.reduce(((items, c) => (c instanceof code_1.Name && (c = replaceName(c)), 
            c instanceof code_1._Code ? items.push(...c._items) : items.push(c), items)), [])) : expr;
            var e;
            function replaceName(n) {
                const c = constants[n.str];
                return void 0 === c || 1 !== names[n.str] ? n : (delete names[n.str], c);
            }
        }
        function subtractNames(names, from) {
            for (const n in from) names[n] = (names[n] || 0) - (from[n] || 0);
        }
        function not(x) {
            return "boolean" == typeof x || "number" == typeof x || null === x ? !x : code_1._`!${par(x)}`;
        }
        exports.CodeGen = class {
            constructor(extScope, opts = {}) {
                this._values = {}, this._blockStarts = [], this._constants = {}, this.opts = {
                    ...opts,
                    _n: opts.lines ? "\n" : ""
                }, this._extScope = extScope, this._scope = new scope_1.Scope({
                    parent: extScope
                }), this._nodes = [ new Root ];
            }
            toString() {
                return this._root.render(this.opts);
            }
            name(prefix) {
                return this._scope.name(prefix);
            }
            scopeName(prefix) {
                return this._extScope.name(prefix);
            }
            scopeValue(prefixOrName, value) {
                const name = this._extScope.value(prefixOrName, value);
                return (this._values[name.prefix] || (this._values[name.prefix] = new Set)).add(name), 
                name;
            }
            getScopeValue(prefix, keyOrRef) {
                return this._extScope.getValue(prefix, keyOrRef);
            }
            scopeRefs(scopeName) {
                return this._extScope.scopeRefs(scopeName, this._values);
            }
            scopeCode() {
                return this._extScope.scopeCode(this._values);
            }
            _def(varKind, nameOrPrefix, rhs, constant) {
                const name = this._scope.toName(nameOrPrefix);
                return void 0 !== rhs && constant && (this._constants[name.str] = rhs), this._leafNode(new Def(varKind, name, rhs)), 
                name;
            }
            const(nameOrPrefix, rhs, _constant) {
                return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
            }
            let(nameOrPrefix, rhs, _constant) {
                return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
            }
            var(nameOrPrefix, rhs, _constant) {
                return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
            }
            assign(lhs, rhs, sideEffects) {
                return this._leafNode(new Assign(lhs, rhs, sideEffects));
            }
            add(lhs, rhs) {
                return this._leafNode(new AssignOp(lhs, exports.operators.ADD, rhs));
            }
            code(c) {
                return "function" == typeof c ? c() : c !== code_1.nil && this._leafNode(new AnyCode(c)), 
                this;
            }
            object(...keyValues) {
                const code = [ "{" ];
                for (const [key, value] of keyValues) code.length > 1 && code.push(","), code.push(key), 
                (key !== value || this.opts.es5) && (code.push(":"), (0, code_1.addCodeArg)(code, value));
                return code.push("}"), new code_1._Code(code);
            }
            if(condition, thenBody, elseBody) {
                if (this._blockNode(new If(condition)), thenBody && elseBody) this.code(thenBody).else().code(elseBody).endIf(); else if (thenBody) this.code(thenBody).endIf(); else if (elseBody) throw new Error('CodeGen: "else" body without "then" body');
                return this;
            }
            elseIf(condition) {
                return this._elseNode(new If(condition));
            }
            else() {
                return this._elseNode(new Else);
            }
            endIf() {
                return this._endBlockNode(If, Else);
            }
            _for(node, forBody) {
                return this._blockNode(node), forBody && this.code(forBody).endFor(), this;
            }
            for(iteration, forBody) {
                return this._for(new ForLoop(iteration), forBody);
            }
            forRange(nameOrPrefix, from, to, forBody, varKind = (this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let)) {
                const name = this._scope.toName(nameOrPrefix);
                return this._for(new ForRange(varKind, name, from, to), (() => forBody(name)));
            }
            forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
                const name = this._scope.toName(nameOrPrefix);
                if (this.opts.es5) {
                    const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
                    return this.forRange("_i", 0, code_1._`${arr}.length`, (i => {
                        this.var(name, code_1._`${arr}[${i}]`), forBody(name);
                    }));
                }
                return this._for(new ForIter("of", varKind, name, iterable), (() => forBody(name)));
            }
            forIn(nameOrPrefix, obj, forBody, varKind = (this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const)) {
                if (this.opts.ownProperties) return this.forOf(nameOrPrefix, code_1._`Object.keys(${obj})`, forBody);
                const name = this._scope.toName(nameOrPrefix);
                return this._for(new ForIter("in", varKind, name, obj), (() => forBody(name)));
            }
            endFor() {
                return this._endBlockNode(For);
            }
            label(label) {
                return this._leafNode(new Label(label));
            }
            break(label) {
                return this._leafNode(new Break(label));
            }
            return(value) {
                const node = new Return;
                if (this._blockNode(node), this.code(value), 1 !== node.nodes.length) throw new Error('CodeGen: "return" should have one node');
                return this._endBlockNode(Return);
            }
            try(tryBody, catchCode, finallyCode) {
                if (!catchCode && !finallyCode) throw new Error('CodeGen: "try" without "catch" and "finally"');
                const node = new Try;
                if (this._blockNode(node), this.code(tryBody), catchCode) {
                    const error = this.name("e");
                    this._currNode = node.catch = new Catch(error), catchCode(error);
                }
                return finallyCode && (this._currNode = node.finally = new Finally, this.code(finallyCode)), 
                this._endBlockNode(Catch, Finally);
            }
            throw(error) {
                return this._leafNode(new Throw(error));
            }
            block(body, nodeCount) {
                return this._blockStarts.push(this._nodes.length), body && this.code(body).endBlock(nodeCount), 
                this;
            }
            endBlock(nodeCount) {
                const len = this._blockStarts.pop();
                if (void 0 === len) throw new Error("CodeGen: not in self-balancing block");
                const toClose = this._nodes.length - len;
                if (toClose < 0 || void 0 !== nodeCount && toClose !== nodeCount) throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
                return this._nodes.length = len, this;
            }
            func(name, args = code_1.nil, async, funcBody) {
                return this._blockNode(new Func(name, args, async)), funcBody && this.code(funcBody).endFunc(), 
                this;
            }
            endFunc() {
                return this._endBlockNode(Func);
            }
            optimize(n = 1) {
                for (;n-- > 0; ) this._root.optimizeNodes(), this._root.optimizeNames(this._root.names, this._constants);
            }
            _leafNode(node) {
                return this._currNode.nodes.push(node), this;
            }
            _blockNode(node) {
                this._currNode.nodes.push(node), this._nodes.push(node);
            }
            _endBlockNode(N1, N2) {
                const n = this._currNode;
                if (n instanceof N1 || N2 && n instanceof N2) return this._nodes.pop(), this;
                throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
            }
            _elseNode(node) {
                const n = this._currNode;
                if (!(n instanceof If)) throw new Error('CodeGen: "else" without "if"');
                return this._currNode = n.else = node, this;
            }
            get _root() {
                return this._nodes[0];
            }
            get _currNode() {
                const ns = this._nodes;
                return ns[ns.length - 1];
            }
            set _currNode(node) {
                const ns = this._nodes;
                ns[ns.length - 1] = node;
            }
        }, exports.not = not;
        const andCode = mappend(exports.operators.AND);
        exports.and = function(...args) {
            return args.reduce(andCode);
        };
        const orCode = mappend(exports.operators.OR);
        function mappend(op) {
            return (x, y) => x === code_1.nil ? y : y === code_1.nil ? x : code_1._`${par(x)} ${op} ${par(y)}`;
        }
        function par(x) {
            return x instanceof code_1.Name ? x : code_1._`(${x})`;
        }
        exports.or = function(...args) {
            return args.reduce(orCode);
        };
    },
    9177: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.ValueScope = exports.ValueScopeName = exports.Scope = exports.varKinds = exports.UsedValueState = void 0;
        const code_1 = __webpack_require__(2948);
        class ValueError extends Error {
            constructor(name) {
                super(`CodeGen: "code" for ${name} not defined`), this.value = name.value;
            }
        }
        var UsedValueState;
        !function(UsedValueState) {
            UsedValueState[UsedValueState.Started = 0] = "Started", UsedValueState[UsedValueState.Completed = 1] = "Completed";
        }(UsedValueState = exports.UsedValueState || (exports.UsedValueState = {})), exports.varKinds = {
            const: new code_1.Name("const"),
            let: new code_1.Name("let"),
            var: new code_1.Name("var")
        };
        class Scope {
            constructor({prefixes, parent} = {}) {
                this._names = {}, this._prefixes = prefixes, this._parent = parent;
            }
            toName(nameOrPrefix) {
                return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
            }
            name(prefix) {
                return new code_1.Name(this._newName(prefix));
            }
            _newName(prefix) {
                return `${prefix}${(this._names[prefix] || this._nameGroup(prefix)).index++}`;
            }
            _nameGroup(prefix) {
                var _a, _b;
                if ((null === (_b = null === (_a = this._parent) || void 0 === _a ? void 0 : _a._prefixes) || void 0 === _b ? void 0 : _b.has(prefix)) || this._prefixes && !this._prefixes.has(prefix)) throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
                return this._names[prefix] = {
                    prefix,
                    index: 0
                };
            }
        }
        exports.Scope = Scope;
        class ValueScopeName extends code_1.Name {
            constructor(prefix, nameStr) {
                super(nameStr), this.prefix = prefix;
            }
            setValue(value, {property, itemIndex}) {
                this.value = value, this.scopePath = code_1._`.${new code_1.Name(property)}[${itemIndex}]`;
            }
        }
        exports.ValueScopeName = ValueScopeName;
        const line = code_1._`\n`;
        exports.ValueScope = class extends Scope {
            constructor(opts) {
                super(opts), this._values = {}, this._scope = opts.scope, this.opts = {
                    ...opts,
                    _n: opts.lines ? line : code_1.nil
                };
            }
            get() {
                return this._scope;
            }
            name(prefix) {
                return new ValueScopeName(prefix, this._newName(prefix));
            }
            value(nameOrPrefix, value) {
                var _a;
                if (void 0 === value.ref) throw new Error("CodeGen: ref must be passed in value");
                const name = this.toName(nameOrPrefix), {prefix} = name, valueKey = null !== (_a = value.key) && void 0 !== _a ? _a : value.ref;
                let vs = this._values[prefix];
                if (vs) {
                    const _name = vs.get(valueKey);
                    if (_name) return _name;
                } else vs = this._values[prefix] = new Map;
                vs.set(valueKey, name);
                const s = this._scope[prefix] || (this._scope[prefix] = []), itemIndex = s.length;
                return s[itemIndex] = value.ref, name.setValue(value, {
                    property: prefix,
                    itemIndex
                }), name;
            }
            getValue(prefix, keyOrRef) {
                const vs = this._values[prefix];
                if (vs) return vs.get(keyOrRef);
            }
            scopeRefs(scopeName, values = this._values) {
                return this._reduceValues(values, (name => {
                    if (void 0 === name.scopePath) throw new Error(`CodeGen: name "${name}" has no value`);
                    return code_1._`${scopeName}${name.scopePath}`;
                }));
            }
            scopeCode(values = this._values, usedValues, getCode) {
                return this._reduceValues(values, (name => {
                    if (void 0 === name.value) throw new Error(`CodeGen: name "${name}" has no value`);
                    return name.value.code;
                }), usedValues, getCode);
            }
            _reduceValues(values, valueCode, usedValues = {}, getCode) {
                let code = code_1.nil;
                for (const prefix in values) {
                    const vs = values[prefix];
                    if (!vs) continue;
                    const nameSet = usedValues[prefix] = usedValues[prefix] || new Map;
                    vs.forEach((name => {
                        if (nameSet.has(name)) return;
                        nameSet.set(name, UsedValueState.Started);
                        let c = valueCode(name);
                        if (c) {
                            const def = this.opts.es5 ? exports.varKinds.var : exports.varKinds.const;
                            code = code_1._`${code}${def} ${name} = ${c};${this.opts._n}`;
                        } else {
                            if (!(c = null == getCode ? void 0 : getCode(name))) throw new ValueError(name);
                            code = code_1._`${code}${c}${this.opts._n}`;
                        }
                        nameSet.set(name, UsedValueState.Completed);
                    }));
                }
                return code;
            }
        };
    },
    2919: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.extendErrors = exports.resetErrorsCount = exports.reportExtraError = exports.reportError = exports.keyword$DataError = exports.keywordError = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), names_1 = __webpack_require__(3258);
        function addError(gen, errObj) {
            const err = gen.const("err", errObj);
            gen.if(codegen_1._`${names_1.default.vErrors} === null`, (() => gen.assign(names_1.default.vErrors, codegen_1._`[${err}]`)), codegen_1._`${names_1.default.vErrors}.push(${err})`), 
            gen.code(codegen_1._`${names_1.default.errors}++`);
        }
        function returnErrors(it, errs) {
            const {gen, validateName, schemaEnv} = it;
            schemaEnv.$async ? gen.throw(codegen_1._`new ${it.ValidationError}(${errs})`) : (gen.assign(codegen_1._`${validateName}.errors`, errs), 
            gen.return(!1));
        }
        exports.keywordError = {
            message: ({keyword}) => codegen_1.str`must pass "${keyword}" keyword validation`
        }, exports.keyword$DataError = {
            message: ({keyword, schemaType}) => schemaType ? codegen_1.str`"${keyword}" keyword must be ${schemaType} ($data)` : codegen_1.str`"${keyword}" keyword is invalid ($data)`
        }, exports.reportError = function(cxt, error = exports.keywordError, errorPaths, overrideAllErrors) {
            const {it} = cxt, {gen, compositeRule, allErrors} = it, errObj = errorObjectCode(cxt, error, errorPaths);
            (null != overrideAllErrors ? overrideAllErrors : compositeRule || allErrors) ? addError(gen, errObj) : returnErrors(it, codegen_1._`[${errObj}]`);
        }, exports.reportExtraError = function(cxt, error = exports.keywordError, errorPaths) {
            const {it} = cxt, {gen, compositeRule, allErrors} = it;
            addError(gen, errorObjectCode(cxt, error, errorPaths)), compositeRule || allErrors || returnErrors(it, names_1.default.vErrors);
        }, exports.resetErrorsCount = function(gen, errsCount) {
            gen.assign(names_1.default.errors, errsCount), gen.if(codegen_1._`${names_1.default.vErrors} !== null`, (() => gen.if(errsCount, (() => gen.assign(codegen_1._`${names_1.default.vErrors}.length`, errsCount)), (() => gen.assign(names_1.default.vErrors, null)))));
        }, exports.extendErrors = function({gen, keyword, schemaValue, data, errsCount, it}) {
            if (void 0 === errsCount) throw new Error("ajv implementation error");
            const err = gen.name("err");
            gen.forRange("i", errsCount, names_1.default.errors, (i => {
                gen.const(err, codegen_1._`${names_1.default.vErrors}[${i}]`), gen.if(codegen_1._`${err}.instancePath === undefined`, (() => gen.assign(codegen_1._`${err}.instancePath`, (0, 
                codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)))), gen.assign(codegen_1._`${err}.schemaPath`, codegen_1.str`${it.errSchemaPath}/${keyword}`), 
                it.opts.verbose && (gen.assign(codegen_1._`${err}.schema`, schemaValue), gen.assign(codegen_1._`${err}.data`, data));
            }));
        };
        const E = {
            keyword: new codegen_1.Name("keyword"),
            schemaPath: new codegen_1.Name("schemaPath"),
            params: new codegen_1.Name("params"),
            propertyName: new codegen_1.Name("propertyName"),
            message: new codegen_1.Name("message"),
            schema: new codegen_1.Name("schema"),
            parentSchema: new codegen_1.Name("parentSchema")
        };
        function errorObjectCode(cxt, error, errorPaths) {
            const {createErrors} = cxt.it;
            return !1 === createErrors ? codegen_1._`{}` : function(cxt, error, errorPaths = {}) {
                const {gen, it} = cxt, keyValues = [ errorInstancePath(it, errorPaths), errorSchemaPath(cxt, errorPaths) ];
                return function(cxt, {params, message}, keyValues) {
                    const {keyword, data, schemaValue, it} = cxt, {opts, propertyName, topSchemaRef, schemaPath} = it;
                    keyValues.push([ E.keyword, keyword ], [ E.params, "function" == typeof params ? params(cxt) : params || codegen_1._`{}` ]), 
                    opts.messages && keyValues.push([ E.message, "function" == typeof message ? message(cxt) : message ]);
                    opts.verbose && keyValues.push([ E.schema, schemaValue ], [ E.parentSchema, codegen_1._`${topSchemaRef}${schemaPath}` ], [ names_1.default.data, data ]);
                    propertyName && keyValues.push([ E.propertyName, propertyName ]);
                }(cxt, error, keyValues), gen.object(...keyValues);
            }(cxt, error, errorPaths);
        }
        function errorInstancePath({errorPath}, {instancePath}) {
            const instPath = instancePath ? codegen_1.str`${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}` : errorPath;
            return [ names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath) ];
        }
        function errorSchemaPath({keyword, it: {errSchemaPath}}, {schemaPath, parentSchema}) {
            let schPath = parentSchema ? errSchemaPath : codegen_1.str`${errSchemaPath}/${keyword}`;
            return schemaPath && (schPath = codegen_1.str`${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`), 
            [ E.schemaPath, schPath ];
        }
    },
    9060: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.resolveSchema = exports.getCompilingSchema = exports.resolveRef = exports.compileSchema = exports.SchemaEnv = void 0;
        const codegen_1 = __webpack_require__(3947), validation_error_1 = __webpack_require__(5174), names_1 = __webpack_require__(3258), resolve_1 = __webpack_require__(4336), util_1 = __webpack_require__(650), validate_1 = __webpack_require__(7316);
        class SchemaEnv {
            constructor(env) {
                var _a;
                let schema;
                this.refs = {}, this.dynamicAnchors = {}, "object" == typeof env.schema && (schema = env.schema), 
                this.schema = env.schema, this.schemaId = env.schemaId, this.root = env.root || this, 
                this.baseId = null !== (_a = env.baseId) && void 0 !== _a ? _a : (0, resolve_1.normalizeId)(null == schema ? void 0 : schema[env.schemaId || "$id"]), 
                this.schemaPath = env.schemaPath, this.localRefs = env.localRefs, this.meta = env.meta, 
                this.$async = null == schema ? void 0 : schema.$async, this.refs = {};
            }
        }
        function compileSchema(sch) {
            const _sch = getCompilingSchema.call(this, sch);
            if (_sch) return _sch;
            const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId), {es5, lines} = this.opts.code, {ownProperties} = this.opts, gen = new codegen_1.CodeGen(this.scope, {
                es5,
                lines,
                ownProperties
            });
            let _ValidationError;
            sch.$async && (_ValidationError = gen.scopeValue("Error", {
                ref: validation_error_1.default,
                code: codegen_1._`require("ajv/dist/runtime/validation_error").default`
            }));
            const validateName = gen.scopeName("validate");
            sch.validateName = validateName;
            const schemaCxt = {
                gen,
                allErrors: this.opts.allErrors,
                data: names_1.default.data,
                parentData: names_1.default.parentData,
                parentDataProperty: names_1.default.parentDataProperty,
                dataNames: [ names_1.default.data ],
                dataPathArr: [ codegen_1.nil ],
                dataLevel: 0,
                dataTypes: [],
                definedProperties: new Set,
                topSchemaRef: gen.scopeValue("schema", !0 === this.opts.code.source ? {
                    ref: sch.schema,
                    code: (0, codegen_1.stringify)(sch.schema)
                } : {
                    ref: sch.schema
                }),
                validateName,
                ValidationError: _ValidationError,
                schema: sch.schema,
                schemaEnv: sch,
                rootId,
                baseId: sch.baseId || rootId,
                schemaPath: codegen_1.nil,
                errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
                errorPath: codegen_1._`""`,
                opts: this.opts,
                self: this
            };
            let sourceCode;
            try {
                this._compilations.add(sch), (0, validate_1.validateFunctionCode)(schemaCxt), gen.optimize(this.opts.code.optimize);
                const validateCode = gen.toString();
                sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`, this.opts.code.process && (sourceCode = this.opts.code.process(sourceCode, sch));
                const validate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode)(this, this.scope.get());
                if (this.scope.value(validateName, {
                    ref: validate
                }), validate.errors = null, validate.schema = sch.schema, validate.schemaEnv = sch, 
                sch.$async && (validate.$async = !0), !0 === this.opts.code.source && (validate.source = {
                    validateName,
                    validateCode,
                    scopeValues: gen._values
                }), this.opts.unevaluated) {
                    const {props, items} = schemaCxt;
                    validate.evaluated = {
                        props: props instanceof codegen_1.Name ? void 0 : props,
                        items: items instanceof codegen_1.Name ? void 0 : items,
                        dynamicProps: props instanceof codegen_1.Name,
                        dynamicItems: items instanceof codegen_1.Name
                    }, validate.source && (validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated));
                }
                return sch.validate = validate, sch;
            } catch (e) {
                throw delete sch.validate, delete sch.validateName, sourceCode && this.logger.error("Error compiling schema, function code:", sourceCode), 
                e;
            } finally {
                this._compilations.delete(sch);
            }
        }
        function inlineOrCompile(sch) {
            return (0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs) ? sch.schema : sch.validate ? sch : compileSchema.call(this, sch);
        }
        function getCompilingSchema(schEnv) {
            for (const sch of this._compilations) if (s2 = schEnv, (s1 = sch).schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId) return sch;
            var s1, s2;
        }
        function resolve(root, ref) {
            let sch;
            for (;"string" == typeof (sch = this.refs[ref]); ) ref = sch;
            return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
        }
        function resolveSchema(root, ref) {
            const p = this.opts.uriResolver.parse(ref), refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
            let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, void 0);
            if (Object.keys(root.schema).length > 0 && refPath === baseId) return getJsonPointer.call(this, p, root);
            const id = (0, resolve_1.normalizeId)(refPath), schOrRef = this.refs[id] || this.schemas[id];
            if ("string" == typeof schOrRef) {
                const sch = resolveSchema.call(this, root, schOrRef);
                if ("object" != typeof (null == sch ? void 0 : sch.schema)) return;
                return getJsonPointer.call(this, p, sch);
            }
            if ("object" == typeof (null == schOrRef ? void 0 : schOrRef.schema)) {
                if (schOrRef.validate || compileSchema.call(this, schOrRef), id === (0, resolve_1.normalizeId)(ref)) {
                    const {schema} = schOrRef, {schemaId} = this.opts, schId = schema[schemaId];
                    return schId && (baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId)), 
                    new SchemaEnv({
                        schema,
                        schemaId,
                        root,
                        baseId
                    });
                }
                return getJsonPointer.call(this, p, schOrRef);
            }
        }
        exports.SchemaEnv = SchemaEnv, exports.compileSchema = compileSchema, exports.resolveRef = function(root, baseId, ref) {
            var _a;
            ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
            const schOrFunc = root.refs[ref];
            if (schOrFunc) return schOrFunc;
            let _sch = resolve.call(this, root, ref);
            if (void 0 === _sch) {
                const schema = null === (_a = root.localRefs) || void 0 === _a ? void 0 : _a[ref], {schemaId} = this.opts;
                schema && (_sch = new SchemaEnv({
                    schema,
                    schemaId,
                    root,
                    baseId
                }));
            }
            return void 0 !== _sch ? root.refs[ref] = inlineOrCompile.call(this, _sch) : void 0;
        }, exports.getCompilingSchema = getCompilingSchema, exports.resolveSchema = resolveSchema;
        const PREVENT_SCOPE_CHANGE = new Set([ "properties", "patternProperties", "enum", "dependencies", "definitions" ]);
        function getJsonPointer(parsedRef, {baseId, schema, root}) {
            var _a;
            if ("/" !== (null === (_a = parsedRef.fragment) || void 0 === _a ? void 0 : _a[0])) return;
            for (const part of parsedRef.fragment.slice(1).split("/")) {
                if ("boolean" == typeof schema) return;
                const partSchema = schema[(0, util_1.unescapeFragment)(part)];
                if (void 0 === partSchema) return;
                const schId = "object" == typeof (schema = partSchema) && schema[this.opts.schemaId];
                !PREVENT_SCOPE_CHANGE.has(part) && schId && (baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId));
            }
            let env;
            if ("boolean" != typeof schema && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
                const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
                env = resolveSchema.call(this, root, $ref);
            }
            const {schemaId} = this.opts;
            return env = env || new SchemaEnv({
                schema,
                schemaId,
                root,
                baseId
            }), env.schema !== env.root.schema ? env : void 0;
        }
    },
    3258: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), names = {
            data: new codegen_1.Name("data"),
            valCxt: new codegen_1.Name("valCxt"),
            instancePath: new codegen_1.Name("instancePath"),
            parentData: new codegen_1.Name("parentData"),
            parentDataProperty: new codegen_1.Name("parentDataProperty"),
            rootData: new codegen_1.Name("rootData"),
            dynamicAnchors: new codegen_1.Name("dynamicAnchors"),
            vErrors: new codegen_1.Name("vErrors"),
            errors: new codegen_1.Name("errors"),
            this: new codegen_1.Name("this"),
            self: new codegen_1.Name("self"),
            scope: new codegen_1.Name("scope"),
            json: new codegen_1.Name("json"),
            jsonPos: new codegen_1.Name("jsonPos"),
            jsonLen: new codegen_1.Name("jsonLen"),
            jsonPart: new codegen_1.Name("jsonPart")
        };
        exports.default = names;
    },
    8237: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const resolve_1 = __webpack_require__(4336);
        class MissingRefError extends Error {
            constructor(resolver, baseId, ref, msg) {
                super(msg || `can't resolve reference ${ref} from id ${baseId}`), this.missingRef = (0, 
                resolve_1.resolveUrl)(resolver, baseId, ref), this.missingSchema = (0, resolve_1.normalizeId)((0, 
                resolve_1.getFullPath)(resolver, this.missingRef));
            }
        }
        exports.default = MissingRefError;
    },
    4336: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getSchemaRefs = exports.resolveUrl = exports.normalizeId = exports._getFullPath = exports.getFullPath = exports.inlineRef = void 0;
        const util_1 = __webpack_require__(650), equal = __webpack_require__(5686), traverse = __webpack_require__(2956), SIMPLE_INLINED = new Set([ "type", "format", "pattern", "maxLength", "minLength", "maxProperties", "minProperties", "maxItems", "minItems", "maximum", "minimum", "uniqueItems", "multipleOf", "required", "enum", "const" ]);
        exports.inlineRef = function(schema, limit = !0) {
            return "boolean" == typeof schema || (!0 === limit ? !hasRef(schema) : !!limit && countKeys(schema) <= limit);
        };
        const REF_KEYWORDS = new Set([ "$ref", "$recursiveRef", "$recursiveAnchor", "$dynamicRef", "$dynamicAnchor" ]);
        function hasRef(schema) {
            for (const key in schema) {
                if (REF_KEYWORDS.has(key)) return !0;
                const sch = schema[key];
                if (Array.isArray(sch) && sch.some(hasRef)) return !0;
                if ("object" == typeof sch && hasRef(sch)) return !0;
            }
            return !1;
        }
        function countKeys(schema) {
            let count = 0;
            for (const key in schema) {
                if ("$ref" === key) return 1 / 0;
                if (count++, !SIMPLE_INLINED.has(key) && ("object" == typeof schema[key] && (0, 
                util_1.eachItem)(schema[key], (sch => count += countKeys(sch))), count === 1 / 0)) return 1 / 0;
            }
            return count;
        }
        function getFullPath(resolver, id = "", normalize) {
            !1 !== normalize && (id = normalizeId(id));
            const p = resolver.parse(id);
            return _getFullPath(resolver, p);
        }
        function _getFullPath(resolver, p) {
            return resolver.serialize(p).split("#")[0] + "#";
        }
        exports.getFullPath = getFullPath, exports._getFullPath = _getFullPath;
        const TRAILING_SLASH_HASH = /#\/?$/;
        function normalizeId(id) {
            return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
        }
        exports.normalizeId = normalizeId, exports.resolveUrl = function(resolver, baseId, id) {
            return id = normalizeId(id), resolver.resolve(baseId, id);
        };
        const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
        exports.getSchemaRefs = function(schema, baseId) {
            if ("boolean" == typeof schema) return {};
            const {schemaId, uriResolver} = this.opts, schId = normalizeId(schema[schemaId] || baseId), baseIds = {
                "": schId
            }, pathPrefix = getFullPath(uriResolver, schId, !1), localRefs = {}, schemaRefs = new Set;
            return traverse(schema, {
                allKeys: !0
            }, ((sch, jsonPtr, _, parentJsonPtr) => {
                if (void 0 === parentJsonPtr) return;
                const fullPath = pathPrefix + jsonPtr;
                let baseId = baseIds[parentJsonPtr];
                function addRef(ref) {
                    const _resolve = this.opts.uriResolver.resolve;
                    if (ref = normalizeId(baseId ? _resolve(baseId, ref) : ref), schemaRefs.has(ref)) throw ambiguos(ref);
                    schemaRefs.add(ref);
                    let schOrRef = this.refs[ref];
                    return "string" == typeof schOrRef && (schOrRef = this.refs[schOrRef]), "object" == typeof schOrRef ? checkAmbiguosRef(sch, schOrRef.schema, ref) : ref !== normalizeId(fullPath) && ("#" === ref[0] ? (checkAmbiguosRef(sch, localRefs[ref], ref), 
                    localRefs[ref] = sch) : this.refs[ref] = fullPath), ref;
                }
                function addAnchor(anchor) {
                    if ("string" == typeof anchor) {
                        if (!ANCHOR.test(anchor)) throw new Error(`invalid anchor "${anchor}"`);
                        addRef.call(this, `#${anchor}`);
                    }
                }
                "string" == typeof sch[schemaId] && (baseId = addRef.call(this, sch[schemaId])), 
                addAnchor.call(this, sch.$anchor), addAnchor.call(this, sch.$dynamicAnchor), baseIds[jsonPtr] = baseId;
            })), localRefs;
            function checkAmbiguosRef(sch1, sch2, ref) {
                if (void 0 !== sch2 && !equal(sch1, sch2)) throw ambiguos(ref);
            }
            function ambiguos(ref) {
                return new Error(`reference "${ref}" resolves to more than one schema`);
            }
        };
    },
    5872: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getRules = exports.isJSONType = void 0;
        const jsonTypes = new Set([ "string", "number", "integer", "boolean", "null", "object", "array" ]);
        exports.isJSONType = function(x) {
            return "string" == typeof x && jsonTypes.has(x);
        }, exports.getRules = function() {
            const groups = {
                number: {
                    type: "number",
                    rules: []
                },
                string: {
                    type: "string",
                    rules: []
                },
                array: {
                    type: "array",
                    rules: []
                },
                object: {
                    type: "object",
                    rules: []
                }
            };
            return {
                types: {
                    ...groups,
                    integer: !0,
                    boolean: !0,
                    null: !0
                },
                rules: [ {
                    rules: []
                }, groups.number, groups.string, groups.array, groups.object ],
                post: {
                    rules: []
                },
                all: {},
                keywords: {}
            };
        };
    },
    650: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.checkStrictMode = exports.getErrorPath = exports.Type = exports.useFunc = exports.setEvaluated = exports.evaluatedPropsToName = exports.mergeEvaluated = exports.eachItem = exports.unescapeJsonPointer = exports.escapeJsonPointer = exports.escapeFragment = exports.unescapeFragment = exports.schemaRefOrVal = exports.schemaHasRulesButRef = exports.schemaHasRules = exports.checkUnknownRules = exports.alwaysValidSchema = exports.toHash = void 0;
        const codegen_1 = __webpack_require__(3947), code_1 = __webpack_require__(2948);
        function checkUnknownRules(it, schema = it.schema) {
            const {opts, self} = it;
            if (!opts.strictSchema) return;
            if ("boolean" == typeof schema) return;
            const rules = self.RULES.keywords;
            for (const key in schema) rules[key] || checkStrictMode(it, `unknown keyword: "${key}"`);
        }
        function schemaHasRules(schema, rules) {
            if ("boolean" == typeof schema) return !schema;
            for (const key in schema) if (rules[key]) return !0;
            return !1;
        }
        function escapeJsonPointer(str) {
            return "number" == typeof str ? `${str}` : str.replace(/~/g, "~0").replace(/\//g, "~1");
        }
        function unescapeJsonPointer(str) {
            return str.replace(/~1/g, "/").replace(/~0/g, "~");
        }
        function makeMergeEvaluated({mergeNames, mergeToName, mergeValues, resultToName}) {
            return (gen, from, to, toName) => {
                const res = void 0 === to ? from : to instanceof codegen_1.Name ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), 
                to) : from instanceof codegen_1.Name ? (mergeToName(gen, to, from), from) : mergeValues(from, to);
                return toName !== codegen_1.Name || res instanceof codegen_1.Name ? res : resultToName(gen, res);
            };
        }
        function evaluatedPropsToName(gen, ps) {
            if (!0 === ps) return gen.var("props", !0);
            const props = gen.var("props", codegen_1._`{}`);
            return void 0 !== ps && setEvaluated(gen, props, ps), props;
        }
        function setEvaluated(gen, props, ps) {
            Object.keys(ps).forEach((p => gen.assign(codegen_1._`${props}${(0, codegen_1.getProperty)(p)}`, !0)));
        }
        exports.toHash = function(arr) {
            const hash = {};
            for (const item of arr) hash[item] = !0;
            return hash;
        }, exports.alwaysValidSchema = function(it, schema) {
            return "boolean" == typeof schema ? schema : 0 === Object.keys(schema).length || (checkUnknownRules(it, schema), 
            !schemaHasRules(schema, it.self.RULES.all));
        }, exports.checkUnknownRules = checkUnknownRules, exports.schemaHasRules = schemaHasRules, 
        exports.schemaHasRulesButRef = function(schema, RULES) {
            if ("boolean" == typeof schema) return !schema;
            for (const key in schema) if ("$ref" !== key && RULES.all[key]) return !0;
            return !1;
        }, exports.schemaRefOrVal = function({topSchemaRef, schemaPath}, schema, keyword, $data) {
            if (!$data) {
                if ("number" == typeof schema || "boolean" == typeof schema) return schema;
                if ("string" == typeof schema) return codegen_1._`${schema}`;
            }
            return codegen_1._`${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
        }, exports.unescapeFragment = function(str) {
            return unescapeJsonPointer(decodeURIComponent(str));
        }, exports.escapeFragment = function(str) {
            return encodeURIComponent(escapeJsonPointer(str));
        }, exports.escapeJsonPointer = escapeJsonPointer, exports.unescapeJsonPointer = unescapeJsonPointer, 
        exports.eachItem = function(xs, f) {
            if (Array.isArray(xs)) for (const x of xs) f(x); else f(xs);
        }, exports.mergeEvaluated = {
            props: makeMergeEvaluated({
                mergeNames: (gen, from, to) => gen.if(codegen_1._`${to} !== true && ${from} !== undefined`, (() => {
                    gen.if(codegen_1._`${from} === true`, (() => gen.assign(to, !0)), (() => gen.assign(to, codegen_1._`${to} || {}`).code(codegen_1._`Object.assign(${to}, ${from})`)));
                })),
                mergeToName: (gen, from, to) => gen.if(codegen_1._`${to} !== true`, (() => {
                    !0 === from ? gen.assign(to, !0) : (gen.assign(to, codegen_1._`${to} || {}`), setEvaluated(gen, to, from));
                })),
                mergeValues: (from, to) => !0 === from || {
                    ...from,
                    ...to
                },
                resultToName: evaluatedPropsToName
            }),
            items: makeMergeEvaluated({
                mergeNames: (gen, from, to) => gen.if(codegen_1._`${to} !== true && ${from} !== undefined`, (() => gen.assign(to, codegen_1._`${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`))),
                mergeToName: (gen, from, to) => gen.if(codegen_1._`${to} !== true`, (() => gen.assign(to, !0 === from || codegen_1._`${to} > ${from} ? ${to} : ${from}`))),
                mergeValues: (from, to) => !0 === from || Math.max(from, to),
                resultToName: (gen, items) => gen.var("items", items)
            })
        }, exports.evaluatedPropsToName = evaluatedPropsToName, exports.setEvaluated = setEvaluated;
        const snippets = {};
        var Type;
        function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
            if (mode) {
                if (msg = `strict mode: ${msg}`, !0 === mode) throw new Error(msg);
                it.self.logger.warn(msg);
            }
        }
        exports.useFunc = function(gen, f) {
            return gen.scopeValue("func", {
                ref: f,
                code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code))
            });
        }, function(Type) {
            Type[Type.Num = 0] = "Num", Type[Type.Str = 1] = "Str";
        }(Type = exports.Type || (exports.Type = {})), exports.getErrorPath = function(dataProp, dataPropType, jsPropertySyntax) {
            if (dataProp instanceof codegen_1.Name) {
                const isNumber = dataPropType === Type.Num;
                return jsPropertySyntax ? isNumber ? codegen_1._`"[" + ${dataProp} + "]"` : codegen_1._`"['" + ${dataProp} + "']"` : isNumber ? codegen_1._`"/" + ${dataProp}` : codegen_1._`"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`;
            }
            return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
        }, exports.checkStrictMode = checkStrictMode;
    },
    8573: (__unused_webpack_module, exports) => {
        "use strict";
        function shouldUseGroup(schema, group) {
            return group.rules.some((rule => shouldUseRule(schema, rule)));
        }
        function shouldUseRule(schema, rule) {
            var _a;
            return void 0 !== schema[rule.keyword] || (null === (_a = rule.definition.implements) || void 0 === _a ? void 0 : _a.some((kwd => void 0 !== schema[kwd])));
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.shouldUseRule = exports.shouldUseGroup = exports.schemaHasRulesForType = void 0, 
        exports.schemaHasRulesForType = function({schema, self}, type) {
            const group = self.RULES.types[type];
            return group && !0 !== group && shouldUseGroup(schema, group);
        }, exports.shouldUseGroup = shouldUseGroup, exports.shouldUseRule = shouldUseRule;
    },
    4700: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.boolOrEmptySchema = exports.topBoolOrEmptySchema = void 0;
        const errors_1 = __webpack_require__(2919), codegen_1 = __webpack_require__(3947), names_1 = __webpack_require__(3258), boolError = {
            message: "boolean schema is false"
        };
        function falseSchemaError(it, overrideAllErrors) {
            const {gen, data} = it, cxt = {
                gen,
                keyword: "false schema",
                data,
                schema: !1,
                schemaCode: !1,
                schemaValue: !1,
                params: {},
                it
            };
            (0, errors_1.reportError)(cxt, boolError, void 0, overrideAllErrors);
        }
        exports.topBoolOrEmptySchema = function(it) {
            const {gen, schema, validateName} = it;
            !1 === schema ? falseSchemaError(it, !1) : "object" == typeof schema && !0 === schema.$async ? gen.return(names_1.default.data) : (gen.assign(codegen_1._`${validateName}.errors`, null), 
            gen.return(!0));
        }, exports.boolOrEmptySchema = function(it, valid) {
            const {gen, schema} = it;
            !1 === schema ? (gen.var(valid, !1), falseSchemaError(it)) : gen.var(valid, !0);
        };
    },
    152: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.reportTypeError = exports.checkDataTypes = exports.checkDataType = exports.coerceAndCheckDataType = exports.getJSONTypes = exports.getSchemaTypes = exports.DataType = void 0;
        const rules_1 = __webpack_require__(5872), applicability_1 = __webpack_require__(8573), errors_1 = __webpack_require__(2919), codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650);
        var DataType;
        function getJSONTypes(ts) {
            const types = Array.isArray(ts) ? ts : ts ? [ ts ] : [];
            if (types.every(rules_1.isJSONType)) return types;
            throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
        }
        !function(DataType) {
            DataType[DataType.Correct = 0] = "Correct", DataType[DataType.Wrong = 1] = "Wrong";
        }(DataType = exports.DataType || (exports.DataType = {})), exports.getSchemaTypes = function(schema) {
            const types = getJSONTypes(schema.type);
            if (types.includes("null")) {
                if (!1 === schema.nullable) throw new Error("type: null contradicts nullable: false");
            } else {
                if (!types.length && void 0 !== schema.nullable) throw new Error('"nullable" cannot be used without "type"');
                !0 === schema.nullable && types.push("null");
            }
            return types;
        }, exports.getJSONTypes = getJSONTypes, exports.coerceAndCheckDataType = function(it, types) {
            const {gen, data, opts} = it, coerceTo = function(types, coerceTypes) {
                return coerceTypes ? types.filter((t => COERCIBLE.has(t) || "array" === coerceTypes && "array" === t)) : [];
            }(types, opts.coerceTypes), checkTypes = types.length > 0 && !(0 === coerceTo.length && 1 === types.length && (0, 
            applicability_1.schemaHasRulesForType)(it, types[0]));
            if (checkTypes) {
                const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
                gen.if(wrongType, (() => {
                    coerceTo.length ? function(it, types, coerceTo) {
                        const {gen, data, opts} = it, dataType = gen.let("dataType", codegen_1._`typeof ${data}`), coerced = gen.let("coerced", codegen_1._`undefined`);
                        "array" === opts.coerceTypes && gen.if(codegen_1._`${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, (() => gen.assign(data, codegen_1._`${data}[0]`).assign(dataType, codegen_1._`typeof ${data}`).if(checkDataTypes(types, data, opts.strictNumbers), (() => gen.assign(coerced, data)))));
                        gen.if(codegen_1._`${coerced} !== undefined`);
                        for (const t of coerceTo) (COERCIBLE.has(t) || "array" === t && "array" === opts.coerceTypes) && coerceSpecificType(t);
                        function coerceSpecificType(t) {
                            switch (t) {
                              case "string":
                                return void gen.elseIf(codegen_1._`${dataType} == "number" || ${dataType} == "boolean"`).assign(coerced, codegen_1._`"" + ${data}`).elseIf(codegen_1._`${data} === null`).assign(coerced, codegen_1._`""`);

                              case "number":
                                return void gen.elseIf(codegen_1._`${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`).assign(coerced, codegen_1._`+${data}`);

                              case "integer":
                                return void gen.elseIf(codegen_1._`${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`).assign(coerced, codegen_1._`+${data}`);

                              case "boolean":
                                return void gen.elseIf(codegen_1._`${data} === "false" || ${data} === 0 || ${data} === null`).assign(coerced, !1).elseIf(codegen_1._`${data} === "true" || ${data} === 1`).assign(coerced, !0);

                              case "null":
                                return gen.elseIf(codegen_1._`${data} === "" || ${data} === 0 || ${data} === false`), 
                                void gen.assign(coerced, null);

                              case "array":
                                gen.elseIf(codegen_1._`${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`).assign(coerced, codegen_1._`[${data}]`);
                            }
                        }
                        gen.else(), reportTypeError(it), gen.endIf(), gen.if(codegen_1._`${coerced} !== undefined`, (() => {
                            gen.assign(data, coerced), function({gen, parentData, parentDataProperty}, expr) {
                                gen.if(codegen_1._`${parentData} !== undefined`, (() => gen.assign(codegen_1._`${parentData}[${parentDataProperty}]`, expr)));
                            }(it, coerced);
                        }));
                    }(it, types, coerceTo) : reportTypeError(it);
                }));
            }
            return checkTypes;
        };
        const COERCIBLE = new Set([ "string", "number", "integer", "boolean", "null" ]);
        function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
            const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
            let cond;
            switch (dataType) {
              case "null":
                return codegen_1._`${data} ${EQ} null`;

              case "array":
                cond = codegen_1._`Array.isArray(${data})`;
                break;

              case "object":
                cond = codegen_1._`${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
                break;

              case "integer":
                cond = numCond(codegen_1._`!(${data} % 1) && !isNaN(${data})`);
                break;

              case "number":
                cond = numCond();
                break;

              default:
                return codegen_1._`typeof ${data} ${EQ} ${dataType}`;
            }
            return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
            function numCond(_cond = codegen_1.nil) {
                return (0, codegen_1.and)(codegen_1._`typeof ${data} == "number"`, _cond, strictNums ? codegen_1._`isFinite(${data})` : codegen_1.nil);
            }
        }
        function checkDataTypes(dataTypes, data, strictNums, correct) {
            if (1 === dataTypes.length) return checkDataType(dataTypes[0], data, strictNums, correct);
            let cond;
            const types = (0, util_1.toHash)(dataTypes);
            if (types.array && types.object) {
                const notObj = codegen_1._`typeof ${data} != "object"`;
                cond = types.null ? notObj : codegen_1._`!${data} || ${notObj}`, delete types.null, 
                delete types.array, delete types.object;
            } else cond = codegen_1.nil;
            types.number && delete types.integer;
            for (const t in types) cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
            return cond;
        }
        exports.checkDataType = checkDataType, exports.checkDataTypes = checkDataTypes;
        const typeError = {
            message: ({schema}) => `must be ${schema}`,
            params: ({schema, schemaValue}) => "string" == typeof schema ? codegen_1._`{type: ${schema}}` : codegen_1._`{type: ${schemaValue}}`
        };
        function reportTypeError(it) {
            const cxt = function(it) {
                const {gen, data, schema} = it, schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
                return {
                    gen,
                    keyword: "type",
                    data,
                    schema: schema.type,
                    schemaCode,
                    schemaValue: schemaCode,
                    parentSchema: schema,
                    params: {},
                    it
                };
            }(it);
            (0, errors_1.reportError)(cxt, typeError);
        }
        exports.reportTypeError = reportTypeError;
    },
    8607: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.assignDefaults = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650);
        function assignDefault(it, prop, defaultValue) {
            const {gen, compositeRule, data, opts} = it;
            if (void 0 === defaultValue) return;
            const childData = codegen_1._`${data}${(0, codegen_1.getProperty)(prop)}`;
            if (compositeRule) return void (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
            let condition = codegen_1._`${childData} === undefined`;
            "empty" === opts.useDefaults && (condition = codegen_1._`${condition} || ${childData} === null || ${childData} === ""`), 
            gen.if(condition, codegen_1._`${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
        }
        exports.assignDefaults = function(it, ty) {
            const {properties, items} = it.schema;
            if ("object" === ty && properties) for (const key in properties) assignDefault(it, key, properties[key].default); else "array" === ty && Array.isArray(items) && items.forEach(((sch, i) => assignDefault(it, i, sch.default)));
        };
    },
    7316: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.getData = exports.KeywordCxt = exports.validateFunctionCode = void 0;
        const boolSchema_1 = __webpack_require__(4700), dataType_1 = __webpack_require__(152), applicability_1 = __webpack_require__(8573), dataType_2 = __webpack_require__(152), defaults_1 = __webpack_require__(8607), keyword_1 = __webpack_require__(1396), subschema_1 = __webpack_require__(7998), codegen_1 = __webpack_require__(3947), names_1 = __webpack_require__(3258), resolve_1 = __webpack_require__(4336), util_1 = __webpack_require__(650), errors_1 = __webpack_require__(2919);
        function validateFunction({gen, validateName, schema, schemaEnv, opts}, body) {
            opts.code.es5 ? gen.func(validateName, codegen_1._`${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, (() => {
                gen.code(codegen_1._`"use strict"; ${funcSourceUrl(schema, opts)}`), function(gen, opts) {
                    gen.if(names_1.default.valCxt, (() => {
                        gen.var(names_1.default.instancePath, codegen_1._`${names_1.default.valCxt}.${names_1.default.instancePath}`), 
                        gen.var(names_1.default.parentData, codegen_1._`${names_1.default.valCxt}.${names_1.default.parentData}`), 
                        gen.var(names_1.default.parentDataProperty, codegen_1._`${names_1.default.valCxt}.${names_1.default.parentDataProperty}`), 
                        gen.var(names_1.default.rootData, codegen_1._`${names_1.default.valCxt}.${names_1.default.rootData}`), 
                        opts.dynamicRef && gen.var(names_1.default.dynamicAnchors, codegen_1._`${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
                    }), (() => {
                        gen.var(names_1.default.instancePath, codegen_1._`""`), gen.var(names_1.default.parentData, codegen_1._`undefined`), 
                        gen.var(names_1.default.parentDataProperty, codegen_1._`undefined`), gen.var(names_1.default.rootData, names_1.default.data), 
                        opts.dynamicRef && gen.var(names_1.default.dynamicAnchors, codegen_1._`{}`);
                    }));
                }(gen, opts), gen.code(body);
            })) : gen.func(validateName, codegen_1._`${names_1.default.data}, ${function(opts) {
                return codegen_1._`{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? codegen_1._`, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
            }(opts)}`, schemaEnv.$async, (() => gen.code(funcSourceUrl(schema, opts)).code(body)));
        }
        function funcSourceUrl(schema, opts) {
            const schId = "object" == typeof schema && schema[opts.schemaId];
            return schId && (opts.code.source || opts.code.process) ? codegen_1._`/*# sourceURL=${schId} */` : codegen_1.nil;
        }
        function subschemaCode(it, valid) {
            isSchemaObj(it) && (checkKeywords(it), schemaCxtHasRules(it)) ? function(it, valid) {
                const {schema, gen, opts} = it;
                opts.$comment && schema.$comment && commentKeyword(it);
                (function(it) {
                    const schId = it.schema[it.opts.schemaId];
                    schId && (it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId));
                })(it), function(it) {
                    if (it.schema.$async && !it.schemaEnv.$async) throw new Error("async schema in sync schema");
                }(it);
                const errsCount = gen.const("_errs", names_1.default.errors);
                typeAndKeywords(it, errsCount), gen.var(valid, codegen_1._`${errsCount} === ${names_1.default.errors}`);
            }(it, valid) : (0, boolSchema_1.boolOrEmptySchema)(it, valid);
        }
        function schemaCxtHasRules({schema, self}) {
            if ("boolean" == typeof schema) return !schema;
            for (const key in schema) if (self.RULES.all[key]) return !0;
            return !1;
        }
        function isSchemaObj(it) {
            return "boolean" != typeof it.schema;
        }
        function checkKeywords(it) {
            (0, util_1.checkUnknownRules)(it), function(it) {
                const {schema, errSchemaPath, opts, self} = it;
                schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES) && self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
            }(it);
        }
        function typeAndKeywords(it, errsCount) {
            if (it.opts.jtd) return schemaKeywords(it, [], !1, errsCount);
            const types = (0, dataType_1.getSchemaTypes)(it.schema);
            schemaKeywords(it, types, !(0, dataType_1.coerceAndCheckDataType)(it, types), errsCount);
        }
        function commentKeyword({gen, schemaEnv, schema, errSchemaPath, opts}) {
            const msg = schema.$comment;
            if (!0 === opts.$comment) gen.code(codegen_1._`${names_1.default.self}.logger.log(${msg})`); else if ("function" == typeof opts.$comment) {
                const schemaPath = codegen_1.str`${errSchemaPath}/$comment`, rootName = gen.scopeValue("root", {
                    ref: schemaEnv.root
                });
                gen.code(codegen_1._`${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
            }
        }
        function schemaKeywords(it, types, typeErrors, errsCount) {
            const {gen, schema, data, allErrors, opts, self} = it, {RULES} = self;
            function groupKeywords(group) {
                (0, applicability_1.shouldUseGroup)(schema, group) && (group.type ? (gen.if((0, 
                dataType_2.checkDataType)(group.type, data, opts.strictNumbers)), iterateKeywords(it, group), 
                1 === types.length && types[0] === group.type && typeErrors && (gen.else(), (0, 
                dataType_2.reportTypeError)(it)), gen.endIf()) : iterateKeywords(it, group), allErrors || gen.if(codegen_1._`${names_1.default.errors} === ${errsCount || 0}`));
            }
            !schema.$ref || !opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, RULES) ? (opts.jtd || function(it, types) {
                if (it.schemaEnv.meta || !it.opts.strictTypes) return;
                (function(it, types) {
                    if (!types.length) return;
                    if (!it.dataTypes.length) return void (it.dataTypes = types);
                    types.forEach((t => {
                        includesType(it.dataTypes, t) || strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
                    })), it.dataTypes = it.dataTypes.filter((t => includesType(types, t)));
                })(it, types), it.opts.allowUnionTypes || function(it, ts) {
                    ts.length > 1 && (2 !== ts.length || !ts.includes("null")) && strictTypesError(it, "use allowUnionTypes to allow union type keyword");
                }(it, types);
                !function(it, ts) {
                    const rules = it.self.RULES.all;
                    for (const keyword in rules) {
                        const rule = rules[keyword];
                        if ("object" == typeof rule && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
                            const {type} = rule.definition;
                            type.length && !type.some((t => hasApplicableType(ts, t))) && strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
                        }
                    }
                }(it, it.dataTypes);
            }(it, types), gen.block((() => {
                for (const group of RULES.rules) groupKeywords(group);
                groupKeywords(RULES.post);
            }))) : gen.block((() => keywordCode(it, "$ref", RULES.all.$ref.definition)));
        }
        function iterateKeywords(it, group) {
            const {gen, schema, opts: {useDefaults}} = it;
            useDefaults && (0, defaults_1.assignDefaults)(it, group.type), gen.block((() => {
                for (const rule of group.rules) (0, applicability_1.shouldUseRule)(schema, rule) && keywordCode(it, rule.keyword, rule.definition, group.type);
            }));
        }
        function hasApplicableType(schTs, kwdT) {
            return schTs.includes(kwdT) || "number" === kwdT && schTs.includes("integer");
        }
        function includesType(ts, t) {
            return ts.includes(t) || "integer" === t && ts.includes("number");
        }
        function strictTypesError(it, msg) {
            msg += ` at "${it.schemaEnv.baseId + it.errSchemaPath}" (strictTypes)`, (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
        }
        exports.validateFunctionCode = function(it) {
            isSchemaObj(it) && (checkKeywords(it), schemaCxtHasRules(it)) ? function(it) {
                const {schema, opts, gen} = it;
                validateFunction(it, (() => {
                    opts.$comment && schema.$comment && commentKeyword(it), function(it) {
                        const {schema, opts} = it;
                        void 0 !== schema.default && opts.useDefaults && opts.strictSchema && (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
                    }(it), gen.let(names_1.default.vErrors, null), gen.let(names_1.default.errors, 0), 
                    opts.unevaluated && function(it) {
                        const {gen, validateName} = it;
                        it.evaluated = gen.const("evaluated", codegen_1._`${validateName}.evaluated`), gen.if(codegen_1._`${it.evaluated}.dynamicProps`, (() => gen.assign(codegen_1._`${it.evaluated}.props`, codegen_1._`undefined`))), 
                        gen.if(codegen_1._`${it.evaluated}.dynamicItems`, (() => gen.assign(codegen_1._`${it.evaluated}.items`, codegen_1._`undefined`)));
                    }(it), typeAndKeywords(it), function(it) {
                        const {gen, schemaEnv, validateName, ValidationError, opts} = it;
                        schemaEnv.$async ? gen.if(codegen_1._`${names_1.default.errors} === 0`, (() => gen.return(names_1.default.data)), (() => gen.throw(codegen_1._`new ${ValidationError}(${names_1.default.vErrors})`))) : (gen.assign(codegen_1._`${validateName}.errors`, names_1.default.vErrors), 
                        opts.unevaluated && function({gen, evaluated, props, items}) {
                            props instanceof codegen_1.Name && gen.assign(codegen_1._`${evaluated}.props`, props);
                            items instanceof codegen_1.Name && gen.assign(codegen_1._`${evaluated}.items`, items);
                        }(it), gen.return(codegen_1._`${names_1.default.errors} === 0`));
                    }(it);
                }));
            }(it) : validateFunction(it, (() => (0, boolSchema_1.topBoolOrEmptySchema)(it)));
        };
        class KeywordCxt {
            constructor(it, def, keyword) {
                if ((0, keyword_1.validateKeywordUsage)(it, def, keyword), this.gen = it.gen, this.allErrors = it.allErrors, 
                this.keyword = keyword, this.data = it.data, this.schema = it.schema[keyword], this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data, 
                this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data), 
                this.schemaType = def.schemaType, this.parentSchema = it.schema, this.params = {}, 
                this.it = it, this.def = def, this.$data) this.schemaCode = it.gen.const("vSchema", getData(this.$data, it)); else if (this.schemaCode = this.schemaValue, 
                !(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
                ("code" in def ? def.trackErrors : !1 !== def.errors) && (this.errsCount = it.gen.const("_errs", names_1.default.errors));
            }
            result(condition, successAction, failAction) {
                this.failResult((0, codegen_1.not)(condition), successAction, failAction);
            }
            failResult(condition, successAction, failAction) {
                this.gen.if(condition), failAction ? failAction() : this.error(), successAction ? (this.gen.else(), 
                successAction(), this.allErrors && this.gen.endIf()) : this.allErrors ? this.gen.endIf() : this.gen.else();
            }
            pass(condition, failAction) {
                this.failResult((0, codegen_1.not)(condition), void 0, failAction);
            }
            fail(condition) {
                if (void 0 === condition) return this.error(), void (this.allErrors || this.gen.if(!1));
                this.gen.if(condition), this.error(), this.allErrors ? this.gen.endIf() : this.gen.else();
            }
            fail$data(condition) {
                if (!this.$data) return this.fail(condition);
                const {schemaCode} = this;
                this.fail(codegen_1._`${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
            }
            error(append, errorParams, errorPaths) {
                if (errorParams) return this.setParams(errorParams), this._error(append, errorPaths), 
                void this.setParams({});
                this._error(append, errorPaths);
            }
            _error(append, errorPaths) {
                (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
            }
            $dataError() {
                (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
            }
            reset() {
                if (void 0 === this.errsCount) throw new Error('add "trackErrors" to keyword definition');
                (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
            }
            ok(cond) {
                this.allErrors || this.gen.if(cond);
            }
            setParams(obj, assign) {
                assign ? Object.assign(this.params, obj) : this.params = obj;
            }
            block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
                this.gen.block((() => {
                    this.check$data(valid, $dataValid), codeBlock();
                }));
            }
            check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
                if (!this.$data) return;
                const {gen, schemaCode, schemaType, def} = this;
                gen.if((0, codegen_1.or)(codegen_1._`${schemaCode} === undefined`, $dataValid)), 
                valid !== codegen_1.nil && gen.assign(valid, !0), (schemaType.length || def.validateSchema) && (gen.elseIf(this.invalid$data()), 
                this.$dataError(), valid !== codegen_1.nil && gen.assign(valid, !1)), gen.else();
            }
            invalid$data() {
                const {gen, schemaCode, schemaType, def, it} = this;
                return (0, codegen_1.or)(function() {
                    if (schemaType.length) {
                        if (!(schemaCode instanceof codegen_1.Name)) throw new Error("ajv implementation error");
                        const st = Array.isArray(schemaType) ? schemaType : [ schemaType ];
                        return codegen_1._`${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
                    }
                    return codegen_1.nil;
                }(), function() {
                    if (def.validateSchema) {
                        const validateSchemaRef = gen.scopeValue("validate$data", {
                            ref: def.validateSchema
                        });
                        return codegen_1._`!${validateSchemaRef}(${schemaCode})`;
                    }
                    return codegen_1.nil;
                }());
            }
            subschema(appl, valid) {
                const subschema = (0, subschema_1.getSubschema)(this.it, appl);
                (0, subschema_1.extendSubschemaData)(subschema, this.it, appl), (0, subschema_1.extendSubschemaMode)(subschema, appl);
                const nextContext = {
                    ...this.it,
                    ...subschema,
                    items: void 0,
                    props: void 0
                };
                return subschemaCode(nextContext, valid), nextContext;
            }
            mergeEvaluated(schemaCxt, toName) {
                const {it, gen} = this;
                it.opts.unevaluated && (!0 !== it.props && void 0 !== schemaCxt.props && (it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName)), 
                !0 !== it.items && void 0 !== schemaCxt.items && (it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName)));
            }
            mergeValidEvaluated(schemaCxt, valid) {
                const {it, gen} = this;
                if (it.opts.unevaluated && (!0 !== it.props || !0 !== it.items)) return gen.if(valid, (() => this.mergeEvaluated(schemaCxt, codegen_1.Name))), 
                !0;
            }
        }
        function keywordCode(it, keyword, def, ruleType) {
            const cxt = new KeywordCxt(it, def, keyword);
            "code" in def ? def.code(cxt, ruleType) : cxt.$data && def.validate ? (0, keyword_1.funcKeywordCode)(cxt, def) : "macro" in def ? (0, 
            keyword_1.macroKeywordCode)(cxt, def) : (def.compile || def.validate) && (0, keyword_1.funcKeywordCode)(cxt, def);
        }
        exports.KeywordCxt = KeywordCxt;
        const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/, RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
        function getData($data, {dataLevel, dataNames, dataPathArr}) {
            let jsonPointer, data;
            if ("" === $data) return names_1.default.rootData;
            if ("/" === $data[0]) {
                if (!JSON_POINTER.test($data)) throw new Error(`Invalid JSON-pointer: ${$data}`);
                jsonPointer = $data, data = names_1.default.rootData;
            } else {
                const matches = RELATIVE_JSON_POINTER.exec($data);
                if (!matches) throw new Error(`Invalid JSON-pointer: ${$data}`);
                const up = +matches[1];
                if (jsonPointer = matches[2], "#" === jsonPointer) {
                    if (up >= dataLevel) throw new Error(errorMsg("property/index", up));
                    return dataPathArr[dataLevel - up];
                }
                if (up > dataLevel) throw new Error(errorMsg("data", up));
                if (data = dataNames[dataLevel - up], !jsonPointer) return data;
            }
            let expr = data;
            const segments = jsonPointer.split("/");
            for (const segment of segments) segment && (data = codegen_1._`${data}${(0, codegen_1.getProperty)((0, 
            util_1.unescapeJsonPointer)(segment))}`, expr = codegen_1._`${expr} && ${data}`);
            return expr;
            function errorMsg(pointerType, up) {
                return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
            }
        }
        exports.getData = getData;
    },
    1396: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateKeywordUsage = exports.validSchemaType = exports.funcKeywordCode = exports.macroKeywordCode = void 0;
        const codegen_1 = __webpack_require__(3947), names_1 = __webpack_require__(3258), code_1 = __webpack_require__(1303), errors_1 = __webpack_require__(2919);
        function modifyData(cxt) {
            const {gen, data, it} = cxt;
            gen.if(it.parentData, (() => gen.assign(data, codegen_1._`${it.parentData}[${it.parentDataProperty}]`)));
        }
        function useKeyword(gen, keyword, result) {
            if (void 0 === result) throw new Error(`keyword "${keyword}" failed to compile`);
            return gen.scopeValue("keyword", "function" == typeof result ? {
                ref: result
            } : {
                ref: result,
                code: (0, codegen_1.stringify)(result)
            });
        }
        exports.macroKeywordCode = function(cxt, def) {
            const {gen, keyword, schema, parentSchema, it} = cxt, macroSchema = def.macro.call(it.self, schema, parentSchema, it), schemaRef = useKeyword(gen, keyword, macroSchema);
            !1 !== it.opts.validateSchema && it.self.validateSchema(macroSchema, !0);
            const valid = gen.name("valid");
            cxt.subschema({
                schema: macroSchema,
                schemaPath: codegen_1.nil,
                errSchemaPath: `${it.errSchemaPath}/${keyword}`,
                topSchemaRef: schemaRef,
                compositeRule: !0
            }, valid), cxt.pass(valid, (() => cxt.error(!0)));
        }, exports.funcKeywordCode = function(cxt, def) {
            var _a;
            const {gen, keyword, schema, parentSchema, $data, it} = cxt;
            !function({schemaEnv}, def) {
                if (def.async && !schemaEnv.$async) throw new Error("async keyword in sync schema");
            }(it, def);
            const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate, validateRef = useKeyword(gen, keyword, validate), valid = gen.let("valid");
            function assignValid(_await = (def.async ? codegen_1._`await ` : codegen_1.nil)) {
                const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self, passSchema = !("compile" in def && !$data || !1 === def.schema);
                gen.assign(valid, codegen_1._`${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
            }
            function reportErrs(errors) {
                var _a;
                gen.if((0, codegen_1.not)(null !== (_a = def.valid) && void 0 !== _a ? _a : valid), errors);
            }
            cxt.block$data(valid, (function() {
                if (!1 === def.errors) assignValid(), def.modifying && modifyData(cxt), reportErrs((() => cxt.error())); else {
                    const ruleErrs = def.async ? function() {
                        const ruleErrs = gen.let("ruleErrs", null);
                        return gen.try((() => assignValid(codegen_1._`await `)), (e => gen.assign(valid, !1).if(codegen_1._`${e} instanceof ${it.ValidationError}`, (() => gen.assign(ruleErrs, codegen_1._`${e}.errors`)), (() => gen.throw(e))))), 
                        ruleErrs;
                    }() : function() {
                        const validateErrs = codegen_1._`${validateRef}.errors`;
                        return gen.assign(validateErrs, null), assignValid(codegen_1.nil), validateErrs;
                    }();
                    def.modifying && modifyData(cxt), reportErrs((() => function(cxt, errs) {
                        const {gen} = cxt;
                        gen.if(codegen_1._`Array.isArray(${errs})`, (() => {
                            gen.assign(names_1.default.vErrors, codegen_1._`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`).assign(names_1.default.errors, codegen_1._`${names_1.default.vErrors}.length`), 
                            (0, errors_1.extendErrors)(cxt);
                        }), (() => cxt.error()));
                    }(cxt, ruleErrs)));
                }
            })), cxt.ok(null !== (_a = def.valid) && void 0 !== _a ? _a : valid);
        }, exports.validSchemaType = function(schema, schemaType, allowUndefined = !1) {
            return !schemaType.length || schemaType.some((st => "array" === st ? Array.isArray(schema) : "object" === st ? schema && "object" == typeof schema && !Array.isArray(schema) : typeof schema == st || allowUndefined && void 0 === schema));
        }, exports.validateKeywordUsage = function({schema, opts, self, errSchemaPath}, def, keyword) {
            if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) throw new Error("ajv implementation error");
            const deps = def.dependencies;
            if (null == deps ? void 0 : deps.some((kwd => !Object.prototype.hasOwnProperty.call(schema, kwd)))) throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
            if (def.validateSchema) {
                if (!def.validateSchema(schema[keyword])) {
                    const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` + self.errorsText(def.validateSchema.errors);
                    if ("log" !== opts.validateSchema) throw new Error(msg);
                    self.logger.error(msg);
                }
            }
        };
    },
    7998: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.extendSubschemaMode = exports.extendSubschemaData = exports.getSubschema = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650);
        exports.getSubschema = function(it, {keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef}) {
            if (void 0 !== keyword && void 0 !== schema) throw new Error('both "keyword" and "schema" passed, only one allowed');
            if (void 0 !== keyword) {
                const sch = it.schema[keyword];
                return void 0 === schemaProp ? {
                    schema: sch,
                    schemaPath: codegen_1._`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
                    errSchemaPath: `${it.errSchemaPath}/${keyword}`
                } : {
                    schema: sch[schemaProp],
                    schemaPath: codegen_1._`${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, 
                    codegen_1.getProperty)(schemaProp)}`,
                    errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`
                };
            }
            if (void 0 !== schema) {
                if (void 0 === schemaPath || void 0 === errSchemaPath || void 0 === topSchemaRef) throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
                return {
                    schema,
                    schemaPath,
                    topSchemaRef,
                    errSchemaPath
                };
            }
            throw new Error('either "keyword" or "schema" must be passed');
        }, exports.extendSubschemaData = function(subschema, it, {dataProp, dataPropType: dpType, data, dataTypes, propertyName}) {
            if (void 0 !== data && void 0 !== dataProp) throw new Error('both "data" and "dataProp" passed, only one allowed');
            const {gen} = it;
            if (void 0 !== dataProp) {
                const {errorPath, dataPathArr, opts} = it;
                dataContextProps(gen.let("data", codegen_1._`${it.data}${(0, codegen_1.getProperty)(dataProp)}`, !0)), 
                subschema.errorPath = codegen_1.str`${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`, 
                subschema.parentDataProperty = codegen_1._`${dataProp}`, subschema.dataPathArr = [ ...dataPathArr, subschema.parentDataProperty ];
            }
            if (void 0 !== data) {
                dataContextProps(data instanceof codegen_1.Name ? data : gen.let("data", data, !0)), 
                void 0 !== propertyName && (subschema.propertyName = propertyName);
            }
            function dataContextProps(_nextData) {
                subschema.data = _nextData, subschema.dataLevel = it.dataLevel + 1, subschema.dataTypes = [], 
                it.definedProperties = new Set, subschema.parentData = it.data, subschema.dataNames = [ ...it.dataNames, _nextData ];
            }
            dataTypes && (subschema.dataTypes = dataTypes);
        }, exports.extendSubschemaMode = function(subschema, {jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors}) {
            void 0 !== compositeRule && (subschema.compositeRule = compositeRule), void 0 !== createErrors && (subschema.createErrors = createErrors), 
            void 0 !== allErrors && (subschema.allErrors = allErrors), subschema.jtdDiscriminator = jtdDiscriminator, 
            subschema.jtdMetadata = jtdMetadata;
        };
    },
    8858: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.CodeGen = exports.Name = exports.nil = exports.stringify = exports.str = exports._ = exports.KeywordCxt = void 0;
        var validate_1 = __webpack_require__(7316);
        Object.defineProperty(exports, "KeywordCxt", {
            enumerable: !0,
            get: function() {
                return validate_1.KeywordCxt;
            }
        });
        var codegen_1 = __webpack_require__(3947);
        Object.defineProperty(exports, "_", {
            enumerable: !0,
            get: function() {
                return codegen_1._;
            }
        }), Object.defineProperty(exports, "str", {
            enumerable: !0,
            get: function() {
                return codegen_1.str;
            }
        }), Object.defineProperty(exports, "stringify", {
            enumerable: !0,
            get: function() {
                return codegen_1.stringify;
            }
        }), Object.defineProperty(exports, "nil", {
            enumerable: !0,
            get: function() {
                return codegen_1.nil;
            }
        }), Object.defineProperty(exports, "Name", {
            enumerable: !0,
            get: function() {
                return codegen_1.Name;
            }
        }), Object.defineProperty(exports, "CodeGen", {
            enumerable: !0,
            get: function() {
                return codegen_1.CodeGen;
            }
        });
        const validation_error_1 = __webpack_require__(5174), ref_error_1 = __webpack_require__(8237), rules_1 = __webpack_require__(5872), compile_1 = __webpack_require__(9060), codegen_2 = __webpack_require__(3947), resolve_1 = __webpack_require__(4336), dataType_1 = __webpack_require__(152), util_1 = __webpack_require__(650), $dataRefSchema = __webpack_require__(5277), uri_1 = __webpack_require__(221), defaultRegExp = (str, flags) => new RegExp(str, flags);
        defaultRegExp.code = "new RegExp";
        const META_IGNORE_OPTIONS = [ "removeAdditional", "useDefaults", "coerceTypes" ], EXT_SCOPE_NAMES = new Set([ "validate", "serialize", "parse", "wrapper", "root", "schema", "keyword", "pattern", "formats", "validate$data", "func", "obj", "Error" ]), removedOptions = {
            errorDataPath: "",
            format: "`validateFormats: false` can be used instead.",
            nullable: '"nullable" keyword is supported by default.',
            jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
            extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
            missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
            processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
            sourceCode: "Use option `code: {source: true}`",
            strictDefaults: "It is default now, see option `strict`.",
            strictKeywords: "It is default now, see option `strict`.",
            uniqueItems: '"uniqueItems" keyword is always validated.',
            unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
            cache: "Map is used as cache, schema object as key.",
            serialize: "Map is used as cache, schema object as key.",
            ajvErrors: "It is default now."
        }, deprecatedOptions = {
            ignoreKeywordsWithRef: "",
            jsPropertySyntax: "",
            unicode: '"minLength"/"maxLength" account for unicode characters by default.'
        };
        function requiredOptions(o) {
            var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
            const s = o.strict, _optz = null === (_a = o.code) || void 0 === _a ? void 0 : _a.optimize, optimize = !0 === _optz || void 0 === _optz ? 1 : _optz || 0, regExp = null !== (_c = null === (_b = o.code) || void 0 === _b ? void 0 : _b.regExp) && void 0 !== _c ? _c : defaultRegExp, uriResolver = null !== (_d = o.uriResolver) && void 0 !== _d ? _d : uri_1.default;
            return {
                strictSchema: null === (_f = null !== (_e = o.strictSchema) && void 0 !== _e ? _e : s) || void 0 === _f || _f,
                strictNumbers: null === (_h = null !== (_g = o.strictNumbers) && void 0 !== _g ? _g : s) || void 0 === _h || _h,
                strictTypes: null !== (_k = null !== (_j = o.strictTypes) && void 0 !== _j ? _j : s) && void 0 !== _k ? _k : "log",
                strictTuples: null !== (_m = null !== (_l = o.strictTuples) && void 0 !== _l ? _l : s) && void 0 !== _m ? _m : "log",
                strictRequired: null !== (_p = null !== (_o = o.strictRequired) && void 0 !== _o ? _o : s) && void 0 !== _p && _p,
                code: o.code ? {
                    ...o.code,
                    optimize,
                    regExp
                } : {
                    optimize,
                    regExp
                },
                loopRequired: null !== (_q = o.loopRequired) && void 0 !== _q ? _q : 200,
                loopEnum: null !== (_r = o.loopEnum) && void 0 !== _r ? _r : 200,
                meta: null === (_s = o.meta) || void 0 === _s || _s,
                messages: null === (_t = o.messages) || void 0 === _t || _t,
                inlineRefs: null === (_u = o.inlineRefs) || void 0 === _u || _u,
                schemaId: null !== (_v = o.schemaId) && void 0 !== _v ? _v : "$id",
                addUsedSchema: null === (_w = o.addUsedSchema) || void 0 === _w || _w,
                validateSchema: null === (_x = o.validateSchema) || void 0 === _x || _x,
                validateFormats: null === (_y = o.validateFormats) || void 0 === _y || _y,
                unicodeRegExp: null === (_z = o.unicodeRegExp) || void 0 === _z || _z,
                int32range: null === (_0 = o.int32range) || void 0 === _0 || _0,
                uriResolver
            };
        }
        class Ajv {
            constructor(opts = {}) {
                this.schemas = {}, this.refs = {}, this.formats = {}, this._compilations = new Set, 
                this._loading = {}, this._cache = new Map, opts = this.opts = {
                    ...opts,
                    ...requiredOptions(opts)
                };
                const {es5, lines} = this.opts.code;
                this.scope = new codegen_2.ValueScope({
                    scope: {},
                    prefixes: EXT_SCOPE_NAMES,
                    es5,
                    lines
                }), this.logger = function(logger) {
                    if (!1 === logger) return noLogs;
                    if (void 0 === logger) return console;
                    if (logger.log && logger.warn && logger.error) return logger;
                    throw new Error("logger must implement log, warn and error methods");
                }(opts.logger);
                const formatOpt = opts.validateFormats;
                opts.validateFormats = !1, this.RULES = (0, rules_1.getRules)(), checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED"), 
                checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn"), this._metaOpts = getMetaSchemaOptions.call(this), 
                opts.formats && addInitialFormats.call(this), this._addVocabularies(), this._addDefaultMetaSchema(), 
                opts.keywords && addInitialKeywords.call(this, opts.keywords), "object" == typeof opts.meta && this.addMetaSchema(opts.meta), 
                addInitialSchemas.call(this), opts.validateFormats = formatOpt;
            }
            _addVocabularies() {
                this.addKeyword("$async");
            }
            _addDefaultMetaSchema() {
                const {$data, meta, schemaId} = this.opts;
                let _dataRefSchema = $dataRefSchema;
                "id" === schemaId && (_dataRefSchema = {
                    ...$dataRefSchema
                }, _dataRefSchema.id = _dataRefSchema.$id, delete _dataRefSchema.$id), meta && $data && this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], !1);
            }
            defaultMeta() {
                const {meta, schemaId} = this.opts;
                return this.opts.defaultMeta = "object" == typeof meta ? meta[schemaId] || meta : void 0;
            }
            validate(schemaKeyRef, data) {
                let v;
                if ("string" == typeof schemaKeyRef) {
                    if (v = this.getSchema(schemaKeyRef), !v) throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
                } else v = this.compile(schemaKeyRef);
                const valid = v(data);
                return "$async" in v || (this.errors = v.errors), valid;
            }
            compile(schema, _meta) {
                const sch = this._addSchema(schema, _meta);
                return sch.validate || this._compileSchemaEnv(sch);
            }
            compileAsync(schema, meta) {
                if ("function" != typeof this.opts.loadSchema) throw new Error("options.loadSchema should be a function");
                const {loadSchema} = this.opts;
                return runCompileAsync.call(this, schema, meta);
                async function runCompileAsync(_schema, _meta) {
                    await loadMetaSchema.call(this, _schema.$schema);
                    const sch = this._addSchema(_schema, _meta);
                    return sch.validate || _compileAsync.call(this, sch);
                }
                async function loadMetaSchema($ref) {
                    $ref && !this.getSchema($ref) && await runCompileAsync.call(this, {
                        $ref
                    }, !0);
                }
                async function _compileAsync(sch) {
                    try {
                        return this._compileSchemaEnv(sch);
                    } catch (e) {
                        if (!(e instanceof ref_error_1.default)) throw e;
                        return checkLoaded.call(this, e), await loadMissingSchema.call(this, e.missingSchema), 
                        _compileAsync.call(this, sch);
                    }
                }
                function checkLoaded({missingSchema: ref, missingRef}) {
                    if (this.refs[ref]) throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
                }
                async function loadMissingSchema(ref) {
                    const _schema = await _loadSchema.call(this, ref);
                    this.refs[ref] || await loadMetaSchema.call(this, _schema.$schema), this.refs[ref] || this.addSchema(_schema, ref, meta);
                }
                async function _loadSchema(ref) {
                    const p = this._loading[ref];
                    if (p) return p;
                    try {
                        return await (this._loading[ref] = loadSchema(ref));
                    } finally {
                        delete this._loading[ref];
                    }
                }
            }
            addSchema(schema, key, _meta, _validateSchema = this.opts.validateSchema) {
                if (Array.isArray(schema)) {
                    for (const sch of schema) this.addSchema(sch, void 0, _meta, _validateSchema);
                    return this;
                }
                let id;
                if ("object" == typeof schema) {
                    const {schemaId} = this.opts;
                    if (id = schema[schemaId], void 0 !== id && "string" != typeof id) throw new Error(`schema ${schemaId} must be string`);
                }
                return key = (0, resolve_1.normalizeId)(key || id), this._checkUnique(key), this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, !0), 
                this;
            }
            addMetaSchema(schema, key, _validateSchema = this.opts.validateSchema) {
                return this.addSchema(schema, key, !0, _validateSchema), this;
            }
            validateSchema(schema, throwOrLogError) {
                if ("boolean" == typeof schema) return !0;
                let $schema;
                if ($schema = schema.$schema, void 0 !== $schema && "string" != typeof $schema) throw new Error("$schema must be a string");
                if ($schema = $schema || this.opts.defaultMeta || this.defaultMeta(), !$schema) return this.logger.warn("meta-schema not available"), 
                this.errors = null, !0;
                const valid = this.validate($schema, schema);
                if (!valid && throwOrLogError) {
                    const message = "schema is invalid: " + this.errorsText();
                    if ("log" !== this.opts.validateSchema) throw new Error(message);
                    this.logger.error(message);
                }
                return valid;
            }
            getSchema(keyRef) {
                let sch;
                for (;"string" == typeof (sch = getSchEnv.call(this, keyRef)); ) keyRef = sch;
                if (void 0 === sch) {
                    const {schemaId} = this.opts, root = new compile_1.SchemaEnv({
                        schema: {},
                        schemaId
                    });
                    if (sch = compile_1.resolveSchema.call(this, root, keyRef), !sch) return;
                    this.refs[keyRef] = sch;
                }
                return sch.validate || this._compileSchemaEnv(sch);
            }
            removeSchema(schemaKeyRef) {
                if (schemaKeyRef instanceof RegExp) return this._removeAllSchemas(this.schemas, schemaKeyRef), 
                this._removeAllSchemas(this.refs, schemaKeyRef), this;
                switch (typeof schemaKeyRef) {
                  case "undefined":
                    return this._removeAllSchemas(this.schemas), this._removeAllSchemas(this.refs), 
                    this._cache.clear(), this;

                  case "string":
                    {
                        const sch = getSchEnv.call(this, schemaKeyRef);
                        return "object" == typeof sch && this._cache.delete(sch.schema), delete this.schemas[schemaKeyRef], 
                        delete this.refs[schemaKeyRef], this;
                    }

                  case "object":
                    {
                        const cacheKey = schemaKeyRef;
                        this._cache.delete(cacheKey);
                        let id = schemaKeyRef[this.opts.schemaId];
                        return id && (id = (0, resolve_1.normalizeId)(id), delete this.schemas[id], delete this.refs[id]), 
                        this;
                    }

                  default:
                    throw new Error("ajv.removeSchema: invalid parameter");
                }
            }
            addVocabulary(definitions) {
                for (const def of definitions) this.addKeyword(def);
                return this;
            }
            addKeyword(kwdOrDef, def) {
                let keyword;
                if ("string" == typeof kwdOrDef) keyword = kwdOrDef, "object" == typeof def && (this.logger.warn("these parameters are deprecated, see docs for addKeyword"), 
                def.keyword = keyword); else {
                    if ("object" != typeof kwdOrDef || void 0 !== def) throw new Error("invalid addKeywords parameters");
                    if (keyword = (def = kwdOrDef).keyword, Array.isArray(keyword) && !keyword.length) throw new Error("addKeywords: keyword must be string or non-empty array");
                }
                if (checkKeyword.call(this, keyword, def), !def) return (0, util_1.eachItem)(keyword, (kwd => addRule.call(this, kwd))), 
                this;
                keywordMetaschema.call(this, def);
                const definition = {
                    ...def,
                    type: (0, dataType_1.getJSONTypes)(def.type),
                    schemaType: (0, dataType_1.getJSONTypes)(def.schemaType)
                };
                return (0, util_1.eachItem)(keyword, 0 === definition.type.length ? k => addRule.call(this, k, definition) : k => definition.type.forEach((t => addRule.call(this, k, definition, t)))), 
                this;
            }
            getKeyword(keyword) {
                const rule = this.RULES.all[keyword];
                return "object" == typeof rule ? rule.definition : !!rule;
            }
            removeKeyword(keyword) {
                const {RULES} = this;
                delete RULES.keywords[keyword], delete RULES.all[keyword];
                for (const group of RULES.rules) {
                    const i = group.rules.findIndex((rule => rule.keyword === keyword));
                    i >= 0 && group.rules.splice(i, 1);
                }
                return this;
            }
            addFormat(name, format) {
                return "string" == typeof format && (format = new RegExp(format)), this.formats[name] = format, 
                this;
            }
            errorsText(errors = this.errors, {separator = ", ", dataVar = "data"} = {}) {
                return errors && 0 !== errors.length ? errors.map((e => `${dataVar}${e.instancePath} ${e.message}`)).reduce(((text, msg) => text + separator + msg)) : "No errors";
            }
            $dataMetaSchema(metaSchema, keywordsJsonPointers) {
                const rules = this.RULES.all;
                metaSchema = JSON.parse(JSON.stringify(metaSchema));
                for (const jsonPointer of keywordsJsonPointers) {
                    const segments = jsonPointer.split("/").slice(1);
                    let keywords = metaSchema;
                    for (const seg of segments) keywords = keywords[seg];
                    for (const key in rules) {
                        const rule = rules[key];
                        if ("object" != typeof rule) continue;
                        const {$data} = rule.definition, schema = keywords[key];
                        $data && schema && (keywords[key] = schemaOrData(schema));
                    }
                }
                return metaSchema;
            }
            _removeAllSchemas(schemas, regex) {
                for (const keyRef in schemas) {
                    const sch = schemas[keyRef];
                    regex && !regex.test(keyRef) || ("string" == typeof sch ? delete schemas[keyRef] : sch && !sch.meta && (this._cache.delete(sch.schema), 
                    delete schemas[keyRef]));
                }
            }
            _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
                let id;
                const {schemaId} = this.opts;
                if ("object" == typeof schema) id = schema[schemaId]; else {
                    if (this.opts.jtd) throw new Error("schema must be object");
                    if ("boolean" != typeof schema) throw new Error("schema must be object or boolean");
                }
                let sch = this._cache.get(schema);
                if (void 0 !== sch) return sch;
                baseId = (0, resolve_1.normalizeId)(id || baseId);
                const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
                return sch = new compile_1.SchemaEnv({
                    schema,
                    schemaId,
                    meta,
                    baseId,
                    localRefs
                }), this._cache.set(sch.schema, sch), addSchema && !baseId.startsWith("#") && (baseId && this._checkUnique(baseId), 
                this.refs[baseId] = sch), validateSchema && this.validateSchema(schema, !0), sch;
            }
            _checkUnique(id) {
                if (this.schemas[id] || this.refs[id]) throw new Error(`schema with key or id "${id}" already exists`);
            }
            _compileSchemaEnv(sch) {
                if (sch.meta ? this._compileMetaSchema(sch) : compile_1.compileSchema.call(this, sch), 
                !sch.validate) throw new Error("ajv implementation error");
                return sch.validate;
            }
            _compileMetaSchema(sch) {
                const currentOpts = this.opts;
                this.opts = this._metaOpts;
                try {
                    compile_1.compileSchema.call(this, sch);
                } finally {
                    this.opts = currentOpts;
                }
            }
        }
        function checkOptions(checkOpts, options, msg, log = "error") {
            for (const key in checkOpts) {
                const opt = key;
                opt in options && this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
            }
        }
        function getSchEnv(keyRef) {
            return keyRef = (0, resolve_1.normalizeId)(keyRef), this.schemas[keyRef] || this.refs[keyRef];
        }
        function addInitialSchemas() {
            const optsSchemas = this.opts.schemas;
            if (optsSchemas) if (Array.isArray(optsSchemas)) this.addSchema(optsSchemas); else for (const key in optsSchemas) this.addSchema(optsSchemas[key], key);
        }
        function addInitialFormats() {
            for (const name in this.opts.formats) {
                const format = this.opts.formats[name];
                format && this.addFormat(name, format);
            }
        }
        function addInitialKeywords(defs) {
            if (Array.isArray(defs)) this.addVocabulary(defs); else {
                this.logger.warn("keywords option as map is deprecated, pass array");
                for (const keyword in defs) {
                    const def = defs[keyword];
                    def.keyword || (def.keyword = keyword), this.addKeyword(def);
                }
            }
        }
        function getMetaSchemaOptions() {
            const metaOpts = {
                ...this.opts
            };
            for (const opt of META_IGNORE_OPTIONS) delete metaOpts[opt];
            return metaOpts;
        }
        exports.default = Ajv, Ajv.ValidationError = validation_error_1.default, Ajv.MissingRefError = ref_error_1.default;
        const noLogs = {
            log() {},
            warn() {},
            error() {}
        };
        const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
        function checkKeyword(keyword, def) {
            const {RULES} = this;
            if ((0, util_1.eachItem)(keyword, (kwd => {
                if (RULES.keywords[kwd]) throw new Error(`Keyword ${kwd} is already defined`);
                if (!KEYWORD_NAME.test(kwd)) throw new Error(`Keyword ${kwd} has invalid name`);
            })), def && def.$data && !("code" in def) && !("validate" in def)) throw new Error('$data keyword must have "code" or "validate" function');
        }
        function addRule(keyword, definition, dataType) {
            var _a;
            const post = null == definition ? void 0 : definition.post;
            if (dataType && post) throw new Error('keyword with "post" flag cannot have "type"');
            const {RULES} = this;
            let ruleGroup = post ? RULES.post : RULES.rules.find((({type: t}) => t === dataType));
            if (ruleGroup || (ruleGroup = {
                type: dataType,
                rules: []
            }, RULES.rules.push(ruleGroup)), RULES.keywords[keyword] = !0, !definition) return;
            const rule = {
                keyword,
                definition: {
                    ...definition,
                    type: (0, dataType_1.getJSONTypes)(definition.type),
                    schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType)
                }
            };
            definition.before ? addBeforeRule.call(this, ruleGroup, rule, definition.before) : ruleGroup.rules.push(rule), 
            RULES.all[keyword] = rule, null === (_a = definition.implements) || void 0 === _a || _a.forEach((kwd => this.addKeyword(kwd)));
        }
        function addBeforeRule(ruleGroup, rule, before) {
            const i = ruleGroup.rules.findIndex((_rule => _rule.keyword === before));
            i >= 0 ? ruleGroup.rules.splice(i, 0, rule) : (ruleGroup.rules.push(rule), this.logger.warn(`rule ${before} is not defined`));
        }
        function keywordMetaschema(def) {
            let {metaSchema} = def;
            void 0 !== metaSchema && (def.$data && this.opts.$data && (metaSchema = schemaOrData(metaSchema)), 
            def.validateSchema = this.compile(metaSchema, !0));
        }
        const $dataRef = {
            $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#"
        };
        function schemaOrData(schema) {
            return {
                anyOf: [ schema, $dataRef ]
            };
        }
    },
    4047: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const equal = __webpack_require__(5686);
        equal.code = 'require("ajv/dist/runtime/equal").default', exports.default = equal;
    },
    8387: (__unused_webpack_module, exports) => {
        "use strict";
        function ucs2length(str) {
            const len = str.length;
            let value, length = 0, pos = 0;
            for (;pos < len; ) length++, value = str.charCodeAt(pos++), value >= 55296 && value <= 56319 && pos < len && (value = str.charCodeAt(pos), 
            56320 == (64512 & value) && pos++);
            return length;
        }
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.default = ucs2length, ucs2length.code = 'require("ajv/dist/runtime/ucs2length").default';
    },
    221: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const uri = __webpack_require__(9084);
        uri.code = 'require("ajv/dist/runtime/uri").default', exports.default = uri;
    },
    5174: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        class ValidationError extends Error {
            constructor(errors) {
                super("validation failed"), this.errors = errors, this.ajv = this.validation = !0;
            }
        }
        exports.default = ValidationError;
    },
    7799: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateAdditionalItems = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "additionalItems",
            type: "array",
            schemaType: [ "boolean", "object" ],
            before: "uniqueItems",
            error: {
                message: ({params: {len}}) => codegen_1.str`must NOT have more than ${len} items`,
                params: ({params: {len}}) => codegen_1._`{limit: ${len}}`
            },
            code(cxt) {
                const {parentSchema, it} = cxt, {items} = parentSchema;
                Array.isArray(items) ? validateAdditionalItems(cxt, items) : (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
            }
        };
        function validateAdditionalItems(cxt, items) {
            const {gen, schema, data, keyword, it} = cxt;
            it.items = !0;
            const len = gen.const("len", codegen_1._`${data}.length`);
            if (!1 === schema) cxt.setParams({
                len: items.length
            }), cxt.pass(codegen_1._`${len} <= ${items.length}`); else if ("object" == typeof schema && !(0, 
            util_1.alwaysValidSchema)(it, schema)) {
                const valid = gen.var("valid", codegen_1._`${len} <= ${items.length}`);
                gen.if((0, codegen_1.not)(valid), (() => function(valid) {
                    gen.forRange("i", items.length, len, (i => {
                        cxt.subschema({
                            keyword,
                            dataProp: i,
                            dataPropType: util_1.Type.Num
                        }, valid), it.allErrors || gen.if((0, codegen_1.not)(valid), (() => gen.break()));
                    }));
                }(valid))), cxt.ok(valid);
            }
        }
        exports.validateAdditionalItems = validateAdditionalItems, exports.default = def;
    },
    5763: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const code_1 = __webpack_require__(1303), codegen_1 = __webpack_require__(3947), names_1 = __webpack_require__(3258), util_1 = __webpack_require__(650), def = {
            keyword: "additionalProperties",
            type: [ "object" ],
            schemaType: [ "boolean", "object" ],
            allowUndefined: !0,
            trackErrors: !0,
            error: {
                message: "must NOT have additional properties",
                params: ({params}) => codegen_1._`{additionalProperty: ${params.additionalProperty}}`
            },
            code(cxt) {
                const {gen, schema, parentSchema, data, errsCount, it} = cxt;
                if (!errsCount) throw new Error("ajv implementation error");
                const {allErrors, opts} = it;
                if (it.props = !0, "all" !== opts.removeAdditional && (0, util_1.alwaysValidSchema)(it, schema)) return;
                const props = (0, code_1.allSchemaProperties)(parentSchema.properties), patProps = (0, 
                code_1.allSchemaProperties)(parentSchema.patternProperties);
                function deleteAdditional(key) {
                    gen.code(codegen_1._`delete ${data}[${key}]`);
                }
                function additionalPropertyCode(key) {
                    if ("all" === opts.removeAdditional || opts.removeAdditional && !1 === schema) deleteAdditional(key); else {
                        if (!1 === schema) return cxt.setParams({
                            additionalProperty: key
                        }), cxt.error(), void (allErrors || gen.break());
                        if ("object" == typeof schema && !(0, util_1.alwaysValidSchema)(it, schema)) {
                            const valid = gen.name("valid");
                            "failing" === opts.removeAdditional ? (applyAdditionalSchema(key, valid, !1), gen.if((0, 
                            codegen_1.not)(valid), (() => {
                                cxt.reset(), deleteAdditional(key);
                            }))) : (applyAdditionalSchema(key, valid), allErrors || gen.if((0, codegen_1.not)(valid), (() => gen.break())));
                        }
                    }
                }
                function applyAdditionalSchema(key, valid, errors) {
                    const subschema = {
                        keyword: "additionalProperties",
                        dataProp: key,
                        dataPropType: util_1.Type.Str
                    };
                    !1 === errors && Object.assign(subschema, {
                        compositeRule: !0,
                        createErrors: !1,
                        allErrors: !1
                    }), cxt.subschema(subschema, valid);
                }
                gen.forIn("key", data, (key => {
                    props.length || patProps.length ? gen.if(function(key) {
                        let definedProp;
                        if (props.length > 8) {
                            const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
                            definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
                        } else definedProp = props.length ? (0, codegen_1.or)(...props.map((p => codegen_1._`${key} === ${p}`))) : codegen_1.nil;
                        return patProps.length && (definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p => codegen_1._`${(0, 
                        code_1.usePattern)(cxt, p)}.test(${key})`)))), (0, codegen_1.not)(definedProp);
                    }(key), (() => additionalPropertyCode(key))) : additionalPropertyCode(key);
                })), cxt.ok(codegen_1._`${errsCount} === ${names_1.default.errors}`);
            }
        };
        exports.default = def;
    },
    4447: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const util_1 = __webpack_require__(650), def = {
            keyword: "allOf",
            schemaType: "array",
            code(cxt) {
                const {gen, schema, it} = cxt;
                if (!Array.isArray(schema)) throw new Error("ajv implementation error");
                const valid = gen.name("valid");
                schema.forEach(((sch, i) => {
                    if ((0, util_1.alwaysValidSchema)(it, sch)) return;
                    const schCxt = cxt.subschema({
                        keyword: "allOf",
                        schemaProp: i
                    }, valid);
                    cxt.ok(valid), cxt.mergeEvaluated(schCxt);
                }));
            }
        };
        exports.default = def;
    },
    2144: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const def = {
            keyword: "anyOf",
            schemaType: "array",
            trackErrors: !0,
            code: __webpack_require__(1303).validateUnion,
            error: {
                message: "must match a schema in anyOf"
            }
        };
        exports.default = def;
    },
    6446: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "contains",
            type: "array",
            schemaType: [ "object", "boolean" ],
            before: "uniqueItems",
            trackErrors: !0,
            error: {
                message: ({params: {min, max}}) => void 0 === max ? codegen_1.str`must contain at least ${min} valid item(s)` : codegen_1.str`must contain at least ${min} and no more than ${max} valid item(s)`,
                params: ({params: {min, max}}) => void 0 === max ? codegen_1._`{minContains: ${min}}` : codegen_1._`{minContains: ${min}, maxContains: ${max}}`
            },
            code(cxt) {
                const {gen, schema, parentSchema, data, it} = cxt;
                let min, max;
                const {minContains, maxContains} = parentSchema;
                it.opts.next ? (min = void 0 === minContains ? 1 : minContains, max = maxContains) : min = 1;
                const len = gen.const("len", codegen_1._`${data}.length`);
                if (cxt.setParams({
                    min,
                    max
                }), void 0 === max && 0 === min) return void (0, util_1.checkStrictMode)(it, '"minContains" == 0 without "maxContains": "contains" keyword ignored');
                if (void 0 !== max && min > max) return (0, util_1.checkStrictMode)(it, '"minContains" > "maxContains" is always invalid'), 
                void cxt.fail();
                if ((0, util_1.alwaysValidSchema)(it, schema)) {
                    let cond = codegen_1._`${len} >= ${min}`;
                    return void 0 !== max && (cond = codegen_1._`${cond} && ${len} <= ${max}`), void cxt.pass(cond);
                }
                it.items = !0;
                const valid = gen.name("valid");
                function validateItemsWithCount() {
                    const schValid = gen.name("_valid"), count = gen.let("count", 0);
                    validateItems(schValid, (() => gen.if(schValid, (() => function(count) {
                        gen.code(codegen_1._`${count}++`), void 0 === max ? gen.if(codegen_1._`${count} >= ${min}`, (() => gen.assign(valid, !0).break())) : (gen.if(codegen_1._`${count} > ${max}`, (() => gen.assign(valid, !1).break())), 
                        1 === min ? gen.assign(valid, !0) : gen.if(codegen_1._`${count} >= ${min}`, (() => gen.assign(valid, !0))));
                    }(count)))));
                }
                function validateItems(_valid, block) {
                    gen.forRange("i", 0, len, (i => {
                        cxt.subschema({
                            keyword: "contains",
                            dataProp: i,
                            dataPropType: util_1.Type.Num,
                            compositeRule: !0
                        }, _valid), block();
                    }));
                }
                void 0 === max && 1 === min ? validateItems(valid, (() => gen.if(valid, (() => gen.break())))) : 0 === min ? (gen.let(valid, !0), 
                void 0 !== max && gen.if(codegen_1._`${data}.length > 0`, validateItemsWithCount)) : (gen.let(valid, !1), 
                validateItemsWithCount()), cxt.result(valid, (() => cxt.reset()));
            }
        };
        exports.default = def;
    },
    5745: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateSchemaDeps = exports.validatePropertyDeps = exports.error = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), code_1 = __webpack_require__(1303);
        exports.error = {
            message: ({params: {property, depsCount, deps}}) => {
                const property_ies = 1 === depsCount ? "property" : "properties";
                return codegen_1.str`must have ${property_ies} ${deps} when property ${property} is present`;
            },
            params: ({params: {property, depsCount, deps, missingProperty}}) => codegen_1._`{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`
        };
        const def = {
            keyword: "dependencies",
            type: "object",
            schemaType: "object",
            error: exports.error,
            code(cxt) {
                const [propDeps, schDeps] = function({schema}) {
                    const propertyDeps = {}, schemaDeps = {};
                    for (const key in schema) {
                        if ("__proto__" === key) continue;
                        (Array.isArray(schema[key]) ? propertyDeps : schemaDeps)[key] = schema[key];
                    }
                    return [ propertyDeps, schemaDeps ];
                }(cxt);
                validatePropertyDeps(cxt, propDeps), validateSchemaDeps(cxt, schDeps);
            }
        };
        function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
            const {gen, data, it} = cxt;
            if (0 === Object.keys(propertyDeps).length) return;
            const missing = gen.let("missing");
            for (const prop in propertyDeps) {
                const deps = propertyDeps[prop];
                if (0 === deps.length) continue;
                const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
                cxt.setParams({
                    property: prop,
                    depsCount: deps.length,
                    deps: deps.join(", ")
                }), it.allErrors ? gen.if(hasProperty, (() => {
                    for (const depProp of deps) (0, code_1.checkReportMissingProp)(cxt, depProp);
                })) : (gen.if(codegen_1._`${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`), 
                (0, code_1.reportMissingProp)(cxt, missing), gen.else());
            }
        }
        function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
            const {gen, data, keyword, it} = cxt, valid = gen.name("valid");
            for (const prop in schemaDeps) (0, util_1.alwaysValidSchema)(it, schemaDeps[prop]) || (gen.if((0, 
            code_1.propertyInData)(gen, data, prop, it.opts.ownProperties), (() => {
                const schCxt = cxt.subschema({
                    keyword,
                    schemaProp: prop
                }, valid);
                cxt.mergeValidEvaluated(schCxt, valid);
            }), (() => gen.var(valid, !0))), cxt.ok(valid));
        }
        exports.validatePropertyDeps = validatePropertyDeps, exports.validateSchemaDeps = validateSchemaDeps, 
        exports.default = def;
    },
    9944: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "if",
            schemaType: [ "object", "boolean" ],
            trackErrors: !0,
            error: {
                message: ({params}) => codegen_1.str`must match "${params.ifClause}" schema`,
                params: ({params}) => codegen_1._`{failingKeyword: ${params.ifClause}}`
            },
            code(cxt) {
                const {gen, parentSchema, it} = cxt;
                void 0 === parentSchema.then && void 0 === parentSchema.else && (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
                const hasThen = hasSchema(it, "then"), hasElse = hasSchema(it, "else");
                if (!hasThen && !hasElse) return;
                const valid = gen.let("valid", !0), schValid = gen.name("_valid");
                if (function() {
                    const schCxt = cxt.subschema({
                        keyword: "if",
                        compositeRule: !0,
                        createErrors: !1,
                        allErrors: !1
                    }, schValid);
                    cxt.mergeEvaluated(schCxt);
                }(), cxt.reset(), hasThen && hasElse) {
                    const ifClause = gen.let("ifClause");
                    cxt.setParams({
                        ifClause
                    }), gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
                } else hasThen ? gen.if(schValid, validateClause("then")) : gen.if((0, codegen_1.not)(schValid), validateClause("else"));
                function validateClause(keyword, ifClause) {
                    return () => {
                        const schCxt = cxt.subschema({
                            keyword
                        }, schValid);
                        gen.assign(valid, schValid), cxt.mergeValidEvaluated(schCxt, valid), ifClause ? gen.assign(ifClause, codegen_1._`${keyword}`) : cxt.setParams({
                            ifClause: keyword
                        });
                    };
                }
                cxt.pass(valid, (() => cxt.error(!0)));
            }
        };
        function hasSchema(it, keyword) {
            const schema = it.schema[keyword];
            return void 0 !== schema && !(0, util_1.alwaysValidSchema)(it, schema);
        }
        exports.default = def;
    },
    4914: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const additionalItems_1 = __webpack_require__(7799), prefixItems_1 = __webpack_require__(6825), items_1 = __webpack_require__(506), items2020_1 = __webpack_require__(4192), contains_1 = __webpack_require__(6446), dependencies_1 = __webpack_require__(5745), propertyNames_1 = __webpack_require__(9812), additionalProperties_1 = __webpack_require__(5763), properties_1 = __webpack_require__(6002), patternProperties_1 = __webpack_require__(7032), not_1 = __webpack_require__(7007), anyOf_1 = __webpack_require__(2144), oneOf_1 = __webpack_require__(1882), allOf_1 = __webpack_require__(4447), if_1 = __webpack_require__(9944), thenElse_1 = __webpack_require__(8383);
        exports.default = function(draft2020 = !1) {
            const applicator = [ not_1.default, anyOf_1.default, oneOf_1.default, allOf_1.default, if_1.default, thenElse_1.default, propertyNames_1.default, additionalProperties_1.default, dependencies_1.default, properties_1.default, patternProperties_1.default ];
            return draft2020 ? applicator.push(prefixItems_1.default, items2020_1.default) : applicator.push(additionalItems_1.default, items_1.default), 
            applicator.push(contains_1.default), applicator;
        };
    },
    506: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateTuple = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), code_1 = __webpack_require__(1303), def = {
            keyword: "items",
            type: "array",
            schemaType: [ "object", "array", "boolean" ],
            before: "uniqueItems",
            code(cxt) {
                const {schema, it} = cxt;
                if (Array.isArray(schema)) return validateTuple(cxt, "additionalItems", schema);
                it.items = !0, (0, util_1.alwaysValidSchema)(it, schema) || cxt.ok((0, code_1.validateArray)(cxt));
            }
        };
        function validateTuple(cxt, extraItems, schArr = cxt.schema) {
            const {gen, parentSchema, data, keyword, it} = cxt;
            !function(sch) {
                const {opts, errSchemaPath} = it, l = schArr.length, fullTuple = l === sch.minItems && (l === sch.maxItems || !1 === sch[extraItems]);
                if (opts.strictTuples && !fullTuple) {
                    const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
                    (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
                }
            }(parentSchema), it.opts.unevaluated && schArr.length && !0 !== it.items && (it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items));
            const valid = gen.name("valid"), len = gen.const("len", codegen_1._`${data}.length`);
            schArr.forEach(((sch, i) => {
                (0, util_1.alwaysValidSchema)(it, sch) || (gen.if(codegen_1._`${len} > ${i}`, (() => cxt.subschema({
                    keyword,
                    schemaProp: i,
                    dataProp: i
                }, valid))), cxt.ok(valid));
            }));
        }
        exports.validateTuple = validateTuple, exports.default = def;
    },
    4192: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), code_1 = __webpack_require__(1303), additionalItems_1 = __webpack_require__(7799), def = {
            keyword: "items",
            type: "array",
            schemaType: [ "object", "boolean" ],
            before: "uniqueItems",
            error: {
                message: ({params: {len}}) => codegen_1.str`must NOT have more than ${len} items`,
                params: ({params: {len}}) => codegen_1._`{limit: ${len}}`
            },
            code(cxt) {
                const {schema, parentSchema, it} = cxt, {prefixItems} = parentSchema;
                it.items = !0, (0, util_1.alwaysValidSchema)(it, schema) || (prefixItems ? (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems) : cxt.ok((0, 
                code_1.validateArray)(cxt)));
            }
        };
        exports.default = def;
    },
    7007: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const util_1 = __webpack_require__(650), def = {
            keyword: "not",
            schemaType: [ "object", "boolean" ],
            trackErrors: !0,
            code(cxt) {
                const {gen, schema, it} = cxt;
                if ((0, util_1.alwaysValidSchema)(it, schema)) return void cxt.fail();
                const valid = gen.name("valid");
                cxt.subschema({
                    keyword: "not",
                    compositeRule: !0,
                    createErrors: !1,
                    allErrors: !1
                }, valid), cxt.failResult(valid, (() => cxt.reset()), (() => cxt.error()));
            },
            error: {
                message: "must NOT be valid"
            }
        };
        exports.default = def;
    },
    1882: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "oneOf",
            schemaType: "array",
            trackErrors: !0,
            error: {
                message: "must match exactly one schema in oneOf",
                params: ({params}) => codegen_1._`{passingSchemas: ${params.passing}}`
            },
            code(cxt) {
                const {gen, schema, parentSchema, it} = cxt;
                if (!Array.isArray(schema)) throw new Error("ajv implementation error");
                if (it.opts.discriminator && parentSchema.discriminator) return;
                const schArr = schema, valid = gen.let("valid", !1), passing = gen.let("passing", null), schValid = gen.name("_valid");
                cxt.setParams({
                    passing
                }), gen.block((function() {
                    schArr.forEach(((sch, i) => {
                        let schCxt;
                        (0, util_1.alwaysValidSchema)(it, sch) ? gen.var(schValid, !0) : schCxt = cxt.subschema({
                            keyword: "oneOf",
                            schemaProp: i,
                            compositeRule: !0
                        }, schValid), i > 0 && gen.if(codegen_1._`${schValid} && ${valid}`).assign(valid, !1).assign(passing, codegen_1._`[${passing}, ${i}]`).else(), 
                        gen.if(schValid, (() => {
                            gen.assign(valid, !0), gen.assign(passing, i), schCxt && cxt.mergeEvaluated(schCxt, codegen_1.Name);
                        }));
                    }));
                })), cxt.result(valid, (() => cxt.reset()), (() => cxt.error(!0)));
            }
        };
        exports.default = def;
    },
    7032: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const code_1 = __webpack_require__(1303), codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), util_2 = __webpack_require__(650), def = {
            keyword: "patternProperties",
            type: "object",
            schemaType: "object",
            code(cxt) {
                const {gen, schema, data, parentSchema, it} = cxt, {opts} = it, patterns = (0, code_1.allSchemaProperties)(schema), alwaysValidPatterns = patterns.filter((p => (0, 
                util_1.alwaysValidSchema)(it, schema[p])));
                if (0 === patterns.length || alwaysValidPatterns.length === patterns.length && (!it.opts.unevaluated || !0 === it.props)) return;
                const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties, valid = gen.name("valid");
                !0 === it.props || it.props instanceof codegen_1.Name || (it.props = (0, util_2.evaluatedPropsToName)(gen, it.props));
                const {props} = it;
                function checkMatchingProperties(pat) {
                    for (const prop in checkProperties) new RegExp(pat).test(prop) && (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
                }
                function validateProperties(pat) {
                    gen.forIn("key", data, (key => {
                        gen.if(codegen_1._`${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, (() => {
                            const alwaysValid = alwaysValidPatterns.includes(pat);
                            alwaysValid || cxt.subschema({
                                keyword: "patternProperties",
                                schemaProp: pat,
                                dataProp: key,
                                dataPropType: util_2.Type.Str
                            }, valid), it.opts.unevaluated && !0 !== props ? gen.assign(codegen_1._`${props}[${key}]`, !0) : alwaysValid || it.allErrors || gen.if((0, 
                            codegen_1.not)(valid), (() => gen.break()));
                        }));
                    }));
                }
                !function() {
                    for (const pat of patterns) checkProperties && checkMatchingProperties(pat), it.allErrors ? validateProperties(pat) : (gen.var(valid, !0), 
                    validateProperties(pat), gen.if(valid));
                }();
            }
        };
        exports.default = def;
    },
    6825: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const items_1 = __webpack_require__(506), def = {
            keyword: "prefixItems",
            type: "array",
            schemaType: [ "array" ],
            before: "uniqueItems",
            code: cxt => (0, items_1.validateTuple)(cxt, "items")
        };
        exports.default = def;
    },
    6002: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const validate_1 = __webpack_require__(7316), code_1 = __webpack_require__(1303), util_1 = __webpack_require__(650), additionalProperties_1 = __webpack_require__(5763), def = {
            keyword: "properties",
            type: "object",
            schemaType: "object",
            code(cxt) {
                const {gen, schema, parentSchema, data, it} = cxt;
                "all" === it.opts.removeAdditional && void 0 === parentSchema.additionalProperties && additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
                const allProps = (0, code_1.allSchemaProperties)(schema);
                for (const prop of allProps) it.definedProperties.add(prop);
                it.opts.unevaluated && allProps.length && !0 !== it.props && (it.props = util_1.mergeEvaluated.props(gen, (0, 
                util_1.toHash)(allProps), it.props));
                const properties = allProps.filter((p => !(0, util_1.alwaysValidSchema)(it, schema[p])));
                if (0 === properties.length) return;
                const valid = gen.name("valid");
                for (const prop of properties) hasDefault(prop) ? applyPropertySchema(prop) : (gen.if((0, 
                code_1.propertyInData)(gen, data, prop, it.opts.ownProperties)), applyPropertySchema(prop), 
                it.allErrors || gen.else().var(valid, !0), gen.endIf()), cxt.it.definedProperties.add(prop), 
                cxt.ok(valid);
                function hasDefault(prop) {
                    return it.opts.useDefaults && !it.compositeRule && void 0 !== schema[prop].default;
                }
                function applyPropertySchema(prop) {
                    cxt.subschema({
                        keyword: "properties",
                        schemaProp: prop,
                        dataProp: prop
                    }, valid);
                }
            }
        };
        exports.default = def;
    },
    9812: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "propertyNames",
            type: "object",
            schemaType: [ "object", "boolean" ],
            error: {
                message: "property name must be valid",
                params: ({params}) => codegen_1._`{propertyName: ${params.propertyName}}`
            },
            code(cxt) {
                const {gen, schema, data, it} = cxt;
                if ((0, util_1.alwaysValidSchema)(it, schema)) return;
                const valid = gen.name("valid");
                gen.forIn("key", data, (key => {
                    cxt.setParams({
                        propertyName: key
                    }), cxt.subschema({
                        keyword: "propertyNames",
                        data: key,
                        dataTypes: [ "string" ],
                        propertyName: key,
                        compositeRule: !0
                    }, valid), gen.if((0, codegen_1.not)(valid), (() => {
                        cxt.error(!0), it.allErrors || gen.break();
                    }));
                })), cxt.ok(valid);
            }
        };
        exports.default = def;
    },
    8383: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const util_1 = __webpack_require__(650), def = {
            keyword: [ "then", "else" ],
            schemaType: [ "object", "boolean" ],
            code({keyword, parentSchema, it}) {
                void 0 === parentSchema.if && (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
            }
        };
        exports.default = def;
    },
    1303: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.validateUnion = exports.validateArray = exports.usePattern = exports.callValidateCode = exports.schemaProperties = exports.allSchemaProperties = exports.noPropertyInData = exports.propertyInData = exports.isOwnProperty = exports.hasPropFunc = exports.reportMissingProp = exports.checkMissingProp = exports.checkReportMissingProp = void 0;
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), names_1 = __webpack_require__(3258), util_2 = __webpack_require__(650);
        function hasPropFunc(gen) {
            return gen.scopeValue("func", {
                ref: Object.prototype.hasOwnProperty,
                code: codegen_1._`Object.prototype.hasOwnProperty`
            });
        }
        function isOwnProperty(gen, data, property) {
            return codegen_1._`${hasPropFunc(gen)}.call(${data}, ${property})`;
        }
        function noPropertyInData(gen, data, property, ownProperties) {
            const cond = codegen_1._`${data}${(0, codegen_1.getProperty)(property)} === undefined`;
            return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
        }
        function allSchemaProperties(schemaMap) {
            return schemaMap ? Object.keys(schemaMap).filter((p => "__proto__" !== p)) : [];
        }
        exports.checkReportMissingProp = function(cxt, prop) {
            const {gen, data, it} = cxt;
            gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), (() => {
                cxt.setParams({
                    missingProperty: codegen_1._`${prop}`
                }, !0), cxt.error();
            }));
        }, exports.checkMissingProp = function({gen, data, it: {opts}}, properties, missing) {
            return (0, codegen_1.or)(...properties.map((prop => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), codegen_1._`${missing} = ${prop}`))));
        }, exports.reportMissingProp = function(cxt, missing) {
            cxt.setParams({
                missingProperty: missing
            }, !0), cxt.error();
        }, exports.hasPropFunc = hasPropFunc, exports.isOwnProperty = isOwnProperty, exports.propertyInData = function(gen, data, property, ownProperties) {
            const cond = codegen_1._`${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
            return ownProperties ? codegen_1._`${cond} && ${isOwnProperty(gen, data, property)}` : cond;
        }, exports.noPropertyInData = noPropertyInData, exports.allSchemaProperties = allSchemaProperties, 
        exports.schemaProperties = function(it, schemaMap) {
            return allSchemaProperties(schemaMap).filter((p => !(0, util_1.alwaysValidSchema)(it, schemaMap[p])));
        }, exports.callValidateCode = function({schemaCode, data, it: {gen, topSchemaRef, schemaPath, errorPath}, it}, func, context, passSchema) {
            const dataAndSchema = passSchema ? codegen_1._`${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data, valCxt = [ [ names_1.default.instancePath, (0, 
            codegen_1.strConcat)(names_1.default.instancePath, errorPath) ], [ names_1.default.parentData, it.parentData ], [ names_1.default.parentDataProperty, it.parentDataProperty ], [ names_1.default.rootData, names_1.default.rootData ] ];
            it.opts.dynamicRef && valCxt.push([ names_1.default.dynamicAnchors, names_1.default.dynamicAnchors ]);
            const args = codegen_1._`${dataAndSchema}, ${gen.object(...valCxt)}`;
            return context !== codegen_1.nil ? codegen_1._`${func}.call(${context}, ${args})` : codegen_1._`${func}(${args})`;
        };
        const newRegExp = codegen_1._`new RegExp`;
        exports.usePattern = function({gen, it: {opts}}, pattern) {
            const u = opts.unicodeRegExp ? "u" : "", {regExp} = opts.code, rx = regExp(pattern, u);
            return gen.scopeValue("pattern", {
                key: rx.toString(),
                ref: rx,
                code: codegen_1._`${"new RegExp" === regExp.code ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`
            });
        }, exports.validateArray = function(cxt) {
            const {gen, data, keyword, it} = cxt, valid = gen.name("valid");
            if (it.allErrors) {
                const validArr = gen.let("valid", !0);
                return validateItems((() => gen.assign(validArr, !1))), validArr;
            }
            return gen.var(valid, !0), validateItems((() => gen.break())), valid;
            function validateItems(notValid) {
                const len = gen.const("len", codegen_1._`${data}.length`);
                gen.forRange("i", 0, len, (i => {
                    cxt.subschema({
                        keyword,
                        dataProp: i,
                        dataPropType: util_1.Type.Num
                    }, valid), gen.if((0, codegen_1.not)(valid), notValid);
                }));
            }
        }, exports.validateUnion = function(cxt) {
            const {gen, schema, keyword, it} = cxt;
            if (!Array.isArray(schema)) throw new Error("ajv implementation error");
            if (schema.some((sch => (0, util_1.alwaysValidSchema)(it, sch))) && !it.opts.unevaluated) return;
            const valid = gen.let("valid", !1), schValid = gen.name("_valid");
            gen.block((() => schema.forEach(((_sch, i) => {
                const schCxt = cxt.subschema({
                    keyword,
                    schemaProp: i,
                    compositeRule: !0
                }, schValid);
                gen.assign(valid, codegen_1._`${valid} || ${schValid}`);
                cxt.mergeValidEvaluated(schCxt, schValid) || gen.if((0, codegen_1.not)(valid));
            })))), cxt.result(valid, (() => cxt.reset()), (() => cxt.error(!0)));
        };
    },
    8559: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const def = {
            keyword: "id",
            code() {
                throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
            }
        };
        exports.default = def;
    },
    1491: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const id_1 = __webpack_require__(8559), ref_1 = __webpack_require__(4405), core = [ "$schema", "$id", "$defs", "$vocabulary", {
            keyword: "$comment"
        }, "definitions", id_1.default, ref_1.default ];
        exports.default = core;
    },
    4405: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.callRef = exports.getValidate = void 0;
        const ref_error_1 = __webpack_require__(8237), code_1 = __webpack_require__(1303), codegen_1 = __webpack_require__(3947), names_1 = __webpack_require__(3258), compile_1 = __webpack_require__(9060), util_1 = __webpack_require__(650), def = {
            keyword: "$ref",
            schemaType: "string",
            code(cxt) {
                const {gen, schema: $ref, it} = cxt, {baseId, schemaEnv: env, validateName, opts, self} = it, {root} = env;
                if (("#" === $ref || "#/" === $ref) && baseId === root.baseId) return function() {
                    if (env === root) return callRef(cxt, validateName, env, env.$async);
                    const rootName = gen.scopeValue("root", {
                        ref: root
                    });
                    return callRef(cxt, codegen_1._`${rootName}.validate`, root, root.$async);
                }();
                const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
                if (void 0 === schOrEnv) throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
                return schOrEnv instanceof compile_1.SchemaEnv ? function(sch) {
                    const v = getValidate(cxt, sch);
                    callRef(cxt, v, sch, sch.$async);
                }(schOrEnv) : function(sch) {
                    const schName = gen.scopeValue("schema", !0 === opts.code.source ? {
                        ref: sch,
                        code: (0, codegen_1.stringify)(sch)
                    } : {
                        ref: sch
                    }), valid = gen.name("valid"), schCxt = cxt.subschema({
                        schema: sch,
                        dataTypes: [],
                        schemaPath: codegen_1.nil,
                        topSchemaRef: schName,
                        errSchemaPath: $ref
                    }, valid);
                    cxt.mergeEvaluated(schCxt), cxt.ok(valid);
                }(schOrEnv);
            }
        };
        function getValidate(cxt, sch) {
            const {gen} = cxt;
            return sch.validate ? gen.scopeValue("validate", {
                ref: sch.validate
            }) : codegen_1._`${gen.scopeValue("wrapper", {
                ref: sch
            })}.validate`;
        }
        function callRef(cxt, v, sch, $async) {
            const {gen, it} = cxt, {allErrors, schemaEnv: env, opts} = it, passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
            function addErrorsFrom(source) {
                const errs = codegen_1._`${source}.errors`;
                gen.assign(names_1.default.vErrors, codegen_1._`${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`), 
                gen.assign(names_1.default.errors, codegen_1._`${names_1.default.vErrors}.length`);
            }
            function addEvaluatedFrom(source) {
                var _a;
                if (!it.opts.unevaluated) return;
                const schEvaluated = null === (_a = null == sch ? void 0 : sch.validate) || void 0 === _a ? void 0 : _a.evaluated;
                if (!0 !== it.props) if (schEvaluated && !schEvaluated.dynamicProps) void 0 !== schEvaluated.props && (it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props)); else {
                    const props = gen.var("props", codegen_1._`${source}.evaluated.props`);
                    it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
                }
                if (!0 !== it.items) if (schEvaluated && !schEvaluated.dynamicItems) void 0 !== schEvaluated.items && (it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items)); else {
                    const items = gen.var("items", codegen_1._`${source}.evaluated.items`);
                    it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
                }
            }
            $async ? function() {
                if (!env.$async) throw new Error("async schema referenced by sync schema");
                const valid = gen.let("valid");
                gen.try((() => {
                    gen.code(codegen_1._`await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`), addEvaluatedFrom(v), 
                    allErrors || gen.assign(valid, !0);
                }), (e => {
                    gen.if(codegen_1._`!(${e} instanceof ${it.ValidationError})`, (() => gen.throw(e))), 
                    addErrorsFrom(e), allErrors || gen.assign(valid, !1);
                })), cxt.ok(valid);
            }() : cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), (() => addEvaluatedFrom(v)), (() => addErrorsFrom(v)));
        }
        exports.getValidate = getValidate, exports.callRef = callRef, exports.default = def;
    },
    1966: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), types_1 = __webpack_require__(2550), compile_1 = __webpack_require__(9060), util_1 = __webpack_require__(650), def = {
            keyword: "discriminator",
            type: "object",
            schemaType: "object",
            error: {
                message: ({params: {discrError, tagName}}) => discrError === types_1.DiscrError.Tag ? `tag "${tagName}" must be string` : `value of tag "${tagName}" must be in oneOf`,
                params: ({params: {discrError, tag, tagName}}) => codegen_1._`{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`
            },
            code(cxt) {
                const {gen, data, schema, parentSchema, it} = cxt, {oneOf} = parentSchema;
                if (!it.opts.discriminator) throw new Error("discriminator: requires discriminator option");
                const tagName = schema.propertyName;
                if ("string" != typeof tagName) throw new Error("discriminator: requires propertyName");
                if (schema.mapping) throw new Error("discriminator: mapping is not supported");
                if (!oneOf) throw new Error("discriminator: requires oneOf keyword");
                const valid = gen.let("valid", !1), tag = gen.const("tag", codegen_1._`${data}${(0, 
                codegen_1.getProperty)(tagName)}`);
                function applyTagSchema(schemaProp) {
                    const _valid = gen.name("valid"), schCxt = cxt.subschema({
                        keyword: "oneOf",
                        schemaProp
                    }, _valid);
                    return cxt.mergeEvaluated(schCxt, codegen_1.Name), _valid;
                }
                gen.if(codegen_1._`typeof ${tag} == "string"`, (() => function() {
                    const mapping = function() {
                        var _a;
                        const oneOfMapping = {}, topRequired = hasRequired(parentSchema);
                        let tagRequired = !0;
                        for (let i = 0; i < oneOf.length; i++) {
                            let sch = oneOf[i];
                            (null == sch ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES) && (sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, null == sch ? void 0 : sch.$ref), 
                            sch instanceof compile_1.SchemaEnv && (sch = sch.schema));
                            const propSch = null === (_a = null == sch ? void 0 : sch.properties) || void 0 === _a ? void 0 : _a[tagName];
                            if ("object" != typeof propSch) throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
                            tagRequired = tagRequired && (topRequired || hasRequired(sch)), addMappings(propSch, i);
                        }
                        if (!tagRequired) throw new Error(`discriminator: "${tagName}" must be required`);
                        return oneOfMapping;
                        function hasRequired({required}) {
                            return Array.isArray(required) && required.includes(tagName);
                        }
                        function addMappings(sch, i) {
                            if (sch.const) addMapping(sch.const, i); else {
                                if (!sch.enum) throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
                                for (const tagValue of sch.enum) addMapping(tagValue, i);
                            }
                        }
                        function addMapping(tagValue, i) {
                            if ("string" != typeof tagValue || tagValue in oneOfMapping) throw new Error(`discriminator: "${tagName}" values must be unique strings`);
                            oneOfMapping[tagValue] = i;
                        }
                    }();
                    gen.if(!1);
                    for (const tagValue in mapping) gen.elseIf(codegen_1._`${tag} === ${tagValue}`), 
                    gen.assign(valid, applyTagSchema(mapping[tagValue]));
                    gen.else(), cxt.error(!1, {
                        discrError: types_1.DiscrError.Mapping,
                        tag,
                        tagName
                    }), gen.endIf();
                }()), (() => cxt.error(!1, {
                    discrError: types_1.DiscrError.Tag,
                    tag,
                    tagName
                }))), cxt.ok(valid);
            }
        };
        exports.default = def;
    },
    2550: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.DiscrError = void 0, function(DiscrError) {
            DiscrError.Tag = "tag", DiscrError.Mapping = "mapping";
        }(exports.DiscrError || (exports.DiscrError = {}));
    },
    5802: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const core_1 = __webpack_require__(1491), validation_1 = __webpack_require__(5099), applicator_1 = __webpack_require__(4914), format_1 = __webpack_require__(3607), metadata_1 = __webpack_require__(4197), draft7Vocabularies = [ core_1.default, validation_1.default, (0, 
        applicator_1.default)(), format_1.default, metadata_1.metadataVocabulary, metadata_1.contentVocabulary ];
        exports.default = draft7Vocabularies;
    },
    5905: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), def = {
            keyword: "format",
            type: [ "number", "string" ],
            schemaType: "string",
            $data: !0,
            error: {
                message: ({schemaCode}) => codegen_1.str`must match format "${schemaCode}"`,
                params: ({schemaCode}) => codegen_1._`{format: ${schemaCode}}`
            },
            code(cxt, ruleType) {
                const {gen, data, $data, schema, schemaCode, it} = cxt, {opts, errSchemaPath, schemaEnv, self} = it;
                opts.validateFormats && ($data ? function() {
                    const fmts = gen.scopeValue("formats", {
                        ref: self.formats,
                        code: opts.code.formats
                    }), fDef = gen.const("fDef", codegen_1._`${fmts}[${schemaCode}]`), fType = gen.let("fType"), format = gen.let("format");
                    gen.if(codegen_1._`typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, (() => gen.assign(fType, codegen_1._`${fDef}.type || "string"`).assign(format, codegen_1._`${fDef}.validate`)), (() => gen.assign(fType, codegen_1._`"string"`).assign(format, fDef))), 
                    cxt.fail$data((0, codegen_1.or)(!1 === opts.strictSchema ? codegen_1.nil : codegen_1._`${schemaCode} && !${format}`, function() {
                        const callFormat = schemaEnv.$async ? codegen_1._`(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))` : codegen_1._`${format}(${data})`, validData = codegen_1._`(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
                        return codegen_1._`${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
                    }()));
                }() : function() {
                    const formatDef = self.formats[schema];
                    if (!formatDef) return void function() {
                        if (!1 === opts.strictSchema) return void self.logger.warn(unknownMsg());
                        throw new Error(unknownMsg());
                        function unknownMsg() {
                            return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
                        }
                    }();
                    if (!0 === formatDef) return;
                    const [fmtType, format, fmtRef] = function(fmtDef) {
                        const code = fmtDef instanceof RegExp ? (0, codegen_1.regexpCode)(fmtDef) : opts.code.formats ? codegen_1._`${opts.code.formats}${(0, 
                        codegen_1.getProperty)(schema)}` : void 0, fmt = gen.scopeValue("formats", {
                            key: schema,
                            ref: fmtDef,
                            code
                        });
                        if ("object" == typeof fmtDef && !(fmtDef instanceof RegExp)) return [ fmtDef.type || "string", fmtDef.validate, codegen_1._`${fmt}.validate` ];
                        return [ "string", fmtDef, fmt ];
                    }(formatDef);
                    fmtType === ruleType && cxt.pass(function() {
                        if ("object" == typeof formatDef && !(formatDef instanceof RegExp) && formatDef.async) {
                            if (!schemaEnv.$async) throw new Error("async format in sync schema");
                            return codegen_1._`await ${fmtRef}(${data})`;
                        }
                        return "function" == typeof format ? codegen_1._`${fmtRef}(${data})` : codegen_1._`${fmtRef}.test(${data})`;
                    }());
                }());
            }
        };
        exports.default = def;
    },
    3607: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const format = [ __webpack_require__(5905).default ];
        exports.default = format;
    },
    4197: (__unused_webpack_module, exports) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        }), exports.contentVocabulary = exports.metadataVocabulary = void 0, exports.metadataVocabulary = [ "title", "description", "default", "deprecated", "readOnly", "writeOnly", "examples" ], 
        exports.contentVocabulary = [ "contentMediaType", "contentEncoding", "contentSchema" ];
    },
    4989: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), equal_1 = __webpack_require__(4047), def = {
            keyword: "const",
            $data: !0,
            error: {
                message: "must be equal to constant",
                params: ({schemaCode}) => codegen_1._`{allowedValue: ${schemaCode}}`
            },
            code(cxt) {
                const {gen, data, $data, schemaCode, schema} = cxt;
                $data || schema && "object" == typeof schema ? cxt.fail$data(codegen_1._`!${(0, 
                util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`) : cxt.fail(codegen_1._`${schema} !== ${data}`);
            }
        };
        exports.default = def;
    },
    4861: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), equal_1 = __webpack_require__(4047), def = {
            keyword: "enum",
            schemaType: "array",
            $data: !0,
            error: {
                message: "must be equal to one of the allowed values",
                params: ({schemaCode}) => codegen_1._`{allowedValues: ${schemaCode}}`
            },
            code(cxt) {
                const {gen, data, $data, schema, schemaCode, it} = cxt;
                if (!$data && 0 === schema.length) throw new Error("enum must have non-empty array");
                const useLoop = schema.length >= it.opts.loopEnum;
                let eql;
                const getEql = () => null != eql ? eql : eql = (0, util_1.useFunc)(gen, equal_1.default);
                let valid;
                if (useLoop || $data) valid = gen.let("valid"), cxt.block$data(valid, (function() {
                    gen.assign(valid, !1), gen.forOf("v", schemaCode, (v => gen.if(codegen_1._`${getEql()}(${data}, ${v})`, (() => gen.assign(valid, !0).break()))));
                })); else {
                    if (!Array.isArray(schema)) throw new Error("ajv implementation error");
                    const vSchema = gen.const("vSchema", schemaCode);
                    valid = (0, codegen_1.or)(...schema.map(((_x, i) => function(vSchema, i) {
                        const sch = schema[i];
                        return "object" == typeof sch && null !== sch ? codegen_1._`${getEql()}(${data}, ${vSchema}[${i}])` : codegen_1._`${data} === ${sch}`;
                    }(vSchema, i))));
                }
                cxt.pass(valid);
            }
        };
        exports.default = def;
    },
    5099: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const limitNumber_1 = __webpack_require__(9275), multipleOf_1 = __webpack_require__(3235), limitLength_1 = __webpack_require__(5499), pattern_1 = __webpack_require__(8519), limitProperties_1 = __webpack_require__(4338), required_1 = __webpack_require__(5044), limitItems_1 = __webpack_require__(9570), uniqueItems_1 = __webpack_require__(7787), const_1 = __webpack_require__(4989), enum_1 = __webpack_require__(4861), validation = [ limitNumber_1.default, multipleOf_1.default, limitLength_1.default, pattern_1.default, limitProperties_1.default, required_1.default, limitItems_1.default, uniqueItems_1.default, {
            keyword: "type",
            schemaType: [ "string", "array" ]
        }, {
            keyword: "nullable",
            schemaType: "boolean"
        }, const_1.default, enum_1.default ];
        exports.default = validation;
    },
    9570: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), def = {
            keyword: [ "maxItems", "minItems" ],
            type: "array",
            schemaType: "number",
            $data: !0,
            error: {
                message({keyword, schemaCode}) {
                    const comp = "maxItems" === keyword ? "more" : "fewer";
                    return codegen_1.str`must NOT have ${comp} than ${schemaCode} items`;
                },
                params: ({schemaCode}) => codegen_1._`{limit: ${schemaCode}}`
            },
            code(cxt) {
                const {keyword, data, schemaCode} = cxt, op = "maxItems" === keyword ? codegen_1.operators.GT : codegen_1.operators.LT;
                cxt.fail$data(codegen_1._`${data}.length ${op} ${schemaCode}`);
            }
        };
        exports.default = def;
    },
    5499: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), ucs2length_1 = __webpack_require__(8387), def = {
            keyword: [ "maxLength", "minLength" ],
            type: "string",
            schemaType: "number",
            $data: !0,
            error: {
                message({keyword, schemaCode}) {
                    const comp = "maxLength" === keyword ? "more" : "fewer";
                    return codegen_1.str`must NOT have ${comp} than ${schemaCode} characters`;
                },
                params: ({schemaCode}) => codegen_1._`{limit: ${schemaCode}}`
            },
            code(cxt) {
                const {keyword, data, schemaCode, it} = cxt, op = "maxLength" === keyword ? codegen_1.operators.GT : codegen_1.operators.LT, len = !1 === it.opts.unicode ? codegen_1._`${data}.length` : codegen_1._`${(0, 
                util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
                cxt.fail$data(codegen_1._`${len} ${op} ${schemaCode}`);
            }
        };
        exports.default = def;
    },
    9275: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), ops = codegen_1.operators, KWDs = {
            maximum: {
                okStr: "<=",
                ok: ops.LTE,
                fail: ops.GT
            },
            minimum: {
                okStr: ">=",
                ok: ops.GTE,
                fail: ops.LT
            },
            exclusiveMaximum: {
                okStr: "<",
                ok: ops.LT,
                fail: ops.GTE
            },
            exclusiveMinimum: {
                okStr: ">",
                ok: ops.GT,
                fail: ops.LTE
            }
        }, error = {
            message: ({keyword, schemaCode}) => codegen_1.str`must be ${KWDs[keyword].okStr} ${schemaCode}`,
            params: ({keyword, schemaCode}) => codegen_1._`{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`
        }, def = {
            keyword: Object.keys(KWDs),
            type: "number",
            schemaType: "number",
            $data: !0,
            error,
            code(cxt) {
                const {keyword, data, schemaCode} = cxt;
                cxt.fail$data(codegen_1._`${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
            }
        };
        exports.default = def;
    },
    4338: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), def = {
            keyword: [ "maxProperties", "minProperties" ],
            type: "object",
            schemaType: "number",
            $data: !0,
            error: {
                message({keyword, schemaCode}) {
                    const comp = "maxProperties" === keyword ? "more" : "fewer";
                    return codegen_1.str`must NOT have ${comp} than ${schemaCode} properties`;
                },
                params: ({schemaCode}) => codegen_1._`{limit: ${schemaCode}}`
            },
            code(cxt) {
                const {keyword, data, schemaCode} = cxt, op = "maxProperties" === keyword ? codegen_1.operators.GT : codegen_1.operators.LT;
                cxt.fail$data(codegen_1._`Object.keys(${data}).length ${op} ${schemaCode}`);
            }
        };
        exports.default = def;
    },
    3235: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const codegen_1 = __webpack_require__(3947), def = {
            keyword: "multipleOf",
            type: "number",
            schemaType: "number",
            $data: !0,
            error: {
                message: ({schemaCode}) => codegen_1.str`must be multiple of ${schemaCode}`,
                params: ({schemaCode}) => codegen_1._`{multipleOf: ${schemaCode}}`
            },
            code(cxt) {
                const {gen, data, schemaCode, it} = cxt, prec = it.opts.multipleOfPrecision, res = gen.let("res"), invalid = prec ? codegen_1._`Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}` : codegen_1._`${res} !== parseInt(${res})`;
                cxt.fail$data(codegen_1._`(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
            }
        };
        exports.default = def;
    },
    8519: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const code_1 = __webpack_require__(1303), codegen_1 = __webpack_require__(3947), def = {
            keyword: "pattern",
            type: "string",
            schemaType: "string",
            $data: !0,
            error: {
                message: ({schemaCode}) => codegen_1.str`must match pattern "${schemaCode}"`,
                params: ({schemaCode}) => codegen_1._`{pattern: ${schemaCode}}`
            },
            code(cxt) {
                const {data, $data, schema, schemaCode, it} = cxt, u = it.opts.unicodeRegExp ? "u" : "", regExp = $data ? codegen_1._`(new RegExp(${schemaCode}, ${u}))` : (0, 
                code_1.usePattern)(cxt, schema);
                cxt.fail$data(codegen_1._`!${regExp}.test(${data})`);
            }
        };
        exports.default = def;
    },
    5044: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const code_1 = __webpack_require__(1303), codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), def = {
            keyword: "required",
            type: "object",
            schemaType: "array",
            $data: !0,
            error: {
                message: ({params: {missingProperty}}) => codegen_1.str`must have required property '${missingProperty}'`,
                params: ({params: {missingProperty}}) => codegen_1._`{missingProperty: ${missingProperty}}`
            },
            code(cxt) {
                const {gen, schema, schemaCode, data, $data, it} = cxt, {opts} = it;
                if (!$data && 0 === schema.length) return;
                const useLoop = schema.length >= opts.loopRequired;
                if (it.allErrors ? function() {
                    if (useLoop || $data) cxt.block$data(codegen_1.nil, loopAllRequired); else for (const prop of schema) (0, 
                    code_1.checkReportMissingProp)(cxt, prop);
                }() : function() {
                    const missing = gen.let("missing");
                    if (useLoop || $data) {
                        const valid = gen.let("valid", !0);
                        cxt.block$data(valid, (() => function(missing, valid) {
                            cxt.setParams({
                                missingProperty: missing
                            }), gen.forOf(missing, schemaCode, (() => {
                                gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties)), 
                                gen.if((0, codegen_1.not)(valid), (() => {
                                    cxt.error(), gen.break();
                                }));
                            }), codegen_1.nil);
                        }(missing, valid))), cxt.ok(valid);
                    } else gen.if((0, code_1.checkMissingProp)(cxt, schema, missing)), (0, code_1.reportMissingProp)(cxt, missing), 
                    gen.else();
                }(), opts.strictRequired) {
                    const props = cxt.parentSchema.properties, {definedProperties} = cxt.it;
                    for (const requiredKey of schema) if (void 0 === (null == props ? void 0 : props[requiredKey]) && !definedProperties.has(requiredKey)) {
                        const msg = `required property "${requiredKey}" is not defined at "${it.schemaEnv.baseId + it.errSchemaPath}" (strictRequired)`;
                        (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
                    }
                }
                function loopAllRequired() {
                    gen.forOf("prop", schemaCode, (prop => {
                        cxt.setParams({
                            missingProperty: prop
                        }), gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), (() => cxt.error()));
                    }));
                }
            }
        };
        exports.default = def;
    },
    7787: (__unused_webpack_module, exports, __webpack_require__) => {
        "use strict";
        Object.defineProperty(exports, "__esModule", {
            value: !0
        });
        const dataType_1 = __webpack_require__(152), codegen_1 = __webpack_require__(3947), util_1 = __webpack_require__(650), equal_1 = __webpack_require__(4047), def = {
            keyword: "uniqueItems",
            type: "array",
            schemaType: "boolean",
            $data: !0,
            error: {
                message: ({params: {i, j}}) => codegen_1.str`must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
                params: ({params: {i, j}}) => codegen_1._`{i: ${i}, j: ${j}}`
            },
            code(cxt) {
                const {gen, data, $data, schema, parentSchema, schemaCode, it} = cxt;
                if (!$data && !schema) return;
                const valid = gen.let("valid"), itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
                function loopN(i, j) {
                    const item = gen.name("item"), wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong), indices = gen.const("indices", codegen_1._`{}`);
                    gen.for(codegen_1._`;${i}--;`, (() => {
                        gen.let(item, codegen_1._`${data}[${i}]`), gen.if(wrongType, codegen_1._`continue`), 
                        itemTypes.length > 1 && gen.if(codegen_1._`typeof ${item} == "string"`, codegen_1._`${item} += "_"`), 
                        gen.if(codegen_1._`typeof ${indices}[${item}] == "number"`, (() => {
                            gen.assign(j, codegen_1._`${indices}[${item}]`), cxt.error(), gen.assign(valid, !1).break();
                        })).code(codegen_1._`${indices}[${item}] = ${i}`);
                    }));
                }
                function loopN2(i, j) {
                    const eql = (0, util_1.useFunc)(gen, equal_1.default), outer = gen.name("outer");
                    gen.label(outer).for(codegen_1._`;${i}--;`, (() => gen.for(codegen_1._`${j} = ${i}; ${j}--;`, (() => gen.if(codegen_1._`${eql}(${data}[${i}], ${data}[${j}])`, (() => {
                        cxt.error(), gen.assign(valid, !1).break(outer);
                    }))))));
                }
                cxt.block$data(valid, (function() {
                    const i = gen.let("i", codegen_1._`${data}.length`), j = gen.let("j");
                    cxt.setParams({
                        i,
                        j
                    }), gen.assign(valid, !0), gen.if(codegen_1._`${i} > 1`, (() => (itemTypes.length > 0 && !itemTypes.some((t => "object" === t || "array" === t)) ? loopN : loopN2)(i, j)));
                }), codegen_1._`${schemaCode} === false`), cxt.ok(valid);
            }
        };
        exports.default = def;
    },
    2956: module => {
        "use strict";
        var traverse = module.exports = function(schema, opts, cb) {
            "function" == typeof opts && (cb = opts, opts = {}), _traverse(opts, "function" == typeof (cb = opts.cb || cb) ? cb : cb.pre || function() {}, cb.post || function() {}, schema, "", schema);
        };
        function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
            if (schema && "object" == typeof schema && !Array.isArray(schema)) {
                for (var key in pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex), 
                schema) {
                    var sch = schema[key];
                    if (Array.isArray(sch)) {
                        if (key in traverse.arrayKeywords) for (var i = 0; i < sch.length; i++) _traverse(opts, pre, post, sch[i], jsonPtr + "/" + key + "/" + i, rootSchema, jsonPtr, key, schema, i);
                    } else if (key in traverse.propsKeywords) {
                        if (sch && "object" == typeof sch) for (var prop in sch) _traverse(opts, pre, post, sch[prop], jsonPtr + "/" + key + "/" + prop.replace(/~/g, "~0").replace(/\//g, "~1"), rootSchema, jsonPtr, key, schema, prop);
                    } else (key in traverse.keywords || opts.allKeys && !(key in traverse.skipKeywords)) && _traverse(opts, pre, post, sch, jsonPtr + "/" + key, rootSchema, jsonPtr, key, schema);
                }
                post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
            }
        }
        traverse.keywords = {
            additionalItems: !0,
            items: !0,
            contains: !0,
            additionalProperties: !0,
            propertyNames: !0,
            not: !0,
            if: !0,
            then: !0,
            else: !0
        }, traverse.arrayKeywords = {
            items: !0,
            allOf: !0,
            anyOf: !0,
            oneOf: !0
        }, traverse.propsKeywords = {
            $defs: !0,
            definitions: !0,
            properties: !0,
            patternProperties: !0,
            dependencies: !0
        }, traverse.skipKeywords = {
            default: !0,
            enum: !0,
            const: !0,
            required: !0,
            maximum: !0,
            minimum: !0,
            exclusiveMaximum: !0,
            exclusiveMinimum: !0,
            multipleOf: !0,
            maxLength: !0,
            minLength: !0,
            pattern: !0,
            format: !0,
            maxItems: !0,
            minItems: !0,
            uniqueItems: !0,
            maxProperties: !0,
            minProperties: !0
        };
    },
    9491: module => {
        "use strict";
        module.exports = require("assert");
    },
    4300: module => {
        "use strict";
        module.exports = require("buffer");
    },
    2081: module => {
        "use strict";
        module.exports = require("child_process");
    },
    2057: module => {
        "use strict";
        module.exports = require("constants");
    },
    6113: module => {
        "use strict";
        module.exports = require("crypto");
    },
    2361: module => {
        "use strict";
        module.exports = require("events");
    },
    7147: module => {
        "use strict";
        module.exports = require("fs");
    },
    8188: module => {
        "use strict";
        module.exports = require("module");
    },
    2037: module => {
        "use strict";
        module.exports = require("os");
    },
    4822: module => {
        "use strict";
        module.exports = require("path");
    },
    7282: module => {
        "use strict";
        module.exports = require("process");
    },
    2781: module => {
        "use strict";
        module.exports = require("stream");
    },
    1576: module => {
        "use strict";
        module.exports = require("string_decoder");
    },
    3837: module => {
        "use strict";
        module.exports = require("util");
    },
    9796: module => {
        "use strict";
        module.exports = require("zlib");
    },
    4147: module => {
        "use strict";
        module.exports = JSON.parse('{"name":"@jsii/runtime","version":"1.67.0","description":"jsii runtime kernel process","license":"Apache-2.0","author":{"name":"Amazon Web Services","url":"https://aws.amazon.com"},"homepage":"https://github.com/aws/jsii","bugs":{"url":"https://github.com/aws/jsii/issues"},"repository":{"type":"git","url":"https://github.com/aws/jsii.git","directory":"packages/@jsii/runtime"},"engines":{"node":">= 14.6.0"},"main":"lib/index.js","types":"lib/index.d.ts","bin":{"jsii-runtime":"bin/jsii-runtime"},"scripts":{"build":"tsc --build && chmod +x bin/jsii-runtime && npx webpack-cli && npm run lint","watch":"tsc --build -w","lint":"eslint . --ext .js,.ts --ignore-path=.gitignore --ignore-pattern=webpack.config.js","lint:fix":"yarn lint --fix","test":"jest","test:update":"jest -u","package":"package-js"},"dependencies":{"@jsii/kernel":"^1.67.0","@jsii/check-node":"1.67.0","@jsii/spec":"^1.67.0"},"devDependencies":{"@scope/jsii-calc-base":"^1.67.0","@scope/jsii-calc-lib":"^1.67.0","jsii-build-tools":"^1.67.0","jsii-calc":"^3.20.120","source-map-loader":"^4.0.0","webpack":"^5.74.0","webpack-cli":"^4.10.0"}}');
    },
    5277: module => {
        "use strict";
        module.exports = JSON.parse('{"$id":"https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#","description":"Meta-schema for $data reference (JSON AnySchema extension proposal)","type":"object","required":["$data"],"properties":{"$data":{"type":"string","anyOf":[{"format":"relative-json-pointer"},{"format":"json-pointer"}]}},"additionalProperties":false}');
    },
    7538: module => {
        "use strict";
        module.exports = JSON.parse('{"$schema":"http://json-schema.org/draft-07/schema#","$id":"http://json-schema.org/draft-07/schema#","title":"Core schema meta-schema","definitions":{"schemaArray":{"type":"array","minItems":1,"items":{"$ref":"#"}},"nonNegativeInteger":{"type":"integer","minimum":0},"nonNegativeIntegerDefault0":{"allOf":[{"$ref":"#/definitions/nonNegativeInteger"},{"default":0}]},"simpleTypes":{"enum":["array","boolean","integer","null","number","object","string"]},"stringArray":{"type":"array","items":{"type":"string"},"uniqueItems":true,"default":[]}},"type":["object","boolean"],"properties":{"$id":{"type":"string","format":"uri-reference"},"$schema":{"type":"string","format":"uri"},"$ref":{"type":"string","format":"uri-reference"},"$comment":{"type":"string"},"title":{"type":"string"},"description":{"type":"string"},"default":true,"readOnly":{"type":"boolean","default":false},"examples":{"type":"array","items":true},"multipleOf":{"type":"number","exclusiveMinimum":0},"maximum":{"type":"number"},"exclusiveMaximum":{"type":"number"},"minimum":{"type":"number"},"exclusiveMinimum":{"type":"number"},"maxLength":{"$ref":"#/definitions/nonNegativeInteger"},"minLength":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"pattern":{"type":"string","format":"regex"},"additionalItems":{"$ref":"#"},"items":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/schemaArray"}],"default":true},"maxItems":{"$ref":"#/definitions/nonNegativeInteger"},"minItems":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"uniqueItems":{"type":"boolean","default":false},"contains":{"$ref":"#"},"maxProperties":{"$ref":"#/definitions/nonNegativeInteger"},"minProperties":{"$ref":"#/definitions/nonNegativeIntegerDefault0"},"required":{"$ref":"#/definitions/stringArray"},"additionalProperties":{"$ref":"#"},"definitions":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"properties":{"type":"object","additionalProperties":{"$ref":"#"},"default":{}},"patternProperties":{"type":"object","additionalProperties":{"$ref":"#"},"propertyNames":{"format":"regex"},"default":{}},"dependencies":{"type":"object","additionalProperties":{"anyOf":[{"$ref":"#"},{"$ref":"#/definitions/stringArray"}]}},"propertyNames":{"$ref":"#"},"const":true,"enum":{"type":"array","items":true,"minItems":1,"uniqueItems":true},"type":{"anyOf":[{"$ref":"#/definitions/simpleTypes"},{"type":"array","items":{"$ref":"#/definitions/simpleTypes"},"minItems":1,"uniqueItems":true}]},"format":{"type":"string"},"contentMediaType":{"type":"string"},"contentEncoding":{"type":"string"},"if":{"$ref":"#"},"then":{"$ref":"#"},"else":{"$ref":"#"},"allOf":{"$ref":"#/definitions/schemaArray"},"anyOf":{"$ref":"#/definitions/schemaArray"},"oneOf":{"$ref":"#/definitions/schemaArray"},"not":{"$ref":"#"}},"default":true}');
    },
    6715: module => {
        "use strict";
        module.exports = JSON.parse('{"$ref":"#/definitions/AssemblyRedirect","$schema":"http://json-schema.org/draft-07/schema#","definitions":{"AssemblyRedirect":{"properties":{"compression":{"description":"The compression applied to the target file, if any.","enum":["gzip"],"type":"string"},"filename":{"description":"The name of the file the assembly is redirected to.","type":"string"},"schema":{"enum":["jsii/file-redirect"],"type":"string"}},"required":["filename","schema"],"type":"object"}}}');
    },
    9402: module => {
        "use strict";
        module.exports = JSON.parse('{"$ref":"#/definitions/Assembly","$schema":"http://json-schema.org/draft-07/schema#","definitions":{"Assembly":{"description":"A JSII assembly specification.","properties":{"author":{"$ref":"#/definitions/Person","description":"The main author of this package."},"bin":{"additionalProperties":{"type":"string"},"default":"none","description":"List of bin-scripts","type":"object"},"bundled":{"additionalProperties":{"type":"string"},"default":"none","description":"List if bundled dependencies (these are not expected to be jsii\\nassemblies).","type":"object"},"contributors":{"default":"none","description":"Additional contributors to this package.","items":{"$ref":"#/definitions/Person"},"type":"array"},"dependencies":{"additionalProperties":{"type":"string"},"default":"none","description":"Direct dependencies on other assemblies (with semver), the key is the JSII\\nassembly name, and the value is a SemVer expression.","type":"object"},"dependencyClosure":{"additionalProperties":{"$ref":"#/definitions/DependencyConfiguration"},"default":"none","description":"Target configuration for all the assemblies that are direct or transitive\\ndependencies of this assembly. This is needed to generate correct native\\ntype names for any transitively inherited member, in certain languages.","type":"object"},"description":{"description":"Description of the assembly, maps to \\"description\\" from package.json\\nThis is required since some package managers (like Maven) require it.","type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fingerprint":{"description":"A fingerprint that can be used to determine if the specification has\\nchanged.","minLength":1,"type":"string"},"homepage":{"description":"The url to the project homepage. Maps to \\"homepage\\" from package.json.","type":"string"},"jsiiVersion":{"description":"The version of the jsii compiler that was used to produce this Assembly.","minLength":1,"type":"string"},"keywords":{"description":"Keywords that help discover or identify this packages with respects to it\'s\\nintended usage, audience, etc... Where possible, this will be rendered in\\nthe corresponding metadata section of idiomatic package manifests, for\\nexample NuGet package tags.","items":{"type":"string"},"type":"array"},"license":{"description":"The SPDX name of the license this assembly is distributed on.","type":"string"},"metadata":{"additionalProperties":{},"default":"none","description":"Arbitrary key-value pairs of metadata, which the maintainer chose to\\ndocument with the assembly. These entries do not carry normative\\nsemantics and their interpretation is up to the assembly maintainer.","type":"object"},"name":{"description":"The name of the assembly","minLength":1,"type":"string"},"readme":{"$ref":"#/definitions/ReadMe","default":"none","description":"The readme document for this module (if any)."},"repository":{"description":"The module repository, maps to \\"repository\\" from package.json\\nThis is required since some package managers (like Maven) require it.","properties":{"directory":{"default":"the root of the repository","description":"If the package is not in the root directory (for example, when part\\nof a monorepo), you should specify the directory in which it lives.","type":"string"},"type":{"description":"The type of the repository (``git``, ``svn``, ...)","type":"string"},"url":{"description":"The URL of the repository.","type":"string"}},"required":["type","url"],"type":"object"},"schema":{"description":"The version of the spec schema","enum":["jsii/0.10.0"],"type":"string"},"submodules":{"additionalProperties":{"allOf":[{"$ref":"#/definitions/ReadMeContainer"},{"$ref":"#/definitions/SourceLocatable"},{"$ref":"#/definitions/Targetable"},{"$ref":"#/definitions/TypeScriptLocatable"}],"description":"A submodule\\n\\nThe difference between a top-level module (the assembly) and a submodule is\\nthat the submodule is annotated with its location in the repository."},"default":"none","description":"Submodules declared in this assembly.","type":"object"},"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."},"types":{"additionalProperties":{"anyOf":[{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/ClassType"}]},{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/EnumType"}]},{"allOf":[{"$ref":"#/definitions/TypeBase"},{"$ref":"#/definitions/InterfaceType"}]}],"description":"Represents a type definition (not a type reference)."},"default":"none","description":"All types in the assembly, keyed by their fully-qualified-name","type":"object"},"version":{"description":"The version of the assembly","minLength":1,"type":"string"}},"required":["author","description","fingerprint","homepage","jsiiVersion","license","name","repository","schema","version"],"type":"object"},"AssemblyTargets":{"additionalProperties":{"additionalProperties":{},"type":"object"},"description":"Configurable targets for an asembly.","type":"object"},"Callable":{"description":"An Initializer or a Method.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"parameters":{"default":"none","description":"The parameters of the Initializer or Method.","items":{"$ref":"#/definitions/Parameter"},"type":"array"},"protected":{"default":false,"description":"Indicates if this Initializer or Method is protected (otherwise it is\\npublic, since private members are not modeled).","type":"boolean"},"variadic":{"default":false,"description":"Indicates whether this Initializer or Method is variadic or not. When\\n``true``, the last element of ``#parameters`` will also be flagged\\n``#variadic``.","type":"boolean"}},"type":"object"},"ClassType":{"description":"Represents classes.","properties":{"abstract":{"default":false,"description":"Indicates if this class is an abstract class.","type":"boolean"},"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"base":{"default":"no base class","description":"The FQN of the base class of this class, if it has one.","type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"initializer":{"$ref":"#/definitions/Callable","default":"no initializer","description":"Initializer (constructor) method."},"interfaces":{"default":"none","description":"The FQNs of the interfaces this class implements, if any.","items":{"type":"string"},"type":"array","uniqueItems":true},"kind":{"description":"The kind of the type.","enum":["class"],"type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"methods":{"default":"none","description":"List of methods.","items":{"$ref":"#/definitions/Method"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"properties":{"default":"none","description":"List of properties.","items":{"$ref":"#/definitions/Property"},"type":"array"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"CollectionKind":{"description":"Kinds of collections.","enum":["array","map"],"type":"string"},"CollectionTypeReference":{"description":"Reference to a collection type.","properties":{"collection":{"properties":{"elementtype":{"$ref":"#/definitions/TypeReference","description":"The type of an element (map keys are always strings)."},"kind":{"$ref":"#/definitions/CollectionKind","description":"The kind of collection."}},"required":["elementtype","kind"],"type":"object"}},"required":["collection"],"type":"object"},"DependencyConfiguration":{"properties":{"submodules":{"additionalProperties":{"$ref":"#/definitions/Targetable"},"type":"object"},"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."}},"type":"object"},"Docs":{"description":"Key value pairs of documentation nodes.\\nBased on TSDoc.","properties":{"custom":{"additionalProperties":{"type":"string"},"default":"none","description":"Custom tags that are not any of the default ones","type":"object"},"default":{"default":"none","description":"Description of the default","type":"string"},"deprecated":{"default":"none","description":"If present, this block indicates that an API item is no longer supported\\nand may be removed in a future release.  The `@deprecated` tag must be\\nfollowed by a sentence describing the recommended alternative.\\nDeprecation recursively applies to members of a container. For example,\\nif a class is deprecated, then so are all of its members.","type":"string"},"example":{"default":"none","description":"Example showing the usage of this API item\\n\\nStarts off in running text mode, may switch to code using fenced code\\nblocks.","type":"string"},"remarks":{"default":"none","description":"Detailed information about an API item.\\n\\nEither the explicitly tagged `@remarks` section, otherwise everything\\npast the first paragraph if there is no `@remarks` tag.","type":"string"},"returns":{"default":"none","description":"The `@returns` block for this doc comment, or undefined if there is not\\none.","type":"string"},"see":{"default":"none","description":"A `@see` link with more information","type":"string"},"stability":{"description":"Whether the API item is beta/experimental quality","enum":["deprecated","experimental","external","stable"],"type":"string"},"subclassable":{"default":false,"description":"Whether this class or interface was intended to be subclassed/implemented\\nby library users.\\n\\nClasses intended for subclassing, and interfaces intended to be\\nimplemented by consumers, are held to stricter standards of API\\ncompatibility.","type":"boolean"},"summary":{"default":"none","description":"Summary documentation for an API item.\\n\\nThe first part of the documentation before hitting a `@remarks` tags, or\\nthe first line of the doc comment block if there is no `@remarks` tag.","type":"string"}},"type":"object"},"EnumMember":{"description":"Represents a member of an enum.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"name":{"description":"The name/symbol of the member.","type":"string"}},"required":["name"],"type":"object"},"EnumType":{"description":"Represents an enum type.","properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"kind":{"description":"The kind of the type.","enum":["enum"],"type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"members":{"description":"Members of the enum.","items":{"$ref":"#/definitions/EnumMember"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","members","name"],"type":"object"},"InterfaceType":{"properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"datatype":{"default":false,"description":"True if this interface only contains properties. Different backends might\\nhave idiomatic ways to allow defining concrete instances such interfaces.\\nFor example, in Java, the generator will produce a PoJo and a builder\\nwhich will allow users to create a concrete object with data which\\nadheres to this interface.","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"interfaces":{"default":"none","description":"The FQNs of the interfaces this interface extends, if any.","items":{"type":"string"},"type":"array","uniqueItems":true},"kind":{"description":"The kind of the type.","enum":["interface"],"type":"string"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"methods":{"default":"none","description":"List of methods.","items":{"$ref":"#/definitions/Method"},"type":"array"},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"properties":{"default":"none","description":"List of properties.","items":{"$ref":"#/definitions/Property"},"type":"array"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"Method":{"description":"A method with a name (i.e: not an initializer).","properties":{"abstract":{"default":false,"description":"Is this method an abstract method (this means the class will also be an abstract class)","type":"boolean"},"async":{"default":false,"description":"Indicates if this is an asynchronous method (it will return a promise).","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The name of the method. Undefined if this method is a initializer.","type":"string"},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"parameters":{"default":"none","description":"The parameters of the Initializer or Method.","items":{"$ref":"#/definitions/Parameter"},"type":"array"},"protected":{"default":false,"description":"Indicates if this Initializer or Method is protected (otherwise it is\\npublic, since private members are not modeled).","type":"boolean"},"returns":{"$ref":"#/definitions/OptionalValue","default":"void","description":"The return type of the method (`undefined` if `void`)"},"static":{"default":false,"description":"Indicates if this is a static method.","type":"boolean"},"variadic":{"default":false,"description":"Indicates whether this Initializer or Method is variadic or not. When\\n``true``, the last element of ``#parameters`` will also be flagged\\n``#variadic``.","type":"boolean"}},"required":["name"],"type":"object"},"NamedTypeReference":{"description":"Reference to a named type, defined by this assembly or one of its\\ndependencies.","properties":{"fqn":{"description":"The fully-qualified-name of the type (can be located in the\\n``spec.types[fqn]``` of the assembly that defines the type).","type":"string"}},"required":["fqn"],"type":"object"},"OptionalValue":{"description":"A value that can possibly be optional.","properties":{"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."}},"required":["type"],"type":"object"},"Parameter":{"description":"Represents a method parameter.","properties":{"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"name":{"description":"The name of the parameter.","minLength":1,"type":"string"},"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."},"variadic":{"default":false,"description":"Whether this is the last parameter of a variadic method. In such cases,\\nthe `#type` attribute is the type of each individual item of the variadic\\narguments list (as opposed to some array type, as for example TypeScript\\nwould model it).","type":"boolean"}},"required":["name","type"],"type":"object"},"Person":{"description":"Metadata about people or organizations associated with the project that\\nresulted in the Assembly. Some of this metadata is required in order to\\npublish to certain package repositories (for example, Maven Central), but is\\nnot normalized, and the meaning of fields (role, for example), is up to each\\nproject maintainer.","properties":{"email":{"default":"none","description":"The email of the person","type":"string"},"name":{"description":"The name of the person","type":"string"},"organization":{"default":false,"description":"If true, this person is, in fact, an organization","type":"boolean"},"roles":{"description":"A list of roles this person has in the project, for example `maintainer`,\\n`contributor`, `owner`, ...","items":{"type":"string"},"type":"array"},"url":{"default":"none","description":"The URL for the person","type":"string"}},"required":["name","roles"],"type":"object"},"PrimitiveType":{"description":"Kinds of primitive types.","enum":["any","boolean","date","json","number","string"],"type":"string"},"PrimitiveTypeReference":{"description":"Reference to a primitive type.","properties":{"primitive":{"$ref":"#/definitions/PrimitiveType","description":"If this is a reference to a primitive type, this will include the\\nprimitive type kind."}},"required":["primitive"],"type":"object"},"Property":{"description":"A class property.","properties":{"abstract":{"default":false,"description":"Indicates if this property is abstract","type":"boolean"},"const":{"default":false,"description":"A hint that indicates that this static, immutable property is initialized\\nduring startup. This allows emitting \\"const\\" idioms in different target\\nlanguages. Implies `static` and `immutable`.","type":"boolean"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"immutable":{"default":false,"description":"Indicates if this property only has a getter (immutable).","type":"boolean"},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The name of the property.","minLength":1,"type":"string"},"optional":{"default":false,"description":"Determines whether the value is, indeed, optional.","type":"boolean"},"overrides":{"default":"this member is not overriding anything","description":"The FQN of the parent type (class or interface) that this entity\\noverrides or implements. If undefined, then this entity is the first in\\nit\'s hierarchy to declare this entity.","type":"string"},"protected":{"default":false,"description":"Indicates if this property is protected (otherwise it is public)","type":"boolean"},"static":{"default":false,"description":"Indicates if this is a static property.","type":"boolean"},"type":{"$ref":"#/definitions/TypeReference","description":"The declared type of the value, when it\'s present."}},"required":["name","type"],"type":"object"},"ReadMe":{"description":"README information","properties":{"markdown":{"type":"string"}},"required":["markdown"],"type":"object"},"ReadMeContainer":{"description":"Elements that can contain a `readme` property.","properties":{"readme":{"$ref":"#/definitions/ReadMe","default":"none","description":"The readme document for this module (if any)."}},"type":"object"},"SourceLocatable":{"description":"Indicates that an entity has a source location","properties":{"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."}},"type":"object"},"SourceLocation":{"description":"Where in the module source the definition for this API item was found","properties":{"filename":{"description":"Relative filename","type":"string"},"line":{"description":"1-based line number in the indicated file","type":"number"}},"required":["filename","line"],"type":"object"},"Targetable":{"description":"A targetable module-like thing\\n\\nHas targets and a readme. Used for Assemblies and Submodules.","properties":{"targets":{"$ref":"#/definitions/AssemblyTargets","default":"none","description":"A map of target name to configuration, which is used when generating\\npackages for various languages."}},"type":"object"},"TypeBase":{"description":"Common attributes of a type definition.","properties":{"assembly":{"description":"The name of the assembly the type belongs to.","minLength":1,"type":"string"},"docs":{"$ref":"#/definitions/Docs","default":"none","description":"Documentation for this entity."},"fqn":{"description":"The fully qualified name of the type (``<assembly>.<namespace>.<name>``)","minLength":3,"type":"string"},"kind":{"$ref":"#/definitions/TypeKind","description":"The kind of the type."},"locationInModule":{"$ref":"#/definitions/SourceLocation","default":"none","description":"Where in the module this definition was found\\n\\nWhy is this not `locationInAssembly`? Because the assembly is the JSII\\nfile combining compiled code and its manifest, whereas this is referring\\nto the location of the source in the module the assembly was built from."},"name":{"description":"The simple name of the type (MyClass).","minLength":1,"type":"string"},"namespace":{"default":"none","description":"The namespace of the type (`foo.bar.baz`).\\n\\nWhen undefined, the type is located at the root of the assembly (its\\n`fqn` would be like `<assembly>.<name>`).\\n\\nFor types inside other types or inside submodules, the `<namespace>` corresponds to\\nthe namespace-qualified name of the container (can contain multiple segments like:\\n`<ns1>.<ns2>.<ns3>`).\\n\\nIn all cases:\\n\\n <fqn> = <assembly>[.<namespace>].<name>","type":"string"},"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"required":["assembly","fqn","kind","name"],"type":"object"},"TypeKind":{"description":"Kinds of types.","enum":["class","enum","interface"],"type":"string"},"TypeReference":{"anyOf":[{"$ref":"#/definitions/NamedTypeReference"},{"$ref":"#/definitions/PrimitiveTypeReference"},{"$ref":"#/definitions/CollectionTypeReference"},{"$ref":"#/definitions/UnionTypeReference"}],"description":"A reference to a type (primitive, collection or fqn)."},"TypeScriptLocatable":{"description":"Indicates that a jsii entity\'s origin can be traced to TypeScript code\\n\\nThis is interface is not the same as `SourceLocatable`. SourceLocatable\\nidentifies lines in source files in a source repository (in a `.ts` file,\\nwith respect to a git root).\\n\\nOn the other hand, `TypeScriptLocatable` identifies a symbol name inside a\\npotentially distributed TypeScript file (in either a `.d.ts` or `.ts`\\nfile, with respect to the package root).","properties":{"symbolId":{"description":"Unique string representation of the corresponding Typescript symbol\\n\\nUsed to map from TypeScript code back into the assembly.","type":"string"}},"type":"object"},"UnionTypeReference":{"description":"Reference to a union type.","properties":{"union":{"description":"Indicates that this is a union type, which means it can be one of a set\\nof types.","properties":{"types":{"description":"All the possible types (including the primary type).","items":{"$ref":"#/definitions/TypeReference"},"minItems":2,"type":"array"}},"required":["types"],"type":"object"}},"required":["union"],"type":"object"}}}');
    }
}, __webpack_module_cache__ = {};

function __webpack_require__(moduleId) {
    var cachedModule = __webpack_module_cache__[moduleId];
    if (void 0 !== cachedModule) return cachedModule.exports;
    var module = __webpack_module_cache__[moduleId] = {
        exports: {}
    };
    return __webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__), 
    module.exports;
}

var __webpack_exports__ = {};

(() => {
    "use strict";
    var _a;
    const packageInfo = __webpack_require__(4147), host_1 = __webpack_require__(7905), in_out_1 = __webpack_require__(6156), sync_stdio_1 = __webpack_require__(1416), name = packageInfo.name, version = packageInfo.version, noStack = !!process.env.JSII_NOSTACK, debug = !!process.env.JSII_DEBUG, debugTiming = !!process.env.JSII_DEBUG_TIMING, stdio = new sync_stdio_1.SyncStdio({
        errorFD: null !== (_a = process.stderr.fd) && void 0 !== _a ? _a : 2,
        readFD: 3,
        writeFD: 3
    }), inout = new in_out_1.InputOutput(stdio), host = new host_1.KernelHost(inout, {
        debug,
        noStack,
        debugTiming
    });
    host.once("exit", process.exit.bind(process)), inout.write({
        hello: `${name}@${version}`
    }), inout.debug = debug, host.run();
})();
//# sourceMappingURL=program.js.map