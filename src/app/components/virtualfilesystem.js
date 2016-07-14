import React from 'react';
import FileSystem from '../core/filesystem.js';
import BoundLink from '../core/boundlink.js';

export default class VirtualFileSystem extends React.Component {
	constructor(props){
		super(props);

		this.styles = {
			shown: {
				display: "block"
			},
			hidden: {
				display: "none"
			}
		}

		this.state = {
			currentFolder: FileSystem.currentLocation,
			options: {
				createFile: {
					style: this.styles.hidden,
					fileName: "Teste.txt",
					fileSize: 150
				},
				createFolder: {
					style: this.styles.hidden,
					folderName: "teste"
				}
			}
		}


		console.log(this.state.options);

		BoundLink.openChannel('VFS', ()=>{ this.openChannel(); });
	}

	openChannel(){
		var boundData = BoundLink.getData('VFS');
		if (boundData.action == "build-workspace") {
			this.buildWorkSpace();
		}
	}

	buildWorkSpace(){
		this.setState({currentFolder: FileSystem.currentLocation});
	}

	createFile() {
		var createFile = this.state.options.createFile;
		FileSystem.createFile(createFile.fileName, "", Number.parseInt(createFile.fileSize));
		
		createFile.style = this.styles.hidden;
		this.setState(createFile);
	}

	createFolder() {
		var createFolder = this.state.options.createFolder;
		FileSystem.createFolder(this.state.options.createFolder.folderName);

		createFolder.style = this.styles.hidden;
		this.setState(createFolder);
	}

	render(){
		var createFile   = this.state.options.createFile;
		var createFolder = this.state.options.createFolder;
		return (
			<div>
				<div id="virtual-options">
					<ul>
						<li> 
							<span style={{cursor: 'pointer'}} onClick={()=>{ 
								var changeStyle = {style: (this.state.options.createFile.style == this.styles.shown ? this.styles.hidden : this.styles.shown)};
								changeStyle = Object.assign(createFile, changeStyle);
								this.setState(changeStyle);
							}}>
								Create file
							</span>
							<div style={createFile.style}> 
								FileName: <input type="text" defaultValue={createFile.fileName} onChange={
									(e)=>{
										var options = {
											fileName: e.target.value								
										};
										options = Object.assign(createFile, options);
										this.setState(options);
								}} /><br />
								FileSize: <input type="text" defaultValue={createFile.fileSize} onChange={
									(e)=>{
										var options = {
											fileSize: e.target.value								
										};
										options = Object.assign(createFile, options);
										this.setState(options);
								}} /><br />
								<button onClick={()=>{this.createFile();}}>Create File</button>
							</div>
						</li>
						<li>
							<span style={{cursor: 'pointer'}} onClick={()=>{ 
								var changeStyle = {style: (this.state.options.createFolder.style == this.styles.shown ? this.styles.hidden : this.styles.shown)};
								changeStyle = Object.assign(createFolder, changeStyle);
								this.setState(changeStyle);
							}}>
								Create folder
							</span>
							<div style={createFolder.style}>
								Folder name: <input type="text" defaultValue={createFolder.folderName} onChange={
									(e)=>{
										var options = {
											folderName: e.target.value								
										};
										options = Object.assign(createFolder, options);
										this.setState(options);
								}} />
								<button onClick={()=>{this.createFolder();}}>Create folder</button>
							</div>
						</li>
					</ul> 
				</div>
				<div id="virtual-workspace">
					<ul> 
						<FolderComponent folder={this.state.currentFolder} />
					</ul>
				</div>
			</div>
		);
	}
}

export class FolderComponent extends React.Component {
	constructor(props){
		super(props);

		this.state = {
			orignstyle: {
				display: "none"
			},
			nonorign: {
				display: "block"
			}
		}
	}

	backFolder(){
		FileSystem.setCurrentFolder(this.props.folder.folderInfo.parentFolder);
		BoundLink.setDataCall('VFS', {action: "build-workspace"});
	}

	render (){
		var filesFolder = this.props.folder.folderInfo.files.map((file) => {
			return(
				<FileComponent key={file.fileInfo.unqId} file={file} />
			); 
		});

		var styleOpt = this.state.nonorign;
		if (this.props.folder.folderInfo.fdqId === './home') {
			styleOpt = this.state.orignstyle;
		}

		var pasteFolder = <a href="#" onClick={()=>{ this.props.folder.pasteFile(); }}> paste </a>;
		var backFolder = <a href="#" style={styleOpt} onClick={()=>{ this.backFolder(); }}> back </a>;

		var foldersFolder = this.props.folder.folderInfo.folders.map((folder)=>{
			return (
				<FolderFileComponent key={folder.folderInfo.fdqId} folder={folder} />
			);
		});

		return (
			<div>
				<div style={{fontFamily: "Verdana", fontSize: "12px"}}>#{this.props.folder.folderInfo.fdqId}> </div>
				<div style={{fontSize: "12px", paddingLeft: "20px"}}> 
					{backFolder} | {pasteFolder}
				</div>
				<div>
					<ul style={{fontSize: "12px"}}>
						{filesFolder}
						{foldersFolder}
					</ul>
				</div>
			</div>
		);
	}
}

export class FileComponent extends React.Component {
	copyFile() {
		FileSystem.copyToClipboard(this.props.file);
	}

	deleteFile(){
		this.props.file.deleteFromFolder();
		BoundLink.setDataCall('VFS', {action: "build-workspace"});
	}

	render(){
		var file = this.props.file.fileInfo;
		return (
			<li> 
				{file.name} (size: {file.size}) // 
				<a href="#" onClick={() => {this.copyFile()}}>copy</a> | 
				<a href="#" onClick={() => {this.deleteFile()}}>delete</a>
			</li>
		);
	}
}

export class FolderFileComponent extends React.Component {
	openFolder(){
		FileSystem.setCurrentFolder(this.props.folder);
		BoundLink.setDataCall('VFS', {action: "build-workspace"});
	}

	render(){
		var folder = this.props.folder.folderInfo;
		return (
			<li> 
				{folder.folderName} []
				<a href="#" onClick={() => { this.openFolder(); }}> open</a> | 
			</li>
		);
	}
}