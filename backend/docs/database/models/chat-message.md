# ChatMessage (`ChatMessage.model.ts`)

## Collection

- Model: `ChatMessage`

## Fields

- `author: object` (required; embedded user snapshot)
- `text?: string`
- `mentions: string[]` (default `[]`)
- `isEdited: boolean` (default `false`)
- `editedAt?: Date`
- `createdAt`, `updatedAt` via timestamps

## Indexes

- `createdAt: -1`
- `author.clerkId: 1, createdAt: -1`
- `mentions: 1, createdAt: -1`

## Invariants / notes

- Pre-save hook requires `text` to be present.
- `author` is denormalized; profile snapshot propagation applies.
