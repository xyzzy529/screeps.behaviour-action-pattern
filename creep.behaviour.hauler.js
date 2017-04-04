let mod = {};
module.exports = mod;
mod.name = 'hauler';
mod.run = function(creep) {
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if( creep.action == null || creep.action.name == 'idle' ) {
        this.nextAction(creep);
    }

    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
};
mod.nextAction = function(creep){
    if( creep.pos.roomName != creep.data.homeRoom && Game.rooms[creep.data.homeRoom] && Game.rooms[creep.data.homeRoom].controller ) {
        Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
        return;
    }
    const outflowPriority = [ // original: feed, charge, fuel
        Creep.action.fueling,
        Creep.action.feeding,
        Creep.action.charging,
    ];
    let priority = outflowPriority;
    if( creep.sum < creep.carryCapacity ) {  // removed creep.sum*2
        priority = [ // original: pick, uncharge
            Creep.action.picking,
            Creep.action.uncharging,
        ];
        Creep.action.withdrawing.debounce(creep, outflowPriority, function(withdrawing) {
            priority.push(withdrawing);
        });
        priority.push(Creep.action.reallocating);
        priority.push(Creep.action.idle);
    } else {
        priority = outflowPriority.concat([
            Creep.action.storing,
            Creep.action.building, // added so no idle
            Creep.action.upgrading, // added so no idle
            Creep.action.idle,
        ]);
        if ( creep.sum > creep.carry.energy ||
            ( !creep.room.situation.invasion &&
                SPAWN_DEFENSE_ON_ATTACK && creep.room.conserveForDefense && creep.room.relativeEnergyAvailable > 0.8)) {
            priority.unshift(Creep.action.storing);
        }
        if (creep.room.structures.urgentRepairable.length > 0 ) {
            priority.unshift(Creep.action.fueling);
        }
    }

    for(var iAction = 0; iAction < priority.length; iAction++) {
        var a = priority[iAction];
        if(a.isValidAction(creep) && a.isAddableAction(creep) && a.assign(creep)) {
            if (a.name !== 'idle') {
                creep.data.lastAction = a.name;
                creep.data.lastTarget = creep.target.id;
            }
            return;
        }
    }
};
