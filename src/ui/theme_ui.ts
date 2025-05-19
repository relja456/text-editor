class Theme {
   private boxes = [
      { name: 'Background', color: '#2A2B2E', id: 'primary-bg' },
      { name: 'Foreground', color: '#A4C2A8', id: 'primary-fg' },
      { name: 'Accent', color: '#5A5A66', id: 'accent' },
   ];

   constructor() {
      this.init();
   }

   private init() {
      const theme_container = document.getElementById('theme-container');

      for (const box of Object.values(this.boxes)) {
         const box_el = this.create_color_box(box);
         theme_container?.appendChild(box_el);
      }
   }

   private create_color_box(box: { name: string; color: string; id: string }) {
      const wrapper = document.createElement('div');
      wrapper.className = 'color-wrapper';

      const label = document.createElement('h6');
      label.className = 'color-label';
      label.innerText = box.name;

      const color_input = document.createElement('input');
      color_input.className = 'color-input';
      color_input.value = box.color;
      color_input.id = box.id;
      color_input.style.backgroundColor = box.color;

      this.add_action_handlers(color_input, box);

      wrapper.appendChild(color_input);
      wrapper.appendChild(label);

      return wrapper;
   }
   private add_action_handlers(
      color_input: HTMLInputElement,
      box: { name: string; color: string; id: string }
   ) {
      let lastColor = box.color;

      function normalizeHex(hex: string): string {
         let h = hex.replace(/^#/, '').toUpperCase();
         if (h.length === 3) {
            h = h
               .split('')
               .map((c) => c + c)
               .join('');
         } else if (h.length !== 6) {
            h = (h + '000000').slice(0, 6);
         }
         return `#${h}`;
      }

      function getLuminance(hex: string): number {
         const h = normalizeHex(hex).slice(1);
         const rgb = [
            parseInt(h.slice(0, 2), 16),
            parseInt(h.slice(2, 4), 16),
            parseInt(h.slice(4, 6), 16),
         ];
         // sRGB luminance formula
         return (0.2126 * rgb[0] + 0.7152 * rgb[1] + 0.0722 * rgb[2]) / 255;
      }

      function updateBoxColor(hex: string) {
         const normHex = normalizeHex(hex);
         color_input!.style.backgroundColor = normHex;
         // Set text color for contrast
         const lum = getLuminance(normHex);
         color_input!.style.color = lum > 0.5 ? '#222' : '#fff';
      }

      color_input.addEventListener('input', (e) => {
         let val = (e.target as HTMLInputElement).value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6);
         color_input.value = '#' + val;
         updateBoxColor(val);
         console.log('Color changed to:', val);
      });

      color_input.addEventListener('focus', () => {
         lastColor = color_input.value;
      });

      color_input.addEventListener('keydown', (e) => {
         if (e.key === 'Escape') {
            color_input.value = lastColor;
            updateBoxColor(lastColor);
            color_input.blur();
         } else if (e.key === 'Enter') {
            const val = color_input.value.replace(/[^a-fA-F0-9]/g, '').slice(0, 6);
            color_input.value = normalizeHex(val);
            updateBoxColor(val);
            color_input.blur();
            document.documentElement.style.setProperty(`--${box.id}`, `${color_input.value}`);
         }
      });

      // Initial contrast update
      updateBoxColor(box.color);
   }
}

export default Theme;
