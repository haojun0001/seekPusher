const pusher = require('../pusher/wxplatform')

//数据抓取接口
var ngaseeker = {
    url = 'http://ngabbs.com/app_api.php?__lib=post&__act=list',
    headers = {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-User-Agent': 'NGA_skull/6.0.7(iPhone11,6;iOS 12.2)',
        'User-Agent': 'NGA/6.0.7 (iPhone; iOS 12.2; Scale/3.00)',
        'Accept-Language': 'zh-Hans-CN;q=1'
    },
    author = [
        {
          name: 'gxgujnk1993',
          uid: 27178316
        },
        {
          name: '泰莫拉尔',
          uid: 38666451
        },
        {
          name: '阿特洛玻絲与末三',
          uid: 41505116
        },
        {
          name: 'lishu945',
          uid: 34904557
        },
        {
          name: '不骂人不发黄图',
          uid: 60259365
        },
        {
          name: '天之藍～',
          uid: 42255599
        },
        {
          name: '卯吴骆辰黎毕',
          uid: 60086897
        },
        {
          name: '上海吴彦祖93',
          uid: 60368647
        },
        {
          name: 'colaman2006',
          uid: 533348
        },
        {
          name: '-阿狼-',
          uid: 150058
        },
        {
          name: '那塔拉夏',
          uid: 34008960
        },
        {
          name: 'mafeigba',
          uid: 10927997
        }
      ],
    constructor(currentPage, currentFloor) {
        this.currentPage = currentPage
        this.currentFloor = currentFloor
    },
    init = function () {
        return new Promise(async (resolve, reject) => {
            let data = await fetchData(9999999).catch(err => {
                console.log('fetchData 出错')
            })
            this.currentPage = data.totalPage
            this.currentFloor = data.vrows - 1
            resolve()
        })
    },
    listenMessage= function () {
        console.log(`页码${this.currentPage}刷新`)
        let data = await fetchData(this.currentPage).catch(err => {
            console.log('fetchData 出错')
        })
        let result = data.result || null
        if (!result) {
          return
        }
        
    },
    fetchData = function (page) {
        return new Promise((reslove, reject) => {
            Axios({
                method: 'post',
                timeout: 5000,
                url: url,
                headers: headers,
                data: `tid=16053925&page=${page}`
            }).then(res => {
                reslove(res.data)
            }).catch(res => {
                reject(res)
            })
        })
    }
}

module.exports = ngaseeker
