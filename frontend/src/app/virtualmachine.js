//VirtualMacine Core
import React from 'react';
import OperatingSystem from './core/OS.js';
import BoundLink from './core/boundlink.js';
import FileSystem from './core/filesystem.js';

//Components
import OsState from './components/os_state.js';
import VirtualFileSystem from './components/virtualfilesystem.js';
import Desktop from './components/desktop.js';
import ProcessMonitor from './components/process_monitor.js';
import TopMessage from './components/top_message';

//Default Software
import RawText from './softwares/rawtext.js';

//css
import './css/main.css';
import './css/grid_system.css';

class VirtualMachine extends React.Component {
	constructor(props){
		super(props);

        const token = (Object.hasOwn(props, "token")) ? props["token"] : '';

		this.state = {
			OS: null,
			eventMessage: null,
            token: token,
			vmSpecs: {
				memory: "1024",
				num_core:"1",
				os_code:"1"
			},
			components: {
				osState: null,
				processMonitor: null
			},
            ws: new WebSocket("ws://localhost:8081/init?token="+token),

            messageTop: ''
		};

        //Initializing websocket
        this.wsReconnects = {
            MAX_TRIES: 5,
            RECONNECTS: 0,
            TIME_ITERATION: 1000
        };
        this.iterateWsState();

		//Open communicating channel
		BoundLink.openChannel('VM', ()=>{this.openChannel();});
	}

    hideTopMessage(){
        setTimeout(() => {
            this.setState({messageTop: ''});
            console.log("STATE:: ", this.state);
        }, 2000);
    }
    
    iterateWsState() {
        setTimeout(() => {
            if(this.state.ws.readyState==1){
                this.state.ws.addEventListener("message", this.wsMessageRecv);
                this.setState({messageTop: 'asas'}, this.hideTopMessage);
                return;
            }

            if(this.wsReconnects.MAX_TRIES >= this.wsReconnects.RECONNECTS){
                this.setState({messageTop: 'asas2'}, this.hideTopMessage);
            } else if(this.state.ws.readyState==0){
                this.wsReconnects.RECONNECTS++;
                this.iterateWsState();
            }
        }, this.wsReconnects.TIME_ITERATION);
    }

    wsMessageRecv(data) {
        console.log(data);
    }

	openChannel() {
		var boundData = BoundLink.getData('VM');

		if (this.state.OS !== null) {
			
			//What action to take.
			if (boundData.type == 'memory') {
				if (boundData.action == 'allocate-memory') {
					this.state.components.osState = this.state.OS.getSpecs();
					this.state.components.processMonitor = this.state.OS.getProcessPool();
					this.setState(this.state.components);
				} 
				else if(boundData.action == 'error') {
					console.log(boundData.error);
				}

			} 
			else if (boundData.type == 'filesystem') {
				var allProcess = this.state.OS.createProcess(boundData.action+"--"+boundData.name, boundData.type, boundData.size);
				if (boundData.callback !== null) {
					allProcess.setCallbackProcessing(boundData.callback);
				}
				this.state.OS.allocateProcess(allProcess);
			}

			//Setting message to desktop event message
			if (boundData.type == 'event-message') {
				var defaultTime = this.state.eventMessage.timeMessage;
				this.state.eventMessage.timeMessage = (boundData.time === undefined ? defaultTime : boundData.time);
				this.state.eventMessage.message = boundData.data;
				this.state.eventMessage.type = 'to-user';
				this.state.eventMessage.callback();
			}

			//Open file
			if (boundData.type == 'open-file') {
				this.state.OS.automaticFileOpen(boundData.file);
			}

			if (boundData.type == 'process-monitor') {
				this.state.components.processMonitor = boundData.data;
				this.setState(this.state.components.processMonitor);
			}

		}

		//Setting event message object to desktop component
		if (boundData.type == 'desktop') {
			this.state.eventMessage = boundData.evtmsg;
			this.setState(this.state);
		}
	}

