import chalk from "chalk"

export const red = chalk.red
export const green = chalk.green
export const yellow = chalk.yellow
export const EDDIE_SPACE_ID = "<users/111394960770002739899>"
export const TUNG_SPACE_ID = "<users/109196398756093781275>"
export const HUYEN_SPACE_ID = "<users/107074842078370270944>"
export const assigneeIdCommand = "git config --global user.id"
export const tokenCommand = "git config --global user.token"
export const currentBranchCommand = "git symbolic-ref --short HEAD"
export const reviewerIds = "39"
export const BASE_PATH = "/Users/eddiedoan/job/code/hhg"

export const JIRA_DASHBOARD =
	"https://hhgdev.atlassian.net/jira/dashboards/10122"

export const WEBHOOK_DEV =
	"https://chat.googleapis.com/v1/spaces/mpE594AAAAE/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=cy9G5FnoL2RK9ZJZ38k_fBMMxbX2354OqguLCvCKcM8%3D"
export const WEBHOOK_PROD =
	"https://chat.googleapis.com/v1/spaces/AAAAg__fvcA/messages?key=AIzaSyDdI0hCZtE6vySjMm-WEfRq3CPzqKqqsHI&token=ljGOgxI13FRvs3E2wekNjE0uoGBzuk8NOIYBdlyVj1U%3D"
export const HHG_PROJECT_IDS = {
	Discover: { id: 98, path: BASE_PATH + "/hhg-discover-fe" },
	Component: { id: 35, path: BASE_PATH + "/hhg-components" },
	Together: { id: 45, path: BASE_PATH + "/hhg-together-fe" },
}
