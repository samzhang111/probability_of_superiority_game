import { Chart } from '@antv/g2';

function round100(x) {
    return Math.round(x * 100)/100
}

function randomData() {
    var mu1 = Math.random() * 50
    var mu2 = Math.random() * 50
    var tempMax = Math.max(mu1, mu2)
    var tempMin = Math.min(mu1, mu2)
    mu1 = tempMax
    mu2 = tempMin

    var variance1 = 1 + Math.random() * 30
    var variance2 = 1 + Math.random() * 30
    var n1 = Math.round(Math.random() * 70) + 30
    var n2 = Math.round(Math.random() * 70) + 30

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

function computeProbOfSuperiority(data) {
    var mu = data[data.length - 1].value - data[0].value
    var variance = data[0].sd ** 2 + data[data.length - 1].sd ** 2
    var psup = stdlib.base.dists.normal.cdf(0, mu, variance)

    console.log({data, mu, variance, psup})

    return psup
}

let chart, probOfSuperiority, useSE, useSD, usePoints, guessed=false

function resetGame() {
    document.querySelector("#theguess").value = ""
    document.querySelector("#answer").textContent = ""
    document.querySelector("#after_game").style.display = "none"

    let data = randomData();
    let probOfSuperiority = computeProbOfSuperiority(data)
    console.log({data, probOfSuperiority})

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

    chart.legend(false);
    chart.changeData(data);

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
}

function updateSettings() {
    useSE = document.querySelector("#use_se").checked
    useSD = document.querySelector("#use_sd").checked

    // default to SEs
    if (!(useSE || useSD)) {
        document.querySelector("#use_se").checked = true
        useSE = true
    }

    usePoints = document.querySelector("#use_points").checked
    newGame()
}

document.querySelector("#theguess_form").addEventListener("submit", submitGuess)
document.querySelector("#theguess").addEventListener("blur", submitGuess)
document.querySelector("#newgame").addEventListener("click", newGame)

document.querySelector("#use_se").addEventListener("change", updateSettings)
document.querySelector("#use_sd").addEventListener("change", updateSettings)
document.querySelector("#use_points").addEventListener("change", updateSettings)
document.querySelector("#loading").style.display = "none"

chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 400
});

updateSettings()
M.AutoInit();