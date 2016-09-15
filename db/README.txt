README.txt

For each repositories/<repository>/datasets/<version>/

The file flow is through the following directories

-> sources (manual - create precursor sheet consisting of category columns, and one amount column)
-> pending (manual - take precursor sheets and add metadata; make corrections) 
-> intake (source for automation)
-> [1.'node run preprocess' (to add codes and collect name_to_code data)]
-> maps (preprocess creates and updates name_to_code maps; make manual corrections; use 2.'node run count-names' to id orphans)
-> preprocessed (ready for further transformations into json)
-> codes (3.'node run map-codes' creates single code per names used; do manual change of names; 
-> 4.'node run continuity' creates chart showing discontinuation patterns; manual mapping of discontinued to later codes)
-> [5.'node run prepare' to add reference year codes, creates single lookups for current year]
-> prepared (ready to be used to create json file)
-> [6.'node run generate' to combine with meta to produce json files, which merge years]
-> json (json files for consumption by front end)
-> lookups (single lookup files for each category - for reference year)
-> json (.json files in this directory, ready for fetch by explorer front end)

meta contains control files for the app

maps contains name/code lookups

dataseries contains supporing data series like inflation adjustment figures

correct coding and line items by changing maps_nodes, and rerunning preprocess (processing intake files)

correct names by rerunning map-codes, and changing names in map-codes files

correct allocations by changing continuity allocations, and rerunning prepare