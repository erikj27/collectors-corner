# collectors-corner

some light, nifty tools

## updateMetrics.js

`updateMetrics.js` gets collection metrics and writes to Excel. It reads from `collectionIds.txt`

Before running `updateMetrics.js`, add any new collectionIds to the `collectionIds.txt` file. This is generally the contract address plus modifiers like for Art Blocks token range. See the existing file for examples. Each line should contain one collection ID. You can also add comments in this file using the `#` symbol at the end of the line; stuff past this will be ignored

You can run `updateMetrics.js` via node
