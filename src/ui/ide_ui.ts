import _env_ from '../env.js';
import IDE_logic from '../ide_logic.js';
import row_col from '../types.js';

class IDE_UI {
   private static instance: IDE_UI;

   private old_text: string[] = [''];

   private constructor() {}

   static getInstance(): IDE_UI {
      if (!IDE_UI.instance) {
         IDE_UI.instance = new IDE_UI();
      }
      return IDE_UI.instance;
   }

   render_lines_and_text(text_data: string[], ordered_list_element: HTMLElement): void {
      const diff = this.text_diff(this.old_text, text_data);

      if (diff === null) return;

      console.log('lines: ' + text_data.length);

      ordered_list_element.style.paddingLeft = `${_env_.ordered_list_padding_left}px`;
      ordered_list_element.style.minWidth = `calc(100% - ${_env_.ordered_list_padding_left}px)`;

      const fragment = document.createDocumentFragment();

      const ol = document.getElementById('ordered-list')!;
      ol.style.paddingTop = `${_env_.line_height * (text_data.length - 1)}px`;
      // for (let id = diff[0]; id <= diff[1]; id++) {
      //    console.log('render iteration');

      //    let line_dom = document.getElementById(`line--${id}`);
      //    let select_dom = line_dom?.children[0] as HTMLElement;
      //    let text_dom = line_dom?.children[1] as HTMLElement;

      //    if (!line_dom || !select_dom || !text_dom) {
      //       line_dom = document.createElement('li');
      //       line_dom.id = `line--${id}`;
      //       line_dom.className = 'line';

      //       select_dom = document.createElement('div');
      //       select_dom.id = `select--${id}`;
      //       select_dom.className = 'select';

      //       text_dom = document.createElement('span');
      //       text_dom.id = `text--${id}`;
      //       text_dom.className = 'text';

      //       line_dom.appendChild(select_dom);
      //       line_dom.appendChild(text_dom);

      //       fragment.appendChild(line_dom);
      //    }

      //    // _env_.line_height
      //    document.documentElement.style.setProperty(`--line-height`, `${_env_.line_height}px`);

      //    text_dom.innerText = text_data[id];
      // }
      ordered_list_element.append(fragment);

      let i = text_data.length;
      let line = document.getElementById(`line--${i}`);

      while (line !== null) {
         line.remove();
         i += 1;
         line = document.getElementById(`line--${i}`);
      }

      this.old_text = JSON.parse(JSON.stringify(text_data));
   }

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

   render_selected_text(text_data: string[], selection: { start: row_col; finish: row_col } | null) {
      if (selection === null) return;

      const sorted = IDE_logic.sort_selection(selection.start, selection.finish);

      const selected_rows_map = this.get_map_of_selection(text_data, sorted.smaller, sorted.bigger);

      Object.entries(selected_rows_map).forEach(([row, [col0, col1]]) => {
         this.apply_style_one_selected_row(Number(row), col0, col1);
         console.log('selecting row');
      });
   }

   remove_selected_text(text_data: string[], selection: { start: row_col; finish: row_col } | null) {
      if (selection === null) return;

      const sorted = IDE_logic.sort_selection(selection.start, selection.finish);

      const selected_rows_map = this.get_map_of_selection(text_data, sorted.smaller, sorted.bigger);

      Object.entries(selected_rows_map).forEach(([row, [col0, col1]]) => {
         console.log('deselecting row');
         this.remove_style_one_selected_row(Number(row));
      });
   }

   apply_style_one_selected_row(row_num: number, col0: number, col1: number) {
      col1 === 0 ? (col1 = 1) : null;
      const indent = _env_.char_width * col0;
      const width = _env_.char_width * (col1 - col0);
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
