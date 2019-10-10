function getCurrentFolder() {
    return DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents().next();
}

function createFileIfNotExists(parent, fileName) {
    var file;
    try {
        file = parent.getFilesByName(fileName).next();
    } catch (e) {
        file= parent.createFile(fileName, '');
    }
    return file;
}

function createFolderIfNotExists(parent, folderName) {
    var folder;
    try {
        folder = parent.getFoldersByName(folderName).next();
    } catch (e) {
        folder = parent.createFolder(folderName);
    }
    return folder;
}