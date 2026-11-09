# Hosteo — User Guide

Welcome to **Hosteo**! This guide explains, in plain language, how to use the
website day to day: what the different screens are for, how a booking moves
through its lifecycle, how to import reservations, and — importantly — what you
can and cannot do at each step (create, edit, delete, hide).

No technical knowledge is required to use Hosteo. This document covers:

1. [Getting started](#1-getting-started)
2. [The main concepts (quick glossary)](#2-the-main-concepts-quick-glossary)
3. [Apartment statuses — the heart of Hosteo](#3-apartment-statuses--the-heart-of-hosteo)
4. [Your everyday workflow](#4-your-everyday-workflow)
5. [The Scheduler (calendar)](#5-the-scheduler-calendar)
6. [Importing reservations (Booking.com / Airbnb)](#6-importing-reservations-bookingcom--airbnb)
7. [Alerts and notifications](#7-alerts-and-notifications)
8. [Hiding (archiving) vs. deleting](#8-hiding-archiving-vs-deleting)
9. [What "frozen" (read-only) means](#9-what-frozen-read-only-means)
10. [On-screen indicators and colours](#10-on-screen-indicators-and-colours)
11. [Common restrictions and why something may be blocked](#11-common-restrictions-and-why-something-may-be-blocked)
12. [Tips and frequent questions](#12-tips-and-frequent-questions)

---

## 1. Getting started

### Signing up and signing in

- **Create an account** using a username, an email address, and a password.
- **Sign in** with your username and password. You can tick **"Remember me"** to
  stay signed in on that device.
- If you are not signed in, you can only see the sign-in / sign-up screens.

### The main menu

On the left you will always see the main navigation bar with five sections:

| Icon | Section | What it is for |
|------|---------|----------------|
| Calendar | **Scheduler** | Your weekly calendar — bookings and cleanings at a glance. This is your home screen. |
| Bed | **Events** | The full list of stays/events, with search and filters. |
| Home | **Apartments** | Your properties (apartments) and their cleaning tasks. |
| People | **Workers** | The people who carry out the cleaning/maintenance work. |
| Template | **Templates** | A library of reusable task checklists. |

---

## 2. The main concepts (quick glossary)

| Term | Meaning |
|------|---------|
| **Apartment** | A property you manage (a flat, house, etc.). Each apartment has a **status** (see below) and a list of **tasks**. |
| **Event** | Something that occupies the apartment over a period: a **booking** (guest stay), **personal use** (you use it), or **maintenance** (repairs). |
| **Task** | A piece of work to do on the apartment, e.g. "Full clean", "Inspection", "Restock toiletries". Tasks can be **Mandatory** (must be done after every stay) or **Extra** (only when you decide to schedule them). |
| **Worker** | A person you assign tasks to (cleaner, handyman, etc.). |
| **Assignment** | A specific task given to a specific worker on a specific date, for a specific event. |
| **Template** | A ready-made task definition (checklist) you can keep as a library. |

> A simple way to remember the relationship:
> an **apartment** has **tasks**; a **booking (event)** happens; afterwards you
> create **assignments** that give those tasks to **workers** to do.

---

## 3. Apartment statuses — the heart of Hosteo

Every apartment always has exactly one of three statuses. **You never set this
status by hand** — Hosteo calculates it automatically from your bookings and
cleaning progress.

| Status | Colour | What it means |
|--------|--------|---------------|
| **READY** | Green | The apartment is clean and available for the next guest. |
| **OCCUPIED** | Orange/yellow | A guest is currently staying (an event is "in progress"). |
| **USED** | Red | A guest has left and the apartment still needs work (cleaning/maintenance) before it is ready again. |

The normal cycle looks like this:

```
READY  →  OCCUPIED  →  USED  →  READY  → ...
        (guest in)   (needs   (cleaned)
                      cleaning)
```

- A **planned (pending)** booking does *not* change the status yet.
- When the guest arrives (event becomes **In progress**), the apartment becomes **OCCUPIED**.
- When the guest leaves (event becomes **Finished**), the apartment becomes **USED**.
- Once all **mandatory** tasks are completed (assignments finished), it returns to **READY**.

> If an apartment has **no tasks at all**, it goes back to **READY**
> automatically — there is simply nothing to clean.

---

## 4. Your everyday workflow

Here is the step-by-step routine you will use most often.

### A. One-time setup

1. **Add your apartments** (name, address, and optionally the Airbnb/Booking IDs).
2. For each apartment, **add its tasks** — at minimum the **mandatory** ones
   (for example "Full clean"). You can add extra tasks and step-by-step
   checklists too.
3. **Add your workers** (name and language).

### B. For each guest stay

1. **Create the event** (booking) on the apartment, with check-in/check-out
   dates and times.
   - New events start in the **Pending** (scheduled) status.
2. **Start the stay** — when the guest arrives, change the event to **In progress**.
   The apartment becomes **OCCUPIED**.
3. **End the stay** — when the guest leaves, change the event to **Finished**.
   The apartment becomes **USED**.
4. **Assign the cleanup** — open the finished event and assign its tasks to
   workers (creating **assignments**). Schedule them between checkout and the
   next check-in.
5. **Complete the work** — mark each assignment as **Finished** as the work is
   done. Once all **mandatory** tasks are done, the apartment automatically
   returns to **READY**.

### C. During the week

- Keep an eye on the **Scheduler** and the **alerts** (see sections 5 and 7).
- Import upcoming reservations from Booking.com or Airbnb when needed
  (see section 6).

---

## 5. The Scheduler (calendar)

The Scheduler is your home screen and shows a **weekly view** of everything.

- **Change the week** with the date picker at the top.
- **Bookings (events)** and **cleanings (assignments)** appear as cards on their
  day.
- **Click a card** to select it. You can select several cards at once; a toolbar
  then appears so you can act on all of them together:
  - change status (**Pending / In progress / Finished**),
  - **cancel** an event,
  - **delete** the selected items.
- **Hover a card** to reveal its **edit (pencil)** and **delete (bin)** buttons.
  (These buttons do not appear on faded, read-only cards — see section 9.)
- An event card can show an **"Overdue"** label in red when it is past its date
  and still not completed.
- The top bar also contains the **"Import Reservations"** button, a
  **"Pending Issues"** badge (if any), and the **alerts** indicator.

> Tip: you can also change an event's status from its **edit form** (the
> "State" field) or from the **Events** list.

---

## 6. Importing reservations (Booking.com / Airbnb)

You can bulk-load upcoming reservations from the CSV files exported by
Booking.com or Airbnb.

1. On the Scheduler, click **"Import Reservations"**.
2. Choose the **platform** (Booking.com or Airbnb) and select your **.csv** file.
3. Click **"Import"**.

What happens next depends on the result:

- **Everything is fine** → the calendar refreshes and a green confirmation tells
  you how many reservations were added.
- **Some items could not be placed** → the **"Import Issues"** window opens:
  - a summary line tells you how many succeeded and how many need attention,
  - each problem item shows the **reason** it could not be imported (for example
    a schedule conflict or an unrecognised property ID),
  - you can **Retry All**, **Dismiss All**, or dismiss items one by one.
    (The **Edit** button on an issue is a placeholder for a future update — it
    does nothing yet.)

> Unresolved issues are **kept** for you. If you close the window and come back
> later, a **"Pending Issues (n)"** badge remains on the Scheduler so you can
> resume where you left off.

---

## 7. Alerts and notifications

Hosteo draws your attention to upcoming check-ins that are not fully prepared.

- A **yellow** warning triangle means: a check-in is **about 5 days away** and
  some mandatory tasks are still **unassigned**.
- A **red** warning triangle means: a check-in is **about 2 days away** and
  tasks are still **unassigned** or **not completed**.

You will see these triangles:

- as a **counter** in the top bar of the Scheduler (red and yellow totals),
- directly on the event cards in the calendar,
- grouped in the **Alerts panel** (click the counter to open it). From there you
  can jump straight to assigning or completing the missing work.

Green success and red error **toast messages** appear briefly after actions to
confirm what happened (e.g. "Event created", or an explanation if something was
rejected).

---

## 8. Hiding (archiving) vs. deleting

Hosteo distinguishes between two very different ways of "removing" something:

- **Hide / archive** — keeps the item but takes it out of your normal lists.
  It is **reversible** (you can show it again later). Used for **apartments,
  workers and tasks**.
- **Delete** — permanently removes the item and cannot be undone. Used for
  **events, assignments and templates**.

### The eye icon (hide / show)

On an **apartment**, **worker** or **task** card you will see an **eye** icon
instead of a delete button:

- An **open eye** means the item is visible (active). Clicking it **hides** the item.
- A **crossed-out eye** means the item is hidden (archived). Clicking it **shows** it again.

A confirmation window appears before you hide or show an item.

### The bin icon (delete)

On **events**, **assignments** and **templates** you will see a **bin (trash)**
icon. A confirmation window appears before anything is permanently removed.

### The "Show hidden" switch

On the **Apartments**, **Events** and **Workers** screens there is a
**"Show hidden"** switch:

- **Off (default):** you see only the normal, active items.
- **On:** you see only the hidden/archived items (so you can find and restore them).

> The switch swaps between the two lists — it does not show both at once.

---

## 9. What "frozen" (read-only) means

When an item is related to something hidden/archived, it becomes **frozen**
(read-only). A frozen card is shown **faded** (semi-transparent) and you cannot:

- select it,
- edit it,
- delete it.

This happens in two main cases:

- An **event** becomes frozen when its **apartment is hidden**.
- An **assignment** becomes frozen when its **task or apartment is hidden**.

In other words: hiding an apartment "locks" its history (events and cleanings)
so you cannot accidentally change the past.

---

## 10. On-screen indicators and colours

Here is a quick legend of what you will see in the interface.

### Status badges (with text)

| Badge | Colour | Meaning |
|-------|--------|---------|
| READY | Green | Apartment clean and available |
| OCCUPIED | Orange/yellow | Guest currently in the apartment |
| USED | Red | Needs cleaning/maintenance |
| PENDING | Blue | Scheduled / not started yet |
| IN PROGRESS | Orange/yellow | Currently happening |
| FINISHED | Green | Completed |
| CANCELLED | Red | Cancelled |

### Small round dots on calendar cards

| Dot | Meaning |
|-----|---------|
| Green | Finished / done |
| Orange | In progress |
| Hollow (outline) | Pending / not started |
| Red | Cancelled |

### Other icons

| Icon | Meaning |
|------|---------|
| Yellow warning triangle | Warning — tasks to assign (≈ 5 days before check-in) |
| Red warning triangle | Urgent — tasks to assign or complete (≈ 2 days before check-in) |
| Pencil | Edit |
| Bin (trash) | Delete (permanent) |
| Open / crossed eye | Show / hide (archive) |
| Airbnb logo | Booking came from Airbnb |
| Booking.com logo | Booking came from Booking.com |
| Crossed circle | Manual entry (no external platform) |
| "Overdue" (red text) | Event is past its date and not completed |

---

## 11. Common restrictions and why something may be blocked

Hosteo protects your schedule from mistakes. If an action is refused, a red
message will usually explain why. The most common reasons are listed below.

### Creating

- You **cannot schedule two things that overlap** (two bookings, a booking and a
  cleaning, or two cleanings for the same worker at the same time).
- A cleanup (assignment) must be scheduled **after the guest checks out** and
  **before the next guest checks in**.
- You **cannot assign the same task twice** to the same event.
- You **cannot create events, tasks or assignments for a hidden apartment**
  (it is frozen).
- You **cannot assign work to a hidden worker**.
- To create an assignment you need three things: an **event**, a **task**
  belonging to that apartment, and a **worker**.

### Editing

- You **cannot edit frozen items** (faded cards — see section 9).
- You can move an event freely between **Pending**, **In progress**, **Finished**
  and **Cancelled** — there is no forced one-way sequence, so you *can* go
  backwards (for example, set an event back to **Pending** after it was
  **In progress**). The only restriction is that events must stay in
  **chronological order** with each other: a later event cannot be further along
  than an earlier one (e.g. you cannot mark an event **In progress** or
  **Finished** while an earlier event is still **Pending** or **In progress**,
  and you cannot set an event back to **Pending** if a later event is already
  **In progress** or **Finished**).
- You **cannot edit the cleanings of an old (past) event**. Only the most
  recent finished event can have its tasks changed, and only while no newer
  stay has already started.
- You **cannot mark a task as finished before the event itself has finished**.

### Hiding and deleting

- An **apartment** can only be hidden when it has **no pending or in-progress
  bookings and no pending cleanings**. Hiding it locks its events and
  assignments (frozen).
- A **worker** can only be hidden when they have **no pending assignments**.
- A **task** can only be hidden when **no pending assignment** uses it. Hiding a
  task freezes its existing assignments.
- An **assignment** cannot be deleted if it belongs to a **past event**.
- A **worker** or **task** can only be permanently deleted when **no assignment
  references it** — normally you hide them instead of deleting.
- **Templates** can be deleted at any time.

> Permanent deletion of apartments, workers and tasks is deliberately rare and
> is not the main button on their cards. Prefer **hiding** unless you truly want
> to erase the item and its history.

---

## 12. Tips and frequent questions

**Q: Why is my apartment "USED" (red)?**
A: A stay has finished and one or more **mandatory** tasks still have no
completed assignment. Open the finished event, assign the tasks to workers, and
mark them finished. The apartment will automatically turn green again.

**Q: I scheduled an "extra" task and now the apartment won't become ready. Why?**
A: Any **pending** assignment — even an extra one — keeps the apartment
"USED". Either complete it or delete that assignment to unblock the apartment.

**Q: Can I undo a mistake?**
A: Hiding is always reversible (use the "Show hidden" switch and the eye icon to
bring it back). Permanent deletions cannot be undone, which is why they always
ask for confirmation.

**Q: Why is a card faded and I can't click it?**
A: It is **frozen** because it belongs to a hidden apartment/task. Unhide the
related apartment or task if you need to work with it.

**Q: How do I mark cleaning as done?**
A: Open the event (or select the assignment and use the toolbar) and change the
assignment's status to **Finished**.

**Q: What are Templates for?**
A: They are reusable task checklists (name, category, duration, steps,
mandatory/extra). Keep your standard routines there so you can create tasks
consistently.

---

We hope this guide helps you get the most out of Hosteo!
