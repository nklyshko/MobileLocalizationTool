function getCurrentFolder() {
    return DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents().next();
}

function createFolderIfNotExists(parent, folderName) {
    try {
        folder = parent.getFoldersByName(folderName).next();
    } catch (e) {
        folder = parent.createFolder(folderName);
    }
    return folder;
}