import IDE_UI from './ui/ide_ui.js';
class File_IO {
   handle_file_input(event: Event) {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];

      if (!file) return;

      const reader = new FileReader();
      reader.onload = function (e) {
         const content = e.target?.result as string;
         const text_data = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
         IDE_UI.getInstance().ide_logic!.text_data = text_data;
         IDE_UI.getInstance().render();
      };

      reader.readAsText(file);
   }
}

export default File_IO;
