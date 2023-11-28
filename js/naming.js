function getFoldernamePart(foldername, strStop) {
    return (strStop) ? foldername.split(strStop)[0] : foldername;
}

function getFormattedDate(date, format, formatDelimiter) {
    if (!format || !(date instanceof Date) || isNaN(date)) { return ''; }

    var fullYear = '' + date.getFullYear(); // JJJJ
    var month = ('0' + (date.getMonth() + 1)).slice(-2); // 0-11
    var day = ('0' + date.getDate()).slice(-2); // 1-31

    var hours = ('0' + date.getHours()).slice(-2); // 0-23
    var minutes = ('0' + date.getMinutes()).slice(-2); // 0-59
    var seconds = ('0' + date.getSeconds()).slice(-2); // 0-59

    if (format === 'yyyymmdd') { return createDateString(formatDelimiter, false, true); }
    if (format === 'yymmdd') { return createDateString(formatDelimiter, true, true); }
    if (format === 'yyyymm') { return createDateString(formatDelimiter, false, false); }
    if (format === 'yymm') { return createDateString(formatDelimiter, true, false); }

    if (format === 'yymmddhhmmss') { return createDateTimeString(formatDelimiter, true, true); }
    if (format === 'yymmddhhmm') { return createDateTimeString(formatDelimiter, true, false); }
    if (format === 'yymmddhh') { return createDateTimeString(formatDelimiter, false, false); }

    function createDateString(strDelimiter, shortenYear, hasDay) {
        return ((shortenYear) ? fullYear.slice(-2) : fullYear)
            + strDelimiter + month
            + ((hasDay) ? (strDelimiter + day) : '');
    }
    function createDateTimeString(strDelimiter, hasMinutes, hasSeconds) {
        return createDateString(strDelimiter, true, true)
            + strDelimiter + hours
            + ((hasMinutes) ? (strDelimiter + minutes) : '')
            + ((hasSeconds) ? (strDelimiter + seconds) : '');
    }
}

function sliceName(name, silceStart, sliceEnd) {
    if (isNaN(silceStart) || isNaN(sliceEnd)) { return name; }
    return name.slice(silceStart, sliceEnd);
}

function replaceName(name, searchTxt, replaceTxt, replaceFirstOnly, allowRegex) {
    try {
        if (!searchTxt || replaceTxt === null || replaceTxt === undefined) { return name };
        if (replaceFirstOnly && !allowRegex) {
            return name.replace(searchTxt, replaceTxt);
        }
        if (!replaceFirstOnly && allowRegex) {
            return name.replace(new RegExp(searchTxt, 'g'), replaceTxt);
        }
        if (replaceFirstOnly && allowRegex) {
            return name.replace(new RegExp(searchTxt), replaceTxt);
        }
        if (!replaceFirstOnly && !allowRegex) {
            var charsToEscapeForRegex = ['\\', '/', '.', '^', '$', '*', '+', '?', '(', ')', '[', ']', '{', '|'];
            for (var i = 0; i < charsToEscapeForRegex.length; i++) {
                var curChar = charsToEscapeForRegex[i];
                searchTxt = searchTxt.replace(new RegExp(('\\' + curChar), 'g'), ('\\' + curChar));
            }
            return name.replace(new RegExp(searchTxt, 'g'), replaceTxt);
        }
    } catch (error) { }
    return name;
}

function adjustNameCasing(name, target, type) {
    if (target === 'word') {
        return name.replace(/[a-zA-Z]+/g, function (word) {
            if (type === 'upper') { return word.charAt(0).toUpperCase() + word.slice(1); }
            if (type === 'lower') { return word.charAt(0).toLowerCase() + word.slice(1); }
            return word;
        });
    }
    if (target === 'text') {
        if (type === 'upper') { return name.toUpperCase(); }
        if (type === 'lower') { return name.toLowerCase(); }
    }
    return name;
}

function fillNameWithZeros(name, digits) {
    if (isNaN(digits)) { return name; }
    var firstNumberDetection = name.match(/\d+/);
    if (!firstNumberDetection) { return name; }
    var firstNumber = firstNumberDetection[0];
    var indexOfFirstNumber = name.indexOf(firstNumber);
    var nameBeforeNumber = name.slice(0, indexOfFirstNumber);
    var nameAfterNumber = name.slice(indexOfFirstNumber + firstNumber.length);
    while (firstNumber.length < digits) { firstNumber = '0' + firstNumber }
    return nameBeforeNumber + firstNumber + nameAfterNumber;
}



