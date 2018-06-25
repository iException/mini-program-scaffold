/**
 * 与 eventHub 不同之处在于，notification 会将 post 的消息暂存，直到被消费
 * 整体方案类似于邮件：A 给 B 寄了邮件，信件被放置在邮局等待 B 来读取，当 B 读
 * 取后则将消息从邮局移除，此刻 notification 就扮演了邮局的角色
 */

export default  {
    message: {},

    /**
     * 发送通知消息
     * @param page
     * @param code
     * @param message
     */
    post ({page, code, message}) {
        if (!message) {
            console.log('缺少 message')
        }
        if (!this.isRegistered(page, code)) {
            this.register(page, code)
        }
        this.message[page][code].message.push(message)
        this.consumer(page, code)
    },

    subscribe ({page, code, handler}) {
        // 订阅只是更新 consumer
        // 如果不存在 page|code 记录，则会添加
        if (!this.isRegistered(page, code)) {
            this.register(page, code)
        }
        this.message[page][code].consumer = handler
        this.consumer(page, code)
    },


    unsubscribe ({page, code}) {
        // 取消订阅只会删除对应的 consumer
        if (this.isRegistered(page, code)) {
            delete this.message[page][code].consumer
        }
    },

    consumer (page, code) {
        const {message, consumer} = this.message[page][code]
        if (message.length && typeof consumer === 'function') {
            console.log(message)
            consumer(message.splice(0, message.length))
        }
    },

    register (page, code) {
        this.message[page] = Object.assign(this.message[page] || {}, {
            [code]: {
                message: [],
                // consumer 需要在订阅时赋值
            }
        })
    },

    isRegistered (page, code) {
        return !!(this.message[page] && this.message[page][code])
    }
}
