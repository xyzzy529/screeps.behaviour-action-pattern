// useful commands

console.log(JSON.stringify(Object) );

Game.creeps['miner-250-3'].data.determinatedTarget ='source-mine-id'

// Recycle a creep
Creep.action.recycling.assign(Game.creeps['<creepName>']);

// flush road construction traces
_.forEach(Memory.rooms, r => delete r.roadConstructionTrace);

// remove all construction Sites
_.forEach(Game.constructionSites, s => s.remove());

// spawn something...
Game.spawns['Spawn1'].createCreepBySetup(Creep.setup.upgrader);
Game.spawns['Spawn1'].createCreepBySetup(Creep.setup.worker);
// or
Game.rooms['<roomName>'].spawnQueueLow.push({parts:[MOVE,WORK,CARRY],name:'max',setup:'worker'});
Game.spawns['E81N77'].spawnQueueLow.push({parts:[MOVE,MOVE,WORK,CARRY,CARRY,CARRY,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH], name:'max', setup:'melee'});

Game.spawns['Spawn1'].createCreep([MOVE,MOVE,WORK,CARRY,CARRY,CARRY,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH], 'max');


// clear spawn queues for a room
// clear low priority queue
Memory.rooms['W3S96'].spawnQueueLow = [0];
// clear medium priority queue
Memory.rooms['W3S96'].spawnQueueMedium = [0];
// clear high priority queue
Memory.rooms['W3S96'].spawnQueueHigh = [0];
Memory.rooms['W3S96'].spawnQueueLow.length;
Memory.rooms['W3S96'].spawnQueueMedium.length;
Memory.rooms['W3S96'].spawnQueueHigh.length;

// length of spawnQueue's
_myRoom = Memory.rooms['W3S96'];
console.log(_myRoom.spawnQueueLow.length,
_myRoom.spawnQueueMedium.length,
_myRoom.spawnQueueHigh.length);

// move Creep
Game.creeps['<creepName>'].move(RIGHT);
Game.creeps['upgrader-1000-2'].move(LEFT); // Temp for just 1 tick
Game.creeps['upgrader-1000-2'].data.determinatedSpot.x = 10;
Game.creeps['upgrader-1000-2'].data.determinatedSpot.y = 26;

// Path moves (not persistant, must be issued each turn)
Game.creeps['worker-800-2'].moveTo(29,31,{visualizePathStyle: {fill:'transparent',stroke:'#fff',lineStyle:'dashed',strokeWidth: .15,opacity: .1}});

// force recycle a Creep
Game.creeps['<creepName>'].data.creepType="recycler";
Creep.action.recycling.assign(Game.creeps['<creepName>']);

// To override a module file create a copy of an existing module...
// Name it "custom.<originalModuleName>" or "viral.<originalModuleName>".
// see:
// Then call this method (without ".js"):
getPath('<originalModuleName>', true);
getPath('viral.creep.setup.upgrader', true);

// To completely re-evaluate all modules:
delete Memory.modules;

// create market order (replace [roomName] with target room or remove it for subscription tokens)
Game.market.createOrder(type, resourceType, price, totalAmount, roomName);

//accept market sell or buy order
Game.market.deal(orderId, amount, roomName);

//flush visuals heatmap
_.forEach(Memory.rooms, r => delete r.heatmap);

// https://github.com/ScreepsOCS/screeps.behaviour-action-pattern/wiki/Resource-Management
//resource management  - stat labs
Game.rooms['<roomName>'].placeReactionOrder('<labId>', '<resourceId>', '<amount>');

//resource management - maintain set amount in container
Game.rooms['<roomName>'].setStore('<structure>', '<resource>', '<amount>');

//resource management - one off amount in container
Game.rooms['<roomName>'].placeOrder('<structure>', '<resource>', '<amount>');

// ***** ToDo ideas ******
DRIVE_BY_REPAIR_RANGE: 2, // change from box search to line in front, then keep location as it passes
//Add displays to Browser instead of browser console window.
