export default {
    GAME: {
        VIEWHEIGHT: 1080,
        VIEWWIDTH: 1920,
        TITLE: 'Replace Me',
    },
    SCENES: {
        BOOT: 'game_boot',
        LOAD: 'game_load',
        GAME: 'game_game',
        UI: 'UI',
        MUSIC_SELECT: 'music_select',
        VISUALIZER: 'visualizer',
        PLAY_FIELD: 'game_play_field',
    },
    KEYCODES: {
        LEFT_ARROW: 37,
        UP_ARROW: 38,
        RIGHT_ARROW: 39,
        DOWN_ARROW: 40,
        Z: 90,
        X: 88,
        COMMA: 188,
        DOT: 190,
        A: 65,
        S: 83,
        K: 75,
        L: 76,
        ENTER: 13,
    },
    DEFAULT_TEXT_STYLE: {
        font: 'Roboto',
        fontSize: 20,
        fill: '#ffffff',
        smoothed: false,
    },
    UI_DEFAULT: {
        tint: 0xaaaaaa,
    },
    AUDIO: {
        musicKeys: ['bgScore'],
        sfxKeys: ['coinSfx'],
    },
};
