/**
 * @file init 初始化项目
 */
const path = require('path');
const fs = require('fs-extra');

const home = require('user-home');
const inquirer = require('inquirer');

const exists = fs.existsSync;
const rm = fs.removeSync;
// const debug = require('debug')('command:init');

const generate = require('../lib/generate');

const {
    chalk,
    isLocalPath,
    getTemplatePath,
    error,
    updateSpinner,
    logWithSpinner,
    stopSpinner,
    log,
    downloadRepo,
    clearConsole
} = require('@baidu/hulk-utils');
const ALIAS_MAP = process.env.alias || {
    component: 'antd-san-component-template',
    project: 'san-project-base'
};
const alias = name => {
    if (ALIAS_MAP[name]) {
        return ALIAS_MAP[name];
    }

    return name;
};
module.exports = async (argv, opts) => {
    const template = alias(argv.template);
    const appName = argv.appName;
    const inPlace = !appName || appName === '.';
    const name = inPlace ? path.relative('../', process.cwd()) : appName;
    const dest = path.resolve(appName || '.');

    if (exists(dest)) {
        if (opts.force) {
            await fs.remove(dest);
        } else {
            clearConsole();
            if (inPlace) {
                const {ok} = await inquirer.prompt([
                    {
                        name: 'ok',
                        type: 'confirm',
                        message: '在当前目录创建项目？'
                    }
                ]);
                if (!ok) {
                    return;
                }
            } else {
                const {action} = await inquirer.prompt([
                    {
                        name: 'action',
                        type: 'list',
                        message: `目录 ${chalk.cyan(dest)} 已经存在。请选择操作：`,
                        choices: [
                            {name: '覆盖', value: 'overwrite'},
                            {name: '合并', value: 'merge'},
                            {name: '取消', value: false}
                        ]
                    }
                ]);
                if (!action) {
                    return;
                } else if (action === 'overwrite') {
                    log(`删除 ${chalk.cyan(dest)}...`);
                    await fs.remove(dest);
                }
            }
        }
    }

    const isOffline = opts.offline;
    if (isOffline || isLocalPath(template)) {
        // 使用离线地址
        // 直接复制，不下载 icode 代码
        const templatePath = getTemplatePath(template);
        if (exists(templatePath)) {
            generate(name, templatePath, dest, opts);
        } else {
            error('模板文件不存在');
        }
    } else {
        // 临时存放地址，存放在~/.hulk-templates 下面
        let tmp = path.join(home, '.hulk-templates', template.replace(/[/:#]/g, '-'));

        if (opts.cache && exists(tmp)) {
            // 优先使用缓存
            generate(name, tmp, dest, opts);
        } else {
            clearConsole();
            logWithSpinner('🗃', '下载模板...');
            if (exists(tmp)) {
                rm(tmp);
            }

            downloadRepo(template, tmp, opts, err => {
                updateSpinner('🗃', '模板下载成功!');
                stopSpinner();
                console.log();
                if (!err) {
                    generate(name, tmp, dest, opts);
                } else {
                    error('拉取代码失败，请检查路径和代码权限是否正确');
                    if (!process.env.DEBUG) {
                        log(`使用「${chalk.bgYellow.black('DEBUG=*')}」 ，查看报错信息`);
                    }
                }
            });
        }
    }
};