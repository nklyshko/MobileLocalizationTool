var translations_count = 0;
var languages = [];

var entries = [];

var STRINGS_FLAG = '[strings]';
var PLURALS_FLAG = '[plurals]';
var COMMENT_FLAG = '[comment]';
var ANDROID_KEY_COLUMN_ID = 0;
var IOS_KEY_COLUMN_ID = 1;
var TRANSLATIONS_START_COLUMN_ID = 2;
var PLURALS_KEY_COLUMN_ID = 1;
var FLAG_COLUMN_ID = 0;
var COMMENT_COLUMN_ID = 1;

var CommentEntry = function(value) {
        this.value = value;
    };

var StringEntry =function(key, values) {
        this.key = key;
        this.values = values;
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

function exportAndroidStrings() {
    var folder = getCurrentFolder();
    
    if (!parseData(STRINGS_FLAG, ANDROID_KEY_COLUMN_ID)) {
        SpreadsheetApp.getUi().alert("Can't parse strings file");
        return;
    }

    var roots = [];
    for (var t = 0; t < translations_count; t++) {
        roots.push(XmlService.createElement('resources'));
    }
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof CommentEntry) {
            for (var t = 0; t < translations_count; t++) {
                roots[t].addContent(XmlService.createComment(entry.value));
            }
        } else {
            for (var t = 0; t < translations_count; t++) {
                var stringElement = XmlService.createElement('string');
                stringElement.setAttribute('name', entry.key);
                stringElement.setText(escapeAndroidString(entry.values[t]));
                roots[t].addContent(stringElement);
            }
        }
    }
    for (var t = 0; t < translations_count; t++) {
        var xml = XmlService.getPrettyFormat().format(XmlService.createDocument(roots[t]));
        folder.createFile('strings_' + languages[t] + '.xml',  xml);
    }
}

function exportAndroidPlurals() {
    var folder = getCurrentFolder();

    if (!parseData(PLURALS_FLAG, ANDROID_KEY_COLUMN_ID)) {
        SpreadsheetApp.getUi().alert("Can't parse plurals file");
        return;
    }

    var roots = [];
    for (var t = 0; t < translations_count; t++) {
        roots.push(XmlService.createElement('resources'));
    } 
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof CommentEntry) {
            for (var t = 0; t < translations_count; t++) {
                roots[t].addContent(XmlService.createComment(entry.value));
            }
        } else {
            for (var t = 0; t < translations_count; t++) {
                var pluralsRoot = XmlService.createElement('plurals');
                pluralsRoot.setAttribute('name', entry.key);
                for (key in entry.values) {
                    var itemElement = XmlService.createElement('item');
                    itemElement.setAttribute('quantity', key);
                    itemElement.setText(escapeAndroidString(entry.values[key][t]));
                    pluralsRoot.addContent(itemElement);
                }
                roots[t].addContent(pluralsRoot);
            }
        }
    }
    for (var t = 0; t < translations_count; t++) {
        var xml = XmlService.getPrettyFormat().format(XmlService.createDocument(roots[t]));
        folder.createFile('plural_strings_' + languages[t] + '.xml',  xml);
    }
}

var IOS_COMMENT_START = '/*';
var IOS_COMMENT_END = '*/';

function exportIOSStrings() {
    var folder = getCurrentFolder();

    if (!parseData(STRINGS_FLAG, IOS_KEY_COLUMN_ID)) {
        SpreadsheetApp.getUi().alert("Can't parse strings file");
        return;
    }

    var contents = [];
    for (var t = 0; t < translations_count; t++) {
        contents.push('');
    }

    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof CommentEntry) {
            for (var t = 0; t < translations_count; t++) {
                contents[t] += IOS_COMMENT_START + entry.value + IOS_COMMENT_END + '\n';
            }
        } else {
            for (var t = 0; t < translations_count; t++) {
                contents[t] += '"' + entry.key + '" = "' + entry.values[t] + '";\n';
            }
        }
    }

    for (var t = 0; t < translations_count; t++) {
        folder.createFile('Localizable_' + languages[t] + '.strings',  contents[t]);
    }
}