function getArrRenamedElements(arrElements, objOptions, arrOptionsOrder, mode) {
    if (!arrElements || !(mode === 'files' || mode === 'subfolders')) { return; }

    if (objOptions.numbering.formularIsValid) {
        sortElementArray(arrElements, objOptions.numbering.sortName, objOptions.numbering.sortOrder);
        var selectedElementsCount = 0;
        for (var i = 0; i < arrElements.length; i++) { if (arrElements[i].isSelected === true) { selectedElementsCount++; } }
        objOptions.numbering.digits = ((objOptions.numbering.startInt + selectedElementsCount - 1) + '').length;
        if (objOptions.numbering.start.length > objOptions.numbering.digits) { objOptions.numbering.digits = objOptions.numbering.start.length; }
        objOptions.numbering.curNr = objOptions.numbering.startInt;
    }

    var parentfolderName = (arrElements.length > 0)
        ? (getCleanPath(arrElements[0].path).split('/').reverse()[1] || getCleanPath(arrElements[0].path).split('/').pop())
        : '';

    var arrElementsNew = [];
    for (var i = 0; i < arrElements.length; i++) {
        var curElement = arrElements[i];
        var name_old = curElement.name;

        var lastIndexOfPeriod = name_old.lastIndexOf('.');
        var name_old_withoutExtension = (lastIndexOfPeriod === -1) ? name_old : name_old.substring(0, lastIndexOfPeriod);
        var extension = (lastIndexOfPeriod === -1) ? '' : name_old.substring(lastIndexOfPeriod);

        // if (i === 0) { showAlert('name_old "' + name_old + '"\n' + 'name_old_withoutExtension "' + name_old_withoutExtension + '"\n' + 'extension "' + extension + '"\n'); }

        var name_new = (mode === 'files') ? name_old_withoutExtension : name_old;
        for (var y = 0; y < arrOptionsOrder.length; y++) {
            var curOption = arrOptionsOrder[y];
            // ----- name_new wird direkt manipuliert -----
            if (curOption === 'replace') {
                name_new = replaceName(
                    name_new,
                    objOptions.replace.searchtxt,
                    objOptions.replace.replacetxt,
                    objOptions.replace.firstonly,
                    objOptions.replace.allowregex
                );
            }
            else if (curOption === 'sliceafter') { name_new = sliceName(name_new, 0, objOptions.sliceafter.value); }
            else if (curOption === 'slicebefore') { name_new = sliceName(name_new, objOptions.slicebefore.value, name_new.length); }
            else if (curOption === 'casing') { name_new = adjustNameCasing(name_new, objOptions.casing.target, objOptions.casing.type); }
            else if (curOption === 'firstnumberdigits') { name_new = fillNameWithZeros(name_new, objOptions.firstnumberdigits.value); }
            // ----- Vor- und Nachschub -----
            else if (curOption === 'prefixandsuffix') {
                name_new = objOptions.prefixandsuffix.prefix + name_new + objOptions.prefixandsuffix.suffix;
            }
            else if (curOption === 'date') {
                var formattedDate = (objOptions.date.format && objOptions.date.position)
                    ? getFormattedDate(new Date(curElement[objOptions.date.type]), objOptions.date.format, objOptions.date.formatdelimiter)
                    : '';
                if (objOptions.date.position === 'start') { name_new = formattedDate + objOptions.date.delimiter + name_new; }
                if (objOptions.date.position === 'end') { name_new = name_new + objOptions.date.delimiter + formattedDate; }
            }
            else if (curOption === 'foldername') {
                var foldernamePart = (objOptions.foldername.position)
                    ? getFoldernamePart(parentfolderName, objOptions.foldername.stop)
                    : '';
                if (objOptions.foldername.position === 'start') { name_new = foldernamePart + objOptions.foldername.delimiter + name_new; }
                if (objOptions.foldername.position === 'end') { name_new = name_new + objOptions.foldername.delimiter + foldernamePart; }
            }
            else if (curOption === 'numbering') {
                if (
                    objOptions.numbering.formularIsValid && (objOptions.numbering.selectiononly === false || curElement.isSelected)
                ) {
                    var strNumber = '' + objOptions.numbering.curNr++;
                    while (strNumber.length < objOptions.numbering.digits) { strNumber = '0' + strNumber }
                    if (objOptions.numbering.position === 'start') { name_new = strNumber + objOptions.numbering.delimiter + name_new; }
                    if (objOptions.numbering.position === 'end') { name_new = name_new + objOptions.numbering.delimiter + strNumber; }
                }
            }
        }
        // ----- Immer Fix -----           
        if (mode === 'files' && objOptions.keepextension.value && !name_new.toLowerCase().endsWith(extension.toLowerCase())) {
            name_new += extension;
        }
        arrElementsNew.push({
            path: curElement.path,
            name: curElement.name,
            name_new: name_new, // <--
            size: curElement.size,
            type: curElement.type,
            attributes: curElement.attributes,
            dateCreated: curElement.dateCreated,
            dateLastModified: curElement.dateLastModified,
            isSelected: curElement.isSelected
        });
    }
    return arrElementsNew;
}

