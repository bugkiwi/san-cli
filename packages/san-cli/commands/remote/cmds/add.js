/**
 * @file add
 * @author wangyongqing <wangyongqing01@baidu.com>
 */

module.exports = {
    command: 'add <name> <url>',
    desc: '添加脚手架地址 alias',
    builder: {},
    async handler(argv) {
        const fse = require('fs-extra');
        const inquirer = require('inquirer');
        const readRc = require('../../../lib/readRc');
        const {getGlobalSanRcFilePath} = require('san-cli-utils/path');
        const {success} = require('san-cli-utils/ttyLogger');
        const {name, url} = argv;

        // 检测是否存在
        // 全局
        let sanrc = readRc('rc') || {};
        const templateAlias = sanrc.templateAlias || {};
        if (templateAlias[name] && templateAlias[name] !== url) {
            // ask 替换？

            const answers = await inquirer.prompt([
                {
                    name: 'action',
                    type: 'list',
                    message: `\`${name}\` 已经存在，当前值为\`${templateAlias[name]}\`, 请选择操作：`,
                    choices: [
                        {name: '覆盖', value: 'overwrite'},
                        {name: '取消', value: false}
                    ]
                }
            ]);
            if (answers.action === false) {
                process.exit(1);
            }
        }
        templateAlias[name] = url;
        sanrc.templateAlias = templateAlias;
        let filepath = getGlobalSanRcFilePath();
        fse.writeJsonSync(filepath, sanrc);

        success(`Add \`${name}\` success!`);
    }
};