type NavRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};
type NavDir = "up" | "down" | "left" | "right";
/**
 * The item the cursor should move to, or null when there is nowhere to go.
 *
 * Candidates are the items whose centre lies beyond the current one along
 * the direction asked for, and they are taken in TWO TIERS: first the ones
 * that also share screen ACROSS that direction, then everything else. The
 * tiers are the whole trick. A card is a column of rows, some of which hold
 * a pair of buttons side by side, and a full-width row above happens to have
 * its centre to the RIGHT of the left button of such a pair — so a plain
 * "cheapest by distance" walk answers RIGHT with the row above. Requiring a
 * shared line first is what makes right mean the button next to this one,
 * and the second tier is what still gets a cursor out of a grid's last
 * column.
 *
 * With nothing ahead the cursor WRAPS to the far end — a list that stops
 * dead at the bottom makes a player walk all the way back up to reach the
 * button under their thumb.
 */
declare function pickNeighbour(rects: NavRect[], from: number, dir: NavDir): number | null;

export { type NavDir, type NavRect, pickNeighbour };
