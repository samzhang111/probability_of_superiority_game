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

// Standard Normal variate using Box-Muller transform.
// From https://stackoverflow.com/a/36481059
function randn_bm() {
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    return Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
}

function sampleNormal(n, mean, sd) {
    var data = []
    for (var i = 0; i < n; i++) {
        data.push((randn_bm() + mean) * sd)
    }

    return data
}

function sum(data) {
    var sum = 0
    for (var i = 0; i < data.length; i++) {
        sum += data[i]
    }

    return sum
}

function mean(data) {
    return sum(data) / data.length
}

function variance(data) {
    var m = mean(data)
    var varSum = 0
    for (var i = 0; i < data.length; i++) {
        varSum += (m - data[i])**2
    }

    return varSum / data.length
}

function randomData() {
    var mu1 = Math.random() * 2
    var mu2 = Math.random() * 2
    var tempMax = Math.max(mu1, mu2)
    var tempMin = Math.min(mu1, mu2)
    mu1 = tempMax
    mu2 = tempMin

    var variance1 = 1 + Math.random() * 2
    var variance2 = 1 + Math.random() * 2
    var n1 = Math.round(Math.random() * 98) + 2
    var n2 = Math.round(Math.random() * 98) + 2

    var dataTreatment = sampleNormal(n1, mu1, Math.sqrt(variance1))
    var dataControl = sampleNormal(n2, mu2, Math.sqrt(variance2))
    var mean1 = mean(dataTreatment)
    var mean2 = mean(dataControl)
    var sd1 = Math.sqrt(variance(dataTreatment))
    var sd2 = Math.sqrt(variance(dataControl))

    var probSampN = 100000
    var probSampTreatment = sampleNormal(probSampN, mean1, sd1)
    var probSampControl = sampleNormal(probSampN, mean2, sd2)
    var supCount = 0
    for (var i = 0; i < probSampN; i++) {
        supCount += (probSampTreatment[i] >= probSampControl[i])
    }
    var probSuperiority = Math.round(100 * (supCount / probSampN)) / 100

    var data = []
    for (var i = 0; i < n1; i++) {
        data.push({'condition': `treatment (n=${n1}, mu=${mean1})`, 'value': dataTreatment[i]})
    }

    for (var i = 0; i < n2; i++) {
        data.push({'condition': `control (n=${n2}, mu=${mean2})`, 'value': dataControl[i]})
    }

    return {
        data: data,
        mean1: mean1,
        mean2: mean2,
        sd1: sd1,
        sd2: sd2,
        n1: n1,
        n2: n2,
        probSuperiority: probSuperiority
    }
}

var gameData = randomData()

var spec = {
    "$schema": "https://vega.github.io/schema/vega-lite/v5.json",
    "data": {
        "values": gameData['data']
    },
    "encoding": { "y": { "field": "condition", "type": "ordinal" } },
    "layer": [
        {
            "mark": { "type": "point", "filled": true },
            "encoding": {
                "x": {
                    "aggregate": "mean",
                    "field": "value",
                    "type": "quantitative",
                    "scale": { "zero": false },
                    "title": "Value"
                },
                "color": { "value": "black" }
            }
        },
        {
            "mark": { "type": "errorbar", "extent": "ci" },
            "encoding": {
                "x": { "field": "value", "type": "quantitative", "title": "Value" }
            }
        }
    ]
};

vegaEmbed('#chart', spec);

document.getElementById("mean1").textContent = gameData["mean1"]
document.getElementById("mean2").textContent = gameData["mean2"]
document.getElementById("sd1").textContent = gameData["sd1"]
document.getElementById("sd2").textContent = gameData["sd2"]
document.getElementById("probSuperiority").textContent = gameData["probSuperiority"]