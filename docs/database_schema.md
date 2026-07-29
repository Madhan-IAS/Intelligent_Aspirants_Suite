# UPSC KMS - Database Schema

*Database: MongoDB*

## Users Collection
- `_id`: ObjectId
- `name`: String
- `email`: String
- `passwordHash`: String
- `streak`: Number
- `createdAt`: Date

## Subjects Collection
- `_id`: ObjectId
- `name`: String (e.g., "GS-II")
- `description`: String

## Topics Collection
- `_id`: ObjectId
- `subjectId`: ObjectId (Ref: Subjects)
- `title`: String (e.g., "Federalism")
- `tags`: Array of Strings
- `difficulty`: String
- `status`: String (Pending, In Progress, Completed)
- `revisionDates`: Array of Dates (Based on 3-5-7 plan)
- `createdAt`: Date
- `updatedAt`: Date

## Notes Collection
- `_id`: ObjectId
- `topicId`: ObjectId (Ref: Topics)
- `content`: String (Rich Text / Markdown)
- `type`: String (Theory, Examples, Value Addition)

## Current Affairs Collection
- `_id`: ObjectId
- `title`: String
- `content`: String
- `relatedTopicIds`: Array of ObjectIds (Ref: Topics)
- `date`: Date

## PYQs Collection
- `_id`: ObjectId
- `question`: String
- `year`: Number
- `subjectId`: ObjectId (Ref: Subjects)
- `topicId`: ObjectId (Ref: Topics)
- `directive`: String
- `difficulty`: String

## Revisions Collection
- `_id`: ObjectId
- `topicId`: ObjectId (Ref: Topics)
- `scheduledDate`: Date
- `status`: String (Pending, Completed, Missed)
- `interval`: Number (1, 3, 7, 15, 30, 90)
