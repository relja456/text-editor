export interface KeyCollection {
   codes: string[];
   include(key: string): boolean;
}

const arrow_codes = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'];

// prettier-ignore
const ignore_codes = [
    'Control', 'Alt', 'Shift', 'CapsLock', 'Meta', 'Context', 'Escape', 'NumLock',
    'Insert', 'Home', 'PageUp', 'Delete', 'End', 'PageDown', 'ScrollLock', 'Pause', 'ContextMenu',
    'F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7', 'F8', 'F9', 'F10', 'F11', 'F12'
];

const control_actions = ['c']

const hold_states = ['Control', 'Shift'];

const down: { [key: string]: boolean } = { control: false, shift: false };

const prevent_defaults = ['Tab', 'Space', 'Control'];

export const keys = {
   arrow: create_keys(arrow_codes),
   ignore: create_keys(ignore_codes),
   hold_states: create_keys(hold_states),
   prevent_defaults: create_keys(prevent_defaults),
   control_actions: create_keys(control_actions),
   down: down,
};

function create_keys(codes: string[]): KeyCollection {
   return {
      codes,
      include(key: string): boolean {
         return this.codes.some((k) => k === key);
      },
   };
}