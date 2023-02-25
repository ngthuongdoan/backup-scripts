#!/usr/bin/env node

import axios from "axios"
import inquirer from "inquirer"
import {
	assigneeIdCommand,
	currentBranchCommand,
	green,
	HHG_PROJECT_IDS,
	HUYEN_SPACE_ID,
	JIRA_DASHBOARD,
	red,
	reviewerIds,
	tokenCommand,
	TUNG_SPACE_ID,
	yellow,
	WEBHOOK_PROD,
} from "./constant/index.js"
import { execPromise } from "./utils/execPromise.js"
import { uuidv4 } from "./utils/uuidv4.js"

let token: string,
	assigneeId: string,
	commitMessage: string,
	currentBranch: string,
	jiraLink: string,
	targetBranch = "main"
let projectName = "Discover"
let projectId = HHG_PROJECT_IDS.Discover.id

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

const sendMessageToGoogleChat = async (url: string) => {
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
					color: {
						red: 235,
						green: 105,
						blue: 35,
						alpha: 1,
					},
				},
				{
					text: "View JIRA Ticket",
					onClick: {
						openLink: {
							url: jiraLink,
						},
					},
					color: {
						red: 135,
						green: 135,
						blue: 135,
						alpha: 1,
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
					color: {
						red: 235,
						green: 105,
						blue: 35,
						alpha: 1,
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
							"https://images.unsplash.com/photo-1586458873452-7bdd7401eabd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2083&q=80",
						imageType: "CIRCLE",
						imageAltText: "Avatar for Bot",
					},
					sections: [
						{
							widgets: [
								{
									decoratedText: {
										topLabel: "Title",
										text: commitMessage,
										wrapText: true,
										startIcon: {
											knownIcon: "BOOKMARK",
										},
									},
								},
								{
									decoratedText: {
										topLabel: "Environment",
										text: `merge into ${targetBranch}`,
										startIcon: {
											knownIcon: "HOTEL_ROOM_TYPE",
										},
									},
								},
							],
						},
						{
							widgets: [
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
	} catch (error: any) {
		console.log({ error, message: error?.message })
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
