# CSV Reservation Import - Backend Specification

## Overview
This specification details the backend architecture, data model, and API endpoints for bulk-importing reservations from Booking.com and Airbnb CSV exports.

The implementation relies on an optimistic insertion strategy: parsed records are sequentially inserted into the primary event store using existing business rules and rollback logic. Records that fail validation or trigger conflicts are captured as drafts in a dedicated issues table (`FailedImportedEvent`), allowing users to inspect, edit, retry, or discard them.

> **Migration Note:** An existing entity named `ImportedBooking` must be removed and replaced with the newly specified `FailedImportedEvent` entity.

---

## 1. Data Model: `FailedImportedEvent`

The `FailedImportedEvent` entity extends `BaseEntity` (inheriting standard fields such as `id`, `createdAt`, and `updatedAt`). It acts as a flexible, draft representation of a failed event import where all reservation fields are optional to tolerate incomplete or malformed CSV rows.

### Schema Fields

| Field | Type | Modifiers | Description |
| :--- | :--- | :--- | :--- |
| `id` | `UUID` / `ID` | Primary Key | Inherited from `BaseEntity`. |
| `apartmentId` | `UUID` / `ID` | Nullable / Optional | The resolved internal apartment ID. Null if external ID matching failed. |
| `name` | `string` | Nullable / Optional | Name of the guest / reservation title. |
| `startDate` | `DateTime` / `Date` | Nullable / Optional | Check-in date. |
| `endDate` | `DateTime` / `Date` | Nullable / Optional | Check-out date. |
| `source` | `enum('BOOKING', 'AIRBNB')` | Required | Platform source of the imported file. |
| `error` | `string` | Required | Error message or rejection reason captured from validation or rollback. |
| `createdAt` | `DateTime` | Required | Inherited from `BaseEntity`. |
| `updatedAt` | `DateTime` | Required | Inherited from `BaseEntity`. |

*Note: No `status` field is required. Records residing in this table are inherently pending drafts. When successfully promoted to actual events, they are created with the default status (`pending`) in the primary events table.*

---

## 2. Core Processing Logic

### Insertion Engine (`processEventsBatch`)
Shared sequentially by both the initial CSV upload and the retry endpoint:

1. **Sort Chronologically:** Sort candidate items ascending by `startDate`.
2. **Sequential Iteration:** For each entry:
    - Map properties into the standard `CreateEventDto`.
    - Call the primary event service (`EventService.createEvent(dto)`), which executes domain validation, overlap detection (against existing bookings and scheduled cleanings), and transactional rollbacks.
    - **On Success:**
        - The real event is persisted in the main events table.
        - Increment `successCount`.
        - If processing an existing `FailedImportedEvent` (e.g., during a retry), delete that `FailedImportedEvent` record.
    - **On Failure:**
        - Catch the thrown domain/validation error.
        - If processing an initial CSV row: construct an `FailedImportedEvent` entity with the available raw/parsed data, set the `error` field to the error message, and persist it to `imported_events`.
        - If processing an existing `FailedImportedEvent` during a retry: update its `error` field with the latest rejection reason.
3. **Return Summary:**
    - Object containing `successCount` and `failedEvents`.

---

## 3. API Endpoints

### 1. Initial CSV Upload
* **Route:** `POST /imported-events/upload`
* **Content-Type:** `multipart/form-data`
* **Payload:**
    - `file`: CSV file buffer.
    - `source`: `'BOOKING' | 'AIRBNB'`
* **Workflow:**
    1. Purge all existing records in `imported_events` (maintaining only the current batch).
    2. Parse the CSV based on the specified `source` schema.
    3. Attempt resolution of `apartmentId` using external platform IDs (`booking_id` or `airbnb_id`).
    4. Run `processEventsBatch` over the parsed entries.
* **Response (`200 OK`):**
    - Returns `successCount` (integer) and `failedEvents` (array of `FailedImportedEvent` records).

### 2. Fetch Pending Failed Events
* **Route:** `GET /imported-events`
* **Description:** Retrieves all currently unresolved entries in the `imported_events` table.
* **Response (`200 OK`):**
    - Array of all `FailedImportedEvent` objects currently stored in the table.

### 3. Update / Edit Draft Event
* **Route:** `PATCH /imported-events/:id`
* **Description:** Updates draft fields for an unresolved imported event prior to retrying. Uses standard event form fields, excluding `status` and keeping all fields optional.
* **Payload:**
    - JSON containing optional fields: `apartmentId`, `name`, `startDate`, `endDate`.
* **Response (`200 OK`):**
    - The updated `FailedImportedEvent` object.

### 4. Retry Batch Processing
* **Route:** `POST /imported-events/retry`
* **Description:** Reads all records currently in `imported_events` and re-runs `processEventsBatch`. Successfully created events are removed from `imported_events`; remaining failures update their `error` message.
* **Payload:** None.
* **Response (`200 OK`):**
    - Returns updated `successCount` and remaining `failedEvents`.

### 5. Dismiss Single Import Issue
* **Route:** `DELETE /imported-events/:id`
* **Description:** Permanently deletes a single draft record from `imported_events`.
* **Response (`200 OK` / `204 No Content`):**
    - Confirmation of deletion.

### 6. Dismiss All Import Issues
* **Route:** `DELETE /imported-events`
* **Description:** Truncates/clears all records in `imported_events`.
* **Response (`200 OK` / `204 No Content`):**
    - Confirmation of deletion.
 