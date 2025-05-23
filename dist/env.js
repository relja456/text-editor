var _env_ = {
    tab_width: 4,
    line_height: 20,
    char_width: 8,
    ol_pl: 2,
    marker_start_w: 0,
    marker_w: 0,
    marker_pr: 4,
    text_pl: 5,
    cursor_x_offset: function () {
        return this.ol_pl + this.marker_w + this.marker_pr + this.text_pl;
    },
};
export default _env_;
