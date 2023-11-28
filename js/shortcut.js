function createShortcuts(pinToDesktop, pinToStartmenu) {

    var emrenameFilepath = window.location.pathname;
    var pathSplitted = emrenameFilepath.split('\\');
    if (pathSplitted.length > 1) { pathSplitted.pop(); }
    var emrenameRootpath = (pathSplitted.length > 1) ? pathSplitted.join('\\') : pathSplitted.toString() + '\\';

    var filename = 'EmRename';
    var iconLocation = emrenameRootpath + '\\img\\emrename.ico';
    var description = 'Mehrere Dateien schematisch umbenennen';

    // https://admhelp.microfocus.com/uft/en/all/VBScript/Content/html/d91b9d23-a7e5-4ec2-8b55-ef6ffe9c777d.htm
    var wshShell = new ActiveXObject('WScript.Shell');

    if (pinToDesktop) {
        var pathDesktop = wshShell.SpecialFolders('Desktop');
        var shortcutDesktop = wshShell.CreateShortcut(pathDesktop + '\\' + filename + '.lnk');
        shortcutDesktop.TargetPath = emrenameFilepath;
        shortcutDesktop.WorkingDirectory = emrenameRootpath;
        // shortcutDesktop.Hotkey = 'CTRL+SHIFT+E';
        shortcutDesktop.WindowStyle = 1;
        shortcutDesktop.Description = description;
        shortcutDesktop.IconLocation = iconLocation;
        shortcutDesktop.Save();
    }
    if (pinToStartmenu) {
        var pathSartmenu = wshShell.SpecialFolders('StartMenu');
        //  SpecialFolders('StartMenu') = %USERPROFILE%\AppData\Roaming\Microsoft\Windows\Start Menu
        var shortcutStartmenu = wshShell.CreateShortcut(pathSartmenu + '\\Programs\\' + filename + '.lnk');
        shortcutStartmenu.TargetPath = emrenameFilepath;
        shortcutStartmenu.WorkingDirectory = emrenameRootpath;
        shortcutStartmenu.WindowStyle = 1;
        shortcutStartmenu.Description = description;
        shortcutStartmenu.IconLocation = iconLocation;
        shortcutStartmenu.Save();
    }

    var strInfo = 'EmRename wurde '
        + ((pinToDesktop && !pinToStartmenu) ? 'erfolgreich zum Desktop' : '')
        + ((!pinToDesktop && pinToStartmenu) ? 'erfolgreich zum Startmenü' : '')
        + ((pinToDesktop && pinToStartmenu) ? 'erfolgreich zum Desktop und zum Startmenü' : '')
        + ((!pinToDesktop && !pinToStartmenu) ? 'werder zum Desktop noch zum Startmenü' : '')
        + ' hinzugefügt.'
    showInfo(strInfo);
}


function showAppPath() {
    // Pfad der HTA-Datie selbst
    alert(
        'window.location.href:\n' + window.location.href + '\n\n'
        + 'window.location.pathname:\n' + window.location.pathname + '\n\n'
        + 'document.location.pathname:\n' + document.location.pathname + '\n\n'
        + 'top.location.pathname:\n' + top.location.pathname + '\n\n'
        + 'EmRename.commandLine:\n' + EmRename.commandLine
    );
}


