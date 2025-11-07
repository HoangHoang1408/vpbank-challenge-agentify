# Database Export Directory

This directory contains JSON exports of the database.

## Exported Files

When you run the export script, the following files will be generated:

- `relationship_managers_[date].json` - All Relationship Managers
- `customers_[date].json` - All Customers with their relationships
- `rm_tasks_[date].json` - All RM Tasks with relationships
- `cards_[date].json` - All Cards with customer relationships
- `database_export_[date].json` - Complete database export in one file

## File Format

Each file contains JSON data with proper formatting (2-space indentation).

The complete export file (`database_export_[date].json`) includes:
```json
{
  "exportDate": "ISO timestamp",
  "statistics": {
    "relationshipManagers": number,
    "customers": number,
    "tasks": number,
    "cards": number
  },
  "data": {
    "relationshipManagers": [...],
    "customers": [...],
    "tasks": [...],
    "cards": [...]
  }
}
```

## Usage

All exported JSON files are automatically ignored by git (see `.gitignore`).

