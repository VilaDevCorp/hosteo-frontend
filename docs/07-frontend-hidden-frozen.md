# Frontend Instructions — Hidden Search & Frozen Scheduler Cards

This document describes the frontend changes needed to support the new
hide/archive rules. It must be read together with `docs/deletion_rules.md`.

Three changes are required:

1. A "show hidden" switch on the apartment, event and task search screens.
2. Frozen (read-only) event/assignment cards in the scheduler.
3. Hide/show toggle buttons replacing the delete button on strong-entity cards.

---

## 1. "Show hidden" switch

Add a toggle switch on three screens:

- Apartment list / search screen.
- Events search screen.
- Tasks list (inside the apartment details screen).

### Behaviour

- **Default: OFF.** The search only returns **unhidden** elements.
- **When ON:** the search only returns **hidden** elements.

The switch does **not** return a mix of both. It flips between the two sets.

### Search form payloads

Each search endpoint already accepts a `visible` field in the request body.

| Screen     | Endpoint               | Form field   |
|------------|------------------------|--------------|
| Apartments | `POST /api/apartment/search` | `visible` (Boolean) |
| Events     | `POST /api/event/search`      | `frozen` (Boolean) |
| Tasks      | `POST /api/task/search`       | `visible` (Boolean) |

### How to map the switch to the form field

The field name and meaning differs by entity:

- **Apartments and tasks** use `visible`:
  - Switch OFF (default) → send `"visible": true`   (unhidden only)
  - Switch ON             → send `"visible": false`  (hidden only)
- **Events** use `frozen` (an event is frozen when its apartment is hidden):
  - Switch OFF (default) → send `"frozen": false`    (non-frozen only)
  - Switch ON             → send `"frozen": true`     (frozen only)

> If you omit the field entirely, the backend returns **all** elements. Do not
> omit it for these screens; always send the field based on the switch.

Example payload (events, switch ON → frozen only):

```json
{
  "frozen": true,
  "pageNumber": 0,
  "pageSize": 20
}
```

Example payload (apartments, switch OFF → unhidden only):

```json
{
  "visible": true,
  "pageNumber": 0,
  "pageSize": 20
}
```

### Notes

- For **events**, `frozen` is derived from the visibility of the event's
  **apartment**. An event is "frozen" when its apartment is hidden.
- For **tasks**, `visible` also controls whether a task appears in the
  apartment state calculation and in task selectors.
- Hidden/frozen entities remain visible as historical data (e.g. an old
  assignment still shows the name of a hidden worker/apartment), but they are
  excluded from these list searches unless the switch is ON.

---

## 2. Frozen cards in the scheduler

The scheduler endpoint (`GET /api/scheduler/{date}`) returns:

- `events`: a set of `EventSchedulerDto`
- `assignments`: a set of `AssignmentDto`

It returns **all** events and assignments in the requested range — both normal
and frozen ones. Both DTOs include a `frozen` boolean; read it to render the
card correctly (do not filter these out in the frontend).

### `frozen` meaning

- `false`: normal, editable/selectable entity.
- `true`: read-only entity. It belongs to a hidden apartment (for events) or
  to a hidden task/apartment (for assignments).

### Required UI behaviour for `frozen: true` cards

1. **Cannot be selected.** Disable click/tap selection and any drag or
   multi-select inclusion.
2. **Hide the edit and delete buttons** (or any contextual action menu) for
   that card.
3. **Lower opacity** (e.g. `opacity: 0.5` or a "disabled" visual style) so the
   card clearly looks inactive.

Example conditional styling:

```
if (card.frozen) {
  // disable pointer events / selection
  // hide edit & delete actions
  // classList.add("frozen") → CSS: opacity: 0.5; pointer-events: none;
}
```

### DTO fields to consume

`EventSchedulerDto`:

- `frozen` (boolean) — new.

`AssignmentDto`:

- `frozen` (boolean) — new.

Both already contain their existing fields (id, name, dates, state, etc.), so
no other scheduler layout changes are required.

---

## 3. Hide/Show toggle buttons

Replace the **delete** button with a **hide/show** toggle button (e.g. an eye icon:
`IconEye` when visible / `IconEyeOff` when hidden) in three places:

- **Apartment card** — instead of the delete button.
- **Worker card** — instead of the delete button.
- **Task card** — instead of the delete button.

### Behaviour

- The eye icon shows the current state: `IconEye` for a visible element,
  `IconEyeOff` for a hidden element.
- Clicking toggles visibility (hide ↔ unhide) via the dedicated endpoints.

### Endpoints

| Entity    | Hide                 | Unhide                 |
|-----------|----------------------|------------------------|
| Apartment | `PATCH /api/apartment/{id}/hide` | `PATCH /api/apartment/{id}/unhide` |
| Worker    | `PATCH /api/worker/{id}/hide`    | `PATCH /api/worker/{id}/unhide` |
| Task      | `PATCH /api/task/{id}/hide`      | `PATCH /api/task/{id}/unhide` |

All are `PATCH` requests with no body, using the entity UUID in the path.

### Notes

- Hiding a strong entity is the "soft delete" operation; the entity is kept but
  excluded from default list searches (see section 1).
- `visible=false` means hidden (show the `IconEyeOff` icon); `visible=true`
  means visible (show the `IconEye` icon).
- Hide operation may be rejected with HTTP `409 Conflict` when the entity has
  dependent work (e.g. pending assignments or active events). Show the
  server's `errorMessage` in that case.
- Keep the real/hard delete behind a separate, hidden/rare action; it must not
  be the primary button on the card.

---

## Summary of new properties

| DTO / Form                   | New field  | Type      | Meaning |
|------------------------------|------------|-----------|---------|
| `EventSchedulerDto`          | `frozen`   | boolean   | Event belongs to a hidden apartment → read-only |
| `AssignmentDto`              | `frozen`   | boolean   | Assignment belongs to a hidden task/apartment → read-only |
| `ApartmentSearchForm`        | `visible`  | Boolean   | Search filter: true = unhidden, false = hidden, null = all |
| `EventSearchForm`            | `frozen`   | Boolean   | Search filter: true = frozen, false = non-frozen, null = all (derived from apartment visibility) |
| `TaskSearchForm`             | `visible`  | Boolean   | Search filter: true = unhidden, false = hidden, null = all |

No new endpoints are required beyond the hide/unhide actions documented above.
See `docs/deletion_rules.md` for the full deletion/archiving rules.
