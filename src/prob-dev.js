import { Chart } from '@antv/g2';
var base = require( '@stdlib/dist-stats-base-dists-flat' ).base;

// Box-Mueller, modified from https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
function randn_bm(n, mu, sigma) {
    // n = number of random numbers to sample
    // mu = mean
    // sigma = stddev

    console.log({n, mu, sigma})

    let data = []

    for (let i=0; i<n; i++) {
        var u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let randn = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v ) 

        data.push(randn * sigma + mu);
    }

    return data
}

function sum(arr) {
    let total = 0
    for (let i=0; i<arr.length; i++) {
        total += arr[i]
    }

    return total
}

function mean(arr) {
    return sum(arr) / arr.length
}

function computeVariance(arr) {
    let arr2 = []
    let arrMean = mean(arr)
    for (let i=0; i<arr.length; i++) {
        arr2.push((arr[i] - arrMean)**2)
    }

    return mean(arr2)
}

// Random draws from a normal distribution
// Points are adjusted so that sample means and standard deviations match the population
function randn_adj(n, mu, sigma) {
    let sample = randn_bm(n, mu, sigma)

    let sampleMean = mean(sample)
    let sampleVariance = computeVariance(sample)

    let sampleAdj = []

    for (let i=0; i<sample.length; i++) {
        sampleAdj.push((sample[i] - sampleMean)/Math.sqrt(sampleVariance) * sigma + mu)
    }

    return sampleAdj
}

function round100(x) {
    return Math.round(x * 100)/100
}

function generateScenario() {
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

    return {
        mu1, mu2, variance1, variance2, n1, n2
    }
}

function createBars(scenario) {
    let {mu1, mu2, variance1, variance2, n1, n2} = scenario
    let data = []
    if (useSE) {
        data.push({
            name: `Treatment (n=${n1})`,
            value: round100(mu1),
            n: n1,
            error: 2*round100(Math.sqrt(variance1/n1)),
            sd: round100(Math.sqrt(variance1))
        })
    }
    if (useSD) {
        data.push({
            name: `Treatment data (n=${n1})`,
            value: round100(mu1),
            error: 2*round100(Math.sqrt(variance1)),
            sd: round100(Math.sqrt(variance1)),
            n: n1,
        })
    }
    if (useSE) {
        data.push({
            name: `Control (n=${n2})`,
            value: round100(mu2),
            n: n2,
            error: 2*round100(Math.sqrt(variance2/n2)),
            sd: round100(Math.sqrt(variance2)),
        })
    }
    if (useSD) {
        data.push({
            name: `Control data (n=${n2})`,
            value: round100(mu2),
            error: 2*round100(Math.sqrt(variance2)),
            sd: round100(Math.sqrt(variance2)),
            n: n2,
        })
    }

    return data
}

function samplePointsFromScenario(scenario) {
    let {mu1, mu2, variance1, variance2, n1, n2} = scenario

    let sample1 = randn_adj(n1, mu1, Math.sqrt(variance1))
    let sample2 = randn_adj(n2, mu2, Math.sqrt(variance2))
    let data = []

    for (let i=0; i<n1; i++) {
        data.push({
            name: `Treatment (n=${n1})`, 
            value: sample1[i]
        })
    }
    for (let i=0; i<n2; i++) {
        data.push({
            name: `Control (n=${n2})`, 
            value: sample2[i]
        })
    }

    console.log({
        mu1, mean1: mean(sample1), variance1, empvar1: computeVariance(sample1),
        mu2, mean2: mean(sample2), variance2, empvar2: computeVariance(sample2),
    })

    return data
}

function computeProbOfSuperiority(scenario) {
    let {mu1, mu2, variance1, variance2} = scenario
    let mu = mu2 - mu1
    let variance = variance1 + variance2
    let psup = base.dists.normal.cdf(0, mu, Math.sqrt(variance))

    return psup
}

let chart, probOfSuperiority, useSE, useSD, usePoints, showTutorial, showPoints, guessed=false



