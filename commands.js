// useful commands

<<<<<<< Updated upstream
console.log(JSON.stringify(Object) );
=======
Game.creeps['miner-250-3'].data.determinatedTarget ='source-mine-id'
>>>>>>> Stashed changes
// Recycle a creep
Creep.action.recycling.assign(Game.creeps['<creepName>']);

// flush road construction traces
_.forEach(Memory.rooms, r => delete r.roadConstructionTrace);

// remove all construction Sites
_.forEach(Game.constructionSites, s => s.remove());

// spawn something...
<<<<<<< Updated upstream
Game.spawns['Spawn1'].createCreepBySetup(Creep.setup.worker);
// or
Game.rooms['<roomName>'].spawnQueueLow.push({parts:[MOVE,WORK,CARRY],name:'max',setup:'worker'});
Game.spawns['E81N77'].spawnQueueLow.push({parts:[MOVE,MOVE,WORK,CARRY,CARRY,CARRY,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH], name:'max', setup:'melee'});

Game.spawns['Spawn1'].createCreep([MOVE,MOVE,WORK,CARRY,CARRY,CARRY,ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,TOUGH,TOUGH,TOUGH,TOUGH,TOUGH], 'max');


// clear spawn queues for a room
// clear low priority queue
Memory.rooms['W3S96'].spawnQueueLow = [0];
// clear medium priority queue
Memory.rooms['<roomName>'].spawnQueueMedium = [0];
// clear high priority queue
Memory.rooms['<roomName>'].spawnQueueHigh = [0];
=======
Game.spawns['Spawn1'].createCreepBySetup(Creep.setup.miner);
// or
Game.rooms['<roomName>'].spawnQueueHigh.push({parts:[MOVE,CARRY],name:'max',setup:'worker'});

// clear spawn queues for a room
// clear low priority queue
Memory.rooms['E81N77'].spawnQueueLow = [0];
Memory.rooms['E81N77'].spawnQueueLow.length;
// clear medium priority queue
Memory.rooms['E81N77'].spawnQueueMedium = [0];
Memory.rooms['E81N77'].spawnQueueMedium.length;
// clear high priority queue
Memory.rooms['E81N77'].spawnQueueHigh = [0];
Memory.rooms['E81N77'].spawnQueueHigh.length;
>>>>>>> Stashed changes

_myRoom = Memory.rooms['W3S96'];
console.log(_myRoom.spawnQueueLow.length,
_myRoom.spawnQueueMedium.length,
_myRoom.spawnQueueHigh.length);
// move Creep
Game.creeps['miner-250-3'].move(LEFT);

// Path moves (not persistant, must be issued each turn)
Game.creeps['worker-800-2'].moveTo(29,31,{visualizePathStyle: {fill:'transparent',stroke:'#fff',lineStyle:'dashed',strokeWidth: .15,opacity: .1}});

// force recycle a Creep
Game.creeps['<creepName>'].data.creepType="recycler";
Creep.action.recycling.assign(Game.creeps['<creepName>']);

<<<<<<< Updated upstream
// To override a module file create a copy of an existing module...
// Name it "custom.<originalModuleName>" or "viral.<originalModuleName>".
// see:
// Then call this method (without ".js"):
=======
// To override a module file create a copy of an existing module and name it "custom.<originalModuleName>". Then call this method (without ".js"):
>>>>>>> Stashed changes
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
