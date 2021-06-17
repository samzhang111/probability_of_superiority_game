import { Chart } from '@antv/g2';
import {generateScenario, createBars, samplePointsFromScenario, EXPERIMENTAL_CONDITIONS_ENUM, experimentStateToTrialSettings} from "./experiment"
import {round100, computeProbOfSuperiority} from "./stats"

let chart, experimentState={}, experimentResults={}, trialSettings, showPoints, showTutorial
const colors = ["#E91E63", "#4E5A7D"]
const modals = document.querySelectorAll('.modal');
let modal = M.Modal.init(modals, {
    opacity: 0.9,
    dismissable: true,
})[0];

function resetGame(trialSettings) {
    chart.clear()

    document.querySelector("#theguess").value = ""
    document.querySelector("#answer").textContent = ""
    document.querySelector("#after_game").style.display = "none"
    document.querySelector("#tutorial").style.display = "none"

    let scenario = generateScenario()
    let bars = createBars(scenario, trialSettings)
    let {lowerBound, upperBound} = bars
    let probOfSuperiority = computeProbOfSuperiority(scenario)

    chart.legend(false);
    chart.changeData(bars.data);

    chart.tooltip({
        showMarkers: false
    });

    chart.point()
        .position('name*value')
        .color('name', colors)
        .size(5)
        .style({
            fillOpacity: 0,
        });

    chart.interval()
        .position('name*range')
        .color('name', colors)
        .size(40)
        .shape('tick');

    chart.scale({
        value: {
            min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
            max: round100(upperBound + 0.1 * Math.abs(upperBound)),
            formatter(y) { return y.toFixed(1) },
        },
        range: {
            min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
            max: round100(upperBound + 0.1 * Math.abs(upperBound)),
            formatter(y) { return y.toFixed(1) },
        }
    });


    showPoints = () => {
        let points = samplePointsFromScenario(scenario)
        let {lowerBound, upperBound} = points

        let chartPointView = chart.createView({
            padding: 0
        })

        chartPointView.data(points.data)
        chartPointView.axis(false)
        chartPointView.tooltip(false)
        chartPointView
            .point()
            .position('name*value')
            .adjust([{type: 'jitter'}])
            .color("name", colors)
            .shape("circle")
            .size(3)
        chartPointView.scale({
            value: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound)),
                formatter(y) { return y.toFixed(1) },
            }
        });

        chart.scale({
            value: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound)),
                formatter(y) { return y.toFixed(1) },
            },
            range: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound)),
                formatter(y) { return y.toFixed(1) },
            }
        });
    }

    showTutorial = () => {
        if (!trialSettings.showTutorial) {
            return
        }

        if (!trialSettings.usePoints) {
            showPoints()
            chart.render()
        }

        document.querySelector("#tutorial").style.display ="block"
    }

    if (trialSettings.usePoints) {
        showPoints()
    }

    chart.interaction('active-region');
    chart.render();

    return probOfSuperiority
}

function submitGuess(event) {
    if (!experimentState.guessed) {
        let guessElement = document.querySelector("#theguess")
        if (guessElement.value.length == 0) {
            // bail if empty guess
            return
        }

        let guess = parseInt(guessElement.value)
        showTutorial()

        document.querySelector("#answer").textContent = parseInt(Math.round(100 * experimentState.probOfSuperiority))
        document.querySelector("#answer_block").style.display = trialSettings.showFeedback ? "block" : "none"
        document.querySelector("#after_game").style.display = "block"

        experimentState.guessed = true
    }
    event.preventDefault()
}

function newGame(trialSettings) {
    console.log({experimentState, trialSettings})
    document.querySelector("#trialdisplay").textContent = experimentState.trial
    experimentState.guessed = false

    if (trialSettings.obtainConfirmation) {
        modal = document.querySelector('.modal');
        const instance = M.Modal.getInstance(modal);

        instance.open()
    }

    experimentState.probOfSuperiority = resetGame(trialSettings)
    document.querySelector("#theguess").focus()
}

function updateExperiment(event) {
    if (event !== undefined) {
        event.preventDefault()
    }

    if (document.querySelector("#trialnumber").value.length == 0) {
        return
    }

    experimentState.trial = parseInt(document.querySelector("#trialnumber").value)
    experimentState.condition = document.querySelector("input[name='condition']:checked").value

    trialSettings = experimentStateToTrialSettings(experimentState)

    newGame(trialSettings)
}

function endExperiment() {
    // TODO: end it
    alert("experiment is done! send data to mturk!")
}

function nextRound() {
    if (experimentState.trial == 20) {
        return endExperiment()
    }

    experimentState.trial += 1
    trialSettings = experimentStateToTrialSettings(experimentState)
    newGame(trialSettings)
}

document.querySelector("#theguess_form").addEventListener("submit", submitGuess)
document.querySelector("#theguess").addEventListener("blur", submitGuess)
document.querySelector("#newgame").addEventListener("click", nextRound)

document.querySelectorAll("input[name='condition']").forEach(radio => {
    radio.addEventListener("change", updateExperiment)
})

document.querySelector("#trialnumber").addEventListener("blur", updateExperiment)
document.querySelector("#experiment_debug_form").addEventListener("submit", updateExperiment)

document.querySelector("#loading").style.display = "none"

chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 400
});

//updateSettings()
updateExperiment()
M.AutoInit();