import IDE_UI from './ui/ide_ui.js';
class File_IO {
    handle_file_input(event) {
        var _a;
        const input = event.target;
        const file = (_a = input.files) === null || _a === void 0 ? void 0 : _a[0];
        if (!file)
            return;
        const reader = new FileReader();
        reader.onload = function (e) {
            var _a;
            const content = (_a = e.target) === null || _a === void 0 ? void 0 : _a.result;
            const text_data = content.replace(/\r\n/g, '\n').replace(/\r/g, '\n').split('\n');
            IDE_UI.getInstance().ide_logic.text_data = text_data;
            IDE_UI.getInstance().render();
        };
        reader.readAsText(file);
    }
}
export default File_IO;
