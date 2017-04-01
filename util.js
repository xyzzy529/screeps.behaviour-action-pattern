// All methods require a JSDoc comment describing it.
// http://usejsdoc.org/
module.exports = {
    /**
     * formats an integer into a readable value
     * @param {Number} number
     * @returns {string}
     */
    formatNumber(number) {
        if (number >= 1000000) {
            return (number / 1000000).toFixed(2) + 'M';
        } else if (number >= 1000) {
            return (number / 1000).toFixed(1) + 'K';
        }
        return number.toString();
    },
    
    /**
     * Pad a number with a character
     * @param {Number} number - The number to pad
     * @param [padCharacter='0'] - The character to pad with
     * @param {Number} [padLength=2] - The amount of characters to pad
     * @param {Boolean} [padLengthMax=true] - padLength will also be the max length of output string
     * @returns {string}
     */
    pad(number, padCharacter = '0', padLength = 2, padLengthMax = true) {
        if (!padCharacter) padCharacter = '0';
        if (padLengthMax) padLength -= number.toString().length;
        const padString = _.times(padLength, n => padCharacter).join('');
        return padString + number;
    },
    
    /**
     * Gets a property from an object and optionally sets the default
     * @param {Object} object - The object
     * @param {string} path - The path to the property within the object
     * @param {*} defaultValue - The default value if property doesn't exist
     * @param {Boolean} [setDefault=true] - Will set the property to the default value if property doesn't exist
     * @returns {*}
     */
    get(object, path, defaultValue, setDefault = true) {
        const r = _.get(object, path);
        if (!r && !_.isUndefined(defaultValue) && setDefault) {
            defaultValue = Util.fieldOrFunction(defaultValue);
            _.set(object, path, defaultValue);
            return defaultValue;
        }
        return r;
    },
    
    /**
     * Sets a property on an object, optionally if the property doesn't already exist
     * @param {Object} object - The object
     * @param {string} path - The path to the property within the object
     * @param {*} value - The value to set
     * @param {Boolean} [onlyIfNotExists=true] - Will only set the property if it doesn't already exist
     */
    set(object, path, value, onlyIfNotExists = true) {
        if (onlyIfNotExists) {
            Util.get(object, path, value);
            return;
        }
        _.set(object, path, value);
    },
    
    /**
     * Calls a function if it exists
     * @param {Function} toCall - The function to call
     * @param {...*} [args] - A list of arguments to pass to the function
     * @returns {*} Will return whatever the function calls, if it exists
     */
    callIfExists(toCall, ...args) {
        if (toCall) return toCall(...args);
    },
    
    /**
     * Returns the result of the function or the value passed
     * @param {*} value
     * @param {...*} [args] - A list of arguments to pass if it's a function
     * @returns {*}
     */
    fieldOrFunction(value, ...args) {
        return typeof value === 'function' ? value(...args) : value;
    },
    
    /**
     * Checks if the value is an object or function
     * @param {*} value - The value to check
     * @returns {Boolean}
     */
    isObject(value) {
        if (value === null) return false;
        return typeof value === 'function' || typeof value === 'object';
    },
    
    /**
     * Translates an error code to the type
     * @param {Number} code - The error code / constant
     * @returns {string}
     */
    translateErrorCode(code) {
        return {
            0: 'OK',
            1: 'ERR_NOT_OWNER',
            2: 'ERR_NO_PATH',
            3: 'ERR_NAME_EXISTS',
            4: 'ERR_BUSY',
            5: 'ERR_NOT_FOUND',
            6: 'ERR_NOT_ENOUGH_RESOURCES',
            7: 'ERR_INVALID_TARGET',
            8: 'ERR_FULL',
            9: 'ERR_NOT_IN_RANGE',
            10: 'ERR_INVALID_ARGS',
            11: 'ERR_TIRED',
            12: 'ERR_NO_BODYPART',
            14: 'ERR_RCL_NOT_ENOUGH',
            15: 'ERR_GCL_NOT_ENOUGH',
        }[code * -1];
    },
    
    /**
     * Returns a HTML formatted string with the style applied
     * @param {Object|string} style - Either a colour string or an object with CSS properties
     * @param {...string} text - The text to format
     * @returns {string}
     */
    dye(style, ...text) {
        const msg = text.join(' ');
        if (Util.isObject(style)) {
            let css = '';
            const format = key => css += `${key}: ${style[key]};`;
            _.forEach(Object.keys(style), format);
            return `<span style="${css}">${msg}</span>`;
        }
        if (style) {
            return `<span style="color: ${style}">${msg}</span>`;
        }
        return msg;
    },
    
    /**
     * Logs an error to console
     * @param {string} message - A string describing the error
     * @param {*} [entityWhere] - The entity where the error was caused
     */
    logError(message, entityWhere) {
        const msg = Util.dye(CRAYON.error, message);
        if (entityWhere) {
            Util.trace('error', entityWhere, msg);
        } else {
            console.log(msg);
        }
    },
    
    /**
     * Log an error for a creep's action, given an error code
     * @param {Creep} creep - The creep causing the error
     * @param {Number} [code] - The error code returned
     */
    logErrorCode(creep, code) {
        const message = `${error}\nroom: ${creep.pos.roomName}\ncreep: ${creep.name}\naction: ${creep.data.actionName}\ntarget: ${creep.data.targetId}`;
        if (code) {
            const error = Util.translateErrorCode(code);
            if (creep) {
                creep.say(error ? error : code);
            }
            Game.notify(message, 120);
        }
        console.log(Util.dye(CRAYON.error, message));
    },
    
    /**
     * Log text as a system message showing a "referrer" as a label
     * @param {string} roomName - The name of the room being logged from
     * @param {...string} message - The message to log
     */
    logSystem(roomName, ...message) {
        const text = Util.dye(CRAYON.system, roomName);
        console.log(Util.dye(CRAYON.system, `<a href="/a/#!/room/${roomName}">${text}</a> &gt;`), ...message);
    },
    
    /**
     * Trace an error or debug statement
     * @param {string} category - The error category
     * @param {*} entityWhere - The entity where the error was caused
     * @param {Object|string} message - A string or object describing the error
     */
    trace(category, entityWhere, ...message) {
        function reduceMemoryWhere(result, value, key) {
            const setting = Memory.debugTrace[key];
            if (!Reflect.has(Memory.debugTrace, key)) {
                return result;
            } else if (result) {
                return setting === value || (!value && setting === `${value}`);
            }
            return false;
        }
        function noMemoryWhere(e) {
            const setting = Memory.debugTrace.no[e[0]];
            return setting === true || e[0] in Memory.debugTrace.no &&
                (setting === e[1] || (!e[1] && setting === `${e[1]}`));
        }
        if (!(Memory.debugTrace[category] === true || _(entityWhere).reduce(reduceMemoryWhere, 1) === true)) return;
        if (Memory.debugTrace.no && _(entityWhere).pairs().some(noMemoryWhere) === true) return;
        
        let msg = message;
        let key;
        if (message.length === 0 && category) {
            let leaf = category;
            do {
                key = leaf;
                leaf = entityWhere[leaf];
            } while (entityWhere[leaf] && leaf !== category);
            
            if (leaf && leaf !== category) {
                if (typeof leaf === 'string') {
                    msg = [leaf];
                } else {
                    msg = [key, '=', leaf];
                }
            }
        }
        
        console.log(Game.time, Util.dye(CRAYON.error, category), ...msg, Util.dye(CRAYON.birth, JSON.stringify(entityWhere)));
    },
    
    /**
     * Converts the date to local time
     * @param {Date} date - Server date
     * @returns {Date}
     */
    toLocalDate(date) {
        if (!date) date = new Date();
        let offset = TIME_ZONE;
        if (USE_SUMMERTIME && isSummerTime(date)) offset++;
        return new Date(date.getTime() + (3600000 * offset));
    },
    
    /**
     * Formats the date object to a date-time string
     * @param {Date} date - The date to format
     * @returns {string}
     */
    toDateTimeString(date) {
        const pad = Util.pad;
        return pad(date.getFullYear(), 0, 4) + '-' + pad(date.getMonth() + 1) + '-' + pad(date.getDate()) + ' ' + Util.toTimeString(date);
    },
    
    /**
     * Formats the date object to a time string
     * @param {Date} date - The date to format
     * @returns {string}
     */
    toTimeString(date) {
        const pad = Util.pad;
        return pad(date.getHours()) + ':' + pad(date.getMinutes()) + ':' + pad(date.getSeconds());
    },
    
    /**
     * Checks if it's summertime/daylight savings in the date provided
     * @param {Date} date - A date object to check
     * @returns {Boolean}
     */
    isSummerTime(date) {
        if (!Reflect.has(Date.prototype, 'stdTimezoneOffset')) {
            Date.prototype.stdTimezoneOffset = function () {
                const jan = new Date(this.getFullYear(), 0, 1);
                const jul = new Date(this.getFullYear(), 6, 1);
                return Math.max(jan.getTimezoneOffset(), jul.getTimezoneOffset());
            };
        }
        if (!Reflect.has(Date.prototype, 'dst')) {
            Object.defineProperty(Date.prototype, 'dst', {
                get: function () {
                    return this.getTimezoneOffset() < this.stdTimezoneOffset();
                },
                configurable: true,
            });
        }
        
        return date.dst;
    },
    
    /**
     * Adds a Game object to an array by providing the object ID
     * @param {Array<*>} array - The array to add the object to
     * @param {string} id - ID string corrosponding to a Game object
     * @returns {Array<*>}
     */
    addById(array, id) {
        if (!array) array = [];
        const obj = Game.getObjectById(id);
        if (obj) array.push(obj);
        return array;
    },
    
    /**
     * Sends room statistics via. game email
     */
    processReports() {
        if (!_.isUndefined(Memory.statistics) && !_.isUndefined(Memory.statistics.reports) && Memory.statistics.reports.length) {
            let mails;
            if (Memory.statistics.reports.length <= REPORTS_PER_LOOP) {
                mails = Memory.statistics.reports;
                Memory.statistics.reports = [];
            } else {
                mails = Memory.statistics.reports.splice(0, REPORTS_PER_LOOP);
            }
            _.forEach(mails, Game.notify);
        }
    },
    
    /**
     * Gets the distances between two rooms, respecting natural walls
     * @param {string} fromRoom - Starting room
     * @param {string} toRoom - Ending room
     * @returns {Number}
     */
    routeRange(fromRoom, toRoom) {
        if (fromRoom === toRoom) return 0;
        
        return Util.get(Memory, `routeRange.${fromRoom}.${toRoom}`, function() {
            const room = fromRoom instanceof Room ? fromRoom : Game.rooms[fromRoom];
            if (!room) return Room.roomDistance(fromRoom, toRoom, false);
            
            const route = room.findroute(toRoom, false, false);
            if (!route) return Room.roomDistance(fromRoom, toRoom, false);
            
            return route === ERR_NO_PATH ? Infinity : route.length;
        });
    },
    
    /**
     * Paves the room utilising Brown/Brown Pavement Art flags
     * @param {string} roomName - The room to pave
     */
    pave(roomName) {
        const flags = _.values(Game.flags).filter(f => f.pos.roomName === roomName && f.compareTo(FLAG_COLOR.pavementArt));
        const val = Memory.pavementArt[roomName] === undefinede ? '' : Memory.pavementArt[roomName];
        const posMap = flag => `x${flag.pos.x}y${flag.pos.y}`;
        Memory.pavementArt[roomName] = val + flags.map(posMap).join('')+'x';
        const setSite = flag => flag.pos.createConstructionSite(STRUCTURE_WALL);
        flags.forEach(setSite);
        const remote = f => f.remove();
        flags.forEach(remove);
    },
    
    /**
     * Unpaves the room
     * @param {string} roomName - The room to unpave
     * @returns {Boolean} Whether or not the method was sucessful
     */
    unpave(roomName) {
        if (!Memory.pavementArt || !Memory.pavementArt[roomName]) return false;
        const room = Game.rooms[roomName];
        if (!room) return false;
        const unpaved = structure => Memory.pavementArt[roomName].indexOf(`x${structure.pos.x}y${structure.pos.y}x`) >= 0;
        const structures = room.structures.all.filter(unpaved);
        const destroy = structure => structure.destroy();
        if (structures) structures.forEach(destroy);
        delete Memory.pavementArt[roomName];
        return true;
    },
    
    /**
     * Generate a GUID. Note: This is not guaranteed to be 100% unique.
     * @returns {string}
     */
    guid() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
            const r = Math.random() * 16 | 0;
            const v = c === 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    },
    
    /**
     * List the current memory usage of a given path in memory in kb
     * @param {string} key - The location in memory to check eg 'rooms.E1S1.statistics'
     * @returns {string}
     */
    memoryUsage(key) {
        const mem = key ? Memory[key] : Memory;
        let string = '<table><tr><th>Key</th><th>Size (kb)</th></tr>';
        let total = 0;
        for (const key in mem) {
            const sum = JSON.stringify(mem[key]).length / 1024;
            total += sum;
            string += `<tr><td>${key}</td><td>${_.round(sum, 2)}</td></tr>`;
        }
        string += `<tr><td>Total</td><td>${_.round(total, 2)}</td></tr></table>`;
        return string;
    },
    
    /**
     * Reset all profiling data
     */
    resetProfiler() {
        Util.loadProfiler(true);
    },
    
    /**
     * Load existing profiling data or intialize to defaults.
     * @param {Boolean} [reset=false] - Optionally reset all profiling data
     */
    loadProfiler(reset=false) {
        if (reset) {
            Util.logSystem('Profiler', 'resetting profiler data.');
            Memory.profiler = {
                totalCPU: 0,
                totalTicks: 0,
                types: {},
                validTick: Game.time,
            };
        }
        global.profiler = Memory.profiler;
    },
    
    /**
     * Creates and returns a profiling object, use checkCPU to compare usage between calls
     * @param {string} name - The name to use when reporting
     * @param {Number} [startCPU] - Optional starting CPU usage to use as starting point
     * @returns {checkCPU, totalCPU} - functions to be called to check usage and output totals
     */
    startProfiling(name, startCPU) {
        let checkCPU;
        let totalCPU;
        if (PROFILE || DEBUG) {
            if (_.isUndefined(Memory.profiler)) {
                Util.resetProfiler();
            } else if (!global.profiler ||
                global.profiler.validTick !== Memory.profiler.validTick ||
                global.profiler.totalTicks < Memory.profiler.totalTicks) {
                Util.loadProfiler();
            }
            const onLoad = startCPU || Game.cpu.getUsed();
            let start = onLoad;
            if (PROFILE) {
                /**
                 * Compares usage since startProfiling or the last call to checkCPU and reports if over limit
                 * @param {string} localName - The local name to use when reporting
                 * @param {Number} limit - CPU threshold for reporting usage
                 * @param {string} [type] - Optional, will store average usage for all calls that share this type
                 */
                checkCPU = function(localName, limit, type) {
                    const current = Game.cpu.getUsed();
                    const used = _.round(current - start, 2);
                    if (!limit || used > limit) {
                        Util.logSystem(name + ':' + localName, used);
                    }
                    if (type) {
                        Util.set(global.profiler.types, type, {
                            totalCPU: 0,
                            count: 0,
                            totalCount: 0,
                        });
                        global.profiler.types[type].totalCPU += used;
                        glboal.profiler.types[type].count++;
                    }
                    start = current;
                };
            }
            /**
             * Calculates total usage and outputs usage based on parameter settings
             */
            totalCPU = function() {
                const totalUsed = Game.cpu.getUsed() - onLoad;
                global.profiler.totalCPU += totalUsed;
                global.profiler.totalTicks++;
                const avgCPU = global.profiler.totalCPU / global.profiler.totalTicks;
                if (PROFILE && PROFILING.AVERAGE_USAGE && _.size(global.profiler.types) > 0) {
                    let heading = '';
                    while (heading.length < 30) heading += ' ';
                    Util.logSystem(heading, '(avg/creep/tick) (active) (weighted avg) (executions)');
                    for (const type in global.profiler.types) {
                        const data = global.profiler.types[type];
                        data.totalCount += data.count;
                        const typeAvg = _.round(data.totalCPU / data.totalCount, 3);
                        let heading = type + ': ';
                        while (heading < 30) heading += ' ';
                        Util.logSystem(heading, '\t' + typeAvg + '\t\t' +
                            data.count + '\t\t' + _.round(typeAvg * data.count, 3) + '\t\t' + data.totalCount);
                        data.count = 0;
                    }
                }
                Util.logSystem(name, ' loop:' + _.round(totalUsed, 2), 'other:' + _.round(onLoad, 2), 'avg:' + _.round(avgCPU, 2), 'ticks:' +
                    global.profiler.totalTicks, 'bucket:' + Game.cpu.bucket, 2);
                if (PROFILE) console.log('\n');
                Memory.profiler = global.profiler;
            };
        }
        return {checkCPU, totalCPU};
    }
};