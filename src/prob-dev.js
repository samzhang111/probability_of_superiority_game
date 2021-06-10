import { Chart } from '@antv/g2';

// From https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
function erf(x) {
  // save the sign of x
  var sign = (x >= 0) ? 1 : -1;
  x = Math.abs(x);

  // constants
  var a1 =  0.254829592;
  var a2 = -0.284496736;
  var a3 =  1.421413741;
  var a4 = -1.453152027;
  var a5 =  1.061405429;
  var p  =  0.3275911;

  // A&S formula 7.1.26
  var t = 1.0/(1.0 + p*x);
  var y = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-x * x);
  return sign * y; // erf(-x) = -erf(x);
}

// From https://stackoverflow.com/questions/14846767/std-normal-cdf-normal-cdf-or-error-function
function cdf(x, mean, variance) {
  return 0.5 * (1 + erf((x - mean) / (Math.sqrt(2 * variance))));
}


function round100(x) {
    return Math.round(x * 100)/100
}

function randomData() {
    var mu1 = Math.random() * 10
    var mu2 = Math.random() * 10
    var tempMax = Math.max(mu1, mu2)
    var tempMin = Math.min(mu1, mu2)
    mu1 = tempMax
    mu2 = tempMin

    var variance1 = 1 + Math.random() * 100
    var variance2 = 1 + Math.random() * 100
    var n1 = Math.round(Math.random() * 98) + 2
    var n2 = Math.round(Math.random() * 98) + 2

    return [{
            name: `Treatment (n=${n1})`,
            value: round100(mu1),
            sd: round100(Math.sqrt(variance1)),
            n: n1,
            se: round100(Math.sqrt(variance1)/n1)
        },
        {
            name: `Control (n=${n2})`,
            value: round100(mu2),
            sd: round100(Math.sqrt(variance2)),
            n: n2,
            se: round100(Math.sqrt(variance1)/n2)
        },
    ]
}

function computeProbOfSuperiority(data) {
    var mu = data[1].value - data[0].value
    var variance = data[0].sd ** 2 + data[1].sd ** 2

    return cdf(0, mu, variance)
}

let chart, probOfSuperiority

function resetGame() {
    let theGuessElement = document.querySelector("#theguess")
    let yourGuessDisplayElement = document.querySelector("#yourguess")
    let answerElement = document.querySelector("#answer")
    theGuessElement.value = ""
    yourGuessDisplayElement.textContent = ""
    answerElement.textContent = ""

    let data = randomData();
    let probOfSuperiority = computeProbOfSuperiority(data)

    data[0]["error"] = 2*data[0].se
    data[1]["error"] = 2*data[1].se

    data.forEach((obj) => {
    obj.range = [obj.value - obj.error, obj.value + obj.error];
    });

    let lowerBound = Math.min(data[0].range[0], data[1].range[0])
    let upperBound = Math.max(data[0].range[1], data[1].range[1])

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
    let theGuessElement = document.querySelector("#theguess")
    let yourGuessDisplayElement = document.querySelector("#yourguess")
    let answerElement = document.querySelector("#answer")

    let guess = parseInt(theGuessElement.value)

    yourGuessDisplayElement.textContent = guess
    answerElement.textContent = parseInt(Math.round(100 * probOfSuperiority))
    event.preventDefault()
}

function newGame() {
    probOfSuperiority = resetGame()
}


document.querySelector("#guessform").addEventListener("submit", submitGuess)
document.querySelector("#newgame").addEventListener("click", newGame)

chart = new Chart({
    container: 'chart',
    autoFit: true,
    height: 400
});

probOfSuperiority = resetGame()