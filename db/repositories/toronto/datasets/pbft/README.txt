README.txt

The file flow is as follows

sources (manual)
-> ready (manual)
-> intake (source for automation)
-> [preprocessing (to add codes)]
-> preprocessed
-> [preparation to add reference year codes]
-> prepared
-> [process to combine with meta to produce json files, which merge years]
-> .json files in this directory

json target files are named with filemap.json

meta contains control files for the app

maps contains name/code lookups

dataseries contains supporing data series like inflation adjustment figures