function sortElementArray(arrElements, sorter, order) {
    if (sorter === 'name') { arrElements.sort(stringSorter('name', 'size', order)); }
    else if (sorter === 'namePlus') { arrElements.sort(stringPlusSorter('name', 'size', order)); }
    else if (sorter === 'size') { arrElements.sort(numberSorter('size', 'name', order)); }
    else if (sorter === 'type') { arrElements.sort(stringSorter('type', 'name', order)); }
    else if (sorter === 'dateCreated') { arrElements.sort(dateSorter('dateCreated', 'name', order)); }
    else if (sorter === 'dateLastModified') { arrElements.sort(dateSorter('dateLastModified', 'name', order)); }
    else if (sorter === 'name_new') { arrElements.sort(stringSorter('name_new', 'size', order)); }    
}


function stringSorter(propPrimary, propSecondary, order) {
    return function (a, b) {
        var result = a[propPrimary].toString().localeCompare(b[propPrimary].toString(), undefined, { sensitivity: 'variant' });
        if (result === 0) {
            // showAlert('"' + a[propPrimary] + '" und "' + a[propPrimary] + '" sind gleich');
            var a_secondary = a[propSecondary];
            var b_secondary = b[propSecondary];
            if (a_secondary < b_secondary) return -1;
            if (a_secondary > b_secondary) return 1;
        }
        return (result * order);
    };
}
function stringPlusSorter(propPrimary, propSecondary, order) {
    return function (a, b) {
        var digits = 6;
        var a_primary_filled = fillNameWithZeros(a[propPrimary], digits);
        var b_primary_filled = fillNameWithZeros(b[propPrimary], digits);
        var result = a_primary_filled.localeCompare(b_primary_filled, undefined, { sensitivity: 'variant' });
        if (result === 0) {
            var a_secondary = a[propSecondary];
            var b_secondary = b[propSecondary];
            if (a_secondary < b_secondary) return -1;
            if (a_secondary > b_secondary) return 1;
        }
        return (result * order);
    };
}
function numberSorter(propPrimary, propSecondary, order) {
    return function (a, b) {
        var result = a[propPrimary] - b[propPrimary];
        if (result === 0) {
            return a[propSecondary].toString().localeCompare(b[propSecondary].toString(), undefined, { sensitivity: 'variant' });
        }
        return (result * order);
    };
}
function dateSorter(propPrimary, propSecondary, order) {
    return function (a, b) {
        var result = a[propPrimary] - b[propPrimary];
        if (result === 0) {
            return a[propSecondary].toString().localeCompare(b[propSecondary].toString(), undefined, { sensitivity: 'variant' });

            var a_secondary = a[propSecondary];
            var b_secondary = b[propSecondary];
            if (a_secondary < b_secondary) return -1;
            if (a_secondary > b_secondary) return 1;
        }
        return (result * order);
    };
}





