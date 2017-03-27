const mod = new Creep.Behaviour('ranger');
module.exports = mod;
mod.run = function(creep) {
    creep.flee = creep.flee || !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK]);
    creep.attacking = false;
    creep.attackingRanged = false;
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if (!creep.action || creep.action.name === 'idle' ||
        (creep.action.name === 'guarding' &&
            (!creep.flag || creep.flag.pos.roomName === creep.pos.roomName || creep.leaveBorder())
        )
    ) {
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

    this.heal(creep);
};
mod.heal = function(creep){
    if( creep.data.body.heal !== undefined  &&  creep.hits < creep.hitsMax ){
        if( !(creep.attacking || creep.hits >= creep.data.coreHits) ) {
            creep.heal(creep);
        }
    }
};
mod.actions = (creep) => {
    return [
        Creep.action.defending,
        Creep.action.invading,
        Creep.action.guarding,
    ];
};
mod.strategies = {
    defaultStrategy: {
        name: `default-${mod.name}`,
        moveOptions: function(options) {
            // // allow routing in and through hostile rooms
            // if (_.isUndefined(options.allowHostile)) options.allowHostile = true;
            return options;
        }
    }
};
mod.selectStrategies = function(actionName) {
    return [mod.strategies.defaultStrategy, mod.strategies[actionName]];
};