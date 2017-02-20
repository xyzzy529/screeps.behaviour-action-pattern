class Queue {
	
	constructor(room) {
		if (typeof room === 'string') {
			room = Game.rooms[room];
		}
		if (!(room instanceof Room)) throw new Error('Not a room');
		this.room = room;
		this.roomName = this.room.name;
		this.initQueue();
	}
	
	initQueue() {
		if (_.isUndefined(this.room.memory.queue)) {
			this.room.memory.queue = [];
		}
	}
	
	/**
	 *
	 * @param baseCost Base cost of the task.
	 * @param creepWeight Creep weight.
	 * @param remote Whether or not this is for a remote room.
	 * @param targetDistance Distance to target. If remote, assume this is how many room it must travel through.
	 * @param creepInformation Normal creepDefinition that gets passed to the spawn.
	 */
	add(baseCost, creepWeight, remote, targetDistance, creepInformation) {
		let cost = baseCost;
		cost += creepWeight; // lighter creeps spawn first
		cost += remote ? targetDistance * 50 : targetDistance; // creeps closer to target spawn first
		this.room.memory.queue.push({cost, creepInformation}); // add the object to memory
		this.room.memory.queue = _.sortBy(this.room.memory.queue, 'cost'); // sort the queue by cost
	}
	
	get queue() {
		return this.room.memory.queue;
	}
	
}
module.exports = Queue;