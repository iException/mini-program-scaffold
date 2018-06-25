import { HTTP } from './config'
import qs from "./qs";

const md5 = require('./md5')

/**
 * Promise 方式获取数据
 */

function hash(userToken, verify) {
    let secret = 'xxxxxxxxxxxxxxxxxxxxx';
    return md5(userToken + verify + secret);
}

export const http = ({ uri, data, method }, useToken = true) => {
    let app = getApp()
    let apiUserToken = app.getUserToken()

    return new Promise((resolve, reject) => {
        wx.request({
            url: HTTP.host + uri,
            data: data,
            method: method,
            success (res) {
                if (res.statusCode >= 200 && res.statusCode < 300) {
                    resolve && resolve(res.data)
                } else {
                    reject && reject(res.data)
                }
            },
            fail (err) {
                reject && reject(err)
            },
            header: {
                // TODO
                'USER-TOKEN': apiUserToken
            }
        })
    })
}

/**
 * 上传单个文件
 * @param {*} file
 */
export const upload = (filePath, config) => {
    return new Promise((resolve, reject) => {
        wx.uploadFile({
            url: config.uploadUrl || '',
            filePath: filePath || '',
            name: config.fileKey || '',
            formData: config.uploadParams,
            success (res) {
                if (res && res.statusCode >= 200 && res.statusCode < 300) {
                    resolve(JSON.parse(res.data))
                } else {
                    reject(res)
                }
            },
            fail (err) {
                reject(err)
            }
        })
    })
}
/**
 * Promise 上传文件
 * @param {*} files
 */
export const uploadFiles = (files = []) => {
    return new Promise((resolve, reject) => {
        http({
            uri: '/image/config',
        }).then(res => {
            const config = res
            Promise.all(files.map(file => upload(file, config))).then(res => resolve(res)).catch(err => reject(err))
        }).catch(err => {
            reject(err)
        })
    })
}

/**
 * wx.showToast 的简化写法
 */
export const log = {
    error (title = '') {
        wx.showToast({
            title,
            icon: 'none'
        })
    },
    info (title = '') {
        wx.showToast({
            title,
            icon: 'none'
        })
    },
    success (title = '') {
        wx.showToast({
            title
        })
    },
    loading (title = '') {
        wx.showLoading({
            title
        })
        wx.showNavigationBarLoading()
    },
    hideLoading () {
        wx.hideLoading()
        wx.hideNavigationBarLoading()
    }
}

export const gotoPage = (route, params = '', method = 'navigateTo') => {
    if (typeof params === 'object') {
        params = qs.stringify(params)
    }
    const list = ['index', 'create-moment', 'user-info']
    if (list.find(r => r === route)) {
        method = 'switchTab'
    }
    let url = '/pages/' + route + '/' + route
    if (method !== 'switchTab') {
        url += ('?' + params)
    }
    setTimeout(() => {
        wx[method]({
            url: url
        })
    }, 0)
}

export const alertAndGoBack = (msg) => {
    confirm({
        showCancel: false,
        content: msg || ''
    }).then(res => {
        goBack()
    }).catch(err => {
        goBack()
    })
}

export const alertAndGoto = (msg, page, method) => {
    confirm({
        showCancel: false,
        content: msg || ''
    }).then(res => {
        gotoPage(page, '', method)
    }).catch(err => {
        gotoPage(page, '', method)
    })
}

export const showActionSheet = (list = []) => {
    return new Promise((resolve, reject) => {
        wx.showActionSheet({
            itemList: list,
            success: resolve,
            fail: reject
        })
    })
}

export const confirm = (config) => {
    return new Promise((resolve, reject) => {
        wx.showModal({
            title: config.title || '提示',
            showCancel: config.showCancel === undefined ? true : config.showCancel,
            content: config.content || '',
            cancelText: config.cancelText || '取消',
            confirmText: config.confirmText || '确认',
            confirmColor: config.confirmColor || '#FF4466',
            success (res) {
                if (res.cancel) {
                    reject(res)
                } else {
                    resolve(res)
                }
            },
            fail (err) {
                reject(err)
            },
        })
    })
}

export const wxLogin = () => {
    return new Promise((resolve, reject) => {
        wx.login({
            success: resolve,
            fail: reject
        })
    })
}


export const wxGetSetting = () => {
    return new Promise((resolve, reject) => {
        wx.getSetting({
            success: resolve,
            fail: reject
        })
    })
}

export const wxOpenSetting = () => {
    return new Promise((resolve, reject) => {
        wx.openSetting({
            success: resolve,
            fail: reject
        })
    })
}

export const goBack = (delay = 0) => {
    setTimeout(() => {
        wx.navigateBack({
            delta: 1
        })
    }, delay)
}

