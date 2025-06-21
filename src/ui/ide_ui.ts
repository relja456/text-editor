import Cursor from '../cursor.js';
import env from '../env.js';
import IDE_logic from '../ide_logic.js';
import row_col from '../types.js';

class IDE_UI {
   private static instance: IDE_UI;

   ide_logic: IDE_logic | null = null;
   cursor: Cursor | null = null;

   private text_area_el: HTMLElement;
   private ordered_list_el: HTMLElement;

   private last_rendered_active_row: number = -1;

   private last_text: string[] = [''];

   private constructor() {
      // this.ide_logic ;
      this.text_area_el = document.getElementById('text-area')!;
      this.ordered_list_el = document.getElementById('ordered-list')!;
   }

   static getInstance(): IDE_UI {
      if (!IDE_UI.instance) {
         IDE_UI.instance = new IDE_UI();
      }
      return IDE_UI.instance;
   }

   render(): void {
      if (env.marker_start_w === 0) {
         env.marker_start_w =
            document.getElementById('marker--0')!.getBoundingClientRect().width - env.marker_pr;
      }

      env.marker_w =
         env.marker_start_w + Math.floor(Math.log10(this.ide_logic!.text_data.length)) * env.char_width;

      document.documentElement.style.setProperty(`--marker-width`, `${env.marker_w}px`);
      document.documentElement.style.setProperty(`--ordered-list-pl`, `${env.ol_pl}px`);

      const diff = this.text_diff(this.last_text, this.ide_logic!.text_data);

      const fragment = document.createDocumentFragment();

      const ol_h = env.line_height * (this.ide_logic!.text_data.length + 1);
      const ta_h = this.text_area_el.getBoundingClientRect().height;
      const scroll_top = this.text_area_el.scrollTop;

      const [first, last] = this.get_visible_rows();

      this.ordered_list_el.style.height = `${env.line_height * (last - first)}px`;
      this.ordered_list_el.style.paddingTop = `${env.line_height * first}px`;

      let calc_pb = env.line_height * (this.ide_logic!.text_data.length - last);
      calc_pb >= 0 ? null : (calc_pb = 0);
      this.ordered_list_el.style.paddingBottom = `${calc_pb}px`;

      this.ordered_list_el.innerHTML = '';

      if (ol_h > ta_h) {
         for (let row = first; row <= last; row++) {
            if (row >= this.ide_logic!.text_data.length) break;
            const el = this.add_line_dom(row, this.ide_logic!.text_data[row]);
            fragment.appendChild(el);
         }
      } else {
         for (let row = 0; row < this.ide_logic!.text_data.length; row++) {
            fragment.appendChild(this.add_line_dom(row, this.ide_logic!.text_data[row]));
         }
      }

      this.ordered_list_el.appendChild(fragment);

      this.last_text = JSON.parse(JSON.stringify(this.ide_logic!.text_data));

      this.render_selected_text(this.ide_logic!.text_data, this.ide_logic!.selection);
      this.render_active_row(this.cursor!.row);

      this.cursor?.update_dom_position();
   }

   private add_line_dom(row: number, text: string): HTMLElement {
      let line_dom = document.getElementById(`line--${row}`);
      let marker_dom = line_dom?.children[0] as HTMLElement;
      let select_dom = line_dom?.children[1] as HTMLElement;
      let text_dom = line_dom?.children[2] as HTMLElement;

      if (!line_dom || !marker_dom || !select_dom || !text_dom) {
         line_dom = document.createElement('li');
         line_dom.id = `line--${row}`;
         line_dom.className = 'line';

         marker_dom = document.createElement('span');
         marker_dom.id = `marker--${row}`;
         marker_dom.className = 'marker';
         marker_dom.innerText = `${row + 1}`;

         select_dom = document.createElement('div');
         select_dom.id = `select--${row}`;
         select_dom.className = 'select';

         text_dom = document.createElement('span');
         text_dom.id = `text--${row}`;
         text_dom.className = 'text';

         line_dom.appendChild(marker_dom);
         line_dom.appendChild(select_dom);
         line_dom.appendChild(text_dom);
      }

      document.documentElement.style.setProperty(`--line-height`, `${env.line_height}px`);

      text_dom.innerText = text;

      return line_dom;
   }
   // }

