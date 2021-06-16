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
export function randn_adj(n, mu, sigma) {
    let sample = randn_bm(n, mu, sigma)

    let sampleMean = mean(sample)
    let sampleVariance = computeVariance(sample)

    let sampleAdj = []

    for (let i=0; i<sample.length; i++) {
        sampleAdj.push((sample[i] - sampleMean)/Math.sqrt(sampleVariance) * sigma + mu)
    }

    return sampleAdj
}

export function round100(x) {
    return Math.round(x * 100)/100
}

export function computeProbOfSuperiority(scenario) {
    let {mu1, mu2, variance1, variance2} = scenario
    let mu = mu2 - mu1
    let variance = variance1 + variance2
    let psup = base.dists.normal.cdf(0, mu, Math.sqrt(variance))

    return psup
}
