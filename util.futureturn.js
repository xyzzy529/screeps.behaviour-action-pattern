/**
 * class for executing commands on a future tick of the game.
 * .reset() to check that Memory is setup or .reset(true) to remove old items
 * .cmd() to add a new command string to the Array
 * .show() for debug uses, lists all or last 10 entries
 * .check() is in main.loop to check each turn if commands are due
 *    Catches up on old commands if they are past due by using first un-executed
 *    tick value and then running all commands with that tick value in array. The
 *    next call will run the next largest tick, and so on. One possible problem,
 *    if commands are put into array with +1 and +10, then on catch up
 *    (assuming no other commands in array) they will actually run at +1 and +2.
 *    To avoid this problem command at +1 should add +10 during its eval instead
 *    of script code adding both at same time (only if it is critical that
 *    interval is maintained).
 *    TODO: ?Make exeTick relative to code reload instead of absolute Tick?
 */
//class Future {
module.exports = {
    /**
     * initialize the FutureTurn[]
     * @param {Boolean} [force=false] forces init to empty old commands
     */
    init(force = false) {
        if (Memory.FutureTurn === undefined || force) {
            Memory.FutureTurn = [
                {
                    exeTick: 0,
                    evalCmd: "console.log('Started FutureCheck!');",
                    showLog: true, // show this message in console (default false)
                }
            ];
            Memory.FutureTurn.firstTick = Game.time;
        }
    },
    /**
     * Add to FutureTurn array for later execution
     * @param  {number} exeTick Relative turns from current Tick to execute
     * @param  {string} evalCmd command string that will be eval'ed at Tick
     * @return {number}         Index of inserted future command for use in subsequent calls
     */
    cmd(exeTick, evalCmd, showLog = false) {
        let n = Memory.FutureTurn.length;
        Memory.FutureTurn[n] = {
            exeTick: Game.time + exeTick,
            evalCmd: evalCmd,
            showLog: showLog
        };
        //console.log(`****** FutureCmd added ${Memory.FutureTurn[n].exeTick} Cmd:${Memory.FutureTurn[n].evalCmd}`);
        //console.log('FutureTurn dump:'+JSON.stringify(Memory.FutureTurn) );
        return n;
    },

    show(showAll = false) {
        if ((typeof showAll) === 'number') {
            let FT = Memory.FutureTurn[showAll];
            console.log(`FT[${showAll}]=${JSON.stringify(FT)}`);
        } else {
            let i = 0;
            if (!showAll) {
                let i = Math.min(Memory.FutureTurn.length - 10, 0);
            }
            for (; i < Memory.FutureTurn.length; i++) {
                let FT = Memory.FutureTurn[i];
                console.log(`FT[${i}]=${JSON.stringify(FT)}`);
            }
        }
    },
    /**
     * Cheks the Memory.FutureTurn[] to see if any commands are due for eval()
     * allThisTick is used to run Cmd's in order,
     * so all old are NOT run in single call.
     */
    check() {
        //console.log(`FutureCheck for ${Game.time} length=${Memory.FutureTurn.length}`);
        let FT = Memory.FutureTurn;
        let allThisTick = Infinity; // used if AI is stopped, ONLY runs one Tick per pass.
        for (let t = 0; t < FT.length; t++) {
            if (FT[t].evalDone === undefined && (FT[t].exeTick == allThisTick || (allThisTick == Infinity && FT[t].exeTick <= Game.time))) {
                try {
                    eval(FT[t].evalCmd);
                    FT[t].evalDone = true;
                } catch (e) {
                    FT[t].evalDone = (e.stack || e.toString());
                    let message = dye('FireBrick', `FutureCheck allThisTick ERROR FT[${t}] <br>` + (e.stack || e.toString()));
                    console.log(message);
                }
                if (FT[t].showLog) {
                    let message = dye('green', `FutureTurn[${t}]: |${FT[t].evalCmd}|`);
                    console.log(message);
                }
            }
        }
    }
}
