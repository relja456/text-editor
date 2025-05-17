import { keys } from '../keys.js';
import TextIDE from '../text_ide.js';
import row_col from '../types.js';

function handle_arrow(text_ide: TextIDE, key: string, cursor_position: row_col): row_col {
   const lines_total = text_ide.text_data.length;
   const last_line_len = text_ide.text_data[lines_total - 1].length;
   let cursor_last = cursor_position;

   switch (key) {
      case 'ArrowLeft':
         text_ide.preffered_col = null;
         if (cursor_position.row === 0 && cursor_position.col === 0) return cursor_position;
         if (cursor_position.col > 0) {
            cursor_last = {
               row: cursor_position.row,
               col: cursor_position.col - 1,
            };
            break;
         }
         if (cursor_position.col === 0) {
            const prev_col_len = text_ide.text_data[cursor_position.row - 1].length;
            cursor_last = {
               row: cursor_position.row - 1,
               col: prev_col_len,
            };
            break;
         }

      case 'ArrowRight':
         text_ide.preffered_col = null;
         if (cursor_position.row === lines_total - 1 && cursor_position.col === last_line_len)
            return cursor_position;
         if (cursor_position.col === text_ide.text_data[cursor_position.row].length) {
            cursor_last = { row: cursor_position.row + 1, col: 0 };
            break;
         }
         if (cursor_position.col < text_ide.text_data[cursor_position.row].length) {
            cursor_last = {
               row: cursor_position.row,
               col: cursor_position.col + 1,
            };
            break;
         }

      case 'ArrowUp':
         if (cursor_position.row === 0) {
            cursor_last = {
               row: 0,
               col: 0,
            };
            break;
         }
         if (text_ide.preffered_col === null) {
            text_ide.preffered_col = cursor_position.col;
         }
         if (text_ide.text_data[cursor_position.row - 1].length >= text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row - 1,
               col: text_ide.preffered_col,
            };
            break;
         }
         if (text_ide.text_data[cursor_position.row - 1].length < text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row - 1,
               col: text_ide.text_data[cursor_position.row - 1].length,
            };
            break;
         }

      case 'ArrowDown':
         if (cursor_position.row === lines_total - 1) {
            cursor_last = {
               row: cursor_position.row,
               col: text_ide.text_data[lines_total - 1].length,
            };
            break;
         }
         if (text_ide.preffered_col === null) {
            text_ide.preffered_col = cursor_position.col;
         }
         if (text_ide.text_data[cursor_position.row + 1].length >= text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row + 1,
               col: text_ide.preffered_col,
            };
            break;
         }
         if (text_ide.text_data[cursor_position.row + 1].length < text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row + 1,
               col: text_ide.text_data[cursor_position.row + 1].length,
            };
            break;
         }
   }

   if (keys.is_down['shift']) {
      text_ide.select(text_ide.selection?.start || cursor_position, cursor_last);
   } else {
      text_ide.deselect();
   }
   return cursor_last;
}

