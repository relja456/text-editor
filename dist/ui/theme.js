class Theme {
    constructor() {
        this.colors = {
            primary_bg: '#2A2B2E',
            primary_fg: '#A4C2A8',
            accent: '#5A5A66',
        };
        this.init();
    }
    init() {
        const color_boxes = document.querySelectorAll('.color-container');
        color_boxes.forEach((box) => {
            const key = box.id;
            box.style.backgroundColor = this.colors[key];
            console.log(key);
        });
    }
}
export default Theme;
