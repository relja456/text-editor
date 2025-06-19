import IDE_UI from './ui/ide_ui.js';
class File_IO {
   file_name = '';
   file_name_dom = document.getElementById('file-name')! as HTMLInputElement;

   constructor() {
      document.getElementById('upload')!.addEventListener('change', this.handle_file_input);
      document.getElementById('save-btn')!.addEventListener('click', this.save_file);
   }

   handle_file_input = (event: Event) => {
      const input = event.target as HTMLInputElement;
      const file = input.files?.[0];
      if (!file) return;

      this.file_name = file.name;
      this.file_name_dom.value = this.file_name;
      const reader = new FileReader();
      reader.onload = (e) => {
         const content = e.target?.result as string;
         const text_data = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
         IDE_UI.getInstance().ide_logic!.text_data = text_data;
         IDE_UI.getInstance().render();
      };

      reader.readAsText(file);
   };

   save_file = () => {
      const string_text = this.text_data_to_string(IDE_UI.getInstance().ide_logic!.text_data);
      const blob = new Blob([string_text], { type: 'text/plain' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(blob);
      link.download = this.file_name;
      link.click();
      URL.revokeObjectURL(link.href);
   };

   text_data_to_string(text_data: string[]): string {
      return text_data.join('\r\n');
   }
}

export default File_IO;
