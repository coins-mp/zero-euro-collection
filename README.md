# Zero Euro Collection

A collection of Zero Euro souvenir banknotes with front and reverse images, search, filters, and illustrated descriptions.

## Open the collections

- [Zero Euro Collection](https://coins-mp.github.io/zero-euro-collection/)
- [Euro Coin Collection](https://coins-mp.github.io/)
- [World Coin Collection](https://coins-mp.github.io/world-coin-collection/)

[Zero Euro repository](https://github.com/coins-mp/zero-euro-collection)

## Publish with GitHub Pages

1. Upload index.html, app.js, style.css, .nojekyll, data/ and images/ to the repository root.
2. Open Settings → Pages.
3. Choose Deploy from a branch → main → / (root), then Save.
4. Wait for pages build and deployment to finish in Actions.
5. Return to Settings → Pages and click Visit site, or open the Zero Euro Collection link above.

The website address assumes the repository is named exactly zero-euro-collection under the coins-mp account.

## Features

- Rectangular banknote cards with country, year, name and country and year.
- Front and reverse images in a large detail window; click either image to enlarge it.
- Previous / Next navigation with the country and year of adjacent banknotes.
- Fixed compact Country and Year details, with a separately scrolling Description and fullscreen reading mode.
- Click a point in a fullscreen image to magnify that area threefold; click again to fit. Click the black background to dismiss it.
- Automatic country flags; country and year dropdowns in the local admin.
- Description blocks containing text, optional images, captions and links.
- Search, reset filters, card/table views and light/dark themes.
- Header links between the three collections.

## Add or edit banknotes

The public website is read-only. Add, edit and delete banknotes through the separately distributed local Zero Euro admin, then use Preview Sync → Sync to GitHub.

Local catalog: http://127.0.0.1:8767/

Local admin: http://127.0.0.1:8767/admin/

These localhost links work only on the computer where the local server is running. The local package contains Start Zero Euro.command and its own installation instructions. Do not upload the local package, its database or credentials to this public repository.

All banknotes belong to the collection. There are no status controls or badges. The initial public catalog is empty. The wide collection button uses the first available reverse image once banknotes are added.

## Files

- index.html — page structure.
- app.js — catalog display and interactions.
- style.css — layout and themes.
- data/notes.json — published banknotes.
- images/ — banknote and interface images.
- data/countries.json — country choices and automatic flag codes.
- .nojekyll — direct static publication with GitHub Pages.

## Interaction update

The header reads 0 Euro Banknotes Collection. There is no duplicate year under ZERO EURO in the detail summary. Images support point-and-click zoom without separate controls. The reading dialog closes on a text/background click; clicking its image opens the same fullscreen image viewer.

The local viewer no longer reloads the catalog periodically or when focus returns to the browser. Reload the page manually to see new edits. Heartbeat requests only manage idle shutdown and do not rerender the catalog.
