import Dummy from './dummy.js';

export default class DummyNoob {
	constructor(pfunc){
		this.name = "AnotherDummy";
		this.func = pfunc;
	}

	getName(){
		return this.name;
	}

	setTest(){
		this.func();
	}
}