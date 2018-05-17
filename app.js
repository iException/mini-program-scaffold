//app.js
import {
    http,
    confirm,
    wxLogin,
    wxGetSetting,
    wxOpenSetting,
    log
} from './utils/util'

App({
    onLaunch (options) {
        wxLogin().then(lres => {
            // TODO
            if (lres.code) {
                this.forceUserInfo().then(userInfo => {
                    this.login(lres.code, userInfo.nickName, userInfo.avatarUrl, userInfo.gender)
                    this.login(lres.code).then(res => {}).catch(err => {})
                })
            } else {
                console.log('登录失败！' + lres.errMsg)
                throw new Error('wx login get lres faile!')
            }
        }).catch(err => {})

        wx.getNetworkType({
            success: ({networkType}) => {
                this.globalData.networkType = networkType
                wx.onNetworkStatusChange(({networkType}) => {
                    this.globalData.networkType = networkType
                })
            }
        })

        this.setSource({
            source_app_id: (options.referrerInfo && options.referrerInfo.appId) || ''
        })
    },

    onShow (options) {
        this.setScene(options.scene)
    },

    login (code, nick = '', avatar = '', gender = '') {
        return new Promise((resolve, reject) => {
            http({
                uri: '/auth/login',
                data: {
                    code: code,
                    nick: nick,
                    avatar: avatar,
                    gender: gender
                }
            }).then(res => {
                this.setUserSession(res.data)
                // 设置 api token 等
                resolve(res)
            }).catch(err => {
                reject(err)
            })
        })
    },

    setUserSession () {
        // TODO
    },

    forceUserInfo () {
        return new Promise((resolve, reject) => {
            wxGetSetting().then(res => {
                if (res.authSetting['scope.userInfo'] === false) {
                    // 授权关闭的用户，提示用户打开授权
                    confirm({
                        title: '温馨提示',
                        content: '请求允许获取用户信息（昵称、头像）'
                    }).then(res => {
                        return wxOpenSetting()
                    }).then(res => {
                        this.getUserInfo().then(resolve).catch(reject)
                    }).catch(err => {
                        this.getUserInfo().then(resolve).catch(reject)
                    })
                } else {
                    this.getUserInfo().then(resolve).catch(reject)
                }
            }).catch(err => {
                reject(err)
            })
        })
    },

    getUserToken () {
        let token = ''
        try {
            token = this.globalData.apiUserToken || wx.getStorageSync('apiUserToken')
        } catch (err) {
            token = ''
        } finally {
            return token
        }
    },

    getUserInfo () {
        return new Promise((resolve, reject) => {
            if (this.globalData.userInfo) {
                // 已经得到用户信息
                resolve(this.globalData.userInfo)
            } else {
                wxGetSetting().then(res => {
                    if (res.authSetting['scope.userInfo'] === false) {
                        return reject({ errMsg: '用户未授权 UserInfo 权限' })
                    } else {
                        wx.getUserInfo({
                            withCredentials: false,
                            success: res => {
                                // 可以将 res 发送给后台解码出 unionId
                                this.globalData.userInfo = res.userInfo
                                // 由于 getUserInfo 是网络请求，可能会在 Page.onLoad 之后才返回
                                // 所以此处加入 callback 以防止这种情况
                                resolve(this.globalData.userInfo)
                            },
                            fail: res => {
                                reject(res)
                            }
                        })
                    }
                })
            }
        })
    },

    getSystemInfo() {
        let systemInfo = this.globalData.systemInfo
        if (!systemInfo) {
            let { model, version, system } = wx.getSystemInfoSync()
            systemInfo = {
                os: system.split(' ')[0],
                os_version: system.split(' ')[1],
                model: model,
                env_version: version,
            }
            this.globalData.systemInfo = systemInfo
        }
        return systemInfo
    },

    getNetworkType() {
        return this.globalData.networkType
    },

    getLastPage() {
        return {
            last_page_id: this.globalData.lastPage.pageId,
            last_page_type: this.globalData.lastPage.pageType,
        }
    },

    /**
     * @param {*} pageId 为每个页面定义的别名
     * @param {*} pageType 页面类型
     */
    setLastPage(pageId, pageType) {
        this.globalData.lastPage.pageId = pageId
        this.globalData.lastPage.pageType = pageType
    },

    getScene () {
        return this.globalData.source.source
    },

    setScene (scene) {
        this.setSource({
            source: scene
        })
    },

    isIpx () {
        return this.getSystemInfo().model.indexOf('iPhone X') > -1
    },

    setSource (source = {}) {
        for (let key in source) {
            if (source.hasOwnProperty(key)
                && this.globalData.source.hasOwnProperty(key)) {
                this.globalData.source[key] = source[key]
            }
        }
    },

    getSource () {
        this.globalData.source.source_path = getCurrentPages().slice()[0].route
        return this.globalData.source || {}
    },

    /**
     * 应用的全局数据存放在这里
     */
    globalData: {
        // 打点相关
        lastPage: {
            pageId: '',
            pageType: '',
        },
        systemInfo: null,
        networkType: null,
        session: null,
        trackId: null,
        source: {
            source: '',         // scene
            source_app_id: '',
            source_path: '',
            source_params: '',
            source_src_key: ''
        },

        // 产品功能
        apiUserToken: null,
        userInfo: null,
        petfiles: null
    },

    /**
     * 一个全局的状态容器
     * 某些页面可能需要设置一些值，以便下次访问该页面时需要之前的状态
     */
    globalStatus: {}
})
