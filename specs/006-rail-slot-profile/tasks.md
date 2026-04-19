# Feature Tasks: Rack Profile Parameter for Rail Slot

## Phase 1: Setup Tasks

- [ ] T001 Create feature branch `006-rail-slot-profile` for rail slot parameter implementation
- [ ] T002 Verify existing test suite passes before implementing new feature
- [ ] T003 Review existing bracket parameter validation and geometry generation code in `src/models/bracketParams.ts` and `src/geometry/bracket.ts`
- [ ] T004 Understand existing implementation patterns for adding new parameters to Zod schemas and store

## Phase 2: Foundational Tasks

- [ ] T005 Update `src/models/bracketParams.ts` to include rail slot parameter in Zod schema with validation rules
- [ ] T006 Update `src/models/bracketParams.ts` to add rail slot parameter to default values with 0.25" default
- [ ] T007 Modify `src/store/bracketStore.ts` to include rail slot parameter in state management
- [ ] T008 Implement validation logic for new rail slot parameter in Zod schema with clamping for invalid values
- [ ] T009 Add rail slot parameter tests to existing test suite in `src/geometry/bracket.test.ts`

## Phase 3: [US1] Configure Rail Slot Parameters

- [ ] T010 Create UI component for rail slot parameter input in `src/components/`
- [ ] T011 Add rail slot parameter to the parameter control panel UI in `src/components/`
- [ ] T012 Implement validation and clamping for rail slot parameter values in UI
- [ ] T013 Write unit tests for rail slot parameter input validation

## Phase 4: [US2] Generate Correct Slot Geometry

- [ ] T014 Modify `src/geometry/bracket.ts` to generate slot geometry for mounting holes
- [ ] T015 Implement logic to create 0.08"D x slot width bump above/below holes based on rail slot parameter
- [ ] T016 Ensure slot geometry aligns precisely with mounting hole positions
- [ ] T017 Update bracket geometry builder to use configured rail slot width for slot dimensions
- [ ] T018 Add slot depth calculation logic (0.08"D) based on rail slot parameter
- [ ] T019 Implement slot width calculation as hole diameter minus 0.01mm for proper fit

## Phase 5: [US3] Maintain Default Compatibility

- [ ] T020 Ensure default rail slot value is set to 0.25"
- [ ] T021 Verify existing brackets without rail slot parameter continue to render correctly
- [ ] T022 Test backward compatibility with all existing bracket configurations
- [ ] T023 Add integration tests for default behavior compatibility with slot geometry generation

## Phase 6: Polish & Cross-Cutting Concerns

- [ ] T024 Update documentation files with new parameter information
- [ ] T025 Verify all tests pass with new rail slot parameter and slot geometry generation
- [ ] T026 Perform performance testing to ensure slot geometry generation doesn't impact FPS
- [ ] T027 Add edge case handling for invalid parameters (negative, excessive values) in both UI and model layers
- [ ] T028 Implement comprehensive error handling for slot geometry generation
- [ ] T029 Run full regression test suite to verify no existing functionality broken