import IDE_UI from './ui/ide_ui.js';
class File_IO {
    constructor() {
        this.file_name = '';
        this.file_name_dom = document.getElementById('file-name');
        this.handle_file_input = (event) => {
            var _a;
            const input = event.target;
            const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
            if (!file)
                return;
            this.file_name = file.name;
            this.file_name_dom.value = this.file_name;
            const reader = new FileReader();
            reader.onload = (e) => {
                var _a;
                const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
                const text_data = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
                IDE_UI.getInstance().ide_logic.text_data = text_data;
                IDE_UI.getInstance().render();
            };
            reader.readAsText(file);
        };
        this.save_file = () => {
            const string_text = this.text_data_to_string(IDE_UI.getInstance().ide_logic.text_data);
            const blob = new Blob([string_text], { type: 'text/plain' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = this.file_name;
            link.click();
            URL.revokeObjectURL(link.href);
        };
        document.getElementById('upload').addEventListener('change', this.handle_file_input);
        document.getElementById('save-btn').addEventListener('click', this.save_file);
    }
    text_data_to_string(text_data) {
        return text_data.join('\r\n');
    }
}
export default File_IO;
