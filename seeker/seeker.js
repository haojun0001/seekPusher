//数据抓取接口
var seeker = {
    //数据初始化
    init = function(seekerRealize){
        seekerRealize.init()
    },
    //监听数据接口
    listenMessage= function(seekerRealize){
        seekerRealize.listenMessage()
    },
    //抓取数据接口
    fetchData = function (seekerRealize) {
       return seekerRealize.fetchData()
    }
  }
  
  module.exports = seeker
  