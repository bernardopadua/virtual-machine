
//module imports
import React from 'react';
import {render} from 'react-dom';

//app import
import VirtualMachine from './virtualmachine.js';

render(<VirtualMachine />, document.getElementById('app'));
/*

import DummyNoob from './dummynoob.js';

class TestSuite {
	constructor(){
		this.cc = 1;
	}

	run(){
		this.test = new DummyNoob(() => { this.go(); });
		this.cc = 2;
		this.test.setTest();
	}

	go(){
		console.log(this.cc);
	}

}

var a = new TestSuite();

a.run();*/