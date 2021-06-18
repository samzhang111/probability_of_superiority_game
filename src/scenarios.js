import _ from "lodash"

const scenarioA = [{"mu1":1.54,"mu2":1.09,"variance1":2.78,"variance2":1.94,"n1":64,"n2":73,"probOfSuperiority":0.58,"scenarioType":"A","scenarioId":1},{"mu1":1.51,"mu2":1.47,"variance1":1.63,"variance2":2.46,"n1":59,"n2":17,"probOfSuperiority":0.51,"scenarioType":"A","scenarioId":2},{"mu1":1.25,"mu2":0.92,"variance1":1.5,"variance2":1.08,"n1":95,"n2":53,"probOfSuperiority":0.58,"scenarioType":"A","scenarioId":3},{"mu1":1.76,"mu2":1.42,"variance1":2.37,"variance2":2.58,"n1":29,"n2":26,"probOfSuperiority":0.56,"scenarioType":"A","scenarioId":4}] 
const scenarioB = [{"mu1":2.11,"mu2":1.16,"variance1":1.51,"variance2":2.89,"n1":45,"n2":59,"probOfSuperiority":0.67,"scenarioType":"B","scenarioId":1},{"mu1":1,"mu2":0.02,"variance1":1.4,"variance2":2.99,"n1":76,"n2":21,"probOfSuperiority":0.68,"scenarioType":"B","scenarioId":2},{"mu1":1,"mu2":0.38,"variance1":1.99,"variance2":2.05,"n1":54,"n2":83,"probOfSuperiority":0.62,"scenarioType":"B","scenarioId":3},{"mu1":2.35,"mu2":1.23,"variance1":2.83,"variance2":2.6,"n1":31,"n2":86,"probOfSuperiority":0.68,"scenarioType":"B","scenarioId":4}] 
const scenarioC = [{"mu1":2.45,"mu2":0.8,"variance1":2.39,"variance2":2.77,"n1":84,"n2":29,"probOfSuperiority":0.77,"scenarioType":"C","scenarioId":1},{"mu1":2.12,"mu2":0.47,"variance1":2.93,"variance2":2.8,"n1":33,"n2":98,"probOfSuperiority":0.75,"scenarioType":"C","scenarioId":2},{"mu1":2.78,"mu2":1.31,"variance1":2.68,"variance2":2.14,"n1":89,"n2":16,"probOfSuperiority":0.75,"scenarioType":"C","scenarioId":3},{"mu1":1.49,"mu2":0.28,"variance1":2.36,"variance2":1.13,"n1":51,"n2":42,"probOfSuperiority":0.74,"scenarioType":"C","scenarioId":4}] 
const scenarioD = [{"mu1":2.4,"mu2":0.33,"variance1":1.63,"variance2":2.61,"n1":98,"n2":85,"probOfSuperiority":0.84,"scenarioType":"D","scenarioId":1},{"mu1":2.32,"mu2":0.19,"variance1":1.51,"variance2":2.37,"n1":68,"n2":97,"probOfSuperiority":0.86,"scenarioType":"D","scenarioId":2},{"mu1":2.51,"mu2":0.2,"variance1":2.83,"variance2":2.85,"n1":32,"n2":85,"probOfSuperiority":0.83,"scenarioType":"D","scenarioId":3},{"mu1":2.59,"mu2":0.58,"variance1":1.26,"variance2":1.89,"n1":75,"n2":19,"probOfSuperiority":0.87,"scenarioType":"D","scenarioId":4}] 
const scenarioE = [{"mu1":2.8,"mu2":0.14,"variance1":1.44,"variance2":1.38,"n1":75,"n2":74,"probOfSuperiority":0.94,"scenarioType":"E","scenarioId":1},{"mu1":2.39,"mu2":0.08,"variance1":1.65,"variance2":1.34,"n1":57,"n2":66,"probOfSuperiority":0.91,"scenarioType":"E","scenarioId":2},{"mu1":2.88,"mu2":0.44,"variance1":1.24,"variance2":2.16,"n1":66,"n2":37,"probOfSuperiority":0.91,"scenarioType":"E","scenarioId":3},{"mu1":2.76,"mu2":0.15,"variance1":1.84,"variance2":1.89,"n1":84,"n2":83,"probOfSuperiority":0.91,"scenarioType":"E","scenarioId":4}] 


export const getShuffledScenario = () => {
	let first5 = _.shuffle([scenarioA[0], scenarioB[0], scenarioC[0], scenarioD[0], scenarioE[0]])
	let middle10 = _.shuffle([
		scenarioA[1], scenarioB[1], scenarioC[1], scenarioD[1], scenarioE[1],
		scenarioA[2], scenarioB[2], scenarioC[2], scenarioD[2], scenarioE[2],
	])
	let last5 = _.shuffle([scenarioA[3], scenarioB[3], scenarioC[3], scenarioD[3], scenarioE[3]])

	return _.flatten([first5, middle10, last5])
}