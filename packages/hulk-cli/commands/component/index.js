/**
 * @file hulk component
 * @author wangyongqing <wangyongqing01@baidu.com>
 */
// alias serve + change (entry + app)
const {ENV, DEVELOPMENT_MODE} = require('../../constants');
const run = require('./run');

module.exports = program => {
    const envReg = new RegExp('^(' + ENV.join('|') + ')$', 'i');

    program
        .command('component <entry>')
        .alias('md')
        .description('San 组件 Demo 预览服务器')
        .option('-p, --port <port>', 'dev server port', /\d+/)
        .option('-h, --host <host>', 'dev server host')
        .option('-m, --mode <mode>', '指定 webpack mode', envReg, DEVELOPMENT_MODE)
        .option('-c, --config <config>', '设置  webpack config 文件')
        .option('-t, --main-template <mainTemplate>', '设置 demo 的 main 模板')
        .option('--single', '单页模式显示，可以单独页面查看效果')
        .option('--qrcode', '显示 url 二维码')
        .option('--use-https', 'use https')
        .action(run);
};