function handle_control_arrow(text_ide: TextIDE, key: string, cursor_position: row_col): row_col {
   const lines_total = text_ide.text_data.length;
   const last_line_len = text_ide.text_data[lines_total - 1].length;
   let cursor_last = cursor_position;
   switch (key) {
      case 'ArrowLeft':
         text_ide.preffered_col = null;
         if (cursor_position.col === 0 && cursor_position.row > 0) {
            if (cursor_position.row > 0) {
               let is_space_left =
                  text_ide.text_data[cursor_position.row - 1][
                     text_ide.text_data[cursor_position.row - 1].length - 1
                  ] === ' ';
               let j = text_ide.text_data[cursor_position.row - 1].length - 1;

               while (is_space_left && j >= 0) {
                  is_space_left = text_ide.text_data[cursor_position.row - 1][j - 1] === ' ';
                  j--;
                  console.log('log1');
               }

               while (!is_space_left && j >= 0) {
                  is_space_left = text_ide.text_data[cursor_position.row - 1][j - 1] === ' ';
                  j--;
                  console.log('log2');
               }

               cursor_last = {
                  row: cursor_position.row - 1,
                  col: j + 1,
               };
            }
            break;
         }

         let is_space_left = text_ide.text_data[cursor_position.row][cursor_position.col - 1] === ' ';
         let i = cursor_position.col - 1;

         while (is_space_left && i >= 0) {
            is_space_left = text_ide.text_data[cursor_position.row][i - 1] === ' ';
            i--;
         }

         while (!is_space_left && i >= 0) {
            is_space_left = text_ide.text_data[cursor_position.row][i - 1] === ' ';
            i--;
         }

         cursor_last = {
            row: cursor_position.row,
            col: i + 1,
         };

         break;
      case 'ArrowRight':
         text_ide.preffered_col = null;
         if (cursor_position.col === text_ide.text_data[cursor_position.row].length) {
            if (cursor_position.row < text_ide.text_data.length - 1) {
               let is_space_right = text_ide.text_data[cursor_position.row + 1][0] === ' ';
               let j = 0;

               while (is_space_right && j <= text_ide.text_data[cursor_position.row + 1].length) {
                  is_space_right = text_ide.text_data[cursor_position.row + 1][j] === ' ';
                  j++;
               }

               while (!is_space_right && j <= text_ide.text_data[cursor_position.row + 1].length) {
                  is_space_right = text_ide.text_data[cursor_position.row + 1][j] === ' ';
                  j++;
               }

               cursor_last = {
                  row: cursor_position.row + 1,
                  col: j - 1,
               };
            }
            break;
         }

         let is_space_right = text_ide.text_data[cursor_position.row][cursor_position.col] === ' ';
         let j = cursor_position.col;

         while (is_space_right && j <= text_ide.text_data[cursor_position.row].length) {
            is_space_right = text_ide.text_data[cursor_position.row][j] === ' ';
            j++;
         }

         while (!is_space_right && j <= text_ide.text_data[cursor_position.row].length) {
            is_space_right = text_ide.text_data[cursor_position.row][j] === ' ';
            j++;
         }

         cursor_last = {
            row: cursor_position.row,
            col: j - 1,
         };

         break;
      case 'ArrowUp':
         if (cursor_position.row === 0) {
            cursor_last = {
               row: 0,
               col: 0,
            };
            break;
         }
         if (text_ide.preffered_col === null) {
            text_ide.preffered_col = cursor_position.col;
         }
         if (text_ide.text_data[cursor_position.row - 1].length >= text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row - 1,
               col: text_ide.preffered_col,
            };
            break;
         }
         if (text_ide.text_data[cursor_position.row - 1].length < text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row - 1,
               col: text_ide.text_data[cursor_position.row - 1].length,
            };
            break;
         }
         break;
      case 'ArrowDown':
         if (cursor_position.row === lines_total - 1) {
            cursor_last = {
               row: cursor_position.row,
               col: text_ide.text_data[lines_total - 1].length,
            };
            break;
         }
         if (text_ide.preffered_col === null) {
            text_ide.preffered_col = cursor_position.col;
         }
         if (text_ide.text_data[cursor_position.row + 1].length >= text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row + 1,
               col: text_ide.preffered_col,
            };
            break;
         }
         if (text_ide.text_data[cursor_position.row + 1].length < text_ide.preffered_col) {
            cursor_last = {
               row: cursor_position.row + 1,
               col: text_ide.text_data[cursor_position.row + 1].length,
            };
            break;
         }
         break;
   }

   if (keys.is_down['shift']) {
      text_ide.select(text_ide.selection?.start || cursor_position, cursor_last);
   } else {
      text_ide.deselect();
   }

   return cursor_last;
}

export { handle_arrow, handle_control_arrow };
