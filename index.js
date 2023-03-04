const path = require('node:path');
const { execSync } = require("child_process");

const core = require('@actions/core');

function getOptionalInput(inputKey, defaultValue) {
    const inputValue = core.getInput(inputKey);
    return (inputValue.length == 0) ? defaultValue : inputValue;
}

try {
    const buildDirPath = core.getInput("build-dir");
    const dockerFilePath = getOptionalInput("dockerfile-path", path.join(buildDirPath, "Dockerfile"));
    const imageName = core.getInput("image-name");
    const imageTag = core.getInput("image-tag");
    execSync(`docker build --platform windows/amd64 -t "${imageName}:${imageTag}" -f "${dockerFilePath}" "${buildDirPath}"`)

} catch(error) {
    core.setFailed(error.message);
}