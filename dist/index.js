import Cursor from './cursor.js';
import IDE_logic from './ide_logic.js';
import Theme from './ui/theme_ui.js';
import { keys } from './keys.js';
import IDE_UI from './ui/ide_ui.js';
import _env_ from './env.js';
let is_ide_focused = false;
const mouse = { down: false, start_position: { row: 0, col: 0 }, position: { x: 0, y: 0 } };
addEventListener('keydown', handle_key_down);
addEventListener('keyup', handle_key_up);
addEventListener('resize', handle_resize);
document.addEventListener('mousedown', handle_mouse_down);
document.addEventListener('mousemove', handle_mouse_move);
document.addEventListener('mouseup', handle_mouse_up);
const text_area_element = document.getElementById('text-area');
const text_ide = new IDE_logic();
text_ide.set_active_row(0);
IDE_UI.getInstance().render_lines_and_text(text_ide.text_data);
const theme = new Theme();
const last_line = document.getElementById(`line--${text_ide.text_data.length - 1}`);
const lh = window.getComputedStyle(last_line).height;
_env_.line_height = parseFloat(lh);
_env_.char_width = 7.7;
const cursor_el = document.getElementById('cursor');
cursor_el.style.height = `${_env_.line_height}px`;
const cursor = new Cursor(cursor_el);
function handle_key_down(event) {
    const input_key = event.key;
    if (!is_ide_focused)
        return;
    if (keys.prevent_defaults.include(input_key)) {
        event.preventDefault();
    }
    if (keys.hold_states.include(input_key)) {
        const key = input_key.toLowerCase();
        keys.is_down[key] = true;
    }
    const position = text_ide.handle_keypress(input_key, cursor.get_position());
    requestAnimationFrame(() => IDE_UI.getInstance().render_lines_and_text(text_ide.text_data));
    text_ide.set_active_row(position.row);
    cursor.set_position(position);
}
function handle_key_up(event) {
    const input_key = event.key;
    if (keys.hold_states.include(input_key)) {
        const key = input_key.toLowerCase();
        keys.is_down[key] = false;
    }
}
function handle_mouse_down(event) {
    is_ide_focused = is_inside_element(event.x, event.y, text_area_element);
    if (!is_ide_focused) {
        cursor.remove();
        text_ide.reset_active_row();
        text_area_element.className = 'ta-inactive';
        return;
    }
    const cursor_position = cursor.place(get_cursor_relative_xy_position(event), text_ide.text_data);
    text_area_element.className = 'ta-active';
    text_ide.deselect();
    mouse.down = true;
    mouse.start_position = cursor.get_position();
    mouse.position.x = event.clientX;
    mouse.position.y = event.clientY;
    text_ide.set_active_row(cursor_position.row);
}
function xy_to_rowcol(position) {
    const row = Math.floor(position.y / _env_.line_height);
    const col = Math.floor(position.x / _env_.char_width);
    return { row, col };
}
function handle_mouse_move(event) {
    if (!mouse.down)
        return;
    const x = event.clientX;
    const y = event.clientY;
    const cursor_position = get_cursor_relative_xy_position(event);
    if (Math.abs(x - mouse.position.x) + Math.abs(y - mouse.position.y) > 3) {
        text_ide.select(mouse.start_position, cursor_position);
        cursor.set_position(cursor_position);
        text_ide.reset_active_row();
        mouse.position.x = x;
        mouse.position.y = y;
        requestAnimationFrame(() => IDE_UI.getInstance().render_selected_text(text_ide.text_data, text_ide.selection));
    }
}
function handle_mouse_up(event) {
    mouse.down = false;
    text_ide.set_active_row(cursor.get_position().row);
}
function get_cursor_relative_xy_position(event) {
    const ide_top = document.getElementById('ordered-list').getBoundingClientRect().top;
    const ide_left = document.getElementById('ordered-list').getBoundingClientRect().left;
    const mouse_rel_pos = {
        // hardcoded 35 change!!!!!!!1
        x: event.clientX - ide_left - 35,
        y: event.clientY - ide_top,
    };
    return cursor.calc_real_position(xy_to_rowcol(mouse_rel_pos), text_ide.text_data);
}
function handle_resize() {
    const last_line = document.getElementById(`line--${text_ide.text_data.length - 1}`);
    const lh = window.getComputedStyle(last_line).height;
    _env_.line_height = parseFloat(lh);
    // text_ide.render();
    cursor.update_dom_position();
}
function is_inside_element(x, y, node) {
    const node_x = node.offsetLeft;
    const node_y = node.offsetTop;
    const node_height = node.offsetHeight;
    const node_width = node.offsetWidth;
    if (x < node_x || y < node_y || x > node_width + node_x || y > node_height + node_y) {
        return false;
    }
    else {
        return true;
    }
}
