# Tagged Error

![NPM Version](https://img.shields.io/npm/v/tagged-error)

A TypeScript library for creating tagged error classes with runtime type checking. Inspired by Effect's `Data.TaggedError`, this library allows you to create error classes on the fly with proper typing and runtime discrimination.

## Installation

```bash
npm install tagged-error
# or
pnpm add tagged-error
# or
yarn add tagged-error
```

## Why tagged-error?

- **Runtime Type Safety**: Use the `_tag` property for discriminated unions and runtime error checking
- **Type-safe Properties**: Attach structured data to your errors with full TypeScript support
- **Result Pattern Ready**: Works seamlessly with libraries like `neverthrow` for functional error handling

## Quick Start

```ts
import { TaggedError } from 'tagged-error'

// Create a tagged error class
class NetworkError extends TaggedError("NetworkError")<{
  status: number
  endpoint: string
}> {}

// Use it
const error = new NetworkError({
  status: 500,
  endpoint: "/api/users"
})

console.log(error._tag)      // "NetworkError"
console.log(error.status)    // 500
console.log(error.endpoint)  // "/api/users"
```

## Examples

### Basic Usage

```ts
import { TaggedError } from 'tagged-error'

class ValidationError extends TaggedError("ValidationError")<{
  field: string
  value: unknown
}> {}

class NetworkError extends TaggedError("NetworkError")<{
  status: number
  endpoint: string
}> {}

// You can also create a tagged error without properties
class InvalidEndpoint extends TaggedError("InvalidEndpoint") {}

// Create instances
const validationError = new ValidationError({
  field: "email",
  value: "invalid-email"
})

const networkError = new NetworkError({
  status: 404,
  endpoint: "/api/users"
})

const invalidEndpoint = new InvalidEndpoint()
```

### Discriminated Unions

```ts
type AppError = ValidationError | NetworkError

function handleError(error: AppError) {
  switch (error._tag) {
    case "ValidationError":
      console.log(`Invalid ${error.field}: ${error.value}`)
      break
    case "NetworkError":
      console.log(`HTTP ${error.status} at ${error.endpoint}`)
      break
  }
}

handleError(validationError) // "Invalid email: invalid-email"
handleError(networkError)    // "HTTP 404 at /api/users"
```

### With neverthrow

Perfect for functional error handling:

```ts
import { Result, err, ok } from "neverthrow"
import { TaggedError } from 'tagged-error'

class DatabaseError extends TaggedError("DatabaseError")<{
  query: string
  code: string
}> {}

class NotFoundError extends TaggedError("NotFoundError")<{
  resource: string
  id: string
}> {}

type User = { id: string; name: string }

function fetchUser(id: string): Result<User, DatabaseError | NotFoundError> {
  if (id === "invalid") {
    return err(new DatabaseError({
      query: `SELECT * FROM users WHERE id = '${id}'`,
      code: "INVALID_ID"
    }))
  }
  
  if (id === "404") {
    return err(new NotFoundError({
      resource: "user",
      id
    }))
  }
  
  return ok({ id, name: "John Doe" })
}

// Usage
const result = fetchUser("404")
       //^? Result<User, DatabaseError | NotFoundError>

if (result.isErr()) {
  const error = result.error
  switch (error._tag) {
    case "DatabaseError":
      console.log(`DB Error: ${error.code} - ${error.query}`)
      break
    case "NotFoundError":
      console.log(`${error.resource} with id ${error.id} not found`)
      break
  }
}
```