import React from 'react';
import Operations from '../core/operations_constants';

import './style/rawtexteditor.css';

export default class RawTextEditor extends React.Component {
    constructor(props){
        super(props);
        
        const pG = props.objectProgram;
        
        this.state = {
            pid: pG.pid,
            progam: pG.program,
            fileContents: pG.fileContents,
            filePath: pG.filePath
        };
        console.log(`[${pG.program}]::: `, pG);

        /**
         * @type {WebSocket}
         */
        this.ws = props.ws;

        this.saveFileAndExit = this.saveFileAndExit.bind(this);
    }

    saveFileAndExit(e){
        console.log("sending fileexit");

        this.ws.send(
            JSON.stringify({
                operation: Operations.SAVEEXFILE,
                file: {
                    filePath: this.state.filePath,
                    fileContents: this.state.fileContents
                },
                program: {
                    pid: this.state.pid,
                    program: this.state.progam
                }
            })
        );
    }

    render(){
        return (
            <div className='container-rwt'>
                <div className='rwt-smitem-head'>
                    <h2>RawTextEditor</h2>
                </div>
                <div className='rwt-smitem-options'>
                    <input type='text' />
                    <select>
                        <option>1</option>
                    </select>
                </div>
                <div className='rwt-smitem-body'>
                    <textarea defaultValue={this.state.fileContents}
                        onChange={(e) => {
                            this.setState({fileContents: e.target.value});
                        }}
                    >
                    </textarea>
                </div>
                <div className='rwt-smitem-body'>
                    <button type='button'
                        onClick={this.saveFileAndExit}
                    >
                        save&exit
                    </button>
                </div>
            </div>
        );
    }
}