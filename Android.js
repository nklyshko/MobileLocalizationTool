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
        folder.createFile('strings_' + languages[t] + '.xml',  fixAndroidXmlFormat(xml));
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
        folder.createFile('plural_strings_' + languages[t] + '.xml',  fixAndroidXmlFormat(xml));
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