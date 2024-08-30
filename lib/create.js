const path = require("path");
const fs = require("fs-extra");
const Inquirer = require("inquirer");
const downloadGitRepo = require("download-git-repo");
const chalk = require("chalk");
const util = require("util");
const { loading } = require("./util");

module.exports = async function (projectName, options) {
  // 获取当前工作目录
  const cwd = process.cwd();
  const targetDirectory = path.join(cwd, projectName);

  // 处理文件夹
  await handleFolder(projectName, options, targetDirectory);

  // 1.选择模版
  const { template } = await new Inquirer.prompt([
    {
      name: "template",
      type: "list",
      message: "Please choose a template to create project",
      choices: [
        { name: 'react', value: 'zyf118725/reactTs' },
        { name: 'nest', value: 'zyf118725/nest-template' },
        { name: 'micro', value: 'zyf118725/micro-cli' },
      ],
    },
  ]);

  // 2.下载
  await download(template, targetDirectory);

  // 3.模板使用提示
  console.log(`\r\nSuccessfully created project ${chalk.cyan(projectName)}`);
  console.log(`\r\n  cd ${chalk.cyan(projectName)}`);
  console.log("  npm install");
  // console.log("  npm run serve\r\n");
};

// 处理文件夹创建重名问题
async function handleFolder(projectName, options, targetDirectory) {
  if (fs.existsSync(targetDirectory)) {
    if (options.force) {
      // 删除重名目录
      await fs.remove(targetDirectory);
    } else {
      let { isOverwrite } = await new Inquirer.prompt([
        {
          name: "isOverwrite", // 与返回值对应
          type: "list", // list 类型
          message: "Target directory exists, Please choose an action",
          choices: [
            { name: "Overwrite", value: true },
            { name: "Cancel", value: false },
          ],
        },
      ]);
      if (!isOverwrite) {
        console.log("Cancel");
        return;
      } else {
        await loading(
          `Removing ${projectName}, please wait a minute`,
          fs.remove,
          targetDirectory
        );
      }
    }
  }
}

// 下载git仓库
async function download(templateUrl, targetDirectory) {
  const downloadGitRepoPromise = util.promisify(downloadGitRepo);
  await loading(
    "downloading template, please wait",
    downloadGitRepoPromise,
    templateUrl,
    targetDirectory // 项目创建位置
  );
}