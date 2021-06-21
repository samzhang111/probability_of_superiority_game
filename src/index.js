import { Chart } from '@antv/g2';
import { createBars, samplePointsFromScenario, experimentStateToTrialSettings } from "./experiment"
import { getShuffledScenario } from "./scenarios"
import { round100 } from "./stats"
import { logToAzure, submitToMturk } from './web';
import _ from "lodash"

let chart, experimentState={}, experimentResults=[], trialSettings, showPoints, showTutorial, scenarios=getShuffledScenario(), startTime = new Date().getTime(), mturkParams={}
const colors = ["#E91E63", "#4E5A7D"]
const modals = document.querySelectorAll('.modal');
let modal = M.Modal.init(modals, {
    opacity: 0.9,
    dismissable: true,
})[0];

function resetGame(scenario, trialSettings) {
    chart.clear()

    document.querySelector("#theguess").value = ""
    document.querySelector("#answer").textContent = ""
    document.querySelector("#after_game").style.display = "none"
    document.querySelector("#tutorial").style.display = "none"

    let bars = createBars(scenario, trialSettings)
    let {lowerBound, upperBound} = bars

    chart.legend(false);
    chart.changeData(bars.data);

    chart.tooltip({
        showMarkers: false
    });

    chart.point()
        .position('name*value')
        .color('name', 'black')
        .size(5)
        .style({
            fillOpacity: 0,
        });

    chart.interval()
        .position('name*range')
        .color('name', 'black')
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
        },
        name: {min: 0, max: 5, formatter(x) {
            if (x == 1) { return `Treatment (n=${scenario.n1})` }
            if (x == 4) { return `Control (n=${scenario.n2})` }

            return ""
        }, ticks: [1, 4]
    }
    })


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
            //.adjust([{type: 'jitter'}])
            .color("xcenter", colors)
            .shape("circle")
            .size(3)
            .style({fillOpacity: 0.5, strokeOpacity: 0.5})
        chartPointView.scale({
            value: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound)),
                formatter(y) { return y.toFixed(1) },
            },
            name: {min: 0, max: 5, ticks: [1, 4]}
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
            },
            name: {
                min: 0,
                max: 5,
                formatter(x) {
                    if (x == 1) { return `Treatment (n=${scenario.n1})` }
                    if (x == 4) { return `Control (n=${scenario.n2})` }

                    return ""
                },
                ticks: [1, 4]
            },
        })
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
}

function submitGuess(event) {
    event.preventDefault()
    if (experimentState.guessed) {
        return
    }

    let guessElement = document.querySelector("#theguess")
    if (guessElement.value.length == 0) {
        // bail if empty guess
        return
    }

    let currentTime = new Date().getTime()

    showTutorial()

    document.querySelector("#answer").textContent = parseInt(Math.round(100 * experimentState.scenario.probOfSuperiority))
    document.querySelector("#answer_block").style.display = trialSettings.showFeedback ? "block" : "none"
    document.querySelector("#after_game").style.display = "block"

    experimentState.guessed = true

    experimentState['guess'] = parseInt(guessElement.value)
    experimentState['currentTime'] = currentTime
    experimentState['startTime'] = startTime
    recordExperimentState()
}

function recordExperimentState() {
    let usefulExperimentData = _.omit(experimentState, ['guessed'])
    logToAzure(usefulExperimentData).catch((logToAzureError) => {
        console.error({logToAzureError})
    })

    experimentResults.push(usefulExperimentData)

    let trialDataElem = document.createElement("pre")
    trialDataElem.textContent = JSON.stringify(usefulExperimentData, null, 4) + ","
    document.querySelector("#debug_data").appendChild(trialDataElem)
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

    let scenario = scenarios[experimentState.trial - 1]
    console.log({scenarios, scenario, trialnum: experimentState.trial})
    resetGame(scenario, trialSettings)
    experimentState.scenario = scenario
    document.querySelector("#theguess").focus()
}

function updateExperiment(event) {
    if (event !== undefined) {
        event.preventDefault()
    }

    if (document.querySelector("#trialnumber").value.length == 0) {
        return
    }

    // when switching to mturk mode, these should be assigned differently.
    // trial = 1 always at the start
    // condition is assigned randomly or by mturk
    experimentState.trial = parseInt(document.querySelector("#trialnumber").value)
    experimentState.condition = document.querySelector("input[name='condition']:checked").value

    trialSettings = experimentStateToTrialSettings(experimentState)

    document.querySelector("#debug_data").innerHTML = ''
    experimentResults = []
    newGame(trialSettings)
}

function endExperiment() {
    experimentState['results'] = experimentResults

    submitToMturk(experimentState).then(() => {
        document.querySelector("#submitting").style.display = "none"
        document.querySelector("#submitsuccess").style.display = "block"
    }).catch(error => {
        console.log({error})
        document.querySelector("#submitting").style.display = "none"
        document.querySelector("#submitfailure").style.display = "block"
        document.querySelector("#workerIdError").textContent = experimentState.workerId
        document.querySelector("#taskIdError").textContent = experimentState.assignmentId
        document.querySelector("#turkSubmitError").textContent = error.stack
    })

    document.querySelector("#submitting").style.display = "block"
    document.querySelector("#game").style.display = "none"
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

const pageUrl = new URL(window.location.href)
mturkParams["turkSubmitTo"] = pageUrl.searchParams.get("turkSubmitTo")
mturkParams["hitId"] = pageUrl.searchParams.get("hitId")
mturkParams["workerId"] = pageUrl.searchParams.get("workerId")
mturkParams["assignmentId"] = pageUrl.searchParams.get("assignmentId")
Object.assign(experimentState, mturkParams)

chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 400
});

updateExperiment()
M.AutoInit();