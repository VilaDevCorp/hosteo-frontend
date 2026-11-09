/**
 * Centralised z-index layers of the app.
 *
 * Mantine renders portals (modals, popovers/combobox dropdowns...) directly into
 * `document.body` and compares their `z-index` values, so the values below have
 * to respect this order: modal < popover.
 *
 * Mantine defaults are `modal: 200` and `popover: 300`. Every modal of this app
 * uses a custom (higher) z-index, therefore the popover layer is also custom and
 * is kept above the highest modal layer. Otherwise `Select` / `MultiSelect` /
 * `DatePickerInput` / `TimePicker` dropdowns rendered inside a modal are painted
 * *behind* the modal, which makes them look like they never open.
 */
export const Z_INDEX = {
    schedulerModal: 500,
    entityModal: 501,
    confirmationModal: 1000,
    popover: 1100
} as const;
