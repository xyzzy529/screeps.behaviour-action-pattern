/**
 * class for executing commands on a future tick of the game.
 * .reset() to check that Memory is setup or .reset(true) to remove old items
 * .cmd() to add a new command string to the Array
 * .show() for debug uses, lists all or last 10 entries
 * .check() is in main.loop to check each turn if commands are due
 *    Catches up on old commands if they are past due.
 *    TODO: ?Catch-up might not be good since all are run in one turn,
 *          ?maybe only run one per Tick? or get oldest Tick and run all of those?
 *          then next oldest
 *          ?Make exeTick relative to start of processing instead of absolute Tick?
 * @type {[type]}
 */
class Future {
    reset(force = false) {
        if (Memory.FutureTurn === undefined || force) {
            Memory.FutureTurn = [
                {
                    exeTick: 0,
                    evalCmd: "console.log('Started FutureCheck!');"
                }
            ];
        }
    }

    cmd = (exeTick, evalCmd) => {
        let n = Memory.FutureTurn.length;
        Memory.FutureTurn[n] = {
            exeTick: exeTick,
            evalCmd: evalCmd
        };
        //console.log(`****** FutureCmd added ${Memory.FutureTurn[n].exeTick} Cmd:${Memory.FutureTurn[n].evalCmd}`);
        //console.log('FutureTurn dump:'+JSON.stringify(Memory.FutureTurn) );
        return n;
    }

    show = (showAll = false) => {
        let i = 0;
        if (!showAll) {
            let i = Math.min(Memory.FutureTurn.length - 10, 0);
        }
        for (; i < Memory.FutureTurn.length; i++) {
            let FT = Memory.FutureTurn[i];
            console.log(`FT[${i}]=${JSON.stringify(FT)}`);
        }
    }
    /**
     * Cheks the Memory.FutureTurn[] to see if any commands are due for eval()
     * @return {number} Index of inserted future command for use in subsequent calls
     */
    check = () => {
        //console.log(`FutureCheck for ${Game.time} length=${Memory.FutureTurn.length}`);
        for (let t = 0; t < Memory.FutureTurn.length; t++) {
            if (Memory.FutureTurn[t].exeTick <= Game.time && Memory.FutureTurn[t].evalDone === undefined) {
                eval(Memory.FutureTurn[t].evalCmd);
                Memory.FutureTurn[t].evalDone = true;
                //console.log(`****** FutureCheck Eval|${Memory.FutureTurn[t].evalCmd}|=|${Memory.FutureTurn[t].evalDone}|`)
            }
        }
    }
}
