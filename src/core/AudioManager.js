import gameConfig from 'configs/gameConfig';
import spriteConfig from 'configs/spriteConfig';
import audioConfig from 'configs/audioConfig';
import getFunctionUsage from 'utils/getFunctionUsage';

const AudioManager = function createAudioManagerFunc() {
    const state = {};
    let scene;
    let muteIcon;
    const muteIdentifier = `${gameConfig.GAME.TITLE.replace(/ /g, '_')}_isMuted`; // replace all spaces with _ for safety
    const soundEffects = new Map();
    const music = new Map();
    let currentSong;
    let currentVolume = gameConfig.AUDIO.VOLUME / 100;
    const defaultSongKey = audioConfig.MUSIC.ALL_ALONE.KEY;

    function _updateMute() {
        if (state.isAudioMuted()) {
            muteIcon.setTexture(spriteConfig.SPEAKER_OFF.KEY);
            scene.sound.mute = true;
        } else {
            muteIcon.setTexture(spriteConfig.SPEAKER.KEY);
            scene.sound.mute = false;
        }
    }

    function _setupMute() {
        muteIcon = scene.add.image(1850, 1040, spriteConfig.SPEAKER.KEY);
        muteIcon.setScrollFactor(0);
        muteIcon.tint = gameConfig.UI_DEFAULT.tint;
        muteIcon.depth = 3;
        muteIcon.setInteractive();
        muteIcon.on('pointerup', state.toggleMute, state);

        _updateMute();
    }

    function init() {
        _setupMute();

        Object.keys(audioConfig.MUSIC).forEach((key) => {
            const SONG = audioConfig.MUSIC[key];
            music.set(SONG.KEY, scene.sound.add(SONG.KEY));
        });

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

    function setVolume(vol) {
        currentVolume = vol / 100;
        currentSong.volume = currentVolume;
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
            currentSong.volume = currentVolume;
            currentSong.play();
            state.isMusicPlaying = true;
        }
    }

    function stopMusic() {
        if (currentSong) {
            currentSong.stop();
            currentSong = null;
        }
        state.isMusicPlaying = false;
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

    function toggleMute() {
        const muteStatus = (!state.isAudioMuted()).toString();
        localStorage.setItem(muteIdentifier, muteStatus);
        _updateMute();
    }

    function destroy() {
        state.stopMusic();
        muteIcon.destroy();
        soundEffects.destroy();
        music.destroy();
    }

    const localState = {
        // props
        isMusicPlaying: false,
        // methods
        init,
        playSfx,
        setScene,
        setPauseOnBlur,
        playMusic,
        pauseMusic,
        stopMusic,
        getAudioContext,
        getCurrentSong,
        getAudioSource,
        getCurrentVolume,
        isAudioMuted,
        toggleMute,
        destroy,
    };

    const states = [{ state, name: 'state' }, { state: localState, name: 'localState' }];

    getFunctionUsage(states, 'AudioManager');
    return Object.assign(...states.map(s => s.state), {
        setVolume,
        // pipes and overrides
    });
};

/**
 * Audio manager instance, there should only be one. Implementation may change.
 */
export default AudioManager;
