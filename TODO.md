# TODO — Fix Search Modal

## Steps
- [x] Analyzed root cause: search input in CreateSearchModal.tsx is missing value/onChange bindings
- [x] Fix CreateSearchModal.tsx: bind input value/onChange, add autoFocus, reset on close
- [x] Fix userService.ts: encode query with encodeURIComponent
- [x] Wire up Add Friend / Accept / Message buttons on search result cards
- [ ] Verify search now returns users (type in modal, add friend, message)
