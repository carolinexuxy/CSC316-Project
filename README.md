# Is Avatar: The last Airbender for Adults?
## Project Overview
This data visualization project explores _Avatar: The Last Airbender_ through multiple dimensions such as conflict, character relationships, and thematic development to show why the series resonates far beyond its label as a children’s show. Designed for both newcomers and longtime fans, it offers an accessible introduction for those new to the series while delivering engaging insights for those already familiar with it.

### Project Links
- Website: https://anslau.github.io/CSC316-Project/ 
- Process Book: https://docs.google.com/document/d/1cV0PRwkoy0EmeucEcbYWhu2EpdRbCtlLl4LC3lgW4m4/edit?usp=sharing 
- Video Demo: https://www.youtube.com/watch?v=zDxW_iqVwsY

## Project Structure
```plaintext
CSC316-Project/
├── css/              # Global stylesheet
├── data              # Datasets
│   ├── processed/    # Cleaned and processed data
│   └── raw/          # Raw datasets
├── img/              # Image files
├── js/               # D3 Visualizations
├── scripts/          # Data processing scripts
└── index.html        # Entry point
```

### Visualizations
Visualizations are listed by order of appearance:
| File | Description |
|------|------------|
| `moral_ring.js` | Radial visualization of how characters express moral themes in their dialogue over time. Toggle between traits and themes. |
| `elemental_rings.js` | Radial visualization of how character traits, grouped by elements, evolve throughout the series. Toggle between traits and themes. |
| `element_bending.js` | Dot visualization of how often each element is mentioned, with interactive filtering by character. |
| `fights_network.js` | Network of character fight relationships linked to `fights_bubbles.js`. Click on each character node to filter fights by character. |
| `fights_bubbles.js` | Bubble map of fight occurrences throughout the series. Zoom or hover for more details.  |
| `themes_timeline.js` | Timeline of different themes as they appear across the series. Filter by certain themes or brush for more details. |

## Running the Project Locally

We recommend running a local server to properly load data files.

You can use **Live Server** in VS Code if you prefer:
1. Install the Live Server extension
2. Open the project folder
3. Right-click `index.html` -> **Open with Live Server**
   
The project will automatically open in your browser.

## Libraries and Other Resources
### Libraries
- [D3.js](https://d3js.org/) - JS data visualization library
- [Bootstrap](https://getbootstrap.com/) - CSS framework for layout and styling

### Raw Data
Both raw datasets were retreived from [Kaggle](https://www.kaggle.com/datasets/ekrembayar/avatar-the-last-air-bender):
- `data/raw/avatar.csv` - Details character dialogue and scene descriptors by book (season) and chapter (episode) names
- `data/raw/avatar_data.csv` - Episodes by director and rating

### Processed Data
Data cleaning scripts can be found in `/scripts/`
| File | Description |
|------|------------|
| `atla-world-map.json` | JSON data containing polygon coordinates for each nation, used to draw and position regions in a fights map visualization |
| `avatar_themes_timeline.csv` | Chapter-level data showing how often major themes appear throughout each book of the series. |
| `character_traits.json` | Chapter-level data of character traits. |
| `element_bending.json` | Frequency of elemental references across the series, along with overall totals for each element |
| `fights.json` | Fight scenes, including characters involved and episode context  |
| `moral_counts_tidy.csv` | Moral theme frequencies in character dialogue, normalized by word count. |

