# Quick Copy

A Chrome extension (Manifest V3) that stores a list of copyable values and lets you copy them with one click.

## Features

- Add values with an optional display name
- Copy any value to the clipboard
- Edit or delete existing entries
- Import/export data as JSON
- Dev mode (`data-dev="true"` on `<html>`) uses built-in defaults

## Install

1. Open `chrome://extensions`
2. Enable **Developer mode**
3. Click **Load unpacked** and select this folder

## Usage

- Type a value (and optional name) then click **Add**
- Click **Copy Text** to copy a value
- Click **Edit** to modify an entry (storage mode only)
- Use **Export** / **Import** to back up or restore data

## Tech stack

HTML, CSS, JavaScript (Manifest V3)