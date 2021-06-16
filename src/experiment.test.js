import {experimentStateToTrialSettings, EXPERIMENTAL_CONDITIONS_ENUM} from "./experiment"
import _ from 'lodash'

test.each([
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 1],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 2],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 3],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 4],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 5],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 1],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 2],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 3],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 4],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 5],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 1],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 2],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 3],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 4],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 5],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 1],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 2],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 3],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 4],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 5],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 16],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 17],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 18],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 19],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY, 20],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 17],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 18],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 19],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS, 20],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 16],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 17],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 18],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 19],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT, 20],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 16],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 17],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 18],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 19],
	[EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK, 20],
])("All conditions use SEs without feedback in first and last five trials", (condition, trial) => {
	let trialSettings = experimentStateToTrialSettings({
		condition: condition,
		trial: trial
	})

	expect(trialSettings).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: false,
		showFeedback: false,
		obtainConfirmation: false,
	})
})

test.each(_.range(6, 16))("SE_ONLY condition gives feedback during trials 6-15", (trial) => {
	let trialSettings = experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_ONLY,
		trial: trial
	})

	expect(trialSettings).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: false,
		showFeedback: true,
		obtainConfirmation: false,
	})
})

test.each([
	EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS,
	EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT,
])("SE_POINTS and SE_POINTS_ONESHOT asks for confirmation on trial 6", (condition) => {
	expect(experimentStateToTrialSettings({
		condition: condition,
		trial: 6
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: true,
		showTutorial: false,
		showFeedback: true,
		obtainConfirmation: true,
	})
})

test("SE_POINTS_FEEDBACK asks for confirmation on trial 6", () => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK,
		trial: 6
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: true,
		showFeedback: true,
		obtainConfirmation: true,
	})
})

test("SE_POINTS_ONESHOT asks for confirmation before trial 7", () => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT,
		trial: 7
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: false,
		showFeedback: true,
		obtainConfirmation: true,
	})
})

test.each(_.range(8, 16))("SE_POINTS_ONESHOT only shows SE and feedback on trials 8-15", (trial) => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_ONESHOT,
		trial: trial
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: false,
		showFeedback: true,
		obtainConfirmation: false,
	})
})

test.each(_.range(7, 16))("SE_POINTS shows SE and points on trials 7-15", (trial) => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS,
		trial: trial
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: true,
		showTutorial: false,
		showFeedback: true,
		obtainConfirmation: false,
	})
})

test(_.range(7, 16))("SE_POINTS_FEEDBACK shows tutorials after each round from 7-15", (trial) => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS_FEEDBACK,
		trial: trial
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: true,
		showFeedback: true,
		obtainConfirmation: false,
	})
})

test("SE_POINTS asks for confirmation before trial 16", () => {
	expect(experimentStateToTrialSettings({
		condition: EXPERIMENTAL_CONDITIONS_ENUM.SE_POINTS,
		trial: 16
	})).toMatchObject({
		useSE: true,
		useSD: false,
		usePoints: false,
		showTutorial: false,
		showFeedback: false,
		obtainConfirmation: true,
	})
})
