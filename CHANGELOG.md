# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

## [1.0.1] - 2026-09-06

### Fixed

- Global `Ctrl/Cmd+C` shortcut no longer hijacks the browser's native copy when the user has text actively selected (in a form field or anywhere on the page). Previously, pressing `Ctrl/Cmd+C` always triggered "copy the generated README markdown," silently discarding whatever text the user had actually highlighted. The shortcut now only fires its app-level action when there is no active selection, and defers to native copy behavior otherwise. (`assets/js/core.js`)
