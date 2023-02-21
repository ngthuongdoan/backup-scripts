#!/usr/bin/env node
import { exec } from "child_process"

import axios from "axios"
import inquirer from "inquirer"
import ora from "ora"
import {
	BASE_PATH,
	EDDIE_SPACE_ID,
	HHG_PROJECT_IDS,
	HUYEN_SPACE_ID,
	JIRA_DASHBOARD,
	TUNG_SPACE_ID,
	WEBHOOK_DEV,
	WEBHOOK_PROD,
	assigneeIdCommand,
	currentBranchCommand,
	green,
	tokenCommand,
	yellow,
	red,
	reviewerIds,
} from "./constant/index.mjs"

let token,
	assigneeId,
	commitMessage,
	currentBranch,
	jiraLink,
	targetBranch = "main"
let projectName = "Discover"
let projectId = HHG_PROJECT_IDS.Discover.id

const spinner = ora({
	spinner: "moon",
})

function uuidv4() {
	return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
		var r = (Math.random() * 16) | 0,
			v = c == "x" ? r : (r & 0x3) | 0x8
		return v.toString(16)
	})
}

const rgbToCssColor = function (red, green, blue) {
	var rgbNumber = new Number((red << 16) | (green << 8) | blue)
	var hexString = rgbNumber.toString(16)
	var missingZeros = 6 - hexString.length
	var resultBuilder = ["#"]
	for (var i = 0; i < missingZeros; i++) {
		resultBuilder.push("0")
	}
	resultBuilder.push(hexString)
	return resultBuilder.join("")
}
function execPromise(
	command,
	withSpinner = false,
	message = "Loading unicorns"
) {
	return new Promise((resolve, reject) => {
		withSpinner && spinner.start(message)
		exec(command, (error, stdout, stderr) => {
			if (error) {
				withSpinner && spinner.fail("To the hell ")
				reject(error)
				return
			}
			withSpinner && spinner.succeed("To the moon")
			resolve(stdout ? stdout : stderr)
		})
	})
}

const chooseProject = async () => {
	const answers = await inquirer.prompt([
		{
			type: "list",
			message: "Choose a project:",
			name: "project",
			choices: Object.keys(HHG_PROJECT_IDS),
			default: HHG_PROJECT_IDS.Discover.id,
		},
	])
	const { id, path } = HHG_PROJECT_IDS[answers.project]
	console.log(yellow("Change Directory..."))
	process.chdir(path)
	return { id, name: answers.project }
}

const getTargetBranch = async () => {
	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "targetBranch",
			message: "Enter target branch (default is main):",
			default: "main",
		},
	])
	await execPromise(
		`git pull origin ${answers.targetBranch}`,
		true,
		"Updating the local branch with changes from the remote repository..."
	)
	return answers.targetBranch
}

const getCurrentBranch = async () => {
	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "branchName",
			message: `Enter branch name (default is ${currentBranch}):`,
			default: currentBranch,
		},
	])
	console.log(yellow("Checking out a new branch..."))
	try {
		await execPromise(`git checkout -b ${answers.branchName}`)
	} catch (e) {
	} finally {
		await execPromise("git add .")
		return answers.branchName
	}
}

const getCommitMessage = async () => {
	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "message",
			message: `Enter commit message: `,
		},
	])
	await execPromise(
		`git commit -m "${answers.message}"`,
		true,
		"Committing ..."
	)
	return answers.message
}

async function checkMergeRequestExisted() {
	let HHG_PROJECT_PATH = `https://gitlab.hellohealthgroup.com/api/v4/projects/${projectId}/merge_requests`
	const url = `${HHG_PROJECT_PATH}?state=opened&source_branch=${currentBranch}&target_branch=${targetBranch}`

	try {
		const { data } = await axios.get(url, {
			headers: {
				"PRIVATE-TOKEN": token,
			},
		})
		if (data && Array.isArray(data) && data.length > 0) {
			return true
		}
		return false
	} catch (error) {
		throw error
	}
}

const createMergeRequest = async () => {
	const answers = await inquirer.prompt([
		{
			type: "confirm",
			name: "createMR",
			message: "Do you want to create a Merge Request?",
			default: true,
		},
	])
	if (!answers.createMR) {
		console.log("Cancelled creating Merge Request.")
		return
	}

	console.log(yellow("Creating a merge request..."))
	const data = {
		source_branch: currentBranch,
		target_branch: targetBranch,
		title: commitMessage,
		assignee_id: assigneeId,
		reviewer_ids: reviewerIds,
		remove_source_branch: true,
		squash: false,
	}

	let HHG_PROJECT_PATH = `https://gitlab.hellohealthgroup.com/api/v4/projects/${projectId}/merge_requests`

	const response = await axios.post(HHG_PROJECT_PATH, data, {
		headers: {
			"PRIVATE-TOKEN": token,
		},
	})

	console.log(green("Merge request created successfully!"))

	return response?.data?.web_url
}

