import { keys } from './keys.js';
import global from './globals.js';
import row_col from './types.js';

class TextIDE {
   ordered_list_element: HTMLElement;

   text_data: string[] = [''];

   active_row: number = -1;
   selected_rows: number[] = [];
   selection: { smaller: row_col; bigger: row_col } | null = null;
   preffered_col: number | null = null;

   constructor(ordered_list_element: HTMLElement) {
      this.ordered_list_element = ordered_list_element;
   }

   handle_keypress(key: string, cursor_position: row_col): row_col {
      if (keys.ignore.include(key)) return cursor_position;
      if (keys.arrow.include(key)) return this.handle_arrow(key, cursor_position);

      this.preffered_col = null;

      if (key === 'Enter') return this.handle_enter(cursor_position);
      if (key === 'Backspace') return this.handle_backspace(cursor_position);
      if (key === 'Tab') return this.handle_tab(cursor_position);

      return this.handle_input(key, cursor_position);
   }

   handle_arrow(key: string, cursor_position: row_col): row_col {
      const lines_total = this.text_data.length;
      const last_line_len = this.text_data[lines_total - 1].length;
      switch (key) {
         case 'ArrowLeft':
            this.preffered_col = null;
            if (cursor_position.row === 0 && cursor_position.col === 0) return cursor_position;
            if (cursor_position.col > 0)
               return {
                  row: cursor_position.row,
                  col: cursor_position.col - 1,
               };
            if (cursor_position.col === 0) {
               const prev_col_len = this.text_data[cursor_position.row - 1].length;
               return {
                  row: cursor_position.row - 1,
                  col: prev_col_len,
               };
            }
            break;

         case 'ArrowRight':
            this.preffered_col = null;
            if (cursor_position.row === lines_total - 1 && cursor_position.col === last_line_len)
               return cursor_position;
            if (cursor_position.col === this.text_data[cursor_position.row].length)
               return { row: cursor_position.row + 1, col: 0 };
            if (cursor_position.col < this.text_data[cursor_position.row].length)
               return {
                  row: cursor_position.row,
                  col: cursor_position.col + 1,
               };
            break;

         case 'ArrowUp':
            if (cursor_position.row === 0) return cursor_position;
            if (this.preffered_col === null) {
               this.preffered_col = cursor_position.col;
            }
            if (this.text_data[cursor_position.row - 1].length >= this.preffered_col)
               return {
                  row: cursor_position.row - 1,
                  col: this.preffered_col,
               };
            if (this.text_data[cursor_position.row - 1].length < this.preffered_col)
               return {
                  row: cursor_position.row - 1,
                  col: this.text_data[cursor_position.row - 1].length,
               };

         case 'ArrowDown':
            if (cursor_position.row === lines_total - 1)
               return {
                  row: cursor_position.row,
                  col: this.text_data[lines_total - 1].length,
               };
            if (this.preffered_col === null) {
               this.preffered_col = cursor_position.col;
            }
            if (this.text_data[cursor_position.row + 1].length >= this.preffered_col)
               return {
                  row: cursor_position.row + 1,
                  col: this.preffered_col,
               };
            if (this.text_data[cursor_position.row + 1].length < this.preffered_col)
               return {
                  row: cursor_position.row + 1,
                  col: this.text_data[cursor_position.row + 1].length,
               };
      }

      return cursor_position;
   }

   handle_enter(cursor_position: row_col): row_col {
      const before_cursor = this.text_data[cursor_position.row].slice(0, cursor_position.col);
      const after_cursor = this.text_data[cursor_position.row].slice(cursor_position.col);

      this.text_data.splice(cursor_position.row, 0, before_cursor);

      this.text_data[cursor_position.row + 1] = after_cursor;
      return { row: cursor_position.row + 1, col: 0 };
   }

   handle_backspace(cursor_position: row_col): row_col {
      if (cursor_position.row === 0 && cursor_position.col === 0) return cursor_position;

      if (cursor_position.col === 0 && cursor_position.row > 0) {
         this.text_data.splice(cursor_position.row, 1);
         return {
            row: cursor_position.row - 1,
            col: this.text_data[cursor_position.row - 1].length,
         };
      } else {
         console.log('col ' + cursor_position.col);
         this.text_data[cursor_position.row] = this.remove_nth_char(
            this.text_data[cursor_position.row],
            cursor_position.col - 1
         );
         return {
            row: cursor_position.row,
            col: cursor_position.col - 1,
         };
      }
   }

   handle_tab(cursor_position: row_col): row_col {
      const current_row = this.text_data[cursor_position.row];
      const tab_width = global.tab_width;
      this.text_data[cursor_position.row] =
         current_row.slice(0, cursor_position.col) +
         ' '.repeat(tab_width) +
         current_row.slice(cursor_position.col);
      return { row: cursor_position.row, col: cursor_position.col + 4 };
   }

