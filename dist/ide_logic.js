import { keys } from './keys.js';
import { equals } from './types.js';
import * as navigation from './keyboard_handle/navigation.js';
import _env_ from './env.js';
import IDE_UI from './ui/ide_ui.js';
class IDE_logic {
    constructor() {
        this.text_data = [''];
        this.old_text_data = [''];
        this.clipboard = [];
        this.selection = null;
        this.preffered_col = null;
    }
    static getInstance() {
        if (!IDE_logic.instance) {
            IDE_logic.instance = new IDE_logic();
        }
        return IDE_logic.instance;
    }
    handle_keypress(key, cursor_position) {
        if (keys.ignore.include(key))
            return cursor_position;
        if (keys.is_down['control'] && keys.arrow.include(key))
            return navigation.handle_control_arrow(this, key, cursor_position);
        if (keys.arrow.include(key))
            return navigation.handle_arrow(this, key, cursor_position);
        if (keys.is_down['control'] && keys.control_actions.include(key))
            return this.handle_control_action(key, cursor_position);
        this.preffered_col = null;
        if (key === 'Enter')
            return this.handle_enter(cursor_position);
        if (key === 'Backspace')
            return this.handle_backspace(cursor_position);
        if (key === 'Tab')
            return this.handle_tab(cursor_position);
        return this.handle_input(key, cursor_position);
    }
    handle_control_action(key, cursor_position) {
        switch (key) {
            case 'c':
                this.handle_copy(cursor_position);
                return cursor_position;
            case 'v':
                return this.handle_paste(cursor_position);
            case 'x':
                return this.handle_cut(cursor_position);
            case 'a':
                return this.handle_select_all();
        }
        return cursor_position;
    }
    handle_select_all() {
        this.selection = {
            start: { row: 0, col: 0 },
            finish: {
                row: this.text_data.length - 1,
                col: this.text_data[this.text_data.length - 1].length,
            },
        };
        this.select(this.selection.start, this.selection.finish);
        return this.selection.finish;
    }
    handle_copy(cursor_position) {
        this.selection === null || equals(this.selection.start, this.selection.finish)
            ? (this.clipboard = [this.text_data[cursor_position.row]])
            : (this.clipboard = this.get_selected_text(this.text_data, this.selection));
        console.log('[Text copied]', this.clipboard);
    }
    handle_cut(cursor_position) {
        this.handle_copy(cursor_position);
        const isNoSelection = this.selection === null || equals(this.selection.start, this.selection.finish);
        if (isNoSelection) {
            const isLastLine = cursor_position.row === this.text_data.length - 1;
            const isFirstLine = cursor_position.row === 0;
            this.text_data.splice(cursor_position.row, 1);
            if (isFirstLine) {
                this.text_data[0] = '';
            }
            else if (isLastLine) {
                return {
                    row: cursor_position.row - 1,
                    col: this.text_data[cursor_position.row - 1].length,
                };
            }
            else {
                return { row: cursor_position.row, col: 0 };
            }
        }
        return this.delete_selection();
    }
    handle_paste(cursor_position) {
        if (this.selection !== null) {
            this.delete_selection();
            this.deselect();
        }
        if (this.clipboard.length === 0)
            return cursor_position;
        else if (this.clipboard.length === 1) {
            this.text_data[cursor_position.row] =
                this.text_data[cursor_position.row].slice(0, cursor_position.col) +
                    this.clipboard[0] +
                    this.text_data[cursor_position.row].slice(cursor_position.col);
            return {
                row: cursor_position.row,
                col: cursor_position.col + this.clipboard[0].length,
            };
        }
        else {
            // Insert multiple lines from clipboard at the cursor position
            const currentLine = this.text_data[cursor_position.row];
            const before = currentLine.slice(0, cursor_position.col);
            const after = currentLine.slice(cursor_position.col);
            // First line: before + clipboard[0]
            this.text_data[cursor_position.row] = before + this.clipboard[0];
            // Middle lines: clipboard[1] ... clipboard[n-2]
            for (let i = 1; i < this.clipboard.length - 1; i++) {
                this.text_data.splice(cursor_position.row + i, 0, this.clipboard[i]);
            }
            // Last line: clipboard[n-1] + after
            this.text_data.splice(cursor_position.row + this.clipboard.length - 1, 0, this.clipboard[this.clipboard.length - 1] + after);
            return {
                row: cursor_position.row + this.clipboard.length - 1,
                col: this.clipboard[this.clipboard.length - 1].length,
            };
        }
    }
    handle_enter(cursor_position) {
        if (this.selection !== null) {
            this.delete_selection();
        }
        const before_cursor = this.text_data[cursor_position.row].slice(0, cursor_position.col);
        const after_cursor = this.text_data[cursor_position.row].slice(cursor_position.col);
        this.text_data.splice(cursor_position.row, 0, before_cursor);
        this.text_data[cursor_position.row + 1] = after_cursor;
        return { row: cursor_position.row + 1, col: 0 };
    }
    handle_backspace(cursor_position) {
        if (this.selection !== null) {
            return this.delete_selection();
        }
        if (cursor_position.row === 0 && cursor_position.col === 0)
            return cursor_position;
        if (cursor_position.col === 0 && cursor_position.row > 0) {
            this.text_data.splice(cursor_position.row, 1);
            return {
                row: cursor_position.row - 1,
                col: this.text_data[cursor_position.row - 1].length,
            };
        }
        else {
            console.log('col ' + cursor_position.col);
            this.text_data[cursor_position.row] = this.remove_nth_char(this.text_data[cursor_position.row], cursor_position.col - 1);
            return {
                row: cursor_position.row,
                col: cursor_position.col - 1,
            };
        }
    }
    handle_tab(cursor_position) {
        if (this.selection !== null) {
            this.delete_selection();
        }
        const current_row = this.text_data[cursor_position.row];
        const tab_width = _env_.tab_width;
        this.text_data[cursor_position.row] =
            current_row.slice(0, cursor_position.col) +
                ' '.repeat(tab_width) +
                current_row.slice(cursor_position.col);
        return { row: cursor_position.row, col: cursor_position.col + 4 };
    }
    handle_input(key, cursor_position) {
        if (this.selection !== null) {
            cursor_position = this.delete_selection();
            this.deselect();
        }
        this.text_data[cursor_position.row] =
            this.text_data[cursor_position.row].slice(0, cursor_position.col) +
                key +
                this.text_data[cursor_position.row].slice(cursor_position.col);
        _env_.char_width = (() => {
            const text0 = document.getElementById('text--0');
            if (text0 && text0.innerText.length > 0) {
                return text0.getBoundingClientRect().width / text0.innerText.length;
            }
            return _env_.char_width;
        })();
        return { row: cursor_position.row, col: cursor_position.col + 1 };
    }
    get_selected_text(text_data, selection) {
        const sorted_selection = IDE_logic.sort_selection(selection.start, selection.finish);
        const whole_text = JSON.parse(JSON.stringify(text_data));
        const selected_text = whole_text.slice(sorted_selection.smaller.row, sorted_selection.bigger.row + 1);
        if (selected_text.length > 1) {
            selected_text[0] = selected_text[0].slice(sorted_selection.smaller.col);
            selected_text[selected_text.length - 1] = selected_text[selected_text.length - 1].slice(0, sorted_selection.bigger.col);
        }
        else {
            selected_text[0] = selected_text[0].slice(sorted_selection.smaller.col, sorted_selection.bigger.col);
        }
        return selected_text;
    }
    delete_selection() {
        if (!this.selection)
            return { row: 0, col: 0 };
        const { smaller, bigger } = IDE_logic.sort_selection(this.selection.start, this.selection.finish);
        this.deselect();
        if (smaller.row === bigger.row) {
            // Single line selection
            const line = this.text_data[smaller.row];
            this.text_data[smaller.row] = line.slice(0, smaller.col) + line.slice(bigger.col);
            return smaller;
        }
        // Multi-line selection
        const firstLine = this.text_data[smaller.row].slice(0, smaller.col);
        const lastLine = this.text_data[bigger.row].slice(bigger.col);
        // Remove lines in between
        this.text_data.splice(smaller.row, bigger.row - smaller.row + 1, firstLine + lastLine);
        return smaller;
    }
    select(start, finish) {
        // console.log('[selection]', { start, finish });
        this.selection = { start, finish };
        IDE_UI.getInstance().render_selected_text(this.text_data, this.selection);
    }
    deselect() {
        this.selection = null;
    }
    static sort_selection(pos0, pos1) {
        let smaller = null;
        let bigger = null;
        if (pos0.row === pos1.row && pos0.col === pos1.col) {
            return { smaller: pos0, bigger: pos1 };
        }
        if (pos0.row != pos1.row) {
            if (pos0.row < pos1.row) {
                smaller = pos0;
                bigger = pos1;
            }
            else {
                smaller = pos1;
                bigger = pos0;
            }
        }
        else {
            if (pos0.col < pos1.col) {
                smaller = pos0;
                bigger = pos1;
            }
            else {
                smaller = pos1;
                bigger = pos0;
            }
        }
        return { smaller, bigger };
    }
    // reset_active_row() {
    //    const selected_row = document.getElementById(`line--${this.active_row}`);
    //    this.active_row = -1;
    //    if (selected_row) selected_row.className = 'line';
    // }
    remove_nth_char(s, n) {
        // zero indexing
        if (n < 0 || n >= s.length) {
            throw new Error('Index out of bounds');
        }
        return s.slice(0, n) + s.slice(n + 1);
    }
}
IDE_logic.instance = null;
export default IDE_logic;
