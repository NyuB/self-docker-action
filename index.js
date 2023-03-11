const path = require('node:path');
const { execSync } = require("child_process");

const core = require('@actions/core');

function getOptionalInput(inputKey, defaultValue) {
    const inputValue = core.getInput(inputKey);
    return (inputValue.length == 0) ? defaultValue : inputValue;
}


const containerStructureTest = {
    linux: {
        x64: {
            url: "https://storage.googleapis.com/container-structure-test/v1.14.0/container-structure-test-linux-amd64",
            binaryName: "container-structure-test-linux-amd64",
        },
        arm64: {
            url: "https://storage.googleapis.com/container-structure-test/v1.14.0/container-structure-test-linux-arm64",
            binaryName: "container-structure-test-linux-arm64"
        }
    },

    win32: {
        x64: {
            url: "https://storage.googleapis.com/container-structure-test/v1.14.0/container-structure-test-windows-amd64.exe",
            binaryName: "container-structure-test-windows-amd64.exe",
        },
    },
}

function chooseContainerStructureTestDistribution() {
    const runnerOs = process.platform;
    const runnerArchitecture = process.arch;
    const distribution = containerStructureTest[runnerOs]?.[runnerArchitecture]
    if (distribution === undefined) {
        core.setFailed(`Structure test not supported for ${runnerOs} ${runnerArchitecture}`);
    } else {
        return distribution;
    }
}

function testWithContainerStructureTest(configFile, imageName, imageTag) {
    const distribution = chooseContainerStructureTestDistribution();
    
    if(process.platform !== "win32"){
        execSync(`wget ${distribution.url}`);
        execSync(`chmod +x ./${distribution.binaryName}`);
        execSync(`./${distribution.binaryName} test --image ${imageName}:${imageTag} --config ${configFile}`);
    } else {
        execSync(`curl.exe --output ${distribution.binaryName} --url ${distribution.url}`)
        execSync(`${distribution.binaryName} test --image ${imageName}:${imageTag} --config ${configFile}`);
    }
}

async function main() {
    try {
        const buildDirPath = core.getInput("build-dir");
        const dockerFilePath = getOptionalInput("dockerfile-path", path.join(buildDirPath, "Dockerfile"));
        const imageName = core.getInput("image-name");
        const imageTag = core.getInput("image-tag");
        
        execSync(`docker build -t "${imageName}:${imageTag}" -f "${dockerFilePath}" "${buildDirPath}"`);

        const structureTestConfigFile = core.getInput("structure-test-file");
        if(structureTestConfigFile.length > 0) {
            testWithContainerStructureTest(structureTestConfigFile, imageName, imageTag);
        }

    } catch(error) {
        core.setFailed(error.message);
    }
}

main();
