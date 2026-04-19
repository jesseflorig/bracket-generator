# Feature Specification: Rack Profile Group

**Feature Branch**: `004-rack-profile-group`
**Created**: 2026-04-18
**Status**: Draft
**Input**: User description: "group rack and mounting hole settings into a collapsable rack profile group"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Collapse Rack Profile to Reduce Visual Clutter (Priority: P1)

A designer is focused on adjusting faceplate or shelf dimensions. The rack and mounting hole settings — which rarely change once a rack standard is chosen — are taking up space in the panel. They collapse the Rack Profile group to hide those settings and get a cleaner, more focused view of the controls they actually need.

**Why this priority**: This is the core value of the feature. Collapsing frees up vertical space for the settings the designer is actively using, making the panel easier to navigate.

**Independent Test**: Can be fully tested by clicking the collapse toggle on the Rack Profile group and confirming that the rack and mounting hole inputs are hidden while all other settings remain visible and usable.

**Acceptance Scenarios**:

1. **Given** the dimension panel is open, **When** the user clicks the Rack Profile group header, **Then** all rack and mounting hole settings collapse out of view while faceplate, cutout, and shelf settings remain fully visible.
2. **Given** the Rack Profile group is collapsed, **When** the user clicks the group header again, **Then** all rack and mounting hole settings expand back into view.
3. **Given** the Rack Profile group is collapsed, **When** the user adjusts any visible setting (faceplate, cutout, shelf), **Then** the 3D preview updates normally and the collapsed group stays collapsed.

---

### User Story 2 - Rack Profile Group Remembers Its State (Priority: P2)

A designer collapses the Rack Profile group, then makes several adjustments to faceplate and shelf controls. After their session — or after navigating away and returning — they expect the group to remember whether it was collapsed or expanded, so they don't have to re-collapse it every time they open the app.

**Why this priority**: Persistence removes repetitive interaction. Once a designer picks a rack standard, they rarely revisit those settings — the collapsed state should stick.

**Independent Test**: Can be tested by collapsing the group, refreshing the page, and verifying the group remains collapsed on reload.

**Acceptance Scenarios**:

1. **Given** the user has collapsed the Rack Profile group, **When** the page is refreshed, **Then** the group loads in the collapsed state.
2. **Given** the user has expanded the Rack Profile group, **When** the page is refreshed, **Then** the group loads in the expanded state.
3. **Given** the app is opened for the first time (no saved state), **When** the dimension panel is displayed, **Then** the Rack Profile group is collapsed by default.

---

### Edge Cases

- What should the initial state be on first load with no saved preference? — Collapsed by default, since rack standards rarely need adjustment.
- What happens if the user resets all settings to defaults — does the group state reset too? — No; collapse state is a UI preference only and is not affected by data resets.
- What if a designer needs to see rack settings and faceplate settings at the same time? — They can expand the group; expanded state persists until they collapse it again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The dimension panel MUST include a "Rack Profile" group containing these settings: rack width, rail width, mounting hole diameter, mounting hole inset, and mounting hole edge offset.
- **FR-002**: The Rack Profile group MUST be collapsible — clicking the group header toggles the contained settings between visible and hidden.
- **FR-003**: When collapsed, all settings inside the Rack Profile group MUST be hidden. When expanded, all settings MUST be fully visible and interactive.
- **FR-004**: All settings NOT in the Rack Profile group (faceplate height, faceplate depth, corner radius, shelf wall thickness, cutout width, cutout height, shelf depth) MUST remain visible and functional regardless of the group's state.
- **FR-005**: The group header MUST include a visible indicator (such as an arrow or chevron) that reflects the current expanded or collapsed state.
- **FR-006**: The collapsed or expanded state of the Rack Profile group MUST be saved and restored across page refreshes.
- **FR-007**: The Rack Profile group MUST default to collapsed on first load when no saved preference exists.

### Key Entities

- **Rack Profile Group**: A collapsible UI section containing rack width, rail width, hole diameter, hole inset, and hole edge offset. Has an expanded/collapsed state that persists independently of bracket parameter values.
- **UI Preference**: The saved expanded/collapsed state of the Rack Profile group. Stored separately from bracket geometry parameters; unaffected by parameter resets.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A designer can collapse the Rack Profile group in a single click, immediately hiding at least 5 settings.
- **SC-002**: After collapsing the Rack Profile group, all remaining settings remain accessible and the 3D preview continues to update in real time with no delay.
- **SC-003**: The collapsed/expanded state is preserved across page refreshes — once set, it is restored correctly on every subsequent load.
- **SC-004**: On first load, the Rack Profile group is collapsed by default, reducing the number of initially visible settings by at least 5.

## Assumptions

- Faceplate height, faceplate depth, corner radius, shelf wall thickness, cutout width, cutout height, and shelf depth remain outside the Rack Profile group and are always visible.
- The derived read-only values (faceplate width, shelf max width) that depend on rack settings remain visible outside the group, since they show live geometry feedback.
- The collapse state is stored as a local UI preference and is not part of the bracket parameter data model — it does not affect geometry or exports.
- This feature introduces only one collapsible group; other settings are not grouped or made collapsible.
- All bracket parameter values remain unchanged when the group is collapsed — the settings are hidden, not disabled or reset.
