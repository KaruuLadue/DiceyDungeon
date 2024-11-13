<p align="center">
  <img src="./images/logo.png" alt="Dicey Dungeon" width="50%" max-width="300"/>
</p>

**[Try Here](https://karuuladue.github.io/DiceyDungeon/index.html)**

<p>Dicey Dungeon started as an experiment to explore the capabilities of generative AI in programming, aiming to create a full web app with minimal human intervention. By providing design requirements and iterating based on feedback, the coding was entirely accomplished using Claude 3.5, Sonnet, and ChatGPT 4.0.
</p>
<p>
The resulting tool, Dicey Dungeon, is a web-based application that generates randomized dungeon room scenarios using a full polyhedral dice set. It features customizable roll tables, dynamic room diagrams, and save/load functionality and more. Dicey Dungeon caters to Dungeon Masters looking for quick dungeon setups or players seeking unique solo dungeons to delve.
</p>

<center>### <a href="https://karuuladue.github.io/DiceyDungeon/index.html" target="_blank">Try Here</a></center>

## Features
- Simple interface for easy dungeon-building with the ability to disable features.
- Roll up to 7 dice to generate dungeon layouts and room features.
- Customize roll tables for each die to suit your own adventure.
- Export roll history to a text file for easy session record-keeping.
- Save custom roll tables to local storage for personalized play.
- Animated dice results with an optional matching number highlight.
- Advanced room visualization system with:
  - Dynamic grid rendering
  - Customizable themes and styling
  - Automatic sizing and scaling
  - Clear entrance and exit markers
  - Configurable border and grid styles
- Export individual room diagrams or batch download multiple rooms.

## Installation
Clone this repository to your local machine:

```sh
git clone https://github.com/YOUR_USERNAME/DiceyDungeon.git
```

Then, navigate into the project directory:

```sh
cd DiceyDungeon
```

## Usage
To run Dicey Dungeon:
1. Open `index.html` in your preferred browser.
2. Click **Roll** to generate a dungeon section. The results will be displayed, with all relevant dice rolls.
3. Use the **Reset** button to clear the current roll history.
4. Click **Customize** to adjust the roll tables and create your own personalized dungeon experience.
5. The **Export** button allows you to download a text file of all rolls for easy record-keeping.
6. Room visualizations are automatically generated and can be customized through the settings panel.

## Customization
The **Customize** feature allows users to modify the default roll tables for different dice. Changes are stored in the browser's local storage, so they persist across sessions.
- **Save**: Saves your changes to local storage.
- **Reset**: Reverts a roll table back to its default values.
- **Go Back**: Returns you to the main page, where you can use your customized roll tables.

### Room Visualization Themes
The room visualization system supports customizable themes including:
- Grid cell size and border styles
- Room entrance and exit markers
- Background and accent colors
- Text styling and positioning
- Border thickness and colors

## Dependencies
- This project uses vanilla JavaScript, HTML, and CSS.
- Audio for the roll sound is located at `audio/rollsound.wav`.
  
## Milestones
- [x] Add a customization page for roll tables.
- [x] Save and load roll history using browser local storage.
- [x] Add more sound effects for rolling specific dice.
- [x] Add Settings panel and toggles (sound,highlight,dice rolls)
- [x] Implement additional room types and random events for even more variety.
- [x] Implement visuals to represent each rooms details.
- [x] Add proper versioning and Changelog updates
- [x] Add advanced room visualization with customizable themes
- [ ] Implement batch room export functionality
- [ ] Add additional visualization themes and presets

## Contributing
Contributions are welcome! Feel free to submit a pull request or open an issue with ideas, improvements, or bug reports.

## License
This project is licensed under the MIT License. See the `LICENSE` file for details.

## Acknowledgments
- Inspired by classic dungeon-crawling adventures and the unpredictable fun of rolling physical dice.
- Special thanks to all the tabletop role-playing enthusiasts who provided feedback and ideas for this project.
- Version 1.2.0 introduces significant improvements to room visualization and customization options.
