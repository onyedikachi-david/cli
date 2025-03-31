import { getCliTestFixture } from "../../fixtures/get-cli-test-fixture"
import { test, expect } from "bun:test"
import { cliConfig } from "lib/cli-config"
import { sign } from "jsonwebtoken"

const demoJwtToken = sign(
  {
    github_username: "test_user",
  },
  "TEST_SECRET",
)

test("print and set token explicitly", async () => {
  const { runCommand } = await getCliTestFixture()

  cliConfig.clear()
  // Test printing token without authentication
  const { stdout: invalidTokenPrintStdout, stderr: invalidTokenPrintStderr } =
    await runCommand("tsci auth print-token")
  expect(invalidTokenPrintStdout).toContain(
    "You need to log in to access this.",
  )
  expect(invalidTokenPrintStderr).toBeFalsy()

  // Test setting an invalid token
  const { stdout: invalidTokenSetStdout, stderr: invalidTokenSetStderr } =
    await runCommand("tsci auth set-token invalid-token-example")
  expect(invalidTokenSetStdout).toContain("Invalid token provided")
  expect(invalidTokenSetStderr).toBeFalsy()

  // Test setting a valid token
  const { stdout: validTokenSetStdout, stderr: validTokenSetStderr } =
    await runCommand(`tsci auth set-token ${demoJwtToken}`)
  expect({ validTokenSetStdout, validTokenSetStderr }).toMatchInlineSnapshot(`
    {
      "validTokenSetStderr": "",
      "validTokenSetStdout": 
    "Token manually updated.
    "
    ,
    }
  `)

  // Test printing the valid token
  const { stdout: validTokenPrintStdout, stderr: validTokenPrintStderr } =
    await runCommand("tsci auth print-token")
  expect(validTokenPrintStdout).toContain(demoJwtToken)
  expect(validTokenPrintStderr).toBeFalsy()

  // Verify token is correctly stored and can be reused
  const { stdout: reprintTokenStdout } = await runCommand(
    "tsci auth print-token",
  )
  expect(reprintTokenStdout).toContain(demoJwtToken)
})
