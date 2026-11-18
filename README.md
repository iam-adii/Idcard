# ATS iCard Builder (Windows)

Local desktop ID card builder for ATS facilities. Packaged with Electron. All cards and templates are stored on the PC in a local database file — no cloud required.

## Data storage

On install/run, data is saved to:

`%APPDATA%\ats-icard-builder\database.json`

Includes ID cards, templates, photos, and template images for that machine.

## Create ID card fields

- Employee photo
- Name *
- Designation *
- Employee ID * (auto-generated, editable)
- Date of Birth (`DD/MM/YYYY`)
- Blood Group
- Emergency Contact
- Identification Marks

## Develop

```sh
npm install
npm run electron:dev
```

Login password: `2362`

## Build Windows installer

```sh
npm run electron:build
```

Share the installer from `release/` (e.g. `ATS iCard Builder Setup 1.0.0.exe`).
