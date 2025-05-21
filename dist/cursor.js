import _env_ from './env.js';
class Cursor {
    constructor(dom_element) {
        this.dom_element = dom_element;
        this.row = -1;
        this.col = -1;
        this.interval_id = null;
        this.blink = false;
    }
    start_blinking_cycle() {
        if (this.interval_id === null) {
            this.interval_id = setInterval(() => {
                this.blink
                    ? (this.dom_element.className = 'active')
                    : (this.dom_element.className = 'inactive');
                this.blink = !this.blink;
            }, 400);
        }
        else {
            this.dom_element.className = 'active';
            this.blink = true;
        }
    }
    place(position, text_data) {
        this.start_blinking_cycle();
        const real_position = this.calc_real_position(position, text_data);
        // promena pozicije
        if (real_position.row != this.row || real_position.col != this.col) {
            this.dom_element.className = 'active';
            this.row = real_position.row;
            this.col = real_position.col;
            this.update_dom_position();
        }
        return real_position;
    }
    calc_real_position(position, text_data) {
        let row = -9999;
        let col = -9999;
        if (position.row < 0) {
            return { row: 0, col: 0 };
        }
        if (position.row >= text_data.length) {
            return { row: text_data.length - 1, col: text_data[text_data.length - 1].length };
        }
        else {
            row = position.row;
        }
        if (position.col > text_data[row].length) {
            return { row, col: text_data[row].length };
        }
        else if (position.col < 0) {
            return { row, col: 0 };
        }
        col = position.col;
        return { row, col };
    }
    remove() {
        if (this.interval_id != null) {
            this.dom_element.className = 'inactive';
            this.row = -1;
            this.col = -1;
            clearInterval(this.interval_id);
            this.interval_id = null;
        }
    }
    update_dom_position() {
        this.dom_element.style.left = `${this.col * _env_.char_width + _env_.ordered_list_padding_left}px`;
        this.dom_element.style.top = `${this.row * _env_.line_height + _env_.line_height}px`;
        this.dom_element.style.height = `${_env_.line_height}px`;
    }
    get_position() {
        return { row: this.row, col: this.col };
    }
    set_position(position) {
        this.start_blinking_cycle();
        this.row = position.row;
        this.col = position.col;
        this.update_dom_position();
    }
}
export default Cursor;
