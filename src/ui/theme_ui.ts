class Theme {
   private boxes = [
      { name: 'Background', color: '#2A2B2E', id: 'primary_bg' },
      { name: 'Foreground', color: '#A4C2A8', id: 'primary_fg' },
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
      color_input.addEventListener('input', (event) => {
         if (color_input.value.length > 7) {
            color_input.value = color_input.value.slice(0, 7);
         }
      });

      const color_box = document.createElement('div');
      color_box.className = 'color-container';
      color_box.id = box.id;

      color_box.style.backgroundColor = box.color;

      color_box.appendChild(color_input);

      wrapper.appendChild(color_box);
      wrapper.appendChild(label);

      return wrapper;

      // color_box.addEventListener('click', () => {
      //    this.change_color(box.id);
      // });
   }
}

export default Theme;
