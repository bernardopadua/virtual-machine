//VirtualMacine Core
import React from 'react';
import Operations from './core/operations_constants';
import TProgs from './core/programs_constants';

//Components
import ProcessMonitor from './components/process_monitor.js';
import TopMessage from './components/top_message';
import ExplorerFilesystem from './components/explorer_fs';

//Default Software
import RawTextEditor from './softwares/rawtexteditor';

//css
import './css/main.css';
import './css/grid_system.css';

class VirtualMachine extends React.Component {
	constructor(props){
		super(props);

        const token     = (Object.hasOwn(props, "token")) ? props["token"] : '';
        const logoutUrl = props.logoutUrl;

        const envObj    = Object(process.env);

        const wsServer  = envObj.WSSERVER_H;
        const wsPort    = envObj.WSSERVER_P;

		this.state = {
			//legacy
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
            //end legacy

            ws: new WebSocket(`ws://${wsServer}:${wsPort}/init?token=`+token),

            //alert message on top
            messageTop: '',
            typemsg: '',
            timeVanish: 2000,

            //programs
            programs: [], //installed
            programsOpen: {}, //holds the component

            //functionalities of "OS"
            startButtonOpen: false
		};

        //Initializing websocket
        this.wsReconnects = {
            MAX_TRIES: 5,
            RECONNECTS: 0,
            TIME_ITERATION: 1000,
            connected: false,
            logoutUrl: logoutUrl
        };
        this.iterateWsState();

        //binds
        this.backgroundClickHandler = this.backgroundClickHandler.bind(this);
	}

    hideTopMessage(){
        setTimeout(() => {
            this.setState({messageTop: '', typemsg: '', timeVanish: 2000});
        }, this.state.timeVanish);
    }
    
    iterateWsState() {
        setTimeout(() => {
            if(this.state.ws.readyState==1){
                this.state.ws.addEventListener("message", this.wsMessageRecv.bind(this));
                this.state.ws.addEventListener("close", this.wsClosed.bind(this));
                this.wsReconnects.connected = true;

                this.connectedWsCallback();
                return;
            }

            if(this.wsReconnects.MAX_TRIES >= this.wsReconnects.RECONNECTS && this.state.ws.readyState!=0){
                this.setState({messageTop: 'There is a problem with connection, please try login again.\nRedirecting to logout...'}, this.hideTopMessage);
                setTimeout(() => {
                    window.location = this.wsReconnects.logoutUrl;    
                }, 2000);
            } else if(this.state.ws.readyState==0){
                this.wsReconnects.RECONNECTS++;
                this.iterateWsState();
            }
        }, this.wsReconnects.TIME_ITERATION);
    }

    connectedWsCallback(){
        //get installed programs
        this.wsSendMessage({operation: Operations.LISTPROGS})
    }

    wsMessageRecv(messageEvent) {
        const ndata = JSON.parse(messageEvent.data);
        switch (ndata.operation) {
            //#>
            case Operations.OPENFILE:
                if(ndata.contents.program !== null){
                    const program = ndata.contents.program.program;
                    const pid     = ndata.contents.program.pid;
                    //if-else programs
                    if(program == TProgs.rwt){
                        const fileContents = ndata.contents.file.fileContents;
                        const filePath     = ndata.contents.file.filePath;
                        this.setState({
                            programsOpen: {
                                ...this.state.programsOpen,
                                [pid]: {
                                    pid: pid,
                                    program: program,
                                    component: RawTextEditor,
                                    fileContents: fileContents,
                                    filePath: filePath
                                }
                            }
                        }); 
                    }
                }
                break;
            
            //#>
            case Operations.SAVEEXFILE:
                const pid     = ndata.contents.pid;    
                const cpObject= Object.assign({}, this.state.programsOpen);
                
                delete cpObject[pid];

                this.setState({programsOpen: cpObject});
                break;

            //#>
            case Operations.MSGTOP:
                if(Object.hasOwn(ndata, 'typemsg')){
                    this.setState({messageTop: ndata.message, typemsg: ndata.typemsg, timeVanish: 4000}, this.hideTopMessage);
                } else {
                    this.setState({messageTop: ndata.message, timeVanish: 4000}, this.hideTopMessage);
                }
                break;
            
            //#>
            case Operations.LISTPROGS:
                const c = ndata.contents;
                if(c !== '')
                    this.setState({programs: [...this.state.programs, ...c]});
                break;
            default:
                break;
        }
    }

    wsSendMessage(data) {
        this.state.ws.send(JSON.stringify(data));
    }

    wsClosed(e){
        this.setState({messageTop: 'There is a problem with connection, please try login again.\nRedirecting to logout...'}, this.hideTopMessage);
        setTimeout(() => {
            window.location = this.wsReconnects.logoutUrl;    
        }, 2000);
    }

    backgroundClickHandler(e){
        //check start menu
        if(this.state.startButtonOpen)
            this.setState({startButtonOpen: false});
    }

	render() {
		//installed programs
        const rwtInstalled = this.state.programs.some((o)=>{
            return o.progName === TProgs.rwt;
        });

		return (
			<div className='gcontainer' onClick={this.backgroundClickHandler}>
                <TopMessage message={this.state.messageTop} typemsg={this.state.typemsg} />
                <div className='gitem-a'>
                    Test
                </div>
                <div className='gitem-infront'
                    style={{display: (this.state.startButtonOpen) ? '' : 'none'}}
                >
                    <div className='smcontainer-flex'>
                        {(!rwtInstalled) &&
                            <div className='smitem-flex'
                                onClick={()=>{
                                    this.wsSendMessage({tt:22});
                                }}    
                            >
                                install
                            </div>
                            ||
                            <div className='smitem-flex'
                                onClick={()=>{
                                    this.wsSendMessage({tt:22});
                                }}    
                            >
                                install2
                            </div>
                        }
                        <div className='smitem-flex'>
                            Browser
                        </div>
                    </div>
                </div>
                <div className='gitem-processpoll'>
                    <ProcessMonitor ws={this.state.ws} />
                </div>
                <div className='gitem-window'>
                    <ExplorerFilesystem ws={this.state.ws} 
                        createFile={rwtInstalled}
                    />
                </div>
                <div className='gitem-window-second'>
                    <div className='gitem-programs-flex'>
                        {Object.keys(this.state.programsOpen).map((key, i) => {
                            const pG = this.state.programsOpen[key];
                            const Component = pG.component;
                            return (
                                <div key={i} className='program-flex-item'>
                                    <Component 
                                        objectProgram={pG} 
                                        ws={this.state.ws}
                                    />
                                </div>
                            )
                        })}
                    </div>
                </div>
                <div className='gitem-end'
                    onClick={()=>{
                        this.setState({startButtonOpen: !this.state.startButtonOpen});
                    }}
                >
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
		
		//OS Installing
		tmpOS.installCrankshaft();

		//Installing filesystem
        //Will be removed in the refactorying

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