   handle_input(key: string, cursor_position: row_col): row_col {
      this.deselect();

      this.text_data[cursor_position.row] =
         this.text_data[cursor_position.row].slice(0, cursor_position.col) +
         key +
         this.text_data[cursor_position.row].slice(cursor_position.col);
      return { row: cursor_position.row, col: cursor_position.col + 1 };
   }

   select(pos0: row_col, pos1: row_col): void {
      this.deselect();

      const pos = this.sort_positions(pos0, pos1);

      const selected_rows = this.map_selected_rows(pos.smaller, pos.bigger);
      this.selection = pos;

      for (const r in selected_rows) {
         const row_num = parseInt(r);
         const row_info = selected_rows[r];

         this.apply_style_to_selected_row(row_num, row_info[0], row_info[1]);
         this.selected_rows.push(row_num);
      }
   }

   deselect(): void {
      for (const [id, text] of this.text_data.entries()) {
         let select_dom = document.getElementById(`select--${id}`);
         let text_dom = document.getElementById(`text--${id}`);

         if (select_dom) {
            select_dom.style.left = '0px';
            select_dom.style.width = '0px';
         }

         if (text_dom) text_dom.style.left = '0px';
      }

      this.selected_rows = [];
      this.selection = null;
   }

   map_selected_rows(smaller: row_col, bigger: row_col): { [key: number]: [number, number] } {
      const map: { [key: number]: [number, number] } = {};

      if (bigger.row - smaller.row === 0) {
         map[smaller.row] = [smaller.col, bigger.col];
         return map;
      }

      if (bigger.row - smaller.row >= 1) {
         (map[smaller.row] = [smaller.col, this.text_data[smaller.row].length]),
            (map[bigger.row] = [0, bigger.col]);
      }

      if (bigger.row - smaller.row >= 2) {
         for (let r = smaller.row + 1; r < bigger.row; r++) {
            map[r] = [0, this.text_data[r].length];
         }
      }

      return map;
   }

   apply_style_to_selected_row(row_num: number, col0: number, col1: number) {
      col1 === 0 ? (col1 = 1) : null;
      const indent = global.char_width * col0;
      const width = global.char_width * (col1 - col0);
      const selected_el = document.getElementById(`select--${row_num}`)!;
      const text_el = document.getElementById(`text--${row_num}`)!;

      selected_el.style.left = `${indent}px`;
      selected_el.style.width = `${width}px`;

      text_el.style.left = `-${indent}px`;
   }

   sort_positions(pos0: row_col, pos1: row_col): { smaller: row_col; bigger: row_col } {
      let smaller = null;
      let bigger = null;

      if (pos0.row === pos1.row && pos0.col === pos1.col) {
         this.selected_rows = [];
         return { smaller: pos0, bigger: pos1 };
      }

      if (pos0.row != pos1.row) {
         if (pos0.row < pos1.row) {
            smaller = pos0;
            bigger = pos1;
         } else {
            smaller = pos1;
            bigger = pos0;
         }
      } else {
         if (pos0.col < pos1.col) {
            smaller = pos0;
            bigger = pos1;
         } else {
            smaller = pos1;
            bigger = pos0;
         }
      }

      return { smaller, bigger };
   }

   render(): void {
      for (const [id, text] of this.text_data.entries()) {
         let line_dom = document.getElementById(`line--${id}`);
         let select_dom = document.getElementById(`select--${id}`);
         let text_dom = document.getElementById(`text--${id}`);

         if (!line_dom || !select_dom || !text_dom) {
            line_dom = document.createElement('li');
            line_dom.id = `line--${id}`;
            line_dom.className = 'line';

            select_dom = document.createElement('div');
            select_dom.id = `select--${id}`;
            select_dom.className = 'select';

            text_dom = document.createElement('span');
            text_dom.id = `text--${id}`;
            text_dom.className = 'text';

            line_dom.appendChild(select_dom);
            select_dom.appendChild(text_dom);
            this.ordered_list_element.append(line_dom);
         }

         line_dom.style.height = `${global.line_height}px`;
         select_dom.style.height = `${global.line_height}px`;

         text_dom.innerText = text;
      }

      let i = this.text_data.length;
      let line = document.getElementById(`line--${i}`);
      while (line !== null) {
         line.remove();
         i += 1;
         line = document.getElementById(`line--${i}`);
      }
   }

   set_active_row(row: number): void {
      if (row === this.active_row) return;

      this.reset_active_row();

      const new_selected_row_el = document.getElementById(`line--${row}`)!;
      new_selected_row_el.className = 'line-selected';

      this.active_row = row;
   }

   reset_active_row() {
      const selected_row = document.getElementById(`line--${this.active_row}`);
      if (selected_row) selected_row.className = 'line';
   }

   remove_nth_char(s: string, n: number): string {
      // zero indexing
      if (n < 0 || n >= s.length) {
         throw new Error('Index out of bounds');
      }
      return s.slice(0, n) + s.slice(n + 1);
   }
}

export default TextIDE;
