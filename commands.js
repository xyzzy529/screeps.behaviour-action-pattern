// useful commands

// ***** TODO ideas ******
DRIVE_BY_REPAIR_RANGE: 2, // change from box search to line in front, then keep location as it passes
//Add displays to Browser instead of browser console window.

console.log(JSON.stringify(Object) );

Game.creeps['miner-250-3'].data.determinatedTarget ='source-mine-id'

// Recycle a creep
Creep.action.recycling.assign(Game.creeps[Memory._creep]);
Creep.action.upgrading.assign(Game.creeps['defender-58f4e7bab96226e2355e7209-1']);
Creep.action.healing.assign(Game.creeps['guard-W3S97g3-1']);


// healer
Game.creeps['guard-W3S97g3-1'].heal(Game.creeps['hauler-650-1']);
Game.creeps['guard-W3S97g1-1'].heal(Game.creeps['guard-W3S97g2-1']);
Game.creeps['guard-W3S97g3-1'].heal(Game.creeps['guard-W3S97g2-1']);

// flush road construction traces
_.forEach(Memory.rooms, r => delete r.roadConstructionTrace);

// remove all construction Sites
_.forEach(Game.constructionSites, s => s.remove());

// spawn something...
Game.spawns['Spawn3'].createCreepBySetup(Creep.setup.upgrader);
Game.spawns['Spawn1'].createCreepBySetup(Creep.setup.worker);
Game.spawns['Spawn3'].createCreepBySetup(Creep.setup.ranger);
Game.spawns['Spawn3'].createCreepBySetup(Creep.setup.defender);
// or
Game.rooms['<roomName>'].spawnQueueLow.push({parts:[MOVE,WORK,CARRY],name:'max',setup:'worker'});
Game.rooms['W3S96'].spawnQueueHigh.push({parts:[
  TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,
  RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,RANGED_ATTACK,
  MOVE,MOVE,MOVE
], name:'max', setup:'ranger'});

Game.spawns['Spawn3'].createCreep([
    RANGED_ATTACK,
    MOVE,
], 'max');
CARRY,CARRY,CARRY,CARRY,CARRY,CARRY,
WORK,WORK,WORK,
ATTACK,ATTACK,ATTACK,ATTACK,ATTACK,
TOUGH,TOUGH,TOUGH,TOUGH,TOUGH,

