var IOS_COMMENT_START = '/*';
var IOS_COMMENT_END = '*/';
var STRINGS_FLAG = '[strings]';
var PLURALS_FLAG = '[plurals]';
var IOS_KEY_COLUMN_ID = 1;

var CommentEntry = function(value) {
    this.value = value;
};

var StringEntry = function(key, values) {
    this.key = key;
    this.values = values;
};

var Language = function(androidFolder, iosFolder) {
    this.androidFolder = androidFolder;
    this.iosFolder = iosFolder;
};

function exportIOSStrings() {
    const [languages, entries] = parseData(STRINGS_FLAG, IOS_KEY_COLUMN_ID);
    if (entries === undefined || languages === undefined) {
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
        createFileIfNotExists(languages[t].iosFolder, 'Localizable.strings').setContent(contents[t]);
    }
}

function exportIOSPlurals() {
    const [languages, entries] = parseData(PLURALS_FLAG, IOS_KEY_COLUMN_ID);
    if (entries === undefined || languages === undefined) {
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
        createFileIfNotExists(languages[t].iosFolder, 'Localizable.stringsdict').setContent(xml);
    }
}