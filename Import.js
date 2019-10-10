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