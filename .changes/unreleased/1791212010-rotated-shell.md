---
type: Fixed
title: A rotated iOS app fills its screen again
---

`display/visible-viewport` publishes `--shell-seen`, the visible window's own height, as a floor a game's stylesheet holds its shell to, and re-measures after every resize — so an installed iOS app turned from upright onto its side no longer shrinks to a sliver along the top of the screen.