function exportIOSPlurals() {
    var folder = getCurrentFolder();

    if (!parseData(PLURALS_FLAG, IOS_KEY_COLUMN_ID)) {
        SpreadsheetApp.getUi().alert("Can't parse plurals file");
        return;
    }

    var documents = [];
    var roots = [];
    for (var t = 0; t < translations_count; t++) {
        var document = XmlService.createDocument();
        document.addContent(XmlService.createDocType('plist', '-//Apple//DTD PLIST 1.0//EN', 'http://www.apple.com/DTDs/PropertyList-1.0.dtd'));
        var plistElement = XmlService.createElement('plist');
        plistElement.setAttribute('version', '1.0');
        var dictElement = XmlService.createElement('dict');
        plistElement.addContent(dictElement);
        document.addContent(plistElement);

        roots.push(dictElement);
        documents.push(document);
    } 
    for (var i = 0; i < entries.length; i++) {
        var entry = entries[i];
        if (entry instanceof CommentEntry) {
            for (var t = 0; t < translations_count; t++) {
                roots[t].addContent(XmlService.createComment(entry.value));
            }
        } else {
            for (var t = 0; t < translations_count; t++) {
                var keyElement = XmlService.createElement('key');
                keyElement.setText(entry.key);

                roots[t].addContent(keyElement);

                var dictElement = XmlService.createElement('dict');
                var formatKeyTypeElement = XmlService.createElement('key');
                formatKeyTypeElement.setText('NSStringLocalizedFormatKey');
                var formatStringElement = XmlService.createElement('string');
                formatStringElement.setText('%#@value@');
                var formatKeyElement = XmlService.createElement('key');
                formatKeyElement.setText('value');
                dictElement.addContent(formatKeyTypeElement);
                dictElement.addContent(formatStringElement);
                dictElement.addContent(formatKeyElement);

                var variantsDictElement = XmlService.createElement('dict');
                var formatTypeElement = XmlService.createElement('key');
                formatTypeElement.setText('NSStringFormatSpecTypeKey');
                var formatRuleElement = XmlService.createElement('string');
                formatRuleElement.setText('NSStringPluralRuleType');
                var formatValueElement = XmlService.createElement('key');
                formatValueElement.setText('NSStringFormatValueTypeKey');
                var formatSymbolElement = XmlService.createElement('string');
                formatSymbolElement.setText('d');
                variantsDictElement.addContent(formatTypeElement);
                variantsDictElement.addContent(formatRuleElement);
                variantsDictElement.addContent(formatValueElement);
                variantsDictElement.addContent(formatSymbolElement);
                for (key in entry.values) {
                    var variantKeyElement = XmlService.createElement('key');
                    variantKeyElement.setText(key);
                    var variantStringElement = XmlService.createElement('string');
                    variantStringElement.setText(entry.values[key][t]);

                    variantsDictElement.addContent(variantKeyElement);
                    variantsDictElement.addContent(variantStringElement);
                }
                dictElement.addContent(variantsDictElement);

                roots[t].addContent(dictElement);
            }
        }
    }
    for (var t = 0; t < translations_count; t++) {
        var xml = XmlService.getPrettyFormat().format(documents[t]);
        folder.createFile('Localizable_' + languages[t] + '.stringsdict',  xml);
    }
}

var IMPORT_ORIGINAL_COLUMN_ID = 2;

function importAndroidInitial() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var xml = getCurrentFolder().getFilesByName('strings.xml').next().getBlob().getDataAsString();
    var root = XmlService.parse(xml).getContent(0).asElement();
    var pos = 3;
    var contents = root.getAllContent();
    for (var i = 0; i < contents.length; i++) {
        var content = contents[i];
        if (content.getType() == XmlService.ContentTypes.COMMENT) {
            sheet.getRange(pos, ANDROID_KEY_COLUMN_ID + 1).setValue('[comment]');
            sheet.getRange(pos, IOS_KEY_COLUMN_ID + 1).setValue(content.asComment().getText());
            pos++;
        } else if (content.getType() == XmlService.ContentTypes.ELEMENT) {
            var str = content.asElement();
            if (str.getText().replace(/[ \t\n\r]/gm,'').length > 0) {
                sheet.getRange(pos, ANDROID_KEY_COLUMN_ID + 1).setValue(str.getAttribute('name').getValue());
                sheet.getRange(pos, IMPORT_ORIGINAL_COLUMN_ID + 1).setValue(str.getText());
                pos++;
            }
        }
        
    }
}

