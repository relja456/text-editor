import Cursor from './cursor.js';
import IDE_logic from './ide_logic.js';
import Theme from './ui/theme_ui.js';
import { keys } from './keys.js';
import IDE_UI from './ui/ide_ui.js';
import _env_ from './env.js';
import File_IO from './file_io.js';

let is_ide_focused = false;
const mouse = { down: false, start_position: { row: 0, col: 0 }, position: { x: 0, y: 0 } };

addEventListener('keydown', handle_key_down);
addEventListener('keyup', handle_key_up);
addEventListener('resize', handle_resize);

document.addEventListener('mousedown', handle_mouse_down);
document.addEventListener('mousemove', handle_mouse_move);
document.addEventListener('mouseup', handle_mouse_up);

const file_io = new File_IO();

const text_area_element: HTMLElement = document.getElementById('text-area')!;

text_area_element.addEventListener('scroll', () => {
   IDE_UI.getInstance().render();
});

const file_name = document.getElementById('file-name') as HTMLInputElement;
file_name!.addEventListener('input', function (event) {
   file_name.style.width = `${file_name.value.length}ch`;
   file_io.file_name = file_name.value;
});

const text_ide = new IDE_logic();
IDE_UI.getInstance().ide_logic = text_ide;

const cursor_el = document.getElementById('cursor')!;
cursor_el.style.height = `${_env_.line_height}px`;
const cursor = new Cursor(cursor_el);
IDE_UI.getInstance().cursor = cursor;

IDE_UI.getInstance().render();

const theme = new Theme();

const last_line = document.getElementById(`line--${text_ide.text_data.length - 1}`)!;
const lh = window.getComputedStyle(last_line).height;
_env_.line_height = parseFloat(lh);
_env_.char_width = 7.7;

function handle_key_down(event: KeyboardEvent): void {
   const input_key = event.key;
   const input_code = event.code;

   if (!is_ide_focused) return;

   if (keys.prevent_defaults.include(input_code)) {
      event.preventDefault();
   }

   if (keys.hold_states.include(input_key)) {
      const key = input_key.toLowerCase();
      keys.is_down[key] = true;
   }

   const position = text_ide.handle_keypress(input_key, cursor.get_position());

   cursor.set_position(position);
   IDE_UI.getInstance().render();
}

function handle_key_up(event: KeyboardEvent) {
   const input_key = event.key;
   if (keys.hold_states.include(input_key)) {
      const key = input_key.toLowerCase();
      keys.is_down[key] = false;
   }
}

function handle_mouse_down(event: MouseEvent): void {
   is_ide_focused = is_inside_element(event.x, event.y, text_area_element);

   if (!is_ide_focused) {
      cursor.remove();
      text_area_element.className = 'ta-inactive';
      return;
   }

   cursor.place(get_cursor_relative_xy_position(event), text_ide.text_data);
   text_area_element.className = 'ta-active';

   text_ide.deselect();
   IDE_UI.getInstance().render();

   mouse.down = true;
   mouse.start_position = cursor.get_position();
   mouse.position.x = event.clientX;
   mouse.position.y = event.clientY;
}

function xy_to_rowcol(position: { x: number; y: number }): { row: number; col: number } {
   const row = Math.floor(position.y / _env_.line_height);
   const col = Math.floor(position.x / _env_.char_width);

   return { row, col };
}

function handle_mouse_move(event: MouseEvent): void {
   if (!mouse.down) return;

   const x = event.clientX;
   const y = event.clientY;

   const cursor_position = get_cursor_relative_xy_position(event);

   if (Math.abs(x - mouse.position.x) + Math.abs(y - mouse.position.y) > 3) {
      text_ide.select(mouse.start_position, cursor_position);
      cursor.set_position(cursor_position);

      mouse.position.x = x;
      mouse.position.y = y;

      IDE_UI.getInstance().render_selected_text(text_ide.text_data, text_ide.selection);
   }
}

function handle_mouse_up(event: MouseEvent) {
   mouse.down = false;
}

function get_cursor_relative_xy_position(event: MouseEvent): { row: number; col: number } {
   const ide_top = document.getElementById('ordered-list')!.getBoundingClientRect().top;
   const ide_left = document.getElementById('ordered-list')!.getBoundingClientRect().left;

   const mouse_rel_pos = {
      x: event.clientX - ide_left - _env_.cursor_x_offset(),
      y: event.clientY - ide_top,
   };

   return cursor.calc_real_position(xy_to_rowcol(mouse_rel_pos), text_ide.text_data);
}

function handle_resize() {
   const last_line = document.getElementById(`line--${text_ide.text_data.length - 1}`)!;
   const lh = window.getComputedStyle(last_line).height;
   _env_.line_height = parseFloat(lh);

   // text_ide.render();
   cursor.update_dom_position();
}

function is_inside_element(x: number, y: number, node: HTMLElement): boolean {
   const node_x = node.offsetLeft;
   const node_y = node.offsetTop;
   const node_height = node.offsetHeight;
   const node_width = node.offsetWidth;

   if (x < node_x || y < node_y || x > node_width + node_x || y > node_height + node_y) {
      return false;
   } else {
      return true;
   }
}

1;
