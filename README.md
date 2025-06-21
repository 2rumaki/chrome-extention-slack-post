# chrome-extension-slack-post

This Chrome extension posts the current tab URL and a comment to a Slack channel using a Slack bot token.
Icons are not included in this repository; add your own icon files before loading the extension.

## Setup
1. Create a Slack App with the **chat:write** permission and install it to your workspace.
2. Obtain the Bot User OAuth Token (starts with `xoxb-`) and the target channel ID.
3. Load the `extension` directory as an unpacked extension in Chrome. If you
   have your own icons, place them inside the directory and reference them in
   `manifest.json`.
4. Open the extension options and enter your token and channel ID.

## Usage
- Click the extension icon, enter a comment, and press **Post to Slack**. The URL of the active tab and your comment will be sent to Slack.
