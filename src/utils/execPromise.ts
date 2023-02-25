import ora from "ora"
import { exec } from "child_process"

const spinner = ora({
	spinner: "moon",
})
export function execPromise(
	command: string,
	withSpinner = false,
	message = "Loading unicorns"
) {
	return new Promise<string>((resolve, reject) => {
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
