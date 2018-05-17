/**
 * 用于点赞的操作
 * 只有上一次有结果之后，下次 action 才会执行
 */

export default class ToggleAction {
    constructor () {
        this.pending = false
    }

    reset () {
        this.pending = false
    }

    toggle (action) {
        if (this.pending) return
        this.pending = true
        action(this.pending).then(res => {
            this.pending = false
        }).catch(err => {
            this.pending = false
            console.log(err)
        })
    }
}
