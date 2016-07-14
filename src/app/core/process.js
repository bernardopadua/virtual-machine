export default class Process {
	constructor(pid, memory, speed){
		this.processInfo = {
			pid: pid,
			name: null,
			memory: memory,
			type: 'normal',
			duration: null,
			speed: speed,
			isDone: false,
			isRunning: false,
			lpProcess: null,
			callback: null
		}
	}

	run(){
		this.processInfo.isRunning = true;
		this.processInfo.lpProcess = setInterval(() => {

			this.processInfo.duration = this.processInfo.duration - this.processInfo.speed;
			this.processInfo.isDone = (this.processInfo.duration <= 0 ? true : false);
			
			if (this.processDone()) {
				if(this.processInfo.callback !== null) {
					this.processInfo.callback();
				}
				clearInterval(this.processInfo.lpProcess);
			}

		}, this.processInfo.speed*1000);
	}

	setDuration(maxMemory){
		this.processInfo.duration = ((maxMemory/this.processInfo.memory)/this.processInfo.speed);
	}

	setProcessInfo(objInfo) {
		this.processInfo = Object.assign(this.processInfo, objInfo);
	}

	getMemory() {
		return this.processInfo.memory;
	}

	processDone() {
		return this.processInfo.isDone;
	}

	getType() {
		return this.processInfo.type;
	}

	isRunning() {
		return this.processInfo.isRunning;
	}

	setCallbackProcessing(prcCallback){
		this.processInfo.callback = prcCallback;
	}
}