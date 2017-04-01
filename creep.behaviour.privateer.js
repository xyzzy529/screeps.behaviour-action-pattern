let mod = {};
module.exports = mod;
mod.name = 'privateer';
mod.run = function(creep) {
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if( creep.action === null  || creep.action.name == 'idle' ) {
        if( creep.data.destiny && creep.data.destiny.task && Task[creep.data.destiny.task] && Task[creep.data.destiny.task].nextAction )
        Task[creep.data.destiny.task].nextAction(creep);
                    
        else this.nextAction(creep);
    }
    
    // Do some work
    if( creep.action && creep.target ) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
    if( creep.hits < creep.hitsMax ) { // creep injured. move to next owned room
        if (!creep.data.nearestHome || !Game.rooms[creep.data.nearestHome]) creep.data.nearestHome = Room.bestSpawnRoomFor(creep.pos.roomName);
        if (creep.data.nearestHome) {
            Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
            return;
        }
    }
};
mod.nextAction = function(creep){
    let carrySum = creep.sum;
    // at home
    if( creep.pos.roomName == creep.data.homeRoom ){
        // carrier filled
        if( carrySum > 0 ){
            let deposit = []; // deposit energy in...
            // links?
            if( creep.carry.energy == carrySum ) deposit = creep.room.structures.links.privateers;
            // storage?
            if( creep.room.storage ) deposit.push(creep.room.storage);
            // containers?
            if( creep.room.structures.container ) deposit = deposit.concat( creep.room.structures.container.privateers );
            // Choose the closest
            if( deposit.length > 0 ){
                let target = creep.pos.findClosestByRange(deposit);
                if( target.structureType == STRUCTURE_STORAGE && Creep.action.storing.assign(creep, target) ) return;
                else if(Creep.action.charging.assign(creep, target) ) return;
            }
            //if( Creep.action.storing.assign(creep) ) return;
            if( Creep.action.charging.assign(creep) ) return;
            if( !creep.room.ally && Creep.action.storing.assign(creep) ) return;
            Creep.behaviour.worker.nextAction(creep);
            return;
        }
        // empty
        // travelling
        if( this.exploitNextRoom(creep) )
            return;
        else {
            // no new flag
            // behave as worker
            Creep.behaviour.worker.nextAction(creep);
            return;
        }
    }
    // not at home
    else {
        // at target room
        if( creep.flag && creep.flag.pos.roomName == creep.pos.roomName ){
            // check invader/cloaking state
            if( creep.room.situation.invasion && !creep.flag.compareTo(FLAG_COLOR.invade.robbing)) {
                creep.flag.cloaking = 50; // TODO: set to Infinity & release when solved
                this.exploitNextRoom(creep);
                return;
            }

            // get some energy
            if( creep.sum < creep.carryCapacity*0.4 ) {
                // sources depleted
                if( creep.room.sourceEnergyAvailable === 0 ){
                    // cloak flag
                    creep.flag.cloaking = _.max([creep.room.ticksToNextRegeneration-20,0]); // approach a bit earlier
                    // travelling
                    this.exploitNextRoom(creep);
                    return;
                }
                // energy available
                else {
                    // harvesting or picking
                    var actions = [
                        Creep.action.dismantling,
                        Creep.action.picking,
                        Creep.action.robbing,
                        Creep.action.harvesting
                    ];
                    // TODO: Add extracting (if extractor present) ?
                    for(var iAction = 0; iAction < actions.length; iAction++) {
                        var action = actions[iAction];
                        if(action.isValidAction(creep) &&
                            action.isAddableAction(creep) &&
                            action.assign(creep))
                            return;
                    }
                    // no targets in current room
                    creep.flag.cloaking = 50;
                    this.exploitNextRoom(creep);
                    return;
                }
            }
            // carrier full
            else {
                var actions = [Creep.action.building];
                for(var iAction = 0; iAction < actions.length; iAction++) {
                    var action = actions[iAction];
                    if(action.isValidAction(creep) &&
                        action.isAddableAction(creep) &&
                        action.assign(creep))
                        return;
                }
                Population.registerCreepFlag(creep, null);
                Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
                return;
            }
        }
        // not at target room
        else {
                this.exploitNextRoom(creep);
                return;
        }
    }
    // fallback
    Creep.action.idle.assign(creep);
};
mod.exploitNextRoom = function(creep){
    if( creep.sum < creep.carryCapacity*0.4 ) {
        // calc by distance to home room
        let validColor = flagEntry => (
            Flag.compare(flagEntry, FLAG_COLOR.invade.exploit) || Flag.compare(flagEntry, FLAG_COLOR.invade.robbing)
        );
        let flag = FlagDir.find(validColor, new RoomPosition(25, 25, creep.data.homeRoom), false, FlagDir.exploitMod, creep.name);
        // new flag found
        if( flag ) {
            // travelling
            if( Creep.action.travelling.assignRoom(creep, flag.pos.roomName) ) {
                Population.registerCreepFlag(creep, flag);
                return true;
            }
        }
    }
    // no new flag
    // go home
    Population.registerCreepFlag(creep, null);
    if (creep.room.name !== creep.data.homeRoom) {
        Creep.action.travelling.assignRoom(creep, creep.data.homeRoom);
    }
    return false;
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // // allow routing in and through hostile rooms
            // if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    },
    withdrawing: {
        name: `withdrawing-${mod.name}`,
        isValidAction: function(creep) {
            return false;
        },
    },
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};
