# Decap CMS 3.8.3

Pinned official bundle: https://unpkg.com/decap-cms@3.8.3/dist/decap-cms.js
Project: https://github.com/decaporg/decap-cms (MIT license; upstream notices retained in bundle).

Local patch enables click-to-toggle multi-selection and multi-file upload in the existing media dialog for the album-photos widget. Cover images and other fields keep single selection. The album widget consumes the resulting path array and retains captions.

Regenerate using scripts/build-decap-album-picker.mjs with the original 3.8.3 bundle. Exact source assertions deliberately stop on incompatible upstream versions.
