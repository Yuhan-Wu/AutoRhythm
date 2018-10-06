import isGameEntity from 'components/entities/isGameEntity';
import LaneReceptor from 'entities/playField/LaneReceptor';
import hasPosition from 'components/hasPosition';
import gameConfig from 'configs/gameConfig';
import Note from 'entities/playField/Note';
import canListen from 'components/canListen';
import eventConfig from 'configs/eventConfig';

const Board = function BoardFunc(parent) {
    const state = {};
    const parentState = parent;
    const laneReceptors = [];
    const lanes = [];
    const notes = [];
    const laneCount = 4;
    const padding = 100;
    let freqMap;
    let song;
    let score = 0;
    let scoreText;
    let multiplier = 1;
    let multiplierText;

    function incrementScore(val) {
        if (val < 0) {
            multiplier = 1;
        }
        score += val * multiplier;
        scoreText.text = `${score}`;
        if (val > 0) {
            multiplier += 1;
        }
        multiplierText.text = `${multiplier}x`;
    }

    function onNoteLeftLane(note) {
        incrementScore(-10);
    }

    function onReceptorDown(e) {
        const { duration } = song.audioBuffer;
        const currentTime = song.getCurrentTime();
        const currentIndexF = (freqMap.length / duration) * currentTime;
        const currentIndex = parseInt(currentIndexF);

        const note = lanes[e.index][currentIndex];
        if (note && !note.hit) {
            incrementScore(100);
            note.onHit();
        } else {
            incrementScore(-10);
        }
    }

    function init() {
        scoreText = parent.add.text(20, 20, `${score}`, {
            font: '64px Arial',
            fill: '#eeeeee',
            align: 'center',
        });

        multiplierText = parent.add.text(20, 100, `${multiplier}x`, {
            font: '64px Arial',
            fill: '#eeeeee',
            align: 'center',
        });

        const x = padding;
        const y = gameConfig.GAME.VIEWHEIGHT - padding - 50;
        const laneSize = (gameConfig.GAME.VIEWWIDTH - padding * 2) / laneCount;
        state.setPosition({ x, y });
        for (let i = 0; i < laneCount; i += 1) {
            const laneReceptor = LaneReceptor(state);
            laneReceptor.init();
            laneReceptor.setIndex(i);
            laneReceptor.setSize({ width: laneSize, height: 100 });
            laneReceptors.push(laneReceptor);

            state.listenOn(laneReceptor, eventConfig.EVENTS.LANE.RECEPTOR_DOWN, onReceptorDown);
        }

        const threshold = {
            0: -60000,
            1: -30000,
            2: -20000,
            3: -5000,
        };

        const count = {
            max: freqMap.length,
            0: 0,
            1: 0,
            2: 0,
            3: 0,
        };
        for (let i = 0; i < freqMap.length; i += 1) {
            const signal = freqMap[i].slice(0, freqMap[i].length * 0.5);
            for (let laneIndex = 0; laneIndex < laneCount; laneIndex += 1) {
                let notesInLane = lanes[laneIndex];
                if (!notesInLane) {
                    notesInLane = [];
                    lanes.push(notesInLane);
                }
                const laneSignalLength = signal.length / laneCount;
                const start = laneIndex * laneSignalLength;
                const laneSignal = signal.slice(start, start.laneSignalLength);
                const res = laneSignal.reduce((tot, curr) => tot + curr, 0);
                if (res < threshold[laneIndex]) {
                    const note = Note(state);
                    note.init(i, state.getX() + laneSize * laneIndex);
                    state.listenOn(note, eventConfig.EVENTS.TONE.LEFT_LANE, onNoteLeftLane);
                    notesInLane.push(note);
                    notes.push(note);
                    count[laneIndex] += 1;
                } else {
                    notesInLane.push(undefined);
                }
            }
        }
        console.log(count);
    }

    function update() {
        const { duration } = song.audioBuffer;
        const currentTime = song.getCurrentTime();
        const indexesPerSecond = freqMap.length / duration;
        const currentIndexF = (freqMap.length / duration) * currentTime;
        const currentIndex = parseInt(currentIndexF);

        notes.forEach((n) => {
            if (n) {
                n.update(currentIndexF, indexesPerSecond, 150, freqMap.length);
            }
        });

        laneReceptors.forEach((laneReceptor, i) => {
            const note = lanes[i][currentIndex];
            if (note) {
                laneReceptor.setColor(0x00ff00);
            } else {
                laneReceptor.setColor(0xcccccc);
            }
            laneReceptor.update();
        });
    }

    function setFrequencyMap(s, fm) {
        song = s;
        freqMap = fm;
    }

    function getParentState() {
        return parentState;
    }

    function getLaneCount() {
        return laneCount;
    }

    function getPadding() {
        return padding;
    }

    const isGameEntityState = isGameEntity(state);
    const hasPositionState = hasPosition(state);
    const canListenState = canListen(state);
    return Object.assign(state, isGameEntityState, hasPositionState, canListenState, {
        // props
        // methods
        init,
        update,
        setFrequencyMap,
        getParentState,
        getLaneCount,
        getPadding,
    });
};

export default Board;