function renameSelectedElements(arrElements, folderPath, mode) {
    if (!(mode === 'files' || mode === 'subfolders')) { return null; }
    var arrAllExistingNames = getArrAllNamesOfElementsInFolder(folderPath);
    // Validierung
    if (!validateNames(arrElements, arrAllExistingNames, mode)) { return; };
    // Laut Validierung keine Konflikte mit Namen, die unverändert bleiben (stable)
    // Falls ein Konflikt mit einem Namen besteht, der sich verändert, temporären Zwischennamen vergeben
    for (var i = 0; i < arrElements.length; i++) {
        var curElement = arrElements[i];
        if (curElement.isSelected && curElement.name_new !== curElement.name && curElement.name_new) { // Datei soll umbenannt werden
            var arrOtherExistingOrFutureNames = arrAllExistingNames.concat([]);
            for (var y = 0; y < arrElements.length; y++) {
                var curOtherElement = arrElements[y];
                if (
                    curOtherElement.isSelected && curOtherElement.name_new !== curOtherElement.name && curOtherElement.name_new
                    && y !== i
                    && arrOtherExistingOrFutureNames.indexOf(curOtherElement.name_new) === -1
                ) {
                    arrOtherExistingOrFutureNames.push(curOtherElement.name_new);
                }
            }
            var nameIsInUse = true;
            var tmpName = curElement.name_new;
            while (nameIsInUse) {
                nameIsInUse = false;
                for (var z = 0; z < arrOtherExistingOrFutureNames.length; z++) {
                    // Problem 
                    // 01.txt wird wie gewollt zu temp_02.txt
                    // 03.txt soll zu 02.txt werden, wird also erst zu temp_02.txt, da 02.txt noch vorhanden ist, Problem: temp_02.txt ist mittlerweile blockiert
                    if (arrOtherExistingOrFutureNames[z].toLowerCase() === tmpName.toLowerCase()) { // Eine Datei im Ordner, die umbenannt wird bzw. auch temp_... heißt, blockiert den neuen Namen
                        nameIsInUse = true;
                        tmpName = 'temp_' + tmpName;
                        break;
                    }
                }
            }
            curElement.name_new_temp = (tmpName !== curElement.name_new) ? tmpName : null;
            // showAlert(
            //     + 'Namen, die andere Dateien jetzt oder zukünftig haben:\n' + arrOtherExistingOrFutureNames + '\n\n'
            //     + 'name_new --> ' + curElement.name_new + '\n'
            //     + 'name_new_temp --> : ' + curElement.name_new_temp + '\n'
            // );
        }
    }
    // Dateien/Ordner umbenennen
    var arrProcessedElements = [];
    var elementsToProcess = 0;
    var elementsThatKeepNames = 0;
    var elementsFailed = 0;
    var elementsSuccessfullyRenamed = 0;
    for (var i = 0; i < arrElements.length; i++) {
        var curElement = arrElements[i];
        if (!curElement.isSelected || !curElement.name_new) { continue; }
        elementsToProcess++;
        if (curElement.name_new === curElement.name) { elementsThatKeepNames++; continue; }

        var newNameArgument = (curElement.name_new_temp === null) ? curElement.name_new : curElement.name_new_temp;
        var objRenamingResult = renameElement(curElement.path, newNameArgument, mode);
        if (objRenamingResult.isSuccessful === true) {
            elementsSuccessfullyRenamed++;
        }
        else {
            showAlert('Fehler beim Umbenennen von\n\n'
                + curElement.name + '\n\nin\n\n' + curElement.name_new + ((curElement.name_new_temp !== null) ? (' (' + curElement.name_new_temp + ')') : '')
                + '\n\nFehlermeldung:\n'
                + objRenamingResult.errorMsg
            );
            elementsFailed++;
        }

        var elementPath_cur = getCleanPath(curElement.path);
        var elementPath_new = elementPath_cur.slice(0, elementPath_cur.lastIndexOf('/') + 1) + curElement.name_new;

        arrProcessedElements.push({
            path_old: objRenamingResult.path_old,
            path_new: ((objRenamingResult.isSuccessful) ? objRenamingResult.path_new : elementPath_new), // Wenn temp_ muss dies auch im neuen Pfad enthalten sein, für anschließende Korrektur
            name_old: objRenamingResult.name_old,
            name_new: curElement.name_new, // Wichtig, da möglicherweise nur temp_ benannt wurde
            name_new_temp: curElement.name_new_temp,
            // size: curElement.size,
            // type: curElement.type,
            // attributes: curElement.attributes,
            isSuccessful: objRenamingResult.isSuccessful,
            errorMsg: objRenamingResult.errorMsg
        });
    }
    // alert('PAUSE');
    for (var i = 0; i < arrProcessedElements.length; i++) {
        var curProcessedElement = arrProcessedElements[i];
        // temp_ bei erfolgreichen Umbenennungen entfernen, wenn Vorschub nötig war
        if (curProcessedElement.name_new_temp !== null && curProcessedElement.isSuccessful) {
            var objRenamingResult = renameElement(curProcessedElement.path_new, curProcessedElement.name_new, mode);
            if (objRenamingResult.isSuccessful === true) {
                curProcessedElement.path_new = objRenamingResult.path_new; // temp_-Prefix wird entfernt                
            }
            else {
                showAlert(
                    'Unerwarteter Fehler beim Entfernen temporärer, nur für den Vorgang der Umbenennung ergänzter Namensanhänge beim Element\n\n'
                    + curProcessedElement.name_new_temp
                    + '\n\nFehlermeldung:\n'
                    + objRenamingResult.errorMsg
                );
                curProcessedElement.isSuccessful = false;
                curProcessedElement.errorMsg = objRenamingResult.errorMsg;
                elementsSuccessfullyRenamed--;
                elementsFailed++;
            }
        }
    }
    var infoMsg;
    if (elementsSuccessfullyRenamed === 1) {
        var processedElement = null;
        for (var i = 0; i < arrProcessedElements.length; i++) { if (arrProcessedElements[i].isSuccessful) { processedElement = arrProcessedElements[i]; break; } }
        infoMsg = ((mode === 'files') ? 'Die Datei' : 'Der Ordner') + ' "' + processedElement.name_old + '" wurde erfolgreich in "' + processedElement.name_new + '" umbenannt.';
    }
    else {
        infoMsg = 'Es wurden ' + elementsSuccessfullyRenamed + ' von ' + elementsToProcess + ' ' + ((mode === 'files') ? 'Dateien' : 'Ordnern') + ' erfolgreich umbenannt!';
    }
    if (elementsThatKeepNames > 0) {
        infoMsg += '\nBei ' + ((elementsThatKeepNames === 1) ? 'einem Element' : (elementsThatKeepNames + ' Elementen')) + ' entspricht der neue Name dem alten.'
    }
    if (elementsFailed > 0) {
        infoMsg += '\nBei ' + ((elementsFailed === 1) ? 'einem Element' : (elementsFailed + ' Elementen')) + ' kam es zu Fehlern.'
    }
    showInfo(infoMsg);
    return arrProcessedElements;
}

