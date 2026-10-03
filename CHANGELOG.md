# Changelog

All notable changes to Dicey Dungeon will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).


## [1.3.1] - 2026-10-03

### Fixed
- Roll numbers after a page reload (every roll showed the same number)
- Turning on "Generate Room Images" threw an error (`toggleRoomVisualization` was missing); it now adds or removes drawings for existing rolls
- Entrance triangle size (it used an undefined theme value, so dynamic sizing never worked)
- Legend layout: entrance text alignment leaked into the legend
- Theme `update()` changed the default theme, so `reset()` didn't restore it
- "Immediate doorway" (D4 = 1) now draws a door with no hallway
- Saved custom tables from older versions (e.g. 100-entry D100) are ignored per die instead of breaking rolls
- Randomize on the customize page filled every die with room names; D8, D12 and D20 now get fitting entries, and dice that drive the drawing (D4, D6, D10, D100) have no randomize buttons
- Roll sound now replays on rapid clicks
- Room drawings are sharp on high-DPI screens
- Table text is shown as plain text, so imported tables can't inject HTML

### Removed
- Broken window-resize handler in `script.js` (each drawing already handles its own resizing)
- Unused `rollsound.wav` (the smaller `rollsound.mp3` is used instead) and empty placeholder files

## [1.3.0] - 2024-11-22

### Added
- Hallway visualization attached to room grid
- Door markers at hallway entry and exit points
- Direct D4 roll value determines hallway length

### Changed
- Modified D100 implementation to work as D10 for room length (5-90ft)
- Updated roll table customization to show 10 entries for D100 instead of 100
- Aligned legend colors with visualization (white doors, gold text)
- Added measurement clarifications to dice descriptions
- Improved spacing in visualization legend

### Fixed
- Room grid and hallway alignment
- Legend symbol and text overlap
- D100 roll table descriptions to match actual room lengths
- Canvas sizing to prevent visualization overlap with legend

## [1.2.0] - 2024-11-12

### Added
- Dynamic sizing for entrance triangle
- Thicker border around room grid in accent color
- Configurable theme system for room visualization

### Changed
- Replaced entrance arrow with triangle symbol (▲)
- Updated exit legend to use text symbol (▬) instead of square
- Improved exit door alignment on grid borders
- Enhanced room visualization styling and layout
- Centralized room visualization theming configuration
- Updated grid cell border styling

### Fixed
- Exit door alignment on grid borders
- Grid border consistency
- Room visualization spacing and scaling
- Entrance marker positioning

## [1.1.0] - 2024-11-10

### Added
- Top navigation bar in customize page
- "Save All" functionality for roll tables
- Export/Import feature for custom roll tables
- Global success/error messaging system
- Structured form inputs for roll table customization
- Room visualization using React framework

### Changed
- Reordered dice sections from D4 to D20 (then D100)
- Improved navigation with top and bottom buttons
- Enhanced error handling and validation
- Updated customize page layout and styling

### Fixed
- Empty field validation in roll tables
- Input field population on page load
- Error message display consistency

## [1.0.0] - 2024-11-09
### Added
- Initial release
- Basic dice rolling functionality
- Customizable roll tables
- Roll history tracking
- Local storage support
- Configuration panel with feature toggles
- Sound effects for rolling
- Matching number highlights
- Mobile-responsive design

### Features
- Roll all standard DnD dice (D4, D6, D8, D10, D12, D20, D100)
- Customize roll tables for each die
- Save roll history
- Export roll history to text file
- Reset functionality
- Animated roll results

[Unreleased]: https://github.com/yourusername/DiceyDungeon/compare/v1.2.0...HEAD
[1.2.0]: https://github.com/yourusername/DiceyDungeon/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/yourusername/DiceyDungeon/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/yourusername/DiceyDungeon/releases/tag/v1.0.0