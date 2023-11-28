function checkIfFileExists(filePath) {
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    try {
        var absolutePath = fileSystemObject.GetAbsolutePathName(filePath);
        absolutePath = getCleanPath(absolutePath);
        if (fileSystemObject.FileExists(absolutePath)) { return true; }
    }
    catch (error) { showAlert(error.message); }
    // showAlert('Folgende Datei existiert nicht: \n' + filePath);
    return false;
}

function checkIfFolderExists(folderPath) {
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    try {
        var absolutePath = fileSystemObject.GetAbsolutePathName(folderPath);
        absolutePath = getCleanPath(absolutePath);
        if (fileSystemObject.FolderExists(absolutePath)) { return true; }
    }
    catch (error) { showAlert(error.message); }
    // showAlert('Folgender Ordner existiert nicht: \n' + folderPath);
    return false;
}



function createFolder(parentfolderPath, folderName) {

    // createFolder('/', 'newtmpx');
    // createFolder('test', 'newtmp');
    // Bei '/test' wird in C:\test erstellt, bei 'test' wird im Ordner 'test' der Anwendung erstellt

    if (!folderName) { return false; }

    var fullpath = folderName;

    parentfolderPath = getCleanPath(parentfolderPath);
    while (parentfolderPath.length > 0 && parentfolderPath.lastIndexOf('/') === parentfolderPath.length - 1) {
        parentfolderPath = parentfolderPath.slice(0, -1);
    }
    if (parentfolderPath) { fullpath = parentfolderPath + '/' + fullpath; }


    if (parentfolderPath === '/'
        || (parentfolderPath && !checkIfFolderExists(parentfolderPath))
        || checkIfFolderExists(fullpath)) {
        showAlert('Folgender Ordner kann nicht erstellt werden:\n' + fullpath);
        return;
    }
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    fileSystemObject.CreateFolder(fullpath);
}



function renameElement(elementPath, newName, mode) {
    var objRenaming = {
        path_old: elementPath,
        path_new: null,
        name_old: getCleanPath(elementPath).split('/').pop(),
        name_new: newName,
        isSuccessful: false,
        errorMsg: null
    }
    if (!(mode === 'files' || mode === 'subfolders')) { return objRenaming; }
    try {
        if (!objRenaming.path_old) { objRenaming.errorMsg = 'Pfad zur Datei leer.'; return objRenaming; }
        if (!objRenaming.name_new) { objRenaming.errorMsg = 'Neuer Name leer.'; return objRenaming; }
        if (!checkIfNameIsValid(objRenaming.name_new)) { objRenaming.errorMsg = 'Neuer Name nicht zulässig.'; return objRenaming; }

        if (mode === 'files' && !checkIfFileExists(objRenaming.path_old)) { objRenaming.errorMsg = 'Datei nicht gefunden.'; return objRenaming; }
        if (mode === 'subfolders' && !checkIfFolderExists(objRenaming.path_old)) { objRenaming.errorMsg = 'Ordner nicht gefunden.'; return objRenaming; }

        var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
        var objElement = (mode === 'files') ? fileSystemObject.GetFile(objRenaming.path_old) : fileSystemObject.GetFolder(objRenaming.path_old);
        objRenaming.path_old = getCleanPath(objElement.Path + '');
        objRenaming.name_old = objElement.Name;

        // objRenaming.pathNew = getCleanPath(fileOrFolder.ParentFolder + '') + '/' + objRenaming.nameNew;
        objRenaming.path_new = getCleanPath(fileSystemObject.BuildPath(objElement.ParentFolder, objRenaming.name_new));

        if (objRenaming.path_new === objRenaming.path_old) { objRenaming.errorMsg = 'Neuer Name entspricht dem alten.'; return objRenaming; }
        // Aaa.txt --> aaa.txt ist möglich!

        (mode === 'files')
            ? fileSystemObject.MoveFile(objRenaming.path_old, objRenaming.path_new)
            : fileSystemObject.MoveFolder(objRenaming.path_old, objRenaming.path_new);
        objRenaming.isSuccessful = true;
    }
    catch (error) {
        objRenaming.errorMsg = error.message;
    }
    return objRenaming;
}

