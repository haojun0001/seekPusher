const Koa = require('koa')
const Axios = require('axios')
const Author = require('./author')
const WXPlatform = require('./wxplatform')

const App = new Koa()
const PORT = 3000
const INTERVAL = 10000 //10秒刷新一次数据
const WXINTERVAL = 600000 //10分钟刷新一次Token并取用户数据

App.listen(PORT)

let currentPage = 1 // 当前页码
let currentFloor = 1 // 当前楼层

function wXInit() {
  return new Promise(async (resolve, reject) => {
    wXTokenInit()
    resolve()
  })
}

function wXTokenInit() {
  Axios({
    method: 'get',
    timeout: 5000,
    url: 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx20b560ad7c6196ef&secret=31b86c06ccc855c990e005339ef3cb56'
  }).then(res => {
    WXPlatform.Token = res.data.access_token
    console.log('token获取成功:')
    console.log(WXPlatform.Token)
    wXUserInit()
  }).catch(err => {
    WXPlatform.Token = 'ERROR'
  })
}

function wXUserInit() {
  Axios({
    method: 'get',
    timeout: 5000,
    url: 'https://api.weixin.qq.com/cgi-bin/user/get?access_token=' + WXPlatform.Token
  }).then(res => {
    WXPlatform.openidList = res.data.data.openid
    console.log('用户获取成功:')
    console.log(WXPlatform.openidList)
  }).catch(err => {
    console.log('用户获取失败:' + err)
  })
}

function fetchData(page) {
  return new Promise((reslove, reject) => {
    Axios({
      method: 'post',
      timeout: 5000,
      url: 'http://ngabbs.com/app_api.php?__lib=post&__act=list',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-User-Agent': 'NGA_skull/6.0.7(iPhone11,6;iOS 12.2)',
        'User-Agent': 'NGA/6.0.7 (iPhone; iOS 12.2; Scale/3.00)',
        'Accept-Language': 'zh-Hans-CN;q=1'
      },
      data: `tid=16053925&page=${page}`
    }).then(res => {
      reslove(res.data)
    }).catch(res => {
      reject(res)
    })
  })
}

function getCurrentData(page) {
  return new Promise(async (resolve, reject) => {
    let data = await fetchData(page).catch(err => {
      console.log('fetchData 出错')
    })
    resolve(data)
  })
}

async function listenNewMessage() {
  console.log(`页码${currentPage}刷新`)
  let data = await getCurrentData(currentPage).catch(err => {
    console.log('getCurrentData 出错')
  })
  let result = data.result || null
  if (!result) {
    return
  }
  let length = result.length
  let lou = result[length - 1].lou || null
  if (!lou) {
    return
  }
  if (data.currentPage === data.totalPage) {
    if (currentFloor === lou) {
      //console.log(`当前页码${data.currentPage}，当前楼层${currentFloor}，没有新内容`)
      return
    }
    handleMessage(result, data.currentPage, lou)
  } else {
    if (currentFloor === lou) {
      currentPage += 1
    } else {
      handleMessage(result, data.currentPage, lou)
      currentPage += 1
    }
  }
}

function handleMessage(result, currentPage, lou) {
  for (let i = currentFloor + 1; i <= lou; i++) {
    let message = result.find(e => e.lou === i)
    currentFloor = i
    sendMessage(message, currentPage)
  }
}

function sendMessage(message, currentPage) {
  let author = Author.find(author => author.uid === message.author.uid)
  if (!author) {
    //console.log(`当前页码${currentPage}，当前楼层${message.lou}，有新内容，但不是收听的大佬发言`)
    return
  }
  let content = message.content.replace(/\[quote\].+\[\/quote\]|<b>.+<\/b>|\[img\].+\[\/img\]|<br\/>/g, '')
  content = content.length <= 140 ? content : `${content.substring(0, 139)}...（帖子过长，请去股楼查看）`
  let body = `${message.lou}楼\n${content}`
  let url = `https://bbs.nga.cn/read.php?tid=16053925&page=${currentPage}#l${message.lou}`

  WXPlatform.openidList.forEach(receiver => {
    handleAxios(receiver, author, body, url)
  })

  console.log('*************************************')
  console.log(`当前页码 ${currentPage}`)
  console.log(`当前楼层 ${message.lou}`)
  console.log(`作者 ${author.name}`)
  console.log(`内容 ${content}`)
  console.log(`跳转链接 ${url}`)
  console.log('*************************************')
}

function handleAxios(receiver, author, body, url) {
  Axios({
    method: 'post',
    timeout: 5000,
    url: 'https://api.weixin.qq.com/cgi-bin/message/template/send?access_token=' + WXPlatform.Token,
    data: {
      'touser': receiver,
      'template_id': WXPlatform.template_id,
      'url': url,
      'topcolor': '#FF0000',
      'data': {
        'author': {
          'value': author.name,
          'color': '#173177'
        },
        'content': {
          'value': body,
          'color': '#173177'
        }
      }
    }
  }).then(res => {
    console.log('发送成功：' + receiver)
  }).catch(res => {
    console.log('发送失败：' + receiver)
  })
}

function init() {
  return new Promise(async (resolve, reject) => {
    let data = await getCurrentData(9999999).catch(err => {
      console.log('getCurrentData 出错')
    })
    currentPage = data.totalPage
    currentFloor = data.vrows - 1
    resolve()
  })
}

async function start() {

  await init().then(res => {
    console.log('楼层init 成功')
  }).catch(err => {
    console.log('楼层init 出错')
  })

  await wXInit().then(res => {
    console.log('wXInit 成功')
  }).catch(err => {
    console.log('wXInit 出错')
  })

  setInterval(async () => {
    await wXInit().catch(err => {
      console.log('wXInit 出错')
    })
  }, WXINTERVAL)

  await listenNewMessage().catch(err => {
    console.log('start listenNewMessage 出错')
  })

  setInterval(async () => {
    await listenNewMessage().catch(err => {
      console.log('listenNewMessage 出错')
    })
  }, INTERVAL)
}

start()
