type row_col = { row: number; col: number };

export function equals(a: row_col, b: row_col): boolean {
   return a.row === b.row && a.col === b.col;
}

export default row_col;