export const getStorageSync = (key = '') => {
    let result = void (0)
    try {
        result = wx.getStorageSync(key)
    } finally {
        return result
    }
}

export const setStorageSync = (key, value) => {
    if (!(key && value)) return
    try {
        wx.setStorageSync(key, value)
    } catch (err) {
        // TODO:
    }
}

export const getSystemInfo = () => {
    return new Promise((resolve, reject) => {
        wx.getSystemInfo({
            success: res => {
                resolve(res)
            },
            fail: err => {
                reject(err)
            }
        })
    })
}

export const getImageInfo = (src) => {
    return new Promise((resolve, reject) => {
        wx.getImageInfo({
            src: formatUrl(src),
            success: resolve,
            fail: (err) => {
                console.log(src, err)
                reject(err)
            }
        })
    })
}

export const canvasToTempFilePath = (config) => {
    return new Promise((resolve, reject) => {
        wx.canvasToTempFilePath({
            x: config.x,
            y: config.y,
            width: config.width,
            height: config.height,
            destWidth: config.destWidth,
            destHeight: config.destHeight,
            canvasId: config.canvasId,
            success: res => {
                resolve(res)
            },
            fail: err => {
                reject(err)
            }
        })
    })
}

export const showTabBarRedDot = (index) => {
    return new Promise((resolve, reject) => {
        if (isNaN(index)) reject(new Error('index should be  number'))
        wx.showTabBarRedDot({
            index: index,
            success: resolve,
            fail: reject
        })
    })
}

export const hideTabBarRedDot = (index) => {
    return new Promise((resolve, reject) => {
        if (isNaN(index)) reject(new Error('index should be  number'))
        wx.hideTabBarRedDot({
            index: index,
            success: resolve,
            fail: reject
        })
    })
}

export const extractSourceFromOptions = (options = {}) => {
    const scene = options.scene
    const source_params = decodeURIComponent(scene || '')
    const source_params_obj = qs.parse(source_params)

    if (source_params) {
        source_params_obj.source_params = source_params
    }
    if (source_params_obj.src) {
        source_params_obj.source_src_key = source_params_obj.src
    }

    return {
        ...source_params_obj
    }
}


export const compressSourceScenne = (qrCodeScene = {}) => {
    return objectEntries(qrCodeScene).reduce((prev, next) => `${prev ? prev + ';' : prev}${next.join(':')}`, '')
}

/**
 * iOS 10.3 及以下不支持 Object.entries ，所以这里加个 polyfill
 * @param obj
 * @returns {Array}
 */
export const objectEntries = (obj) => {
    const entires = []

    for (let key in obj) {
        if (obj.hasOwnProperty(key) && obj.propertyIsEnumerable(key)) {
            entires.push([key, obj[key]])
        }
    }

    return entires
}

export const showTabBar = (obj) => {
    return new Promise((success, fail) => {
        wx.showTabBar({
            ...obj,
            success,
            fail
        })
    })
}

export const hideTabBar = (obj) => {
    return new Promise((success, fail) => {
        wx.hideTabBar({
            ...obj,
            success,
            fail
        })
    })
}

export const setClipboardData = (data) => {
    return new Promise((success, fail) => {
        wx.setClipboardData({
            data,
            success,
            fail
        })
    })
}

export const getClipboardData = () => {
    return new Promise((success, fail) => {
        wx.getClipboardData({
            success,
            fail
        })
    })
}

export const getCurrentPage = () => {
    return getCurrentPages().slice().pop()
}

export const chooseAddress = () => {
    return new Promise((success, fail) => {
        wx.chooseAddress({
            success,
            fail
        })
    })
}

export const showShareMenu = () => {
    return new Promise((success, fail) => {
        wx.showShareMenu({
            success,
            fail
        })
    })
}

export const hideShareMenu = () => {
    return new Promise((success, fail) => {
        wx.hideShareMenu({
            success,
            fail
        })
    })
}

export const wxGetFileInfo = (config) => {
    return new Promise((success, fail) => {
        wx.getFileInfo({
            ...config,
            success,
            fail
        })
    })
}

export const wxChooseVideo = (config) => {
    return new Promise((success, fail) => {
        wx.chooseVideo({
            ...config,
            success,
            fail
        })
    })
}

export const wxChooseImage = (config) => {
    return new Promise((success, fail) => {
        wx.chooseImage({
            ...config,
            success,
            fail
        })
    })
}

/**
 * Verify that file size is less than specified value
 * @param {*} config
 */
export const validateFileSize = (config) => {
    return new Promise((resolve, reject) => {
        wxGetFileInfo({
            filePath: config.path
        }).then(res => {
            if (res.size < config.size) {
                resolve(config.path)
            } else {
                reject(new Error('file is too large'))
            }
        }).catch(err => {
            reject(err)
        })
    })
}
