import React from "react";
import Operations from "../core/operations_constants";

import './style/explorer_fs.css';

export default class ExplorerFilesystem extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            currentFolder: "/",
            files: [],

            manageFile: false,
            manageFileValue: ''
        };

        /**
         * @type {WebSocket}
         */
        this.ws = props.ws;

        this.ws.addEventListener("message", this.wsMessageRecv.bind(this));
    }

    wsMessageRecv(messageEvent){
        const ndata = JSON.parse(messageEvent.data);
        switch (ndata.operation) {
            case Operations.LISTFILES:
                const c = ndata.contents;    
                if(c !== '')
                    this.setState({files: c});
                break;
            default:
                break;
        }
    }

    changeCurrentFolder(){
        this.ws.send(JSON.stringify({
            operation: Operations.LISTFILES,
            folder: this.state.currentFolder
        }));
    }

    render(){
        return (
            <div className="efs-container">
                <div className="efs-item-banner">
                    <h2>
                        Explorer - FileSytem
                    </h2>
                    <div style={{display: "table"}}>
                        <label className="input-folder-label">Folder::</label> 
                        <input type="text" className="input-folder" defaultValue={this.state.currentFolder} 
                            onKeyDown={(e)=>{
                                if(e.key === "Enter" && e.target.value != this.state.currentFolder){
                                    this.setState({currentFolder: e.target.value}, ()=>{
                                        this.changeCurrentFolder();
                                    });
                                }
                            }}
                        />
                    </div>
                </div>
                <ul className="efs-item-explorer">
                    {this.state.files.map((obj, i)=>{
                        return (
                            <li key={i} className="efs-item-filefolder">
                                {(obj.fileOrFolder=="fd") ? "Folder::" : ''}
                                {obj.fileName}<br/>

                                {(obj.program == null) &&
                                    <button type="button"
                                        onClick={()=>{
                                            this.ws.send(JSON.stringify({
                                                operation: Operations.OPENFILE,
                                                filePath: obj.filePath
                                            }));
                                        }}
                                    >
                                        open</button>
                                }
                                {(obj.program) && 
                                    <button type="button"
                                        onClick={()=>{
                                            this.ws.send(JSON.stringify({
                                                ...obj,
                                                operation: Operations.INSTPROG
                                            }));
                                        }}
                                    >install</button>
                                }
                            </li>
                        );
                    })}
                </ul>
                <button type="button"
                        onClick={()=>{
                            this.changeCurrentFolder();
                        }}
                >
                    Refresh files in folder
                </button>
                {(this.props.createFile !== undefined) &&
                    <button type="button"
                        onClick={()=>{
                            this.setState({currentFolder: "/"});
                            this.changeCurrentFolder();
                        }}
                    >Create file</button>
                }
                {(this.state.manageFile) &&
                    <input type="text" defaultValue={this.state.manageFileValue} />
                }
            </div>
        );
    }
}