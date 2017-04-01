const reduceMemoryWhere = function(result, value, key) {
    const setting = Memory.debugTrace[key];
    if (!Memory.debugTrace.hasOwnProperty(key)) {
        return result;
    } else if (result) { // default result
        // matches or for falsey values matches printed value
        return setting === value || (!value && setting === `${value}`);
    } else {
        return false;
    }
};
const noMemoryWhere = function(e) {
    const setting = Memory.debugTrace.no[e[0]];
    return setting === true || Memory.debugTrace.no.hasOwnProperty(e[0]) &&
        (setting === e[1] || (!e[1] && setting === `${e[1]}`));
};

let mod = {};
module.exports = mod;
// base class for events
mod.LiteEvent = function() {
    // registered subscribers
    this.handlers = [];
    // register a new subscriber
    this.on = function(handler) {
        this.handlers.push(handler);
    }
    // remove a registered subscriber
    this.off = function(handler) {
        this.handlers = this.handlers.filter(h => h !== handler);
    }
    // call all registered subscribers
    this.trigger = function(data) {
        try {
            this.handlers.slice(0).forEach(h => h(data));
        } catch (e) {
            global.logError('Error in LiteEvent.trigger: ' + (e.stack || e));
        }
    }
};
// Flag colors, used throughout the code
//COLOR_RED
mod.FLAG_COLOR = {
    invade: { // destroy everything enemy in the room
        color: COLOR_RED,
        secondaryColor: COLOR_RED,
        exploit: { // send privateers to exploit sources
            color: COLOR_RED,
            secondaryColor: COLOR_GREEN,
        },
        robbing: { // take energy from foreign structures
            color: COLOR_RED,
            secondaryColor: COLOR_YELLOW,
        },
        attackController: { // attack enemy controller and then claim
            color: COLOR_RED,
            secondaryColor: COLOR_CYAN,
        }
    },
    //COLOR_PURPLE - Reserved labs
    //COLOR_BLUE - Reserved (internal use)
    //COLOR_CYAN - Reserved (build related)
    construct: { // construct an extension at flag when available
        color: COLOR_CYAN,
        secondaryColor: COLOR_CYAN,
        spawn: { // construct a spawn at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_RED,
        },
        tower: { // construct a tower at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_PURPLE,
        },
        link: { // construct a link at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_BLUE,
        },
        lab: { // construct a lab at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_GREEN,
        },
        storage: { // construct a storage at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_YELLOW,
        },
        terminal: { // construct a terminal at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_ORANGE,
        },
        observer: { // construct an observer at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_BROWN,
        },
        nuker: { // construct a nuker at flag when available
            color: COLOR_CYAN,
            secondaryColor: COLOR_GREY,
        },
        powerSpawn: { // construct a power spawn at flagwhen available
            color: COLOR_CYAN,
            secondaryColor: COLOR_WHITE,
        }
    },
    //COLOR_GREEN
    claim: { // claim this room, then build spawn at flag
        color: COLOR_GREEN,
        secondaryColor: COLOR_GREEN,
        spawn: { // send pioneers & build spawn here
            color: COLOR_GREEN,
            secondaryColor: COLOR_WHITE,
        },
        pioneer: { // send additional pioneers
            color: COLOR_GREEN,
            secondaryColor: COLOR_RED,
        },
        reserve: { // reserve this room
            color: COLOR_GREEN,
            secondaryColor: COLOR_GREY,
        },
        mining: {
            color: COLOR_GREEN,
            secondaryColor: COLOR_BROWN,
        },
        delivery: { // rob energy from friendly rooms and deliver here
            color: COLOR_GREEN,
            secondaryColor: COLOR_YELLOW,
        },
    },
    //COLOR_YELLOW
    defense: { // point to gather troops
        color: COLOR_YELLOW,
        secondaryColor: COLOR_YELLOW,
    },
    //COLOR_ORANGE
    destroy: { // destroy whats standing here
        color: COLOR_ORANGE,
        secondaryColor: COLOR_ORANGE,
        dismantle: {
            color: COLOR_ORANGE,
            secondaryColor: COLOR_YELLOW,
        },
    },
    //COLOR_BROWN
    pavementArt: {
        color: COLOR_BROWN,
        secondaryColor: COLOR_BROWN,
    },
    // COLOR_GREY
    command: { // command api
        color: COLOR_WHITE,
        drop: { // haulers drop energy in a pile here
            color: COLOR_WHITE,
            secondaryColor: COLOR_YELLOW,
        }
    },
};
mod.DECAY_AMOUNT = {
    'rampart': RAMPART_DECAY_AMOUNT, // 300
    'road': ROAD_DECAY_AMOUNT, // 100
    'container': CONTAINER_DECAY, // 5000
};
mod.DECAYABLES = [
    STRUCTURE_ROAD,
    STRUCTURE_CONTAINER,
    STRUCTURE_RAMPART
];
mod.LAB_IDLE = 'idle';
mod.LAB_BOOST = 'boost';
mod.LAB_SEED = 'seed';
mod.LAB_MASTER = 'master';
mod.LAB_SLAVE_1 = 'slave_1';
mod.LAB_SLAVE_2 = 'slave_2';
mod.LAB_SLAVE_3 = 'slave_3';
mod.REACTOR_TYPE_FLOWER = 'flower';
mod.REACTOR_MODE_IDLE = 'idle';
mod.REACTOR_MODE_BURST = 'burst';
mod.LAB_REACTIONS = {};
for (let a in REACTIONS) {
    for (let b in REACTIONS[a]) {
        mod.LAB_REACTIONS[REACTIONS[a][b]] = [a, b];
    }
}
mod.MEM_SEGMENTS = {
    COSTMATRIX_CACHE: {
        start: 99,
        end: 95
    }
};
// used to log something meaningful instead of numbers
mod.translateErrorCode = function(code) {
    var codes = {
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
        15: 'ERR_GCL_NOT_ENOUGH'
    };
    return codes[code * -1];
};
// manipulate log output
// simply put a color as "style"
// or an object, containing any css
mod.dye = function(style, text) {
    if (isObj(style)) {
        var css = "";
        var format = key => css += key + ":" + style[key] + ";";
        _.forEach(Object.keys(style), format);
        return ('<font style="' + css + '">' + text + '</font>');
    }
    if (style)
        return ('<font style="color:' + style + '">' + text + '</font>');
    else return text;
};
// predefined log colors
mod.CRAYON = {
    death: {color: 'black', 'font-weight': 'bold'},
    birth: '#e6de99',
    error: '#e79da7',
    system: {color: '#999', 'font-size': '10px'}
};
// log an error for a creeps action, given an error code
mod.logErrorCode = function(creep, code) {
    if (code) {
        var error = translateErrorCode(code);
        if (creep) {
            if (error) creep.say(error);
            else creep.say(code);
        }
        var message = error + '\nroom: ' + creep.pos.roomName + '\ncreep: ' + creep.name + '\naction: ' + creep.data.actionName + '\ntarget: ' + creep.data.targetId;
        console.log(dye(CRAYON.error, message));
        Game.notify(message, 120);
    } else {
        var message = 'unknown error code\nroom: ' + creep.pos.roomName + '\ncreep: ' + creep.name + '\naction: ' + creep.data.actionName + '\ntarget: ' + creep.data.targetId;
        console.log(dye(CRAYON.error, message));
    }
};
// log some text as error
mod.logError = function(message, entityWhere) {
    if (entityWhere) {
        trace('error', entityWhere, dye(CRAYON.error, message));
    } else {
        console.log(dye(CRAYON.error, message));
    }
};
// trace an error or debug statement
mod.trace = function(category, entityWhere, ...message) {
    if (!( Memory.debugTrace[category] === true || _(entityWhere).reduce(reduceMemoryWhere, 1) === true )) return;
    if (Memory.debugTrace.no && _(entityWhere).pairs().some(noMemoryWhere) === true) return;
    
    let msg = message;
    let key = '';
    if (message.length === 0 && category) {
        let leaf = category;
        do {
            key = leaf;
            leaf = entityWhere[leaf];
        } while (entityWhere[leaf] && leaf != category);
        
        if (leaf && leaf != category) {
            if (typeof leaf === 'string') {
                msg = [leaf];
            } else {
                msg = [key, '=', leaf];
            }
        }
    }
    
    console.log(Game.time, dye(CRAYON.error, category), ...msg, dye(CRAYON.birth, JSON.stringify(entityWhere)));
};
// log some text as "system message" showing a "referrer" as label
mod.logSystem = function(roomName, message) {
    let text = dye(CRAYON.system, roomName);
    console.log(dye(CRAYON.system, `<a href="/a/#!/room/${roomName}">${text}</a> &gt; `) + message);
};
mod.isObj = function(val) {
    if (val === null) {
        return false;
    }
    return ( (typeof val === 'function') || (typeof val === 'object') );
};
// for notify mails: transform server time to local
mod.toLocalDate = function(date) {
    if (!date) date = new Date();
    var offset = TIME_ZONE;
    if (USE_SUMMERTIME && isSummerTime(date)) offset++;
    return new Date(date.getTime() + (3600000 * offset));
};
// for notify mails: format dateTime (as date & time)
mod.toDateTimeString = function(date) {
    return (len(date.getDate()) + "." + len(date.getMonth() + 1) + "." + len(date.getFullYear()) + " " + len(date.getHours()) + ":" + len(date.getMinutes()) + ":" + len(date.getSeconds()));
};
// for notify mails: format dateTime (as time only)
mod.toTimeString = function(date) {
    return (len(date.getHours()) + ":" + len(date.getMinutes()) + ":" + len(date.getSeconds()));
};
// prefix 1 digit numbers with an 0
mod.len = function(number) {
    return ("00" + number).slice(-2);
};
// determine if a given dateTime is within daylight saving time (DST)
// you may need to adjust that to your local summer time rules
// default: Central European Summer Time (CEST)
mod.isSummerTime = function(date) {
    var year = date.getFullYear();
    // last sunday of march
    var temp = new Date(year, 2, 31);
    var begin = new Date(year, 2, temp.getDate() - temp.getDay(), 2, 0, 0);
    // last sunday of october
    temp = new Date(year, 9, 31);
    var end = new Date(year, 9, temp.getDate() - temp.getDay(), 3, 0, 0);
    
    return ( begin < date && date < end );
};
// add a game object, obtained from its id, to an array
mod.addById = function(array, id) {
    if (array == null) array = [];
    var obj = Game.getObjectById(id);
    if (obj) array.push(obj);
    return array;
};
// send up to REPORTS_PER_LOOP notify mails, which are cached in memory
mod.processReports = function() {
    // if there are some in memory
    if (!_.isUndefined(Memory.statistics) && !_.isUndefined(Memory.statistics.reports) && Memory.statistics.reports.length > 0) {
        let mails;
        // below max ?
        if (Memory.statistics.reports.length <= REPORTS_PER_LOOP) {
            // send all
            mails = Memory.statistics.reports;
            Memory.statistics.reports = [];
        }
        else {
            // send first chunk
            let chunks = _.chunk(Memory.statistics.reports, REPORTS_PER_LOOP);
            mails = chunks[0];
            Memory.statistics.reports = _(chunks).tail().concat();
        }
        let send = mail => Game.notify(mail);
        _.forEach(mails, send);
    }
};
// get movement range between rooms
// respecting environmental walls
// uses memory to cache for ever
mod.routeRange = function(fromRoom, toRoom) {
    if (fromRoom === toRoom) return 0;
    if (_.isUndefined(Memory.routeRange)) {
        Memory.routeRange = {};
    }
    if (_.isUndefined(Memory.routeRange[fromRoom])) {
        Memory.routeRange[fromRoom] = {};
    }
    if (_.isUndefined(Memory.routeRange[fromRoom][toRoom])) {
        // ensure start room object
        let room = null;
        if (fromRoom instanceof Room) room = fromRoom;
        else room = Game.rooms[fromRoom];
        if (_.isUndefined(room)) return Room.roomDistance(fromRoom, toRoom, false);
        // get valid route to room (respecting environmental walls)
        let route = room.findRoute(toRoom, false, false);
        if (_.isUndefined(route)) return Room.roomDistance(fromRoom, toRoom, false);
        // store path length for ever
        Memory.routeRange[fromRoom][toRoom] = route == ERR_NO_PATH ? Infinity : route.length;
    }
    return Memory.routeRange[fromRoom][toRoom];
};
// turn brown flags into wall construction sites
// save positions in memory (to ignore them for repairing)
mod.pave = function(roomName) {
    let flags = _.values(Game.flags).filter(flag => flag.pos.roomName == roomName && flag.color == COLOR_BROWN);
    let val = Memory.pavementArt[roomName] === undefined ? '' : Memory.pavementArt[roomName];
    let posMap = flag => 'x' + flag.pos.x + 'y' + flag.pos.y;
    Memory.pavementArt[roomName] = val + flags.map(posMap).join('') + 'x';
    let setSite = flag => flag.room.createConstructionSite(flag, STRUCTURE_WALL);
    flags.forEach(setSite);
    let remove = flag => flag.remove();
    flags.forEach(remove);
};
mod.unpave = function(roomname) {
    if (!Memory.pavementArt || !Memory.pavementArt[roomname]) return false;
    let room = Game.rooms[roomname];
    if (!room) return false;
    let unpaved = structure => Memory.pavementArt[roomname].indexOf('x' + structure.pos.x + 'y' + structure.pos.y + 'x') >= 0;
    let structures = room.structures.all.filter(unpaved);
    let destroy = structure => structure.destroy();
    if (structures) structures.forEach(destroy);
    delete Memory.pavementArt[roomname];
    return true;
};
mod.guid = function() {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
        return v.toString(16);
    });
};
Object.defineProperty(global, 'observerRequests', {
    configurable: true,
    get: function() {
        if (_.isUndefined(global._observerRequests)) {
            global._observerRequests = [];
        }
        return global._observerRequests;
    },
    /**
     * Pass an object containing room information to the requests
     * @param {Object} request - `roomName` property required
     */
    set: function(request) {
        global._observerRequests.push(request);
    },
});
mod.memoryUsage = function(mem) {
    let string = '';
    let total = 0;
    let biggestKey = '';
    for (const key in mem) {
        if (key.length > biggestKey.length) biggestKey = key;
        const sum = JSON.stringify(mem[key]).length / 1024;
        total += sum;
        string += `<tr><td>${key}</td><td>${_.round(sum, 2)}</td></tr>`;
    }
    string += `<tr><td>Total</td><td>${_.round(total, 2)}</td></tr></table>`;
    const padding = Array(biggestKey.length + 2).join(' ');
    return `<table><tr><th>Key${padding}</th><th>Size (kb)</th></tr>`.concat(string);
};
mod.profiler = null;
mod.resetProfiler = function() {
    mod.loadProfiler(true);
};
mod.loadProfiler = function(reset) {
    if (reset) {
        logSystem('Profiler', 'resetting profiler data.');
        Memory.profiler = {
            totalCPU: 0,
            totalTicks: 0,
            types: {},
            validTick: Game.time
        };
    }
    mod.profiler = Memory.profiler;
};
mod.startProfiling = function(name, startCPU) {
    let checkCPU = function(localName, limit, type) {
    };
    let totalCPU = function() {
        // if you would like to do a baseline comparison
        // if (_.isUndefined(Memory.profiling)) Memory.profiling = {ticks:0, cpu: 0};
        // let thisTick = Game.cpu.getUsed() - startCPU;
        // Memory.profiling.ticks++;
        // Memory.profiling.cpu += thisTick;
        // logSystem('Total', _.round(thisTick, 2) + ' ' + _.round(Memory.profiling.cpu / Memory.profiling.ticks, 2));
    };
    if (PROFILE || DEBUG) {
        if (_.isUndefined(Memory.profiler)) resetProfiler();
        else if (!mod.profiler ||
            mod.profiler.validTick !== Memory.profiler.validTick ||
            mod.profiler.totalTicks < Memory.profiler.totalTicks) {
            loadProfiler();
        }
        const onLoad = startCPU || Game.cpu.getUsed();
        let start = onLoad;
        if (PROFILE) {
            checkCPU = function(localName, limit, type) {
                let current = Game.cpu.getUsed();
                let used = _.round(current - start, 2);
                if (!limit || used > limit) {
                    logSystem(name + ':' + localName, used);
                }
                if (type) {
                    if (_.isUndefined(mod.profiler.types[type])) mod.profiler.types[type] = {
                        totalCPU: 0,
                        count: 0,
                        totalCount: 0
                    };
                    mod.profiler.types[type].totalCPU = mod.profiler.types[type].totalCPU + used;
                    mod.profiler.types[type].count++;
                }
                start = current;
            };
        }
        totalCPU = function() {
            const totalUsed = Game.cpu.getUsed() - onLoad;
            mod.profiler.totalCPU = mod.profiler.totalCPU + totalUsed;
            mod.profiler.totalTicks = mod.profiler.totalTicks + 1;
            const avgCPU = mod.profiler.totalCPU / mod.profiler.totalTicks;
            if (PROFILE && PROFILING.AVERAGE_USAGE && _.size(mod.profiler.types) > 0) {
                let heading = '';
                while (heading.length < 30) heading += ' ';
                global.logSystem(heading, '(avg/creep/tick) (active) (weighted avg) (executions)');
                for (let type in mod.profiler.types) {
                    let data = mod.profiler.types[type];
                    data.totalCount = data.totalCount + data.count;
                    const typeAvg = _.round(data.totalCPU / data.totalCount, 3);
                    let heading = type + ': ';
                    while (heading.length < 30) heading += ' ';
                    global.logSystem(heading, '     ' + typeAvg + '          ' +
                        data.count + '       ' + (_.round(typeAvg * data.count, 3)) + '          ' + data.totalCount);
                    data.count = 0;
                }
            }
            logSystem(name, ' loop:' + _.round(totalUsed, 2) + ' other:' + _.round(onLoad, 2) + ' avg:' + _.round(avgCPU, 2) + ' ticks:' +
                mod.profiler.totalTicks + ' bucket:' + Game.cpu.bucket, 2);
            if (PROFILE) console.log('\n');
            Memory.profiler = mod.profiler;
        };
    }
    return {
        checkCPU: checkCPU,
        totalCPU: totalCPU,
    };
};
mod = _.bindAll(mod);