	//Installing default softwares
	installSoftwares(){
		var softRawText = new RawText();
		this.state.OS.installSoftware(softRawText);
	}

	render() {
		if (this.state.OS) {
			return (
			<div id="v-machine"> 
				<h1 className='color-change'>Virtual Machine - {this.state.components.osState.nameOS}</h1>
				<p> hello, world! :) </p> 
				<div> 
					<div id="os-monitors">
						<div style={{float:"left", width: "30%"}}>
							<label><h3>Virtual OsState</h3></label> 
							<OsState os={this.state.components.osState} />
						</div>
						<div style={{float:"left", width: "50%"}}>
							<label><h3>Process Monitor</h3></label> 
							<ProcessMonitor prcPool={this.state.components.processMonitor} />
						</div>
					</div> 
				</div>

				<div style={{clear:"both"}}>
					<ul id="vm-opts">
						<li> <button onClick={()=>{this.state.OS.processDummy(150);}}>OpenApp</button> </li>
						<li> <button onClick={(e)=>{this.installSoftwares(); e.target.parentNode.removeChild(e.target);}}>Install RawText</button> </li>
					</ul>
				</div>
				
				<div id="work-space">
					<div style={{float: "left", width: "30%"}}>
						<label><h3>Virtual Filesystem</h3></label> 
						<VirtualFileSystem eventMessage={this.state.eventMessage} />
					</div>
					<div style={{float: "left", width: "70%", overflow: "hidden"}}>
						<label><h3>Desktop</h3></label> 
						<Desktop eventMessage={this.state.eventMessage} />
					</div>
				</div> 
			</div>);
		}
		return (
			<div className='gcontainer'>
                <TopMessage message={this.state.messageTop} />
                <div className='gitem-a'>
                    Test
                </div>
                <div className='gitem-infront'>
                    <div className='smcontainer'>
                        <div className='smitem-one'>
                            111
                        </div>
                        <div className='smitem-one'>
                            222
                        </div>
                    </div>
                </div>
                <div className='gitem-processpoll'>
                    pool
                </div>
                <div className='gitem-window'>
                    {
                        //Component program
                    }
                </div>
                <div className='gitem-end' onClick={()=>{
                    console.log("test");
                    this.state.ws.send(JSON.stringify({dfdf:22}));
                }}>
                    
                </div>
            </div>
		);
        return (
            <div id="new-vm"> 
                <h1 className='color-change'>Virtual Machine - Not installed</h1> 
                <p> hello, world! :) </p> <br /> 
                <div> <label> Memory: </label> <input defaultValue={this.state.vmSpecs.memory} onChange={(e)=>{this.state.vmSpecs.memory = e.target.value;}} type='text' /> </div>
                <div> <label> NumCores: </label> <input defaultValue={this.state.vmSpecs.num_core} onChange={(e)=>{this.state.vmSpecs.num_core = e.target.value;}} type='text' /> </div>
                <div> <label> Operating System: </label> <input defaultValue={this.state.vmSpecs.os_code} onChange={(e)=>{this.state.vmSpecs.os_code = e.target.value;}} type='text' /> </div>
                <button onClick={() => this.setVirtualMachine()}> Make My Computer </button>
            </div>
        );
	}

	setVirtualMachine() {
		var tmpSpecs = this.state.vmSpecs;
		var tmpOS = new OperatingSystem(tmpSpecs.memory, tmpSpecs.num_core);
		
		//OS Installing
		tmpOS.installCrankshaft();

		//Installing filesystem
        //Will be removed in the refactorying
		FileSystem.buildVirtualSpace();

		//Rendering again
		this.state.OS = tmpOS;
		this.state.components.osState = tmpOS.getSpecs();
		this.state.components.processMonitor = tmpOS.getProcessPool();
		this.setState(this.state);
	}

	refreshComputer(){
		this.setState({OS: this.state.OS.getOS()});
	}
};

export default VirtualMachine;