console.log(JSON.stringify(
  Game.rooms['W3S96'].spawnQueueLow.forEach(function (s) {console.log(s.name)});
);
Game.rooms['W3S96'].spawnQueueLow
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
Game.creeps[Memory._creep].move(2);
Game.creeps['worker-1200-1'].move(LEFT); // Temp for just 1 tick
Game.creeps[Memory._creep].data.determinatedSpot.x = 37;
Game.creeps[Memory._creep].data.determinatedSpot.y = 41;
Game.creeps['remoteHauler-W2S96gb-4'].data.determinatedSpot
// Path moves (not persistant, must be issued each turn)
Game.creeps['worker-800-2'].moveTo(29,31,{visualizePathStyle: {fill:'transparent',stroke:'#fff',lineStyle:'dashed',strokeWidth: .15,opacity: .1}});
Util.Future.cmd(+1,"Game.creeps['remoteHauler-W2S96gb-4'].data.idlePath[0] = {x:47, Y:14, roomName: 'W3S96'};");
Util.Future.cmd(+1,"myDump(Game.creeps['remoteHauler-W2S96gb-4'].data.idlePath[0])");

let cmdTxt;
cmdTxt='';
cmdTxt += "Memory._myTest = Game.rooms;";
cmdTxt += "console.log('_myTest=',memoryUsage(Memory._myTest));";
Util.Future.cmd(+1,cmdTxt);

// force recycle a Creep
Game.creeps['<creepName>'].data.creepType="recycler";
Creep.action.recycling.assign(Game.creeps['reserver-Flag2-1']);
Creep.action.building.assign(Game.creeps['remoteMiner-W4S96-SK-1']);
Creep.action.upgrading.assign(Game.creeps['upgrader-650-2']);

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

// Market commands
Game.market.calcTransactionCost(1000, 'W3S96', 'W43N44');
Game.market.credits
Game.market.deal('58ee0276cf50f151570784bf', 101, "W3S96");
JSON.stringify(Game.rooms.W3S96.terminal.store);

OrderIS='5870578777b3f51f3c6db301';
OrdAmount = ;
OrdDest = ;
Game.market.calcTransactionCost(max(1000,OrdAmount),'W3S96',OrdDest);

// Arbitrage model
// Buy cost delivered to ME
// getAllOrders
allSellOrders = Game.market.getAllOrders({type: ORDER_SELL, resourceType: RESOURCE_HYDROGEN});
allBuyOrders = Game.market.getAllOrders({type: ORDER_BUY, resourceType: RESOURCE_HYDROGEN});
let allBuySort = _.sortBy(allBuyOrders, 'price');
for (let i=0; i<allBuySort.length; i++) {
  for (let j=0; j<allSellSort.length; j++ ) {
    if (allBuySort[i].price > allSellOrders[j].price) {
      trxAmount = Math.min(allBuySort[i].remainingAmount, allSellOrders[j].remainingAmount);
      buyTrxCost = Game.market.calcTransactionCost(trxAmount, 'W3S96', allBuySort[i].roomName);
      sellTrxCost = Game.market.calcTransactionCost(trxAmount, 'W3S96', allSellOrders[j].roomName);
      TotalTrxCost = buyTrxCost + sellTrxCost;
      CreditsEarned = (allBuySort[i].price - allSellOrders[j].price) * trxAmount;
      EnergyCostPer = TotalTrxCost/CreditsEarned;
      console.log(`Buy[${i}]@${allBuySort[i].price} to Sell[${j}]@${allSellOrders[j].price} TrxEnergy=${TotalTrxCost} Credits=${CreditsEarned} E/C=${EnergyCostPer}`);
    }
  }
}
console.log(allSellOrders.length, allBuyOrders.length);
//
let buyOrder = Game.market.getOrderById(testOrderId);

let buyTrxCost = Game.market.calcTransactionCost(1000, 'W3S96', buyOrder.roomName);
Game.market.createOrder(ORDER_BUY, RESOURCE_GHODIUM, 0.01, 100, "W3S96");
Game.market.calcTransactionCost(1000, 'E32N33', 'E32S78');
Game.rooms.W3S96.terminal.store[RESOURCE_ENERGY];

Memory._allSellSort = Game.market.getAllOrders({type: ORDER_SELL, resourceType: "O"});
Memory._allBuySort = Game.market.getAllOrders({type: ORDER_BUY, resourceType: "O"});
let mBBT = 0;
for (let b = 0; b < Memory._allBuySort.length; b++) {
    let aBSp = Memory._allBuySort[b].price;
    if (mBBT < aBSp) {
        mBBT = aBSp;
    }
}
Memory._mBBT = mBBT;

let mSBT = Infinity;
for (let s = 0; s < Memory._allSellSort.length; s++) {
    let aSSp = Memory._allSellSort[s].price;
    if (mSBT > aSSp) {
        mSBT = aSSp;
    }
}
Memory._mSBT = mSBT;

mSBT = Memory._mSBT;
Memory._allBuySort = Memory._allBuySort.filter(idx => idx.price >= mSBT);
mBBT = Memory._mBBT;
Memory._allSellSort = Memory._allSellSort.filter(idx => idx.price <= mBBT);
console.log(Memory._allBuySort.length, Memory._allSellSort.length )

let startCpu; let startDate; let endCpu; let endDate; let x;
startCpu = Game.cpu.getUsed();
startDate = Date.now();
x = 0;
for (let i=0; i<80; i++) {
  x = Game.cpu.getUsed();
}
endCpu = Game.cpu.getUsed();
endDate = Date.now();
console.log(`deltaCpu ${startCpu} & ${endCpu}=${endCpu-startCpu}`);
console.log(`deltaDate ${startDate} & ${endDate}=${endDate-startDate}`);

// move between rooms.
Game.rooms['W3S97'].terminal.send("energy", 257, 'W3S96','xfer to main');

// test problem
let memoryTerminalRecord = Game.rooms['W3S96'].memory.statistics.terminal;
let currentTerminalRecord = Game.rooms['W3S96'].terminal.store;
for( let type in memoryTerminalRecord ) {
    try {
        testText = currentTerminalRecord[type].toLocaleString();
        console.log(`Terminal Store[${type}]=${testText}`);
    } catch (e) {
        console.log(`Terminal Store[${type}]=** ERROR **`);
    }
}
Memory.my.xcreep = '';
Util.Future.cmd(1,`_storage=Game.getObjectById('58f6f86792bbcbb76cd89f67'); Game.creeps[${Memory.my.xcreep}].moveTo(_storage)`,true,5);
storage=Game.getObjectById('58f6f86792bbcbb76cd89f67'); creep=Game.creeps['upgrader-1000-3']; creep.withdraw(storage, RESOURCE_ENERGY);
Util.Future.cmd(1,"Game.creeps['upgrader-1000-3'].moveTo(28,33)",true,10)
Util.Future.cmd(1,"creep=Game.creeps['upgrader-1000-3']; creep.upgradeController(creep.room.controller);",true,10);

// Structures around the edge
Game.rooms[roomName].find(FIND_STRUCTURES, {filter:i=>i.pos.x===0||i.pos.x===49||i.pos.y===0||i.pos.y===49})

// Engine code with some "hidden variables"
// 
// Engine code for Cost Matrix
https://github.com/screeps/engine/blob/c318a920e3c04c1285c885e328d89ef748d7004c/src/game/rooms.js#L58
