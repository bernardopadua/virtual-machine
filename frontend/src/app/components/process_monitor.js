import React from 'react';
import Operations from '../core/operations_constants';

export default class ProcessMonitor extends React.Component {
	constructor(props){
		super(props);
        
        this.state = {
            process: []
        };

        /**
         * @type {WebSocket}
         */
        this.ws = props.ws;
        
        this.tries = 0;
        this.MAX_TRIES = 2;
        
        this.ws.addEventListener("message", this.wsMessageRecv.bind(this));
        this.grabProcesses();
	}

    grabProcesses(){
        setTimeout(() => {
            this.ws.send(
                JSON.stringify({
                    operation: Operations.LISTPROC
                })
            );
            if(this.tries <= this.MAX_TRIES){
                this.grabProcesses();
                this.tries += 1;
            }
        }, 1000);
    }

    wsMessageRecv(messageEvent){
        const ndata = JSON.parse(messageEvent.data);
        switch (ndata.operation) {
            case Operations.LISTPROC:
                this.state.process = [];
                const c = ndata.contents    
                for (const i in ndata.contents){
                    this.state.process.push(JSON.parse(c[i]));
                }
                this.forceUpdate();
                break;
            default:
                break;
        }
    }

	render(){
		/*var processes = this.props.prcPool.map((prc)=>{
			return (
				<Process process={prc} key={prc.processInfo.pid} />
			);
		});*/

		return (
			<div className="os-state">
				<ul>
					{this.state.process.map((obj, i) => {
                        return <Process process={obj} key={obj.pid} />
                    })}
				</ul>
                <button type='button' onClick={()=>{
                    this.tries = 0;
                    this.grabProcesses();
                }}>
                    refresh
                </button>
			</div>
		);
	}
}

export class Process extends React.Component {

	render(){
		return (
			<li> 
				Pid: {this.props.process.pid} | 
				Name: {this.props.process.name} | 
				Mem: {this.props.process.memory}
			</li>
		);
	}

}