function checkIfNameIsValid(elementname) {
    // var arrInvalidCharacters = ['\\', '/', ':', '*', '?', '"', '<', '>', '|'];
    return !(/[\\\/\:\*\?\"\<\>\|]/g.test(elementname));
}


function getAbsolutePath(elementPath) {
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    var absolutePath = fileSystemObject.GetAbsolutePathName(elementPath);
    return getCleanPath(absolutePath);
}


function getCleanPath(dirtyPath) {
    if (typeof dirtyPath !== 'string') { return ''; }
    return dirtyPath.replace(/\\/g, '/');
}





function getObjFilesInFolder(folderPath) {
    if (!checkIfFolderExists(folderPath)) {
        showAlert('Folgender Ordner existiert nicht: \n' + folderPath);
        return { path: null, elements: null };
    }
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    folderPath = getCleanPath(fileSystemObject.GetAbsolutePathName(folderPath));
    var folder = fileSystemObject.GetFolder(folderPath);
    var filesInFolder = [];
    var enumFiles = new Enumerator(folder.files);
    for (; !enumFiles.atEnd(); enumFiles.moveNext()) {
        filesInFolder.push({
            path: enumFiles.item().Path,
            name: enumFiles.item().Name,
            size: enumFiles.item().Size,
            type: enumFiles.item().Type,
            attributes: enumFiles.item().Attributes,
            dateCreated: enumFiles.item().DateCreated,
            dateLastModified: enumFiles.item().DateLastModified
        });
        // alert('Name: ' + enumFiles.item().Name + '\nAttributes: ' + enumFiles.item().Attributes + '\n\n' + detectMeaningOfAttributes(enumFiles.item().Attributes));
        // alert('enumFiles.item().Path' + ': ' + enumFiles.item().Path);
    }
    return { path: folderPath, elements: filesInFolder };
}

function getObjSubfoldersInFolder(folderPath) {
    if (!checkIfFolderExists(folderPath)) {
        showAlert('Folgender Ordner existiert nicht: \n' + folderPath);
        return { path: null, elements: null };
    }
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    folderPath = getCleanPath(fileSystemObject.GetAbsolutePathName(folderPath));
    var folder = fileSystemObject.GetFolder(folderPath);
    var subfoldersInFolder = [];
    var enumSubfolders = new Enumerator(folder.subFolders);
    for (; !enumSubfolders.atEnd(); enumSubfolders.moveNext()) {
        // Bei Attributes 22 und 1046 darf keine Filesize ermittelt werden (insb. bei Systemfiles [4])
        // Nur 16 oder 17 erlauben
        var curAttribute = enumSubfolders.item().Attributes;
        try {
            var objSubfolder = {
                path: enumSubfolders.item().Path,
                name: enumSubfolders.item().Name,
                type: enumSubfolders.item().Type,
                dateCreated: enumSubfolders.item().DateCreated,
                dateLastModified: enumSubfolders.item().DateLastModified,
                attributes: enumSubfolders.item().Attributes
            }
            try { objSubfolder.size = enumSubfolders.item().Size; }
            catch (error) { objSubfolder.size = -1; }
            // try { objSubfolder.filesCount = enumSubfolders.item().Files.Count; }
            // catch (error) { objSubfolder.filesCount = error.message; }
            subfoldersInFolder.push(objSubfolder);

        } catch (errorAll) {
            showAlert('Fehler: ' + errorAll.message + '\n\n' + enumSubfolders.item().Path + '\n\n' + curAttribute + '\n\n' + detectMeaningOfAttributes(curAttribute))
        }
        // alert(''
        //     + 'path: ' + objSubfolder.path + '\n'
        //     + 'name: ' + objSubfolder.name + '\n'
        //     + 'type: ' + objSubfolder.type + '\n'
        //     + 'dateCreated: ' + objSubfolder.dateCreated + '\n'
        //     + 'dateLastModified: ' + objSubfolder.dateLastModified + '\n'
        //     + 'size: ' + objSubfolder.size + '\n'
        //     + 'filesCount: ' + objSubfolder.filesCount + '\n\n'
        //     + 'attributes: ' + objSubfolder.attributes + '\n'
        //     + '' + detectMeaningOfAttributes(objSubfolder.attributes) + '\n'
        // );
    }
    return { path: folderPath, elements: subfoldersInFolder };
    // Subfolders --> https://admhelp.microfocus.com/uft/en/all/VBScript/Content/html/1fddd555-caa0-4f77-851d-0a2d3082e13d.htm
    // Folder http://www.java2s.com/Tutorial/JavaScript/0600__MS-JScript/Folder.htm
}

function getArrAllNamesOfElementsInFolder(folderPath) {
    if (!checkIfFolderExists(folderPath)) {
        showAlert('Folgender Ordner existiert nicht: \n' + folderPath);
        return null;
    }
    var arrAllNames = [];
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    folderPath = getCleanPath(fileSystemObject.GetAbsolutePathName(folderPath));
    var folder = fileSystemObject.GetFolder(folderPath);
    var enumFiles = new Enumerator(folder.files);
    for (; !enumFiles.atEnd(); enumFiles.moveNext()) { arrAllNames.push(enumFiles.item().Name); }
    var enumSubfolders = new Enumerator(folder.subFolders);
    for (; !enumSubfolders.atEnd(); enumSubfolders.moveNext()) { arrAllNames.push(enumSubfolders.item().Name); }

    // var strAllNames = arrAllNames.length + ' Elemente:\n\n';
    // for (var i = 0; i < arrAllNames.length; i++) { strAllNames += arrAllNames[i] + '\n'; }
    // alert(strAllNames);

    return arrAllNames;
}

function detectMeaningOfAttributes(attributes) {
    var result = '';
    if (attributes === 0) { result += '0 -> Normal (no attributes set)' + '\n'; }
    if (attributes & 1) { result += '1 -> Read-Only (attribute is read/write)' + '\n'; }
    if (attributes & 2) { result += '2 -> Hidden (attribute is read/write)' + '\n'; }
    if (attributes & 4) { result += '4 -> System (attribute is read/write)' + '\n'; }
    if (attributes & 8) { result += '8 -> Volume (disk drive volume label, attribute is read-only)' + '\n'; }
    if (attributes & 16) { result += '16 -> Directory (folder/directory, attribute is read-only)' + '\n'; }
    if (attributes & 32) { result += '32 -> Archive (file has changed since last backup, attribute is read/write)' + '\n'; }
    if (attributes & 1024) { result += '1024 -> Alias (link/shortcut, attribute is read-only)' + '\n'; } // 64
    if (attributes & 2048) { result += '2048 -> Compressed (attribute is read-only)' + '\n'; } // 128
    return result;
    // https://admhelp.microfocus.com/uft/en/all/VBScript/Content/html/423ca96b-6877-4268-a6cc-3139e034f88c.htm
    // http://www.java2s.com/Tutorial/JavaScript/0600__MS-JScript/FolderAttributes.htm
}

function getAttributesAsString(attributes) {
    var arrStrAttribute = []
    if (attributes === 0) { arrStrAttribute.push('Normal [0]'); }
    if (attributes & 1) { arrStrAttribute.push('Read-Only [1]'); }
    if (attributes & 2) { arrStrAttribute.push('Versteckt [2]'); }
    if (attributes & 4) { arrStrAttribute.push('System [4]'); }
    if (attributes & 8) { arrStrAttribute.push('Laufwerksbeschriftung [8]'); }
    if (attributes & 16) { arrStrAttribute.push('Verzeichnis [16]'); }
    if (attributes & 32) { arrStrAttribute.push('Archiv [32]'); }
    if (attributes & 1024) { arrStrAttribute.push('Alias/Verknüpfung [1024]'); } // 64
    if (attributes & 2048) { arrStrAttribute.push('Komprimiert [2048]'); } // 128
    return arrStrAttribute.join(', ');
}


function getFileProperties(filePath) {
    filePath = getCleanPath(filePath);
    var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
    var file = fileSystemObject.GetFile(filePath);
    var str = ''
        + 'Name: ' + file.Name + '\n'
        + 'ShortName : ' + file.ShortName + '\n'
        + 'Drive: ' + file.Drive + '\n'
        + 'ParentFolder: ' + file.ParentFolder + '\n'
        + 'Path: ' + file.Path + '\n'
        + 'ShortPath : ' + file.ShortPath + '\n'
        + 'DateCreated: ' + file.DateCreated + '\n'
        + 'DateLastAccessed: ' + file.DateLastAccessed + '\n'
        + 'DateLastModified: ' + file.DateLastModified + '\n'
        + 'Size (Bytes): ' + file.Size + '\n'
        + 'Type: ' + file.Type + '\n'
        ;
    showAlert(str);
    return (str);
}


function appendToTextFile(strFilepath, strContent) {
    // object.OpenTextFile(filename[, iomode[, create[, format]]])
    // ForReading = 1, ForWriting = 2, ForAppending = 8
    try {
        var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
        var textFile = fileSystemObject.OpenTextFile(strFilepath, 8, true);
        textFile.Write(strContent);
        textFile.Close();
    }
    catch (error) {
        showAlert('Fehler beim Anhängen von Text an die Datei "' + strFilepath + '":\n\n' + error.message);
    }
}

function readFromTextFile(strFilepath) {
    try {
        var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
        var textFile = fileSystemObject.OpenTextFile(strFilepath, 1);
        var strContent = textFile.ReadAll();
        textFile.Close();
        return strContent;
    } catch (error) {
        // showAlert('Fehler beim Einlesen der Textdatei "' + strFilepath + '":\n\n' + error.message);
        return '';
    }
}

function writeToTextFile(strFilepath, strContent, isPrepended) {
    try {
        if (isPrepended) {
            strContent = strContent + readFromTextFile(strFilepath);
        }
        var fileSystemObject = new ActiveXObject('Scripting.FileSystemObject');
        var textFile = fileSystemObject.OpenTextFile(strFilepath, 2, true);
        textFile.Write(strContent);
        textFile.Close();
    }
    catch (error) {
        showAlert('Fehler beim Schreiben der Textdatei "' + strFilepath + '":\n\n' + error.message);
    }
}

function openFileBrowserDialog(callback) {
    var fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.style.display = 'none';
    fileInput.onchange = function () {
        var selectedFilePath = fileInput.value;
        document.body.removeChild(fileInput);
        callback(selectedFilePath);
    };
    document.body.appendChild(fileInput);
    fileInput.click();
}

function getFileExtension(strFilename) {
    var lastIndexOfPeriod = strFilename.lastIndexOf('.');
    return (lastIndexOfPeriod === -1) ? null : strFilename.slice(lastIndexOfPeriod); // inkl. Punkt
}

function getParentfolderPath(strPath) {
    var pathSplitted = getCleanPath(strPath).split('/');
    if (pathSplitted.length > 1) { pathSplitted.pop(); }
    return (pathSplitted.length > 1) ? pathSplitted.join('/') : pathSplitted.toString() + '/';
}