// 服务器配置信息
const server = {
  host: 'xxxxx', // 服务器ip
  port: 'xxxxx', // 端口一般默认22
  username: 'xxx', // 用户名
  password: 'xxx', // 密码
  pathName: 'xxxxx', // 上传到服务器的位置
  localPath: 'xxxx' // 本地打包文件的位置
}
console.log(process.env)
// 引入scp2
const client = require('scp2')
const ora = require('ora')
const spinner = {
  connecting:ora('正在连接服务器...'),
  connected:ora('连接服务器成功...'),
  closed:ora('连接已关闭...'),
  start:ora('正在上传...'),
  upload:ora('正在发布到服务器...'),
  success:ora('发布成功...'),
  error:ora('发布失败...')
}
const Client = require('ssh2').Client // 创建shell脚本
const conn = new Client()
spinner.connecting()
conn
  .on('ready', () => {
    spinner.connected()
    if (!server.pathName) {
      spinner.connected()
      conn.end()
      return false
    }
    // 这里我拼接了放置服务器资源目录的位置 ，首选通过rm -rf删除了这个目录下的文件
    conn.exec(
      `rm -rf ${server.pathName}/*`,
      (err, stream) => {
        stream.on('close', (code, signal) => {
          spinner.start()
          client.scp(
            server.localPath,
            {
              host: server.host,
              port: server.port,
              username: server.username,
              password: server.password,
              path: server.pathName
            },
            (err) => {
              spinner.stop()
              if (!err) {
                spinner.success()
              } else {
                spinner.error()
              }
              conn.end() // 结束命令
            }
          )
        })
      }
    )
  })
  .connect({
    host: server.host,
    port: server.port,
    username: server.username,
    password: server.password
    // privateKey: '' //使用 私钥密钥登录 目前测试服务器不需要用到
  })
