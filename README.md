# MobileLocalizationTool for Google Spreadsheet
Supports Android(strings.xml, plural_strings.xml, not support \<string-array>) and iOS(Localizable.strings, Localizable.stringsdict)

## Strings localization sheet format
|   |       A       |       B        |    C    |    D    |    E    |
|---|---------------|----------------|---------|---------|---------|
| 1 | Android key   | iOS key        | Russian | English | Spanish |
| 2 | **[strings]** |                | ru      | en      | es      |
| 3 | **[comment]** | Comment string |         |         |         |
| 4 | example_key   | EXAMPLE_KEY    | ключ    | key     | llave   |

[Example strings sheet on google docs](https://docs.google.com/spreadsheets/d/1dWfvRFGfIa81SjQ66cRCcbkPNAVWGMvigDsSVtVisvc/edit?usp=sharing)
To clone it to your drive use File -> Create copy


## Plurals localization sheet format

|    |       A       |       B        |    C    |    D    |    E    |
|----|---------------|----------------|---------|---------|---------|
|  1 | Android key   | iOS key        | Russian | English | Spanish |
|  2 | **[plurals]** |                | ru      | en      | es      |
|  3 | **[comment]** | Comment string |         |         |         |
|  4 | example_key   | EXAMPLE_KEY    |         |         |         |
|  5 |               | zero           | Ничего  | Nothing | Nada    |
|  6 |               | one            | Один    | One     | Uno     |
|  7 |               | two            | Два     | Two     | Par     |
|  8 |               | few            | Мало    | Few     | Pocos   |
|  9 |               | many           | Много   | Many    | Muchos  |
| 10 |               | other          | Другое  | Other   | Otro    |

[Example plurals sheet on google docs](https://docs.google.com/spreadsheets/d/1ZZQuJRoyISnadn7oQXnuZvTHAK3S28kxFb-QYgkxcBY/edit?usp=sharing)
To clone it to your drive use File -> Create copy

## Exporting

### Strings files:
Localization -> Export -> Strings -> Android OR iOS

Generated files will appear at google drive near the spreadsheet file.

### Plurals files:
Localization -> Export -> Plurals -> Android OR iOS

Generated files will appear at google drive near the spreadsheet file.


## Importing*
Supported importing from specific file formats. See example of initial import file (strings.xml) and legacy csv format from excel (translate.csv)