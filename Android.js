var STRINGS_FLAG = '[strings]';
var PLURALS_FLAG = '[plurals]';
var ANDROID_KEY_COLUMN_ID = 0;

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

function exportAndroidStrings() {
    const [languages, entries] = parseData(STRINGS_FLAG, ANDROID_KEY_COLUMN_ID);
    if (entries === undefined || languages === undefined) {
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
        var xml = fixAndroidXmlFormat(XmlService.getPrettyFormat().format(XmlService.createDocument(roots[t])));
        createFileIfNotExists(languages[t].androidFolder, 'strings.xml').setContent(xml);
    }
}

function exportAndroidPlurals() {
    const [languages, entries] = parseData(PLURALS_FLAG, ANDROID_KEY_COLUMN_ID);
    if (entries === undefined || languages === undefined) {
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
        var xml = fixAndroidXmlFormat(XmlService.getPrettyFormat().format(XmlService.createDocument(roots[t])));
        createFileIfNotExists(languages[t].androidFolder, 'plurals.xml').setContent(xml);
    }
}

function escapeAndroidString(str) {
    return str
        .replace(/\@/g, '\\@')
        .replace(/\?/g, '\\?')
        .replace(/\&/g, '&amp;')
        .replace(/\</g, '&lt;')
        .replace(/\'/g, '&apos;')
        .replace(/\"/g, '&quot;')
        .replace(/\.{3}/g, '&#8230;');
  
}

function fixAndroidXmlFormat(xml) {
    return xml
        .replace(/\&amp;amp;/g, '&amp;')
        .replace(/\&amp;lt;/g, '&lt;')
        .replace(/\&amp;apos;/g, '&apos;')
        .replace(/\&amp;quot;/g, '&quot;')
        .replace(/\&amp;#8230;/g, '&#8230;');
}