var IMPORT_LOCALIZATIONS_COUNT = 3;
var CSV_ORIGINAL_COLUMN_ID = 1;
var CSV_KEY_COLUMN_ID = 0;

function importCSVLegacy() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var csv = getCurrentFolder().getFilesByName('translate.csv').next().getBlob().getDataAsString();
    var data = Utilities.parseCsv(csv); 
    var map = {};
    var values = sheet.getDataRange().getValues();
    for (var i = 3; i < values.length; i++) {
        var original = values[i][IMPORT_ORIGINAL_COLUMN_ID];
        if (original != '[comment]' && map[original] == undefined) {
            map[original] = i;
        }
    }
    var notMatched = [];
    for (var i = 0; i < data.length; i++) {
        var original = data[i][CSV_ORIGINAL_COLUMN_ID];
        if (original.length == 0) continue;
        var row = map[original];
        if (row != undefined) {
            sheet.getRange(row + 1, IOS_KEY_COLUMN_ID + 1).setValue(data[i][CSV_KEY_COLUMN_ID]);
            sheet.getRange(row + 1, IMPORT_ORIGINAL_COLUMN_ID + 1 + 1, 1, IMPORT_LOCALIZATIONS_COUNT).setValues(
                [data[i].slice(CSV_ORIGINAL_COLUMN_ID + 1, CSV_ORIGINAL_COLUMN_ID + IMPORT_LOCALIZATIONS_COUNT + 1)]
            );
        } else {
            notMatched.push(data[i]);
        }
    }
    var lastRaw = sheet.getLastRow();
    for (var i = 0; i < notMatched.length; i++) {
        var row = lastRaw + i + 1;
        sheet.getRange(row, IOS_KEY_COLUMN_ID + 1).setValue(notMatched[i][CSV_KEY_COLUMN_ID]);
        sheet.getRange(row, IMPORT_ORIGINAL_COLUMN_ID + 1, 1, IMPORT_LOCALIZATIONS_COUNT + 1).setValues(
            [notMatched[i].slice(CSV_ORIGINAL_COLUMN_ID, CSV_ORIGINAL_COLUMN_ID + IMPORT_LOCALIZATIONS_COUNT + 1)]
        );
    }
    SpreadsheetApp.getUi().alert("Not matched " + notMatched.length + " strings.");
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
                languages[t] = data[r][TRANSLATIONS_START_COLUMN_ID + t];
            }
        }
    }

    if (startRow == null) {
        return false;
    }
    
    if (flag == STRINGS_FLAG) {
        for (var r = startRow; r < data.length; r++) {
            if (data[r][FLAG_COLUMN_ID] == COMMENT_FLAG) {
                entries.push(new CommentEntry(data[r][COMMENT_COLUMN_ID]));
            } else if (data[r][keyColumnId] != '') {
                var values = [];
                for (var t = 0; t < translations_count; t++) {
                    values.push(data[r][TRANSLATIONS_START_COLUMN_ID + t]);
                }
                entries.push(new StringEntry(data[r][keyColumnId], values));
            }
        }
    } else if (flag == PLURALS_FLAG) {
        for (var r = startRow; r < data.length; r++) {
            if (data[r][0] == COMMENT_FLAG) {
                entries.push(new CommentEntry(data[r][1]));
            } else if (data[r][FLAG_COLUMN_ID] != '' && data[r][keyColumnId] != ''){
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
        return false;
    }
    
    return true;
}

function escapeAndroidString(str) {
    return str
        .replace('@', '\\@')
        .replace('?', '\\?')
        .replace('<', '&lt;')
        .replace('&', '&amp;')
        .replace("'", "\\'")
        .replace('"', '\\"');
}

function getCurrentFolder() {
    return DriveApp.getFileById(SpreadsheetApp.getActive().getId()).getParents().next();
}