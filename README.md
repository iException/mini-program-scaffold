# Mini Program Scaffold

较之于 `脚手架`， 我更愿意把它作为小程序开发的工具函数库。

这里默认提供了以下工具方法：

- 刷子  `./utils/brush.js`
- 配置  `./config.js`
- md5   `./utils/md5.js`
- 滚动加载   `./utils/ScrollLoading.js`
- 切换操作   `./utils/ToggleAction.js`
- 打点函数   `./utils/tracker.js`
- 其他的通用函数，比如微信API的Promise版本、文件上传    `./utils/util.js`

## 刷子 Brush

对微信 Canvas 相关的api封装，支持链式调用。

```javascript
import Brush from '../../utils/brush'
import { getSystemInfo } from '../../utils'

getSystemInfo().then(res => {
    const ratio = res.windowWidth / 750 // 750 是你手上设计稿中 window 的宽度
    const brush = new Brush('canvasId', ratio)

    brush.save()
        .drawImage(`imagePath`, 0, 0, 100, 32, 72, 138, 100, 32)
        .setFontSize(FontSize)
        .setTextBaseline('top')
        .setTextAlign('left')
        .setFillStyle(FontColor)
        .fillText('text', 106, 144, 54)
        .restore()

    brush.save(false).then(res => {
        return canvasToTempFilePath({
            canvasId: 'canvasId'
        })
    }).then(res => {
        console.log(res)
    }).catch(err => {})
})
```
如果已经正确设置比例 `ratio` ，那么绘制的时候就可以原封不动地向 API 传入设计图的参数。

比如要画一张图片，设计稿宽度是750px, 图片是 750px × 750px，canvas 要铺满整个屏幕宽度，widowWidth: 375px，那么 ratio = 375 / 750, API 调用为：

```javascript
    brush.drawImage(`imagePath`, 0, 0, 750, 750, 0, 0, 750, 750)
```

> 前提是canvas的宽度已经被设置为 `windowWidth`，否则计算 `ratio` 时分子应该是 `canvas` 的实际宽度。

> 如果要绘制多个圆形图片，建议启用一个新的canvas，并将图片保存使用（微信小程序 canvas 对于多个裁剪区域的处理有异常，头铁当我没有说过）。欢迎提供更好的建议😀

## 配置 Config

这个没啥好说的

## md5

也没啥好说的

## 滚动加载 ScrollLoading

滚动加载必须要搭配 `Page` 实例下的 `onReachBottom` 钩子使用。请看以下代码：

```javascript
    import ScrollLoading from '../../utils/ScrollLoading'
    import { http } from '../../utils/util'

    const scrollLoading = new ScrollLoading()

    Page({
        onLoad () {
            this.fetchData(true)
        },

        fetchData (reset = false) {
            if (reset) scrollLoading.reset()
            scrollLoading.load(page => {
                return new Promise((resolve, reject) => {
                    http({

                        // 别忘了传入 page 哦
                        uri: `/path/to/fetch/data?page=${page}`,
                        method: 'GET'
                    }).then(res => {

                        // 分页的数据必然是一个数组，这里假设是 data 字段
                        const list = res.data
                        this.setData({
                            list: reset ? list : this.list.concat(list)
                        })

                        // 这里一定要把 list 数组传进去
                        // 如果 list 是空数组，那么说明数据已经加载到最后了
                        // scrollLoading.load 不会再触发回调
                        resolve(list)
                    }).catch(err => {
                        reject(err)
                    })
                })
            })
        },

        onReachBottom () {
            this.fetchData(false)
        }
    })
```

## 切换操作 ToggleAction

什么时候会用到这个东西呢？一个栗子：点赞！

对于点赞这样的操作，我们必须等待前一步执行成功后，才能进行接下来的行为。总不能点赞请求还没响应就把取消赞也发出去吧？
那么这样的行为如何防止呢？见下面的代码：

```javascript
    import ToggleAction from '../../utils/toggleAction'

    const toggleAction = new ToggleAction()

    Page({
        onLoad () {}

        // 连续调用 praise 并不一定会打印出 '奈斯'，除非间隔时间大于 2000ms
        praise () {
            toggleAction.toggle(() => {
                return new Promise((resolve, reject) => {
                    // Do something
                    console.log('奈斯')
                    setTimeout(() => {
                        resolve()
                    }, 2000)
                })
            )
        }
    })
```

## 打点函数 tracker

这个，要写入业务逻辑，挺麻烦的，看公司内部如何规划的吧。这段先跳过。

## 通用函数 Utils

封装了大部分 wx API，可以使用 Promise。参数和 wx API 一致。

关于图片上传的部分要说明下：

```javascript
    import { uploadFiles } from '../../utils/util'

    uploadFiles(['temFilePath']).then(res => {
        resolve(res)
    }).catch(err => {
        reject(err)
    })
```

在 `uploadFiles` 中有如下代码，其中 uri 参数需要改为获取上传图片 token 的 API：

```javascript
    http({
        uri: '/image/config',
    }).then(res => {
    // ...
```