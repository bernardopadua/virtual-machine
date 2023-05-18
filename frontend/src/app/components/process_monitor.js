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
        
        this.ws.addEventListener("message", this.wsMessageRecv);
	}

    grabProcesses(){
        setTimeout(() => {
            this.ws.send(
                JSON.stringify({
                    operation: Operations.LISTPROC
                })
            );
            this.grabProcesses();
        }, 1000);
    }

    wsMessageRecv(data){
        const ndata = JSON.parse(data);
        switch (ndata.operation) {
            case Operations.LISTPROC:
                console.log("Process-monitor:: ", ndata);
                break;
            default:
                break;
        }
    }

	render(){
		var processes = this.props.prcPool.map((prc)=>{
			return (
				<Process process={prc} key={prc.processInfo.pid} />
			);
		});

		return (
			<div className="os-state">
				<ul>
					{processes}
				</ul>
			</div>
		);
	}
}

export class Process extends React.Component {

	render(){
		return (
			<li> 
				Pid: {this.props.process.processInfo.pid} | 
				Name: {this.props.process.processInfo.name} | 
				Mem: {this.props.process.processInfo.memory}
			</li>
		);
	}

}