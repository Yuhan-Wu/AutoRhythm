import gameConfig from 'configs/gameConfig';
import spriteConfig from 'configs/spriteConfig';
import audioConfig from 'configs/audioConfig';

const AudioManager = function createAudioManagerFunc() {
    const state = {};
    let scene;
    let muteIcon;
    const muteIdentifier = `${gameConfig.GAME.TITLE.replace(/ /g, '_')}_isMuted`; // replace all spaces with _ for safety
    const soundEffects = new Map();
    const music = new Map();
    let currentSong;
    const currentVolume = 0.7;
    const defaultSongKey = audioConfig.MUSIC.ALL_ALONE.KEY;

    function init() {
        state.setupMute();

        music.set(audioConfig.MUSIC.ALL_ALONE.KEY, scene.sound.add(audioConfig.MUSIC.ALL_ALONE.KEY));
        music.set(audioConfig.MUSIC.BOWERS_WILKINS.KEY, scene.sound.add(audioConfig.MUSIC.BOWERS_WILKINS.KEY));
        music.set(audioConfig.MUSIC.TEST.KEY, scene.sound.add(audioConfig.MUSIC.TEST.KEY));
        music.set(audioConfig.MUSIC.TEST_15k.KEY, scene.sound.add(audioConfig.MUSIC.TEST_15k.KEY));

        Object.keys(audioConfig.SFX).forEach((objKey) => {
            const SFX = audioConfig.SFX[objKey];
            soundEffects.set(SFX.KEY, scene.sound.add(SFX.KEY));
        });

        return state;
    }

    function setScene(newScene) {
        // TODO move from old to new, if scene is already defined
        scene = newScene;
        return state;
    }

    function setPauseOnBlur(pauseOnBlur) {
        if (scene) {
            scene.sound.pauseOnBlur = pauseOnBlur; // Keep audio playing even when losing focus.
        }
        return state;
    }

    function playSfx(key) {
        if (soundEffects.has(key)) {
            soundEffects.get(key).play();
        }
    }

    function pauseMusic() {
        if (currentSong) {
            currentSong.pause();
        }
        state.isMusicPlaying = false;
    }

    function playMusic(key = defaultSongKey) {
        if (!state.isMusicPlaying && music.has(key)) {
            currentSong = music.get(key);
            currentSong.loop = true;
            currentSong.volume = currentVolume;
            currentSong.play();
            state.isMusicPlaying = true;
        }
    }

    function getCurrentVolume() {
        return currentVolume;
    }

    function getCurrentSong() {
        return currentSong;
    }

    function getAudioContext(key = defaultSongKey) {
        return music.get(key).source.context;
    }

    function getAudioSource(key = defaultSongKey) {
        return music.get(key).source;
    }

    function isAudioMuted() {
        return localStorage.getItem(muteIdentifier) === 'true';
    }

    function _updateMute() {
        if (state.isAudioMuted()) {
            muteIcon.setTexture(spriteConfig.SPEAKER_OFF.KEY);
            scene.sound.mute = true;
        } else {
            muteIcon.setTexture(spriteConfig.SPEAKER.KEY);
            scene.sound.mute = false;
        }
    }

    function toggleMute() {
        const muteStatus = (!state.isAudioMuted()).toString();
        localStorage.setItem(muteIdentifier, muteStatus);
        _updateMute();
    }

    function setupMute() {
        muteIcon = scene.add.image(1850, 1040, spriteConfig.SPEAKER.KEY);
        muteIcon.setScrollFactor(0);
        muteIcon.tint = gameConfig.UI_DEFAULT.tint;
        muteIcon.depth = 3;
        muteIcon.setInteractive();
        muteIcon.on('pointerup', state.toggleMute, state);

        _updateMute();
    }

    function destroy() {
        muteIcon.destroy();
        soundEffects.destroy();
        music.destroy();
    }

    return Object.assign(state, {
        // props
        isMusicPlaying: false,
        // methods
        init,
        playSfx,
        setScene,
        setPauseOnBlur,
        playMusic,
        pauseMusic,
        getAudioContext,
        getCurrentSong,
        getAudioSource,
        getCurrentVolume,
        isAudioMuted,
        toggleMute,
        setupMute,
        destroy,
    });
};

/**
 * Audio manager instance, there should only be one. Implementation may change.
 */
export default AudioManager;