function validateNames(arrElements, arrAllExistingNames, mode) {
    if (!arrElements || !arrAllExistingNames || arrAllExistingNames.length === 0) { return false; }
    // Bestehende Namen im Ordner (auch versteckte), die unberührt bleiben 
    var arrStableNames = [];
    for (var i = 0; i < arrAllExistingNames.length; i++) {
        var stableName = arrAllExistingNames[i];
        var nameWillChange = false;
        for (var y = 0; y < arrElements.length; y++) {
            // bestehende Datei im Ordner ist von geplanter Umbenennung betroffen, wenn
            if (
                stableName.toLowerCase() === arrElements[y].name.toLowerCase() // Datei ist im Umbenennungs-Array vertreten
                && arrElements[y].isSelected // Datei ist für Umbenennung ausgewählt
                && arrElements[y].name !== arrElements[y].name_new // Datei erhält tatsächlich einen anderen Namen
            ) {
                nameWillChange = true;
                break;
            }
        }
        if (!nameWillChange) { arrStableNames.push(stableName); }
    }
    // Ungültige Vorkommnisse sammeln
    var countNewNamesEmpty = 0;
    var arrNewNamesEmptyBeforeExtension = [];
    var arrNewNamesTooLong = [];
    var arrNewNamesInvalid = [];
    var arrNewNamesDuplicates = [];
    var arrNewNamesInStableUse = [];
    for (var i = 0; i < arrElements.length; i++) {
        var curElement = arrElements[i];
        if (curElement.isSelected && curElement.name_new !== curElement.name) {
            // Prüfen, welcher neue Name inkl. Dateierweiterung leer ist
            if (!curElement.name_new) { countNewNamesEmpty++; continue; }
            // Prüfen, welcher neue Name exkl. Dateierweiterung leer ist
            if (mode === 'files' && curElement.name_new.lastIndexOf('.') === 0 && arrNewNamesEmptyBeforeExtension.indexOf(curElement.name_new) === -1) {
                arrNewNamesEmptyBeforeExtension.push(curElement.name_new);
            }
            // Prüfen, welcher neuer Name zu lang ist
            var elementPath_cur = getCleanPath(curElement.path);
            var elementPath_new = elementPath_cur.slice(0, elementPath_cur.lastIndexOf('/') + 1) + curElement.name_new;
            if (elementPath_new.length > 256 && arrNewNamesTooLong.indexOf(curElement.name_new) === -1) {
                arrNewNamesTooLong.push(curElement.name_new);
            }
            // Prüfen, welcher neuer Name ungültig ist
            if (!checkIfNameIsValid(curElement.name_new) && arrNewNamesInvalid.indexOf(curElement.name_new) === -1) {
                arrNewNamesInvalid.push(curElement.name_new);
            }
            // Prüfen, welcher neue Name mehrfach vorkommen wird
            for (var y = 0; y < arrElements.length; y++) {
                if (
                    i !== y
                    && arrElements[y].isSelected
                    && arrElements[y].name_new.toLowerCase() === curElement.name_new.toLowerCase()
                    && arrElements[y].name_new.toLowerCase() !== arrElements[y].name.toLowerCase()
                    && arrNewNamesDuplicates.indexOf(curElement.name_new) === -1
                ) {
                    arrNewNamesDuplicates.push(curElement.name_new);
                    break;
                }
            }
            // Prüfen, welcher neue Name mit einem Namen, der unberührt bleibt, in Konflikt steht
            for (var y = 0; y < arrStableNames.length; y++) {
                var name_stable = arrStableNames[y];
                if (
                    curElement.name_new.toLowerCase() === name_stable.toLowerCase()
                    && arrNewNamesInStableUse.indexOf(curElement.name_new) === -1
                ) {
                    arrNewNamesInStableUse.push(curElement.name_new);
                    break;
                }
            }
        }
    }
    if (countNewNamesEmpty > 0) {
        var errorMsg = (countNewNamesEmpty === 1)
            ? 'Es gibt ' + countNewNamesEmpty + ' ausgewähltes Element, dessen neuer Name leer ist.'
            : 'Es gibt ' + countNewNamesEmpty + ' ausgewählte Elemente, deren neue Namen leer sind.';
        showAlert(errorMsg);
        return false;
    }
    if (arrNewNamesTooLong.length > 0) {
        var errorMsg = ((arrNewNamesTooLong.length > 1) ? 'Die folgenden Namen sind' : 'Der folgende Name ist') + ' zu lang:\n\n';
        for (var i = 0; i < arrNewNamesTooLong.length; i++) { errorMsg += arrNewNamesTooLong[i] + '\n'; }
        errorMsg += '\nDateipfade dürfen eine Länge von 256 Zeichen nicht überschreiten.';
        showAlert(errorMsg);
        return false;
    }
    if (arrNewNamesInvalid.length > 0) {
        var errorMsg = ((arrNewNamesInvalid.length > 1) ? 'Die folgenden Namen sind' : 'Der folgende Name ist') + ' nicht zulässig:\n\n';
        for (var i = 0; i < arrNewNamesInvalid.length; i++) { errorMsg += arrNewNamesInvalid[i] + '\n'; }
        errorMsg += ''
            + '\nDatei- oder Ordnernamen dürfen folgende Zeichen nicht enthalten:\n'
            + '%5C%2C /%2C %3A%2C *%2C %3F%2C %22%2C %3C%2C %3E%2C %7C';
        showAlert(errorMsg);
        return false;
    }
    if (arrNewNamesDuplicates.length > 0) {
        var errorMsg = ((arrNewNamesDuplicates.length > 1) ? 'Die folgenden neuen Namen kommen' : 'Der folgende neue Name kommt') + ' mehrfach vor:\n\n';
        for (var i = 0; i < arrNewNamesDuplicates.length; i++) { errorMsg += arrNewNamesDuplicates[i] + '\n'; }
        errorMsg += '\nStelle sicher, dass jeder neue Name nur einmal verwendet wird.';
        showAlert(errorMsg);
        return false;
    }
    if (arrNewNamesInStableUse.length > 0) {
        var errorMsg = ((arrNewNamesInStableUse.length > 1) ? 'Die folgenden Namen werden bereits von anderen Elementen' : 'Der folgende Name wird bereits von einem anderen Element') + ' im Ordner verwendet:\n\n';
        for (var i = 0; i < arrNewNamesInStableUse.length; i++) { errorMsg += arrNewNamesInStableUse[i] + '\n'; }
        errorMsg += '\nStelle sicher, dass neue Namen noch nicht vergeben sind.';
        showAlert(errorMsg);
        return false;
    }
    if (arrNewNamesEmptyBeforeExtension.length > 0) {
        var warningMsg = ((arrNewNamesEmptyBeforeExtension.length > 1) ? 'Die folgenden Namen bestehen' : 'Der folgende Name besteht') + ' nur aus der Dateierweiterung:\n\n';
        for (var i = 0; i < arrNewNamesEmptyBeforeExtension.length; i++) { warningMsg += arrNewNamesEmptyBeforeExtension[i] + '\n'; }
        warningMsg += '\nDennoch fortfahren?';
        if (confirm(cleanTextForPopup(warningMsg)) !== true) { return false; }
    }
    return true;
}