const attachJiraTicket = async () => {
	const answers = await inquirer.prompt([
		{
			type: "confirm",
			name: "attachTicket",
			message: "Do you want to attach a JIRA ticket?",
			default: false,
		},
	])
	if (!answers.attachTicket) {
		console.log("No Attach...")
		return null
	}
	console.log(yellow("Opening JIRA Dashboard..."))
	await execPromise(`open ${JIRA_DASHBOARD}`)
	const answerLink = await inquirer.prompt([
		{
			type: "input",
			name: "jiraLink",
			message: `Enter JIRA link: `,
		},
	])
	return answerLink.jiraLink
}

const sendMessageToGoogleChat = async (url) => {
	const answers = await inquirer.prompt([
		{
			type: "input",
			name: "message",
			message: `Message (Optional):`,
			default: "Dear",
		},
	])

	const buttonList = jiraLink
		? [
				{
					text: "View Merge Request",
					onClick: {
						openLink: {
							url,
						},
					},
				},
				{
					text: "View JIRA Ticket",
					onClick: {
						openLink: {
							url: jiraLink,
						},
					},
				},
		  ]
		: [
				{
					text: "View Merge Request",
					onClick: {
						openLink: {
							url,
						},
					},
				},
		  ]
	const cardContent = {
		text: `${answers.message} ${TUNG_SPACE_ID} ${
			jiraLink ? HUYEN_SPACE_ID : ""
		}`,
		thread: {
			name: "spaces/AAAAg__fvcA/threads/AA9RzkvctLE",
		},
		cardsV2: [
			{
				cardId: uuidv4(),
				card: {
					header: {
						title: `Merge Request (${projectName})`,
						imageUrl:
							"https://images.unsplash.com/photo-1495055154266-57bbdeada43e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2070&q=80",
						imageType: "CIRCLE",
						imageAltText: "Avatar for Bot",
					},
					sections: [
						{
							header: "Info",
							widgets: [
								{
									decoratedText: {
										startIcon: {
											knownIcon: "HOTEL_ROOM_TYPE",
										},
										text: commitMessage,
										wrapText: true,
									},
								},
								{
									decoratedText: {
										startIcon: {
											knownIcon: "MAP_PIN",
										},
										text: `merge into ${targetBranch}`,
									},
								},
								{
									buttonList: {
										buttons: buttonList,
									},
								},
							],
						},
					],
				},
			},
		],
	}

	try {
		const response = await axios.post(WEBHOOK_PROD, cardContent, {
			headers: {
				"Content-Type": "application/json",
			},
		})

		console.log(response.data)
	} catch (error) {
		console.log(error)
	}
}

const main = async () => {
	try {
		// Retrieve the user's GitLab ID and API token
		const project = await chooseProject()
		projectId = project.id
		projectName = project.name
		assigneeId = (await execPromise(assigneeIdCommand)).trim()
		token = (await execPromise(tokenCommand)).trim()
		// Retrieve the current branch name
		currentBranch = (await execPromise(currentBranchCommand)).trim()
		// Clean up tree
		await execPromise("git remote prune origin")
		// Get the target branch name
		targetBranch = await getTargetBranch()
		if (!["main", "hotfixes"].includes(targetBranch))
			throw new Error(
				"Invalid target branch. Available options are: main, hotfixes."
			)

		currentBranch = await getCurrentBranch()
		commitMessage = await getCommitMessage()
		console.log(yellow("Pushing the branch to the remote repository..."))
		await execPromise(`git push -u origin ${currentBranch}`)

		const isMergeRequestExisted = await checkMergeRequestExisted()
		if (isMergeRequestExisted) {
			console.log(
				yellow(
					`Merge request with source branch ${currentBranch} and target branch ${targetBranch} already exists.`
				)
			)
			return
		}

		console.log(
			green(`No merge request with target branch ${currentBranch} found.`)
		)
		const url = await createMergeRequest()
		jiraLink = await attachJiraTicket()
		if (url) {
			await sendMessageToGoogleChat(url)
		} else {
			console.log(
				red(
					"Merge request URL is not available. Skipping sending message to Google Chat API."
				)
			)
		}
		await execPromise("git checkout main")
	} catch (e) {
		console.error(red(`Error : ${e}`))
	}
}

main()
