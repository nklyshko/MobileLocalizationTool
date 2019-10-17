var translations_count = 0;
var languages = [];

var entries = [];

var STRINGS_FLAG = '[strings]';
var PLURALS_FLAG = '[plurals]';
var COMMENT_FLAG = '[comment]';
var TRANSLATIONS_START_COLUMN_ID = 2;
var PLURALS_KEY_COLUMN_ID = 1;
var FLAG_COLUMN_ID = 0;
var COMMENT_COLUMN_ID = 1;
var ANDROID_FOLDER_PREFIX = 'values-';
var IOS_FOLDER_SUFFIX = '.lproj';
var ARRAY_START = '[';
var ARRAY_END = ']';

var CommentEntry = function(value) {
    this.value = value;
};

var StringEntry = function(key, values) {
    this.key = key;
    this.values = values;
};

var ArrayEntry = function(androidKey, arrValues) {
    this.androidKey = androidKey;
    this.arrValues = arrValues;
};

var Language = function(androidFolder, iosFolder) {
    this.androidFolder = androidFolder;
    this.iosFolder = iosFolder;
};

function onOpen() {
    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Localization')
        .addSubMenu(ui.createMenu('Export')
            .addSubMenu(ui.createMenu('Strings')
                .addItem('Android', 'exportAndroidStrings')
                .addItem('iOS', 'exportIOSStrings')
            )
            .addSubMenu(ui.createMenu('Plurals')
                .addItem('Android', 'exportAndroidPlurals')
                .addItem('iOS', 'exportIOSPlurals')
            )
        )
        .addSubMenu(ui.createMenu('Import Strings')
            .addItem('Android (Initial)', 'importAndroidInitial')
            .addItem('CSV (Legacy)', 'importCSVLegacy')
        )
        .addToUi();
}

function parseLanguageAndProcessFolders(config) {
    var platforms = config.split(';');
    var currentFolder = getCurrentFolder();
    var androidFolder = createFolderIfNotExists(currentFolder, (platforms[0] === '') ? 'values' : (ANDROID_FOLDER_PREFIX + platforms[0]) /* Android folder key */);
    var iosFolder = createFolderIfNotExists(currentFolder, platforms[1]/* iOS folder key */ + IOS_FOLDER_SUFFIX);
    return new Language(androidFolder, iosFolder);
}

function parseData(flag, keyColumnId) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = sheet.getDataRange().getValues();

    translations_count = data[0].length - TRANSLATIONS_START_COLUMN_ID;
    var startRow = null;

    //parse meta
    for (var r = 0; r < data.length; r++) {
        if (data[r][FLAG_COLUMN_ID] == flag) {
            startRow = r + 1;
            for (var t = 0; t < translations_count; t++) {
                languages[t] = parseLanguageAndProcessFolders(data[r][TRANSLATIONS_START_COLUMN_ID + t]);
            }
        }
    }

    if (startRow == null) {
        return;
    }
    
    var arrayKey = undefined;
    var arrValues = [];

    if (flag == STRINGS_FLAG) {
        for (var r = startRow; r < data.length; r++) {
            if (data[r][FLAG_COLUMN_ID] == COMMENT_FLAG) {
                entries.push(new CommentEntry(data[r][COMMENT_COLUMN_ID]));
            } else {
                var key = data[r][keyColumnId];
                var values = [];
                for (var t = 0; t < translations_count; t++) {
                    values.push(data[r][TRANSLATIONS_START_COLUMN_ID + t]);
                }
                if (key.charAt(0) == ARRAY_START) {
                    arrayKey = key.substr(1);
                    arrValues.push(values);
                } else if (key.charAt(key.length - 1) == ARRAY_END) {
                    arrValues.push(values);
                    var stopKey = key.substr(0, key.length - 1);
                    if (arrayKey == stopKey) {
                        entries.push(new ArrayEntry(arrayKey, arrValues));
                    } else {
                        Logger.log('Unexpected array end: ' + arrayKey);
                    }
                    arrayKey = undefined;
                } else if (key == '') {
                    if (arrayKey != undefined) {
                        arrValues.push(values);
                    }
                } else {
                    entries.push(new StringEntry(data[r][keyColumnId], values));
                }
            }
        }
    } else if (flag == PLURALS_FLAG) {
        for (var r = startRow; r < data.length; r++) {
            if (data[r][FLAG_COLUMN_ID] == COMMENT_FLAG) {
                entries.push(new CommentEntry(data[r][COMMENT_COLUMN_ID]));
            } else if (data[r][keyColumnId] != '') {
                var k = r + 1;
                var values = new Object();
                while (k < data.length && data[k][FLAG_COLUMN_ID] == '' && data[k][PLURALS_KEY_COLUMN_ID] != '') {
                    values[data[k][PLURALS_KEY_COLUMN_ID]] = [];
                    for (var t = 0; t < translations_count; t++) {
                        values[data[k][PLURALS_KEY_COLUMN_ID]].push(data[k][TRANSLATIONS_START_COLUMN_ID + t]);
                    }
                    k++;
                }
                entries.push(new StringEntry(data[r][keyColumnId], values));
                r = k;
            }
        }
    } else {
        return;
    }
    
    return [languages, entries];
}
