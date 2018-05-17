/**
 * 滚动加载
 */
export default class ScrollLoading {
    constructor () {
        this.page = 1           // 当前页码
        this.loading = false    // loading 状态
        this.disabled = false   // 是否停用
    }

    reset (page = 1) {
        this.page = page
        this.loading = false
        this.disabled = false
    }

    /**
     * handler 接收 page，并且返回 Promise 对象
     * resolve 时说明拉去新的一页数据成功
     * @param {*} handler
     */
    load (handler) {
        if (this.loading) return
        this.loading = true
        return new Promise((resolve, reject) => {
            if (this.disabled) {
                reject('disabled')
                return
            }
            handler(this.page).then(res => {
                this.page++
                this.loading = false
                // 判断 res 是否是空数组
                // 如果是空的，则说明数据到底了，此时停用 scrollLoad
                // 等待 reset
                if (Array.isArray(res) && res.length === 0) {
                    this.disabled = true
                }
                resolve(res)
            }).catch(err => {
                this.loading = false
                reject(err)
            })
        })
    }
}
