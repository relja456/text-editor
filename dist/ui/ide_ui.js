import _env_ from '../env.js';
import IDE_logic from '../ide_logic.js';
class IDE_UI {
    constructor() {
        this.old_text = [''];
        this.text_area_el = document.getElementById('text-area');
        this.ordered_list_el = document.getElementById('ordered-list');
    }
    static getInstance() {
        if (!IDE_UI.instance) {
            IDE_UI.instance = new IDE_UI();
        }
        return IDE_UI.instance;
    }
    render_lines_and_text(text_data) {
        const diff = this.text_diff(this.old_text, text_data);
        console.log('total lines in file: ' + text_data.length);
        // this.ordered_list_el.style.paddingLeft = `${_env_.ordered_list_padding_left}px`;
        // this.ordered_list_el.style.minWidth = `calc(100% - ${_env_.ordered_list_padding_left}px)`;
        const fragment = document.createDocumentFragment();
        const ol_h = _env_.line_height * (text_data.length + 1);
        const ta_h = this.text_area_el.getBoundingClientRect().height;
        const scroll_top = this.text_area_el.scrollTop;
        console.log(ol_h, ta_h, scroll_top);
        const [first, last] = this.get_visible_rows(ta_h, scroll_top, _env_.line_height);
        console.log('visible:', first, last);
        this.ordered_list_el.innerHTML = '';
        if (ol_h > ta_h) {
            console.log(';overflow');
            this.ordered_list_el.style.paddingTop = `${_env_.line_height * first}px`;
            this.ordered_list_el.style.height = `${_env_.line_height * (last - first)}px`;
            let calc_pb = _env_.line_height * (text_data.length - last);
            calc_pb >= 0 ? null : (calc_pb = 0);
            console.log('calc_pb');
            console.log(calc_pb);
            this.ordered_list_el.style.paddingBottom = `${calc_pb}px`;
            console.log(first, last);
            for (let row = first; row <= last; row++) {
                const el = this.add_line_dom(row, text_data[row]);
                this.ordered_list_el.appendChild(el);
            }
        }
        else {
            for (let row = 0; row < text_data.length; row++) {
                this.ordered_list_el.appendChild(this.add_line_dom(row, text_data[row]));
            }
        }
        let i = text_data.length;
        let line = document.getElementById(`line--${i}`);
        while (line !== null) {
            line.remove();
            i += 1;
            line = document.getElementById(`line--${i}`);
        }
        this.old_text = JSON.parse(JSON.stringify(text_data));
    }
    add_line_dom(row, text) {
        let line_dom = document.getElementById(`line--${row}`);
        let marker_dom = line_dom === null || line_dom === void 0 ? void 0 : line_dom.children[0];
        let select_dom = line_dom === null || line_dom === void 0 ? void 0 : line_dom.children[1];
        let text_dom = line_dom === null || line_dom === void 0 ? void 0 : line_dom.children[2];
        if (!line_dom || !marker_dom || !select_dom || !text_dom) {
            line_dom = document.createElement('li');
            line_dom.id = `line--${row}`;
            line_dom.className = 'line';
            marker_dom = document.createElement('span');
            marker_dom.id = `marker--${row}`;
            marker_dom.className = 'marker';
            marker_dom.innerText = `${row + 1}. `;
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
        document.documentElement.style.setProperty(`--line-height`, `${_env_.line_height}px`);
        text_dom.innerText = text;
        return line_dom;
    }
    // }
    text_diff(old_text, new_text) {
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
    get_visible_rows(outside_h, scroll_top, line_height) {
        const rows_in_view = Math.floor(outside_h / line_height);
        const scrolled_rows = Math.floor(scroll_top / line_height);
        return [scrolled_rows, scrolled_rows + rows_in_view];
    }
    render_selected_text(text_data, selection) {
        if (selection === null)
            return;
        const sorted = IDE_logic.sort_selection(selection.start, selection.finish);
        const selected_rows_map = this.get_map_of_selection(text_data, sorted.smaller, sorted.bigger);
        Object.entries(selected_rows_map).forEach(([row, [col0, col1]]) => {
            this.apply_style_one_selected_row(Number(row), col0, col1);
            console.log('selecting row');
        });
    }
    remove_selected_text(text_data, selection) {
        if (selection === null)
            return;
        const sorted = IDE_logic.sort_selection(selection.start, selection.finish);
        const selected_rows_map = this.get_map_of_selection(text_data, sorted.smaller, sorted.bigger);
        Object.entries(selected_rows_map).forEach(([row, [col0, col1]]) => {
            console.log('deselecting row');
            this.remove_style_one_selected_row(Number(row));
        });
    }
    apply_style_one_selected_row(row_num, col0, col1) {
        col1 === 0 ? (col1 = 1) : null;
        const indent = _env_.char_width * col0;
        const width = _env_.char_width * (col1 - col0);
        const selected_el = document.getElementById(`select--${row_num}`);
        selected_el.style.left = `${indent}px`;
        selected_el.style.width = `${width}px`;
    }
    remove_style_one_selected_row(row_num) {
        let select_dom = document.getElementById(`select--${row_num}`);
        let text_dom = document.getElementById(`text--${row_num}`);
        if (select_dom) {
            select_dom.style.left = '0px';
            select_dom.style.width = '0px';
        }
        if (text_dom)
            text_dom.style.left = '0px';
    }
    get_map_of_selection(text_data, smaller, bigger) {
        const map = {};
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
