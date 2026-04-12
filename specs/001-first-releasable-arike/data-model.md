# Data Model: Arike First Release

## Entities

### Bookmark
- `id`: UUID (Primary Key)
- `name`: string
- `url`: string
- `iconPath`: string (Reference to local file system)
- `createdAt`: DateTime
- `updatedAt`: DateTime

### Collection (formerly Tab)
- `id`: UUID (Primary Key)
- `name`: string
- `sortOrder`: integer

### CollectionBookmark (Mapping Table)
- `collectionId`: UUID (Foreign Key to Collection)
- `bookmarkId`: UUID (Foreign Key to Bookmark)
- `sortOrder`: integer

### ThemeSetting
- `key`: string
- `value`: json (stores theme choice, custom colors, search provider)
- `userId`: string (fixed value for v1 - system-wide installation scope)
