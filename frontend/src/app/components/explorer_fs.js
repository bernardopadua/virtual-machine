import React from "react";
import Operations from "../core/operations_constants";
import { LIST_FILE_EXTENSIONS } from '../core/filesystem_extensions';

import './style/explorer_fs.css';

export default class ExplorerFilesystem extends React.Component {
    constructor(props){
        super(props);

        this.creatingWhat ={
            file   : 'file',
            folder : 'folder',
        };

        this.state = {
            currentFolder: "/",
            files        : [],

            manageValue  : false,
            manageValueVl: '',
            creatingWhat : null,

            //file
            extensionVl: LIST_FILE_EXTENSIONS[0],

            buttonCreate: 'create'
        };

        /**
         * @type {WebSocket}
         */
        this.ws = props.ws;

        this.ws.addEventListener("message", this.wsMessageRecv.bind(this));

        this.doCreateFile   = this.doCreateFile.bind(this);
        this.resetManageVl  = this.resetManageVl.bind(this);
        this.cancelManageVl = this.cancelManageVl.bind(this);
        this.refreshFiles   = this.refreshFiles.bind(this);
    }

    wsMessageRecv(messageEvent){
        const ndata = JSON.parse(messageEvent.data);
        switch (ndata.operation) {
            case Operations.LISTFILES:
                const c = ndata.contents;    
                if(c !== '')
                    this.setState({files: c});
                break;
            case Operations.CHNGCURDIR:
                const f = ndata.folder;
                if(f !== '')
                    this.setState({currentFolder: f})
                break;
            default:
                break;
        }
    }

    refreshFiles(){
        this.ws.send(JSON.stringify({
            operation: Operations.LISTFILES
        }));
    }
    
    changeCurrentFolder(){
        this.ws.send(JSON.stringify({
            operation: Operations.CHNGCURDIR,
            folder: this.state.currentFolder
        }));
    }

    resetManageVl(){
        //hiding input and button (reseting)
        this.setState({
            creatingWhat: null,
            manageValue: false,
            manageValueVl: '',
            extensionVl: LIST_FILE_EXTENSIONS[0]
        });
    }

    doCreateFile(e){
        if(this.state.manageValueVl.length <= 0){
            this.props.messagingTop("File must have enough characters to proceed.", 3000);
        }

        if(this.state.creatingWhat == this.creatingWhat.file){
            this.ws.send(JSON.stringify({
                operation: Operations.CREATEFILE,
                fileName: this.state.manageValueVl,
                fileType: this.state.extensionVl,
            }));
        }

        this.resetManageVl();
    }

    cancelManageVl(){
        this.resetManageVl();
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
                        <input type="text" className="input-folder" value={this.state.currentFolder} 
                            onKeyDown={(e)=>{
                                if(e.key === "Enter"){
                                    this.changeCurrentFolder();
                                }
                            }}
                            onChange={(e)=>{
                                let value = e.target.value;
                                value = value.replace(new RegExp("[!@#$%^&*()+\\-=\\[\\]{};':\"\\\|,.<>?]", "gm"), "");
                                value = value.replaceAll(" ", "");
                                this.setState({currentFolder: value});
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
                                    <>
                                        <button type="button"
                                            onClick={()=>{
                                                this.ws.send(JSON.stringify({
                                                    operation: Operations.OPENFILE,
                                                    filePath: obj.filePath
                                                }));
                                            }}
                                        >
                                            open
                                        </button>
                                        <button type="button"
                                            onClick={()=>{
                                                this.ws.send(JSON.stringify({
                                                    operation: Operations.REMOVEFILE,
                                                    filePath: obj.filePath,
                                                    fileType: obj.fileType
                                                }));
                                            }}
                                        >
                                            remove
                                        </button>
                                    </>
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
                            this.refreshFiles();
                        }}
                >
                    Refresh files in folder
                </button>
                {(this.props.createFile !== undefined) &&
                    <button type="button"
                        onClick={()=>{
                            this.setState({
                                manageValue: true,
                                buttonCreate: 'create file',
                                creatingWhat: this.creatingWhat.file
                            })
                        }}
                    >Create file</button>
                }
                {(this.state.manageValue) &&
                    <div>
                        <input type="text" value={this.state.manageValueVl} 
                            onChange={(e)=>{
                                let value = e.target.value;
                                value = value.replace(new RegExp("[!@#$%^&*()+\\-=\\[\\]{};':\"\\\|,.<>\/?]", "gm"), "");
                                value = value.replaceAll(" ", "");
                                this.setState({manageValueVl: value, creatingWhat: this.creatingWhat.file});
                            }}
                        />
                        {(this.state.creatingWhat == this.creatingWhat.file) &&
                            <select value={this.state.extensionVl}
                                onChange={(e)=>{
                                    this.setState({extensionVl: e.target.value})
                                }}
                            >
                                {LIST_FILE_EXTENSIONS.map((obj, i)=> {
                                    return <option key={i} value={obj}>{obj}</option>;
                                })}
                            </select>
                        }
                        <button type="button"
                            onClick={(e)=>{
                                if(this.state.creatingWhat == this.creatingWhat.file){
                                    this.doCreateFile(e);
                                }
                            }}
                        >
                            {this.state.buttonCreate}
                        </button>
                        <button type="button"
                            onClick={this.cancelManageVl}
                        >
                            cancel
                        </button>
                    </div>
                }
            </div>
        );
    }
}