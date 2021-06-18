import { randn_adj, round100, computeProbOfSuperiority } from './stats';

export function generateScenario() {
    /* This is not used for "yoking" */
    var mu1 = Math.random() * 3
    var mu2 = Math.random() * 3
    var tempMax = Math.max(mu1, mu2)
    var tempMin = Math.min(mu1, mu2)
    mu1 = tempMax
    mu2 = tempMin

    var variance1 = 1 + Math.random() * 2
    var variance2 = 1 + Math.random() * 2
    var n1 = Math.round(Math.random() * 85) + 15
    var n2 = Math.round(Math.random() * 85) + 15

    let scenario = {
        mu1, mu2, variance1, variance2, n1, n2
    }

    scenario['probOfSuperiority'] = computeProbOfSuperiority(scenario)

    return scenario
}

export function createBars(scenario, trialSettings) {
    let {mu1, mu2, variance1, variance2, n1, n2} = scenario
    let {useSE, useSD} = trialSettings
    let data = []
    if (useSE) {
        data.push({
            name: 1,
            //name: `Treatment (n=${n1})`,
            value: round100(mu1),
            n: n1,
            error: 2*round100(Math.sqrt(variance1/n1)),
            sd: round100(Math.sqrt(variance1))
        })
    }
    if (useSD) {
        data.push({
            name: 2,
            //name: `Treatment data (n=${n1})`,
            value: round100(mu1),
            error: 2*round100(Math.sqrt(variance1)),
            sd: round100(Math.sqrt(variance1)),
            n: n1,
        })
    }
    if (useSE) {
        data.push({
            name: 4,
            //name: `Control (n=${n2})`,
            value: round100(mu2),
            n: n2,
            error: 2*round100(Math.sqrt(variance2/n2)),
            sd: round100(Math.sqrt(variance2)),
        })
    }
    if (useSD) {
        data.push({
            name: 3,
            //name: `Control data (n=${n2})`,
            value: round100(mu2),
            error: 2*round100(Math.sqrt(variance2)),
            sd: round100(Math.sqrt(variance2)),
            n: n2,
        })
    }

    let lowerBound = data[0].value
    let upperBound = data[0].value
    data.forEach((obj) => {
        obj.range = [obj.value - obj.error, obj.value + obj.error];

        if (obj.range[0] < lowerBound) {
            lowerBound = obj.range[0]
        }

        if (obj.range[1] > upperBound) {
            upperBound = obj.range[1]
        }
    });


    return { data, lowerBound, upperBound }
}

export function samplePointsFromScenario(scenario) {
    let {mu1, mu2, variance1, variance2, n1, n2} = scenario

    let sample1 = randn_adj(n1, mu1, Math.sqrt(variance1))
    let sample2 = randn_adj(n2, mu2, Math.sqrt(variance2))
    let data = []

    for (let i=0; i<n1; i++) {
        data.push({
            name: 0.5 + Math.random(),
            xcenter: 1,
            //name: `Treatment (n=${n1})`, 
            value: sample1[i]
        })
    }
    for (let i=0; i<n2; i++) {
        data.push({
            name: 3.5 + Math.random(),
            xcenter: 4,
            //name: `Control (n=${n2})`, 
            value: sample2[i]
        })
    }

    let lowerBound = data[0].value
    let upperBound = data[0].value
    data.forEach((obj) => {
        if (obj.value < lowerBound) {
            lowerBound = obj.value
        }

        if (obj.value > upperBound) {
            upperBound = obj.value
        }
    });

    return {data, lowerBound, upperBound}
}

export const EXPERIMENTAL_CONDITIONS_ENUM = {
    SE_ONLY: "SE_ONLY",
    SE_POINTS: "SE_POINTS",
    SE_POINTS_ONESHOT: "SE_POINTS_ONESHOT",
    SE_POINTS_FEEDBACK: "SE_POINTS_FEEDBACK",
}

export function experimentStateToTrialSettings(experimentState) {
    let trialSettings = {
        useSE: false,
        useSD: false,
        usePoints: false,
        showTutorial: false,
        showFeedback: false,
        obtainConfirmation: false,
    }

    if ((experimentState.trial <= 5) || (experimentState.trial >= 16)) {
        trialSettings.useSE = true

        if (experimentState.condition == EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS && (experimentState.trial == 16)) {
            trialSettings.obtainConfirmation = true
        }
        return trialSettings
    }

    if (experimentState.condition == EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY) {
        trialSettings.useSE = true
        trialSettings.showFeedback = true

        return trialSettings
    }

    if (experimentState.condition == EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT) {
        trialSettings.useSE = true
        trialSettings.showFeedback = true

        if (experimentState.trial == 6) {
            trialSettings.usePoints = true
            trialSettings.obtainConfirmation = true
        }

        if (experimentState.trial == 7) {
            trialSettings.obtainConfirmation = true
        }

        return trialSettings
    }

    if (experimentState.condition == EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS) {
        trialSettings.useSE = true
        trialSettings.usePoints = true
        trialSettings.showFeedback = true

        if (experimentState.trial == 6) {
            trialSettings.obtainConfirmation = true
        }

        return trialSettings
    }

    if (experimentState.condition == EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK) {
        trialSettings.useSE = true
        trialSettings.showTutorial = true
        trialSettings.showFeedback = true

        return trialSettings
    }
}