import Kernel from './kernel.js';
import Hardware from '../computer/hardware.js';
import Process from './process.js';
import BoundLink from './boundlink.js';

export default class OperatingSystem {

	constructor(memory, num_cores){
		//Core
		this.kernel = null;
		this.pidList = 1; //Initializing pid list.
		this.processPool = [];
		this.intervalProcessPool = null;

		//Specs
		this.specs = {
			nameOS: null,
			memoryUsage: null,
			kernel: {
				memoryUnused: null,
				memoryUsing: null
			}
		};

		//Hardware Specs
		this.hardware = new Hardware(memory, num_cores);
	}

	processDummy(memory){
		var newProcess = new Process(this.pidList, memory, this.hardware.processCore);
		newProcess.setDuration(this.getKernel().getMaxMemory());
		this.allocateProcess(newProcess);
	}

	installCrankshaft() {
		//Crankshaft Specs
		this.specs.nameOS = "Crankshaft";
		this.specs.memoryUsage = 350;

		//Installing Kernel
		this.kernel = new Kernel(this.hardware);
		
		//Allocate OS process
		var osProcess = new Process(this.pidList, this.specs.memoryUsage, this.hardware.processCore);
		osProcess.setProcessInfo({name: this.specs.nameOS, type: 'os'});
		this.allocateProcess(osProcess);

		//Initializes the process looping
		this.intervalProcessPool = setInterval(() => { this.loopProcessPool(); }, 1000);
	}

	loopProcessPool(){
		//Process run cycle
		for (var prc of this.processPool) {
			
			if (prc.getType() !== 'os') {
				if (!prc.isRunning() && this.hardware.useCore()) {
					prc.run();
				}
				console.log('done: ' + prc.processDone());
				if (prc.processDone()) {
					this.hardware.freeCore();
					this.deallocateProcess(prc);
				}
			}

		}
	}

	createProcess(name, type, sizeMem) {
		var newProcess = new Process(this.pidList, sizeMem, this.hardware.processCore);
		var prcInfo = {name: name, type: type};
		newProcess.setProcessInfo(prcInfo);

		return newProcess;
	}

	allocateProcess(objProcess){
		var memoryAllocate = this.getKernel().allocateMemory(objProcess.getMemory());

		if (memoryAllocate == true) {
			this.processPool.push(objProcess);
			this.pidList++;

			BoundLink.setData('VM', {type:'memory', action:'allocate-memory'});
			BoundLink.callReverse('VM');
		} else {
			console.log("error");
			BoundLink.setData('VM', {type:'memory', action:'error', error: memoryAllocate.error});
			BoundLink.callReverse('VM');
		}
	}

	deallocateProcess(objProcess) {
		var memoryDeallocate = this.getKernel().deallocateMemory(objProcess.getMemory());

		if(memoryDeallocate) {
			console.log(this.processPool.indexOf(objProcess));
			(() => {
				var pos = this.processPool.indexOf(objProcess);
				this.processPool.splice(pos, 1); //Removing process from pool
			})();
			BoundLink.setData('VM', {type:'memory', action:'allocate-memory'});
			BoundLink.callReverse('VM');
		} else {
			BoundLink.setData('VM', {type:'memory', action:'error', error: memoryAllocate.error});
			BoundLink.callReverse('VM');
		}
	}

	getSpecs() {
		this.specs.kernel.memoryUnused = this.kernel.getMemoryUnused();
		this.specs.kernel.memoryUsing = this.kernel.getUsingMemory();
		return this.specs;
	}

	getKernel(){
		return this.kernel;
	}

	getOS(){
		return this;
	}
}

module.exports = OperatingSystem;