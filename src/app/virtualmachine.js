//VirtualMacine Core
import React from 'react';
import OperatingSystem from './core/OS.js';
import BoundLink from './core/boundlink.js';
import FileSystem from './core/filesystem.js';

//Components
import OsState from './components/os_state.js';
import VirtualFileSystem from './components/virtualfilesystem.js';

class VirtualMachine extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			OS: null,
			vmSpecs: {
				memory: "1024",
				num_core:"1",
				os_code:"1"
			},
			components: {
				osState: null
			}
		};

		BoundLink.openChannel('VM', ()=>{this.openChannel();});
	}

	openChannel(){
		console.log("message received");
		if (this.state.OS !== null) {

			//What action to take.
			var boundData = BoundLink.getData('VM');
			if (boundData.type == 'memory') {

				if (boundData.action == 'allocate-memory') {
					this.setState({components: { osState: this.state.OS.getSpecs() }});
				} 
				else if(boundData.action == 'error') {
					console.log(boundData.error);
				}

			} else if (boundData.type == 'filesystem') {
				var allProcess = this.state.OS.createProcess(boundData.action+"|"+boundData.name, boundData.type, boundData.size);
				if (boundData.callback !== null) {
					allProcess.setCallbackProcessing(boundData.callback);
				}
				this.state.OS.allocateProcess(allProcess);
			}
		}
	}

	render() {
		if (this.state.OS) {
			return (
			<div id="v-machine"> 
				<h1>Virtual Machine - {this.state.components.osState.nameOS}</h1>
				<p> hello, world! :) </p> 
				<div> 
					<label><h3>Virtual OsState</h3></label> 
					<div id="os-state">
						<OsState os={this.state.components.osState} />
					</div> 
				</div>

				<div> <button onClick={()=>{this.state.OS.processDummy(150);}}>OpenApp</button></div>
				
				<div> 
					<label><h3>Virtual Filesystem</h3></label> 
					<div id="work-space">
						<VirtualFileSystem />
					</div> 
				</div>
			</div>);
		}
		return (
			<div id="new-vm"> 
				<h1>Virtual Machine - Not installed</h1> 
				<p> hello, world! :) </p> <br /> 
				<div> <label> Memory: </label> <input defaultValue={this.state.vmSpecs.memory} onChange={(e)=>{this.state.vmSpecs.memory = e.target.value;}} type='text' /> </div>
				<div> <label> NumCores: </label> <input defaultValue={this.state.vmSpecs.num_core} onChange={(e)=>{this.state.vmSpecs.num_core = e.target.value;}} type='text' /> </div>
				<div> <label> Operating System: </label> <input defaultValue={this.state.vmSpecs.os_code} onChange={(e)=>{this.state.vmSpecs.os_code = e.target.value;}} type='text' /> </div>
				<button onClick={() => this.setComputer()}> Make My Computer </button>
			</div>
		);
	}

	setComputer() {
		var tmpSpecs = this.state.vmSpecs;
		var tmpOS = new OperatingSystem(tmpSpecs.memory, tmpSpecs.num_core);
		
		//OS Installing
		tmpOS.installCrankshaft();

		//Installing filesystem
		FileSystem.buildVirtualSpace();

		//Rendering again
		this.setState({OS: tmpOS, components: {osState: tmpOS.getSpecs()}});
	}

	refreshComputer(){
		this.setState({OS: this.state.OS.getOS()});
	}
};

module.exports = VirtualMachine;