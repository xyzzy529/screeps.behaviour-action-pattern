let mod = {};
module.exports = mod;
mod.segmentsChanged = true;
mod.numSaved = 0;
mod.activateSegments = () => {
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	let activeSegments = [];
	for (const id in Memory.activeSegments) {
		activeSegments.push(id);
	}
	RawMemory.setActiveSegments(activeSegments);
};
mod.activateSegment = (id) => {
	if (id < 0 || id > 99) return logError('RawMemory', 'cannot activate invalid segment ' + id);
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	const numActive = _.size(Memory.activeSegments);
	if (numActive >= 10) return logError('RawMemory', '10 segments loaded, cannot activate segment ' + id);
	if (mod.numSaved >= 10) return logError('RawMemory', '10 segments saved, cannot activate segment ' + id);
	if (numActive + mod.numSaved >= 10) return logError('RawMemory', 'combined loaded and saved exceeds limit(10), cannot activate segment ' + id);
	Memory.activeSegments[id] = true;
	mod.segmentsChanged = true;
};
mod.deactivateSegment = (id) => {
	if (id < 0 || id > 99) return logError('RawMemory', 'cannot deactivate invalid segment ' + id);
	if (_.isUndefined(Memory.activeSegments)) Memory.activeSegments = {};
	delete Memory.activeSegments[id];
	mod.segmentsChanged = true;
};
mod.cacheValid = (id) => {
	return global.cacheValid[id] === Memory.cacheValid[id];
};
mod.processSegment = (id, process) => {
	if (_.isUndefined(Memory.cacheValid[id])) Memory.cacheValid[id] = Game.time;
	const segment = RawMemory.segments[id];
	if (segment && !mod.cacheValid(id)) {
		process(JSON.parse(segment));
		global.cacheValid[id] = Memory.cacheValid[id];
	}
};
mod.processSegments = () => {
	if (_.isUndefined(global.cacheValid)) global.cacheValid = {};
	if (_.isUndefined(Memory.cacheValid)) Memory.cacheValid = {};

	mod.processSegment(MEM_SEGMENTS.COSTMATRIX_CACHE, Room.loadCostMatrixCache);
};
mod.saveSegment = (id, data) => {
	const numActive = _.size(Memory.activeSegments);
	if (Memory.activeSegments[id] || numActive + mod.numSaved < 10) {
		RawMemory.segments[id] = JSON.stringify(data);
		Memory.cacheValid[id] = Game.time;
		mod.numSaved++;
	} else if (numActive >= 10) {
		// TODO: also defer?
		return logError('RawMemory', 'cannot save segment ' + id + ' too many active segments.');
	} else if (numActive + mod.numSaved >= 10) {
		// TODO: defer one tick?
		return logError('RawMemory', 'cannot save segment ' + id + ' loaded + saved exceeds limit(10).');
	} else {
		logError('RawMemory', 'should not be here.');
	}
};
mod.cleanup = () => {
	if (mod.segmentsChanged) mod.activateSegments();
	mod.numSaved = 0;
	mod.segmentsChanged = false;
};