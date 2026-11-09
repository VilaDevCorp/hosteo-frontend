# CSV Reservation Import - UI Specification and Error Display

## 1. Import Issues Modal Overview
The **Import Issues Modal** is the central workspace for reviewing, retrying, and clearing unresolved imports stored in the `imported_events` table.

* **Modal Header:**
  * Title: Import Issues
  * Action controls:
    * **Retry All**: Calls the batch retry endpoint to reprocess all remaining issues.
    * **Dismiss All**: Clears all pending import issues with a confirmation prompt.
* **List Area:** Scrollable vertical list rendering each record from `imported_events` as an individual card.

---

## 2. Issue Card Layout and Content

Each failed item displays as a card divided into two main sections:

### Left Section: Event Representation
* Reuse the existing `EventCard` component.
* Adapt `EventCard` (if it does not support it already) to safely tolerate undefined/null values by falling back to empty strings `""` (e.g., if `apartmentId` is missing, or if `startDate`/`endDate` are missing).

### Right Section: Error Message and Actions
* **Error Text**: Displays the exact text string stored in the `error` field of the `FailedImportedEvent` entity verbatim, without custom frontend parsing.
  * Rendered in an alert color tone (red or orange) next to a warning icon.
* **Row Actions**:
  * **Edit**: Button present in the UI, but it does not perform any action for now (placeholder for future implementation).
  * **Dismiss**: Deletes this single record from the pending issues table via `DELETE /imported-events/:id`.
 