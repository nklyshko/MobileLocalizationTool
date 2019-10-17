# MobileLocalizationTool for Google Spreadsheet
Supports Android(strings.xml, plurals.xml) and iOS(Localizable.strings, Localizable.stringsdict)

## Installation

### Requirements
- Git (https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)
- Clasp (https://developers.google.com/apps-script/guides/clasp#requirements)

### Steps
1. Clone this repository using Git
1. Create new spreadsheet
1. Go Tools -> Script Editor
1. In Script Editor: Go File -> Project Properties
1. Enter project name
1. Again Go File -> Project Properties AND Copy script identificator
1. Paste script identificatior to .clasp.json (in root of this repository)
1. Run "clasp push" in your terminal

## Strings localization sheet format
|   |       A       |       B        |    C    |    D    |    E     |
|---|---------------|----------------|---------|---------|----------|
| 1 | Android key   | iOS key        | Russian | English | Spanish  |
| 2 | **[strings]** |                | ;ru     | en;en   | es-rES;es|
| 3 | **[comment]** | Comment string |         |         |          |
| 4 | example_key   | EXAMPLE_KEY    | ключ    | key     | llave    |
| 5 |[example_array | EXAMPLE_ITEM_1 | элем1   | item1   | art1     |
| 6 |               | EXAMPLE_ITEM_2 | элем2   | item2   | art2     |
| 7 |               | EXAMPLE_ITEM_3 | элем3   | item3   | art3     |
| 8 |example_array] | EXAMPLE_ITEM_4 | элем4   | item4   | art4     |


[Example strings sheet on google docs](https://docs.google.com/spreadsheets/d/1dWfvRFGfIa81SjQ66cRCcbkPNAVWGMvigDsSVtVisvc/edit?usp=sharing)
To clone it to your drive use File -> Create copy


## Plurals localization sheet format

|    |       A       |       B        |    C    |    D    |    E     |
|----|---------------|----------------|---------|---------|----------|
|  1 | Android key   | iOS key        | Russian | English | Spanish  |
|  2 | **[plurals]** |                | ;ru     | en;en   | es-rES;es|
|  3 | **[comment]** | Comment string |         |         |          |
|  4 | example_key   | EXAMPLE_KEY    |         |         |          |
|  5 |               | zero           | Ничего  | Nothing | Nada     |
|  6 |               | one            | Один    | One     | Uno      |
|  7 |               | two            | Два     | Two     | Par      |
|  8 |               | few            | Мало    | Few     | Pocos    |
|  9 |               | many           | Много   | Many    | Muchos   |
| 10 |               | other          | Другое  | Other   | Otro     |
| 11 |               |                |         |         |          |


[Example plurals sheet on google docs](https://docs.google.com/spreadsheets/d/1ZZQuJRoyISnadn7oQXnuZvTHAK3S28kxFb-QYgkxcBY/edit?usp=sharing)
To clone it to your drive use File -> Create copy

### **Attention!!! !!! !!!**
Last empty row is plurals section delimiter! Next plurals must be placed after single empty row **OR** comment entry.

## Exporting

### Strings files:
Localization -> Export -> Strings -> Android OR iOS

Generated files will appear at google drive near the spreadsheet file.

### Plurals files:
Localization -> Export -> Plurals -> Android OR iOS

Generated files will appear at google drive near the spreadsheet file.


## Importing*
Supported importing from specific file formats. See example of initial import file (strings.xml) and legacy csv format from excel (translate.csv)