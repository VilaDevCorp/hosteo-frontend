# Hosteo Deletion & Archiving Rules

## 1. Intent

Hard delete is a rare, deliberate operation. Normal lifecycle is managed through
**hiding/archiving** (strong entities) or is simply disallowed. Hard delete exists
for two scenarios only:

- "I just created this and it was a mistake" (e.g. a task created in error).
- "I truly want to permanently delete this and all its history" (e.g. an
  apartment where no history should be kept).

## 2. Entity classification

| Kind   | Entities                    |
|--------|-----------------------------|
| Strong | Apartment, Worker, Task     |
| Weak   | Event, Assignment, Template |

## 3. Concepts

- **Hard delete** — physical removal.
- **Hide / archive** (strong entities only) — `visible = false`, reversible.
- **Frozen** — read-only: cannot be created, edited, or deleted.

## 4. Rules by entity

### Apartment (strong)

- **Hard delete**: any time. Cascades to its events, tasks, imp_bookings and
  their assignments (full subtree purge), implemented as an ordered service
  transaction.
- **Hide**: allowed only when it has **no PENDING or IN_PROGRESS events and no
  pending assignments**. Hiding marks all its events and assignments hidden. The
  apartment and its events/assignments become **frozen**, and no new events,
  tasks or assignments can be created for it. Reversible.

### Worker (strong)

- **Hard delete**: only when **no assignments** reference it.
- **Hide**: allowed when there are no pending assignments for this worker.
  Removed from lists and worker selectors; no new assignments can be made to it.
  Existing assignments remain and still count (already-scheduled work is kept).
  Reversible.

### Task (strong)

- **Hard delete**: only when **no assignments** reference it. Recalculates the
  apartment state.
- **Hide**: only when **no PENDING assignments** reference it. The task stops
  counting in the apartment state calculation; its assignments become **frozen**
  (no edit, no delete). Recalculates the apartment state. Reversible.

### Event (weak)

- **Hard delete**: any time. Deletes its own assignments. Recalculates the
  apartment state.

### Assignment (weak)

- **Hard delete**: only when it is **not a past assignment** (per the existing
  guard). Recalculates the apartment state.

### Template (weak)

- **Hard delete**: always.

## 5. Database foreign-key policy

| FK                            | ON DELETE |
|-------------------------------|-----------|
| `apartments` → `events`       | CASCADE   |
| `apartments` → `tasks`        | CASCADE   |
| `apartments` → `imp_bookings` | CASCADE   |
| `events` → `assignments`      | CASCADE   |
| `tasks` → `assignments`       | RESTRICT  |
| `workers` → `assignments`     | RESTRICT  |

Frozen assignments are removed only by hard-deleting their event. Apartment
hard-delete is a subtree purge performed as an ordered transaction to avoid
mixed CASCADE/RESTRICT trigger-ordering issues.

## 6. Out of scope

- User deletion (no endpoint exists today).