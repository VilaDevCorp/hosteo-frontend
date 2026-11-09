# Hosteo Workflow State Machine - Deep Technical Documentation

## 1. Overview

The Hosteo workflow is a **deterministic state machine** that governs the lifecycle of apartments as they go through bookings, cleanings, and maintenance. The core idea is: an apartment goes through a cycle of being **READY** → **OCCUPIED** (guest in) → **USED** (guest left, needs cleaning) → **READY** (cleaned).

The state is **never set directly by any user or API call**. It is always **derived** (calculated) from the state of related entities: events and assignments. The sole entry point for recalculation is:

```
WorkflowService.calculateApartmentState(UUID apartmentId)
```

This method is called after **every mutation** that could affect the apartment state:
- Event: create, update, delete, state change
- Assignment: create, update, delete, state change
- Task: create, delete, type change (mandatory ↔ extra)

## 2. The Key Architectural Change: Assignment↔Event Direct Relationship

### Before the Rework (Old Way)

Previously, assignments did **not** have a direct foreign key to events. To determine if an apartment was clean (READY), the system had to **deduce** which assignments belonged to the "cleanup window" between two events:

```
Event A (finished) -----[cleanup assignments?]----- Event B (next pending)
              ↑                                          ↑
              endDate                              startDate
              
System had to query: "Find all assignments WHERE date BETWEEN EventA.endDate AND EventB.startDate"
```

