# ApartmentSwiper

A mobile-friendly web application that allows users to swipe through apartment listings, similar to dating apps. Users can like or dislike apartments, view details, and filter listings based on preferences.

## Features

- Swipe interface for apartment browsing (left for dislike, right for like)
- Detailed apartment view with multiple images
- Filter apartments by price, bedrooms, and amenities
- Save favorite apartments for later viewing
- Mobile-optimized interface for iPhone and Android

## Installation

1. Clone the repository
2. Install dependencies:
   ```
   pip install -r requirements.txt
   ```
3. Run the application:
   ```
   python app.py
   ```
4. Open the application in your mobile browser at the provided URL

## Usage

- **Swipe View**: Swipe right to like an apartment, left to dislike
- **Favorites**: View all your liked apartments
- **Filters**: Set price range, bedroom preferences, and required amenities
- **Details**: Tap "View Details" or click on a favorite to see more information

## Development

This application is built with:
- Frontend: HTML, CSS, JavaScript
- Backend: Python with Flask

## Adding Real Apartment Data

To use real apartment data, modify the `SAMPLE_APARTMENTS` list in `app.py` or connect to a database.

## License

MIT