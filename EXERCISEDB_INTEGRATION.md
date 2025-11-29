# ExerciseDB API Integration Guide

## Current Status
✅ Exercise page fully implemented
✅ ExerciseDB API integrated for exercise data (11,000+ exercises)
✅ Real exercise names, instructions, and metadata from API
⚠️ Using placeholder images (free RapidAPI tier doesn't include image endpoint)
💡 To get real GIFs: upgrade to paid ExerciseDB tier or use alternative APIs

## About ExerciseDB API

ExerciseDB is a comprehensive fitness database with:
- **11,000+ exercises** with detailed information
- **High-quality GIFs** for each exercise
- **Videos and images** for visual guidance
- **Step-by-step instructions**
- **Target muscles, body parts, and equipment info**

## How to Get Real Exercise GIFs

### Option 1: RapidAPI (Easiest)

1. **Sign up** at [RapidAPI ExerciseDB](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
2. **Subscribe** to a free plan (includes 100 requests/month)
3. **Get your API key** from the dashboard
4. **Add to .env:**
   ```
   EXERCISEDB_API_KEY=your_rapidapi_key_here
   EXERCISEDB_API_HOST=exercisedb.p.rapidapi.com
   ```

5. **Update the exercises router** (backend/app/routers/exercises.py):
   Replace the MOCK_EXERCISES section with API calls to ExerciseDB.

### Option 2: Self-Hosted (Advanced)

1. Clone the [ExerciseDB repository](https://github.com/ExerciseDB/exercisedb-api)
2. Follow their setup instructions
3. Host your own instance

## API Endpoints (RapidAPI)

Base URL: `https://exercisedb.p.rapidapi.com`

**Get all exercises:**
```
GET /exercises?limit=10&offset=0
```

**Get exercises by body part:**
```
GET /exercises/bodyPart/{bodyPart}
Example: /exercises/bodyPart/chest
```

**Get exercises by equipment:**
```
GET /exercises/equipment/{equipment}
Example: /exercises/equipment/dumbbell
```

**Get single exercise:**
```
GET /exercises/exercise/{id}
```

## Example API Call

```python
import requests
import os

url = "https://exercisedb.p.rapidapi.com/exercises"

headers = {
    "X-RapidAPI-Key": os.getenv("EXERCISEDB_API_KEY"),
    "X-RapidAPI-Host": "exercisedb.p.rapidapi.com"
}

response = requests.get(url, headers=headers, params={"limit": "10"})
exercises = response.json()
```

## Response Format

```json
{
  "bodyPart": "chest",
  "equipment": "dumbbell",
  "gifUrl": "https://v2.exercisedb.io/image/12345",
  "id": "0001",
  "name": "incline dumbbell press",
  "target": "pectoralis major",
  "secondaryMuscles": ["triceps"],
  "instructions": [
    "Set the bench at a 30-45 degree incline",
    "Lie back with dumbbells at shoulder level",
    "Press the dumbbells up until arms are extended"
  ]
}
```

## Implementation Steps

1. Add API key to `.env`
2. Install requests if not already: `pip install requests`
3. Update `backend/app/routers/exercises.py`:
   - Add function to fetch from ExerciseDB API
   - Cache responses to avoid hitting rate limits
   - Map API response to your Exercise model

4. Optional: Store exercises in your database for faster access

## Rate Limits

- **Free tier**: 100 requests/month
- **Basic tier**: 500 requests/month ($10/month)
- **Pro tier**: 10,000 requests/month ($30/month)

## Best Practices

1. **Cache API responses** - Store in database or Redis
2. **Use pagination** - Don't fetch all 11k exercises at once
3. **Handle errors** - Fallback to mock data if API fails
4. **Respect rate limits** - Add delays between requests

## Image Endpoint Limitation

**Important:** The free tier of ExerciseDB on RapidAPI does not include access to the `/image` endpoint for GIF animations.

### Current Solution
- Using DiceBear API for placeholder images based on exercise names
- Exercise data (names, instructions, muscle groups, etc.) is from real ExerciseDB API

### To Get Real Exercise GIFs

#### Option 1: Upgrade ExerciseDB Subscription
- Subscribe to a paid tier on [ExerciseDB RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
- Image endpoint URL: `https://exercisedb.p.rapidapi.com/image?exerciseId={id}&resolution=360`
- Requires API key in header or query parameter

#### Option 2: Use Alternative Free APIs
- **wger Workout Manager** - Free, open source with 200+ exercises and images
  - API: https://wger.de/en/software/api
  - GitHub: https://github.com/wger-project/wger
- **Free Exercise DB** - 800+ exercises with images
  - GitHub: https://github.com/yuhonas/free-exercise-db
  - Public domain, completely free

## Sources

- [ExerciseDB API GitHub](https://github.com/ExerciseDB/exercisedb-api)
- [ExerciseDB on RapidAPI](https://rapidapi.com/justin-WFnsXH_t6/api/exercisedb)
- [ExerciseDB Image Service Docs](https://edb-docs.up.railway.app/docs/image-service/image)
- [wger Workout Manager](https://github.com/wger-project/wger)
- [Free Exercise DB](https://github.com/yuhonas/free-exercise-db)