   text_diff(old_text: string[], new_text: string[]): [start: number, finish: number] | null {
      let start = 0;
      let endOld = old_text.length - 1;
      let endNew = new_text.length - 1;

      // Find common prefix
      while (start <= endOld && start <= endNew && old_text[start] === new_text[start]) {
         start++;
      }

      // Find common suffix
      while (endOld >= start && endNew >= start && old_text[endOld] === new_text[endNew]) {
         endOld--;
         endNew--;
      }

      // If no difference, return null
      if (start > endOld && start > endNew) {
         return null;
      }

      // Return the range of difference
      return [start, Math.max(endOld, endNew) + 1];
   }

   get_visible_rows(): [start: number, finish: number] {
      const ide_window_h_px = this.text_area_el.getBoundingClientRect().height;
      const scroll_top = this.text_area_el.scrollTop;

      const max_rows_visible = Math.floor(ide_window_h_px / env.line_height);
      const scrolled_rows = Math.floor(scroll_top / env.line_height);

      let min = scrolled_rows - 1;
      min = min < 0 ? 0 : min;

      let max = scrolled_rows + max_rows_visible;
      max = max < 0 ? 0 : max;

      min = min > this.ide_logic!.text_data.length - 1 ? this.ide_logic!.text_data.length : min;
      max = max > this.ide_logic!.text_data.length - 1 ? this.ide_logic!.text_data.length - 1 : max;

      return [min, max];
   }

   // todo left right
   scroll(direction: 'up' | 'down', num: number): void {
      console.log('[scroll]');
      if (direction === 'up')
         this.text_area_el.scroll(0, this.text_area_el.scrollTop - (num + 1) * env.line_height);
      if (direction === 'down')
         this.text_area_el.scroll(0, this.text_area_el.scrollTop + (num + 2) * env.line_height);
   }

   render_selected_text(text_data: string[], selection: { start: row_col; finish: row_col } | null) {
      if (selection === null) return;

      const sorted = IDE_logic.sort_selection(selection.start, selection.finish);
      const selected_rows_map = this.get_map_of_selection(text_data, sorted.smaller, sorted.bigger);
      const [visible_start, visible_finish] = this.get_visible_rows();

      for (let row = visible_start; row <= visible_finish; row++) {
         const selection_w = selected_rows_map[row];
         if (selection_w) {
            this.apply_style_one_selected_row(row, selection_w[0], selection_w[1]);
         } else {
            this.remove_style_one_selected_row(row);
         }
      }
   }

   render_active_row(row: number): void {
      if (row === -1) return;
      const [visible_start, visible_finish] = this.get_visible_rows();

      if (row < visible_start || row > visible_finish) return;
      // if (row === this.last_rendered_active_row) return;

      const new_selected_row_el = document.getElementById(`line--${row}`)!;
      if (new_selected_row_el === null) return;

      new_selected_row_el.className = 'line-selected';

      this.last_rendered_active_row = row;
   }

   apply_style_one_selected_row(row_num: number, col0: number, col1: number) {
      col1 === 0 ? (col1 = 1) : null;
      const indent = env.char_width * col0 + env.cursor_x_offset();
      const width = env.char_width * (col1 - col0);
      const selected_el = document.getElementById(`select--${row_num}`)!;

      selected_el.style.left = `${indent}px`;
      selected_el.style.width = `${width}px`;
   }

   remove_style_one_selected_row(row_num: number) {
      let select_dom = document.getElementById(`select--${row_num}`);
      let text_dom = document.getElementById(`text--${row_num}`);

      if (select_dom) {
         select_dom.style.left = '0px';
         select_dom.style.width = '0px';
      }

      if (text_dom) text_dom.style.left = '0px';
   }

   get_map_of_selection(
      text_data: string[],
      smaller: row_col,
      bigger: row_col
   ): { [row: number]: [number, number] } {
      const map: { [key: number]: [number, number] } = {};

      if (bigger.row - smaller.row === 0) {
         map[smaller.row] = [smaller.col, bigger.col];
         return map;
      }

      if (bigger.row - smaller.row >= 1) {
         (map[smaller.row] = [smaller.col, text_data[smaller.row].length]),
            (map[bigger.row] = [0, bigger.col]);
      }

      if (bigger.row - smaller.row >= 2) {
         for (let r = smaller.row + 1; r < bigger.row; r++) {
            map[r] = [0, text_data[r].length];
         }
      }

      return map;
   }
}

export default IDE_UI;
