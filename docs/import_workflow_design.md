# CSV Reservation Import Workflow (Booking & Airbnb)

## Overview
This feature allows property managers to bulk-import reservations directly into the scheduler using standard CSV export files from Booking.com or Airbnb. 

The system automates validation, chronological processing, and conflict detection while keeping user friction to an absolute minimum.

---

## User Journey

### 1. Initiating the Import
* From the main **Scheduler / Calendar** view, the user clicks the **"Import Reservations"** button.
* A clean modal dialog appears asking the user to:
  1. Select the platform origin: **Booking.com** or **Airbnb**.
  2. Select or drop their exported `.csv` file.
* The user clicks **"Import"**.

---

### 2. Processing & Automated Validation
Once submitted, the system automatically handles the parsing and validation in the background:
* **Chronological Order:** Rows are sorted and processed in chronological order.
* **Property Mapping:** The system automatically maps each reservation to its respective apartment using external platform IDs (`booking_id` / `airbnb_id`).
* **Conflict & Rule Checking:** Each reservation is checked against existing bookings, scheduled cleaning tasks, and domain status rules.

---

### 3. Immediate Results & Feedback

Depending on the outcome of the import, the user experiences one of two streamlined paths:

#### Scenario A: All Reservations Imported Successfully (0 Issues)
* The modal closes automatically.
* A brief success notification (toast) appears:  
  > *"18 reservations successfully imported into your calendar."*
* The calendar view immediately refreshes, showing the newly created bookings in `pending` status.

#### Scenario B: Some Reservations Require Attention
* The user is immediately brought to the **Import Issues Modal**.
* At the top, a discreet summary banner confirms the successful items:  
  > *"15 reservations added to the calendar. 3 items require attention."*
* The rest of the modal displays the list of rejected entries, clearly detailing why each one could not be placed (e.g., *Schedule conflict with cleaning task*, *Unrecognized apartment ID*, or *Overlapping booking*).

---

### 4. Resolving Import Issues
For any reservation displayed in the **Import Issues** view:
* **Edit & Retry:** The user can open a quick in-place form to adjust the apartment assignment, modify dates, or fix details, and re-attempt the import immediately.
* **Dismiss:** The user can permanently discard items they do not wish to import.
* **Persistent State:** If the user needs to inspect the calendar before deciding how to handle an issue, they can safely close the modal. Unresolved items remain stored in the background.

---

### 5. Returning to Pending Issues Later
* If any unresolved import issues remain in the system, the scheduler displays an indicator badge next to the import tool (e.g., **"Pending Issues (3)"**).
* Clicking this badge opens the issues view directly, allowing the user to resume and resolve pending items whenever convenient.
 