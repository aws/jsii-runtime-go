"use strict";

var __webpack_modules__ = {
    3129: module => {
        module.exports = require("child_process");
    },
    7082: module => {
        module.exports = require("console");
    },
    2087: module => {
        module.exports = require("os");
    },
    5622: module => {
        module.exports = require("path");
    },
    1765: module => {
        module.exports = require("process");
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
    __webpack_modules__[moduleId](module, module.exports, __webpack_require__);
    return module.exports;
}

var __webpack_exports__ = {};

(() => {
    var exports = __webpack_exports__;
    var __webpack_unused_export__;
    __webpack_unused_export__ = {
        value: true
    };
    const child_process_1 = __webpack_require__(3129);
    const console_1 = __webpack_require__(7082);
    const os_1 = __webpack_require__(2087);
    const path_1 = __webpack_require__(5622);
    const process_1 = __webpack_require__(1765);
    const child = child_process_1.spawn(process_1.execPath, [ ...process_1.execArgv, path_1.resolve(__dirname, "..", "lib", "program.js") ], {
        stdio: [ "ignore", "pipe", "pipe", "pipe" ]
    });
    child.once("end", ((code, signal) => {
        var _a;
        if (signal != null) {
            process_1.exit(128 + ((_a = os_1.constants.signals[signal]) !== null && _a !== void 0 ? _a : 0));
        }
        process_1.exit(code);
    }));
    child.once("error", (err => {
        console.error("Failed to spawn child process:", err.stack);
        process_1.exit(-1);
    }));
    for (const signal of Object.keys(os_1.constants.signals)) {
        if (signal === "SIGKILL" || signal === "SIGSTOP") {
            continue;
        }
        process_1.on(signal, (sig => child.kill(sig)));
    }
    function makeHandler(tag) {
        return chunk => {
            const buffer = Buffer.from(chunk);
            console_1.error(JSON.stringify({
                [tag]: buffer.toString("base64")
            }));
        };
    }
    child.stdout.on("data", makeHandler("stdout"));
    child.stderr.on("data", makeHandler("stderr"));
    const commands = child.stdio[3];
    process_1.stdin.pipe(commands);
    commands.pipe(process_1.stdout);
})();
//# sourceMappingURL=jsii-runtime.js.map