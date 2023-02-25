#!/usr/bin/env node
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import { exec } from "child_process";
import axios from "axios";
import inquirer from "inquirer";
import ora from "ora";
import { assigneeIdCommand, currentBranchCommand, green, HHG_PROJECT_IDS, HUYEN_SPACE_ID, JIRA_DASHBOARD, red, reviewerIds, tokenCommand, TUNG_SPACE_ID, yellow, WEBHOOK_PROD } from "./constant/index.js";
let token, assigneeId, commitMessage, currentBranch, jiraLink, targetBranch = "main";
let projectName = "Discover";
let projectId = HHG_PROJECT_IDS.Discover.id;
const spinner = ora({
    spinner: "moon",
});
function uuidv4() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, function (c) {
        var r = (Math.random() * 16) | 0, v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}
function execPromise(command, withSpinner = false, message = "Loading unicorns") {
    return new Promise((resolve, reject) => {
        withSpinner && spinner.start(message);
        exec(command, (error, stdout, stderr) => {
            if (error) {
                withSpinner && spinner.fail("To the hell ");
                reject(error);
                return;
            }
            withSpinner && spinner.succeed("To the moon");
            resolve(stdout ? stdout : stderr);
        });
    });
}
const chooseProject = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "list",
            message: "Choose a project:",
            name: "project",
            choices: Object.keys(HHG_PROJECT_IDS),
            default: HHG_PROJECT_IDS.Discover.id,
        },
    ]);
    const { id, path } = HHG_PROJECT_IDS[answers.project];
    console.log(yellow("Change Directory..."));
    process.chdir(path);
    return { id, name: answers.project };
});
const getTargetBranch = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "input",
            name: "targetBranch",
            message: "Enter target branch (default is main):",
            default: "main",
        },
    ]);
    yield execPromise(`git pull origin ${answers.targetBranch}`, true, "Updating the local branch with changes from the remote repository...");
    return answers.targetBranch;
});
const getCurrentBranch = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "input",
            name: "branchName",
            message: `Enter branch name (default is ${currentBranch}):`,
            default: currentBranch,
        },
    ]);
    console.log(yellow("Checking out a new branch..."));
    try {
        yield execPromise(`git checkout -b ${answers.branchName}`);
    }
    catch (e) {
    }
    finally {
        yield execPromise("git add .");
        return answers.branchName;
    }
});
const getCommitMessage = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "input",
            name: "message",
            message: `Enter commit message: `,
        },
    ]);
    yield execPromise(`git commit -m "${answers.message}"`, true, "Committing ...");
    return answers.message;
});
function checkMergeRequestExisted() {
    return __awaiter(this, void 0, void 0, function* () {
        let HHG_PROJECT_PATH = `https://gitlab.hellohealthgroup.com/api/v4/projects/${projectId}/merge_requests`;
        const url = `${HHG_PROJECT_PATH}?state=opened&source_branch=${currentBranch}&target_branch=${targetBranch}`;
        try {
            const { data } = yield axios.get(url, {
                headers: {
                    "PRIVATE-TOKEN": token,
                },
            });
            if (data && Array.isArray(data) && data.length > 0) {
                return true;
            }
            return false;
        }
        catch (error) {
            throw error;
        }
    });
}
const createMergeRequest = () => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const answers = yield inquirer.prompt([
        {
            type: "confirm",
            name: "createMR",
            message: "Do you want to create a Merge Request?",
            default: true,
        },
    ]);
    if (!answers.createMR) {
        console.log("Cancelled creating Merge Request.");
        return;
    }
    console.log(yellow("Creating a merge request..."));
    const data = {
        source_branch: currentBranch,
        target_branch: targetBranch,
        title: commitMessage,
        assignee_id: assigneeId,
        reviewer_ids: reviewerIds,
        remove_source_branch: true,
        squash: false,
    };
    let HHG_PROJECT_PATH = `https://gitlab.hellohealthgroup.com/api/v4/projects/${projectId}/merge_requests`;
    const response = yield axios.post(HHG_PROJECT_PATH, data, {
        headers: {
            "PRIVATE-TOKEN": token,
        },
    });
    console.log(green("Merge request created successfully!"));
    return (_a = response === null || response === void 0 ? void 0 : response.data) === null || _a === void 0 ? void 0 : _a.web_url;
});
const attachJiraTicket = () => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "confirm",
            name: "attachTicket",
            message: "Do you want to attach a JIRA ticket?",
            default: false,
        },
    ]);
    if (!answers.attachTicket) {
        console.log("No Attach...");
        return null;
    }
    console.log(yellow("Opening JIRA Dashboard..."));
    yield execPromise(`open ${JIRA_DASHBOARD}`);
    const answerLink = yield inquirer.prompt([
        {
            type: "input",
            name: "jiraLink",
            message: `Enter JIRA link: `,
        },
    ]);
    return answerLink.jiraLink;
});
const sendMessageToGoogleChat = (url) => __awaiter(void 0, void 0, void 0, function* () {
    const answers = yield inquirer.prompt([
        {
            type: "input",
            name: "message",
            message: `Message (Optional):`,
            default: "Dear",
        },
    ]);
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
        ];
    const cardContent = {
        text: `${answers.message} ${TUNG_SPACE_ID} ${jiraLink ? HUYEN_SPACE_ID : ""}`,
        thread: {
            name: "spaces/AAAAg__fvcA/threads/AA9RzkvctLE",
        },
        cardsV2: [
            {
                cardId: uuidv4(),
                card: {
                    header: {
                        title: `Merge Request (${projectName})`,
                        imageUrl: "https://images.unsplash.com/photo-1586458873452-7bdd7401eabd?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=2083&q=80",
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
                                            knownIcon: "BOOKMARK"
                                        },
                                    },
                                },
                                {
                                    decoratedText: {
                                        topLabel: "Environment",
                                        text: `merge into ${targetBranch}`,
                                        startIcon: {
                                            knownIcon: "HOTEL_ROOM_TYPE"
                                        },
                                    },
                                },
                            ],
                        },
                        {
                            widgets: [
                                {
                                    textParagraph: {
                                        text: "If the path before you is clear, you're probably on someone else's. - Joseph Campbell",
                                    }
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
    };
    try {
        const response = yield axios.post(WEBHOOK_PROD, cardContent, {
            headers: {
                "Content-Type": "application/json",
            },
        });
        console.log(response.data);
    }
    catch (error) {
        console.log({ error, message: error === null || error === void 0 ? void 0 : error.message });
    }
});
const main = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Retrieve the user's GitLab ID and API token
        const project = yield chooseProject();
        projectId = project.id;
        projectName = project.name;
        assigneeId = (yield execPromise(assigneeIdCommand)).trim();
        token = (yield execPromise(tokenCommand)).trim();
        // Retrieve the current branch name
        currentBranch = (yield execPromise(currentBranchCommand)).trim();
        // Clean up tree
        yield execPromise("git remote prune origin");
        // Get the target branch name
        targetBranch = yield getTargetBranch();
        if (!["main", "hotfixes"].includes(targetBranch))
            throw new Error("Invalid target branch. Available options are: main, hotfixes.");
        currentBranch = yield getCurrentBranch();
        commitMessage = yield getCommitMessage();
        console.log(yellow("Pushing the branch to the remote repository..."));
        yield execPromise(`git push -u origin ${currentBranch}`);
        const isMergeRequestExisted = yield checkMergeRequestExisted();
        if (isMergeRequestExisted) {
            console.log(yellow(`Merge request with source branch ${currentBranch} and target branch ${targetBranch} already exists.`));
            return;
        }
        console.log(green(`No merge request with target branch ${currentBranch} found.`));
        const url = yield createMergeRequest();
        jiraLink = yield attachJiraTicket();
        if (url) {
            yield sendMessageToGoogleChat(url);
        }
        else {
            console.log(red("Merge request URL is not available. Skipping sending message to Google Chat API."));
        }
        yield execPromise("git checkout main");
    }
    catch (e) {
        console.error(red(`Error : ${e}`));
    }
});
main();
