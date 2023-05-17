var file_example = {
    userId: 1, 
    fileOrFolder: "fl", 
    fileName: "ab",
    filePath: "/ab.txt",
    folder: "/", 
    fileContents: "ababab",
    folderName: null
};

var folder_example = {
    userId: 1, 
    fileOrFolder: "fd", 
    folder: "/", 
    fileContents: null,
    folderName: "abc" //trim
};

var folder_example = {
    userId: 1, 
    fileOrFolder: "fd", 
    folder: "/abc", 
    fileContents: null,
    folderName: "abc2" //trim //mongo.find.exists(abc2) ? dont_create : create;
};

var program_example = {
    progName: "firewall",
    version: "1.0",
    size: 150,
    type: "frw"
};