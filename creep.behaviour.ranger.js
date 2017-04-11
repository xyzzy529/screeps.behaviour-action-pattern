let mod = {};
module.exports = mod;
mod.name = 'ranger';
mod.run = function(creep) {
    creep.flee = creep.flee || !creep.hasActiveBodyparts([ATTACK, RANGED_ATTACK]);
    creep.attacking = false;
    creep.attackingRanged = false;
    // Assign next Action
    let oldTargetId = creep.data.targetId;
    if (!creep.action || creep.action.name === 'idle' || (creep.action.name === 'guarding' && (!creep.flag || creep.flag.pos.roomName === creep.pos.roomName || creep.leaveBorder()))) {
        if (creep.data.destiny && creep.data.destiny.task && Task[creep.data.destiny.task] && Task[creep.data.destiny.task].nextAction)
            Task[creep.data.destiny.task].nextAction(creep);
        else
            this.nextAction(creep);
        }

    // Do some work
    if (creep.action && creep.target) {
        creep.action.step(creep);
    } else {
        logError('Creep without action/activity!\nCreep: ' + creep.name + '\ndata: ' + JSON.stringify(creep.data));
    }
    this.heal(creep);
};
mod.heal = function(creep) { // Does NOT move to healTarget TODO
    if (creep.data.body.heal !== undefined && !creep.attacking) {
        if (creep.hits < creep.hitsMax) { // am I bleading?
            //console.log(`Heal-self from ${creep.name}.heal(${creep.name})`);
            creep.heal(creep); // self-heal
        } else { // heal creep if close
            if (creep.room.casualties.length > 0) {
                for (let i = 0; i < creep.room.casualties.length; i++) {
                    let healTarget = creep.room.casualties[i];
                    range = creep.pos.getRangeTo(healTarget);
                    if (range <= 1) {
                        //console.log(`Heal-near from ${creep.name}.heal(${healTarget.name})`);
                        creep.heal(healTarget);
                        continue;
                    } else if (range <= 3) {
                        //console.log(`Heal-range from ${creep.name}.heal(${healTarget.name})`);
                        creep.rangedHeal(healTarget);
                        continue;
                    }
                }
            }
        }
    }
};
mod.nextAction = function(creep) {
    let priority = [Creep.action.defending, Creep.action.invading, Creep.action.guarding, Creep.action.idle];
    for (var iAction = 0; iAction < priority.length; iAction++) {
        var action = priority[iAction];
        if (action.isValidAction(creep) && action.isAddableAction(creep) && action.assign(creep)) {
            return;
        }
    }
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