This deduction approach was fragile because:
- Date-based queries are ambiguous (what if dates overlap? what if there's a gap?)
- Deleting an event would break the deduction logic (the "window" disappears)
- Assignments weren't explicitly linked to any event, so state calculation was heuristic

### After the Rework (Current Way)

The `Assignment` entity now has a direct `@ManyToOne` relationship to `Event`:

```java
// Assignment.java
@ManyToOne
private Event event;
```

Every assignment is **explicitly created for a specific event**. The state calculation becomes deterministic:

```
Event A (finished)
  ├── Assignment 1 (cleaning, FINISHED) ← belongs to Event A
  ├── Assignment 2 (maintenance, PENDING) ← belongs to Event A
  └── ...

WorkflowService: "Event A is finished. Are all of Event A's assignments completed?
                  And do they cover all mandatory tasks? → If yes: READY"
```

This is the foundational change that makes the entire state machine robust and predictable.

## 3. Core Enums (The State Vocabulary)

### ApartmentState
| Value | Meaning |
|-------|---------|
| `READY` | Apartment is clean, available for next booking |
| `OCCUPIED` | An event is currently in progress (guest is staying) |
| `USED` | An event has finished, tasks need to be completed before READY |

### EventState
| Value | Meaning |
|-------|---------|
| `PENDING` | Event is scheduled but hasn't started yet |
| `IN_PROGRESS` | Event is currently active (guest is in the apartment) |
| `FINISHED` | Event has ended (guest has left) |

### EventType
| Value | Needs clean apartment to start? | Description |
|-------|------|-------------|
| `BOOKING` | YES | Normal client booking |
| `PERSONAL_USE` | YES | Host using the apartment themselves |
| `MAINTENANCE` | NO | Renovation/repair; doesn't require prior cleaning |

### AssignmentState
| Value | Meaning |
|-------|---------|
| `PENDING` | Assignment not yet done |
| `FINISHED` | Worker has completed the task |

### TaskType
| Value | Meaning |
|-------|---------|
| `MANDATORY` | Must be completed after EVERY event to return to READY |
| `EXTRA` | Optional, only required if explicitly scheduled for this event |

### EventSource
| Value | Meaning |
|-------|---------|
| `AIRBNB` | Booking imported from Airbnb |
| `BOOKING` | Booking imported from Booking.com |
| `NONE` | Manual/internal booking |

## 4. The `calculateApartmentState()` Algorithm (The Brain)

**File:** `WorkflowService.java` — method `calculateApartmentState(UUID id)`

```
calculateApartmentState(apartmentId):
  1. Load Apartment by ID (filtered by current user's username)
  2. If NOT FOUND → throw EntityNotFoundException

  ┌─ CHECK 1: Is there an IN_PROGRESS event? ─────────────────────┐
  │  Query: eventRepository.existsEventByApartmentIdAndState(     │
  │           apartmentId, "IN_PROGRESS")                         │
  │  If YES → apartment.setState(OCCUPIED) → save → RETURN        │
  │  Rationale: If a guest is currently staying, the apartment    │
  │             is occupied regardless of anything else.           │
  └────────────────────────────────────────────────────────────────┘

  ┌─ CHECK 2: Does the apartment have tasks? ─────────────────────┐
  │  If apartment.getTasks().isEmpty():                           │
  │    apartment.setState(READY) → save → RETURN                  │
  │  Rationale: If there's nothing to clean, the apartment is     │
  │             automatically ready after any event.               │
  └────────────────────────────────────────────────────────────────┘

  ┌─ BUILD MANDATORY TASK MAP ────────────────────────────────────┐
  │  For each task in apartment.getTasks():                       │
  │    if task.type == MANDATORY:                                 │
  │      mandatoryTasksMap.put(task.id, task)                     │
  │  This map will track which mandatory tasks still need to be   │
  │  "checked off" by a completed assignment.                      │
  └────────────────────────────────────────────────────────────────┘

  ┌─ FIND LAST FINISHED EVENT ────────────────────────────────────┐
  │  Query: eventRepository.                                      │
  │    findFirstByCreatedByUsernameAndApartmentIdAndState         │
  │    OrderByEndDateDesc(username, apartmentId, "FINISHED")      │
  │                                                                 │
  │  If NOT FOUND → apartment.setState(READY) → save → RETURN    │
  │  Rationale: If no event has ever finished here (e.g., new     │
  │             apartment), the apartment is ready.                │
  └────────────────────────────────────────────────────────────────┘

  ┌─ PROCESS LAST FINISHED EVENT'S ASSIGNMENTS ───────────────────┐
  │  eventAssignments = lastFinishedEvent.getAssignments()        │
  │                                                                 │
  │  For each assignment in eventAssignments:                      │
  │    │                                                            │
  │    ├── If assignment.state == PENDING:                        │
  │    │     apartment.setState(USED) → save → RETURN              │
  │    │     (Any pending assignment = apartment still needs work) │
  │    │                                                            │
  │    └── If assignment.task.type == MANDATORY:                  │
  │          mandatoryTasksMap.remove(assignment.task.id)          │
  │          (This mandatory task has been completed)              │
  └────────────────────────────────────────────────────────────────┘

  ┌─ FINAL DECISION ──────────────────────────────────────────────┐
  │  If mandatoryTasksMap.isEmpty():                              │
  │    apartment.setState(READY)                                   │
  │    (All mandatory tasks have completed assignments)            │
  │  Else:                                                         │
  │    apartment.setState(USED)                                    │
  │    (Some mandatory tasks still need assignments/completion)    │
  │                                                                 │
  │  Save apartment → RETURN                                       │
  └────────────────────────────────────────────────────────────────┘
```

### Critical Design Decisions in the Algorithm

1. **Only the LAST finished event matters.** Previous events' assignments are irrelevant — they were cleaned up before the next event started. This is why the query specifically fetches the single last finished event (`findFirst...OrderByEndDateDesc`).

2. **Only mandatory tasks create a USED state.** Extra tasks that are pending do NOT keep the apartment in USED state. They only matter if they're scheduled AND pending — but a pending extra task's assignment being PENDING would trigger the `USED` state at step "if assignment.state == PENDING".

3. **Empty tasks = always READY.** If the apartment has zero tasks, it goes directly from event completion to READY without any cleanup phase.

4. **IN_PROGRESS always wins.** The OCCUPIED check is first and short-circuits everything else. You cannot clean a room while a guest is in it.

## 5. When Does Recalculation Happen? (Triggers)

Every mutation that could affect apartment state calls `workflowService.calculateApartmentState()`.

### EventService Triggers

| Action | Trigger Point | Code Reference |
|--------|---------------|----------------|
| `createEvent()` | After saving event | Line 157: `workflowService.calculateApartmentState(form.getApartmentId())` |
| `updateEvent()` | After saving updated event | Line 216: `workflowService.calculateApartmentState(result.getApartment().getId())` |
| `updateEventState()` | After changing event state | Line 233 (inside `executeUpdateStateLogic`): `workflowService.calculateApartmentState(...)` |
| `deleteEvent()` | After deleting event | Line 356: `workflowService.calculateApartmentState(event.getApartment().getId())` |

### AssignmentService Triggers

| Action | Trigger Point | Code Reference |
|--------|---------------|----------------|
| `createAssignment()` | After saving assignment | Line 260: `workflowService.calculateApartmentState(task.getApartment().getId())` |
| `updateAssignment()` | After saving updated assignment | Line 291: `workflowService.calculateApartmentState(task.getApartment().getId())` |
| `executeUpdateAssignmentState()` | After changing state | Line 310: `workflowService.calculateApartmentState(...)` |
| `deleteAssignment()` | After deleting assignment | Line 443: `workflowService.calculateApartmentState(apartment.getId())` |

### TaskService Triggers

| Action | Trigger Point | Code Reference |
|--------|---------------|----------------|
| `createTask()` | After creating and adding to apartment | Line 63: `workflowService.calculateApartmentState(apartment.getId())` |
| `updateTask()` | After update IF task type changed | Lines 72-73: `if (oldTaskType != task.getType())` then recalculate |
| `deleteTask()` | After removing from apartment and deleting | Line 113: `workflowService.calculateApartmentState(apartment.getId())` |

## 6. State Transition Scenarios (Walkthrough)

### Scenario 1: Normal Booking Lifecycle

```
Initial State: READY
   |
   | Event created with state = PENDING
   | (Apartment stays READY — PENDING events don't affect state)
   |
   | Event state changed to IN_PROGRESS
   ↓
OCCUPIED  ← calculateApartmentState: check 1 (IN_PROGRESS exists)
   |
   | Event state changed to FINISHED
   ↓
USED  ← calculateApartmentState: no IN_PROGRESS, has tasks, last finished event's assignments not done
   |
   | Assignments created for mandatory tasks, state = PENDING
   | (Still USED — pending assignments exist)
   |
   | Worker completes assignment 1 → FINISHED
   | (Still USED — mandatoryTasksMap still has entries)
   |
   | Worker completes assignment 2 → FINISHED
   ↓
READY  ← calculateApartmentState: all mandatory tasks completed, map is empty
```

### Scenario 2: Multiple Assignments for One Event, Some Still Pending

```
Event A: FINISHED
  Assignment 1 (mandatory task "Cleaning"): FINISHED
  Assignment 2 (mandatory task "Inspection"): PENDING
  Assignment 3 (extra task "Restock toiletries"): FINISHED

calculateApartmentState():
  → No IN_PROGRESS event ✓
  → Has tasks ✓
  → mandatoryTasksMap = {"Cleaning", "Inspection"}
  → Last finished event = Event A
  → Process assignments:
      Assignment 1: FINISHED → mandatory → remove "Cleaning" from map
      Assignment 2: PENDING → apartment = USED → RETURN
  Result: USED (because Assignment 2 is pending)
```

### Scenario 3: No Tasks at All

```
Event A: FINISHED
  (Apartment has zero tasks)

calculateApartmentState():
  → No IN_PROGRESS event ✓
  → apartment.getTasks().isEmpty() → TRUE
  → apartment.setState(READY) → RETURN
  Result: READY
```

The apartment goes directly to READY after any event if no tasks exist.

### Scenario 4: Deleting the Last Finished Event

```
Event A: FINISHED (endDate: Jan 15)
  Assignments: all completed, apartment is READY

User deletes Event A:
  → EventService.deleteEvent() → deletes event
  → calculateApartmentState():
      → No IN_PROGRESS ✓
      → Has tasks ✓
      → Find last finished event → null (Event A was the only finished one)
      → apartment.setState(READY)
  Result: READY (correct — nothing ever happened)
```

```
Event A: FINISHED (endDate: Jan 10)
  Assignments: all completed, apartment is READY
Event B: FINISHED (endDate: Jan 20)
  Assignments: none completed, apartment is USED

User deletes Event B:
  → calculateApartmentState():
      → No IN_PROGRESS ✓
      → Last finished event = Event A (now the last)
      → Process Event A's assignments: all FINISHED ✓
      → mandatoryTasksMap empty ✓
      → apartment.setState(READY)
  Result: READY (correct — rolling back to Event A's clean state)
```

### Scenario 5: Changing a Mandatory Task to Extra

```
Apartment state: USED
  Mandatory tasks: Cleaning, Inspection
  Extra tasks: none
  Event A: FINISHED
    Cleaning assignment: FINISHED
    Inspection assignment: PENDING (this is why USED)

User changes "Inspection" from MANDATORY to EXTRA:
  → TaskService.updateTask() → detects type change
  → calculateApartmentState():
      → No IN_PROGRESS ✓
      → mandatoryTasksMap = {"Cleaning"} (Inspection excluded)
      → Last finished event = Event A
      → Process assignments:
          Cleaning: FINISHED, MANDATORY → remove from map ✓
          Inspection: PENDING → apartment = USED → RETURN
  Wait — this is still USED?

Correction: Looking at the algorithm more carefully:
  - Inspection is now EXTRA, so it's NOT added to mandatoryTasksMap
  - Cleaning assignment: FINISHED, MANDATORY → removed from map
  - Inspection assignment: PENDING → sets USED → RETURN
```

Actually, let me re-read the algorithm. The loop processes ALL assignments:

```java
for (Assignment assignment : eventAssignments) {
    if (assignment.getState().isPending()) {
        apartment.setState(ApartmentState.USED);
        return;  // <-- SHORT-CIRCUITS HERE
    }
    if (assignment.getTask().getType() == TaskType.MANDATORY) {
        mandatoryTasksMap.remove(assignment.getTask().getId());
    }
}
```

So if ANY assignment is PENDING (even an EXTRA one), the apartment stays USED. This makes sense: if you scheduled an extra task, it still needs to be done. If you don't want to do it, you must either complete it or delete the assignment.

**Correction:** If you change a task from MANDATORY to EXTRA AND delete its pending assignment, then the apartment would go to READY (since the pending assignment is gone and all mandatory tasks are covered).

### Scenario 6: Changing Assignment from FINISHED back to PENDING

```
Apartment state: READY
  Event A: FINISHED
    Assignment 1 (mandatory): FINISHED

User changes Assignment 1 state back to PENDING:
  → AssignmentService.executeUpdateAssignmentState()
  → calculateApartmentState():
      → No IN_PROGRESS ✓
      → mandatoryTasksMap populated ✓
      → Last finished event = Event A
      → Process: Assignment 1 is PENDING → USED → RETURN
  Result: USED
```

This correctly "reopens" the cleanup requirement.

### Scenario 7: Two Events, One IN_PROGRESS

```
Event A: FINISHED (endDate: Jan 10)
  Assignments: all completed
Event B: IN_PROGRESS (startDate: Jan 12)

calculateApartmentState():
  → Check 1: existsEventByApartmentIdAndState(apartmentId, "IN_PROGRESS") → TRUE
  → apartment.setState(OCCUPIED) → RETURN
  Result: OCCUPIED (even though Event A is clean)
```

This is correct: the apartment is occupied because a guest is currently there.

### Scenario 8: Deleting Assignment for a PENDING Extra Task

```
Apartment state: USED
  Event A: FINISHED
    Assignment 1 (mandatory "Cleaning"): FINISHED
    Assignment 2 (mandatory "Inspection"): FINISHED
    Assignment 3 (extra "Restock"): PENDING

calculateApartmentState():
  → mandatoryTasksMap = {"Cleaning", "Inspection"}
  → Process:
      Assignment 1 (Cleaning): FINISHED, MANDATORY → remove
      Assignment 2 (Inspection): FINISHED, MANDATORY → remove
      Assignment 3 (Restock): PENDING → USED → RETURN
  Result: USED (because extra assignment is pending)

User deletes Assignment 3 (the extra one):
  → deleteAssignment() → calculateApartmentState()
      → mandatoryTasksMap = {"Cleaning", "Inspection"}
      → Process: (only 2 assignments now)
          Assignment 1: FINISHED, MANDATORY → remove
          Assignment 2: FINISHED, MANDATORY → remove
      → mandatoryTasksMap.isEmpty() → TRUE
      → READY
  Result: READY
```

Deleting a pending extra assignment unblocks the apartment.

## 7. Validation / Guard Rules

### Event State Transitions (`EventService.validateEventState`)

These prevent impossible states in the event timeline:

| Rule | Check | Exception |
|------|-------|-----------|
| Can't PENDING after IN_PROGRESS/FINISHED | If setting to PENDING, verify no next event is IN_PROGRESS or FINISHED | `NextOfPendingCannotBeInprogressOrFinished` |
| Can't IN_PROGRESS before PENDING/IN_PROGRESS | If setting to IN_PROGRESS, verify previous event isn't PENDING/IN_PROGRESS | `PrevOfInProgressCannotBePendingOrInProgress` |
| Can't IN_PROGRESS after IN_PROGRESS/FINISHED | If setting to IN_PROGRESS, verify no next event is IN_PROGRESS or FINISHED | `NextOfInProgressCannotBeFinishedOrInProgress` |
| Can't FINISHED before PENDING/IN_PROGRESS | If setting to FINISHED, verify previous event isn't PENDING/IN_PROGRESS | `PrevOfFinishedCannotBeNotPendingOrInProgress` |

These rules enforce a strictly chronological event flow:
```
Event 1: PENDING → IN_PROGRESS → FINISHED
                                    ↓
Event 2:                           PENDING → IN_PROGRESS → FINISHED
                                                              ↓
Event 3:                                                     PENDING → ...
```

### Schedule Conflict Detection (`ServiceUtils.getScheduleConflicts`)

Before creating/updating events or assignments, the system checks that the apartment is available:

```java
public static Pair<Event, Assignment> getScheduleConflicts(
    eventRepository, assignmentRepository,
    apartmentId, startDate, endDate, excludeEventId, excludeAssignmentId)
```

This queries for:
1. Any **event** that overlaps with the requested date range (excluding the one being edited)
2. Any **assignment** that overlaps with the requested date range (excluding the one being edited)

If either exists, a `NotAvailableDatesException` is thrown.

### Assignment-Specific Guard Rules

| Rule | Check Location | Exception |
|------|---------------|-----------|
| Worker availability | `AssignmentRepository.checkWorkerAvailability()` | `NotAvailableDatesException` |
| No duplicate task per event | Loop through event assignments, check task ID | `DuplicatedEventForTaskException` |
| Assignment starts after event ends | `startDate.isBefore(event.getEndDate())` | `AssignmentStartsBeforeEventEnds` |
| Assignment finishes before next event starts | `endDate.isAfter(nextEvent.getStartDate())` | `AssignmentEndsAfterNextEventStarts` |
| Can't complete task on unfinished event | `event.state != FINISHED && newState == FINISHED` | `CompleteTaskOnNotFinishedEventException` |

### Assignment Modification Permissions (`checkWhetherEventAssignmentsCanBeAltered`)

This is the gatekeeper for modifying assignments on finished events:

```
checkWhetherEventAssignmentsCanBeAltered(event):
  1. If event is NOT finished → ALLOW
     (You can always modify assignments on PENDING or IN_PROGRESS events)

  2. Find the last FINISHED event for this apartment
     if NOT FOUND → ALLOW
     (No finished events, so modifying is fine)

  3. If this event IS the last finished event:
     Check: is there an IN_PROGRESS event after it?
       If YES → DENY (Exception: AssignChangeLastFinishedEventWhenAnotherEventInProgress)
       If NO → ALLOW
     Rationale: You CAN modify the last finished event's assignments if
                nothing has started after it. But if a new event is already
                in progress, reopening the cleanup of the previous event
                would corrupt the workflow.

  4. If this event is NOT the last finished event → DENY
     (Exception: ChangeInAssignmentsOfPastEventException)
     Rationale: You cannot modify assignments on events that are further
                in the past. Only the most recent finished event is editable.
```

## 8. Bulk Operations and Transaction Management

### Bulk Event State Update

```java
// EventService.updateBulkEventState()
for each event:
  Call updateEventStateInNewTransaction(eventId, state)
  // Each event update runs in its own REQUIRES_NEW transaction
  // If one fails, others continue. Errors collected in a list.
```

### Bulk Assignment State Update

```java
// AssignmentService.updateBulkAssignmentsState()
for each assignment:
  Call updateAssignmentStateInNewTransaction(assignment, newState)
  // Each assignment update runs in its own REQUIRES_NEW transaction
  // Individual failures don't block others
```

Both bulk operations use `@Transactional(propagation = Propagation.REQUIRES_NEW)` so that each individual update is atomic and failures are isolated.

### Rollback on Validation Failure

In `executeUpdateAssignmentState()` and `executeUpdateStateLogic()`, the state is saved first (so the workflow calculation can run), then validation runs. If validation fails, the transaction is explicitly rolled back:

```java
try {
    workflowService.calculateApartmentState(...);
    validateEventState(...);  // or validateAssignment(...)
} catch (Exception e) {
    TransactionAspectSupport.currentTransactionStatus().setRollbackOnly();
    throw e;
}
```

This pattern ensures the apartment state change is also rolled back if the validation fails.

## 9. The Commented-Out Scheduler Code

A large portion of `WorkflowService.java` (lines 130-371) is commented out. This was the **scheduler/alert system** that provided:
- `getSchedulerInfo(Instant startDate, Instant endDate)` — returned calendar info with events, assignments, and alerts
- Alert levels: RED (2 days before next event, unassigned/unfinished tasks) and YELLOW (5 days before)
- Processing of events within a date range for a calendar view

The commented-out code uses the `ApartmentInfo` inner class and several DTOs that still exist in the codebase:
- `EventSchedulerDto`
- `SimpleEventSchedulerDto`
- `AssignmentForSchedulerDto`
- `BookingSchedulerDto`
- `SimpleBookingSchedulerDto`
- `SchedulerInfo`

This code was likely disabled during the refactoring and may need to be re-enabled or rewritten.

## 10. Database Schema for the State Machine

```
┌─────────────┐
│  apartments  │
│──────────────│
│ id (UUID PK) │
│ name         │
│ state        │ ← READY / OCCUPIED / USED (computed, never set directly)
│ airbnb_id    │
│ booking_id   │
│ visible      │
│ created_by   │ → FK to users
└──────┬───────┘
       │ 1
       │
       │ N
┌──────┴───────┐         ┌──────────────────┐
│    events    │ 1     N │   assignments     │
│──────────────│←────────│───────────────────│
│ id (UUID PK) │         │ id (UUID PK)      │
│ type         │         │ task_id (FK)      │ → FK to tasks
│ name         │         │ event_id (FK)     │ → FK to events ★
│ source       │         │ worker_id (FK)    │ → FK to workers
│ state        │         │ start_date        │
│ apartment_id │         │ end_date          │
│ start_date   │         │ state             │ ← PENDING / FINISHED
│ end_date     │         │ created_by        │
│ created_by   │         └───────────────────┘
└──────────────┘
       │
       │ 1
       │
       │ N
┌──────┴───────┐
│    tasks     │
│──────────────│
│ id (UUID PK) │
│ name         │
│ type         │ ← MANDATORY / EXTRA
│ category     │
│ duration     │
│ steps (JSON)  │
│ apartment_id │
│ created_by   │
└──────────────┘
```

The critical FK is `assignments.event_id` → `events.id`. This is the relationship that makes the state machine deterministic: every assignment is explicitly tied to the event it belongs to.

## 11. Edge Cases and Corner Cases

### What happens if the last finished event has NO assignments at all?

```
calculateApartmentState():
  → No IN_PROGRESS ✓
  → Has tasks ✓
  → mandatoryTasksMap populated (all mandatory tasks)
  → Last finished event found
  → eventAssignments = empty set
  → Loop doesn't execute
  → mandatoryTasksMap.isEmpty()? FALSE (still has all mandatory tasks)
  → apartment.setState(USED)
```

The apartment stays USED because no assignments exist for the mandatory tasks. Correct behavior: you need to create assignments and complete them.

### What if an apartment has only EXTRA tasks (no MANDATORY)?

```
mandatoryTasksMap = {} (empty because all tasks are EXTRA)
→ After processing assignments: map is empty
→ apartment.setState(READY)
```

The apartment goes READY even if no extra assignments were done. Only mandatory tasks block the READY transition.

### What if someone deletes ALL tasks from an apartment?

The next `calculateApartmentState()` will see `apartment.getTasks().isEmpty()` → READY.

### What about the "Maintenance doesn't need a clean apartment" rule?

This is currently NOT enforced in the code. The `EventType.MAINTENANCE` enum exists but the state machine does not distinguish between event types. All events (BOOKING, PERSONAL_USE, MAINTENANCE) trigger the same state transitions.

The user's documentation says maintenance events should not require a clean apartment, but this is a **business rule not yet implemented** in the code.

## 12. Summary: The State Machine Contract

1. **Apartment state is NEVER set directly.** It's always computed.
2. **calculateApartmentState() is the single source of truth.** Called after every entity mutation.
3. **IN_PROGRESS event trumps everything.** If a guest is there, apartment is OCCUPIED.
4. **Only the LAST FINISHED event matters.** Previous events' cleanup is assumed done.
5. **All mandatory tasks must have completed assignments on the last finished event.**
6. **Any pending assignment (even extra) blocks the READY transition.**
7. **Empty tasks = automatic READY.** No cleanup needed.
8. **Assignments are explicitly linked to events via FK.** No date-based deduction.
9. **Past events' assignments are locked** unless it's the last finished event and nothing is in progress after it.
10. **Bulk operations use isolated transactions** so partial failures don't block everything.