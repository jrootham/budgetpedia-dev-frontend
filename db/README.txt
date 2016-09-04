README.txt

For each repositories/<repository>/datasets/<version>/

The file flow is through the following directories

-> pending (manual - take precursor sheets and add metadata; make corrections) 
-> intake (source for automation)
-> [1.'node run preprocess' (to add codes and collect name_to_code data)]
-> maps (preprocess creates and updates name_to_code maps; make manual corrections; use 2.'node run count-names' to id orphans)
-> preprocessed (ready for further transformations into json)
-> codes (3.'node run update-codes' creates single code per names used; do manual change of names; 4.'node run continuity-report' shows discontinuation patterns; manual mapping of discontinued to later codes)
-> [5.'node run prepare' to add reference year codes, creates single lookups for current year]
-> prepared (ready to be used to create json file)
-> lookups (single lookup files for each category - for reference year)
-> [6.'node run generate' to combine with meta to produce json files, which merge years]
-> json (.json files in this directory, ready for fetch by explorer front end)

json target files are named with filemap in settings

meta contains control files for the app

maps contains name/code lookups

dataseries contains supporing data series like inflation adjustment figures