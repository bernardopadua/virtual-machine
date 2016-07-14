import Process from './process.js';
import BoundLink from './boundlink.js';

export default class FileSystem {

	static virtualHome = null;
	static currentLocation = null;
	static diskSpace = 9999;

	static clipBoard = null;

	static uniqId = 0;
	static fdqId = null;

	static setCurrentFolder(folder){
		FileSystem.currentLocation = folder;
	}

	static copyToClipboard(file){
		FileSystem.clipBoard = file;
	}

	static getClipboard(){
		return FileSystem.clipBoard;
	}

	static getUniqId() {
		FileSystem.uniqId++;
		return FileSystem.uniqId;
	}

	static getFdqId(name) {
		return FileSystem.currentLocation.folderInfo.fdqId + '/' + name;
	}

	static buildVirtualSpace() {
		var homeSpec = {
			fdqId: './home',
			folderName: "home",
			parentFolder: 'space'
		}
		var home = new Folder(homeSpec);

		FileSystem.virtualHome = home;
		FileSystem.currentLocation = FileSystem.virtualHome;
	}

	static cloneFile(file, folder) {
		var fileInfo = {
			unqId: FileSystem.getUniqId(),
			name: file.fileInfo.name,
			size: file.fileInfo.size,
			parentFolder: folder
		}
		var file = new File(fileInfo);

		return file;
	}

	static createFile(name, data, size) {
		var fileInfo = {
			unqId: FileSystem.getUniqId(),
			name: name,
			size: size,
			parentFolder: FileSystem.currentLocation
		}
		var file = new File(fileInfo);

		BoundLink.setData('VM', {
			type:'filesystem', 
			action:'create-file',
			size: size,
			name: name,
			callback: (()=>{ 
				FileSystem.currentLocation.addFile(file); 
				BoundLink.setData('VFS', {action: 'build-workspace'}); 
				BoundLink.callReverse('VFS');
			}) 
		});

		BoundLink.callReverse('VM');
	}

	static createFolder(name){
		var folderInfo = {
			fdqId: FileSystem.getFdqId(name),
			folderName: name,
			parentFolder: FileSystem.currentLocation,
		}

		var folder = new Folder(folderInfo);
		folder.folderInfo.parentFolder.addFolder(folder);
	}

	static showFolder(){
		console.log(FileSystem.virtualHome);
	}

}

export class Folder {
	constructor(objFolder) {
		this.folderInfo = {
			fdqId: objFolder.fdqId,
			folderName: objFolder.folderName,
			parentFolder: objFolder.parentFolder,
			files: [],
			folders: []
		}
	}

	addFile(file){
		this.folderInfo.files.push(file);
	}

	addFolder(folder){
		this.folderInfo.folders.push(folder);
	}

	pasteFile(){
		console.log(FileSystem.getClipboard());
		if (FileSystem.getClipboard() !== null) {
			var fileName = FileSystem.getClipboard().fileInfo.name;
			var fileToPaste = FileSystem.getClipboard();
			if (fileToPaste !== null && this.folderInfo.files.find((tmpFile) => tmpFile.fileInfo.name == fileName) === undefined){
				BoundLink.setDataCall('VM', {
					type:'filesystem', 
					action:'paste-file',
					size: fileToPaste.fileInfo.size,
					name: fileToPaste.fileInfo.name,
					callback: (()=>{ 

						var newFile = FileSystem.cloneFile(fileToPaste, this);
						this.addFile(newFile);
						
						BoundLink.setData('VFS', {action: 'build-workspace'}); 
						BoundLink.callReverse('VFS');
					}) 
				});
			} 
			else 
			{
				console.log("File is already exists!");
			}
		}
		else 
		{
			console.log("Clipboard is empty!");
		}
	}

	getFiles(){
		return this.folderInfo.files;
	}

	getFolders(){
		return this.folderInfo.folders;
	}

	deleteFile(file){
		var pos = this.folderInfo.files.indexOf(file);
		this.folderInfo.files.splice(pos, 1);
	}

}

export class File {
	constructor(objFile){
		this.fileInfo = {
			unqId: objFile.unqId,
			name: objFile.name,
			size: objFile.size,
			parentFolder: objFile.parentFolder
		}
		this.fileData = {
			data: null
		}
	}

	deleteFromFolder(){
		this.fileInfo.parentFolder.deleteFile(this);
	}
}