function resetGame() {
    document.querySelector("#theguess").value = ""
    document.querySelector("#answer").textContent = ""
    document.querySelector("#after_game").style.display = "none"
    document.querySelector("#tutorial").style.display = "none"

    let scenario = generateScenario()
    let barData = createBars(scenario);
    let probOfSuperiority = computeProbOfSuperiority(scenario)
    console.log({scenario, probOfSuperiority})

    let lowerBound = barData[0].value
    let upperBound = barData[0].value
    barData.forEach((obj) => {
        obj.range = [obj.value - obj.error, obj.value + obj.error];

        if (obj.range[0] < lowerBound) {
            lowerBound = obj.range[0]
        }

        if (obj.range[1] > upperBound) {
            upperBound = obj.range[1]
        }
    });

    chart.legend(false);
    chart.changeData(barData);

    chart.tooltip({
        showMarkers: false
    });

    chart.point()
        .position('name*value')
        .color('name')
        .size(5)
        .style({
            fillOpacity: 1,
        });

    chart.interval()
        .position('name*range')
        .color('name')
        .size(40)
        .shape('tick');

    chart.scale({
        value: {
            min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
            max: round100(upperBound + 0.1 * Math.abs(upperBound))
        },
        range: {
            min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
            max: round100(upperBound + 0.1 * Math.abs(upperBound))
        }
    });


    showPoints = () => {
        let points = samplePointsFromScenario(scenario)
        let lowerBound = points[0].value
        let upperBound = points[0].value
        points.forEach((obj) => {
            if (obj.value < lowerBound) {
                lowerBound = obj.value
            }

            if (obj.value > upperBound) {
                upperBound = obj.value
            }
        });

        let chartPointView = chart.createView({
            padding: 0
        })

        chartPointView.data(points)
        chartPointView.axis(false)
        chartPointView.tooltip(false)
        chartPointView
            .point()
            .position('name*value')
            .adjust('jitter')
            .color("name")
            .shape("circle")
            .size(3)
        chartPointView.scale({
            value: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound))
            }
        });

        chart.scale({
            value: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound))
            },
            range: {
                min: round100(lowerBound - 0.1 * Math.abs(lowerBound)),
                max: round100(upperBound + 0.1 * Math.abs(upperBound))
            }
        });
    }

    if (usePoints) {
        showPoints()
    }

    chart.interaction('active-region');
    chart.render();

    return probOfSuperiority
}

function submitGuess(event) {
    if (!guessed) {
        let guessElement = document.querySelector("#theguess")
        if (guessElement.value.length == 0) {
            // bail if empty guess
            return
        }

        let guess = parseInt(guessElement.value)
        if (showTutorial) {
            if (!usePoints) {
                showPoints()
                chart.render()
            }

            document.querySelector("#tutorial").style.display ="block"
        }

        let answerElement = document.querySelector("#answer")
        answerElement.textContent = parseInt(Math.round(100 * probOfSuperiority))

        document.querySelector("#after_game").style.display = "block"

        guessed = true
    }
    event.preventDefault()
}

function newGame() {
    guessed = false
    probOfSuperiority = resetGame()
    document.querySelector("#theguess").focus()
}

function updateSettings() {
    useSE = document.querySelector("#use_se").checked
    useSD = document.querySelector("#use_sd").checked
    usePoints = document.querySelector("#use_points").checked
    showTutorial = document.querySelector("#show_tutorial").checked

    // default to SEs
    if (!(useSE || useSD || usePoints)) {
        document.querySelector("#use_se").checked = true
        useSE = true
    }

    newGame()
}

document.querySelector("#theguess_form").addEventListener("submit", submitGuess)
document.querySelector("#theguess").addEventListener("blur", submitGuess)
document.querySelector("#newgame").addEventListener("click", newGame)

document.querySelector("#use_se").addEventListener("change", updateSettings)
document.querySelector("#use_sd").addEventListener("change", updateSettings)
document.querySelector("#use_points").addEventListener("change", updateSettings)
document.querySelector("#show_tutorial").addEventListener("change", updateSettings)
document.querySelector("#loading").style.display = "none"

chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 400
});

updateSettings()
M.AutoInit();